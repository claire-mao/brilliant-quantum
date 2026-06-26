/**
 * Pure two-qubit state-vector engine over the basis |00>, |01>, |10>, |11>
 * (indices 0..3, where q0 is the high bit). Supports X / H / Z on either qubit
 * and CNOT (control q0, target q1). Amplitudes start real and stay real under
 * this gate set, but the model carries an imaginary part for completeness.
 *
 * Shared by TwoQubitExplorer, BellStateBuilder, CorrelationVisualizer, and any
 * later multi-qubit interactions. Keep this module pure (no React, no DOM); the
 * only impure helpers are the clearly-named samplers that call Math.random.
 */

export type TwoQubitGate = "X" | "H" | "Z" | "CNOT";
export type Qubit = 0 | 1;

export interface TwoQubitOp {
  gate: TwoQubitGate;
  /** Target qubit for X/H/Z. Ignored for CNOT (control q0, target q1). */
  qubit: Qubit;
}

export interface Amps {
  re: number[];
  im: number[];
}

export const OUTCOME_LABELS = ["00", "01", "10", "11"] as const;
const INV_SQRT2 = 1 / Math.SQRT2;
const EPS = 1e-6;

function close(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-4;
}

/** Bit value (0/1) of basis index `i` for the given qubit. */
export function bitOf(i: number, q: Qubit): number {
  return q === 0 ? (i >> 1) & 1 : i & 1;
}
function flipBit(i: number, q: Qubit): number {
  return q === 0 ? i ^ 0b10 : i ^ 0b01;
}
function swap(amps: Amps, a: number, b: number): void {
  [amps.re[a], amps.re[b]] = [amps.re[b], amps.re[a]];
  [amps.im[a], amps.im[b]] = [amps.im[b], amps.im[a]];
}

/** A computational basis state |startIndex>, default |00>. */
export function initialAmps(startIndex = 0): Amps {
  const re = [0, 0, 0, 0];
  const im = [0, 0, 0, 0];
  re[startIndex] = 1;
  return { re, im };
}

function applyOp(amps: Amps, op: TwoQubitOp): void {
  if (op.gate === "CNOT") {
    swap(amps, 2, 3); // control q0 = 1 -> flip q1
    return;
  }
  const q = op.qubit;
  if (op.gate === "X") {
    for (let i = 0; i < 4; i++) if (bitOf(i, q) === 0) swap(amps, i, flipBit(i, q));
    return;
  }
  if (op.gate === "Z") {
    for (let i = 0; i < 4; i++)
      if (bitOf(i, q) === 1) {
        amps.re[i] = -amps.re[i];
        amps.im[i] = -amps.im[i];
      }
    return;
  }
  // Hadamard
  for (let i = 0; i < 4; i++) {
    if (bitOf(i, q) === 0) {
      const j = flipBit(i, q);
      const ar = amps.re[i];
      const ai = amps.im[i];
      const br = amps.re[j];
      const bi = amps.im[j];
      amps.re[i] = (ar + br) * INV_SQRT2;
      amps.im[i] = (ai + bi) * INV_SQRT2;
      amps.re[j] = (ar - br) * INV_SQRT2;
      amps.im[j] = (ai - bi) * INV_SQRT2;
    }
  }
}

/** Replay an op list from |startIndex> and return the resulting amplitudes. */
export function applyOps(ops: TwoQubitOp[], startIndex = 0): Amps {
  const amps = initialAmps(startIndex);
  for (const op of ops) applyOp(amps, op);
  return amps;
}

/** Outcome probabilities for the four basis states. */
export function probabilities(amps: Amps): number[] {
  return amps.re.map((r, i) => r * r + amps.im[i] * amps.im[i]);
}

/** Marginal probability (percent) that each qubit measures 1. */
export function marginals(amps: Amps): { q0: number; q1: number } {
  const p = probabilities(amps);
  return {
    q0: Math.round((p[2] + p[3]) * 100),
    q1: Math.round((p[1] + p[3]) * 100),
  };
}

/**
 * A pure two-qubit state is separable iff the amplitude "determinant"
 * a00*a11 - a01*a10 vanishes; otherwise it is entangled.
 */
export function isEntangled(amps: Amps): boolean {
  const { re, im } = amps;
  const detRe = re[0] * re[3] - im[0] * im[3] - (re[1] * re[2] - im[1] * im[2]);
  const detIm = re[0] * im[3] + im[0] * re[3] - (re[1] * im[2] + im[1] * re[2]);
  return Math.hypot(detRe, detIm) > 1e-4;
}

