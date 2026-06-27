"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MARGIN, NAV_SAFE_TOP, BOTTOM_MARGIN } from "@/lib/companions/walking";
import type { CompanionPose } from "@/lib/companions/types";
import { useCompanionPose } from "./CompanionProvider";

/**
 * The wizard's familiar: a small cat that trails the Guide Wizard. It stays put
 * while the wizard is dragged, then walks (rAF pathing) toward the wizard after
 * release with a duration scaled to distance. When the wizard goes home the cat
 * climbs into a cardboard box and the lid closes. Purely additive and visual —
 * it reads the wizard's pose from a ref, never touching lessons or progress.
 * Honors prefers-reduced-motion by snapping/fading instead of walking.
 */

const CAT_W = 52;
const CAT_H = 40;
const GAP = 12;
const SPEED_PX_S = 320;
const MIN_MS = 800;
const MAX_MS = 2500;
const ARRIVE_EPS = 6;
const BOX_MS = 2200;
const BOX_REDUCED_MS = 460;

type Phase = "hidden" | "active" | "boxing";
interface Vec {
  x: number;
  y: number;
}
interface Walk {
  active: boolean;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  start: number;
  dur: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduce(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduce;
}

/** A resting spot beside the wizard's feet, kept inside the viewport. */
function targetFor(pose: CompanionPose): Vec {
  const w = window.innerWidth;
  const h = window.innerHeight;
  let x = pose.x - CAT_W * 0.55 - GAP;
  if (x < MARGIN) x = pose.x + pose.size + GAP - CAT_W * 0.45;
  x = clamp(x, MARGIN, w - CAT_W - MARGIN);
  const y = clamp(pose.y + pose.size - CAT_H - 2, NAV_SAFE_TOP, h - CAT_H - BOTTOM_MARGIN);
  return { x, y };
}

export default function CatFamiliar() {
  const { poseRef, registerWake } = useCompanionPose();
  const reduce = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("hidden");
  const [pos, setPos] = useState<Vec>({ x: 0, y: 0 });
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);

  const phaseRef = useRef<Phase>("hidden");
  const posRef = useRef<Vec>({ x: 0, y: 0 });
  const walkRef = useRef<Walk>({ active: false, fromX: 0, fromY: 0, toX: 0, toY: 0, start: 0, dur: 0 });
  const reduceRef = useRef(reduce);
  const rafRef = useRef<number | null>(null);
  const boxTimerRef = useRef<number | null>(null);

  useEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  useEffect(() => {
    const setPhaseBoth = (p: Phase) => {
      phaseRef.current = p;
      setPhase(p);
    };
    const setPosBoth = (v: Vec) => {
      posRef.current = v;
      setPos(v);
    };
    const setFace = (f: 1 | -1) => setFacing(f);

    function clearBoxTimer() {
      if (boxTimerRef.current !== null) {
        clearTimeout(boxTimerRef.current);
        boxTimerRef.current = null;
      }
    }

    function appearNear(pose: CompanionPose) {
      clearBoxTimer();
      walkRef.current.active = false;
      const t = targetFor(pose);
      setPosBoth(t);
      setWalking(false);
      setFace(pose.x + pose.size / 2 >= t.x + CAT_W / 2 ? 1 : -1);
      setPhaseBoth("active");
    }

    function startWalk(from: Vec, to: Vec, now: number) {
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const dur = clamp((dist / SPEED_PX_S) * 1000, MIN_MS, MAX_MS);
      walkRef.current = { active: true, fromX: from.x, fromY: from.y, toX: to.x, toY: to.y, start: now, dur };
      setFace(to.x >= from.x ? 1 : -1);
      setWalking(true);
    }

    function startBoxing() {
      walkRef.current.active = false;
      setWalking(false);
      setPhaseBoth("boxing");
      clearBoxTimer();
      const ms = reduceRef.current ? BOX_REDUCED_MS : BOX_MS;
      boxTimerRef.current = window.setTimeout(() => {
        boxTimerRef.current = null;
        setPhaseBoth("hidden");
      }, ms);
    }

    function follow(pose: CompanionPose, now: number): boolean {
      // Stay behind while the wizard is being dragged.
      if (pose.dragging) {
        if (walkRef.current.active) {
          walkRef.current.active = false;
          setWalking(false);
        }
        return false;
      }
      const target = targetFor(pose);
      const cur = posRef.current;
      const dist = Math.hypot(target.x - cur.x, target.y - cur.y);
      if (dist <= ARRIVE_EPS) {
        if (walkRef.current.active) {
          walkRef.current.active = false;
          setWalking(false);
        }
        return false;
      }
      if (reduceRef.current) {
        // Reduced motion: snap to the spot (a fade is applied via CSS).
        setFace(target.x >= cur.x ? 1 : -1);
        setPosBoth(target);
        return false;
      }
      const w = walkRef.current;
      const headingSame = w.active && Math.hypot(w.toX - target.x, w.toY - target.y) < 4;
      if (!headingSame) startWalk(cur, target, now);
      return true;
    }

    function advanceWalk(now: number): boolean {
      const w = walkRef.current;
      if (!w.active) return false;
      const t = clamp((now - w.start) / w.dur, 0, 1);
      const e = easeInOut(t);
      setPosBoth({ x: w.fromX + (w.toX - w.fromX) * e, y: w.fromY + (w.toY - w.fromY) * e });
      if (t >= 1) {
        w.active = false;
        setWalking(false);
        return false;
      }
      return true;
    }

    function frame() {
      const now = performance.now();
      const pose = poseRef.current;
      const wizardHere = !!pose && pose.phase !== "leaving";
      let busy = false;

      if (wizardHere && pose) {
        if (phaseRef.current !== "active") appearNear(pose);
        busy = follow(pose, now) || busy;
      } else if (phaseRef.current === "active") {
        // Wizard went home (or vanished): pack the cat into its box.
        startBoxing();
      }

      busy = advanceWalk(now) || busy;

      if (busy) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = null;
      }
    }

    function ensureLoop() {
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(frame);
    }

    registerWake(ensureLoop);
    ensureLoop();

    return () => {
      registerWake(() => {});
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      clearBoxTimer();
    };
  }, [registerWake, poseRef]);

  if (phase === "hidden") return null;

  const containerStyle: CSSProperties = { left: pos.x, top: pos.y, width: CAT_W, height: CAT_H };
  const faceStyle: CSSProperties = { ["--cat-flip" as string]: facing === -1 ? "-1" : "1" };

  return (
    <div className="pointer-events-none fixed z-[65]" style={containerStyle} aria-hidden="true">
      <div className="cat-familiar">
        <div className="cat-facing" style={faceStyle}>
          {phase === "boxing" ? <CatInBox /> : <PixelCat walking={walking && !reduce} />}
        </div>
      </div>
    </div>
  );
}

