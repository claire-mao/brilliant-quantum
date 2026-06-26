import type { AnchorId, ContextKind } from "./types";

/**
 * Predefined floating anchor positions around the viewport. Each anchor is a
 * fixed-position class plus the bubble layout it implies (which side of the
 * wizard the speech bubble sits, and which way its arrow points). The manager
 * only ever chooses from these — never arbitrary pixel coordinates.
 */
export interface Anchor {
  id: AnchorId;
  /** Tailwind fixed-position classes (includes any centering translate). */
  posClass: string;
  horizontal: "left" | "center" | "right";
  /** "top" => bubble below the wizard; "bottom" => bubble above the wizard. */
  vertical: "top" | "bottom";
}

export const ANCHORS: Record<AnchorId, Anchor> = {
  "top-left": { id: "top-left", posClass: "left-4 top-20", horizontal: "left", vertical: "top" },
  "top-center": {
    id: "top-center",
    posClass: "left-1/2 top-20 -translate-x-1/2",
    horizontal: "center",
    vertical: "top",
  },
  "top-right": { id: "top-right", posClass: "right-4 top-20", horizontal: "right", vertical: "top" },
  "mid-left": {
    id: "mid-left",
    posClass: "left-4 top-1/2 -translate-y-1/2",
    horizontal: "left",
    vertical: "top",
  },
  "mid-right": {
    id: "mid-right",
    posClass: "right-4 top-1/2 -translate-y-1/2",
    horizontal: "right",
    vertical: "top",
  },
  "center-left": { id: "center-left", posClass: "left-4 top-1/3", horizontal: "left", vertical: "top" },
  "center-right": {
    id: "center-right",
    posClass: "right-4 top-1/3",
    horizontal: "right",
    vertical: "top",
  },
  "bottom-left": {
    id: "bottom-left",
    posClass: "left-4 bottom-6",
    horizontal: "left",
    vertical: "bottom",
  },
  "bottom-center": {
    id: "bottom-center",
    posClass: "left-1/2 bottom-6 -translate-x-1/2",
    horizontal: "center",
    vertical: "bottom",
  },
  "bottom-right": {
    id: "bottom-right",
    posClass: "right-4 bottom-6",
    horizontal: "right",
    vertical: "bottom",
  },
};

/**
 * Desktop candidates per context. Deliberately spread across BOTH sides and
 * corners (not just the left edge) so the wizard feels like it can appear
 * anywhere, while still favoring viewport margins that don't cover the centered
 * lesson content, the Next button, or the nav bar.
 */
const DESKTOP_ANCHORS: Record<ContextKind, AnchorId[]> = {
  // near the answer area — either side
  hint: ["mid-left", "mid-right", "center-left", "center-right", "bottom-right", "bottom-left"],
  // beside the generated exercise — lean right, but vary
  practice: ["mid-right", "center-right", "top-right", "bottom-right", "mid-left"],
  // near Learn More — lower area, either side
  "fun-fact": ["bottom-left", "bottom-right", "mid-left", "mid-right", "center-left"],
  // beside the badge — top region
  badge: ["top-center", "top-right", "top-left", "center-right", "center-left"],
  generic: [
    "top-left",
    "top-right",
    "mid-left",
    "mid-right",
    "center-left",
    "center-right",
    "bottom-left",
    "bottom-right",
  ],
};

/**
 * Mobile-safe anchors. Phone content is full width, so side positions would sit
 * over the text. Restrict to the top of content, above the action buttons, and
 * the bottom corners.
 */
export const MOBILE_SAFE: AnchorId[] = ["top-center", "bottom-center", "bottom-right", "bottom-left"];

const MOBILE_BREAKPOINT = 640;

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

function randomFrom(ids: AnchorId[]): AnchorId {
  return ids[Math.floor(Math.random() * ids.length)];
}

/**
 * Pick a random safe anchor for the wizard. Reads the viewport width (client
 * only — call after mount) to constrain mobile placement; on desktop it spreads
 * across margins on both sides so the companion can appear anywhere.
 */
export function getRandomWizardAnchor(context: ContextKind): AnchorId {
  if (isMobileViewport()) return randomFrom(MOBILE_SAFE);
  return randomFrom(DESKTOP_ANCHORS[context] ?? DESKTOP_ANCHORS.generic);
}
