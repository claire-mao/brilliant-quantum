/**
 * Tower challenge bank: graded interactions beyond multiple choice. Each chamber
 * type pulls a different kind of challenge so retrieval practice stays varied:
 *
 *   - "order"   order-the-steps (sequence the stages of a process)
 *   - "slots"   click gate chips into ordered slots (lightweight circuit build)
 *   - "mistake" identify-the-misconception (tap the false claim)
 *   - "explain" teach Alice & Bob (pick the explanation that is actually right)
 *
 * Every challenge grades to a single correct/incorrect verdict so it feeds the
 * existing recordConceptResult flow unchanged; the learning model never sees a
 * difference between these and the AI/fallback MCQs. All content is hand-written,
 * accurate, and network-free, with a generic fallback so any concept is covered.
 */

import type { Difficulty } from "@/lib/ai/validators";
import type { ConceptTag } from "@/lib/learning/concepts";

export type ChallengeKind =
  | "mcq"
  | "order"
  | "slots"
  | "mistake"
  | "explain"
  | "prediction"
  | "bloch"
  | "match"
  | "estimate"
  | "interference"
  | "fill";

interface BaseChallenge {
  prompt: string;
  explanation: string;
  difficulty: Difficulty;
  /** Recorded as the learner's misconception when answered wrong. */
  misconception?: string;
}

export interface OrderChallenge extends BaseChallenge {
  kind: "order";
  /** Steps in the CORRECT order; the UI presents a shuffled copy. */
  steps: string[];
}

export interface SlotsChallenge extends BaseChallenge {
  kind: "slots";
  /** Chips the learner can choose from (includes distractors). */
  palette: string[];
  /** The correct ordered fill for the slots. */
  solution: string[];
}

export interface MistakeChallenge extends BaseChallenge {
  kind: "mistake";
  /** Exactly one statement is flawed (the misconception to tap). */
  statements: { text: string; flawed: boolean }[];
}

export interface ExplainChallenge extends BaseChallenge {
  kind: "explain";
  options: { id: string; label: string }[];
  correctId: string;
}

export interface PredictionChallenge extends BaseChallenge {
  kind: "prediction";
  options: { id: string; label: string }[];
  correctId: string;
}

export interface BlochChallenge extends BaseChallenge {
  kind: "bloch";
  /** Polar/azimuth of the correct state (radians). */
  theta: number;
  phi: number;
  options: { id: string; label: string; theta: number; phi: number }[];
  correctId: string;
}

export interface MatchChallenge extends BaseChallenge {
  kind: "match";
  pairs: { left: string; right: string }[];
  options: { id: string; label: string }[];
  correctId: string;
}

export interface EstimateChallenge extends BaseChallenge {
  kind: "estimate";
  options: { id: string; label: string }[];
  correctId: string;
}

export interface InterferenceChallenge extends BaseChallenge {
  kind: "interference";
  options: { id: string; label: string }[];
  correctId: string;
}

export interface FillChallenge extends BaseChallenge {
  kind: "fill";
  /** Slots with one missing gate marked by "?". */
  palette: string[];
  solution: string[];
  /** Index of the slot the learner must fill (others pre-filled). */
  missingIndex: number;
}

export type LocalChallenge =
  | OrderChallenge
  | SlotsChallenge
  | MistakeChallenge
  | ExplainChallenge
  | PredictionChallenge
  | BlochChallenge
  | MatchChallenge
  | EstimateChallenge
  | InterferenceChallenge
  | FillChallenge;

/* ----------------------------------------------------------------------------
 * Deterministic seeded shuffle (pure: no Math.random, safe in render scope).
 * -------------------------------------------------------------------------- */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = items.slice();
  let s = (seed * 2654435761) >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Display order for an order-the-steps challenge (stable per seed). */
export function shuffledSteps(challenge: OrderChallenge, seed: number): string[] {
  // Guard against the rare identity shuffle so the task is never pre-solved.
  const shuffled = seededShuffle(challenge.steps, seed);
  const same = shuffled.every((s, i) => s === challenge.steps[i]);
  return same && shuffled.length > 1 ? seededShuffle(challenge.steps, seed + 7) : shuffled;
}

/* ----------------------------------------------------------------------------
 * Banks. Each is keyed by concept with a GENERIC fallback array, so any concept
 * always resolves to a usable challenge.
 * -------------------------------------------------------------------------- */

