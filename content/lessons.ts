import type { Course, Lesson, UserProfile } from "@/lib/types";

export const QUANTUM_BEGINNER_BADGE = "quantum-beginner";
export const MEASUREMENT_ROOKIE_BADGE = "measurement-rookie";
export const QUANTUM_GATES_STARTER_BADGE = "quantum-gates-starter";
export const QUANTUM_CIRCUIT_BUILDER_BADGE = "quantum-circuit-builder";
export const INTERFERENCE_EXPLORER_BADGE = "interference-explorer";

const lesson1: Lesson = {
  id: "qubits-superposition",
  title: "Qubits & Superposition",
  description:
    "Build intuition for qubits and superposition by preparing states and measuring them.",
  badge: {
    id: QUANTUM_BEGINNER_BADGE,
    title: "Quantum Beginner",
    subtitle: "Completed Qubits & Superposition",
  },
  steps: [
    {
      type: "bit-explorer",
      id: "classical-bit",
      title: "Classical bits",
      prompt:
        "A classical bit stores exactly one value at a time: 0 or 1. Flip the switch, then decide whether a classical bit can ever represent both simultaneously.",
      options: [
        {
          id: "no",
          label: "No — it always holds one definite value",
          correct: true,
          feedback:
            "Correct. A classical bit always holds a single definite value, 0 or 1. Representing both at once is a property of quantum systems, which you'll examine next.",
        },
        {
          id: "yes",
          label: "Yes — it can represent both at once",
          feedback:
            "Not for a classical bit. A classical bit is defined to hold one definite value, 0 or 1. Holding both at once is a quantum property, introduced next.",
        },
      ],
    },
    {
      type: "informative",
      id: "why-quantum",
      title: "Why quantum computing",
      emoji: "⚛️",
      body: [
        "Some computational problems — such as molecular simulation, materials discovery, and optimization — scale beyond what classical computers can solve efficiently.",
        "Quantum computers process information differently, using qubits instead of classical bits. In this lesson, you'll build intuition for qubits through interactive experiments rather than mathematics.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/",
          description: "Introductory courses on quantum computing.",
          kind: "docs",
        },
        {
          label: "Qiskit documentation",
          url: "https://www.ibm.com/quantum/qiskit",
          description: "Tools and tutorials for writing quantum programs.",
          kind: "docs",
        },
        {
          label: "Quantum computing: a short introduction",
          url: "https://www.youtube.com/results?search_query=quantum+computing+introduction",
          description: "Introductory explainer videos (opens YouTube).",
          kind: "video",
        },
      ],
    },
    {
      type: "prediction",
      id: "predict-qubit",
      title: "Predict: how a qubit differs",
      prompt:
        "A classical bit is fixed at 0 or 1. A qubit can be 50% likely to measure 0 and 50% likely to measure 1. Predict what best describes this difference.",
      options: [
        {
          id: "both",
          label: "A qubit holds a combination of 0 and 1 until measured",
          correct: true,
          feedback:
            "Correct. This combination is called superposition. The percentages are the probabilities of each outcome when the qubit is measured.",
        },
        {
          id: "random",
          label: "A qubit switches between 0 and 1 at random",
          feedback:
            "Not quite. A qubit is not switching values. It holds a fixed superposition of 0 and 1, and the probabilities stay set until you measure it.",
        },
        {
          id: "faster",
          label: "A qubit is simply a faster bit",
          feedback:
            "Speed is not the distinction. A qubit can hold a superposition of 0 and 1 — a state a classical bit cannot represent.",
        },
      ],
    },
    {
      type: "playground",
      id: "superposition-playground",
      title: "Prepare and measure",
      body:
        "Set the probability, then predict: can a single measurement reveal which setting you chose? Measure one qubit, then measure many freshly prepared qubits, and compare what a single outcome and the full set reveal.",
    },
    {
      type: "informative",
      id: "what-measurement-means",
      title: "What measurement does",
      emoji: "🔎",
      body: [
        "A qubit can hold a superposition of 0 and 1, but that superposition cannot be observed directly.",
        "Measurement returns a single definite outcome, 0 or 1. The probabilities describe how often each outcome occurs, not what any single measurement will be.",
        "To recover the probabilities, prepare many identical qubits and measure each once. Observe this next.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning: measurement",
          url: "https://learning.quantum.ibm.com/",
          description: "A deeper treatment of measurement.",
          kind: "docs",
        },
      ],
    },
    {
      type: "simulation",
      id: "run-measurements",
      title: "Measure repeatedly",
      prompt:
        "Set a probability, then measure 100 times. Observe how the outcomes are distributed.",
      teaching:
        "Each measurement returns a single outcome, 0 or 1. No single result is predictable, but across many measurements the frequencies approach the probabilities you set.",
      defaultProbability: 70,
      sampleSize: 100,
    },
    {
      type: "prediction",
      id: "prediction-challenge",
      title: "Predict the distribution",
      prompt:
        "A qubit is prepared with P(1) = 75%. Measured many times, which outcome occurs more often?",
      options: [
        {
          id: "one",
          label: "1",
          correct: true,
          feedback:
            "Correct. With P(1) = 75%, about 75 of 100 measurements return 1. The higher-probability outcome occurs more often.",
        },
        {
          id: "zero",
          label: "0",
          feedback:
            "Not quite. P(1) = 75% leaves P(0) = 25%, so 0 occurs less often than 1.",
        },
        {
          id: "equal",
          label: "About equally",
          feedback:
            "Equal frequencies require P(0) = P(1) = 50%. Here P(1) = 75% and P(0) = 25%, so 1 occurs about three times as often.",
        },
      ],
    },
    {
      type: "challenge",
      id: "build-target",
      title: "Prepare a target state",
      prompt: "Prepare the qubit so that P(1) = 75%.",
      targetProbability: 75,
      tolerance: 5,
      correctFeedback:
        "Correct. The qubit now measures 1 about 75% of the time and 0 about 25% — a superposition you prepared.",
      incorrectFeedback:
        "Not yet. Aim for P(1) near 75%, which leaves P(0) near 25%. Adjust the slider and check again.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You prepared and measured qubits and observed:",
      points: [
        "A classical bit holds one definite value; a qubit holds a superposition of 0 and 1.",
        "Probabilities describe a qubit's measurement outcomes and sum to 100%.",
        "Measurement returns a single outcome, 0 or 1.",
        "Outcome frequencies approach the probabilities only over many measurements.",
      ],
    },
  ],
};