/** Project onto `qubit == outcome` and renormalize (post-measurement state). */
export function collapse(amps: Amps, qubit: Qubit, outcome: number): Amps {
  const re = [...amps.re];
  const im = [...amps.im];
  let norm = 0;
  for (let i = 0; i < 4; i++) {
    if (bitOf(i, qubit) !== outcome) {
      re[i] = 0;
      im[i] = 0;
    } else {
      norm += re[i] * re[i] + im[i] * im[i];
    }
  }
  const s = norm > EPS ? 1 / Math.sqrt(norm) : 0;
  return { re: re.map((x) => x * s), im: im.map((x) => x * s) };
}

const KETS = ["|00\\rangle", "|01\\rangle", "|10\\rangle", "|11\\rangle"];

export function basisKetLatex(i: number): string {
  return KETS[i];
}

function coeffLatex(mag: number): string {
  if (close(mag, 1)) return "";
  if (close(mag, INV_SQRT2)) return "\\tfrac{1}{\\sqrt2}";
  if (close(mag, 0.5)) return "\\tfrac{1}{2}";
  return mag.toFixed(2);
}

/** LaTeX for the joint state, factoring a common coefficient when possible. */
export function jointStateLatex(amps: Amps): string {
  const terms: { sign: string; mag: number; ket: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const mag = Math.hypot(amps.re[i], amps.im[i]);
    if (mag < EPS) continue;
    terms.push({ sign: amps.re[i] < 0 ? "-" : "+", mag, ket: KETS[i] });
  }
  if (terms.length === 0) return "0";

  const allEqual = terms.every((t) => close(t.mag, terms[0].mag));
  if (terms.length > 1 && allEqual) {
    const inner = terms
      .map((t, idx) => (idx === 0 ? (t.sign === "-" ? "-" : "") : ` ${t.sign} `) + t.ket)
      .join("");
    return `${coeffLatex(terms[0].mag)}\\left(${inner}\\right)`;
  }
  return terms
    .map((t, idx) => {
      const c = coeffLatex(t.mag);
      return (idx === 0 ? (t.sign === "-" ? "-" : "") : ` ${t.sign} `) + c + t.ket;
    })
    .join("");
}

// --- Bell states -----------------------------------------------------------

export type BellId = "phi+" | "phi-" | "psi+" | "psi-";

export const BELL_TARGETS: Record<
  BellId,
  { label: string; latex: string; vec: number[] }
> = {
  "phi+": {
    label: "Φ+",
    latex: "|\\Phi^+\\rangle = \\tfrac{1}{\\sqrt2}(|00\\rangle + |11\\rangle)",
    vec: [INV_SQRT2, 0, 0, INV_SQRT2],
  },
  "phi-": {
    label: "Φ−",
    latex: "|\\Phi^-\\rangle = \\tfrac{1}{\\sqrt2}(|00\\rangle - |11\\rangle)",
    vec: [INV_SQRT2, 0, 0, -INV_SQRT2],
  },
  "psi+": {
    label: "Ψ+",
    latex: "|\\Psi^+\\rangle = \\tfrac{1}{\\sqrt2}(|01\\rangle + |10\\rangle)",
    vec: [0, INV_SQRT2, INV_SQRT2, 0],
  },
  "psi-": {
    label: "Ψ−",
    latex: "|\\Psi^-\\rangle = \\tfrac{1}{\\sqrt2}(|01\\rangle - |10\\rangle)",
    vec: [0, INV_SQRT2, -INV_SQRT2, 0],
  },
};

/** Normalize an overall sign so the first nonzero amplitude is positive. */
function signNormalize(re: number[]): number[] {
  const i = re.findIndex((x) => Math.abs(x) > EPS);
  if (i < 0) return re;
  const s = re[i] < 0 ? -1 : 1;
  return re.map((x) => x * s);
}

/** True if `amps` equals the target Bell state up to an overall phase. */
export function matchesBell(amps: Amps, id: BellId): boolean {
  if (amps.im.some((x) => Math.abs(x) > 1e-3)) return false;
  const cur = signNormalize(amps.re);
  const tgt = signNormalize(BELL_TARGETS[id].vec);
  return cur.every((x, i) => Math.abs(x - tgt[i]) < 1e-3);
}

// --- Samplers (impure: call Math.random) -----------------------------------

/** Sample a single basis-state index 0..3 from the probability distribution. */
export function sampleIndex(probs: number[]): number {
  const r = Math.random();
  let cum = 0;
  for (let i = 0; i < 4; i++) {
    cum += probs[i];
    if (r < cum) return i;
  }
  return 3;
}

/** Sample `shots` joint measurements into 00/01/10/11 counts. */
export function sampleCounts(probs: number[], shots: number): number[] {
  const counts = [0, 0, 0, 0];
  for (let s = 0; s < shots; s++) counts[sampleIndex(probs)] += 1;
  return counts;
}