const ORDER_BANK: Partial<Record<ConceptTag, OrderChallenge[]>> = {
  measurement: [
    {
      kind: "order",
      prompt: "Order the stages of measuring a single qubit.",
      steps: [
        "Prepare the qubit in some superposition",
        "Pick a measurement basis (e.g. 0/1)",
        "Measure. The state collapses",
        "Read one definite outcome, 0 or 1",
      ],
      explanation:
        "Measurement is the bridge from amplitudes to a classical bit: a prepared state is read in a chosen basis, collapses, and yields one definite outcome.",
      difficulty: "easy",
      misconception: "Thinking a single measurement reveals the full superposition instead of collapsing it.",
    },
  ],
  entanglement: [
    {
      kind: "order",
      prompt: "Order the steps to build and use a Bell pair.",
      steps: [
        "Start with two qubits in |00\\rangle",
        "Apply H to the first qubit",
        "Apply CNOT (control first, target second)",
        "Measure. Outcomes are perfectly correlated",
      ],
      explanation:
        "H then CNOT entangles the pair into (|00\\rangle+|11\\rangle)/\\sqrt2, so measuring one instantly fixes the correlated result of the other.",
      difficulty: "medium",
      misconception: "Believing entanglement appears without an entangling (two-qubit) gate like CNOT.",
    },
  ],
  algorithms: [
    {
      kind: "order",
      prompt: "Order the shape of a typical quantum algorithm.",
      steps: [
        "Put qubits into superposition (e.g. H on each)",
        "Apply the problem's oracle / operations",
        "Use interference to amplify the right answer",
        "Measure to read the likely solution",
      ],
      explanation:
        "Quantum algorithms spread amplitude across possibilities, encode the problem, then choreograph interference so the correct answer dominates before measurement.",
      difficulty: "hard",
      misconception: "Assuming a quantum computer just reads every parallel branch at once.",
    },
  ],
  interference: [
    {
      kind: "order",
      prompt: "Order how interference produces an outcome's probability.",
      steps: [
        "List every path leading to the outcome",
        "Add the paths' amplitudes (with sign/phase)",
        "Square the magnitude of the total",
        "That value is the outcome's probability",
      ],
      explanation:
        "Amplitudes add before squaring, so equal-and-opposite paths can cancel (destructive) or reinforce (constructive). That is interference, not adding probabilities directly.",
      difficulty: "medium",
      misconception: "Adding probabilities directly instead of adding amplitudes first.",
    },
  ],
};

const ORDER_GENERIC: OrderChallenge[] = [
  {
    kind: "order",
    prompt: "Order the journey of a qubit through a tiny circuit.",
    steps: [
      "Initialize the qubit to |0\\rangle",
      "Apply a gate to transform its state",
      "Let amplitudes evolve (and possibly interfere)",
      "Measure to collapse it to a classical bit",
    ],
    explanation:
      "Initialize, transform with reversible gates, then measure: the only irreversible, randomness-introducing step is the final measurement.",
    difficulty: "easy",
    misconception: "Treating gates and measurement as the same kind of operation.",
  },
];

const SLOTS_BANK: Partial<Record<ConceptTag, SlotsChallenge[]>> = {
  superposition: [
    {
      kind: "slots",
      prompt: "Fill the slot: turn |0\\rangle into an equal superposition.",
      palette: ["H", "X", "Z", "I"],
      solution: ["H"],
      explanation:
        "The Hadamard gate maps |0\\rangle to (|0\\rangle+|1\\rangle)/\\sqrt2, an equal superposition. X only flips, Z only adds phase, I does nothing.",
      difficulty: "easy",
      misconception: "Expecting X (a bit flip) to create a superposition.",
    },
  ],
  gates: [
    {
      kind: "slots",
      prompt: "Fill both slots: a sequence that returns |0\\rangle back to |0\\rangle.",
      palette: ["H", "H", "X", "Z"],
      solution: ["H", "H"],
      explanation:
        "H is its own inverse, so H·H = I leaves the qubit unchanged. Gates are reversible. Undo a gate by applying its inverse.",
      difficulty: "medium",
      misconception: "Forgetting that many quantum gates are their own inverse.",
    },
  ],
  entanglement: [
    {
      kind: "slots",
      prompt: "Build a Bell pair from |00\\rangle: fill the two slots in order.",
      palette: ["H", "CNOT", "X", "Z"],
      solution: ["H", "CNOT"],
      explanation:
        "Hadamard on the first qubit then CNOT entangles them into (|00\\rangle+|11\\rangle)/\\sqrt2, the canonical Bell state.",
      difficulty: "medium",
      misconception: "Trying to entangle with single-qubit gates only.",
    },
  ],
  phase: [
    {
      kind: "slots",
      prompt: "On |1\\rangle, fill the slot that flips its sign (adds a \\pi phase).",
      palette: ["Z", "X", "H", "I"],
      solution: ["Z"],
      explanation:
        "Z leaves |0\\rangle alone and sends |1\\rangle to -|1\\rangle, a relative phase flip that stays hidden until interference reveals it.",
      difficulty: "medium",
      misconception: "Thinking a phase flip changes 0/1 measurement probabilities by itself.",
    },
  ],
};

