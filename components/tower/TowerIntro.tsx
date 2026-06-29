"use client";

import { useCallback, useEffect, useState } from "react";
import { FLAME_DOT, FLAME_GLOW_R, FLAME_ORIGIN_STYLE } from "@/components/tower/flame-glow";

export const TOWER_INTRO_SEEN_KEY = "bq-tower-intro-seen-v1";

const STORY_TITLE = "The Tower of Lost Signals";

const PAGES = [
  {
    paragraphs: [
      "For as long as anyone could remember, Alice and Bob had carried messages between distant cities.",
      "Not with horses or birds, but with strange little particles of light that behaved unlike anything else.",
      "The messages always arrived safely.",
      "Or so everyone believed.",
    ],
    scene: "hills-beam" as const,
  },
  {
    paragraphs: [
      "One morning, Bob noticed something unusual.",
      "Some messages arrived differently than Alice had sent them.",
      "Nothing obvious.",
      "Just enough to make him wonder.",
      "Far beyond the mountains, a tall stone tower had appeared where none had stood before.",
    ],
    scene: "distant-tower" as const,
  },
  {
    paragraphs: [
      "People soon began sharing stories.",
      "Some said the Tower had always been there.",
      "Others insisted it had appeared overnight.",
      "No one agreed.",
      "The only thing everyone knew was that messages passing near the Tower were no longer quite the same.",
    ],
    scene: "village-stories" as const,
  },
  {
    paragraphs: [
      "Alice packed her journal.",
      "Bob gathered a few old maps.",
      "If the Tower truly had something to do with the changing messages, they wanted to see it for themselves.",
      "So they started walking.",
    ],
    scene: "approach-entrance" as const,
  },
  {
    paragraphs: [
      "Inside, they found empty halls.",
      "Old staircases.",
      "Locked doors.",
      "And curious creatures unlike any they had seen before.",
      "Somewhere near the top, someone was watching.",
    ],
    scene: "inside-halls" as const,
  },
] as const;

type Scene = (typeof PAGES)[number]["scene"];
type Phase = "closed" | "opening" | "reading" | "exit";

export function hasSeenTowerIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(TOWER_INTRO_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTowerIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOWER_INTRO_SEEN_KEY, "1");
  } catch {
    // ignore
  }
}

