import type { AnchorId } from "./types";
import { MOBILE_SAFE } from "./anchors";

const WIZARD_SIZE = 96;
const MARGIN = 16;
const NAV_SAFE_TOP = 80;
const BOTTOM_MARGIN = 24;
const MOBILE_BREAKPOINT = 640;

/** Neighbor anchors for idle walking — each step stays near the current zone. */
const NEIGHBORS: Record<AnchorId, AnchorId[]> = {
  "top-left": ["top-center", "mid-left", "center-left"],
  "top-center": ["top-left", "top-right", "center-left", "center-right"],
  "top-right": ["top-center", "mid-right", "center-right"],
  "mid-left": ["top-left", "center-left", "bottom-left"],
  "mid-right": ["top-right", "center-right", "bottom-right"],
  "center-left": ["top-left", "mid-left", "center-right", "bottom-left"],
  "center-right": ["top-right", "mid-right", "center-left", "bottom-right"],
  "bottom-left": ["bottom-center", "mid-left", "center-left"],
  "bottom-center": ["bottom-left", "bottom-right", "center-left", "center-right"],
  "bottom-right": ["bottom-center", "mid-right", "center-right"],
};

function isMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * Pixel position for an anchor (top-left of the wizard bounding box).
 * Mirrors the Tailwind fixed-position classes in anchors.ts.
 */
export function getAnchorPixelPosition(anchorId: AnchorId): { x: number; y: number } {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const maxX = w - WIZARD_SIZE - MARGIN;
  const maxY = h - WIZARD_SIZE - BOTTOM_MARGIN;

  switch (anchorId) {
    case "top-left":
      return { x: MARGIN, y: NAV_SAFE_TOP };
    case "top-center":
      return { x: Math.max(MARGIN, w / 2 - WIZARD_SIZE / 2), y: NAV_SAFE_TOP };
    case "top-right":
      return { x: maxX, y: NAV_SAFE_TOP };
    case "mid-left":
      return { x: MARGIN, y: Math.max(NAV_SAFE_TOP, h / 2 - WIZARD_SIZE / 2) };
    case "mid-right":
      return { x: maxX, y: Math.max(NAV_SAFE_TOP, h / 2 - WIZARD_SIZE / 2) };
    case "center-left":
      return { x: MARGIN, y: Math.max(NAV_SAFE_TOP, h / 3 - WIZARD_SIZE / 2) };
    case "center-right":
      return { x: maxX, y: Math.max(NAV_SAFE_TOP, h / 3 - WIZARD_SIZE / 2) };
    case "bottom-left":
      return { x: MARGIN, y: maxY };
    case "bottom-center":
      return { x: Math.max(MARGIN, w / 2 - WIZARD_SIZE / 2), y: maxY };
    case "bottom-right":
      return { x: maxX, y: maxY };
  }
}

/** Pick a neighboring safe anchor for idle walking. */
export function getNeighborAnchor(current: AnchorId): AnchorId {
  const pool = isMobile()
    ? NEIGHBORS[current].filter((id) => MOBILE_SAFE.includes(id))
    : NEIGHBORS[current];
  const candidates = pool.length > 0 ? pool : isMobile() ? MOBILE_SAFE : NEIGHBORS[current];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Random delay between idle walks (12–25 s). */
export function nextWalkDelayMs(): number {
  return 12000 + Math.floor(Math.random() * 13000);
}

export { WIZARD_SIZE, MARGIN, NAV_SAFE_TOP, BOTTOM_MARGIN };