const SLOTS_GENERIC: SlotsChallenge[] = [
  {
    kind: "slots",
    prompt: "Fill the slot: make an equal superposition from |0\\rangle.",
    palette: ["H", "X", "Z", "I"],
    solution: ["H"],
    explanation:
      "Hadamard builds equal superpositions from a basis state. It is the starting move of most quantum circuits.",
    difficulty: "easy",
    misconception: "Confusing the Hadamard (superposition) with X (flip).",
  },
];

const MISTAKE_BANK: Partial<Record<ConceptTag, MistakeChallenge[]>> = {
  qubits: [
    {
      kind: "mistake",
      prompt: "Three claims about qubits. Tap the false one.",
      statements: [
        { text: "A qubit can be in a superposition of |0\\rangle and |1\\rangle.", flawed: false },
        { text: "Measuring a qubit yields a definite 0 or 1.", flawed: false },
        { text: "A qubit secretly stores a number between 0 and 1 you can read out.", flawed: true },
      ],
      explanation:
        "You never read out a hidden in-between value: a measurement returns 0 or 1. The 'between' lives in amplitudes, which only show up statistically.",
      difficulty: "easy",
      misconception: "Imagining a qubit holds a readable analog value between 0 and 1.",
    },
  ],
  superposition: [
    {
      kind: "mistake",
      prompt: "One claim about superposition is false. Tap it.",
      statements: [
        { text: "An equal superposition gives ~50/50 results over many shots.", flawed: false },
        { text: "Superposition means the qubit is secretly already 0 or 1, we just don't know which.", flawed: true },
        { text: "Superposition is destroyed by measurement.", flawed: false },
      ],
      explanation:
        "Superposition is not mere ignorance of a hidden value. Interference experiments rule that out. The amplitudes genuinely coexist until measured.",
      difficulty: "medium",
      misconception: "Treating superposition as classical ignorance of a predetermined bit.",
    },
  ],
  entanglement: [
    {
      kind: "mistake",
      prompt: "Tap the false claim about entanglement.",
      statements: [
        { text: "Measuring one entangled qubit correlates with the other's result.", flawed: false },
        { text: "Entanglement lets you send a usable message faster than light.", flawed: true },
        { text: "Locally, each side's outcomes look random.", flawed: false },
      ],
      explanation:
        "No-signaling: local results are random, so no information travels faster than light. Correlations appear only when results are later compared.",
      difficulty: "hard",
      misconception: "Believing entanglement enables faster-than-light communication.",
    },
  ],
  phase: [
    {
      kind: "mistake",
      prompt: "One claim about phase is false. Tap it.",
      statements: [
        { text: "A global phase has no observable effect.", flawed: false },
        { text: "Relative phase can change interference outcomes.", flawed: false },
        { text: "Relative phase changes 0/1 probabilities even with no further gates.", flawed: true },
      ],
      explanation:
        "Relative phase is invisible to a direct 0/1 measurement; it only matters once amplitudes interfere (e.g. after a Hadamard).",
      difficulty: "medium",
      misconception: "Thinking relative phase alters measurement probabilities without interference.",
    },
  ],
  measurement: [
    {
      kind: "mistake",
      prompt: "Tap the false statement about measurement.",
      statements: [
        { text: "Measurement collapses the state to one basis outcome.", flawed: false },
        { text: "Re-measuring right after (unchanged) repeats the same result.", flawed: false },
        { text: "Measurement reveals the qubit's exact amplitudes.", flawed: true },
      ],
      explanation:
        "A single measurement gives one bit, not the amplitudes. You'd need many identically prepared qubits to estimate the underlying probabilities.",
      difficulty: "easy",
      misconception: "Expecting one measurement to reveal the full quantum state.",
    },
  ],
  hardware: [
    {
      kind: "mistake",
      prompt: "Three claims about hardware. Tap the false one.",
      statements: [
        { text: "Decoherence leaks quantum information into the environment.", flawed: false },
        { text: "Error correction spreads one logical qubit across many physical ones.", flawed: false },
        { text: "Real qubits keep their state indefinitely with no upkeep.", flawed: true },
      ],
      explanation:
        "Physical qubits are fragile and lose coherence quickly; keeping information alive needs isolation, fast gates, and error correction.",
      difficulty: "medium",
      misconception: "Assuming physical qubits are stable and need no error correction.",
    },
  ],
};

