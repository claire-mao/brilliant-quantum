"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { ActiveCompanion, AgentId, CompanionUpdate } from "@/lib/companions/types";
import { ANCHORS } from "@/lib/companions/anchors";
import {
  computeWizardPhysics,
  PHYSICS_IDLE,
  physicsToStyle,
  type WizardPhysics,
} from "@/lib/companions/physics";
import { getAnchorPixelPosition, WIZARD_SIZE, MARGIN, NAV_SAFE_TOP } from "@/lib/companions/walking";
import { useCompanion } from "./CompanionProvider";
import { SparkleBurst } from "../WizardCompanion";
import SpeechBubble from "./SpeechBubble";
import { AGENT_AVATARS } from "./agents";
import SchrodingerCat, { type CatPhase } from "./SchrodingerCat";
import { playCatMeow } from "@/lib/sound/sounds";

const DRAG_THRESHOLD = 5;
const CAT_SIZE = 48;

/** Where the cat wants to be: just to the lower-left of the wizard, on screen. */
function computeCatTarget(p: { x: number; y: number }): { x: number; y: number } {
  const w = typeof window !== "undefined" ? window.innerWidth : 0;
  const h = typeof window !== "undefined" ? window.innerHeight : 0;
  return {
    x: clamp(p.x - 22, MARGIN, Math.max(MARGIN, w - CAT_SIZE - MARGIN)),
    y: clamp(p.y + WIZARD_SIZE - 46, NAV_SAFE_TOP, Math.max(NAV_SAFE_TOP, h - CAT_SIZE - 8)),
  };
}

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
  // The wizard's familiar. Rare on click: 1/10 to appear, 1/20 to be boxed away.
  const [catState, setCatState] = useState<"hidden" | CatPhase>("hidden");
  // Cat chase state (it trails the dragged wizard).
  const [catRunning, setCatRunning] = useState(false);
  const [catFlip, setCatFlip] = useState(false);
  const [catMeow, setCatMeow] = useState(false);
  const [catArrived, setCatArrived] = useState(false);

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
  const posRef = useRef(pos);
  const draggingRef = useRef(false);
  const catWrapRef = useRef<HTMLDivElement | null>(null);
  const catPosRef = useRef<{ x: number; y: number } | null>(null);
  const catRafRef = useRef<number | null>(null);
  const arriveTimerRef = useRef<number | null>(null);
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((t) => clearTimeout(t));
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (catRafRef.current !== null) cancelAnimationFrame(catRafRef.current);
      if (arriveTimerRef.current !== null) clearTimeout(arriveTimerRef.current);
    };
  }, []);

  // Keep the latest wizard position + drag state available to the cat-chase loop.
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  // The cat stays put while the wizard is being dragged. Once the wizard is
  // released it notices and runs after it (with lag), then bounces + chirps on
  // arrival. Dragging again mid-chase freezes the cat, so the next release just
  // starts a fresh chase. Disabled (snapped) under reduced motion.
  useEffect(() => {
    if (reduce) return;
    if (catState !== "present" && catState !== "appearing") return;
    if (!catPosRef.current) catPosRef.current = computeCatTarget(posRef.current);
    let runningNow = false;
    let flipNow = false;
    let wasRunning = false;
    const tick = () => {
      if (draggingRef.current) {
        // Wizard is being carried: the cat waits where it is, no live follow.
        if (runningNow) {
          runningNow = false;
          setCatRunning(false);
        }
        catRafRef.current = requestAnimationFrame(tick);
        return;
      }
      const t = computeCatTarget(posRef.current);
      const c = catPosRef.current!;
      const dx = t.x - c.x;
      const dy = t.y - c.y;
      c.x += dx * 0.16;
      c.y += dy * 0.16;
      const moving = Math.hypot(dx, dy) > 5;
      if (moving !== runningNow) {
        runningNow = moving;
        setCatRunning(moving);
      }
      if (moving) {
        wasRunning = true;
      } else if (wasRunning) {
        // Arrived after a chase: a small bounce + chirp.
        wasRunning = false;
        setCatArrived(true);
        playCatMeow();
        if (arriveTimerRef.current !== null) clearTimeout(arriveTimerRef.current);
        arriveTimerRef.current = window.setTimeout(() => setCatArrived(false), 480);
      }
      if (dx < -1.5 && !flipNow) {
        flipNow = true;
        setCatFlip(true);
      } else if (dx > 1.5 && flipNow) {
        flipNow = false;
        setCatFlip(false);
      }
      if (catWrapRef.current) {
        catWrapRef.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      }
      catRafRef.current = requestAnimationFrame(tick);
    };
    catRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (catRafRef.current !== null) cancelAnimationFrame(catRafRef.current);
      catRafRef.current = null;
    };
  }, [catState, reduce]);

  // Position the cat before paint (no flash). Under reduced motion it snaps to
  // the wizard's side on every move; otherwise this only seeds the start point
  // and the chase loop above takes over.
  useLayoutEffect(() => {
    const el = catWrapRef.current;
    if (catState === "hidden" || !el) return;
    if (reduce) {
      // Reduced motion: stay put during the drag, then jump to the new spot.
      if (dragging) return;
      const t = computeCatTarget(pos);
      el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
      return;
    }
    if (!catPosRef.current) {
      catPosRef.current = computeCatTarget(pos);
      const c = catPosRef.current;
      el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    }
  }, [catState, reduce, pos, dragging]);

  if (!Avatar) return null;

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  // Clicking the cat (not the wizard): it meows with sound + visual lines, lifts
  // its head and swishes its tail. The wizard is untouched.
  function handleCatMeow() {
    if (catState !== "present") return;
    playCatMeow();
    setCatMeow(true);
    later(() => setCatMeow(false), 1100);
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
      const roll = Math.random();
      let catMsg: string | null = null;
      if (catState === "hidden" && roll < 0.1) {
        // 1 in 10: the familiar pads out.
        catMsg = "A curious familiar pads out of my sleeve.";
        playCatMeow();
        if (reduce) {
          setCatState("present");
        } else {
          setCatState("appearing");
          later(() => setCatState("present"), 520);
        }
      } else if (catState === "present" && roll < 0.05) {
        // 1 in 20: into the cardboard box it goes, both here and not.
        catMsg = "Into the box it goes. Now it is both here and not.";
        playCatMeow();
        if (reduce) {
          setCatState("hidden");
          catPosRef.current = null;
        } else {
          setCatState("leaving");
          later(() => {
            setCatState("hidden");
            catPosRef.current = null; // re-spawn beside the wizard next time
          }, 2500);
        }
      }
      const msg = catMsg ?? CLICK_MESSAGES[Math.floor(Math.random() * CLICK_MESSAGES.length)];
      setClickMsg(msg);
      if (!reduce) {
        setPopping(true);
        later(() => setPopping(false), 360);
      }
      later(() => setClickMsg(null), catMsg ? 6000 : 5000);
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

  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  // The wizard stays put on click; only the bubble shifts to stay fully on
  // screen, with its arrow still pointing at the wizard.
  const bubbleW = vw > 0 ? Math.min(240, Math.max(160, vw - 16)) : 240;
  const wizardCenterX = pos.x + WIZARD_SIZE / 2;
  const bubbleLeftVp = clamp(wizardCenterX - bubbleW / 2, 8, Math.max(8, vw - bubbleW - 8));
  const arrowLeft = clamp(wizardCenterX - bubbleLeftVp, 16, bubbleW - 16);

  const bubble = showBubble ? (
    <SpeechBubble
      state={bubbleState}
      message={bubbleMessage}
      arrow={arrow}
      horizontal={horizontal}
      actions={bubbleActions}
      onClose={() => onDismiss(companion.agent)}
      style={{ width: bubbleW, marginLeft: bubbleLeftVp - pos.x }}
      arrowLeft={arrowLeft}
    />
  ) : null;

  // For "bottom" placements, anchor by the viewport bottom so the speech bubble
  // grows UPWARD (the wizard stays put) instead of pushing the wizard down.
  const positionStyle: CSSProperties =
    vertical === "bottom"
      ? { left: pos.x, bottom: Math.max(8, vh - pos.y - WIZARD_SIZE) }
      : { left: pos.x, top: pos.y };
  const useAnchorClass = companion.phase === "entering" && !hasUserDragged;

  return (
    <>
      <div
        className={`pointer-events-none fixed z-[70] ${useAnchorClass ? anchor.posClass : ""}`}
        style={useAnchorClass ? undefined : positionStyle}
        onPointerDownCapture={() => registerInteraction()}
      >
        <div className={`flex max-w-[16rem] flex-col items-start gap-1 ${phaseClass}`}>
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

      {catState !== "hidden" && (
        <div ref={catWrapRef} className="pointer-events-none fixed left-0 top-0 z-[69]">
          <div style={catFlip ? { transform: "scaleX(-1)" } : undefined}>
            <SchrodingerCat
              phase={catState}
              running={catRunning}
              meowing={catMeow}
              bounce={catArrived}
              reduce={reduce}
              onMeow={handleCatMeow}
            />
          </div>
        </div>
      )}
    </>
  );
}