const lesson2: Lesson = {
  id: "measurement",
  title: "Measurement",
  description:
    "Examine what measurement does to a qubit's state, and why one outcome cannot reveal it.",
  badge: {
    id: MEASUREMENT_ROOKIE_BADGE,
    title: "Measurement Rookie",
    subtitle: "Completed Measurement",
  },
  steps: [
    {
      type: "informative",
      id: "what-is-measurement",
      title: "What does measurement do?",
      emoji: "🔎",
      body: [
        "A qubit can hold a superposition of 0 and 1, but that superposition cannot be observed directly.",
        "Measurement returns a single outcome, 0 or 1. It is the operation that converts a quantum state into a classical result.",
        "Before measurement you can describe only probabilities. After measurement you have one definite outcome, and the original superposition is gone.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/",
          description: "Introductory material, including measurement.",
          kind: "docs",
        },
      ],
    },
    {
      type: "prediction",
      id: "predict-before-measuring",
      title: "Predict a single measurement",
      prompt:
        "A qubit is prepared with P(0) = 30% and P(1) = 70%. If you measure it once, what can occur?",
      options: [
        {
          id: "must-one",
          label: "It must return 1, since 70% is larger",
          feedback:
            "Not quite. 70% makes 1 more likely, not certain. A single measurement still returns 0 about 30% of the time.",
        },
        {
          id: "either",
          label: "Either 0 or 1, with 1 more likely",
          correct: true,
          feedback:
            "Correct. A single measurement returns 0 or 1. With P(1) = 70%, 1 is more likely, but 0 can still occur.",
        },
        {
          id: "point-seven",
          label: "It returns 0.7",
          feedback:
            "A measurement returns a whole outcome, never a fraction. The 0.7 is the probability of measuring 1, not the result itself.",
        },
      ],
    },
    {
      type: "single-measurement",
      id: "single-measurement",
      title: "Measure once",
      body:
        "This qubit is prepared with P(1) = 70%. Predict the outcome, then measure once and observe the result.",
      probabilityOfOne: 70,
      teaching:
        "Measurement returned a single outcome and the superposition collapsed. One result alone does not reveal the original 70/30 probabilities.",
    },
    {
      type: "fresh-batch",
      id: "fresh-batch",
      title: "Measure fresh qubits",
      body:
        "Each run prepares a new qubit with P(1) = 70% and measures it once. Run several and observe the sequence of outcomes.",
      prompt: "What pattern do you observe across runs?",
      probabilityOfOne: 70,
      sampleSize: 10,
      teaching:
        "No single outcome is predictable, but 1 occurs more often than 0 because it is more probable. The pattern becomes clearer as you measure more qubits.",
    },
    {
      type: "informative",
      id: "collapse-explained",
      title: "Collapse",
      emoji: "💥",
      body: [
        "Measurement collapses a qubit's superposition into one observed outcome, 0 or 1.",
        "Collapse is permanent for that qubit. Measure the same qubit again immediately and it returns the same outcome; the uncertainty is gone.",
        "To recover the probabilities, prepare many identical qubits and measure each once. The set of outcomes reveals the distribution.",
      ],
    },
    {
      type: "collapse-check",
      id: "collapse-check",
      title: "Predict after collapse",
      measuredResult: 1,
      prompt:
        "A qubit was measured and returned 1, so it has collapsed. If you measure that same qubit again immediately, what occurs?",
      options: [
        {
          id: "same",
          label: "It returns 1 again",
          correct: true,
          feedback:
            "Correct. A collapsed qubit keeps its outcome, so an immediate re-measurement returns 1. The uncertainty is gone for that qubit.",
        },
        {
          id: "reset",
          label: "It returns to the 70/30 state",
          feedback:
            "Not quite. Measurement does not reset the qubit. Recovering the 70/30 distribution requires a freshly prepared qubit, not a re-measurement.",
        },
        {
          id: "balance",
          label: "It returns 0 to balance the previous result",
          feedback:
            "There is no balancing rule. The qubit has collapsed to 1 and returns 1 again. Past outcomes do not influence future ones.",
        },
      ],
      teaching:
        "A collapsed qubit keeps its outcome. Probabilities describe freshly prepared qubits, not measured ones.",
    },
    {
      type: "simulation",
      id: "many-measurements",
      title: "Recover the distribution",
      prompt:
        "Set a probability, then measure 100 fresh qubits. Try several settings and compare the histograms.",
      teaching:
        "Across 100 fresh qubits, the counts of 0 and 1 approximate the probabilities you set. Measuring many prepared qubits is how a distribution is estimated.",
      defaultProbability: 70,
      sampleSize: 100,
    },
    {
      type: "prediction",
      id: "mastery-challenge",
      title: "Apply the idea",
      prompt:
        "A qubit is prepared with P(1) = 20% and measured across 100 fresh copies. Which outcome occurs more often?",
      options: [
        {
          id: "zero",
          label: "0",
          correct: true,
          feedback:
            "Correct. P(1) = 20% gives P(0) = 80%, so 0 occurs far more often — about 80 of 100 measurements.",
        },
        {
          id: "one",
          label: "1",
          feedback:
            "Not quite. P(1) is only 20%, so 1 is the rarer outcome. 0, at 80%, occurs much more often.",
        },
        {
          id: "equal",
          label: "About equally",
          feedback:
            "Equal frequencies require both probabilities near 50%. With P(1) = 20% and P(0) = 80%, 0 occurs far more often.",
        },
      ],
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You examined measurement and observed:",
      points: [
        "Measurement returns a single outcome, 0 or 1.",
        "A higher probability makes an outcome more likely, not certain.",
        "Collapse is permanent: re-measuring a collapsed qubit repeats its outcome.",
        "Probabilities are recovered by measuring many freshly prepared qubits.",
      ],
    },
  ],
};