const MISTAKE_GENERIC: MistakeChallenge[] = [
  {
    kind: "mistake",
    prompt: "Three claims. Tap the false one.",
    statements: [
      { text: "Quantum gates are reversible transformations of the state.", flawed: false },
      { text: "Measurement generally introduces randomness and is irreversible.", flawed: false },
      { text: "You can perfectly copy an unknown qubit with the right gate.", flawed: true },
    ],
    explanation:
      "The no-cloning theorem forbids copying an arbitrary unknown state exactly. That is a cornerstone of quantum information.",
    difficulty: "medium",
    misconception: "Believing an unknown quantum state can be cloned exactly.",
  },
];

const EXPLAIN_BANK: Partial<Record<ConceptTag, ExplainChallenge[]>> = {
  measurement: [
    {
      kind: "explain",
      prompt: "Why can't one measurement reveal a superposition? Pick the best explanation.",
      options: [
        { id: "a", label: "Because measuring forces a collapse to a single basis outcome, one bit." },
        { id: "b", label: "Because the qubit was always secretly 0 or 1." },
        { id: "c", label: "Because measurement is too slow to see both values." },
      ],
      correctId: "a",
      explanation:
        "Measurement projects the state onto one basis result, so a single shot yields one bit. The amplitudes only surface across many prepared copies.",
      difficulty: "medium",
      misconception: "Explaining collapse as 'it was already definite' rather than projection.",
    },
  ],
  interference: [
    {
      kind: "explain",
      prompt: "Why can adding a path lower a probability? Pick the best explanation.",
      options: [
        { id: "a", label: "Because amplitudes add with sign, so paths can cancel before squaring." },
        { id: "b", label: "Because more paths always means lower probability." },
        { id: "c", label: "Because measurement subtracts the extra path." },
      ],
      correctId: "a",
      explanation:
        "Destructive interference: amplitudes of equal size and opposite sign cancel, so a new path can reduce or zero out an outcome's probability.",
      difficulty: "medium",
      misconception: "Thinking probabilities, not amplitudes, are what combine.",
    },
  ],
  "bloch-sphere": [
    {
      kind: "explain",
      prompt: "What does a point on the Bloch sphere represent? Pick the best explanation.",
      options: [
        { id: "a", label: "Any pure single-qubit state, with poles |0\\rangle and |1\\rangle." },
        { id: "b", label: "Two entangled qubits at once." },
        { id: "c", label: "The probability of a measurement error." },
      ],
      correctId: "a",
      explanation:
        "Every pure single-qubit state is a point on the Bloch sphere; the poles are |0\\rangle and |1\\rangle, and latitude/longitude encode superposition weight and relative phase.",
      difficulty: "medium",
      misconception: "Reading the Bloch sphere as a picture of two qubits.",
    },
  ],
  qubits: [
    {
      kind: "explain",
      prompt: "How is a qubit different from a classical bit? Pick the best explanation.",
      options: [
        { id: "a", label: "It can hold amplitudes for 0 and 1 at once, until measured." },
        { id: "b", label: "It is just a faster classical bit." },
        { id: "c", label: "It stores two classical bits permanently." },
      ],
      correctId: "a",
      explanation:
        "The correct answer is that a qubit can represent both 0 and 1 simultaneously until measured. This corrects the misconception that qubits read all values at once, as superposition is a fixed state until observation occurs.",
      difficulty: "easy",
      misconception: "Describing a qubit as merely a faster or doubled classical bit.",
    },
  ],
};

