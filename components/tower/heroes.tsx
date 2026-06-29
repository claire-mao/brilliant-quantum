"use client";

/**
 * Alice and Bob: the Tower's heroes, drawn as pixel-art inline SVG (no image
 * assets). Alice is the learner's wizard; Bob is her scholar ally, a real
 * presence at her side (about two-thirds her height) who reads from a glowing
 * spellbook to support a hint and raises a warding shield when the enemy
 * strikes. Animations are CSS classes that freeze under prefers-reduced-motion.
 */

export type HeroState = "idle" | "cast" | "hit" | "victory" | "walk" | "kneel";
export type BobState = "idle" | "support" | "block" | "walk" | "defeated";

const HAT = "#7c3aed";
const HAT_DK = "#5b21b6";
const ROBE = "#6d28d9";
const ROBE_LT = "#a78bfa";
const SKIN = "#f1c9a5";
const SKIN_DK = "#d9a87f";
const WOOD = "#8a5a2b";

export function Alice({
  state = "idle",
  wandGlow = "#67e8f9",
  reduce = false,
  className = "h-24 w-auto",
}: {
  state?: HeroState;
  wandGlow?: string;
  reduce?: boolean;
  className?: string;
}) {
  const bodyAnim = reduce
    ? ""
    : state === "cast"
      ? "alice-cast"
      : state === "hit"
        ? "alice-hit"
        : state === "victory"
          ? "alice-victory"
          : state === "walk"
            ? "alice-walk"
            : state === "kneel"
              ? "alice-kneel"
              : "alice-idle";
  const casting = state === "cast" || state === "victory";

  return (
    <svg
      viewBox="0 0 32 46"
      className={`${className} overflow-visible`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Alice, your wizard"
    >
      <g className={bodyAnim} style={{ transformBox: "fill-box", transformOrigin: "16px 44px" }}>
        {/* shadow */}
        <ellipse cx="16" cy="44.5" rx="9" ry="1.6" fill="#000" opacity="0.35" />

        {/* robe body + flare */}
        <rect x="9" y="26" width="14" height="16" fill={ROBE} />
        <rect x="7" y="40" width="18" height="3" fill={ROBE} />
        <rect x="9" y="26" width="14" height="2" fill={ROBE_LT} opacity="0.5" />
        <rect x="15" y="28" width="2" height="14" fill={ROBE_LT} opacity="0.6" />
        {/* belt */}
        <rect x="9" y="33" width="14" height="2" fill={HAT_DK} />
        <rect x="14" y="33" width="3" height="2" fill={wandGlow} />

        {/* left arm (holding side) */}
        <rect x="6" y="28" width="3" height="8" fill={ROBE} />
        {/* right arm raised toward the wand */}
        <rect x="22" y="24" width="3" height="7" fill={ROBE} />
        <rect x="24" y="22" width="3" height="3" fill={SKIN} />

        {/* face */}
        <rect x="11" y="16" width="10" height="9" fill={SKIN} />
        <rect x="11" y="16" width="10" height="2" fill={SKIN_DK} opacity="0.4" />
        {/* eyes */}
        <rect x="13" y="20" width="2" height="2" fill="#1e1b4b" />
        <rect x="18" y="20" width="2" height="2" fill="#1e1b4b" />

        {/* hat: stacked pixel cone + brim */}
        <rect x="14" y="2" width="4" height="3" fill={HAT} />
        <rect x="13" y="5" width="6" height="3" fill={HAT} />
        <rect x="12" y="8" width="8" height="3" fill={HAT} />
        <rect x="11" y="11" width="10" height="3" fill={HAT} />
        <rect x="8" y="14" width="16" height="3" fill={HAT_DK} />
        {/* hat band + star */}
        <rect x="11" y="12" width="10" height="2" fill="#fbbf24" />
        <rect x="15" y="2" width="2" height="2" fill="#fde68a" className={reduce ? "" : "alice-star"} />

        {/* wand: from raised hand up-right, with a glowing tip */}
        <g className={reduce ? "" : casting ? "alice-wand-cast" : "alice-wand"} style={{ transformBox: "fill-box", transformOrigin: "25px 23px" }}>
          <rect x="25" y="11" width="2" height="13" fill={WOOD} />
          <rect x="25" y="9" width="2" height="2" fill="#c8975a" />
          {/* glowing tip */}
          <rect
            x="23"
            y="6"
            width="6"
            height="6"
            fill={wandGlow}
            opacity="0.35"
            className={reduce ? "" : "alice-wand-glow"}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
          <rect x="24.5" y="7.5" width="3" height="3" fill={wandGlow} />
          <rect x="25.5" y="8.5" width="1" height="1" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

const BOB_ROBE = "#0d9488";
const BOB_ROBE_DK = "#115e59";
const BOB_ROBE_LT = "#2dd4bf";
const BOOK = "#b45309";
const BOOK_DK = "#7c2d12";
const PAGE = "#fef3c7";
const SHIELD_GLOW = "#5eead4";

/**
 * Bob: Alice's scholar ally. Larger than before so he reads as a true companion.
 *  - "support": he lifts his open spellbook and its pages flare (hint requested)
 *  - "block": he braces and a warding shield flares in front (enemy attacks)
 *  - "walk": stepping gait used during the climb between floors
 */
export function Bob({
  state = "idle",
  reduce = false,
  className = "h-20 w-auto",
}: {
  state?: BobState;
  reduce?: boolean;
  className?: string;
}) {
  const bodyAnim = reduce
    ? ""
    : state === "block"
      ? "bob-block"
      : state === "walk"
        ? "bob-walk"
        : state === "support"
          ? "bob-support"
          : state === "defeated"
            ? "bob-defeated"
            : "bob-idle";
  const supporting = state === "support";
  const blocking = state === "block";

  return (
    <svg
      viewBox="0 0 38 50"
      className={`${className} overflow-visible`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Bob, your scholar ally"
    >
      <g className={bodyAnim} style={{ transformBox: "fill-box", transformOrigin: "19px 48px" }}>
        {/* shadow */}
        <ellipse cx="19" cy="48.5" rx="11" ry="2" fill="#000" opacity="0.35" />

        {/* robe body */}
        <rect x="9" y="24" width="20" height="22" fill={BOB_ROBE} />
        <rect x="6" y="42" width="26" height="5" fill={BOB_ROBE} />
        <rect x="9" y="24" width="20" height="3" fill={BOB_ROBE_LT} opacity="0.5" />
        <rect x="18" y="27" width="2" height="19" fill={BOB_ROBE_LT} opacity="0.45" />
        {/* belt + satchel */}
        <rect x="9" y="34" width="20" height="2" fill={BOB_ROBE_DK} />
        <rect x="24" y="33" width="6" height="7" fill={BOOK_DK} />

        {/* shoulders / arms cradling the book */}
        <rect x="5" y="26" width="5" height="12" fill={BOB_ROBE} />
        <rect x="28" y="26" width="5" height="12" fill={BOB_ROBE} />
        <rect x="6" y="36" width="4" height="3" fill={SKIN} />
        <rect x="28" y="36" width="4" height="3" fill={SKIN} />

        {/* head + short hood/cap */}
        <rect x="11" y="9" width="16" height="14" fill={SKIN} />
        <rect x="11" y="9" width="16" height="2" fill={SKIN_DK} opacity="0.4" />
        <rect x="10" y="4" width="18" height="6" fill={BOB_ROBE_DK} />
        <rect x="9" y="8" width="20" height="3" fill={BOB_ROBE_DK} />
        {/* round spectacles + eyes (the scholar) */}
        <rect x="13" y="15" width="4" height="3" fill="#0f172a" />
        <rect x="21" y="15" width="4" height="3" fill="#0f172a" />
        <rect x="17" y="16" width="4" height="1" fill="#0f172a" />
        <rect x="14" y="16" width="2" height="1" fill="#bae6fd" />
        <rect x="22" y="16" width="2" height="1" fill="#bae6fd" />
        {/* small beard */}
        <rect x="15" y="21" width="8" height="2" fill="#e7e5e4" opacity="0.8" />

        {/* warding shield (appears when blocking) */}
        {blocking && (
          <g className={reduce ? "" : "bob-ward"} style={{ transformBox: "fill-box", transformOrigin: "1px 33px" }}>
            <path d="M0 22 L10 22 L10 36 Q5 42 0 36 Z" fill={SHIELD_GLOW} opacity="0.28" />
            <path d="M2 24 L8 24 L8 35 Q5 39 2 35 Z" fill="none" stroke={SHIELD_GLOW} strokeWidth="1.5" />
            <rect x="4" y="27" width="2" height="6" fill={SHIELD_GLOW} opacity="0.7" />
          </g>
        )}

        {/* open spellbook held in front (glows when supporting) */}
        <g className={reduce ? "" : supporting ? "bob-book-cast" : "bob-book"} style={{ transformBox: "fill-box", transformOrigin: "19px 36px" }}>
          {supporting && (
            <rect x="6" y="28" width="26" height="16" rx="2" fill={SHIELD_GLOW} opacity="0.3" className={reduce ? "" : "bob-book-glow"} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          )}
          {/* covers */}
          <path d="M9 34 L19 32 L19 44 L9 45 Z" fill={BOOK} />
          <path d="M29 34 L19 32 L19 44 L29 45 Z" fill={BOOK} />
          <path d="M9 34 L19 32 L19 44 L9 45 Z" fill="none" stroke={BOOK_DK} strokeWidth="1" />
          <path d="M29 34 L19 32 L19 44 L29 45 Z" fill="none" stroke={BOOK_DK} strokeWidth="1" />
          {/* pages */}
          <path d="M11 35 L19 33.5 L19 43 L11 44 Z" fill={PAGE} />
          <path d="M27 35 L19 33.5 L19 43 L27 44 Z" fill={PAGE} />
          <rect x="13" y="36" width="4" height="1" fill={BOOK_DK} opacity="0.5" />
          <rect x="13" y="38" width="5" height="1" fill={BOOK_DK} opacity="0.5" />
          <rect x="21" y="36" width="4" height="1" fill={BOOK_DK} opacity="0.5" />
          <rect x="21" y="38" width="5" height="1" fill={BOOK_DK} opacity="0.5" />
          {/* a rune of knowledge rising from the page when supporting */}
          {supporting && (
            <rect x="18" y="26" width="3" height="3" fill="#fde68a" className={reduce ? "" : "bob-spark"} />
          )}
        </g>
      </g>
    </svg>
  );
}