/** Side-view pixel-ish cat facing right; legs/tail/body animate while walking. */
function PixelCat({ walking }: { walking: boolean }) {
  return (
    <svg
      viewBox="0 0 52 40"
      width={CAT_W}
      height={CAT_H}
      className={`cat-svg ${walking ? "cat-walking" : ""}`}
      aria-hidden="true"
    >
      <g className="cat-tail" style={{ transformOrigin: "16px 24px" }}>
        <path d="M16 24 C8 25 4 18 6 11" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      </g>

      <g className="cat-leg cat-leg-b" style={{ transformOrigin: "18px 27px" }}>
        <rect x="16" y="26" width="4" height="10" rx="1.6" fill="#475569" />
      </g>
      <g className="cat-leg cat-leg-a" style={{ transformOrigin: "25px 27px" }}>
        <rect x="23" y="26" width="4" height="10" rx="1.6" fill="#64748b" />
      </g>
      <g className="cat-leg cat-leg-a" style={{ transformOrigin: "34px 27px" }}>
        <rect x="32" y="26" width="4" height="10" rx="1.6" fill="#475569" />
      </g>
      <g className="cat-leg cat-leg-b" style={{ transformOrigin: "40px 27px" }}>
        <rect x="38" y="26" width="4" height="10" rx="1.6" fill="#64748b" />
      </g>

      <g className="cat-body">
        <ellipse cx="27" cy="22" rx="16" ry="9" fill="#64748b" />
        <circle cx="42" cy="16" r="8" fill="#64748b" />
        <path d="M35.5 10 L37 3.5 L41.5 8.5 Z" fill="#64748b" />
        <path d="M48.5 10 L47 3.5 L42.5 8.5 Z" fill="#64748b" />
        <path d="M37 8.6 L38 5 L40 7.6 Z" fill="#94a3b8" />
        <path d="M47 8.6 L46 5 L44 7.6 Z" fill="#94a3b8" />
        <circle cx="44" cy="15" r="1.5" fill="#1f2937" />
        <circle cx="49.2" cy="17" r="1" fill="#1f2937" />
        <path d="M50 17 q2 0.5 3 -0.5" fill="none" stroke="#cbd5e1" strokeWidth="0.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Cardboard box; the cat lifts, lowers in, and the flaps fold shut. */
function CatInBox() {
  return (
    <div className="cat-box-scene">
      <svg className="cat-box-part cat-box-back" viewBox="0 0 52 40" width={CAT_W} height={CAT_H} aria-hidden="true">
        <polygon points="14,31 38,31 35,27 17,27" fill="#9a7335" />
        <rect x="14" y="30" width="24" height="2" fill="#86632d" />
      </svg>

      <div className="cat-box-cat">
        <PixelCat walking={false} />
      </div>

      <svg className="cat-box-part cat-box-front" viewBox="0 0 52 40" width={CAT_W} height={CAT_H} aria-hidden="true">
        <rect x="13" y="31" width="26" height="9" rx="1.5" fill="#c89148" />
        <rect x="13" y="31" width="26" height="2.2" fill="#dca85c" />
        <rect x="25.2" y="31" width="1.6" height="9" fill="#a9783a" opacity="0.6" />
      </svg>

      <svg className="cat-box-part cat-box-flaps" viewBox="0 0 52 40" width={CAT_W} height={CAT_H} aria-hidden="true">
        <g className="cat-box-flap cat-box-flap-l" style={{ transformOrigin: "13px 31px" }}>
          <rect x="13" y="27" width="13" height="4" rx="1" fill="#d6a24c" />
        </g>
        <g className="cat-box-flap cat-box-flap-r" style={{ transformOrigin: "39px 31px" }}>
          <rect x="26" y="27" width="13" height="4" rx="1" fill="#c8954a" />
        </g>
      </svg>
    </div>
  );
}