export default function TowerIntro({
  onComplete,
  reduce,
}: {
  onComplete: () => void;
  reduce: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(reduce ? "reading" : "closed");
  const [page, setPage] = useState(0);
  const [turnKey, setTurnKey] = useState(0);
  const last = page === PAGES.length - 1;
  const bookOpen = phase === "reading" || phase === "exit" || reduce;
  const showCover = !reduce && (phase === "closed" || phase === "opening");

  const finish = useCallback(() => {
    if (reduce) {
      markTowerIntroSeen();
      onComplete();
      return;
    }
    setPhase("exit");
  }, [onComplete, reduce]);

  const advance = useCallback(() => {
    if (last) {
      finish();
      return;
    }
    setPage((p) => p + 1);
    setTurnKey((k) => k + 1);
  }, [finish, last]);

  const goBack = useCallback(() => {
    if (page <= 0) return;
    setPage((p) => p - 1);
    setTurnKey((k) => k + 1);
  }, [page]);

  const openBook = useCallback(() => {
    if (reduce) {
      setPhase("reading");
      return;
    }
    setPhase("opening");
    window.setTimeout(() => setPhase("reading"), 1400);
  }, [reduce]);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = window.setTimeout(() => {
      markTowerIntroSeen();
      onComplete();
    }, reduce ? 400 : 2000);
    return () => clearTimeout(t);
  }, [phase, onComplete, reduce]);

  useEffect(() => {
    if (phase !== "reading") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft") goBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, advance, goBack]);

  const skip = useCallback(() => {
    markTowerIntroSeen();
    onComplete();
  }, [onComplete]);

  return (
    <div
      className={`font-arcane tower-intro-root relative flex min-h-[70vh] flex-1 flex-col items-center justify-center px-4 py-10 text-slate-100 ${phase === "exit" ? "tower-intro-root-exit" : ""}`}
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className={`tower-intro-ambient absolute inset-0 ${reduce ? "" : "tower-intro-ambient-anim"}`} />
        {!reduce && <MotesLayer />}
      </div>

      <div className={`tower-intro-book-wrap relative z-10 ${phase === "exit" ? "tower-intro-book-wrap-exit" : ""}`}>
        <div
          className={`tower-intro-book ${bookOpen ? "tower-intro-book-open" : ""} ${phase === "opening" ? "tower-intro-book-opening" : ""}`}
        >
          <div className="tower-intro-spine" aria-hidden="true" />

          <div className="tower-intro-pages-stack" aria-hidden="true">
            <div className="tower-intro-page-edge tower-intro-page-edge-1" />
            <div className="tower-intro-page-edge tower-intro-page-edge-2" />
          </div>

          {bookOpen && (
            <div
              key={turnKey}
              className={`tower-intro-page ${reduce ? "" : "tower-intro-page-turn"} ${last && !reduce ? "tower-intro-page-final" : ""} ${phase === "exit" ? "tower-intro-page-exit" : ""} tower-intro-page-glow-step-${Math.min(page + 1, PAGES.length)}`}
            >
              <div className={`tower-intro-page-glow ${reduce ? "" : "tower-intro-page-glow-anim"}`} aria-hidden="true" />
              <PageIllustration scene={PAGES[page].scene} reduce={reduce} isLast={last} exiting={phase === "exit"} />
              <div className="tower-intro-page-text">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-800/70">
                  {page + 1} / {PAGES.length}
                </p>
                {page === 0 && (
                  <h2 className="mt-1 font-serif text-base font-bold leading-snug text-[#2a1f12] sm:text-lg">
                    {STORY_TITLE}
                  </h2>
                )}
                <div className={`space-y-1.5 ${page === 0 ? "mt-2" : "mt-1"}`}>
                  {PAGES[page].paragraphs.map((para) => (
                    <p key={para} className="text-[11px] leading-[1.45] text-[#3d2e1c] sm:text-xs sm:leading-[1.5]">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showCover && (
            <div
              className={`tower-intro-cover ${phase === "opening" ? "tower-intro-cover-open" : ""}`}
            >
              <div className="tower-intro-cover-light" />
              <div className="tower-intro-cover-seam" aria-hidden="true" />
              <BookCoverArt />
              <p className="tower-intro-cover-title">{STORY_TITLE}</p>
              {phase === "closed" && (
                <button
                  type="button"
                  onClick={openBook}
                  className="relative z-20 mt-4 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Open book
                </button>
              )}
            </div>
          )}

          <div className="tower-intro-back-cover" aria-hidden="true" />
        </div>

        {phase === "exit" && !reduce && (
          <div className="tower-intro-gate-portal pointer-events-none" aria-hidden="true">
            <svg viewBox="0 0 80 120" className="h-32 w-auto" shapeRendering="crispEdges">
              <polygon points="40,4 68,116 12,116" fill="#0f172a" stroke="#67e8f9" strokeWidth="1.5" opacity="0.9" />
              <rect x="32" y="48" width="16" height="20" fill="#67e8f9" opacity="0.55" className="tower-intro-portal-glow" />
            </svg>
          </div>
        )}
      </div>

      {bookOpen && phase !== "exit" && (
        <div className="relative z-20 mt-8 flex flex-col items-center gap-4">
          {!reduce && (
            <div className="flex gap-1.5" aria-hidden="true">
              {PAGES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? "w-6 bg-cyan-400" : "w-1.5 bg-slate-600"}`}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            {page > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
              >
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={advance}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              {last ? "Enter the Tower" : "Next"}
            </button>
            <button
              type="button"
              onClick={skip}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              Skip story
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MotesLayer() {
  const motes = ["✦", "·", "◦", "✧", "·", "✦", "◦"];
  return (
    <div className="tower-intro-runes absolute inset-0" aria-hidden="true">
      {motes.map((m, i) => (
        <span key={`${m}-${i}`} className={`tower-intro-rune tower-intro-rune-${i + 1}`}>
          {m}
        </span>
      ))}
    </div>
  );
}

function BookCoverArt() {
  return (
    <svg viewBox="0 0 120 80" className="tower-intro-cover-art" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="2" y="2" width="116" height="76" fill="none" stroke="#7c6a9e" strokeWidth="1" opacity="0.35" />
      <rect x="4" y="4" width="3" height="3" fill="#5b4a78" opacity="0.6" />
      <rect x="113" y="4" width="3" height="3" fill="#5b4a78" opacity="0.6" />
      <rect x="4" y="73" width="3" height="3" fill="#5b4a78" opacity="0.6" />
      <rect x="113" y="73" width="3" height="3" fill="#5b4a78" opacity="0.6" />
      <rect x="8" y="8" width="104" height="64" fill="#1a0f30" opacity="0.3" rx="2" />
      <SkyBand y={8} h={52} dusk />
      <Hill x={6} y={56} w={34} h={16} />
      <Hill x={80} y={58} w={34} h={14} />
      <StoryTower x={50} y={14} tall windows distant />
      <WindowHalo x={56} y={36} w={8} h={28} />
      <SignalBeam x1={28} y1={46} x2={52} y2={38} reduce quiet />
      <SignalBeam x1={68} y1={38} x2={90} y2={48} reduce quiet broken />
      <IllustrationAlice x={12} y={38} scale={0.38} signal />
      <IllustrationBob x={96} y={40} scale={0.34} signal />
      <circle cx="60" cy="30" r="3" fill="#fcd34d" opacity="0.35" className="tower-intro-cover-star" />
      <circle cx="48" cy="22" r="1.5" fill="#67e8f9" opacity="0.4" />
      <circle cx="72" cy="18" r="1.5" fill="#a78bfa" opacity="0.35" />
    </svg>
  );
}

function PageIllustration({
  scene,
  reduce,
  isLast,
  exiting,
}: {
  scene: Scene;
  reduce: boolean;
  isLast: boolean;
  exiting: boolean;
}) {
  return (
    <div
      className={`tower-intro-illustration relative mx-auto aspect-[5/3] w-full max-w-[220px] overflow-hidden rounded border border-amber-900/20 bg-[#e8dcc8]/60 ${isLast && !reduce ? "tower-intro-ill-tower" : ""} ${exiting ? "tower-intro-ill-exit" : ""}`}
    >
      <svg viewBox="0 0 200 120" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
        {[20, 40, 60, 80, 100].map((y) => (
          <line key={y} x1="8" y1={y} x2="192" y2={y} stroke="#c4a574" strokeWidth="0.5" opacity="0.25" />
        ))}

        {scene === "hills-beam" && (
          <>
            <SkyBand y={0} h={72} dusk />
            <rect x="0" y="78" width="200" height="42" fill="#8b7355" opacity="0.4" />
            <Hill x={8} y={58} w={64} h={32} />
            <Hill x={128} y={60} w={64} h={30} />
            <IllustrationAlice x={28} y={44} scale={0.42} signal />
            <IllustrationBob x={152} y={46} scale={0.38} signal />
            <BeamGlow x1={72} y1={56} x2={128} y2={58} reduce={reduce} />
            <SignalBeam x1={72} y1={56} x2={128} y2={58} reduce={reduce} quiet />
            {!reduce && (
              <>
                <circle cx="84" cy="57" r="2" fill="#67e8f9" className="tower-intro-particle tower-intro-particle-1" />
                <circle cx="100" cy="56" r="2" fill="#fcd34d" className="tower-intro-particle tower-intro-particle-2" />
                <circle cx="116" cy="58" r="2" fill="#67e8f9" opacity="0.55" className="tower-intro-particle tower-intro-particle-3" />
              </>
            )}
          </>
        )}

        {scene === "distant-tower" && (
          <>
            <SkyBand y={0} h={70} />
            <g className={reduce ? "" : "tower-intro-ground-shake"}>
              <MountainRange />
              <rect x="0" y="72" width="200" height="48" fill="#5c6b4a" opacity="0.4" />
              <rect x="0" y="74" width="200" height="4" fill="#4a5a3a" opacity="0.35" />
            </g>
            <Cloud x={18} y={14} w={40} reduce={reduce} delay={0} />
            <Cloud x={108} y={20} w={48} reduce={reduce} delay={1} />
            <Cloud x={62} y={8} w={32} reduce={reduce} delay={2} />
            <g className={reduce ? "" : "tower-intro-tower-emerge"} style={{ transformBox: "fill-box", transformOrigin: "94px 72px" }}>
              <StoryTower x={86} y={24} tall distant windows groundBase />
              <WindowHalo x={92} y={36} w={8} h={36} reduce={reduce} />
            </g>
            <IllustrationBob x={18} y={72} scale={0.4} puzzled />
          </>
        )}

        {scene === "village-stories" && (
          <>
            <rect x="0" y="0" width="200" height="120" fill="#1a1028" opacity="0.35" />
            <SkyBand y={0} h={58} dusk />
            <StoryTower x={78} y={-4} tall windows distant ominous />
            <WindowHalo x={84} y={8} w={12} h={52} reduce={reduce} faint />
            <OminousMist reduce={reduce} />
            <VillageSilhouettes />
            <rect x="0" y="96" width="200" height="24" fill="#2a1f18" opacity="0.55" />
            <rect x="0" y="100" width="200" height="20" fill="#1a1410" opacity="0.4" />
            <VillageCrowd reduce={reduce} />
          </>
        )}

        {scene === "approach-entrance" && (
          <>
            <SkyBand y={0} h={40} dusk />
            <ValleyLayers />
            <DistantForestTower reduce={reduce} />
            <CohesiveForestWall />
            <WindingForestPath />
            <IllustrationAlice x={68} y={88} scale={0.36} journal lantern walking reduce={reduce} />
            <IllustrationBob x={92} y={90} scale={0.34} maps walking />
          </>
        )}

        {scene === "inside-halls" && <TowerDoorIllustration reduce={reduce} isLast={isLast} />}
      </svg>
    </div>
  );
}

function Hill({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <>
      <polygon
        points={`${x},${y + h} ${x + w / 2},${y} ${x + w},${y + h}`}
        fill="#6b8f5e"
        stroke="#4a6b42"
        strokeWidth="1"
      />
      <polygon
        points={`${x + w * 0.15},${y + h} ${x + w / 2},${y + h * 0.35} ${x + w * 0.85},${y + h}`}
        fill="#7a9f6e"
        opacity="0.45"
      />
    </>
  );
}

function SkyBand({ y, h, dusk }: { y: number; h: number; dusk?: boolean }) {
  const top = dusk ? "#3d2a5c" : "#5a7a9a";
  const mid = dusk ? "#6b4a7a" : "#8aa8c4";
  const bot = dusk ? "#c4a882" : "#b8c8d8";
  return (
    <>
      <rect x="0" y={y} width="200" height={h} fill={top} opacity="0.35" />
      <rect x="0" y={y + h * 0.35} width="200" height={h * 0.35} fill={mid} opacity="0.25" />
      <rect x="0" y={y + h * 0.65} width="200" height={h * 0.35} fill={bot} opacity="0.2" />
    </>
  );
}

function WindowHalo({ x, y, w, h, reduce, faint }: { x: number; y: number; w: number; h: number; reduce?: boolean; faint?: boolean }) {
  return (
    <rect
      x={x - 4}
      y={y - 2}
      width={w + 8}
      height={h + 4}
      fill="#67e8f9"
      opacity={faint ? 0.08 : 0.12}
      rx="2"
      className={reduce ? "" : "tower-intro-window-halo"}
    />
  );
}

function BeamGlow({
  x1,
  y1,
  x2,
  y2,
  reduce,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  reduce: boolean;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <ellipse
      cx={mx}
      cy={my}
      rx={Math.abs(x2 - x1) / 2 + 6}
      ry="6"
      fill="#67e8f9"
      opacity="0.1"
      className={reduce ? "" : "tower-intro-beam-glow"}
    />
  );
}

function OminousMist({ reduce }: { reduce: boolean }) {
  return (
    <>
      <rect x="0" y="48" width="200" height="14" fill="#2a1f38" opacity="0.35" className={reduce ? "" : "tower-intro-mist-drift tower-intro-mist-drift-1"} />
      <rect x="0" y="58" width="200" height="18" fill="#1a1428" opacity="0.45" className={reduce ? "" : "tower-intro-mist-drift tower-intro-mist-drift-2"} />
      <rect x="0" y="70" width="200" height="22" fill="#0f0a18" opacity="0.5" className={reduce ? "" : "tower-intro-light-pulse"} />
      <rect x="0" y="82" width="200" height="16" fill="#080510" opacity="0.35" />
    </>
  );
}

type VillagerPose = "talk" | "gesture" | "listen";

type VillagerSpec = {
  x: number;
  y: number;
  scale?: number;
  robe: string;
  robeDark?: string;
  skin?: string;
  hat?: boolean;
  facing?: "left" | "right";
  pose?: VillagerPose;
  bubble?: { x: number; y: number; w: number; h: number; tail: "left" | "right" | "center" };
};

/** Large foreground villagers flanking the scene; tower center stays clear. */
const VILLAGE_CROWD: VillagerSpec[] = [
  { x: 0, y: 74, scale: 1.12, robe: "#6b5344", robeDark: "#4a3828", facing: "right", pose: "talk", hat: true, bubble: { x: 6, y: 44, w: 22, h: 14, tail: "left" } },
  { x: 26, y: 78, scale: 1.06, robe: "#7a5c4a", robeDark: "#5a4030", facing: "right", pose: "gesture", bubble: { x: 34, y: 46, w: 20, h: 13, tail: "left" } },
  { x: 108, y: 75, scale: 1.1, robe: "#4a5a6b", robeDark: "#354050", facing: "left", pose: "talk", hat: true, bubble: { x: 80, y: 44, w: 22, h: 14, tail: "right" } },
  { x: 142, y: 78, scale: 1.04, robe: "#5c4a6b", robeDark: "#403050", facing: "left", pose: "listen" },
  { x: 168, y: 74, scale: 1.1, robe: "#8b6914", robeDark: "#6b5010", facing: "left", pose: "talk", hat: true, bubble: { x: 146, y: 48, w: 20, h: 13, tail: "right" } },
];

function VillageSilhouettes() {
  const houses = [
    { x: 2, y: 74, w: 16, h: 14 },
    { x: 22, y: 78, w: 12, h: 10 },
    { x: 166, y: 76, w: 14, h: 12 },
    { x: 184, y: 80, w: 12, h: 8 },
  ];
  return (
    <g opacity="0.45">
      {houses.map((h) => (
        <g key={`${h.x}-${h.y}`}>
          <rect x={h.x} y={h.y} width={h.w} height={h.h} fill="#141010" />
          <polygon points={`${h.x},${h.y} ${h.x + h.w / 2},${h.y - 6} ${h.x + h.w},${h.y}`} fill="#0f0c0a" />
          <rect x={h.x + h.w / 2 - 2} y={h.y + h.h - 6} width="4" height="6" fill="#0a0806" opacity="0.7" />
        </g>
      ))}
    </g>
  );
}

function ChatterMarks({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <>
      <circle cx={x + w * 0.28} cy={y + h * 0.45} r="0.9" fill="#3d2e1c" opacity="0.55" />
      <circle cx={x + w * 0.5} cy={y + h * 0.42} r="0.9" fill="#3d2e1c" opacity="0.55" />
      <circle cx={x + w * 0.72} cy={y + h * 0.45} r="0.9" fill="#3d2e1c" opacity="0.55" />
      <path
        d={`M${x + w * 0.22} ${y + h * 0.62} Q${x + w * 0.5} ${y + h * 0.68} ${x + w * 0.78} ${y + h * 0.6}`}
        fill="none"
        stroke="#3d2e1c"
        strokeWidth="0.6"
        opacity="0.4"
      />
    </>
  );
}

function TalkBubble({
  x,
  y,
  w,
  h,
  tail,
  reduce,
  delay,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tail: "left" | "right" | "center";
  reduce?: boolean;
  delay?: number;
}) {
  const tailX = tail === "left" ? x + 2 : tail === "right" ? x + w - 2 : x + w / 2;
  const tailTipX = tail === "left" ? tailX - 2 : tail === "right" ? tailX + 2 : tailX;
  return (
    <g className={reduce ? "" : "tower-intro-bubble-bob"} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      <rect x={x} y={y} width={w} height={h} fill="#e8dcc8" stroke="#8b7355" strokeWidth="0.6" rx="2" opacity="0.92" />
      <polygon
        points={`${tailX - 1.5},${y + h} ${tailTipX},${y + h + 4} ${tailX + 1.5},${y + h}`}
        fill="#e8dcc8"
        stroke="#8b7355"
        strokeWidth="0.5"
      />
      <ChatterMarks x={x} y={y} w={w} h={h} />
    </g>
  );
}

function GestureLines({ x, y, facing, reduce }: { x: number; y: number; facing: "left" | "right"; reduce?: boolean }) {
  const dir = facing === "right" ? 1 : -1;
  return (
    <g className={reduce ? "" : "tower-intro-gesture-flicker"} opacity="0.65">
      <path d={`M${x + dir * 5} ${y - 2} Q${x + dir * 9} ${y - 6} ${x + dir * 12} ${y - 3}`} fill="none" stroke="#c4a574" strokeWidth="0.8" />
      <path d={`M${x + dir * 6} ${y - 1} Q${x + dir * 10} ${y - 4} ${x + dir * 8} ${y - 7}`} fill="none" stroke="#c4a574" strokeWidth="0.6" opacity="0.7" />
    </g>
  );
}

function PixelVillager({
  x,
  y,
  scale = 0.3,
  robe,
  robeDark,
  skin = "#d9a87f",
  hat,
  facing = "right",
  pose = "listen",
}: {
  x: number;
  y: number;
  scale?: number;
  robe: string;
  robeDark?: string;
  skin?: string;
  hat?: boolean;
  facing?: "left" | "right";
  pose?: VillagerPose;
}) {
  const dk = robeDark ?? robe;
  const flip = facing === "left" ? -1 : 1;
  const armTalk = pose === "talk";
  const armGesture = pose === "gesture";
  const headY = hat ? 5 : 2;
  const bodyY = hat ? 11 : 8;
  const legY = hat ? 19 : 16;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale * flip}, ${scale})`}>
      <ellipse cx="9" cy="22.5" rx="7" ry="1.4" fill="#000" opacity="0.3" />
      {hat && (
        <>
          <rect x="4" y="0" width="10" height="2.5" fill={dk} />
          <rect x="3" y="2.5" width="12" height="2.5" fill={dk} />
        </>
      )}
      <rect x="5" y={headY} width="8" height="6" fill={skin} />
      <rect x="6.5" y={headY + 2.5} width="2" height="2" fill="#1e1b4b" />
      <rect x="10.5" y={headY + 2.5} width="2" height="2" fill="#1e1b4b" />
      <rect x="3.5" y={bodyY} width="11" height="8" fill={robe} />
      <rect x="3.5" y={bodyY} width="11" height="2" fill={dk} opacity="0.45" />
      {armTalk && (
        <>
          <rect x="14" y={bodyY + 1} width="3.5" height="2.5" fill={robe} />
          <rect x="15" y={bodyY - 2} width="2.5" height="3.5" fill={skin} />
        </>
      )}
      {armGesture && (
        <>
          <rect x="14" y={bodyY + 1} width="4.5" height="2.5" fill={robe} />
          <rect x="17.5" y={bodyY - 1} width="2.5" height="2.5" fill={skin} />
          <rect x="-1" y={bodyY + 1} width="4.5" height="2.5" fill={robe} />
          <rect x="-2.5" y={bodyY - 1} width="2.5" height="2.5" fill={skin} />
        </>
      )}
      {!armTalk && !armGesture && (
        <>
          <rect x="14" y={bodyY + 2} width="2.5" height="4.5" fill={robe} />
          <rect x="1.5" y={bodyY + 2} width="2.5" height="4.5" fill={robe} />
        </>
      )}
      <rect x="5.5" y={legY} width="3" height="4.5" fill={dk} />
      <rect x="9.5" y={legY} width="3" height="4.5" fill={dk} />
    </g>
  );
}

function VillageCrowd({ reduce }: { reduce: boolean }) {
  return (
    <>
      {VILLAGE_CROWD.map((v, i) => (
        <g key={`v-${i}`}>
          <PixelVillager
            x={v.x}
            y={v.y}
            scale={v.scale}
            robe={v.robe}
            robeDark={v.robeDark}
            skin={v.skin}
            hat={v.hat}
            facing={v.facing}
            pose={v.pose}
          />
          {(v.pose === "talk" || v.pose === "gesture") && (
            <GestureLines x={v.x + (v.facing === "right" ? 8 : -8)} y={v.y + 2} facing={v.facing ?? "right"} reduce={reduce} />
          )}
        </g>
      ))}
      {VILLAGE_CROWD.filter((v) => v.bubble).map((v, i) => (
        <TalkBubble
          key={`b-${i}`}
          x={v.bubble!.x}
          y={v.bubble!.y}
          w={v.bubble!.w}
          h={v.bubble!.h}
          tail={v.bubble!.tail}
          reduce={reduce}
          delay={i * 0.15}
        />
      ))}
    </>
  );
}

function ValleyLayers() {
  return (
    <>
      <polygon points="0,72 48,58 96,72" fill="#1a3020" opacity="0.35" />
      <polygon points="48,72 120,48 192,72" fill="#152818" opacity="0.45" />
      <polygon points="96,72 148,54 192,72" fill="#1a3020" opacity="0.3" />
      <polygon points="0,78 64,66 128,78 192,68 192,120 0,120" fill="#0f1a12" opacity="0.5" />
    </>
  );
}

function DistantForestTower({ reduce }: { reduce: boolean }) {
  return (
    <g opacity="0.88">
      <g transform="translate(112, 4) scale(0.78)" className={reduce ? "" : "tower-intro-window-pulse"} opacity="0.8">
        <StoryTower x={0} y={0} tall distant windows />
      </g>
      <rect x="124" y="10" width="20" height="4" fill="#67e8f9" opacity="0.14" />
    </g>
  );
}

/** One dense forest wall blocking the path to the tower, not scattered trees. */
function CohesiveForestWall() {
  return (
    <g>
      {/* Left wing: solid mass framing the path */}
      <polygon points="0,32 0,120 56,120 58,92 54,72 50,56 44,42 38,34 28,30" fill="#0a1810" />
      <polygon points="0,32 0,120 56,120 58,92 54,72 50,56 44,42 38,34 28,30" fill="#152818" opacity="0.55" />

      {/* Right wing */}
      <polygon points="200,32 200,120 144,120 142,92 146,72 150,56 156,42 162,34 172,30" fill="#0a1810" />
      <polygon points="200,32 200,120 144,120 142,92 146,72 150,56 156,42 162,34 172,30" fill="#152818" opacity="0.55" />

      {/* Central blocking wall: dense patch between path and distant tower */}
      <polygon
        points="56,78 68,62 82,52 98,44 116,38 136,34 160,32 184,34 200,38 200,74 186,70 168,66 148,64 128,66 108,70 88,74 72,80"
        fill="#0a1810"
      />
      <polygon
        points="56,78 68,62 82,52 98,44 116,38 136,34 160,32 184,34 200,38 200,74 186,70 168,66 148,64 128,66 108,70 88,74 72,80"
        fill="#1a3020"
        opacity="0.7"
      />

      {/* Unified canopy crest along the wall top */}
      <polygon
        points="28,30 44,24 62,28 80,22 98,26 114,20 130,24 148,18 166,22 184,18 200,26 200,32 184,34 160,32 136,34 116,38 98,44 82,52 68,62 56,78 50,56 44,42 38,34"
        fill="#1a4030"
        opacity="0.9"
      />
      <polygon
        points="56,38 78,32 102,36 124,30 146,34 168,28 192,32"
        fill="#2d5a40"
        opacity="0.45"
      />

      {/* Tower occlusion: same forest mass, not separate trees */}
      <rect x="112" y="24" width="10" height="24" fill="#152818" opacity="0.82" />
      <rect x="122" y="20" width="12" height="28" fill="#1a2818" opacity="0.88" />
      <rect x="134" y="26" width="10" height="22" fill="#152818" opacity="0.78" />
      <rect x="144" y="22" width="11" height="26" fill="#1a3020" opacity="0.8" />
      <polygon points="108,36 118,24 128,36" fill="#1a4030" opacity="0.85" />
      <polygon points="120,34 132,20 144,34" fill="#152818" opacity="0.82" />
      <polygon points="136,32 148,22 160,34" fill="#1a4030" opacity="0.78" />

      {/* Depth shading on lower flanks */}
      <rect x="0" y="74" width="54" height="46" fill="#080f0a" opacity="0.35" />
      <rect x="146" y="74" width="54" height="46" fill="#080f0a" opacity="0.35" />
    </g>
  );
}

function WindingForestPath() {
  return (
    <>
      <path d="M72 118 Q88 96 96 82 Q104 68 108 58 Q112 48 118 42" fill="none" stroke="#6b5a4a" strokeWidth="14" opacity="0.25" strokeLinecap="round" />
      <path d="M72 118 Q88 96 96 82 Q104 68 108 58 Q112 48 118 42" fill="none" stroke="#9a8b7a" strokeWidth="8" opacity="0.45" strokeLinecap="round" />
      {[92, 78, 64, 52].map((py, i) => (
        <rect key={py} x={84 + i * 4} y={py} width={8} height={3} fill="#b8a898" opacity="0.6" rx="1" />
      ))}
    </>
  );
}

/** Book-scale tower entrance, aligned with TowerGate doorway aesthetic. */
function TowerDoorIllustration({ reduce, isLast }: { reduce: boolean; isLast: boolean }) {
  const glowClass = reduce ? "" : "tower-intro-lantern-warm";
  const crackClass = isLast && !reduce ? "tower-intro-gate-window" : glowClass;

  return (
    <>
      <rect x="0" y="0" width="200" height="108" fill="#4e565f" />
      {[
        [0, 0, 20, 18, "#5b636f"],
        [20, 0, 20, 18, "#4a525b"],
        [40, 0, 20, 18, "#535b66"],
        [60, 0, 20, 18, "#48505a"],
        [80, 0, 20, 18, "#5b636f"],
        [100, 0, 20, 18, "#4a525b"],
        [120, 0, 20, 18, "#535b66"],
        [140, 0, 20, 18, "#48505a"],
        [160, 0, 20, 18, "#5b636f"],
        [180, 0, 20, 18, "#4a525b"],
        [10, 18, 20, 18, "#48505a"],
        [30, 18, 20, 18, "#535b66"],
        [50, 18, 20, 18, "#5b636f"],
        [70, 18, 20, 18, "#4a525b"],
        [90, 18, 20, 18, "#535b66"],
        [110, 18, 20, 18, "#48505a"],
        [130, 18, 20, 18, "#5b636f"],
        [150, 18, 20, 18, "#4a525b"],
        [170, 18, 20, 18, "#535b66"],
        [0, 36, 20, 18, "#535b66"],
        [20, 36, 20, 18, "#48505a"],
        [40, 36, 20, 18, "#5b636f"],
        [140, 36, 20, 18, "#48505a"],
        [160, 36, 20, 18, "#535b66"],
        [180, 36, 20, 18, "#5b636f"],
        [0, 54, 20, 18, "#48505a"],
        [20, 54, 20, 18, "#5b636f"],
        [160, 54, 20, 18, "#48505a"],
        [180, 54, 20, 18, "#535b66"],
        [0, 72, 20, 18, "#5b636f"],
        [180, 72, 20, 18, "#48505a"],
        [0, 90, 20, 18, "#535b66"],
        [180, 90, 20, 18, "#5b636f"],
      ].map(([x, y, w, h, fill], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill as string} opacity="0.55" />
      ))}
      <rect x="0" y="0" width="28" height="108" fill="#2f343c" opacity="0.28" />
      <rect x="172" y="0" width="28" height="108" fill="#2f343c" opacity="0.28" />
      <rect x="0" y="108" width="200" height="12" fill="#4b525c" />
      <rect x="0" y="108" width="200" height="2" fill="#5e6671" />

      <path d="M76 108 L76 50 Q88 28 100 24 Q112 28 124 50 L124 108 Z" fill="#030306" />
      <ellipse cx="100" cy="74" rx="16" ry="24" fill="#fbbf24" opacity="0.1" className={glowClass} />

      {[68, 122].map((x) => (
        <g key={x}>
          <rect x={x} y="44" width="10" height="64" fill="#7b8593" />
          <rect x={x} y="44" width="10" height="64" fill="#000" opacity="0.06" />
          {[58, 72, 86, 100].map((y) => (
            <rect key={y} x={x} y={y} width="10" height="1" fill="#4b525c" opacity="0.55" />
          ))}
          <rect x={x} y="44" width="10" height="2" fill="#959fac" />
        </g>
      ))}

      <path d="M68 50 Q80 26 100 22 Q120 26 132 50 L122 50 Q112 34 100 30 Q88 34 78 50 Z" fill="#7b8593" />
      <path d="M68 50 Q80 26 100 22 Q120 26 132 50" fill="none" stroke="#959fac" strokeWidth="1" />
      {[-36, -18, 0, 18, 36].map((d) => {
        const a = ((d - 90) * Math.PI) / 180;
        return (
          <line
            key={d}
            x1={100 + Math.cos(a) * 34}
            y1={38 + Math.sin(a) * 28}
            x2={100 + Math.cos(a) * 44}
            y2={38 + Math.sin(a) * 36}
            stroke="#4b525c"
            strokeWidth="0.75"
            opacity="0.55"
          />
        );
      })}
      <rect x="96" y="20" width="8" height="8" fill="#8b96a4" stroke="#5b6470" strokeWidth="0.5" />

      <path d="M78 108 L78 50 Q88 32 100 28 L100 108 Z" fill="#5a4632" />
      <path d="M78 108 L78 50 Q88 32 100 28 L100 108 Z" fill="#000" opacity="0.1" />
      <rect x="84" y="46" width="1" height="62" fill="#3a2c1c" />
      <rect x="92" y="38" width="1" height="70" fill="#3a2c1c" />
      {[62, 88].map((y) => (
        <g key={`l-${y}`}>
          <rect x="78" y={y} width="22" height="4" fill="#211d16" />
          <rect x="78" y={y} width="22" height="1" fill="#3a352b" opacity="0.55" />
          <circle cx="86" cy={y + 2} r="1.5" fill="#3a352b" />
          <circle cx="92" cy={y + 2} r="1.5" fill="#3a352b" />
        </g>
      ))}
      <circle cx="96" cy="72" r="4" fill="none" stroke="#211d16" strokeWidth="1.5" />
      <circle cx="96" cy="68" r="1" fill="#2b261d" />

      <path d="M122 108 L122 50 Q112 32 100 28 L100 108 Z" fill="#5a4632" />
      <path d="M122 108 L122 50 Q112 32 100 28 L100 108 Z" fill="#000" opacity="0.1" />
      <rect x="116" y="46" width="1" height="62" fill="#3a2c1c" />
      <rect x="108" y="38" width="1" height="70" fill="#3a2c1c" />
      {[62, 88].map((y) => (
        <g key={`r-${y}`}>
          <rect x="100" y={y} width="22" height="4" fill="#211d16" />
          <rect x="100" y={y} width="22" height="1" fill="#3a352b" opacity="0.55" />
          <circle cx="108" cy={y + 2} r="1.5" fill="#3a352b" />
          <circle cx="114" cy={y + 2} r="1.5" fill="#3a352b" />
        </g>
      ))}
      <circle cx="104" cy="72" r="4" fill="none" stroke="#211d16" strokeWidth="1.5" />
      <circle cx="104" cy="68" r="1" fill="#2b261d" />

      <rect x="99" y="30" width="2" height="78" fill="#fcd34d" opacity="0.5" className={crackClass} />
      <rect x="77" y="66" width="1" height="14" fill="#fbbf24" opacity="0.35" className={glowClass} />
      <rect x="122" y="66" width="1" height="14" fill="#fbbf24" opacity="0.35" className={glowClass} />
      <rect x="88" y="96" width="24" height="2" fill="#fcd34d" opacity="0.25" className={glowClass} />

      <g className={reduce ? "" : "tower-intro-eye-pulse"} opacity="0.75">
        <circle cx="100" cy="58" r="7" fill="none" stroke="#67e8f9" strokeWidth="0.5" opacity="0.45" />
        <circle cx="100" cy="58" r="3" fill="#67e8f9" opacity="0.35" />
        <rect x="99" y="56" width="2" height="4" fill="#cffafe" opacity="0.5" />
      </g>

      {[72, 128].map((x) => {
        const flameCy = 73;
        return (
          <g key={`torch-${x}`}>
            <rect x={x - 1} y="78" width="2" height="4" fill="#2b261d" />
            <rect x={x - 2} y="76" width="4" height="2" fill="#2b261d" />
            <g transform={`translate(${x}, ${flameCy})`}>
              <circle
                cx={FLAME_DOT.introSconce.cx}
                cy={FLAME_DOT.introSconce.cy}
                r={FLAME_GLOW_R.introSconce}
                fill="#fbbf24"
                opacity="0.14"
                className={glowClass}
                style={FLAME_ORIGIN_STYLE}
              />
              <rect x={-1} y={-1} width="2" height="5" fill="#fcd34d" opacity="0.85" className={glowClass} />
              <rect x={-0.5} y={-3} width="1" height="3" fill="#fef3c7" />
            </g>
          </g>
        );
      })}

      <ellipse
        cx="100"
        cy="10"
        rx="14"
        ry="5"
        fill="#080610"
        opacity="0.45"
        className={reduce ? "" : "tower-intro-shadow-drift"}
      />
      <ellipse cx="104" cy="9" rx="2" ry="3" fill="#1a1428" opacity="0.35" />
    </>
  );
}

const ALICE_HAT = "#7c3aed";
const ALICE_HAT_DK = "#5b21b6";
const ALICE_ROBE = "#6d28d9";
const ALICE_ROBE_LT = "#a78bfa";
const ALICE_SKIN = "#f1c9a5";
const ALICE_SKIN_DK = "#d9a87f";
const ALICE_WOOD = "#8a5a2b";
const BOB_ROBE = "#0d9488";
const BOB_ROBE_DK = "#115e59";
const BOB_ROBE_LT = "#2dd4bf";
const BOB_SKIN = "#f1c9a5";
const BOB_BOOK = "#b45309";
const BOB_BOOK_DK = "#7c2d12";
const BOB_PAGE = "#fef3c7";

function IllustrationAlice({
  x,
  y,
  scale = 0.4,
  signal,
  journal,
  lantern,
  walking,
  reduce = false,
}: {
  x: number;
  y: number;
  scale?: number;
  signal?: boolean;
  journal?: boolean;
  lantern?: boolean;
  walking?: boolean;
  reduce?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})${walking ? " rotate(-8 16 44)" : ""}`}>
      <ellipse cx="16" cy="44.5" rx="9" ry="1.6" fill="#000" opacity="0.35" />
      <rect x="9" y="26" width="14" height="16" fill={ALICE_ROBE} />
      <rect x="7" y="40" width="18" height="3" fill={ALICE_ROBE} />
      <rect x="9" y="26" width="14" height="2" fill={ALICE_ROBE_LT} opacity="0.5" />
      <rect x="15" y="28" width="2" height="14" fill={ALICE_ROBE_LT} opacity="0.6" />
      <rect x="9" y="33" width="14" height="2" fill={ALICE_HAT_DK} />
      <rect x="14" y="33" width="3" height="2" fill="#67e8f9" />
      <rect x="6" y="28" width="3" height="8" fill={ALICE_ROBE} />
      {signal ? (
        <>
          <rect x="22" y="20" width="3" height="9" fill={ALICE_ROBE} />
          <rect x="24" y="18" width="3" height="3" fill={ALICE_SKIN} />
        </>
      ) : (
        <>
          <rect x="22" y="24" width="3" height="7" fill={ALICE_ROBE} />
          <rect x="24" y="22" width="3" height="3" fill={ALICE_SKIN} />
        </>
      )}
      <rect x="11" y="16" width="10" height="9" fill={ALICE_SKIN} />
      <rect x="11" y="16" width="10" height="2" fill={ALICE_SKIN_DK} opacity="0.4" />
      <rect x="13" y="20" width="2" height="2" fill="#1e1b4b" />
      <rect x="18" y="20" width="2" height="2" fill="#1e1b4b" />
      <rect x="14" y="2" width="4" height="3" fill={ALICE_HAT} />
      <rect x="13" y="5" width="6" height="3" fill={ALICE_HAT} />
      <rect x="12" y="8" width="8" height="3" fill={ALICE_HAT} />
      <rect x="11" y="11" width="10" height="3" fill={ALICE_HAT} />
      <rect x="8" y="14" width="16" height="3" fill={ALICE_HAT_DK} />
      <rect x="11" y="12" width="10" height="2" fill="#fbbf24" />
      <rect x="15" y="2" width="2" height="2" fill="#fde68a" />
      {signal && (
        <>
          <rect x="25" y="9" width="2" height="13" fill={ALICE_WOOD} />
          <rect x="25" y="7" width="2" height="2" fill="#c8975a" />
          <rect x="23" y="4" width="6" height="6" fill="#67e8f9" opacity="0.35" />
          <rect x="24.5" y="5.5" width="3" height="3" fill="#67e8f9" />
          <rect x="25.5" y="6.5" width="1" height="1" fill="#fff" />
        </>
      )}
      {journal && (
        <>
          <rect x="2" y="30" width="5" height="7" fill={BOB_BOOK} />
          <rect x="3" y="31" width="3" height="5" fill={BOB_PAGE} />
          <line x1="4" y1="32" x2="5" y2="35" stroke={BOB_BOOK_DK} strokeWidth="0.5" />
        </>
      )}
      {lantern && (
        <g transform="translate(25, 17)">
          <circle
            cx={FLAME_DOT.lantern.cx}
            cy={FLAME_DOT.lantern.cy}
            r={FLAME_GLOW_R.lanternOuter}
            fill="#fbbf24"
            opacity="0.18"
            className={reduce ? "" : "tower-intro-lantern-warm"}
            style={FLAME_ORIGIN_STYLE}
          />
          <circle
            cx={FLAME_DOT.lantern.cx}
            cy={FLAME_DOT.lantern.cy}
            r={FLAME_GLOW_R.lanternInner}
            fill="#fcd34d"
            opacity="0.12"
            className={reduce ? "" : "tower-intro-light-pulse"}
            style={FLAME_ORIGIN_STYLE}
          />
          <rect x={-1} y={1} width="2" height="8" fill={ALICE_WOOD} />
          <rect x={-2} y={-1} width="4" height="4" fill="#fcd34d" opacity="0.9" />
          <rect x={-1} y={0} width="2" height="2" fill="#fef3c7" opacity="0.7" />
        </g>
      )}
      {walking && (
        <>
          <rect x="8" y="41" width="4" height="3" fill={ALICE_HAT_DK} />
          <rect x="18" y="41" width="4" height="3" fill={ALICE_HAT_DK} />
        </>
      )}
    </g>
  );
}

function IllustrationBob({
  x,
  y,
  scale = 0.38,
  signal,
  maps,
  puzzled,
  walking,
}: {
  x: number;
  y: number;
  scale?: number;
  signal?: boolean;
  maps?: boolean;
  puzzled?: boolean;
  walking?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})${walking ? " rotate(8 19 48)" : ""}`}>
      <ellipse cx="19" cy="48.5" rx="11" ry="2" fill="#000" opacity="0.35" />
      <rect x="9" y="24" width="20" height="22" fill={BOB_ROBE} />
      <rect x="6" y="42" width="26" height="5" fill={BOB_ROBE} />
      <rect x="9" y="24" width="20" height="3" fill={BOB_ROBE_LT} opacity="0.5" />
      <rect x="18" y="27" width="2" height="19" fill={BOB_ROBE_LT} opacity="0.45" />
      <rect x="9" y="34" width="20" height="2" fill={BOB_ROBE_DK} />
      <rect x="24" y="33" width="6" height="7" fill={BOB_BOOK_DK} />
      {signal ? (
        <>
          <rect x="5" y="24" width="5" height="10" fill={BOB_ROBE} />
          <rect x="6" y="22" width="4" height="3" fill={BOB_SKIN} />
        </>
      ) : (
        <>
          <rect x="5" y="26" width="5" height="12" fill={BOB_ROBE} />
          <rect x="6" y="36" width="4" height="3" fill={BOB_SKIN} />
        </>
      )}
      <rect x="28" y="26" width="5" height="12" fill={BOB_ROBE} />
      <rect x="28" y="36" width="4" height="3" fill={BOB_SKIN} />
      <rect x="11" y="9" width="16" height="14" fill={BOB_SKIN} />
      <rect x="11" y="9" width="16" height="2" fill="#d9a87f" opacity="0.4" />
      <rect x="10" y="4" width="18" height="6" fill={BOB_ROBE_DK} />
      <rect x="9" y="8" width="20" height="3" fill={BOB_ROBE_DK} />
      <rect x="13" y="15" width="4" height="3" fill="#0f172a" />
      <rect x="21" y="15" width="4" height="3" fill="#0f172a" />
      <rect x="17" y="16" width="4" height="1" fill="#0f172a" />
      <rect x="14" y="16" width="2" height="1" fill="#bae6fd" />
      <rect x="22" y="16" width="2" height="1" fill="#bae6fd" />
      <rect x="15" y="21" width="8" height="2" fill="#e7e5e4" opacity="0.8" />
      {puzzled && <rect x="24" y="2" width="1" height="3" fill={BOB_ROBE_DK} />}
      {signal && (
        <>
          <rect x="2" y="20" width="3" height="2" fill={BOB_SKIN} />
          <rect x="0" y="18" width="2" height="3" fill={BOB_SKIN} />
          <rect x="-1" y="16" width="2" height="2" fill="#67e8f9" opacity="0.7" />
        </>
      )}
      {!signal && !maps && (
        <>
          <path d="M9 34 L19 32 L19 44 L9 45 Z" fill={BOB_BOOK} />
          <path d="M29 34 L19 32 L19 44 L29 45 Z" fill={BOB_BOOK} />
          <path d="M11 35 L19 33.5 L19 43 L11 44 Z" fill={BOB_PAGE} />
          <path d="M27 35 L19 33.5 L19 43 L27 44 Z" fill={BOB_PAGE} />
        </>
      )}
      {maps && (
        <>
          <rect x="30" y="28" width="7" height="9" fill="#d4a574" opacity="0.85" />
          <line x1="31" y1="30" x2="35" y2="34" stroke="#8b6914" strokeWidth="0.5" />
          <line x1="32" y1="32" x2="34" y2="30" stroke="#8b6914" strokeWidth="0.5" />
          <line x1="31" y1="34" x2="35" y2="32" stroke="#8b6914" strokeWidth="0.5" />
        </>
      )}
      {walking && (
        <>
          <rect x="7" y="43" width="5" height="3" fill={BOB_ROBE_DK} />
          <rect x="24" y="43" width="5" height="3" fill={BOB_ROBE_DK} />
        </>
      )}
    </g>
  );
}

function MountainRange() {
  return (
    <>
      <polygon points="0,74 32,42 64,74" fill="#3d4a5c" opacity="0.65" />
      <polygon points="0,74 18,52 36,74" fill="#4a5668" opacity="0.4" />
      <polygon points="44,74 96,24 148,74" fill="#2b3544" opacity="0.9" />
      <polygon points="72,74 96,38 120,74" fill="#354050" opacity="0.5" />
      <polygon points="112,74 152,40 192,74" fill="#3d4a5c" opacity="0.7" />
      <polygon points="160,74 176,50 192,74" fill="#4a5668" opacity="0.45" />
      <rect x="92" y="68" width="16" height="6" fill="#2b3544" opacity="0.3" />
    </>
  );
}

function Cloud({ x, y, w, reduce, delay }: { x: number; y: number; w: number; reduce: boolean; delay: number }) {
  return (
    <g className={reduce ? "" : `tower-intro-cloud-drift tower-intro-cloud-drift-${delay + 1}`}>
      <rect x={x} y={y + 4} width={w} height={8} fill="#d4dce8" opacity="0.55" rx="2" />
      <rect x={x + 6} y={y} width={w * 0.55} height={10} fill="#e8edf4" opacity="0.65" rx="2" />
      <rect x={x + w * 0.35} y={y + 2} width={w * 0.4} height={8} fill="#f0f4f8" opacity="0.5" rx="2" />
    </g>
  );
}

function SignalBeam({
  x1,
  y1,
  x2,
  y2,
  reduce,
  quiet,
  broken,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  reduce: boolean;
  quiet?: boolean;
  broken?: boolean;
}) {
  const stroke = broken ? "#f472b6" : "#67e8f9";
  const opacity = quiet ? 0.55 : broken ? 0.65 : 0.75;
  const dash = broken ? "3 5 1 4" : quiet ? "8 6" : "6 4";
  const width = quiet ? 1.5 : 2;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dash}
      opacity={opacity}
      className={reduce ? "" : broken ? "tower-intro-static-flicker" : "tower-intro-signal-pulse"}
    />
  );
}

function StoryTower({
  x,
  y,
  tall,
  distant,
  windows,
  entrance,
  lit = 0,
  ominous,
  groundBase,
}: {
  x: number;
  y: number;
  tall?: boolean;
  distant?: boolean;
  windows?: boolean;
  entrance?: boolean;
  lit?: number;
  ominous?: boolean;
  groundBase?: boolean;
}) {
  const h = ominous ? 62 : tall ? (distant ? 48 : 68) : 56;
  const w = ominous ? 18 : distant ? 12 : 18;
  const fill = ominous ? "#0a0e18" : "#1a2235";
  const stroke = ominous ? "#1a1428" : "#243049";
  const inner = ominous ? "#080c14" : "#1e293b";
  const winOpacity = ominous ? 0.2 : distant ? 0.35 : 0.3;
  const baseY = groundBase ? 12 + h : 12;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {groundBase && (
        <rect x="2" y={baseY} width={w + 4} height="4" fill="#4a5a3a" opacity="0.5" />
      )}
      <rect x="4" y="12" width={w} height={h} fill={fill} stroke={stroke} strokeWidth="0.5" />
      <polygon points={`${4 + w / 2},0 ${w + 4},12 4,12`} fill={stroke} />
      <rect x="6" y="14" width={w - 4} height={h - 4} fill={inner} opacity={ominous ? 0.55 : 0.35} />
      {ominous && (
        <>
          <rect x="5" y="18" width={w - 2} height={h - 8} fill="#050810" opacity="0.4" />
          <rect x="7" y="24" width={w - 6} height="4" fill="#67e8f9" opacity="0.15" />
          <rect x="7" y="38" width={w - 6} height="4" fill="#67e8f9" opacity="0.12" />
          <rect x="7" y="52" width={w - 6} height="4" fill="#4a3a5c" opacity="0.18" />
        </>
      )}
      {entrance && (
        <>
          <rect x="6" y={12 + h - 22} width={w - 4} height="22" fill="#0f172a" />
          <path d={`M8 ${12 + h - 20} Q${4 + w / 2} ${12 + h - 28} ${w + 2} ${12 + h - 20}`} fill="#fcd34d" opacity={lit >= 1 ? 0.35 : 0.15} className={lit >= 1 ? "tower-intro-lantern-warm" : ""} />
          <rect x="8" y={12 + h - 18} width={w - 8} height="16" fill="#1e293b" />
          <rect x={4 + w / 2 - 1} y={12 + h - 10} width="2" height="4" fill="#fcd34d" opacity="0.6" />
        </>
      )}
      {windows && (
        <>
          <rect x="7" y="20" width="6" height="5" fill="#67e8f9" opacity={lit >= 1 ? 0.6 : winOpacity} className={distant && lit < 1 ? "tower-intro-window-pulse" : ""} />
          <rect x="7" y="32" width="6" height="5" fill="#67e8f9" opacity={distant ? winOpacity : 0.35} className={distant ? "tower-intro-window-pulse" : ""} />
          {!distant && (
            <>
              <rect x="7" y="44" width="6" height="5" fill="#67e8f9" opacity={lit >= 2 ? 0.7 : 0.35} />
              <rect x="7" y="56" width="6" height="5" fill="#fcd34d" opacity={lit >= 2 ? 0.45 : 0.2} />
            </>
          )}
        </>
      )}
      {!windows && !entrance && <rect x="7" y="28" width="6" height="6" fill="#67e8f9" opacity="0.4" />}
    </g>
  );
}
