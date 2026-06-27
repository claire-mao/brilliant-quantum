/**
 * Minimal single-qubit model over the four states reachable from |0> with the
 * X, H, and Z gates (global phase ignored, which never affects measurement).
 * This is enough to teach bit flips (X), phase flips (Z, |+> <-> |->), and
 * superposition with reversibility (H, with HH = I). Pure and deterministic.
 */
export type QState = "0" | "1" | "+" | "-";
export type Gate1 = "X" | "H" | "Z";
export type Outcome = "0" | "1" | "mix";

const X_MAP: Record<QState, QState> = { "0": "1", "1": "0", "+": "+", "-": "-" };
const Z_MAP: Record<QState, QState> = { "0": "0", "1": "1", "+": "-", "-": "+" };
const H_MAP: Record<QState, QState> = { "0": "+", "1": "-", "+": "0", "-": "1" };

export function applyGate(state: QState, gate: Gate1): QState {
  if (gate === "X") return X_MAP[state];
  if (gate === "Z") return Z_MAP[state];
  return H_MAP[state];
}

export function applySequence(start: QState, gates: Gate1[]): QState {
  return gates.reduce((state, gate) => applyGate(state, gate), start);
}

/** Z-basis measurement: definite 0/1, or 50/50 for an equator state. */
export function measureOutcome(state: QState): Outcome {
  if (state === "0") return "0";
  if (state === "1") return "1";
  return "mix";
}

/** Probability of measuring 1, as a percentage. */
export function pOne(state: QState): number {
  if (state === "1") return 100;
  if (state === "0") return 0;
  return 50;
}

/** LaTeX ket for a state, e.g. "|+\\rangle". */
export function stateKetLatex(state: QState): string {
  const kets: Record<QState, string> = {
    "0": "|0\\rangle",
    "1": "|1\\rangle",
    "+": "|+\\rangle",
    "-": "|-\\rangle",
  };
  return kets[state];
}
