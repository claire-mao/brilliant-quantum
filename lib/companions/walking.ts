import type { AnchorId } from "./types";

const WIZARD_SIZE = 96;
const MARGIN = 16;
const NAV_SAFE_TOP = 80;
const BOTTOM_MARGIN = 24;
const MOBILE_BREAKPOINT = 640;

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
    case "house":
      // Centered in front of the bottom-left cabin (matches "house" posClass).
      return { x: isMobile() ? 64 : 88, y: maxY };
  }
}

export { WIZARD_SIZE, MARGIN, NAV_SAFE_TOP, BOTTOM_MARGIN };
