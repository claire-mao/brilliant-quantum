import type { AnchorId } from "./types";

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
  // Standing in front of the wizard's home (bottom-left cabin).
  house: {
    id: "house",
    posClass: "left-16 bottom-7 sm:left-[5.5rem]",
    horizontal: "left",
    vertical: "bottom",
  },
};