const EXPLAIN_GENERIC: ExplainChallenge[] = [
  {
    kind: "explain",
    prompt: "Pick the best explanation of how quantum information works.",
    options: [
      { id: "a", label: "Amplitudes evolve and interfere; only measurement yields a definite outcome." },
      { id: "b", label: "Qubits are classical bits that happen to be smaller." },
      { id: "c", label: "Quantum computers read all answers at once and print them." },
    ],
    correctId: "a",
    explanation:
      "Amplitudes evolve and interfere. Measurement collapses to one result. Quantum computers do not read every branch at once.",
    difficulty: "medium",
    misconception: "Defaulting to the 'reads all answers at once' myth.",
  },
];

const PREDICTION_BANK: Partial<Record<ConceptTag, PredictionChallenge[]>> = {
  measurement: [
    {
      kind: "prediction",
      prompt: "Before measuring an equal superposition in the Z basis, predict the outcome.",
      options: [
        { id: "a", label: "Definitely 0" },
        { id: "b", label: "Definitely 1" },
        { id: "c", label: "50/50 chance of 0 or 1" },
        { id: "d", label: "Both 0 and 1 at once" },
      ],
      correctId: "c",
      explanation: "An equal superposition yields random 0 or 1 with equal probability on a single shot.",
      difficulty: "easy",
      misconception: "Expecting a definite outcome from one measurement of a superposition.",
    },
  ],
};

const PREDICTION_GENERIC: PredictionChallenge[] = [
  {
    kind: "prediction",
    prompt: "Starting from |0⟩, you apply H once. Predict P(1) on the next Z measurement.",
    options: [
      { id: "a", label: "0%" },
      { id: "b", label: "50%" },
      { id: "c", label: "100%" },
      { id: "d", label: "25%" },
    ],
    correctId: "b",
    explanation: "H maps |0⟩ to an equal superposition, so P(1) = 50%.",
    difficulty: "easy",
    misconception: "Thinking H always gives a definite 1.",
  },
];

const BLOCH_BANK: Partial<Record<ConceptTag, BlochChallenge[]>> = {
  "bloch-sphere": [
    {
      kind: "bloch",
      prompt: "Which Bloch-sphere state is |0⟩?",
      theta: 0,
      phi: 0,
      options: [
        { id: "a", label: "North pole (|0⟩)", theta: 0, phi: 0 },
        { id: "b", label: "South pole (|1⟩)", theta: Math.PI, phi: 0 },
        { id: "c", label: "Equator (|+⟩)", theta: Math.PI / 2, phi: 0 },
        { id: "d", label: "Equator (|−⟩)", theta: Math.PI / 2, phi: Math.PI },
      ],
      correctId: "a",
      explanation: "The north pole of the Bloch sphere is |0⟩; the south pole is |1⟩.",
      difficulty: "easy",
    },
  ],
  superposition: [
    {
      kind: "bloch",
      prompt: "After H on |0⟩, where does the state vector sit on the Bloch sphere?",
      theta: Math.PI / 2,
      phi: 0,
      options: [
        { id: "a", label: "North pole", theta: 0, phi: 0 },
        { id: "b", label: "On the equator (|+⟩ direction)", theta: Math.PI / 2, phi: 0 },
        { id: "c", label: "South pole", theta: Math.PI, phi: 0 },
        { id: "d", label: "Inside the sphere", theta: Math.PI / 4, phi: Math.PI / 4 },
      ],
      correctId: "b",
      explanation: "H sends |0⟩ to |+⟩, which lies on the equator halfway between |0⟩ and |1⟩.",
      difficulty: "medium",
    },
  ],
};

const BLOCH_GENERIC: BlochChallenge[] = [
  {
    kind: "bloch",
    prompt: "Which point is the |1⟩ state on the Bloch sphere?",
    theta: Math.PI,
    phi: 0,
    options: [
      { id: "a", label: "North pole", theta: 0, phi: 0 },
      { id: "b", label: "South pole", theta: Math.PI, phi: 0 },
      { id: "c", label: "Equator |+⟩", theta: Math.PI / 2, phi: 0 },
      { id: "d", label: "Equator |−⟩", theta: Math.PI / 2, phi: Math.PI },
    ],
    correctId: "b",
    explanation: "The south pole represents |1⟩.",
    difficulty: "easy",
  },
];

