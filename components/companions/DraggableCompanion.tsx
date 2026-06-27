"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { ActiveCompanion, AgentId, CompanionUpdate } from "@/lib/companions/types";
import { ANCHORS } from "@/lib/companions/anchors";
import {
  computeWizardPhysics,
  PHYSICS_IDLE,
  physicsToStyle,
  type WizardPhysics,
} from "@/lib/companions/physics";
import { getAnchorPixelPosition, WIZARD_SIZE, MARGIN, NAV_SAFE_TOP } from "@/lib/companions/walking";
import { useCompanion, useCompanionPose } from "./CompanionProvider";
import { SparkleBurst } from "../WizardCompanion";
import SpeechBubble from "./SpeechBubble";
import { AGENT_AVATARS } from "./agents";

const DRAG_THRESHOLD = 5;

const CLICK_MESSAGES = [
  "Still here.",
  "Need a nudge?",
  "That rune looked suspicious.",
  "Try the experiment first.",
  "Explore the tower when you're ready.",
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduce(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduce;
}

export default function DraggableCompanion({
  companion,
  onDismiss,
}: {
  companion: ActiveCompanion;
  onDismiss: (agent: AgentId) => void;
  // Kept for API compatibility; idle walking is disabled so these are unused.
  onUpdate?: (agent: AgentId, update: CompanionUpdate) => void;
  isInteractionPaused?: () => boolean;
}) {
  const anchor = ANCHORS[companion.anchorId];
  const Avatar = AGENT_AVATARS[companion.agent];
  const { registerInteraction } = useCompanion();
  const { report, clear } = useCompanionPose();

  const [pos, setPos] = useState<{ x: number; y: number }>(() =>
    typeof window !== "undefined" ? getAnchorPixelPosition(companion.anchorId) : { x: 0, y: 0 }
  );
  const [placement, setPlacement] = useState<{ horizontal: "left" | "right"; vertical: "top" | "bottom" } | null>(
    null
  );
  const [picked, setPicked] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [landed, setLanded] = useState(false);
  const [settling, setSettling] = useState(false);
  const [popping, setPopping] = useState(false);
  const [puff, setPuff] = useState(false);
  const [physics, setPhysics] = useState<WizardPhysics>(PHYSICS_IDLE);
  const [settleStart, setSettleStart] = useState<WizardPhysics>(PHYSICS_IDLE);
  const [clickMsg, setClickMsg] = useState<string | null>(null);
  const [hasUserDragged, setHasUserDragged] = useState(false);

  const reduce = useReducedMotion();
  const drag = useRef({
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    prevVelocityX: 0,
    moved: false,
  });
  const physicsRef = useRef(PHYSICS_IDLE);
  const rafRef = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((t) => clearTimeout(t));
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Publish the wizard's live pose so the cat familiar can follow it.
  useEffect(() => {
    if (companion.agent !== "wizard") return;
    report({
      agent: companion.agent,
      runId: companion.runId,
      x: pos.x,
      y: pos.y,
      size: WIZARD_SIZE,
      dragging,
      phase: companion.phase,
      hasUserDragged,
    });
  }, [report, companion.agent, companion.runId, companion.phase, pos.x, pos.y, dragging, hasUserDragged]);

  useEffect(() => {
    if (companion.agent !== "wizard") return;
    const runId = companion.runId;
    return () => clear(runId);
  }, [clear, companion.agent, companion.runId]);

  if (!Avatar) return null;

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function stopSwingLoop() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function startSwingLoop() {
    if (reduce) return;
    stopSwingLoop();
    const tick = () => {
      const d = drag.current;
      const next = computeWizardPhysics(d.velocityX, d.prevVelocityX, false);
      d.prevVelocityX = d.velocityX;
      physicsRef.current = next;
      setPhysics(next);
      d.velocityX *= 0.78;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLSpanElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const now = performance.now();
    drag.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastTime: now,
      velocityX: 0,
      prevVelocityX: 0,
      moved: false,
    };
    setPicked(true);
    setLanded(false);
    setSettling(false);
    setClickMsg(null);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLSpanElement>) {
    if (!picked) return;
    const d = drag.current;
    const now = performance.now();
    const dt = Math.max(now - d.lastTime, 8);
    const dx = e.clientX - d.lastX;
    d.prevVelocityX = d.velocityX;
    d.velocityX = (dx / dt) * 16;
    d.lastX = e.clientX;
    d.lastTime = now;

    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_THRESHOLD) {
      d.moved = true;
      setDragging(true);
      startSwingLoop();
    }
    if (d.moved) {
      const x = clamp(e.clientX - d.offsetX, MARGIN, window.innerWidth - WIZARD_SIZE - MARGIN);
      const y = clamp(e.clientY - d.offsetY, NAV_SAFE_TOP, window.innerHeight - WIZARD_SIZE - MARGIN);
      setPos({ x, y });
    }
  }

  function onPointerUp(e: ReactPointerEvent<HTMLSpanElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const moved = drag.current.moved;
    const releasePhysics = physicsRef.current;
    stopSwingLoop();
    setPicked(false);
    setDragging(false);

    if (moved) {
      setHasUserDragged(true);
      setPlacement({
        horizontal: pos.x + WIZARD_SIZE / 2 > window.innerWidth / 2 ? "right" : "left",
        vertical: pos.y + WIZARD_SIZE / 2 < window.innerHeight / 2 ? "top" : "bottom",
      });
      if (!reduce) {
        setSettleStart(releasePhysics);
        setSettling(true);
        setLanded(true);
        setPuff(true);
        setPhysics(PHYSICS_IDLE);
        physicsRef.current = PHYSICS_IDLE;
        later(() => {
          setSettling(false);
          setLanded(false);
          setPuff(false);
        }, 820);
      } else {
        setPhysics(PHYSICS_IDLE);
      }
    } else {
      setPhysics(PHYSICS_IDLE);
      const msg = CLICK_MESSAGES[Math.floor(Math.random() * CLICK_MESSAGES.length)];
      setClickMsg(msg);
      if (!reduce) {
        setPopping(true);
        later(() => setPopping(false), 360);
      }
      later(() => setClickMsg(null), 5000);
    }
  }

  function onPointerCancel() {
    stopSwingLoop();
    setPicked(false);
    setDragging(false);
    setPhysics(PHYSICS_IDLE);
    physicsRef.current = PHYSICS_IDLE;
  }

  const horizontal = placement?.horizontal ?? anchor.horizontal;
  const vertical = placement?.vertical ?? anchor.vertical;
  const align =
    horizontal === "left" ? "items-start" : horizontal === "right" ? "items-end" : "items-center";
  const arrow = vertical === "top" ? "up" : "down";

  const phaseClass =
    companion.phase === "entering" && !hasUserDragged
      ? "companion-in"
      : companion.phase === "leaving"
        ? "companion-out"
        : "";
  const teleporting = (companion.phase === "entering" && !hasUserDragged) || companion.phase === "leaving";

  const bubbleMessage = clickMsg ?? companion.message;
  const bubbleState = clickMsg ? "speaking" : companion.state;
  const bubbleActions = clickMsg ? undefined : companion.bubbleActions;
  const showBubble =
    companion.phase === "present" &&
    !dragging &&
    !picked &&
    (bubbleState === "thinking" || !!bubbleMessage || !!bubbleActions?.length);

  const activePhysics = dragging ? physics : settling ? settleStart : PHYSICS_IDLE;
  const wrapperStyle: CSSProperties = {
    ...physicsToStyle(activePhysics),
    ...(settling
      ? {
          ["--settle-hat" as string]: `${settleStart.hatLag.toFixed(1)}deg`,
          ["--settle-wand" as string]: `${settleStart.wandLag.toFixed(1)}deg`,
          ["--settle-robe" as string]: `${settleStart.robeLag.toFixed(1)}deg`,
        }
      : {}),
    transform: dragging && !reduce ? "scale(1.06, 0.94)" : undefined,
  };

  const avatar = (
    <span
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={wrapperStyle}
      className={`pointer-events-auto relative inline-flex touch-none select-none ${
        dragging ? "wizard-dragging cursor-grabbing" : "cursor-grab"
      } ${picked && !dragging ? "wizard-picked-up" : ""} ${landed ? "wizard-landed" : ""} ${
        settling ? "wizard-settle-floppy" : ""
      } ${popping ? "wizard-pop" : ""}`}
    >
      {(teleporting || puff) && <SparkleBurst />}
      <Avatar
        state={companion.state}
        physics={activePhysics}
        wandAim={companion.wandAim ?? -28}
        showMotes={companion.showMotes && companion.phase === "entering"}
      />
    </span>
  );

  const bubble = showBubble ? (
    <SpeechBubble
      state={bubbleState}
      message={bubbleMessage}
      arrow={arrow}
      horizontal={horizontal}
      actions={bubbleActions}
      onClose={() => onDismiss(companion.agent)}
    />
  ) : null;

  // For "bottom" placements, anchor by the viewport bottom so the speech bubble
  // grows UPWARD (the wizard stays put) instead of pushing the wizard down.
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const positionStyle: CSSProperties =
    vertical === "bottom"
      ? { left: pos.x, bottom: Math.max(8, vh - pos.y - WIZARD_SIZE) }
      : { left: pos.x, top: pos.y };

  return (
    <div
      className={`pointer-events-none fixed z-[70] ${companion.phase === "entering" && !hasUserDragged ? anchor.posClass : ""}`}
      style={companion.phase === "entering" && !hasUserDragged ? undefined : positionStyle}
      onPointerDownCapture={() => registerInteraction()}
    >
      <div className={`flex max-w-[16rem] flex-col gap-1 ${align} ${phaseClass}`}>
        {vertical === "top" ? (
          <>
            {avatar}
            {bubble}
          </>
        ) : (
          <>
            {bubble}
            {avatar}
          </>
        )}
      </div>
    </div>
  );
}