const lesson3: Lesson = {
  id: "quantum-gates",
  title: "Quantum Gates",
  description: "Use gates to transform a qubit's state before measurement.",
  badge: {
    id: QUANTUM_GATES_STARTER_BADGE,
    title: "Quantum Gates Starter",
    subtitle: "Completed Quantum Gates",
  },
  steps: [
    {
      type: "informative",
      id: "what-is-a-gate",
      title: "What is a quantum gate?",
      emoji: "🎛️",
      body: [
        "A quantum gate is an operation applied to a qubit. It transforms the qubit's state before measurement.",
        "Classical logic gates transform bits — for example, a NOT gate maps 0 to 1.",
        "Quantum gates transform a qubit's probabilities, the likelihood of each outcome. You apply gates first to prepare the qubit, then measure.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning: gates",
          url: "https://learning.quantum.ibm.com/",
          description: "A deeper treatment of quantum gates.",
          kind: "docs",
        },
      ],
    },
    {
      type: "bit-explorer",
      id: "classical-not",
      title: "The classical NOT gate",
      prompt:
        "Apply the NOT gate to the bit several times and observe the effect. What does NOT do?",
      options: [
        {
          id: "flip",
          label: "It flips the value",
          correct: true,
          feedback:
            "Correct. NOT maps 0 to 1 and 1 to 0. The quantum X gate performs the same operation on a qubit.",
        },
        {
          id: "nothing",
          label: "It leaves the value unchanged",
          feedback:
            "Look again. Each NOT maps 0 to 1 and 1 to 0 — it flips the value.",
        },
        {
          id: "random",
          label: "It randomizes the value",
          feedback:
            "NOT is deterministic. It always maps 0 to 1 and 1 to 0, with no randomness.",
        },
      ],
    },
    {
      type: "informative",
      id: "meet-x-gate",
      title: "The X gate",
      emoji: "🔁",
      body: [
        "The X gate is the qubit counterpart of NOT.",
        "Applied to a definite 0 it produces a definite 1; applied to a definite 1 it produces a definite 0.",
        "Equivalently, X exchanges the probabilities of measuring 0 and 1.",
      ],
    },
    {
      type: "gate-playground",
      id: "x-gate-playground",
      title: "The X gate",
      body:
        "Choose a starting state, predict the result, then apply X and compare. Try it from both 0 and 1.",
      initialPOne: 0,
      allowStateSelect: true,
      gates: ["X"],
      teaching:
        "X exchanges the 0 and 1 outcomes: a definite 0 becomes a definite 1, and the probabilities swap. Applying X twice returns the original state.",
    },
    {
      type: "prediction",
      id: "x-gate-prediction",
      title: "Predict the X gate",
      prompt:
        "A qubit starts as a definite 0. You apply X, then measure. What does the measurement return?",
      options: [
        {
          id: "zero",
          label: "0",
          feedback:
            "Not quite. X flips 0 to 1, so the measurement returns 1.",
        },
        {
          id: "one",
          label: "1",
          correct: true,
          feedback:
            "Correct. X maps the definite 0 to a definite 1, so the measurement returns 1 every time.",
        },
        {
          id: "fifty",
          label: "0 or 1 with equal probability",
          feedback:
            "X does not create a superposition. It maps a definite 0 to a definite 1. The gate that produces a 50/50 state appears next.",
        },
      ],
    },
    {
      type: "informative",
      id: "meet-h-gate",
      title: "The H gate",
      emoji: "🌗",
      body: [
        "H is the Hadamard gate.",
        "Applied to a definite 0, it produces an even superposition: measurement returns 0 about half the time and 1 about half the time.",
        "H converts a definite state into a superposition, the operation most quantum algorithms rely on.",
      ],
    },
    {
      type: "gate-playground",
      id: "h-gate-playground",
      title: "The H gate",
      body:
        "The qubit starts as a definite 0. Predict the result, apply H, then measure 20 fresh qubits and compare.",
      initialPOne: 0,
      gates: ["H"],
      measureSampleSize: 20,
      teaching:
        "After H, P(0) and P(1) are each about 50%. Measuring many fresh qubits returns roughly half 0 and half 1.",
    },
    {
      type: "gate-sequence",
      id: "gate-sequence-challenge",
      title: "Prepare a 50/50 state",
      prompt:
        "Prepare a qubit that measures 0 or 1 with equal probability. The qubit starts as a definite 0. Apply gates, then check.",
      correctFeedback:
        "Correct. Applying H to a definite 0 produces an even 50/50 superposition.",
      incorrectFeedback:
        "Not yet. The qubit is still definite. X only flips 0 to 1; it does not create a superposition. Reset and apply H.",
      teaching:
        "H converts a definite state into a 50/50 superposition.",
    },
    {
      type: "prediction",
      id: "gates-mastery",
      title: "Identify the gate",
      prompt: "Which gate produces a 50/50 superposition from a definite 0?",
      options: [
        {
          id: "x",
          label: "X",
          feedback:
            "Not quite. X maps 0 to 1; both are definite states, not a superposition.",
        },
        {
          id: "h",
          label: "H",
          correct: true,
          feedback:
            "Correct. The H (Hadamard) gate converts a definite 0 into an even superposition.",
        },
        {
          id: "measurement",
          label: "Measurement",
          feedback:
            "Measurement reads out a qubit and collapses it; it does not prepare a superposition. H produces the superposition.",
        },
      ],
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You used gates to prepare qubit states and observed:",
      points: [
        "A gate transforms a qubit's state before measurement.",
        "The X gate exchanges the 0 and 1 outcomes, like NOT.",
        "The H gate converts a definite state into a 50/50 superposition.",
        "A program applies gates to prepare a state, then measures it.",
      ],
    },
  ],
};