const MATCH_BANK: Partial<Record<ConceptTag, MatchChallenge[]>> = {
  gates: [
    {
      kind: "match",
      prompt: "Match each gate to what it does starting from |0⟩.",
      pairs: [{ left: "H", right: "Equal superposition" }],
      options: [
        { id: "a", label: "Equal superposition" },
        { id: "b", label: "Flip to |1⟩" },
        { id: "c", label: "Add π phase to |1⟩" },
        { id: "d", label: "Do nothing" },
      ],
      correctId: "a",
      explanation: "H on |0⟩ creates (|0⟩+|1⟩)/√2, an equal superposition.",
      difficulty: "easy",
    },
  ],
  entanglement: [
    {
      kind: "match",
      prompt: "Match the Bell-pair circuit to its state.",
      pairs: [{ left: "H then CNOT on |00⟩", right: "(|00⟩+|11⟩)/√2" }],
      options: [
        { id: "a", label: "(|00⟩+|11⟩)/√2" },
        { id: "b", label: "|00⟩" },
        { id: "c", label: "(|01⟩+|10⟩)/√2" },
        { id: "d", label: "|11⟩" },
      ],
      correctId: "a",
      explanation: "H then CNOT is the standard Bell-state recipe.",
      difficulty: "medium",
    },
  ],
};

const MATCH_GENERIC: MatchChallenge[] = [
  {
    kind: "match",
    prompt: "Match: X gate on |0⟩ → ?",
    pairs: [{ left: "X on |0⟩", right: "|1⟩" }],
    options: [
      { id: "a", label: "|1⟩" },
      { id: "b", label: "|0⟩" },
      { id: "c", label: "Equal superposition" },
      { id: "d", label: "−|1⟩" },
    ],
    correctId: "a",
    explanation: "X is a bit flip: |0⟩ becomes |1⟩.",
    difficulty: "easy",
  },
];

const ESTIMATE_BANK: Partial<Record<ConceptTag, EstimateChallenge[]>> = {
  measurement: [
    {
      kind: "estimate",
      prompt: "Estimate P(1) after H on |0⟩, measured in the Z basis.",
      options: [
        { id: "a", label: "About 50%" },
        { id: "b", label: "About 0%" },
        { id: "c", label: "About 100%" },
        { id: "d", label: "About 25%" },
      ],
      correctId: "a",
      explanation: "Equal superposition gives P(0) ≈ P(1) ≈ 50% over many shots.",
      difficulty: "easy",
    },
  ],
  superposition: [
    {
      kind: "estimate",
      prompt: "A qubit is in |1⟩. Estimate P(1) on a Z measurement.",
      options: [
        { id: "a", label: "About 100%" },
        { id: "b", label: "About 50%" },
        { id: "c", label: "About 0%" },
        { id: "d", label: "Unknowable" },
      ],
      correctId: "a",
      explanation: "A definite |1⟩ always measures 1 in the Z basis.",
      difficulty: "easy",
    },
  ],
};

const ESTIMATE_GENERIC: EstimateChallenge[] = [
  {
    kind: "estimate",
    prompt: "Estimate P(0) for |0⟩ measured in the Z basis.",
    options: [
      { id: "a", label: "About 100%" },
      { id: "b", label: "About 50%" },
      { id: "c", label: "About 0%" },
      { id: "d", label: "Random each time only" },
    ],
    correctId: "a",
    explanation: "|0⟩ is a definite Z-basis state, so P(0) = 100%.",
    difficulty: "easy",
  },
];

const INTERFERENCE_BANK: Partial<Record<ConceptTag, InterferenceChallenge[]>> = {
  interference: [
    {
      kind: "interference",
      prompt: "Two paths to the same outcome have equal amplitude but opposite sign. What happens?",
      options: [
        { id: "a", label: "Destructive interference; probability can drop to zero" },
        { id: "b", label: "Probabilities always add" },
        { id: "c", label: "Measurement fixes the sign mismatch" },
        { id: "d", label: "The extra path always raises probability" },
      ],
      correctId: "a",
      explanation: "Amplitudes add before squaring; opposite signs cancel (destructive interference).",
      difficulty: "medium",
    },
  ],
  phase: [
    {
      kind: "interference",
      prompt: "A relative π phase between two paths that recombine tends to…",
      options: [
        { id: "a", label: "Flip the sign of one path's amplitude" },
        { id: "b", label: "Change Z measurement odds with no further gates" },
        { id: "c", label: "Send information faster than light" },
        { id: "d", label: "Clone the qubit" },
      ],
      correctId: "a",
      explanation: "Relative phase rotates amplitude sign; it matters when paths interfere.",
      difficulty: "medium",
    },
  ],
};

