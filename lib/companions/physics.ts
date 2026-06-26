/** Physics values passed to the wizard SVG during drag / settle. */

export interface WizardPhysics {
  tilt: number;
  sway: number;
  hatLag: number;
  wandLag: number;
  armLag: number;
  robeLag: number;
}

export const PHYSICS_IDLE: WizardPhysics = {
  tilt: 0,
  sway: 0,
  hatLag: 0,
  wandLag: 0,
  armLag: 0,
  robeLag: 0,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute layered lag rotations from horizontal drag velocity and direction changes.
 * Each body part trails the pointer slightly for a floppy, robe-like feel.
 */
export function computeWizardPhysics(
  velocityX: number,
  prevVelocityX: number,
  reduce: boolean
): WizardPhysics {
  if (reduce) return PHYSICS_IDLE;

  const tilt = clamp(velocityX * 2.1, -32, 32);
  const directionFlip = Math.sign(velocityX) !== Math.sign(prevVelocityX) && Math.abs(velocityX) > 0.8;
  const sway = clamp(
    tilt * 0.35 + (directionFlip ? Math.sign(velocityX) * 6 : 0),
    -14,
    14
  );

  return {
    tilt,
    sway,
    hatLag: clamp(tilt * 1.28 + sway * 0.4, -38, 38),
    wandLag: clamp(tilt * 0.72 - sway * 0.55, -26, 26),
    armLag: clamp(tilt * 0.95 + sway * 0.25, -30, 30),
    robeLag: clamp(tilt * 1.05 - sway * 0.15, -34, 34),
  };
}

export function physicsToStyle(physics: WizardPhysics): Record<string, string> {
  return {
    "--wizard-tilt": `${physics.tilt.toFixed(2)}deg`,
    "--wizard-sway": `${physics.sway.toFixed(2)}deg`,
    "--hat-lag": `${physics.hatLag.toFixed(2)}deg`,
    "--wand-lag": `${physics.wandLag.toFixed(2)}deg`,
    "--arm-lag": `${physics.armLag.toFixed(2)}deg`,
    "--robe-lag": `${physics.robeLag.toFixed(2)}deg`,
  };
}