const lesson4: Lesson = {
  id: "quantum-circuits",
  title: "Quantum Circuits",
  description: "Order gates into circuits — the structure of a simple quantum program.",
  badge: {
    id: QUANTUM_CIRCUIT_BUILDER_BADGE,
    title: "Quantum Circuit Builder",
    subtitle: "Completed Quantum Circuits",
  },
  steps: [
    {
      type: "informative",
      id: "what-is-a-circuit",
      title: "What is a quantum circuit?",
      emoji: "🧩",
      body: [
        "A quantum circuit is an ordered sequence of gates applied to a qubit.",
        "Each gate is one instruction. The qubit's state is transformed by each gate in turn, so order matters.",
        "Measurement comes at the end and returns the final outcome. Circuits are read left to right, in the order the gates are applied.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning: circuits",
          url: "https://learning.quantum.ibm.com/",
          description: "Examples of real quantum circuits.",
          kind: "docs",
        },
      ],
    },
    {
      type: "circuit-prediction",
      id: "circuit-order",
      title: "Reading a circuit",
      prompt:
        "This circuit is read left to right. Which operation is applied first?",
      gates: ["X"],
      options: [
        {
          id: "measure",
          label: "Measurement",
          feedback:
            "Not quite. Measurement is on the right, so it is applied last.",
        },
        {
          id: "xgate",
          label: "The X gate",
          correct: true,
          feedback:
            "Correct. Read left to right, X is applied first; measurement is last.",
        },
        {
          id: "result",
          label: "The result, before any gate",
          feedback:
            "A result appears only at the end, after every gate has been applied.",
        },
      ],
    },
    {
      type: "circuit-builder",
      id: "build-guarantee-one",
      title: "Prepare a guaranteed 1",
      prompt:
        "Build a circuit that always measures 1. The qubit starts at |0⟩. Add gates, then measure to check.",
      targetPOne: 100,
      correctFeedback:
        "Correct. X maps |0⟩ to |1⟩, so the measurement returns 1 every time: X then measure.",
      feedbackMeasuredEmpty:
        "You measured without applying a gate. Measuring |0⟩ returns 0. Apply a gate first.",
      feedbackSuperposition:
        "Close. H produces a 50/50 state, not a guaranteed 1. Reset and flip |0⟩ to |1⟩ instead.",
      incorrectFeedback:
        "Not yet. A guaranteed 1 requires a definite |1⟩ state. Reset and apply a single flip.",
      teaching:
        "A guaranteed outcome requires a definite state. X maps |0⟩ to |1⟩, so measurement always returns 1.",
    },
    {
      type: "circuit-playback",
      id: "circuit-playback",
      title: "Run a circuit",
      body:
        "Run this circuit step by step. The qubit starts at |0⟩, each gate transforms its probabilities, and measurement returns one outcome.",
      gates: ["X", "H"],
      teaching:
        "X makes the qubit a definite 1, then H spreads it into a 50/50 superposition. Measurement returns a single 0 or 1 from that distribution.",
    },
    {
      type: "circuit-prediction",
      id: "predict-final-state",
      title: "Predict the outcome distribution",
      prompt:
        "Run this circuit on many fresh qubits and measure each. What distribution do you expect?",
      gates: ["H"],
      options: [
        {
          id: "always0",
          label: "Always 0",
          feedback:
            "Not quite. H turns |0⟩ into a 50/50 superposition, so the result is not always 0.",
        },
        {
          id: "always1",
          label: "Always 1",
          feedback:
            "Not quite. H does not produce a definite 1; it produces a 50/50 superposition.",
        },
        {
          id: "half",
          label: "About half 0 and half 1",
          correct: true,
          feedback:
            "Correct. H produces a 50/50 superposition, so across many fresh qubits you measure roughly half 0 and half 1.",
        },
      ],
    },
    {
      type: "circuit-builder",
      id: "build-fifty-fifty",
      title: "Prepare a 50/50 circuit",
      prompt:
        "Build a circuit that measures 0 or 1 with equal probability. The qubit starts at |0⟩. Add gates, then measure to check.",
      targetPOne: 50,
      correctFeedback:
        "Correct. H converts the definite |0⟩ into an even 50/50 superposition.",
      feedbackMeasuredEmpty:
        "You measured before applying a gate. Measurement comes after preparation — add a gate first.",
      feedbackDefinite:
        "That leaves the qubit definite. X only flips |0⟩ to |1⟩; it does not create a 50/50 state. Reset and apply H.",
      incorrectFeedback:
        "Not yet. A 50/50 result requires an even superposition. Reset and apply H.",
      teaching:
        "H converts a definite state into a 50/50 superposition.",
    },
    {
      type: "informative",
      id: "why-circuits-matter",
      title: "Why circuits matter",
      emoji: "🚀",
      body: [
        "A quantum algorithm is a circuit: an ordered sequence of gates acting on qubits.",
        "A few well-chosen gates can shape a qubit into a specific distribution of outcomes.",
        "Because measurement collapses the state, a circuit is run many times and its outcomes are tallied to estimate the probabilities.",
      ],
    },
    {
      type: "prediction",
      id: "circuits-mastery",
      title: "Order of a program",
      prompt: "What is the basic order of a quantum program?",
      options: [
        {
          id: "measure-first",
          label: "Measure, then prepare, then apply gates",
          feedback:
            "Not quite. Measurement reads the final result, so it cannot come first.",
        },
        {
          id: "prepare-gates-measure",
          label: "Prepare the qubit, apply gates, then measure",
          correct: true,
          feedback:
            "Correct. A quantum program prepares a qubit, transforms it with gates, then measures.",
        },
        {
          id: "gates-measure-prepare",
          label: "Apply gates, measure, then prepare",
          feedback:
            "Not quite. A qubit must be prepared before gates can act on it, and measurement is last.",
        },
      ],
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You read and built simple circuits and observed:",
      points: [
        "A circuit is an ordered sequence of gates acting on qubits.",
        "Gates are applied left to right, each transforming the state.",
        "Measurement is last and returns the final outcome.",
        "A program prepares a state, transforms it with gates, then measures.",
      ],
    },
  ],
};