const INTERFERENCE_GENERIC: InterferenceChallenge[] = [
  {
    kind: "interference",
    prompt: "When do relative phases affect measurement statistics?",
    options: [
      { id: "a", label: "When amplitudes recombine and interfere" },
      { id: "b", label: "Immediately on any Z measurement" },
      { id: "c", label: "Never; phase is unphysical" },
      { id: "d", label: "Only for two qubits at once" },
    ],
    correctId: "a",
    explanation: "Phase is hidden in a single basis measurement until interference brings paths together.",
    difficulty: "medium",
  },
];

const FILL_BANK: Partial<Record<ConceptTag, FillChallenge[]>> = {
  gates: [
    {
      kind: "fill",
      prompt: "Fill the missing gate: |0⟩ → ? → |1⟩",
      palette: ["H", "X", "Z", "I"],
      solution: ["X"],
      missingIndex: 0,
      explanation: "X flips |0⟩ to |1⟩ in one step.",
      difficulty: "easy",
    },
  ],
  entanglement: [
    {
      kind: "fill",
      prompt: "Fill the missing gate: |00⟩ → H → ? → Bell pair",
      palette: ["CNOT", "X", "Z", "H"],
      solution: ["CNOT"],
      missingIndex: 0,
      explanation: "After H on the first qubit, CNOT entangles the pair.",
      difficulty: "medium",
    },
  ],
};

const FILL_GENERIC: FillChallenge[] = [
  {
    kind: "fill",
    prompt: "Fill the missing gate: |0⟩ → ? → equal superposition",
    palette: ["H", "X", "Z", "I"],
    solution: ["H"],
    missingIndex: 0,
    explanation: "Hadamard creates an equal superposition from |0⟩.",
    difficulty: "easy",
  },
];

function bankForKind(kind: ChallengeKind, tag: ConceptTag): LocalChallenge[] {
  switch (kind) {
    case "order":
      return ORDER_BANK[tag]?.length ? ORDER_BANK[tag]! : ORDER_GENERIC;
    case "slots":
      return SLOTS_BANK[tag]?.length ? SLOTS_BANK[tag]! : SLOTS_GENERIC;
    case "mistake":
      return MISTAKE_BANK[tag]?.length ? MISTAKE_BANK[tag]! : MISTAKE_GENERIC;
    case "prediction":
      return PREDICTION_BANK[tag]?.length ? PREDICTION_BANK[tag]! : PREDICTION_GENERIC;
    case "bloch":
      return BLOCH_BANK[tag]?.length ? BLOCH_BANK[tag]! : BLOCH_GENERIC;
    case "match":
      return MATCH_BANK[tag]?.length ? MATCH_BANK[tag]! : MATCH_GENERIC;
    case "estimate":
      return ESTIMATE_BANK[tag]?.length ? ESTIMATE_BANK[tag]! : ESTIMATE_GENERIC;
    case "interference":
      return INTERFERENCE_BANK[tag]?.length ? INTERFERENCE_BANK[tag]! : INTERFERENCE_GENERIC;
    case "fill":
      return FILL_BANK[tag]?.length ? FILL_BANK[tag]! : FILL_GENERIC;
    case "explain":
    case "mcq":
    default:
      return EXPLAIN_BANK[tag]?.length ? EXPLAIN_BANK[tag]! : EXPLAIN_GENERIC;
  }
}

function pickFiltered<T>(bank: T[], seed: number): T {
  return bank[((seed % bank.length) + bank.length) % bank.length];
}

/** Resolve a graded local challenge for a concept + kind, with generic fallback. */
export function getChallenge(
  kind: ChallengeKind,
  tag: ConceptTag,
  seed = 0,
  excludeIds: ReadonlySet<string> = new Set()
): LocalChallenge {
  const bank = bankForKind(kind, tag);
  const filtered = bank.filter((c) => !excludeIds.has(`local:${tag}:${kind}:${c.prompt.trim()}`));
  const pool = filtered.length > 0 ? filtered : bank;
  return pickFiltered(pool, seed);
}
