/** Pin SVG scale animations to the flame center (used with torch-glow breathing). */
export const FLAME_ORIGIN_STYLE = {
  transformBox: "fill-box" as const,
  transformOrigin: "center",
};

/**
 * Rest radii for circular flame glows — sized to hug pixel flame stacks at rest
 * (torch-glow anim scales ~0.88–1.12 on top of these).
 */
export const FLAME_GLOW_R = {
  /** Wall sconce / jamb torch (TowerGate, intro door) */
  sconce: 8,
  /** Wall-mounted bracket torch (DungeonScene) */
  wallTorch: 11,
  /** Free-standing floor candle (DungeonScene) */
  floorCandle: 7,
  /** Book-scale intro door sconce */
  introSconce: 5,
  /** Hand lantern outer / inner halos */
  lanternOuter: 9,
  lanternInner: 5,
} as const;

/**
 * Bright flame-tip center in each flame group's local coords (translate origin
 * unchanged). Glow circles use these so the halo sits on the white core pixel.
 */
export const FLAME_DOT = {
  /** #e0f2fe rect 2×6 @ (-1,-7) */
  sconce: { cx: 0, cy: -4 },
  /** #fff7ed rect 4×6 @ (-1,-10) */
  wallTorch: { cx: 1, cy: -7 },
  /** #fff7ed rect 1.5×4 @ (-0.5,-4) */
  floorCandle: { cx: 0.25, cy: -2 },
  /** #fef3c7 rect 1×3 @ (-0.5,-3) */
  introSconce: { cx: 0, cy: -1.5 },
  /** #fef3c7 rect 2×2 @ (-1,0) in lantern group */
  lantern: { cx: 0, cy: 1 },
} as const;