const lesson5: Lesson = {
  id: "interference",
  title: "Interference",
  description:
    "See how probability amplitudes combine — reinforcing or cancelling — to shape measurement outcomes.",
  badge: {
    id: INTERFERENCE_EXPLORER_BADGE,
    title: "Interference Explorer",
    subtitle: "Completed Interference",
  },
  steps: [
    {
      type: "wave-explorer",
      id: "story-setup",
      title: "Combining waves",
      interactive: false,
      body: [
        "Two waves can combine. Where their peaks align, they reinforce into a larger wave; where a peak meets a trough, they cancel.",
        "Quantum amplitudes combine in the same way. Next, you'll add two waves and observe reinforcement and cancellation.",
      ],
    },
    {
      type: "wave-explorer",
      id: "wave-explorer",
      title: "Add two waves",
      interactive: true,
      body: [
        "Adjust each wave's amplitude and observe the combined wave below.",
        "Set both amplitudes to the same sign, then to opposite signs, and compare the results.",
      ],
      teaching:
        "Same-sign amplitudes reinforce into a larger wave (constructive interference); opposite-sign amplitudes cancel toward zero (destructive interference).",
    },
    {
      type: "prediction",
      id: "predict-interference",
      title: "Predict the combination",
      prompt:
        "Two equal waves with the same sign combine. What is the result?",
      options: [
        {
          id: "smaller",
          label: "A smaller wave",
          feedback:
            "Not quite. Same-sign waves add together; they do not shrink.",
        },
        {
          id: "same",
          label: "A wave of the same size",
          feedback:
            "Not quite. Same-sign waves reinforce, producing a larger amplitude than either alone.",
        },
        {
          id: "bigger",
          label: "A larger wave",
          correct: true,
          feedback:
            "Correct. Same-sign waves reinforce — constructive interference — producing a larger amplitude.",
        },
      ],
    },
    {
      type: "path-amplitudes",
      id: "quantum-paths",
      title: "Combining amplitudes",
      mode: "experiment",
      body:
        "An outcome can be reached by more than one path, each carrying an amplitude of +1 or -1. Change the signs and observe how the amplitudes combine and how the outcome's probability changes.",
      teaching:
        "Same-sign amplitudes add (+1 and +1 give +2); opposite-sign amplitudes cancel (+1 and -1 give 0), making the outcome impossible. The probability comes from the combined amplitude.",
    },
    {
      type: "interference-sim",
      id: "run-experiments",
      title: "Run both cases",
      body: "Run each case and compare how often the target is reached.",
      teaching:
        "When the paths reinforce, the target is reached often; when they cancel, it is reached rarely. Run again and the exact counts change — interference shifts the probabilities rather than fixing a single result.",
    },
    {
      type: "prediction",
      id: "prediction-challenge",
      title: "Predict the combined probability",
      prompt:
        "Two paths reach the same outcome with amplitudes +1 and -1. What happens to that outcome's probability?",
      options: [
        {
          id: "increases",
          label: "It increases",
          feedback:
            "Not quite. Opposite signs work against each other, so the probability decreases.",
        },
        {
          id: "unchanged",
          label: "It stays the same",
          feedback:
            "Not quite. A -1 amplitude cancels the +1, so the second path does change the result.",
        },
        {
          id: "cancel",
          label: "It drops to zero",
          correct: true,
          feedback:
            "Correct. +1 and -1 sum to 0, so the amplitudes cancel and the outcome becomes impossible — destructive interference.",
        },
      ],
    },
    {
      type: "path-amplitudes",
      id: "build-constructive",
      title: "Build constructive interference",
      mode: "build-constructive",
      body:
        "Set the two amplitudes to produce the strongest possible signal at the target, then check.",
      correctFeedback:
        "Correct. Same-sign amplitudes (+1 and +1) sum to +2, the largest combined amplitude, so the outcome is measured every time.",
      incorrectFeedback:
        "Not the strongest yet. Opposite signs cancel. For the largest signal, give both paths the same sign.",
      teaching:
        "Same-sign amplitudes reinforce into the strongest signal.",
    },
    {
      type: "path-amplitudes",
      id: "build-destructive",
      title: "Build destructive interference",
      mode: "build-destructive",
      body:
        "Set the amplitudes so the target's probability drops to zero, then check.",
      correctFeedback:
        "Correct. +1 and -1 sum to 0, so the amplitudes cancel and the target's probability is zero.",
      incorrectFeedback:
        "Not zero yet. Same-sign amplitudes reinforce. To cancel the outcome, give the paths opposite signs.",
      teaching:
        "Opposite-sign amplitudes cancel, driving the target's probability to zero.",
    },
    {
      type: "informative",
      id: "why-this-matters",
      title: "Why interference matters",
      emoji: "✨",
      body: [
        "A quantum computer does not gain its advantage by testing every answer at once.",
        "It uses interference: circuits are designed so amplitudes for correct answers reinforce and amplitudes for incorrect answers cancel, making the correct outcome the most probable measurement.",
        "This principle underlies algorithms such as Grover's search and Shor's factoring algorithm.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/",
          description: "Algorithms that rely on interference.",
          kind: "docs",
        },
      ],
    },
    {
      type: "prediction",
      id: "interference-mastery",
      title: "Define interference",
      prompt: "What is quantum interference?",
      options: [
        {
          id: "guessing",
          label: "Random guessing among answers",
          feedback:
            "Interference is not random. Amplitudes combine in a precise, predictable way.",
        },
        {
          id: "amplitudes",
          label: "Amplitudes combining — reinforcing or cancelling",
          correct: true,
          feedback:
            "Correct. Interference is the combination of amplitudes: reinforcing when signs match and cancelling when they differ.",
        },
        {
          id: "faster",
          label: "A faster way to measure qubits",
          feedback:
            "Interference is not about measurement speed. It is how amplitudes add and cancel to shape outcome probabilities.",
        },
      ],
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You examined interference and observed:",
      points: [
        "Probabilities come from amplitudes, which can be positive or negative.",
        "Same-sign amplitudes reinforce — constructive interference.",
        "Opposite-sign amplitudes cancel — destructive interference.",
        "Interference shapes outcome probabilities, increasing some and suppressing others.",
      ],
    },
  ],
};

export const quantumBasicsCourse: Course = {
  id: "quantum-basics",
  title: "Quantum Basics",
  description: "Build intuition for quantum computing through short, interactive lessons.",
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
};

export function getLesson(lessonId: string): Lesson | undefined {
  return quantumBasicsCourse.lessons.find((l) => l.id === lessonId);
}

export function getNextLesson(lessonId: string): Lesson | undefined {
  const idx = quantumBasicsCourse.lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return undefined;
  return quantumBasicsCourse.lessons[idx + 1];
}

/**
 * A lesson is unlocked if it's the first lesson, or the previous lesson in the
 * course has been completed by the user. Lessons with no steps stay locked.
 */
export function isLessonUnlocked(
  lessonId: string,
  profile: UserProfile | null
): boolean {
  const idx = quantumBasicsCourse.lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return false;
  const lesson = quantumBasicsCourse.lessons[idx];
  if (lesson.steps.length === 0) return false;
  if (idx === 0) return true;
  const prev = quantumBasicsCourse.lessons[idx - 1];
  return !!profile?.progress?.[prev.id]?.completed;
}
