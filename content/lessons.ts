import type { Course, Lesson, Unit, UserProfile } from "@/lib/types";

export const QUANTUM_BEGINNER_BADGE = "quantum-beginner";
export const MEASUREMENT_ROOKIE_BADGE = "measurement-rookie";
export const QUANTUM_GATES_STARTER_BADGE = "quantum-gates-starter";
export const QUANTUM_CIRCUIT_BUILDER_BADGE = "quantum-circuit-builder";
export const INTERFERENCE_EXPLORER_BADGE = "interference-explorer";
export const BLOCH_NAVIGATOR_BADGE = "bloch-navigator";
export const PHASE_AWARE_BADGE = "phase-aware";
export const NO_CLONING_BADGE = "no-cloning";
export const PAULI_Z_BADGE = "pauli-z";
export const HADAMARD_BADGE = "hadamard";
export const REVERSIBILITY_BADGE = "reversibility";
export const UNIVERSAL_GATES_BADGE = "universal-gates";
export const CONSTRUCTIVE_INTERFERENCE_BADGE = "constructive-interference";
export const DESTRUCTIVE_INTERFERENCE_BADGE = "destructive-interference";
export const QUANTUM_ADVANTAGE_BADGE = "quantum-advantage";
export const CLASSICAL_CORRELATION_BADGE = "classical-correlation";
export const ENTANGLEMENT_BADGE = "entanglement";
export const BELL_STATES_BADGE = "bell-states";
export const MEASURING_ENTANGLED_BADGE = "measuring-entangled";
export const NO_SIGNALING_BADGE = "no-signaling";
export const QUANTUM_ALGORITHM_BADGE = "quantum-algorithm";
export const DEUTSCH_JOZSA_BADGE = "deutsch-jozsa";
export const GROVER_BADGE = "grover-search";
export const SHOR_BADGE = "shor-algorithm";
export const QUANTUM_WINS_BADGE = "quantum-wins";
export const BUILDING_QC_BADGE = "building-quantum-computer";
export const HARDWARE_PLATFORMS_BADGE = "hardware-platforms";
export const NOISE_DECOHERENCE_BADGE = "noise-decoherence";
export const ERROR_CORRECTION_BADGE = "error-correction";
export const FUTURE_QUANTUM_BADGE = "future-quantum";

const lesson1: Lesson = {
  id: "qubits-superposition",
  title: "Qubits & Superposition",
  description: "Compare classical bits with quantum states.",
  badge: {
    id: QUANTUM_BEGINNER_BADGE,
    title: "Quantum Beginner",
    subtitle: "Completed Qubits & Superposition",
  },
  steps: [
    {
      type: "informative",
      id: "welcome",
      title: "Welcome",
      body: [
        "Classical computers store information as definite 0s and 1s. Quantum computers use qubits that can represent both at once, letting them explore many possibilities in parallel.",
        "Learning here is hands-on. You'll explore quantum ideas by experimenting, making predictions, and solving challenges in live simulations. Each activity is designed to help you understand why something happens, not just remember the answer.",
        "By the end, you'll have a clear picture of how qubits work, how gates transform them, and why measurement always gives a single answer.",
      ],
      realWorldLabel: "Current applications",
      applications: [
        "Drug and material discovery",
        "Battery and energy research",
        "Cryptography and security",
        "Optimization problems",
      ],
    },
    {
      type: "bit-explorer",
      id: "classical-bit",
      title: "Classical bits",
      prompt:
        "A classical bit stores exactly one value at a time: 0 or 1. Flip the switch, then decide whether a classical bit can ever represent both simultaneously.",
      options: [
        {
          id: "no",
          label: "No,  it always holds one definite value",
          correct: true,
          feedback:
            "Correct. A classical bit always holds a single definite value, 0 or 1. Representing both at once is a property of quantum systems, which you'll examine next.",
        },
        {
          id: "yes",
          label: "Yes,  it can represent both at once",
          feedback:
            "Not for a classical bit. A classical bit is defined to hold one definite value, 0 or 1. Holding both at once is a quantum property, introduced next.",
        },
      ],
    },
    {
      type: "informative",
      id: "why-quantum",
      title: "Why quantum computing",
      body: [
        "Some problems are too big for any ordinary computer. Simulating exactly how a single complex molecule behaves could take the fastest supercomputer longer than the universe has existed.",
        "Quantum computers attack those problems with a different building block: the qubit. You will build intuition for qubits by experimenting with them, not by memorizing formulas.",
      ],
      whyMatters:
        "Qubits are the foundation for everything ahead. Every gate, circuit, and algorithm in this course is just a way of steering them.",
      resources: [
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/course/basics-of-quantum-information",
          description: "Introductory courses on quantum computing.",
          kind: "docs",
        },
        {
          label: "Qiskit documentation",
          url: "https://quantum.cloud.ibm.com/docs",
          description: "Tools and tutorials for writing quantum programs.",
          kind: "docs",
        },
        {
          label: "Quantum computing: a short introduction",
          url: "https://www.youtube.com/watch?v=JhHMJSYAImU",
          description: "IBM's short introduction to quantum computing (opens YouTube).",
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
            "The correct answer is that a qubit can represent both 0 and 1 simultaneously until measured. This corrects the misconception that qubits read all values at once, as superposition is a fixed state until observation occurs.",
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
            "Speed is not the distinction. A qubit can hold a superposition of 0 and 1,  a state a classical bit cannot represent.",
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
      body: [
        "A qubit can hold a superposition of 0 and 1, but you can never watch that superposition directly.",
        "Every measurement hands back one definite answer, 0 or 1. The probabilities tell you how often each answer shows up, not what the next single measurement will be.",
        "So to see the probabilities, you prepare many identical qubits and measure each one once. You will watch this happen next.",
      ],
      misconception:
        "It is tempting to picture the qubit secretly storing both a 0 and a 1, with measurement just reading one off. It does not work that way. Before you measure there is one superposed state, and measuring forces it into a single result.",
      resources: [
        {
          label: "IBM Quantum Learning: measurement",
          url: "https://quantum.cloud.ibm.com/docs/guides/measure-qubits",
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
        "Correct. The qubit now measures 1 about 75% of the time and 0 about 25%,  a superposition you prepared.",
      incorrectFeedback:
        "Not yet. Recall how amplitudes map to probabilities, then adjust.",
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
  description: "See how measurement changes a quantum state.",
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
      body: [
        "A qubit can hold a superposition of 0 and 1, but you cannot watch that superposition directly.",
        "Measurement returns a single outcome, 0 or 1. It is the step that turns a quantum state into a classical result you can actually read.",
        "Before you measure, you can only talk about probabilities. After you measure, you have one definite outcome and the original superposition is gone for good.",
      ],
      misconception:
        "Many people assume the qubit already is a 0 or a 1 and measurement simply uncovers it. There is no hidden value waiting to be found. Measurement is what creates the definite outcome.",
      memoryConnection:
        "Last lesson you saw that one measurement cannot reveal the probabilities. This is the reason: measuring changes the state instead of just reading it.",
      resources: [
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/course/utility-scale-quantum-computing/lesson-02-bits-gates-and-circuits",
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
      body: [
        "Measurement collapses a qubit's superposition into one observed outcome, 0 or 1.",
        "That collapse sticks. Measure the same qubit again right away and it returns the same outcome, because the uncertainty is already gone.",
        "To see the probabilities again, you prepare many identical qubits and measure each once. The full set of outcomes reveals the distribution.",
      ],
      realWorld:
        "Collapse is not just theory. Quantum random number generators rely on it, sampling one genuinely unpredictable outcome at a time for cryptography and secure keys.",
      whyMatters:
        "Measurement is the only way to read a quantum computer's answer, so understanding collapse is what makes every algorithm later in the course actually readable.",
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
            "Correct. P(1) = 20% gives P(0) = 80%, so 0 occurs far more often,  about 80 of 100 measurements.",
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
  title: "Pauli X",
  description: "Flip a qubit between |0⟩ and |1⟩.",
  badge: {
    id: QUANTUM_GATES_STARTER_BADGE,
    title: "Pauli X",
    subtitle: "Completed Pauli X",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Flipping a basis state",
      prompt:
        "We have described and measured quantum states; now we transform them. The Pauli X gate acts on the computational basis. Apply X to \\( |0\\rangle \\) and measure,  what does it return?",
      options: [
        {
          id: "one",
          label: "1",
          correct: true,
          feedback:
            "Correct. X is a bit flip: \\( X|0\\rangle = |1\\rangle \\), so a measurement returns 1 every time.",
        },
        {
          id: "zero",
          label: "0",
          feedback: "Not quite. X flips \\( |0\\rangle \\) to \\( |1\\rangle \\), so a measurement returns 1.",
        },
        {
          id: "mix",
          label: "0 or 1 with equal probability",
          feedback:
            "X does not create a superposition. It maps the definite \\( |0\\rangle \\) to the definite \\( |1\\rangle \\). The gate that makes a 50/50 state comes later.",
        },
      ],
      teaching: "X exchanges \\( |0\\rangle \\) and \\( |1\\rangle \\),  the quantum bit flip.",
    },
    {
      type: "gate-lab",
      id: "explore",
      title: "Apply X",
      body: "Pick a starting state, apply X, and measure. Try it from both \\( |0\\rangle \\) and \\( |1\\rangle \\), and apply X twice.",
      allowedGates: ["X"],
      allowStartToggle: true,
      start: "0",
      measure: true,
      teaching:
        "X is a bit flip: \\( X|0\\rangle = |1\\rangle \\) and \\( X|1\\rangle = |0\\rangle \\). Applying it twice returns the original state, so \\( XX = I \\).",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What did two X gates do?",
      prompt:
        "You applied X twice and measured. Compared with the original state, where did the qubit end up?",
      options: [
        {
          id: "back",
          label: "Back where it started",
          correct: true,
          feedback: "Correct. Two flips cancel: \\( XX = I \\), so the qubit returns to its original state.",
        },
        {
          id: "flipped",
          label: "Flipped to the opposite state",
          feedback: "One X flips it; the second flips it back. Two X gates return the original state.",
        },
        {
          id: "mixed",
          label: "In a 50/50 superposition",
          feedback: "X never makes a superposition. Two X gates return the definite starting state.",
        },
      ],
      teaching: "An even number of X gates is the identity: \\( XX = I \\).",
    },
    {
      type: "informative",
      id: "explain",
      title: "The X gate",
      body: [
        "The Pauli X gate is the quantum NOT: it swaps the basis states, \\( X|0\\rangle = |1\\rangle \\) and \\( X|1\\rangle = |0\\rangle \\).",
        "It is deterministic and reversible. Two X gates cancel, since \\( XX = I \\).",
      ],
      misconception:
        "X does not measure or randomize the qubit. It deterministically swaps \\( |0\\rangle \\) and \\( |1\\rangle \\); it does not reveal a hidden value.",
      realWorld:
        "The X gate is the workhorse of error correction. When a stray bit flips on real hardware, an X gate is exactly what flips it back.",
      whyMatters:
        "X is your first real gate. Once you can predict what one deterministic gate does, you can read any circuit as a sequence of such moves.",
      resources: [
        {
          label: "IBM Quantum Learning: gates",
          url: "https://learning.quantum.ibm.com/course/utility-scale-quantum-computing/lesson-02-bits-gates-and-circuits",
          description: "Single-qubit gates, including the Pauli gates.",
          kind: "docs",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-twice",
      title: "X applied twice",
      prompt: "Start from \\( |1\\rangle \\), apply X twice, and measure. What does it return?",
      options: [
        {
          id: "one",
          label: "1",
          correct: true,
          feedback:
            "Correct. \\( XX = I \\): the first X gives \\( |0\\rangle \\), the second restores \\( |1\\rangle \\).",
        },
        {
          id: "zero",
          label: "0",
          feedback: "After one X you reach \\( |0\\rangle \\), but the second X flips it back to \\( |1\\rangle \\).",
        },
        {
          id: "mix",
          label: "0 or 1 with equal probability",
          feedback: "X never creates a superposition. Two flips return the original definite state.",
        },
      ],
      teaching: "Because \\( XX = I \\), an even number of X gates does nothing.",
    },
    {
      type: "prediction",
      id: "q-definite",
      title: "Definite or superposition?",
      prompt: "After applying X to \\( |0\\rangle \\), is the qubit in a definite state or a superposition?",
      options: [
        {
          id: "definite",
          label: "Definite,  it is exactly \\( |1\\rangle \\)",
          correct: true,
          feedback: "Correct. X maps one basis state to another; the result is the definite state \\( |1\\rangle \\).",
        },
        {
          id: "super",
          label: "A 50/50 superposition",
          feedback: "X does not spread the state; \\( X|0\\rangle \\) is the definite \\( |1\\rangle \\).",
        },
      ],
      teaching: "X moves between definite basis states; it never creates superposition.",
    },
    {
      type: "gate-lab",
      id: "undo-x",
      title: "Undo a flip",
      body: "This circuit already applied one X to \\( |0\\rangle \\). Add gates to bring the qubit back to \\( |0\\rangle \\).",
      allowedGates: ["X"],
      start: "0",
      preset: ["X"],
      target: "0",
      correctFeedback:
        "Correct. X is its own inverse, so a second X undoes the first: \\( XX = I \\) returns \\( |0\\rangle \\).",
      incorrectFeedback:
        "Not yet. Recall what X does to a qubit state.",
      teaching: "To undo X, apply X again,  each flip reverses the previous one.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Does X reveal a hidden value?",
      prompt:
        "When X sends \\( |0\\rangle \\) to \\( |1\\rangle \\), is it uncovering a value the qubit secretly had, or transforming the state?",
      options: [
        {
          id: "transform",
          label: "Transforming,  it maps one state to the other deterministically",
          correct: true,
          feedback:
            "Correct. X is a fixed, reversible transformation, not a measurement. Nothing is revealed or randomized.",
        },
        {
          id: "reveal",
          label: "Revealing,  it reads out a hidden 0 or 1",
          feedback:
            "X does not measure. It maps \\( |0\\rangle \\leftrightarrow |1\\rangle \\) deterministically and reversibly,  a readout would not be reversible.",
        },
      ],
      teaching: "Gates transform states; they do not measure or reveal hidden values.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You met the first quantum gate:",
      points: [
        "X is the quantum bit flip: \\( X|0\\rangle = |1\\rangle \\), \\( X|1\\rangle = |0\\rangle \\).",
        "It is deterministic and reversible, with \\( XX = I \\).",
        "X moves between definite basis states; it does not create superposition.",
      ],
      next: "Pauli Z,  a gate that changes the state without changing the 0/1 measurement.",
    },
  ],
};

const lesson4: Lesson = {
  id: "quantum-circuits",
  title: "Gate Sequences",
  description: "See why gate order matters.",
  badge: {
    id: QUANTUM_CIRCUIT_BUILDER_BADGE,
    title: "Gate Sequences",
    subtitle: "Completed Gate Sequences",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Order of operations",
      prompt:
        "Gates combine into sequences, applied left to right. Apply X then H to \\( |0\\rangle \\) and measure many fresh qubits. What distribution do you expect?",
      options: [
        {
          id: "half",
          label: "About half 0 and half 1",
          correct: true,
          feedback:
            "Correct. \\( X|0\\rangle = |1\\rangle \\), then \\( H|1\\rangle = |-\\rangle \\), a 50/50 state,  so measurements split evenly.",
        },
        {
          id: "one",
          label: "Always 1",
          feedback: "X gives \\( |1\\rangle \\), but the following H spreads it into a 50/50 superposition.",
        },
        {
          id: "zero",
          label: "Always 0",
          feedback: "Neither gate forces 0. After X then H the qubit is a 50/50 superposition.",
        },
      ],
      teaching: "Gates act in sequence; each transforms the state the previous one produced.",
    },
    {
      type: "gate-lab",
      id: "explore",
      title: "Build a sequence",
      body: "Build short sequences and predict the measurement before you run it. Compare X then H against H then X.",
      allowedGates: ["X", "H", "Z"],
      start: "0",
      measure: true,
      teaching:
        "Order matters. \\( HX|0\\rangle = |-\\rangle \\) and \\( XH|0\\rangle = |+\\rangle \\) both measure 50/50, yet they are different states,  a relative-phase difference you could expose with another H or a Z.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Did order change the statistics?",
      prompt:
        "You built X then H, and H then X, from \\( |0\\rangle \\). What did their measurement histograms look like?",
      options: [
        {
          id: "same-stats",
          label: "Both about 50/50, even though the states differ",
          correct: true,
          feedback:
            "Correct. \\( XH|0\\rangle=|+\\rangle \\) and \\( HX|0\\rangle=|-\\rangle \\): identical 0/1 statistics, different relative phase.",
        },
        {
          id: "different",
          label: "Clearly different histograms",
          feedback: "Both end on the equator, so both measure 50/50. The difference is phase, hidden from this measurement.",
        },
        {
          id: "definite",
          label: "Both definite (all 0 or all 1)",
          feedback: "Each sequence ends in a superposition, so both measure 50/50, not a definite outcome.",
        },
      ],
      teaching: "Equal 0/1 statistics can still hide different states.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Reading a circuit",
      body: [
        "A circuit is an ordered list of gates, read left to right, followed by measurement.",
        "Order matters: most gates do not commute, so \\( HX \\) and \\( XH \\) generally differ.",
      ],
      misconception:
        "Two sequences with the same 0/1 statistics are not necessarily the same operation. \\( XH \\) and \\( HX \\) both give 50/50 but differ by phase, which becomes visible after further gates.",
      realWorld:
        "Real quantum programs in tools like Qiskit are exactly these ordered gate lists, compiled onto a chip and then measured.",
      resources: [
        {
          label: "IBM Quantum Learning: circuits",
          url: "https://learning.quantum.ibm.com/course/quantum-computing-in-practice/running-quantum-circuits",
          description: "Building and reading quantum circuits.",
          kind: "docs",
        },
      ],
    },
    {
      type: "worked-example",
      id: "worked-sequence",
      title: "Worked example: reach a target",
      intro: "Goal: starting from \\( |0\\rangle \\), use X and H to prepare \\( |-\\rangle \\).",
      steps: [
        "We begin at \\( |0\\rangle \\) and want to reach \\( |-\\rangle \\).",
        "Recall that \\( H|1\\rangle = |-\\rangle \\): if we can first reach \\( |1\\rangle \\), one H finishes the job.",
        "Apply X to \\( |0\\rangle \\): \\( X|0\\rangle = |1\\rangle \\).",
      ],
      finalPrompt: "Which gate should come next to reach \\( |-\\rangle \\)?",
      options: [
        {
          id: "h",
          label: "Apply H",
          correct: true,
          feedback: "Correct. \\( H|1\\rangle = |-\\rangle \\), so the sequence X then H reaches the target.",
        },
        {
          id: "x",
          label: "Apply X again",
          feedback: "A second X returns you to \\( |0\\rangle \\). You still need to spread \\( |1\\rangle \\) into a superposition.",
        },
        {
          id: "z",
          label: "Apply Z",
          feedback: "Z only flips the phase of \\( |1\\rangle \\); it cannot create the superposition you need.",
        },
      ],
      teaching: "Read sequences left to right: each gate transforms the state the previous one produced.",
    },
    {
      type: "prediction",
      id: "q-hhx",
      title: "Predict the output",
      prompt: "Apply H, then H, then X to \\( |0\\rangle \\), and measure. What does it return?",
      options: [
        {
          id: "one",
          label: "1",
          correct: true,
          feedback: "Correct. \\( HH = I \\) returns \\( |0\\rangle \\), then X flips it to \\( |1\\rangle \\).",
        },
        {
          id: "zero",
          label: "0",
          feedback: "The two H gates cancel to \\( |0\\rangle \\), but the final X flips it to \\( |1\\rangle \\).",
        },
        {
          id: "mix",
          label: "50/50",
          feedback: "The H gates cancel, leaving a definite state that X flips to \\( |1\\rangle \\).",
        },
      ],
      teaching: "Simplify a sequence by cancelling inverses: here \\( HH = I \\), leaving just X.",
    },
    {
      type: "prediction",
      id: "q-order",
      title: "Does order matter?",
      prompt:
        "Both X then H and H then X, applied to \\( |0\\rangle \\), give 50/50 when measured. What is true?",
      options: [
        {
          id: "diff",
          label: "They reach different states that share the same 0/1 statistics",
          correct: true,
          feedback:
            "Correct. \\( XH|0\\rangle = |+\\rangle \\) and \\( HX|0\\rangle = |-\\rangle \\): same 50/50 measurement, different relative phase.",
        },
        {
          id: "same",
          label: "They are the same operation",
          feedback:
            "They differ by phase. A later H would send \\( |+\\rangle \\) to \\( |0\\rangle \\) but \\( |-\\rangle \\) to \\( |1\\rangle \\).",
        },
      ],
      teaching: "Equal measurement statistics do not imply equal states.",
    },
    {
      type: "gate-lab",
      id: "reach-minus",
      title: "Build a target state",
      body: "Put the order to work. Starting from \\( |0\\rangle \\), build a sequence that reaches \\( |-\\rangle \\).",
      allowedGates: ["X", "H", "Z"],
      start: "0",
      target: "-",
      correctFeedback:
        "Correct. One route is X then H \\( (|0\\rangle \\to |1\\rangle \\to |-\\rangle) \\); another is H then Z. Order and choice of gates both matter.",
      incorrectFeedback:
        "Not yet. Recall equator states and how phase is set.",
      teaching: "Several short sequences can reach the same state; the order determines which.",
    },
    {
      type: "circuit-builder",
      id: "build-5050",
      title: "Assemble a fair coin",
      prompt: "Build a circuit on the wire that measures 0 and 1 equally often.",
      targetPOne: 50,
      correctFeedback:
        "Correct. A single H spreads |0⟩ into a 50/50 superposition. Adding X before or after still measures 50/50.",
      feedbackMeasuredEmpty:
        "An empty circuit leaves |0⟩, which always measures 0. Add a gate that creates a superposition.",
      feedbackDefinite:
        "X alone keeps the qubit definite (all 0 or all 1). You need H to make an even split.",
      incorrectFeedback:
        "Not yet. Recall what H does from a definite state.",
      teaching: "H is the gate that turns a definite state into a 50/50 measurement.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You combined gates into circuits:",
      points: [
        "A circuit is an ordered sequence of gates, read left to right.",
        "Order matters: most gates do not commute.",
        "Inverses cancel, e.g. \\( HH = I \\), which simplifies a sequence.",
      ],
      next: "Reversibility,  every gate sequence can be undone.",
    },
  ],
};

const lesson5: Lesson = {
  id: "interference",
  title: "Probability Amplitudes",
  description: "Discover that probability is the amplitude squared.",
  badge: {
    id: INTERFERENCE_EXPLORER_BADGE,
    title: "Probability Amplitudes",
    subtitle: "Completed Probability Amplitudes",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Amplitudes vs probabilities",
      prompt:
        "Quantum outcomes are set by amplitudes, and the probability is the amplitude squared: \\( P = |\\alpha|^2 \\). If the amplitude doubles, what happens to the probability?",
      options: [
        {
          id: "quad",
          label: "It quadruples",
          correct: true,
          feedback: "Correct. Squaring means doubling the amplitude multiplies the probability by four.",
        },
        {
          id: "double",
          label: "It doubles",
          feedback: "A natural guess, but probability is the amplitude squared,  doubling α gives four times the probability.",
        },
        {
          id: "same",
          label: "It stays the same",
          feedback: "The probability depends on the amplitude: a larger amplitude means a larger probability.",
        },
      ],
      teaching: "Probability is the square of the amplitude, so it grows faster than the amplitude.",
    },
    {
      type: "amplitude-explorer",
      id: "explore",
      title: "Slide the amplitude",
      body: "Drag the amplitude from \\( -1 \\) to \\( +1 \\) and watch \\( P = |\\alpha|^2 \\). Set it to 0.3, then 0.6, and compare.",
      teaching:
        "Probability is the amplitude squared: \\( \\alpha = 0.3 \\) gives \\( P = 0.09 \\), while \\( \\alpha = 0.6 \\) gives \\( P = 0.36 \\),  four times as large. Negative amplitudes give the same probability as positive ones; the sign stays hidden until amplitudes interfere.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "From 0.3 to 0.6",
      prompt:
        "When you doubled the amplitude from \\( 0.3 \\) to \\( 0.6 \\), the probability went from \\( 0.09 \\) to what?",
      options: [
        {
          id: "036",
          label: "0.36,  about four times larger",
          correct: true,
          feedback: "Correct. \\( (0.6)^2 = 0.36 \\). Doubling the amplitude quadrupled the probability.",
        },
        {
          id: "018",
          label: "0.18,  twice as large",
          feedback: "Probability is the square, not the amplitude. \\( (0.6)^2 = 0.36 \\), four times \\( 0.09 \\).",
        },
        {
          id: "06",
          label: "0.6,  equal to the amplitude",
          feedback: "The amplitude and probability are different numbers: \\( P = (0.6)^2 = 0.36 \\).",
        },
      ],
      teaching: "Squaring makes probability grow quadratically with amplitude.",
    },
    {
      type: "informative",
      id: "explain",
      title: "What an amplitude is",
      body: [
        "Each outcome carries an amplitude, which can be positive or negative. The probability is its square: \\( P = |\\alpha|^2 \\).",
        "The amplitude also has a sign. That sign stays invisible to a single measurement, but it becomes decisive the moment two amplitudes combine.",
      ],
      misconception: "Amplitude is not probability. An amplitude of \\( 0.5 \\) gives a probability of \\( 0.25 \\), not \\( 0.5 \\).",
      whyMatters:
        "Amplitudes are the secret ingredient behind every quantum speedup. Because they can be negative, they can cancel, and that cancellation is where the power comes from.",
      memoryConnection:
        "Back in Unit 1, measurement only ever showed you probabilities. The sign of an amplitude is exactly the information a single measurement hides.",
      resources: [
        {
          label: "Probability amplitude (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Probability_amplitude",
          description: "Amplitudes and the Born rule.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-neg",
      title: "A negative amplitude",
      prompt: "An outcome has amplitude \\( \\alpha = -0.5 \\). What is its probability?",
      options: [
        {
          id: "025",
          label: "0.25",
          correct: true,
          feedback: "Correct. \\( P = |-0.5|^2 = 0.25 \\). The sign does not affect the probability.",
        },
        {
          id: "05",
          label: "0.5",
          feedback: "That is the amplitude's magnitude, not its square. \\( P = (0.5)^2 = 0.25 \\).",
        },
        {
          id: "neg",
          label: "-0.25",
          feedback: "Probabilities cannot be negative. Squaring removes the sign: \\( P = 0.25 \\).",
        },
      ],
      teaching: "Squaring makes probability nonnegative and independent of the amplitude's sign.",
    },
    {
      type: "prediction",
      id: "q-sign",
      title: "Same probability, different sign",
      prompt: "Two outcomes have amplitudes \\( +0.7 \\) and \\( -0.7 \\). Do they have the same probability?",
      options: [
        {
          id: "yes",
          label: "Yes,  both are 0.49",
          correct: true,
          feedback: "Correct. \\( (0.7)^2 = (-0.7)^2 = 0.49 \\). The sign is hidden in a single probability, but it matters when amplitudes meet.",
        },
        {
          id: "no",
          label: "No,  opposite signs give different probabilities",
          feedback: "Squaring removes the sign, so both give \\( 0.49 \\). The sign only shows up through interference.",
        },
      ],
      teaching: "An amplitude's sign is invisible to one outcome's probability, yet it drives interference.",
    },
    {
      type: "amplitude-explorer",
      id: "explore-quarter",
      title: "Find the amplitude for a quarter",
      body: "Work it backwards. Drag the amplitude until the probability reads about \\( 0.25 \\). What amplitude did that take?",
      teaching:
        "An amplitude of \\( \\pm 0.5 \\) gives \\( P = 0.25 \\),  both signs work, since \\( (0.5)^2 = (-0.5)^2 \\). To quarter the probability you do not quarter the amplitude.",
    },
    {
      type: "challenge",
      id: "prepare-25",
      title: "Prepare a quarter",
      prompt:
        "Translate amplitude into a prepared qubit: set its outcome so \\( P(1)=25\\% \\),  the probability an amplitude of \\( 0.5 \\) produces.",
      targetProbability: 25,
      tolerance: 5,
      correctFeedback:
        "Correct. \\( P(1)=25\\% \\) is exactly \\( |\\alpha|^2 \\) for \\( \\alpha=0.5 \\). Amplitude and probability are linked by the square.",
      incorrectFeedback:
        "Not yet. Recall how amplitudes become probabilities.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You separated amplitudes from probabilities:",
      points: [
        "Each outcome has an amplitude; the probability is its square, \\( P = |\\alpha|^2 \\).",
        "Doubling an amplitude quadruples its probability.",
        "The amplitude's sign is hidden in a single probability but matters when amplitudes combine.",
      ],
      next: "We've seen amplitudes determine probabilities. Next, what happens when two amplitudes combine.",
    },
  ],
};

const lessonBloch: Lesson = {
  id: "bloch-sphere",
  title: "Bloch Sphere Intuition",
  description: "Visualize every single-qubit state.",
  badge: {
    id: BLOCH_NAVIGATOR_BADGE,
    title: "Bloch Navigator",
    subtitle: "Completed Bloch Sphere Intuition",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Where does a state live before measurement?",
      prompt:
        "We just saw that measurement yields one definite outcome with fixed probabilities \\( P(0) \\) and \\( P(1) \\). But what does the qubit look like before measurement? If \\( |0\\rangle \\) is the north pole of a sphere and \\( |1\\rangle \\) is the south pole, where should a state with \\( P(0)=P(1) \\) sit?",
      options: [
        {
          id: "equator",
          label: "On the equator, halfway between the poles",
          correct: true,
          feedback:
            "Correct. Equal outcome probabilities place the state halfway between the poles,  on the equator.",
        },
        {
          id: "pole",
          label: "Near one of the poles",
          feedback:
            "A pole is a definite state: \\( |0\\rangle \\) gives \\( P(0)=1 \\). Equal probabilities sit halfway between the poles.",
        },
        {
          id: "inside",
          label: "Somewhere inside the sphere",
          feedback:
            "Pure states live on the surface. Interior points describe mixed (uncertain) states, which we don't need yet.",
        },
      ],
      teaching:
        "Pure single-qubit states are points on the surface of the Bloch sphere; equal-probability states sit on the equator.",
    },
    {
      type: "bloch-explorer",
      id: "explore",
      title: "Move the state around",
      body: "Drag \\( θ \\) to move between the poles and watch \\( P(1)=sin^{2}(θ/2) \\). Then drag \\( φ \\) and watch carefully what the probabilities do,  and do not do.",
      showPhi: true,
      teaching:
        "\\( θ \\) sets the measurement probabilities; \\( φ \\) rotates the state around the equator without changing \\( P(0) \\) or \\( P(1) \\). That second angle is the relative phase, the focus of the next lesson.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What did φ change?",
      prompt:
        "While you dragged \\( φ \\) around the equator, what happened to \\( P(0) \\) and \\( P(1) \\) in the bars?",
      options: [
        {
          id: "nothing",
          label: "Nothing,  they stayed fixed",
          correct: true,
          feedback:
            "Correct. \\( φ \\) slides the state around the equator without touching the Z-basis probabilities. Only \\( θ \\) moved the bars.",
        },
        {
          id: "swapped",
          label: "They swapped",
          feedback:
            "Swapping \\( P(0) \\) and \\( P(1) \\) is what crossing the equator (changing \\( θ \\)) does, not \\( φ \\).",
        },
        {
          id: "both50",
          label: "Both went to 50%",
          feedback: "\\( φ \\) does not force a 50/50 split; it leaves whatever \\( θ \\) set unchanged.",
        },
      ],
      teaching: "Z-basis probabilities depend only on \\( θ \\); \\( φ \\) is invisible to them.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Reading the sphere",
      body: [
        "Every pure single-qubit state is one point on the Bloch sphere: \\( |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ \\).",
        "The polar angle \\( θ \\) fixes the measurement statistics: \\( P(0)=cos^{2}(θ/2) \\) and \\( P(1)=sin^{2}(θ/2) \\). The poles are the definite states \\( |0⟩ \\) and \\( |1⟩ \\); the equator holds the equal superpositions.",
        "The azimuth \\( φ \\) is the relative phase. It slides the point around the equator without changing any probability measurable in the standard (Z) basis.",
      ],
      misconception:
        "The Bloch sphere is not physical space. The arrow does not point anywhere in the lab; it is a compact map of the qubit's two real parameters, \\( θ \\) and \\( φ \\).",
      realWorld:
        "Real spin qubits in MRI and NMR machines are steered with pulses described exactly as rotations on this sphere, so it doubles as an engineer's control panel.",
      resources: [
        {
          label: "Bloch sphere (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Bloch_sphere",
          description: "Geometry and conventions of the Bloch sphere.",
          kind: "article",
        },
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/course/utility-scale-quantum-computing/lesson-02-bits-gates-and-circuits",
          description: "Single-qubit states and the Bloch sphere.",
          kind: "docs",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-locate",
      title: "Locate a state",
      prompt: "Which \\( (θ, φ) \\) corresponds to the state \\( |1⟩ \\)?",
      options: [
        {
          id: "south",
          label: "\\( θ = 180° \\), with \\( φ \\) irrelevant",
          correct: true,
          feedback:
            "Correct. \\( θ=180° \\) is the south pole, \\( |1⟩ \\). There the \\( |0⟩ \\) amplitude is zero, so \\( φ \\) has nothing to act on.",
        },
        {
          id: "north",
          label: "\\( θ = 0° \\), \\( φ = 180° \\)",
          feedback: "\\( θ=0° \\) is the north pole, \\( |0⟩ \\), not \\( |1⟩ \\).",
        },
        {
          id: "equator",
          label: "\\( θ = 90° \\), \\( φ = 90° \\)",
          feedback: "\\( θ=90° \\) is on the equator,  an equal superposition, not the definite state \\( |1⟩ \\).",
        },
      ],
      teaching: "At the poles the state is definite, and the relative phase has nothing to act on.",
    },
    {
      type: "prediction",
      id: "q-5050",
      title: "Reasoning from data",
      prompt:
        "You measure a qubit in the Z basis many times and get roughly 50% zeros and 50% ones. What does that fix?",
      options: [
        {
          id: "theta",
          label: "\\( θ ≈ 90° \\), but the data says nothing about \\( φ \\)",
          correct: true,
          feedback:
            "Correct. Equal odds fix \\( θ \\) to the equator, but Z-basis statistics are independent of \\( φ \\).",
        },
        {
          id: "plus",
          label: "The state must be exactly \\( |+⟩ \\)",
          feedback:
            "\\( |+⟩ \\) gives 50/50, but so does any equator state. Z-basis counts cannot single it out.",
        },
        {
          id: "phi",
          label: "\\( φ ≈ 45° \\)",
          feedback: "Z-basis probabilities do not depend on \\( φ \\), so this measurement cannot pin it down.",
        },
      ],
      teaching: "\\( θ \\) controls Z-basis probabilities; \\( φ \\) is invisible to a Z-basis measurement.",
    },
    {
      type: "bloch-explorer",
      id: "drive-theta",
      title: "Drive the state to a pole",
      body: "Now ignore \\( φ \\). Drag \\( θ \\) until the bars read \\( P(1)=100\\% \\). Which point on the sphere did you reach?",
      showPhi: false,
      teaching:
        "At \\( θ=180° \\) the state sits at the south pole, the definite \\( |1\\rangle \\). Sweeping \\( θ \\) from \\( 0° \\) to \\( 180° \\) carries \\( P(1) \\) from 0 to 100%.",
    },
    {
      type: "challenge",
      id: "prepare-75",
      title: "Prepare a target state",
      prompt:
        "Using the idea that \\( θ \\) sets the odds, prepare a state that measures 1 about 75% of the time: set \\( P(1)=75\\% \\).",
      targetProbability: 75,
      tolerance: 5,
      correctFeedback:
        "Correct. That places the state off the equator toward the south pole, with \\( P(1)\\approx 75\\% \\),  a specific \\( θ \\) you dialed in.",
      incorrectFeedback:
        "Not yet. Recall how amplitudes map to probabilities, then adjust.",
    },
    {
      type: "prediction",
      id: "q-same-data",
      title: "Same data, same state?",
      prompt: "Two qubits each measure 50/50 in the Z basis. Must they be the same state?",
      options: [
        {
          id: "no",
          label: "No,  they share \\( θ=90° \\) but can differ in \\( φ \\)",
          correct: true,
          feedback:
            "Correct. Z-basis data fixes \\( θ \\) only. The two could be \\( |+\\rangle \\) and \\( |-\\rangle \\), which differ entirely in \\( φ \\).",
        },
        {
          id: "yes",
          label: "Yes,  equal probabilities mean an identical state",
          feedback:
            "Equal Z-basis odds fix only \\( θ \\). The relative phase \\( φ \\) is unconstrained, so the states can differ.",
        },
      ],
      teaching: "Measurement in one basis under-determines the state; \\( φ \\) stays hidden.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You mapped qubit states onto the Bloch sphere:",
      points: [
        "Pure states are points on the sphere; poles are \\( |0⟩ \\) and \\( |1⟩ \\), the equator is equal superpositions.",
        "\\( θ \\) sets the measurement probabilities: \\( P(1)=sin^{2}(θ/2) \\).",
        "\\( φ \\) is the relative phase: invisible in the Z basis.",
      ],
      next: "Global vs Relative Phase,  why that second angle \\( φ \\) is physically real.",
    },
  ],
};

const lessonPhase: Lesson = {
  id: "relative-phase",
  title: "Global vs Relative Phase",
  description: "Learn which phases can actually be observed.",
  badge: {
    id: PHASE_AWARE_BADGE,
    title: "Phase Aware",
    subtitle: "Completed Global vs Relative Phase",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "A phase you can never see",
      prompt:
        "On the Bloch sphere, \\( θ \\) set the probabilities and \\( φ \\) moved the state around the equator without changing them. So is phase just bookkeeping? Two labs prepare \\( |ψ⟩ \\) and \\( e^{iα}|ψ⟩ \\),  the same state times one overall phase factor. Can any experiment tell the two qubits apart?",
      options: [
        {
          id: "no",
          label: "No,  an overall phase has no observable consequence",
          correct: true,
          feedback:
            "Correct. A global phase multiplies every amplitude equally, so it cancels in every probability.",
        },
        {
          id: "z",
          label: "Yes, by measuring in the Z basis",
          feedback:
            "Probabilities are squared magnitudes; the factor \\( e^{iα} \\) has magnitude 1, so it cannot change them.",
        },
        {
          id: "x",
          label: "Yes, by measuring in the X basis",
          feedback: "No basis helps. A global phase factors out of the whole state and cancels everywhere.",
        },
      ],
      teaching: "A global phase is unobservable. What matters is the relative phase between \\( |0⟩ \\) and \\( |1⟩ \\).",
    },
    {
      type: "bloch-explorer",
      id: "explore",
      title: "Relative phase in two bases",
      body: "Set \\( θ \\) to 90° (the equator), then sweep \\( φ \\). In the Z basis the bars never move. Switch to the X basis and sweep \\( φ \\) again.",
      showPhi: true,
      showXMeasurement: true,
      teaching:
        "\\( φ \\) is invisible in the Z basis but decisive in the X basis: \\( φ=0 \\) is \\( |+⟩ \\) (measures + with certainty) and \\( φ=180° \\) is \\( |−⟩ \\) (measures − with certainty).",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Which measurement moved?",
      prompt:
        "With \\( θ=90° \\), you swept \\( φ \\) and compared the Z and X bases. Which measurement's bars actually changed?",
      options: [
        {
          id: "x",
          label: "Only the X-basis bars changed",
          correct: true,
          feedback:
            "Correct. \\( φ \\) leaves Z-basis odds at 50/50 but drives the X-basis result from + to −.",
        },
        {
          id: "z",
          label: "Only the Z-basis bars changed",
          feedback: "Z-basis probabilities stayed 50/50 the whole sweep; the X basis is where \\( φ \\) appeared.",
        },
        {
          id: "both",
          label: "Both changed together",
          feedback: "The Z basis never moved. Only the X-basis outcome tracked \\( φ \\).",
        },
      ],
      teaching: "A relative phase is hidden in one basis and decisive in another.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Global out, relative in",
      body: [
        "A global phase multiplies the whole state: \\( e^{iα}|ψ⟩ \\). Because every probability is the squared magnitude of an amplitude, the factor \\( e^{iα} \\) (magnitude 1) cancels everywhere. It is not physical,  which is why the Bloch sphere has no coordinate for it.",
        "A relative phase sits between the components: \\( cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩ \\). It is the azimuth \\( φ \\). It leaves Z-basis probabilities untouched but changes results in other bases.",
        "This relative phase is exactly the handle that interference will use later.",
      ],
      misconception:
        "Global phase does not affect measurement statistics in any basis. Only the relative phase between \\( |0⟩ \\) and \\( |1⟩ \\) is physical.",
      realWorld:
        "Relative phase is what atomic clocks and quantum interferometers actually read out, and it is the quantity quantum algorithms steer to compute their answers.",
      resources: [
        {
          label: "Global phase (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Phase_factor#Global_phase",
          description: "Why global phase is physically irrelevant.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-which",
      title: "Which phase matters?",
      prompt: "Which kind of phase can change the outcome of some measurement?",
      options: [
        {
          id: "relative",
          label: "Relative phase between \\( |0⟩ \\) and \\( |1⟩ \\)",
          correct: true,
          feedback: "Correct. Relative phase changes results in bases other than Z, so it is physical.",
        },
        {
          id: "global",
          label: "A global phase on the whole state",
          feedback: "A global phase cancels in every probability and can never be observed.",
        },
        {
          id: "neither",
          label: "Neither,  phases are only bookkeeping",
          feedback: "Relative phase is observable: \\( |+⟩ \\) and \\( |−⟩ \\) differ only by it, yet are perfectly distinguishable.",
        },
      ],
      teaching: "Relative phase is physical; global phase is not.",
    },
    {
      type: "prediction",
      id: "q-distinguish",
      title: "Telling |+⟩ from |−⟩",
      prompt:
        "\\( |+⟩ \\) and \\( |−⟩ \\) differ only by a relative phase, and both give 50/50 in the Z basis. How do you distinguish them?",
      options: [
        {
          id: "h",
          label: "Apply H, then measure (measure in the X basis)",
          correct: true,
          feedback: "Correct. H maps \\( |+⟩→|0⟩ \\) and \\( |−⟩→|1⟩ \\), so an X-basis measurement separates them.",
        },
        {
          id: "morez",
          label: "Measure many more times in the Z basis",
          feedback: "More Z-basis shots only confirm 50/50 for both; they can never separate them.",
        },
        {
          id: "cant",
          label: "They cannot be distinguished",
          feedback: "They are orthogonal, so they are perfectly distinguishable,  just not in the Z basis.",
        },
      ],
      teaching: "Choosing the right basis turns a hidden relative phase into a definite outcome.",
    },
    {
      type: "gate-lab",
      id: "reveal-phase",
      title: "Make the phase visible",
      body: "Confirm it with gates. From \\( |0\\rangle \\), press H to reach \\( |+\\rangle \\), then Z to flip the relative phase, then H again. Measure 50 fresh qubits.",
      allowedGates: ["H", "Z"],
      start: "0",
      measure: true,
      teaching:
        "\\( H \\) converts \\( φ \\) into a 0/1 outcome: \\( |+\\rangle \\to |0\\rangle \\) and \\( |-\\rangle \\to |1\\rangle \\). The middle Z is the hidden phase flip, now plainly visible after the second H.",
    },
    {
      type: "gate-lab",
      id: "reach-minus",
      title: "Prepare the phase partner",
      body: "Starting from \\( |0\\rangle \\), reach \\( |-\\rangle \\): the equal superposition carrying the opposite relative phase to \\( |+\\rangle \\).",
      allowedGates: ["X", "H", "Z"],
      start: "0",
      target: "-",
      correctFeedback:
        "Correct. \\( |-\\rangle \\) sits opposite \\( |+\\rangle \\) on the equator,  same 50/50 in Z, opposite phase. H then Z (or X then H) reaches it.",
      incorrectFeedback:
        "Not yet. Recall how H and Z build equator states.",
      teaching: "\\( |-\\rangle \\) differs from \\( |+\\rangle \\) only by relative phase, yet H separates them cleanly.",
    },
    {
      type: "prediction",
      id: "q-global-basis",
      title: "Can any basis see a global phase?",
      prompt:
        "Two qubits are \\( |ψ⟩ \\) and \\( e^{iα}|ψ⟩ \\). Is there any measurement basis that can tell them apart?",
      options: [
        {
          id: "none",
          label: "No basis can,  a global phase cancels everywhere",
          correct: true,
          feedback:
            "Correct. \\( e^{iα} \\) multiplies every amplitude equally, so it drops out of every probability in every basis.",
        },
        {
          id: "x",
          label: "Yes, the X basis reveals it",
          feedback: "The X basis exposes relative phase, not a global one. A global factor still cancels there.",
        },
      ],
      teaching: "Global phase is unobservable in every basis; only relative phase is physical.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You separated the two kinds of phase:",
      points: [
        "A global phase multiplies the whole state and is never observable.",
        "A relative phase (the Bloch azimuth \\( φ \\)) is real: invisible in Z, decisive in other bases.",
        "Switching basis turns a hidden relative phase into a measurable outcome.",
      ],
      next: "No-Cloning Theorem,  why a state carrying this hidden structure cannot be copied.",
    },
  ],
};

const lessonNoCloning: Lesson = {
  id: "no-cloning",
  title: "No-Cloning Theorem",
  description: "Discover why unknown quantum states cannot be copied.",
  badge: {
    id: NO_CLONING_BADGE,
    title: "No-Cloning",
    subtitle: "Completed No-Cloning Theorem",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Can you photocopy a qubit?",
      prompt:
        "We have seen a qubit holds more than any single measurement reveals,  a full \\( (θ, φ) \\), including a relative phase. Given an unknown state \\( |ψ⟩ \\) and a blank qubit \\( |0⟩ \\), can one circuit copy \\( |ψ⟩ \\) onto the blank qubit for every possible \\( |ψ⟩ \\)?",
      options: [
        {
          id: "no",
          label: "No,  no single circuit can copy an arbitrary unknown state",
          correct: true,
          feedback: "Correct. This is the no-cloning theorem. A circuit can copy basis states, but not superpositions.",
        },
        {
          id: "cnot",
          label: "Yes,  a CNOT copies the first qubit onto the second",
          feedback: "CNOT copies \\( |0⟩ \\) and \\( |1⟩ \\), but on a superposition it entangles instead of copying, as you will see.",
        },
        {
          id: "measure",
          label: "Yes,  measure \\( |ψ⟩ \\), then prepare a matching qubit",
          feedback: "Measurement collapses \\( |ψ⟩ \\) to 0 or 1, destroying the superposition you wanted to copy.",
        },
      ],
      teaching: "Copying basis states is easy; copying an arbitrary superposition is impossible with any fixed circuit.",
    },
    {
      type: "two-qubit",
      id: "explore",
      title: "Try to build a copier",
      body: "A CNOT with q0 as control should copy q0 onto q1. Test it on \\( |0⟩ \\) and \\( |1⟩ \\) (use X on q0). Then put q0 into \\( |+⟩ \\) (press H on q0) before the CNOT and measure. If it truly copied, q1 would be an independent \\( |+⟩ \\).",
      teaching:
        "On \\( |+⟩ \\), H then CNOT yields \\( (|00⟩ + |11⟩)/√2 \\),  only 00 and 11, perfectly correlated. That is an entangled Bell state, not two independent copies (which would give all four outcomes near 25%).",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What did the copier produce?",
      prompt:
        "With q0 in \\( |+\\rangle \\), after CNOT you measured both qubits many times. Which outcomes showed up?",
      options: [
        {
          id: "corr",
          label: "Only 00 and 11, about half each",
          correct: true,
          feedback:
            "Correct. The two qubits are perfectly correlated,  an entangled Bell state, not two independent copies.",
        },
        {
          id: "all",
          label: "All four outcomes near 25%",
          feedback: "That is what two independent copies would give. The CNOT instead produced only 00 and 11.",
        },
        {
          id: "plus",
          label: "Both qubits measured + every time",
          feedback: "A Z-basis measurement returns 0s and 1s, not +. You saw correlated results,  only 00 and 11.",
        },
      ],
      teaching: "Correlation (only 00/11) signals entanglement, not duplication.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Why copying fails",
      body: [
        "Suppose one circuit copied every state: \\( |ψ⟩|0⟩ → |ψ⟩|ψ⟩ \\). Gates are linear, so fixing its action on \\( |0⟩ \\) and \\( |1⟩ \\) fixes it on every superposition. Copying \\( |0⟩→|00⟩ \\) and \\( |1⟩→|11⟩ \\) then forces \\( |+⟩|0⟩ → (|00⟩ + |11⟩)/√2 \\), which is entangled,  not \\( |+⟩|+⟩ \\). The assumption breaks.",
        "Measurement is no escape: observing \\( |ψ⟩ \\) collapses it to a single outcome and erases the amplitudes you wanted to duplicate.",
        "This is the no-cloning theorem. It follows from linearity itself, and it underwrites quantum key distribution: an eavesdropper cannot copy qubits in transit without disturbing them.",
      ],
      misconception:
        "Copying the basis states \\( |0⟩ \\) and \\( |1⟩ \\) does not mean arbitrary states can be copied. The same circuit entangles a superposition instead of duplicating it.",
      realWorld:
        "No-cloning is the security behind quantum key distribution on real fiber and satellite links: an eavesdropper cannot copy qubits in transit without disturbing them and being noticed.",
      resources: [
        {
          label: "No-cloning theorem (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/No-cloning_theorem",
          description: "Statement and short proof of the theorem.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-copies",
      title: "What real copies would look like",
      prompt:
        "Building \\( |+⟩ \\) on q0 and applying CNOT gives only 00 and 11 (50/50). If q1 were instead an independent copy of \\( |+⟩ \\), what would measuring both qubits give?",
      options: [
        {
          id: "uniform",
          label: "All four outcomes (00, 01, 10, 11) near 25% each",
          correct: true,
          feedback: "Correct. Two independent \\( |+⟩ \\) qubits are uncorrelated, so each outcome occurs about a quarter of the time.",
        },
        {
          id: "same",
          label: "Only 00 and 11, exactly as the circuit produced",
          feedback: "That is the entangled, correlated result. Independent copies would not be correlated.",
        },
        {
          id: "zero",
          label: "Always 00",
          feedback: "Always 00 would mean both qubits are \\( |0⟩ \\), not \\( |+⟩ \\).",
        },
      ],
      teaching: "Correlation (only 00/11) is the signature of entanglement; independence (all four) is what copies would show.",
    },
    {
      type: "prediction",
      id: "q-use",
      title: "A useful consequence",
      prompt: "Which technology relies directly on the impossibility of cloning qubits?",
      options: [
        {
          id: "qkd",
          label: "Quantum key distribution (secure communication)",
          correct: true,
          feedback: "Correct. An eavesdropper cannot copy intercepted qubits without disturbing them, which exposes the attempt.",
        },
        {
          id: "speed",
          label: "Faster classical file copying",
          feedback: "No-cloning concerns unknown quantum states, not classical files, which copy freely.",
        },
        {
          id: "storage",
          label: "Higher-density classical hard drives",
          feedback: "Classical storage is unaffected; no-cloning is a statement about unknown quantum states.",
        },
      ],
      teaching: "No-cloning is a resource: it makes undetectable eavesdropping impossible.",
    },
    {
      type: "two-qubit",
      id: "basis-copy",
      title: "When copying does work",
      body: "Compare the easy case. Leave q0 as \\( |0\\rangle \\), or flip it to \\( |1\\rangle \\) with X, then apply CNOT and measure,  no H this time.",
      teaching:
        "On a basis state the CNOT does copy: \\( |0\\rangle \\) gives 00 and \\( |1\\rangle \\) gives 11, every time. Copying \\( |0\\rangle \\) and \\( |1\\rangle \\) is fine,  it is the superposition in between that cannot be cloned.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Basis states vs superpositions",
      prompt:
        "The same CNOT copied \\( |0\\rangle \\) and \\( |1\\rangle \\) perfectly. Does that mean it also copies \\( |+\\rangle \\)?",
      options: [
        {
          id: "no",
          label: "No,  on \\( |+\\rangle \\) it entangles instead of copying",
          correct: true,
          feedback:
            "Correct. Linearity forces the same circuit to produce the entangled Bell state on \\( |+\\rangle \\), not a second \\( |+\\rangle \\).",
        },
        {
          id: "yes",
          label: "Yes,  if it copies the basis states, it copies everything",
          feedback:
            "Copying the basis states fixes the circuit by linearity, and that fixed circuit entangles \\( |+\\rangle \\) rather than copying it.",
        },
      ],
      teaching: "Copying a basis is not copying every state; linearity rules out a universal copier.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You probed the limits of copying quantum information:",
      points: [
        "A fixed circuit can copy \\( |0⟩ \\) and \\( |1⟩ \\) but not an arbitrary superposition.",
        "On \\( |+⟩ \\), the copier produces an entangled Bell state, not two copies.",
        "No-cloning follows from linearity and enables secure quantum key distribution.",
      ],
      next: "Unit 2: Transforming Information,  the gates that change a qubit's state.",
    },
  ],
};

const lessonPauliZ: Lesson = {
  id: "pauli-z",
  title: "Pauli Z",
  description: "Change phase without changing measurement.",
  badge: { id: PAULI_Z_BADGE, title: "Pauli Z", subtitle: "Completed Pauli Z" },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "A gate you can't see directly",
      prompt:
        "X flipped \\( |0\\rangle \\) and \\( |1\\rangle \\). The Pauli Z gate is different. Apply Z to \\( |0\\rangle \\) and measure in the 0/1 basis,  what changes?",
      options: [
        {
          id: "nothing",
          label: "Nothing in the 0/1 measurement",
          correct: true,
          feedback:
            "Correct. \\( Z|0\\rangle = |0\\rangle \\): the 0/1 outcome is unchanged. Z acts on phase, which this measurement can't see.",
        },
        {
          id: "flip",
          label: "It flips to 1",
          feedback: "That is X, not Z. Z leaves \\( |0\\rangle \\) and \\( |1\\rangle \\) unchanged in the 0/1 measurement.",
        },
        {
          id: "rand",
          label: "It randomizes the outcome",
          feedback: "Z is deterministic and leaves the 0/1 statistics of \\( |0\\rangle \\) untouched.",
        },
      ],
      teaching: "Z does nothing visible to \\( |0\\rangle \\) or \\( |1\\rangle \\) in the 0/1 basis,  its effect is on relative phase.",
    },
    {
      type: "gate-lab",
      id: "explore",
      title: "Z, then interference",
      body: "Apply Z to \\( |0\\rangle \\) and to \\( |1\\rangle \\) and measure,  nothing changes. Now apply H to reach \\( |+\\rangle \\), then Z, then H again, and measure.",
      allowedGates: ["H", "Z"],
      allowStartToggle: true,
      start: "0",
      measure: true,
      teaching:
        "Z leaves \\( |0\\rangle \\) and \\( |1\\rangle \\) alone but flips the relative phase: \\( Z|+\\rangle = |-\\rangle \\). Sandwiched between two H gates, that phase flip becomes a measurable bit flip: \\( HZH|0\\rangle = |1\\rangle \\).",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Where did Z show up?",
      prompt:
        "You applied Z directly to \\( |0\\rangle \\) and \\( |1\\rangle \\) (no change), then ran H, Z, H on \\( |0\\rangle \\). When did Z finally affect the measurement?",
      options: [
        {
          id: "between",
          label: "Only between the two H gates",
          correct: true,
          feedback:
            "Correct. Z does nothing visible to \\( |0\\rangle \\) or \\( |1\\rangle \\), but between two H gates its phase flip becomes a bit flip.",
        },
        {
          id: "direct",
          label: "Right away, on \\( |0\\rangle \\) and \\( |1\\rangle \\)",
          feedback: "Directly on a basis state, Z changed no 0/1 outcome. It only surfaced inside the H–Z–H sandwich.",
        },
        {
          id: "never",
          label: "Never,  Z has no measurable effect",
          feedback: "It had no direct effect, but H, Z, H on \\( |0\\rangle \\) measured 1,  so Z is doing something real.",
        },
      ],
      teaching: "Interference (the H gates) converts Z's hidden phase into a visible outcome.",
    },
    {
      type: "informative",
      id: "explain",
      title: "The Z gate",
      body: [
        "Z is a phase flip: \\( Z|0\\rangle = |0\\rangle \\) and \\( Z|1\\rangle = -|1\\rangle \\). The minus sign is a relative phase.",
        "On the equator it swaps \\( |+\\rangle \\) and \\( |-\\rangle \\). Direct 0/1 measurement can't see it, but interference can: \\( HZH = X \\).",
      ],
      misconception:
        "A gate that leaves measurement probabilities unchanged is not doing nothing. Z changes relative phase, which becomes a real, measurable difference after interference.",
      realWorld:
        "Phase gates like Z are everyday tools on real hardware, used to tune interference and to fix phase errors inside error-correcting codes.",
      resources: [
        {
          label: "Pauli matrices (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Pauli_matrices",
          description: "The X, Y, and Z gates and their effects.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-direct",
      title: "Z then measure",
      prompt: "Apply Z to a qubit in \\( |1\\rangle \\), then measure immediately. What does it return?",
      options: [
        {
          id: "one",
          label: "1",
          correct: true,
          feedback: "Correct. \\( Z|1\\rangle = -|1\\rangle \\); the phase is invisible to a 0/1 measurement, so it returns 1.",
        },
        {
          id: "zero",
          label: "0",
          feedback: "Z does not flip \\( |1\\rangle \\) to \\( |0\\rangle \\). It only adds a phase, so the outcome is still 1.",
        },
      ],
      teaching: "A relative phase on a basis state does not change its 0/1 measurement.",
    },
    {
      type: "prediction",
      id: "q-hzh",
      title: "Z between two H gates",
      prompt: "Apply H, then Z, then H to \\( |0\\rangle \\), and measure. What does it return?",
      options: [
        {
          id: "one",
          label: "1",
          correct: true,
          feedback:
            "Correct. \\( H|0\\rangle = |+\\rangle \\), \\( Z|+\\rangle = |-\\rangle \\), \\( H|-\\rangle = |1\\rangle \\). The hidden phase became a bit flip.",
        },
        {
          id: "zero",
          label: "0",
          feedback: "Without the Z, \\( HH|0\\rangle = |0\\rangle \\). The Z flips \\( |+\\rangle \\) to \\( |-\\rangle \\), so the final H yields \\( |1\\rangle \\).",
        },
        {
          id: "mix",
          label: "50/50",
          feedback: "The final H recombines the superposition into a definite state,  here \\( |1\\rangle \\).",
        },
      ],
      teaching: "Interference converts a relative phase into a measurable outcome: \\( HZH = X \\).",
    },
    {
      type: "gate-lab",
      id: "reach-minus",
      title: "Flip the phase yourself",
      body: "Z swaps \\( |+\\rangle \\) and \\( |-\\rangle \\). Starting from \\( |0\\rangle \\), reach \\( |-\\rangle \\) using H and Z.",
      allowedGates: ["H", "Z"],
      start: "0",
      target: "-",
      correctFeedback:
        "Correct. \\( H|0\\rangle = |+\\rangle \\), then \\( Z|+\\rangle = |-\\rangle \\). Z flipped the relative phase of the superposition.",
      incorrectFeedback:
        "Not yet. Recall how H and Z combine on the equator.",
      teaching: "Z acts on the equator: it turns \\( |+\\rangle \\) into \\( |-\\rangle \\).",
    },
    {
      type: "gate-lab",
      id: "build-hzh",
      title: "Turn phase into a flip",
      body: "Now make the hidden phase visible. From \\( |0\\rangle \\), use only H and Z to reach \\( |1\\rangle \\).",
      allowedGates: ["H", "Z"],
      start: "0",
      target: "1",
      correctFeedback:
        "Correct. \\( H, Z, H \\) sends \\( |0\\rangle \\to |+\\rangle \\to |-\\rangle \\to |1\\rangle \\). The phase flip became a bit flip: \\( HZH = X \\).",
      incorrectFeedback:
        "Not yet. Recall how H gates wrap other operations.",
      teaching: "\\( HZH = X \\): two H gates turn Z's invisible phase flip into a visible bit flip.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Is an invisible gate doing nothing?",
      prompt:
        "Z leaves the 0/1 probabilities of \\( |0\\rangle \\) and \\( |1\\rangle \\) unchanged. Does that mean Z does nothing?",
      options: [
        {
          id: "no",
          label: "No,  it changes relative phase, which interference can reveal",
          correct: true,
          feedback:
            "Correct. The phase is invisible to a direct measurement but becomes a real, measurable difference after interference.",
        },
        {
          id: "yes",
          label: "Yes,  unchanged probabilities mean no effect",
          feedback:
            "\\( HZH|0\\rangle = |1\\rangle \\) proves otherwise. Z changes phase, and interference turns that into a measurable flip.",
        },
      ],
      teaching: "A gate can change a state's phase while leaving its direct measurement statistics untouched.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You met a gate that hides in plain sight:",
      points: [
        "Z is a phase flip: \\( Z|0\\rangle = |0\\rangle \\), \\( Z|1\\rangle = -|1\\rangle \\).",
        "It is invisible to a direct 0/1 measurement but swaps \\( |+\\rangle \\) and \\( |-\\rangle \\).",
        "Interference exposes the phase: \\( HZH = X \\).",
      ],
      next: "Hadamard,  the gate that creates and undoes superposition.",
    },
  ],
};

const lessonHadamard: Lesson = {
  id: "hadamard",
  title: "Hadamard Gate",
  description: "Create and recombine superposition.",
  badge: { id: HADAMARD_BADGE, title: "Hadamard", subtitle: "Completed Hadamard Gate" },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Making a superposition",
      prompt:
        "Z needed a superposition to reveal its effect. The Hadamard gate creates one. Apply H to \\( |0\\rangle \\) and measure many fresh qubits,  what distribution do you expect?",
      options: [
        {
          id: "half",
          label: "About half 0 and half 1",
          correct: true,
          feedback: "Correct. \\( H|0\\rangle = |+\\rangle \\), an even superposition, so measurements split roughly 50/50.",
        },
        {
          id: "zero",
          label: "Always 0",
          feedback: "H does not leave \\( |0\\rangle \\) unchanged; it spreads it into a 50/50 superposition.",
        },
        {
          id: "one",
          label: "Always 1",
          feedback: "H does not produce a definite 1; it produces an even superposition.",
        },
      ],
      teaching: "H turns a definite state into an equal superposition.",
    },
    {
      type: "gate-lab",
      id: "explore",
      title: "Apply H, then undo it",
      body: "Apply H to \\( |0\\rangle \\) and measure 50 fresh qubits. Then apply H a second time and measure again.",
      allowedGates: ["H"],
      start: "0",
      measure: true,
      teaching:
        "\\( H|0\\rangle = |+\\rangle \\) (50/50). Applying H again returns \\( |0\\rangle \\): \\( HH = I \\). H both creates superposition and recombines it.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What did the second H do?",
      prompt:
        "After one H the qubit measured 50/50. After a second H, what did the histogram show?",
      options: [
        {
          id: "zero",
          label: "0 every time",
          correct: true,
          feedback: "Correct. The second H recombined \\( |+\\rangle \\) back into \\( |0\\rangle \\): \\( HH = I \\).",
        },
        {
          id: "still",
          label: "Still 50/50",
          feedback: "A second H does not keep spreading the state; it recombines it into the definite \\( |0\\rangle \\).",
        },
        {
          id: "ones",
          label: "1 every time",
          feedback: "Two H gates return \\( |0\\rangle \\), not \\( |1\\rangle \\). \\( HH = I \\).",
        },
      ],
      teaching: "H is its own inverse, so it both creates and removes a superposition.",
    },
    {
      type: "informative",
      id: "explain",
      title: "The Hadamard gate",
      body: [
        "H maps \\( |0\\rangle \\) to \\( |+\\rangle \\) and \\( |1\\rangle \\) to \\( |-\\rangle \\), and back again,  it is its own inverse, \\( HH = I \\).",
        "Creating superposition and then recombining it is the heart of every interference-based algorithm.",
      ],
      misconception:
        "A 50/50 result after one H is not 'the qubit is secretly 0 or 1.' It is the definite superposition \\( |+\\rangle \\): a second H recovers \\( |0\\rangle \\) every time, which a hidden coin flip never could.",
      realWorld:
        "The Hadamard gate opens almost every real quantum algorithm: it spreads a qubit across both values so interference can later concentrate on the answer.",
      resources: [
        {
          label: "Hadamard transform (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Hadamard_transform",
          description: "The Hadamard gate and transform.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-hh",
      title: "Two Hadamards",
      prompt: "Apply H twice to \\( |0\\rangle \\), then measure. What does it return?",
      options: [
        {
          id: "zero",
          label: "0 every time",
          correct: true,
          feedback: "Correct. \\( HH = I \\): the second H recombines \\( |+\\rangle \\) back into \\( |0\\rangle \\).",
        },
        {
          id: "mix",
          label: "50/50",
          feedback: "Only one H gives 50/50. The second H recombines the superposition into the definite \\( |0\\rangle \\).",
        },
      ],
      teaching: "H is its own inverse: \\( HH = I \\).",
    },
    {
      type: "prediction",
      id: "q-notrandom",
      title: "Superposition vs randomness",
      prompt: "After one H on \\( |0\\rangle \\), a single measurement returns 1. Was the qubit just a random coin?",
      options: [
        {
          id: "no",
          label: "No,  it was the definite superposition \\( |+\\rangle \\)",
          correct: true,
          feedback:
            "Correct. A coin flip can't be undone, but \\( HH \\) deterministically recovers \\( |0\\rangle \\),  so it was a real superposition, not hidden randomness.",
        },
        {
          id: "yes",
          label: "Yes,  H just randomizes the bit",
          feedback:
            "If H merely randomized, applying it twice couldn't reliably return \\( |0\\rangle \\). Reversibility shows it was a genuine superposition.",
        },
      ],
      teaching: "Reversibility distinguishes a quantum superposition from classical randomness.",
    },
    {
      type: "gate-lab",
      id: "make-plus",
      title: "Create an even superposition",
      body: "Use H to turn the definite \\( |0\\rangle \\) into the equal superposition \\( |+\\rangle \\).",
      allowedGates: ["H"],
      start: "0",
      target: "+",
      correctFeedback:
        "Correct. \\( H|0\\rangle = |+\\rangle \\): an equal superposition that measures 50/50, yet is a single definite state.",
      incorrectFeedback:
        "Not yet. Recall what H does to \\( |0\\rangle \\).",
      teaching: "One H builds the equal superposition \\( |+\\rangle \\) from \\( |0\\rangle \\).",
    },
    {
      type: "gate-lab",
      id: "recombine",
      title: "Recombine it back",
      body: "This qubit is already in \\( |+\\rangle \\) (one H was applied). Bring it back to the definite \\( |0\\rangle \\).",
      allowedGates: ["H"],
      start: "0",
      preset: ["H"],
      target: "0",
      correctFeedback:
        "Correct. A second H recombines \\( |+\\rangle \\) into \\( |0\\rangle \\): \\( HH = I \\). A coin flip could never be undone this way.",
      incorrectFeedback:
        "Not yet. Recall why H applied twice undoes itself.",
      teaching: "Recombining a superposition with H is what separates it from hidden randomness.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You used the gate behind quantum interference:",
      points: [
        "H creates an even superposition: \\( H|0\\rangle = |+\\rangle \\), \\( H|1\\rangle = |-\\rangle \\).",
        "H is its own inverse: \\( HH = I \\), so it also recombines superposition.",
        "Reversibility shows superposition is not hidden randomness.",
      ],
      next: "Gate Sequences,  ordering gates into short circuits.",
    },
  ],
};

const lessonReversibility: Lesson = {
  id: "reversibility",
  title: "Reversibility",
  description: "Undo quantum operations with inverse gates.",
  badge: { id: REVERSIBILITY_BADGE, title: "Reversibility", subtitle: "Completed Reversibility" },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Can you always undo it?",
      prompt:
        "Classical logic can destroy information,  an AND gate throws away its inputs. Quantum gates are different. If a circuit scrambles \\( |0\\rangle \\) into some state, can you always recover \\( |0\\rangle \\)?",
      options: [
        {
          id: "yes",
          label: "Yes,  every gate has an inverse",
          correct: true,
          feedback: "Correct. Quantum gates are reversible: each has an inverse, so any sequence can be undone.",
        },
        {
          id: "no",
          label: "No,  information is lost",
          feedback: "Quantum gates do not lose information; each is reversible. (Measurement is the irreversible step.)",
        },
        {
          id: "sometimes",
          label: "Only for some gates",
          feedback: "Every quantum gate is reversible, so any sequence of them can be undone.",
        },
      ],
      teaching: "Quantum gates are reversible transformations,  unlike classical AND or OR.",
    },
    {
      type: "gate-lab",
      id: "undo",
      title: "Undo the circuit",
      body: "This circuit (H then Z) left the qubit in some state. Add gates to return it to \\( |0\\rangle \\).",
      allowedGates: ["X", "H", "Z"],
      start: "0",
      preset: ["H", "Z"],
      target: "0",
      correctFeedback:
        "You inverted it. Each of \\( H \\), \\( X \\), \\( Z \\) is its own inverse, so applying the gates in reverse order undoes the circuit: here Z then H returns \\( |0\\rangle \\).",
      incorrectFeedback:
        "Not yet. Undo gates in reverse order of the circuit.",
      teaching:
        "To reverse a sequence, apply the inverse of each gate in reverse order. Since \\( H \\), \\( X \\), and \\( Z \\) are self-inverse, you re-apply them backwards.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What order undid it?",
      prompt:
        "The circuit applied H then Z. Which order of gates brought the qubit back to \\( |0\\rangle \\)?",
      options: [
        {
          id: "reverse",
          label: "Z then H,  the gates in reverse order",
          correct: true,
          feedback: "Correct. Undo a sequence by inverting each gate in reverse order. Here that is Z then H.",
        },
        {
          id: "same",
          label: "H then Z,  the same order again",
          feedback: "Repeating the original order does not undo it. Reverse the order: Z then H.",
        },
        {
          id: "any",
          label: "Any order works, as long as you use both gates",
          feedback: "Order matters. Only the reversed order, Z then H, returns \\( |0\\rangle \\) here.",
        },
      ],
      teaching: "Reverse a circuit by applying inverse gates in the reverse order.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Why gates are reversible",
      body: [
        "Every quantum gate is unitary, which means it has an inverse,  no information is destroyed.",
        "To undo a circuit, apply the inverse gates in reverse order. For \\( H \\), \\( X \\), and \\( Z \\), each is its own inverse.",
      ],
      misconception:
        "Reversibility is about gates, not measurement. Gates can be undone; measurement collapses the state and cannot be reversed.",
      realWorld:
        "Reversible logic also drives research into ultra-low-power classical chips, because erasing information is what fundamentally costs energy (Landauer's principle).",
      resources: [
        {
          label: "Quantum logic gate (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_logic_gate",
          description: "Gates are unitary and therefore reversible.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-undo-seq",
      title: "Reverse a sequence",
      prompt: "A qubit was transformed by H then X. Which sequence returns it to its original state?",
      options: [
        {
          id: "xh",
          label: "X then H",
          correct: true,
          feedback: "Correct. Undo in reverse order with inverses: undo X with X, then undo H with H,  so X then H.",
        },
        {
          id: "hx",
          label: "H then X",
          feedback: "That repeats the original order. To undo, reverse the order: X then H.",
        },
        {
          id: "xx",
          label: "X then X",
          feedback: "Two X gates cancel and never touch the H. You must reverse the whole sequence.",
        },
      ],
      teaching: "Undo a sequence by applying inverse gates in reverse order.",
    },
    {
      type: "prediction",
      id: "q-measure-rev",
      title: "Is measurement reversible?",
      prompt: "Gates can be undone. Can a measurement be undone in the same way?",
      options: [
        {
          id: "no",
          label: "No,  measurement collapses the state irreversibly",
          correct: true,
          feedback: "Correct. Gates are reversible; measurement is the one irreversible operation.",
        },
        {
          id: "yes",
          label: "Yes,  apply the inverse gate",
          feedback: "There is no inverse for measurement: it discards the superposition and keeps a single outcome.",
        },
      ],
      teaching: "Reversibility applies to gates, not to measurement.",
    },
    {
      type: "prediction",
      id: "q-predict-undo",
      title: "Plan the inverse",
      prompt:
        "A circuit applied X then H to \\( |0\\rangle \\). Before building it, which sequence should return the qubit to \\( |0\\rangle \\)?",
      options: [
        {
          id: "hx",
          label: "H then X",
          correct: true,
          feedback: "Correct. Reverse the order and invert each gate: H undoes H, X undoes X, so H then X.",
        },
        {
          id: "xh",
          label: "X then H",
          feedback: "That repeats the original order. Undo in reverse: H then X.",
        },
        {
          id: "hh",
          label: "H then H",
          feedback: "Two H gates cancel and never address the X. Reverse the whole sequence: H then X.",
        },
      ],
      teaching: "Plan an inverse by reversing the order and replacing each gate with its inverse.",
    },
    {
      type: "gate-lab",
      id: "undo-xh",
      title: "Undo a longer circuit",
      body: "A circuit applied X then H to \\( |0\\rangle \\). Add gates to return it to \\( |0\\rangle \\).",
      allowedGates: ["X", "H", "Z"],
      start: "0",
      preset: ["X", "H"],
      target: "0",
      correctFeedback:
        "Correct. Reverse the order and invert each gate: undo H with H, then undo X with X,  so H then X returns \\( |0\\rangle \\).",
      incorrectFeedback:
        "Not yet. Undo the circuit in reverse gate order.",
      teaching: "Longer circuits invert the same way: last gate first, each replaced by its inverse.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You undid a quantum circuit:",
      points: [
        "Quantum gates are reversible; no information is lost.",
        "Undo a sequence with inverse gates in reverse order.",
        "Measurement, unlike a gate, is irreversible.",
      ],
      next: "Universal Gates,  why a small set of gates is enough.",
    },
  ],
};

const lessonUniversal: Lesson = {
  id: "universal-gates",
  title: "Universal Gates",
  description: "Build complex operations from simple gates.",
  badge: { id: UNIVERSAL_GATES_BADGE, title: "Universal Gates", subtitle: "Completed Universal Gates" },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "How many gates do we need?",
      prompt: "There are infinitely many possible quantum operations. Do we need a distinct physical gate for every one?",
      options: [
        {
          id: "small",
          label: "No,  a small universal set can build (or approximate) any operation",
          correct: true,
          feedback: "Correct. As in classical computing, a few well-chosen gates suffice to build everything else.",
        },
        {
          id: "each",
          label: "Yes,  one gate per operation",
          feedback: "That would be impossible. A small universal set composes to reach any operation.",
        },
        {
          id: "onlysmall",
          label: "Only for small circuits",
          feedback: "Universality holds in general, not just for small circuits.",
        },
      ],
      teaching: "A finite universal gate set composes to build arbitrary computations.",
    },
    {
      type: "gate-lab",
      id: "explore",
      title: "Reach every state",
      body: "From \\( |0\\rangle \\), use only X, H, and Z to reach \\( |1\\rangle \\), \\( |+\\rangle \\), and \\( |-\\rangle \\).",
      allowedGates: ["X", "H", "Z"],
      start: "0",
      measure: false,
      teaching:
        "Just three gates already reach every state in this set. Real universality goes further: a set like \\( \\{H, T\\} \\) approximates any single-qubit operation, and adding a two-qubit gate (CNOT) makes the set universal for all of quantum computation.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "How far did three gates get you?",
      prompt:
        "Using only X, H, and Z from \\( |0\\rangle \\), how many of \\( |1\\rangle \\), \\( |+\\rangle \\), \\( |-\\rangle \\) could you reach?",
      options: [
        {
          id: "all",
          label: "All three",
          correct: true,
          feedback:
            "Correct. X, H, and Z already compose to reach every state in this set,  a small set goes a long way.",
        },
        {
          id: "two",
          label: "Only two of them",
          feedback: "All three are reachable: X gives \\( |1\\rangle \\), H gives \\( |+\\rangle \\), and H then Z gives \\( |-\\rangle \\).",
        },
        {
          id: "one",
          label: "Just one",
          feedback: "Each is reachable by a short sequence. Try H, then H then Z, then X.",
        },
      ],
      teaching: "A few gates compose to reach many states,  the seed of universality.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Universality",
      body: [
        "A gate set is universal if its sequences can approximate any quantum operation to arbitrary precision.",
        "A standard universal set is \\( \\{H, T, \\text{CNOT}\\} \\). This mirrors classical computing, where the NAND gate alone is universal.",
      ],
      misconception:
        "Universal does not mean every operation is reached exactly in finitely many gates. It means any operation can be approximated as closely as you like (the Solovay–Kitaev theorem).",
      realWorld:
        "Universality is why one quantum chip can, in principle, run any quantum program, just as a handful of classical gates can build any classical computer.",
      resources: [
        {
          label: "Quantum logic gate: universal gates (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_logic_gate#Universal_quantum_gates",
          description: "Universal gate sets.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-classical",
      title: "A classical parallel",
      prompt: "Classically, which single gate type is universal,  able to build any Boolean circuit?",
      options: [
        {
          id: "nand",
          label: "NAND",
          correct: true,
          feedback: "Correct. NAND is universal classically; any Boolean function can be built from NAND gates.",
        },
        {
          id: "and",
          label: "AND",
          feedback: "AND alone cannot express negation, so it is not universal.",
        },
        {
          id: "or",
          label: "OR",
          feedback: "OR alone cannot express negation, so it is not universal.",
        },
      ],
      teaching: "Universality is familiar from classical logic: NAND builds everything.",
    },
    {
      type: "prediction",
      id: "q-meaning",
      title: "What universality buys you",
      prompt: "What does a universal quantum gate set let you do?",
      options: [
        {
          id: "approx",
          label: "Approximate any quantum computation to arbitrary precision",
          correct: true,
          feedback: "Correct. Hardware needs to implement only a few gates well; everything else is composed from them.",
        },
        {
          id: "faster",
          label: "Run every algorithm instantly",
          feedback: "Universality is about expressiveness, not speed.",
        },
        {
          id: "nomeasure",
          label: "Avoid measurement entirely",
          feedback: "Measurement is still needed to read results; universality concerns which operations are reachable.",
        },
      ],
      teaching: "A universal set means a few physical gates suffice to express any computation.",
    },
    {
      type: "gate-lab",
      id: "compose-minus",
      title: "Compose to a target",
      body: "Show the set at work. From \\( |0\\rangle \\), use X, H, and Z to reach \\( |-\\rangle \\).",
      allowedGates: ["X", "H", "Z"],
      start: "0",
      target: "-",
      correctFeedback:
        "Correct. \\( |-\\rangle \\) is reachable by H then Z (or X then H). A handful of gates composes to the state you want.",
      incorrectFeedback:
        "Not yet. Recall the gate sequence for equator states.",
      teaching: "Reaching a specific state by composing gates is universality in miniature.",
    },
    {
      type: "circuit-builder",
      id: "guarantee-one",
      title: "Guarantee an outcome",
      prompt: "Build a circuit on the wire that measures 1 every time.",
      targetPOne: 100,
      correctFeedback:
        "Correct. A single X flips |0⟩ to |1⟩, which measures 1 every time.",
      feedbackMeasuredEmpty:
        "An empty circuit leaves |0⟩, which always measures 0. Add a gate that flips it.",
      feedbackSuperposition:
        "An H leaves a 50/50 superposition, not a guaranteed 1. Use a flip (X) with no leftover H.",
      incorrectFeedback:
        "Not yet. Recall which gate flips \\( |0\\rangle \\) to \\( |1\\rangle \\).",
      teaching: "X composes a guaranteed flip; small gate sets reach definite targets too.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You closed the unit on gates:",
      points: [
        "A small universal gate set can approximate any quantum operation.",
        "A standard choice is \\( \\{H, T, \\text{CNOT}\\} \\); classically, NAND is universal.",
        "Universality is about expressiveness, achieved by composing a few gates.",
      ],
      next: "Unit 3: Why Quantum Works,  interference, where these gates earn their power.",
    },
  ],
};

const lessonConstructive: Lesson = {
  id: "constructive-interference",
  title: "Constructive Interference",
  description: "Combine amplitudes that reinforce.",
  badge: {
    id: CONSTRUCTIVE_INTERFERENCE_BADGE,
    title: "Constructive Interference",
    subtitle: "Completed Constructive Interference",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Two paths, same direction",
      prompt:
        "An outcome can be reached by two paths, each with its own amplitude. If both amplitudes point the same way (same sign), what happens to the probability?",
      options: [
        {
          id: "bigger",
          label: "It becomes much larger",
          correct: true,
          feedback: "Correct. The amplitudes add, and because probability is the square, it grows even faster.",
        },
        {
          id: "same",
          label: "It stays the same",
          feedback: "Adding a second same-sign amplitude increases the total, so the probability rises.",
        },
        {
          id: "smaller",
          label: "It gets smaller",
          feedback: "Same-sign amplitudes reinforce; they do not reduce the total.",
        },
      ],
      teaching: "Amplitudes add as signed quantities before they are squared.",
    },
    {
      type: "wave-interference",
      id: "explore",
      title: "Add two amplitudes",
      body: "Set amplitudes \\( A_1 \\) and \\( A_2 \\) to the same sign. Watch \\( A_{\\text{total}} = A_1 + A_2 \\) and \\( P = |A_{\\text{total}}|^2 \\) grow.",
      teaching:
        "When two amplitudes share a sign, the total amplitude grows and the probability,  its square,  grows faster still. This is constructive interference.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What happened to the total?",
      prompt:
        "With \\( A_1 \\) and \\( A_2 \\) set to the same sign, what did the combined amplitude \\( A_{\\text{total}} \\) do?",
      options: [
        {
          id: "grew",
          label: "It grew, and the probability grew even faster",
          correct: true,
          feedback:
            "Correct. Same-sign amplitudes add to a larger total, and squaring it makes the probability grow faster still.",
        },
        {
          id: "same",
          label: "It stayed the same",
          feedback: "Adding a same-sign amplitude increases \\( A_{\\text{total}} \\); the bar climbed as you did it.",
        },
        {
          id: "cancel",
          label: "It dropped toward zero",
          feedback: "Cancellation needs opposite signs. With the same sign, the total grows.",
        },
      ],
      teaching: "Same-sign amplitudes build a larger total, and \\( P = |A_{\\text{total}}|^2 \\) amplifies the gain.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Reinforcement",
      body: [
        "Amplitudes for the same outcome add as signed numbers: \\( A_{\\text{total}} = A_1 + A_2 \\).",
        "Same-sign amplitudes reinforce, and squaring the larger total gives a disproportionately larger probability.",
      ],
      misconception: "Probabilities are not what add. Amplitudes add first; the probability is the square of their sum, \\( P = |A_1 + A_2|^2 \\).",
      realWorld:
        "Noise-cancelling headphones and anti-reflective lens coatings combine waves exactly this way; quantum algorithms reinforce the right answer with the same math.",
      resources: [
        {
          label: "Wave interference (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Wave_interference",
          description: "How amplitudes combine.",
          kind: "article",
        },
      ],
    },
    {
      type: "worked-example",
      id: "worked-constructive",
      title: "Worked example: add two paths",
      intro: "Goal: two paths reach the same outcome with amplitudes \\( A_1 = +0.5 \\) and \\( A_2 = +0.5 \\). Find the resulting probability.",
      steps: [
        "Amplitudes add as signed numbers first: \\( A_{\\text{total}} = A_1 + A_2 \\).",
        "Here \\( A_{\\text{total}} = 0.5 + 0.5 = 1.0 \\).",
        "Probability is the square of the total: \\( P = |A_{\\text{total}}|^2 \\).",
      ],
      finalPrompt: "What is the probability \\( P \\) for this outcome?",
      options: [
        {
          id: "one",
          label: "\\( P = 1.0 \\) (certain)",
          correct: true,
          feedback: "Correct. \\( A_{\\text{total}} = 1.0 \\), and \\( 1.0^2 = 1.0 \\): the amplitudes reinforced into certainty.",
        },
        {
          id: "half",
          label: "\\( P = 0.5 \\)",
          feedback: "That adds probabilities (0.25 + 0.25). Amplitudes add first, then you square the total.",
        },
        {
          id: "quarter",
          label: "\\( P = 0.25 \\)",
          feedback: "0.25 is one path alone (\\( 0.5^2 \\)). Add the amplitudes before squaring.",
        },
      ],
      teaching: "Amplitudes add before squaring, so same-sign paths reinforce,  constructive interference.",
    },
    {
      type: "prediction",
      id: "q-quad",
      title: "Two equal amplitudes",
      prompt: "One path gives amplitude \\( +0.5 \\). Add a second path, also \\( +0.5 \\). Compared with the single path, the probability becomes:",
      options: [
        {
          id: "4x",
          label: "Four times as large",
          correct: true,
          feedback: "Correct. The total is \\( +1.0 \\); squaring gives four times the single-path probability \\( (0.5)^2 \\).",
        },
        {
          id: "2x",
          label: "Twice as large",
          feedback: "The amplitude doubles, but the probability is its square,  it quadruples.",
        },
        {
          id: "same",
          label: "Unchanged",
          feedback: "A second same-sign amplitude increases the total, so the probability rises sharply.",
        },
      ],
      teaching: "Doubling the total amplitude quadruples the probability.",
    },
    {
      type: "prediction",
      id: "q-add",
      title: "Do probabilities just add?",
      prompt:
        "Two same-sign paths each reach an outcome with probability \\( 0.25 \\) on their own. Do the probabilities simply add to \\( 0.5 \\)?",
      options: [
        {
          id: "no",
          label: "No,  amplitudes add first, then square",
          correct: true,
          feedback:
            "Correct. The amplitudes \\( +0.5 \\) and \\( +0.5 \\) add to \\( +1.0 \\); squaring gives \\( P=1.0 \\), not \\( 0.5 \\).",
        },
        {
          id: "yes",
          label: "Yes,  0.25 + 0.25 = 0.5",
          feedback:
            "Probabilities do not add directly. The amplitudes add to \\( +1.0 \\) and then square to \\( P=1.0 \\).",
        },
      ],
      teaching: "Add amplitudes, then square,  adding probabilities skips the interference.",
    },
    {
      type: "path-amplitudes",
      id: "build-constructive",
      title: "Make the signal as strong as possible",
      mode: "build-constructive",
      body:
        "Two paths reach the same target, each carrying amplitude +1 or -1. Set them to make the target as likely as possible, then check.",
      correctFeedback:
        "Correct. Two +1 paths sum to +2, the largest combined amplitude, so the target is reached every time.",
      incorrectFeedback:
        "Not yet. Recall how same-sign paths interfere.",
      teaching:
        "Same-sign amplitudes reinforce into the strongest possible signal at the target.",
    },
    {
      type: "prediction",
      id: "q-three",
      title: "Three reinforcing paths",
      prompt:
        "Three paths reach one outcome, each with amplitude \\( +0.5 \\). They reinforce to a total of \\( +1.5 \\). Compared with a single path, the probability is:",
      options: [
        {
          id: "9x",
          label: "Nine times as large",
          correct: true,
          feedback: "Correct. The total tripled to \\( +1.5 \\); the probability is its square, so it grows by \\( 3^2 = 9 \\).",
        },
        {
          id: "3x",
          label: "Three times as large",
          feedback: "The amplitude tripled, but probability is its square: \\( 3^2 = 9 \\) times larger.",
        },
        {
          id: "6x",
          label: "Six times as large",
          feedback: "Square the factor rather than doubling it: tripling the amplitude gives \\( 3^2 = 9 \\) times the probability.",
        },
      ],
      teaching: "Reinforcing N equal amplitudes scales the probability by \\( N^2 \\).",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You watched amplitudes reinforce:",
      points: [
        "Amplitudes for one outcome add: \\( A_{\\text{total}} = A_1 + A_2 \\).",
        "Same-sign amplitudes reinforce,  constructive interference.",
        "Squaring the larger total gives a disproportionately larger probability.",
      ],
      next: "Same-sign amplitudes reinforce. Next, what happens when they point opposite ways.",
    },
  ],
};

const lessonDestructive: Lesson = {
  id: "destructive-interference",
  title: "Destructive Interference",
  description: "Combine amplitudes that cancel.",
  badge: {
    id: DESTRUCTIVE_INTERFERENCE_BADGE,
    title: "Destructive Interference",
    subtitle: "Completed Destructive Interference",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Two paths, opposite directions",
      prompt: "Now the two paths have opposite signs. What happens to the outcome's probability when the amplitudes point opposite ways?",
      options: [
        {
          id: "zero",
          label: "It can cancel to zero",
          correct: true,
          feedback: "Correct. Equal and opposite amplitudes sum to zero, so the probability vanishes.",
        },
        {
          id: "double",
          label: "It doubles",
          feedback: "Opposite signs subtract, not add. The total shrinks toward zero.",
        },
        {
          id: "same",
          label: "It stays the same",
          feedback: "A second, opposite amplitude reduces the total, lowering the probability.",
        },
      ],
      teaching: "Opposite-sign amplitudes subtract.",
    },
    {
      type: "wave-interference",
      id: "explore",
      title: "Make them cancel",
      body: "Set \\( A_1 \\) and \\( A_2 \\) to opposite signs. Watch \\( A_{\\text{total}} = A_1 + A_2 \\) shrink toward zero, and \\( P = |A_{\\text{total}}|^2 \\) with it.",
      teaching:
        "Equal and opposite amplitudes sum to zero, so the probability of that outcome drops to zero,  destructive interference. Both paths are still present; their amplitudes simply cancel.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What reached zero?",
      prompt:
        "With \\( A_1 \\) and \\( A_2 \\) equal and opposite, the probability bar fell to 0%. What was actually zero?",
      options: [
        {
          id: "total",
          label: "The combined amplitude \\( A_{\\text{total}} \\)",
          correct: true,
          feedback:
            "Correct. \\( A_1 + A_2 = 0 \\), so \\( P = |A_{\\text{total}}|^2 = 0 \\). The amplitudes cancelled.",
        },
        {
          id: "each",
          label: "Each individual amplitude",
          feedback: "Each path still carries its own amplitude; it is their sum that is zero.",
        },
        {
          id: "paths",
          label: "The number of paths",
          feedback: "Both paths are still there. Their amplitudes summed to zero, not their count.",
        },
      ],
      teaching: "Destructive interference zeroes the total amplitude, not the paths themselves.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Cancellation",
      body: [
        "When \\( A_1 \\) and \\( A_2 \\) are equal and opposite, \\( A_{\\text{total}} = 0 \\), so \\( P = 0 \\).",
        "The outcome becomes impossible,  not because a path was removed, but because the contributions cancel.",
      ],
      misconception: "The paths do not disappear. Both still contribute; it is their amplitudes that cancel, leaving zero probability for that outcome.",
      realWorld:
        "Destructive cancellation is how noise-cancelling headphones silence sound, and how quantum search wipes out the wrong answers.",
      resources: [
        {
          label: "Wave interference (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Wave_interference",
          description: "Constructive and destructive interference.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-zero",
      title: "Equal and opposite",
      prompt: "Two paths reach the same outcome with amplitudes \\( +0.6 \\) and \\( -0.6 \\). What is that outcome's probability?",
      options: [
        {
          id: "0",
          label: "0",
          correct: true,
          feedback: "Correct. \\( +0.6 + (-0.6) = 0 \\), so \\( P = 0 \\). The outcome is impossible.",
        },
        {
          id: "036",
          label: "0.36",
          feedback: "That would be one path alone. Together they cancel: the total amplitude is zero.",
        },
        {
          id: "072",
          label: "0.72",
          feedback: "Amplitudes do not add in magnitude. Opposite signs subtract to zero here.",
        },
      ],
      teaching: "Equal and opposite amplitudes give zero total and zero probability.",
    },
    {
      type: "prediction",
      id: "q-paths",
      title: "Did a path vanish?",
      prompt: "Destructive interference drove an outcome's probability to zero. Does that mean one of the paths was removed?",
      options: [
        {
          id: "no",
          label: "No,  both paths still contribute; their amplitudes cancel",
          correct: true,
          feedback: "Correct. Both paths are present. The zero comes from cancellation, not deletion.",
        },
        {
          id: "yes",
          label: "Yes,  one path was eliminated",
          feedback: "Nothing is removed. The amplitudes are equal and opposite, so they sum to zero.",
        },
      ],
      teaching: "Zero probability from interference is cancellation, not removal.",
    },
    {
      type: "path-amplitudes",
      id: "build-destructive",
      title: "Drive the probability to zero",
      mode: "build-destructive",
      body:
        "Two paths reach the same target with amplitude +1 or -1. Set them so the target becomes impossible,  probability zero,  then check.",
      correctFeedback:
        "Correct. +1 and -1 sum to 0, so the amplitudes cancel and the target is never reached.",
      incorrectFeedback:
        "Not yet. Recall how opposite signs cancel amplitudes.",
      teaching:
        "Opposite-sign amplitudes cancel, driving the target's probability to zero while both paths remain.",
    },
    {
      type: "prediction",
      id: "q-partial",
      title: "Unequal opposite amplitudes",
      prompt:
        "Two paths have amplitudes \\( +0.8 \\) and \\( -0.3 \\). Do they cancel completely?",
      options: [
        {
          id: "partial",
          label: "No,  they partly cancel to a total of \\( +0.5 \\)",
          correct: true,
          feedback:
            "Correct. \\( +0.8 + (-0.3) = +0.5 \\). Cancellation is total only when the amplitudes are equal and opposite.",
        },
        {
          id: "full",
          label: "Yes,  opposite signs always cancel to zero",
          feedback:
            "Only equal-and-opposite amplitudes vanish. Here the total is \\( +0.5 \\), a partial cancellation.",
        },
        {
          id: "add",
          label: "No,  they add to \\( +1.1 \\)",
          feedback: "Opposite signs subtract: \\( +0.8 - 0.3 = +0.5 \\), not \\( +1.1 \\).",
        },
      ],
      teaching: "Full cancellation requires equal and opposite amplitudes; otherwise it is partial.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You watched amplitudes cancel:",
      points: [
        "Opposite-sign amplitudes subtract: equal and opposite gives \\( A_{\\text{total}} = 0 \\).",
        "A zero total amplitude means zero probability,  destructive interference.",
        "Both paths still exist; only their amplitudes cancel.",
      ],
      next: "Amplitudes can reinforce or cancel. Next, how a computation uses both at once.",
    },
  ],
};

const lessonAdvantage: Lesson = {
  id: "interference-advantage",
  title: "Quantum Advantage",
  description: "Amplify the right answer with interference.",
  badge: {
    id: QUANTUM_ADVANTAGE_BADGE,
    title: "Quantum Advantage",
    subtitle: "Completed Quantum Advantage",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Boost one answer only?",
      prompt:
        "A computation can reach an answer along many paths, each with an amplitude. Can we make one answer more likely without making all answers more likely?",
      options: [
        {
          id: "yes",
          label: "Yes,  interference can amplify one answer while cancelling others",
          correct: true,
          feedback: "Correct. Interference redistributes probability: it can build up one amplitude while cancelling the rest.",
        },
        {
          id: "no",
          label: "No,  every answer rises together",
          feedback: "Interference is selective. With the right phases, one amplitude grows while others cancel.",
        },
        {
          id: "measure",
          label: "Only by measuring more often",
          feedback: "Measurement reads the result; the amplification happens through interference before you measure.",
        },
      ],
      teaching: "Interference can reshape amplitudes selectively, before any measurement.",
    },
    {
      type: "path-diagram",
      id: "explore",
      title: "Amplify a target",
      body: "Four answers start equally likely. Mark a target, flip its phase, then interfere. Watch the target grow while the others cancel.",
      teaching:
        "Flipping the target's phase and then interfering builds up the target's amplitude while the others cancel toward zero. The total probability stays at 100%,  it is redistributed onto the answer you marked, not created.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What happened to the target?",
      prompt:
        "You flipped the target's phase and pressed Interfere. What happened to the target answer versus the others?",
      options: [
        {
          id: "up",
          label: "The target's probability rose while the others fell",
          correct: true,
          feedback:
            "Correct. Interference amplified the marked answer and cancelled the rest,  without adding any new probability.",
        },
        {
          id: "alltogether",
          label: "Every answer rose together",
          feedback: "The total is fixed at 100%. The target rose precisely because the others were cancelled.",
        },
        {
          id: "nothing",
          label: "Nothing changed",
          feedback: "After the phase flip, interfering reshaped the amplitudes,  the target's bar jumped up.",
        },
      ],
      teaching: "Interference moves probability between answers; it does not create it.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Where the advantage comes from",
      body: [
        "Every path is explored as an amplitude, and interference is engineered so the wanted answer's amplitude grows while the rest cancel.",
        "The probability that was spread across all answers is concentrated onto the useful one,  all before a single measurement.",
      ],
      misconception: "A quantum computer does not try every answer and then pick the right one. All paths contribute as amplitudes, and interference concentrates probability on the useful answer before you measure.",
      realWorld:
        "This is the engine behind real speedups like Shor's factoring and Grover's search: shape the amplitudes so the useful answer survives.",
      resources: [
        {
          label: "Quantum algorithm (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_algorithm",
          description: "How algorithms exploit interference.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-where",
      title: "Where did the probability go?",
      prompt: "After flipping the target's phase and interfering, the target's probability rose toward 100%. Where did the other answers' probability go?",
      options: [
        {
          id: "cancel",
          label: "It cancelled by destructive interference",
          correct: true,
          feedback: "Correct. The non-target amplitudes interfered destructively, leaving the target with nearly all the probability.",
        },
        {
          id: "lost",
          label: "It was deleted from the system",
          feedback: "Nothing is deleted; total probability stays at 100%. It was cancelled and redistributed by interference.",
        },
        {
          id: "added",
          label: "New probability was created",
          feedback: "No probability is created. Interference only redistributes the existing 100%.",
        },
      ],
      teaching: "Interference redistributes a fixed total probability; it does not create it.",
    },
    {
      type: "prediction",
      id: "q-advantage",
      title: "The source of the advantage",
      prompt: "What gives a quantum algorithm its advantage?",
      options: [
        {
          id: "interfere",
          label: "Interference among amplitudes before measurement",
          correct: true,
          feedback: "Correct. Interference concentrates probability on useful answers before measurement,  the heart of quantum advantage.",
        },
        {
          id: "all",
          label: "Checking all answers at once and reading the right one",
          feedback: "Amplitudes explore all paths, but the advantage is interference shaping them,  not reading every answer.",
        },
        {
          id: "fast",
          label: "Running each step faster than a classical computer",
          feedback: "Speed per step is not the point; interference changes which outcomes are probable.",
        },
      ],
      teaching: "Quantum advantage comes from interference, not from trying every answer in parallel.",
    },
    {
      type: "path-amplitudes",
      id: "cancel-unwanted",
      title: "Cancel an unwanted answer",
      mode: "build-destructive",
      body:
        "Zoom in on the mechanism. Two paths feed one unwanted answer, each with amplitude +1 or -1. Set them to erase that answer,  probability zero,  then check.",
      correctFeedback:
        "Correct. Opposite-sign amplitudes cancel the unwanted answer to zero. Repeated across many answers, this is how interference clears away the wrong ones.",
      incorrectFeedback:
        "Not yet. Recall destructive interference on unwanted paths.",
      teaching:
        "The amplification you saw is just this cancellation, applied to every answer except the target.",
    },
    {
      type: "prediction",
      id: "q-parallel",
      title: "Trying every answer?",
      prompt:
        "Is a quantum computer's advantage that it checks all answers at once and reads out the right one?",
      options: [
        {
          id: "no",
          label: "No,  interference concentrates probability before any readout",
          correct: true,
          feedback:
            "Correct. All paths contribute as amplitudes, and interference amplifies the useful answer before you measure. There is no parallel readout of every answer.",
        },
        {
          id: "yes",
          label: "Yes,  it evaluates every answer and picks the best",
          feedback:
            "A measurement returns just one outcome. The advantage is interference shaping the amplitudes beforehand, not reading all answers.",
        },
      ],
      teaching: "Amplitudes explore all paths, but interference,  not parallel readout,  delivers the answer.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You saw why quantum computers can win:",
      points: [
        "All answers are explored as amplitudes, with a fixed total probability.",
        "Interference amplifies a target's amplitude while cancelling the rest.",
        "Probability is concentrated on the useful answer before measurement,  that is the advantage.",
      ],
      next: "Unit 4: Multiple Qubits,  where interference meets correlation between qubits.",
    },
  ],
};

const lessonClassicalCorrelation: Lesson = {
  id: "classical-correlation",
  title: "Classical Correlation",
  description: "Correlated bits are still separate objects.",
  badge: {
    id: CLASSICAL_CORRELATION_BADGE,
    title: "Classical Correlation",
    subtitle: "Completed Classical Correlation",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Two coins that always match",
      prompt:
        "Interference let amplitudes combine within one qubit. Before two qubits, start classical: two coins are glued to always land the same. You flip the pair, peek at coin A, and see 1. What is coin B?",
      options: [
        {
          id: "one",
          label: "Also 1",
          correct: true,
          feedback: "Correct. They always match, so seeing A tells you B with certainty.",
        },
        {
          id: "random",
          label: "Still a random 0 or 1",
          feedback: "They are glued to match, so once A is 1, B is fixed at 1.",
        },
        {
          id: "zero",
          label: "0, to balance A",
          feedback: "There is no balancing rule. A correlated source makes them equal, not opposite.",
        },
      ],
      teaching: "Correlation means knowing one outcome tells you the other.",
    },
    {
      type: "correlation",
      id: "explore",
      title: "Generate correlated pairs",
      body: "Pick a source and flip pairs. Compare a perfectly correlated source with two independent coins.",
      teaching:
        "A correlated source only ever gives 00 or 11. Each coin still shows a definite value,  a shared cause set them together when they were made.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Which pairs appeared?",
      prompt: "With the perfectly correlated source, which pairs ever showed up?",
      options: [
        {
          id: "0011",
          label: "Only 00 and 11",
          correct: true,
          feedback: "Correct. A shared cause forces the two bits to agree, so only 00 and 11 occur.",
        },
        {
          id: "all",
          label: "All four, about equally",
          feedback: "That is the independent source. The correlated one never produced 01 or 10.",
        },
        {
          id: "0001",
          label: "Only 00 and 01",
          feedback: "The bits always agree, so 01 never appears. The pairs were 00 and 11.",
        },
      ],
      teaching: "Correlation links the two values without merging them into one object.",
    },
    {
      type: "informative",
      id: "explain",
      title: "What correlation is",
      body: [
        "Each coin always holds a definite value. A shared cause made them equal, so reading one reveals the other.",
        "Knowing A tells you B, but the two coins remain separate objects, each with its own state set in advance.",
      ],
      misconception:
        "Correlation does not merge two bits into one shared state. Each bit has its own definite value; they were simply set together.",
      realWorld:
        "This is the everyday kind of correlation: two halves of a torn ticket, or matching gloves mailed in separate boxes. Opening one tells you the other because they were set together.",
      resources: [
        {
          label: "Correlation (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Correlation",
          description: "Statistical correlation between variables.",
          kind: "article",
        },
      ],
    },
    {
      type: "correlation",
      id: "explore-independent",
      title: "Compare independent coins",
      body: "Switch to the independent source and flip 200 pairs. Watch how the four outcomes are distributed.",
      teaching:
        "Independent coins give all four pairs about a quarter of the time. With no shared cause, one coin's value says nothing about the other.",
    },
    {
      type: "prediction",
      id: "q-prob",
      title: "Predict the correlated histogram",
      prompt: "A perfectly correlated source emits many pairs. What are the outcome probabilities?",
      options: [
        {
          id: "halfhalf",
          label: "00 and 11 each about 50%, others 0",
          correct: true,
          feedback: "Correct. The bits always agree and each value is equally likely, so 00 and 11 split 50/50.",
        },
        {
          id: "quarter",
          label: "All four about 25%",
          feedback: "That is the independent source. Correlated pairs never give 01 or 10.",
        },
        {
          id: "allzero",
          label: "00 about 100%",
          feedback: "Each shared coin is still fair, so 11 is just as likely as 00.",
        },
      ],
      teaching: "Correlated does not mean fixed: each value is still random, but the two always agree.",
    },
    {
      type: "prediction",
      id: "q-independent",
      title: "Independent probability",
      prompt: "For two independent fair coins, what is the probability that both show 1?",
      options: [
        {
          id: "25",
          label: "25%",
          correct: true,
          feedback: "Correct. Independent events multiply: \\( 0.5 \\times 0.5 = 0.25 \\).",
        },
        {
          id: "50",
          label: "50%",
          feedback: "That is one coin alone. For both at once, multiply: \\( 0.5 \\times 0.5 = 0.25 \\).",
        },
        {
          id: "100",
          label: "100%",
          feedback: "Each coin is 50/50, so both landing 1 happens only a quarter of the time.",
        },
      ],
      teaching: "Independent probabilities multiply; correlated ones do not.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Does A control B?",
      prompt: "When you flip a correlated pair, does coin A reach out and force coin B to match it?",
      options: [
        {
          id: "shared",
          label: "No,  a shared cause set both values together in advance",
          correct: true,
          feedback: "Correct. Nothing travels between the coins; their agreement was arranged when they were prepared.",
        },
        {
          id: "control",
          label: "Yes,  A determines B at the moment you look",
          feedback: "No influence passes between them. The match was built in when the pair was made.",
        },
      ],
      teaching: "Classical correlation is shared history, not influence between objects.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You explored classical correlation:",
      points: [
        "Correlated bits always agree, yet each holds its own definite value.",
        "A shared cause, not influence, links the two outcomes.",
        "Independent bits give all four pairs; correlated bits give only 00 and 11.",
      ],
      next: "Classical bits stay separate. Next, two qubits that cannot be described separately at all.",
    },
  ],
};

const lessonEntanglement: Lesson = {
  id: "entanglement",
  title: "Entanglement",
  description: "Build a state that cannot be separated.",
  badge: {
    id: ENTANGLEMENT_BADGE,
    title: "Entanglement",
    subtitle: "Completed Entanglement",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Two qubits as one system",
      prompt:
        "We built states for one qubit at a time. Prepare \\( |00\\rangle \\), apply H to q0, then CNOT. Will the result be two independent qubits, or a state where neither qubit alone is definite?",
      options: [
        {
          id: "joint",
          label: "Neither qubit alone,  only the pair has a definite state",
          correct: true,
          feedback: "Correct. H then CNOT produces an entangled state that does not split into separate qubits.",
        },
        {
          id: "separate",
          label: "Two independent qubits, as always",
          feedback: "Not this time. The CNOT links them so that neither qubit has a state of its own.",
        },
        {
          id: "after",
          label: "Only definite after you measure",
          feedback: "The pair has a perfectly definite joint state before measurement,  it just isn't separable.",
        },
      ],
      teaching: "Some two-qubit states cannot be written as qubit A times qubit B.",
    },
    {
      type: "two-qubit-explorer",
      id: "explore",
      title: "Entangle two qubits",
      body: "Start at \\( |00\\rangle \\). Apply H to q0, then CNOT. Read the joint state and the separable/entangled tag.",
      allowedGates: ["X", "H", "Z"],
      showCnot: true,
      allowMeasureSingle: true,
      allowMeasureBoth: true,
      allowHistogram: true,
      showMarginals: true,
      teaching:
        "H then CNOT gives \\( \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\), tagged entangled. Each qubit's marginal is 50/50, yet measurements always agree.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Read the joint state",
      prompt: "After H on q0 then CNOT, what did the joint state become?",
      options: [
        {
          id: "bell",
          label: "\\( \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\)",
          correct: true,
          feedback: "Correct. Only 00 and 11 have amplitude,  an entangled superposition of the pair.",
        },
        {
          id: "00",
          label: "\\( |00\\rangle \\)",
          feedback: "The H spread q0, and the CNOT linked q1. The result has both 00 and 11.",
        },
        {
          id: "plusplus",
          label: "\\( |{+}{+}\\rangle \\)",
          feedback: "That separable state needs H on both qubits and no CNOT. Here the CNOT made it entangled.",
        },
      ],
      teaching: "The entangled state keeps only the agreeing outcomes, 00 and 11.",
    },
    {
      type: "informative",
      id: "explain",
      title: "What entanglement is",
      body: [
        "A separable state factors into qubit A times qubit B. The state \\( \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\) cannot be factored that way.",
        "When you cannot split it, neither qubit has a state of its own. Only the pair does. That is entanglement.",
      ],
      misconception:
        "Entanglement is more than strong correlation. The qubits have no individual states to correlate; the description belongs to the pair as a whole.",
      realWorld:
        "Entanglement is the engine behind quantum teleportation, superdense coding, and the ultra-secure key sharing used in quantum cryptography.",
      whyMatters:
        "Entanglement is the resource classical computers simply do not have. Every quantum advantage in the next unit leans on it.",
      resources: [
        {
          label: "Quantum entanglement (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_entanglement",
          description: "Entangled states and their properties.",
          kind: "article",
        },
      ],
    },
    {
      type: "two-qubit-explorer",
      id: "compare-separable",
      title: "Compare a separable state",
      body: "Now build \\( |{+}{+}\\rangle \\): apply H to q0 and H to q1, with no CNOT. Check the tag, then add a CNOT.",
      allowedGates: ["X", "H", "Z"],
      showCnot: true,
      allowMeasureSingle: false,
      allowMeasureBoth: true,
      allowHistogram: true,
      teaching:
        "H on each qubit gives \\( |{+}{+}\\rangle = \\tfrac{1}{2}(|00\\rangle+|01\\rangle+|10\\rangle+|11\\rangle) \\),  separable, all four outcomes. Adding a CNOT entangles it.",
    },
    {
      type: "prediction",
      id: "q-identify",
      title: "Which state is entangled?",
      prompt: "Which of these two-qubit states is entangled?",
      options: [
        {
          id: "bell",
          label: "\\( \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\)",
          correct: true,
          feedback: "Correct. It cannot be factored into a state for A times a state for B.",
        },
        {
          id: "plusplus",
          label: "\\( |{+}{+}\\rangle \\)",
          feedback: "That factors into \\( |+\\rangle \\) on each qubit, so it is separable.",
        },
        {
          id: "01",
          label: "\\( |01\\rangle \\)",
          feedback: "That is just q0 in \\( |0\\rangle \\) and q1 in \\( |1\\rangle \\),  separable.",
        },
      ],
      teaching: "A state is entangled exactly when it cannot be written as A times B.",
    },
    {
      type: "prediction",
      id: "q-marginal",
      title: "What is qubit A's own state?",
      prompt: "In \\( \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\), what is qubit A's individual state?",
      options: [
        {
          id: "none",
          label: "It has none,  only the pair has a state",
          correct: true,
          feedback: "Correct. An entangled qubit has no state of its own; the information lives in the pair.",
        },
        {
          id: "zero",
          label: "\\( |0\\rangle \\)",
          feedback: "If A were \\( |0\\rangle \\), the pair could not also show 11. A has no separate state here.",
        },
        {
          id: "plus",
          label: "\\( |+\\rangle \\)",
          feedback: "Its marginal is 50/50 like \\( |+\\rangle \\), but A is not in any pure state on its own.",
        },
      ],
      teaching: "Entanglement puts the information in the pair, not in either qubit.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Separable vs entangled, same data?",
      prompt:
        "Two separate \\( |+\\rangle \\) qubits and an entangled pair both give each qubit 50/50. Are they the same?",
      options: [
        {
          id: "no",
          label: "No,  the entangled pair's outcomes are linked; the separable ones are not",
          correct: true,
          feedback: "Correct. Same single-qubit statistics, but only the entangled pair always agrees when measured.",
        },
        {
          id: "yes",
          label: "Yes,  identical 50/50 means identical states",
          feedback: "Single-qubit statistics match, but the joint behavior differs: entangled outcomes are correlated.",
        },
      ],
      teaching: "Two states can share single-qubit statistics yet differ entirely in their joint behavior.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You created an inseparable joint state:",
      points: [
        "A separable state factors into A times B; an entangled state does not.",
        "In an entangled pair, neither qubit has its own state,  only the pair does.",
        "H then CNOT turns \\( |00\\rangle \\) into the entangled \\( \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\).",
      ],
      next: "This is one of four Bell states,  the simplest examples of entanglement. Next, build them all.",
    },
  ],
};

const lessonBellStates: Lesson = {
  id: "bell-states",
  title: "Bell States",
  description: "Build the four maximally entangled pairs.",
  badge: {
    id: BELL_STATES_BADGE,
    title: "Bell States",
    subtitle: "Completed Bell States",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "The simplest entangled states",
      prompt:
        "The pair \\( \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\) is one of four Bell states. How many gates does it take to build one from \\( |00\\rangle \\)?",
      options: [
        {
          id: "two",
          label: "Just two: H then CNOT",
          correct: true,
          feedback: "Correct. H makes a superposition; CNOT links the qubits. Two gates, one Bell state.",
        },
        {
          id: "many",
          label: "Many,  entanglement is hard to produce",
          feedback: "Entanglement is cheap here: a single H and a single CNOT suffice.",
        },
        {
          id: "impossible",
          label: "It cannot be built from \\( |00\\rangle \\)",
          feedback: "It can: H on q0 then CNOT reaches it directly.",
        },
      ],
      teaching: "A Bell state is two gates away from \\( |00\\rangle \\).",
    },
    {
      type: "two-qubit-explorer",
      id: "explore",
      title: "Build the first Bell state",
      body: "Apply H to q0, then CNOT. This is \\( |\\Phi^+\\rangle \\). Measure both a few times.",
      allowedGates: ["X", "H", "Z"],
      showCnot: true,
      allowMeasureSingle: false,
      allowMeasureBoth: true,
      allowHistogram: true,
      teaching:
        "H then CNOT gives \\( |\\Phi^+\\rangle = \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\). The other three Bell states differ by one extra X or Z.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Is it entangled?",
      prompt: "After H then CNOT, what did the explorer's tag report for the joint state?",
      options: [
        {
          id: "entangled",
          label: "Entangled",
          correct: true,
          feedback: "Correct. \\( |\\Phi^+\\rangle \\) cannot be factored into separate qubits.",
        },
        {
          id: "separable",
          label: "Separable",
          feedback: "The CNOT linked the qubits, so the tag read entangled.",
        },
      ],
      teaching: "All four Bell states are maximally entangled.",
    },
    {
      type: "informative",
      id: "explain",
      title: "The four Bell states",
      body: [
        "The Bell states are \\( |\\Phi^\\pm\\rangle = \\frac{|00\\rangle\\pm|11\\rangle}{\\sqrt2} \\) and \\( |\\Psi^\\pm\\rangle = \\frac{|01\\rangle\\pm|10\\rangle}{\\sqrt2} \\).",
        "Each is built from \\( |\\Phi^+\\rangle \\) with one extra gate: Z flips a sign, X swaps a bit on the target.",
      ],
      misconception:
        "The four Bell states are not one state relabeled. They are distinct and perfectly distinguishable from each other.",
      realWorld:
        "Bell states are the workhorses of real quantum networking: protocols like superdense coding and teleportation each single out one of these four.",
      resources: [
        {
          label: "Bell state (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Bell_state",
          description: "The four maximally entangled two-qubit states.",
          kind: "article",
        },
      ],
    },
    {
      type: "bell-builder",
      id: "build-phi-plus",
      title: "Build Φ+",
      body: "Use the gates to build \\( |\\Phi^+\\rangle \\) from \\( |00\\rangle \\), then check.",
      target: "phi+",
      correctFeedback:
        "Correct. \\( H \\) on q0 then CNOT gives \\( |\\Phi^+\\rangle = \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\).",
      incorrectFeedback:
        "Not yet. Recall how H and CNOT create entanglement.",
      teaching: "H then CNOT is the standard recipe for \\( |\\Phi^+\\rangle \\).",
    },
    {
      type: "prediction",
      id: "q-phi-minus",
      title: "From Φ+ to Φ−",
      prompt:
        "Starting from \\( |\\Phi^+\\rangle \\), which single gate produces \\( |\\Phi^-\\rangle = \\frac{|00\\rangle-|11\\rangle}{\\sqrt2} \\)?",
      options: [
        {
          id: "z",
          label: "A Z gate on either qubit",
          correct: true,
          feedback: "Correct. Z flips the phase of the \\( |11\\rangle \\) term, giving the minus sign.",
        },
        {
          id: "x",
          label: "An X gate",
          feedback: "X swaps a bit (turning \\( |\\Phi\\rangle \\) into \\( |\\Psi\\rangle \\)); it does not add the minus sign.",
        },
        {
          id: "h",
          label: "Another H gate",
          feedback: "A second H would break the Bell form. The sign flip comes from Z.",
        },
      ],
      teaching: "Z changes \\( |\\Phi^+\\rangle \\) into \\( |\\Phi^-\\rangle \\) by flipping a phase.",
    },
    {
      type: "bell-builder",
      id: "build-psi-minus",
      title: "Build Ψ−",
      body: "Now build \\( |\\Psi^-\\rangle = \\frac{|01\\rangle-|10\\rangle}{\\sqrt2} \\), then check.",
      target: "psi-",
      correctFeedback:
        "Correct. One route: H on q0, CNOT, then X on q1 and Z on q0,  the qubits now disagree, with a minus sign.",
      incorrectFeedback:
        "Not yet. Recall the steps from \\( |\\Phi^+\\rangle \\) to \\( |\\Psi^-\\rangle \\).",
      teaching: "\\( |\\Psi^-\\rangle \\) has the qubits disagreeing, with opposite-sign amplitudes.",
    },
    {
      type: "prediction",
      id: "q-identify",
      title: "Name the state",
      prompt: "Which Bell state is \\( \\frac{|01\\rangle+|10\\rangle}{\\sqrt2} \\)?",
      options: [
        {
          id: "psiplus",
          label: "\\( |\\Psi^+\\rangle \\)",
          correct: true,
          feedback: "Correct. \\( |\\Psi^+\\rangle \\) has the qubits disagreeing with a plus sign.",
        },
        {
          id: "phiplus",
          label: "\\( |\\Phi^+\\rangle \\)",
          feedback: "\\( |\\Phi^+\\rangle \\) uses the agreeing outcomes 00 and 11, not 01 and 10.",
        },
        {
          id: "psiminus",
          label: "\\( |\\Psi^-\\rangle \\)",
          feedback: "\\( |\\Psi^-\\rangle \\) has a minus sign. This one has a plus, so it is \\( |\\Psi^+\\rangle \\).",
        },
      ],
      teaching: "The Φ states agree (00/11); the Ψ states disagree (01/10); the sign distinguishes + from −.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You built the Bell basis:",
      points: [
        "Four Bell states: \\( |\\Phi^\\pm\\rangle \\) (agree) and \\( |\\Psi^\\pm\\rangle \\) (disagree).",
        "Each comes from \\( |\\Phi^+\\rangle \\) via one extra X (swap a bit) or Z (flip a sign).",
        "All four are maximally entangled and mutually distinguishable.",
      ],
      next: "You can build entangled pairs. Next, see what happens when you measure one.",
    },
  ],
};

const lessonMeasuringEntangled: Lesson = {
  id: "measuring-entangled",
  title: "Measuring Entangled Qubits",
  description: "Watch a measurement collapse the whole pair.",
  badge: {
    id: MEASURING_ENTANGLED_BADGE,
    title: "Measuring Entangled Qubits",
    subtitle: "Completed Measuring Entangled Qubits",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Measure one, what about the other?",
      prompt:
        "You built \\( |\\Phi^+\\rangle = \\frac{|00\\rangle+|11\\rangle}{\\sqrt2} \\). You measure only qubit A and get 1. What is qubit B now?",
      options: [
        {
          id: "one",
          label: "Definitely 1",
          correct: true,
          feedback: "Correct. The pair collapses to \\( |11\\rangle \\), so B is now certainly 1.",
        },
        {
          id: "5050",
          label: "Still 50/50",
          feedback: "Once A is measured, the entangled pair collapses and B is fixed to match.",
        },
        {
          id: "zero",
          label: "0",
          feedback: "For \\( |\\Phi^+\\rangle \\) the qubits agree, so measuring A as 1 makes B 1.",
        },
      ],
      teaching: "Measuring one qubit of a Bell pair collapses the entire joint state.",
    },
    {
      type: "two-qubit-explorer",
      id: "measure-a",
      title: "Measure only qubit A",
      body: "This pair is \\( |\\Phi^+\\rangle \\). Measure qubit A, watch the collapse, then Reset and measure again.",
      preset: [
        { gate: "H", qubit: 0 },
        { gate: "CNOT", qubit: 0 },
      ],
      lockCircuit: true,
      allowMeasureSingle: true,
      allowMeasureBoth: false,
      allowHistogram: false,
      teaching:
        "Measuring A gives a random 0 or 1, but the state collapses to \\( |00\\rangle \\) or \\( |11\\rangle \\),  so B instantly matches. Reset and repeat: the value is random, the agreement is certain.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Was qubit A predictable?",
      prompt: "Across several single measurements of qubit A, what did you see?",
      options: [
        {
          id: "random",
          label: "Random,  sometimes 0, sometimes 1",
          correct: true,
          feedback: "Correct. Each individual outcome is unpredictable, even though B always follows A.",
        },
        {
          id: "always0",
          label: "Always 0",
          feedback: "A is a fair 50/50. What is certain is only that B matches whatever A gave.",
        },
        {
          id: "alternate",
          label: "It alternated 0, 1, 0, 1",
          feedback: "There is no pattern between fresh runs; each measurement is independently random.",
        },
      ],
      teaching: "Each entangled measurement is individually random.",
    },
    {
      type: "two-qubit-explorer",
      id: "measure-many",
      title: "Run many joint measurements",
      body: "Now run 200 measurements of both qubits at once. Which pairs appear, and how often?",
      preset: [
        { gate: "H", qubit: 0 },
        { gate: "CNOT", qubit: 0 },
      ],
      lockCircuit: true,
      allowMeasureSingle: false,
      allowMeasureBoth: true,
      allowHistogram: true,
      teaching:
        "Only 00 and 11 appear, about 50/50. Each shot is random, but the qubits always agree,  the correlation shows up only when you compare both results.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Collapse and correlation",
      body: [
        "Measuring one qubit of an entangled pair collapses the whole state at once. A \\( |\\Phi^+\\rangle \\) pair always agrees.",
        "Each individual outcome is random. The correlation is invisible in either qubit alone,  it appears only when the two records are compared.",
      ],
      misconception:
        "Collapse does not push a value onto qubit B. Neither result is decided until measurement, and B's own statistics stay 50/50 until you compare them with A.",
      realWorld:
        "Comparing entangled measurements is how quantum teleportation moves a state, and how certified random-number generators produce numbers nobody can predict in advance.",
      resources: [
        {
          label: "Measurement in quantum mechanics (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Measurement_in_quantum_mechanics",
          description: "How measurement collapses a quantum state.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-histogram",
      title: "Predict the histogram",
      prompt: "Measuring \\( |\\Phi^+\\rangle \\) many times, which histogram appears?",
      options: [
        {
          id: "agree",
          label: "00 and 11 each about 50%",
          correct: true,
          feedback: "Correct. The qubits always agree, so only the matching outcomes occur.",
        },
        {
          id: "uniform",
          label: "All four about 25%",
          feedback: "That would be independent qubits. An entangled pair gives only agreeing outcomes.",
        },
        {
          id: "one",
          label: "00 about 100%",
          feedback: "Each value is still 50/50; both 00 and 11 occur, just always agreeing.",
        },
      ],
      teaching: "A \\( |\\Phi^+\\rangle \\) histogram shows only 00 and 11.",
    },
    {
      type: "prediction",
      id: "q-psi",
      title: "Apply it to Ψ+",
      prompt:
        "For \\( |\\Psi^+\\rangle = \\frac{|01\\rangle+|10\\rangle}{\\sqrt2} \\), how do the two qubits relate when measured?",
      options: [
        {
          id: "disagree",
          label: "They always disagree (01 or 10)",
          correct: true,
          feedback: "Correct. \\( |\\Psi^+\\rangle \\) keeps only the disagreeing outcomes, so the qubits are anti-correlated.",
        },
        {
          id: "agree",
          label: "They always agree (00 or 11)",
          feedback: "That is \\( |\\Phi^+\\rangle \\). The Ψ states keep the disagreeing outcomes.",
        },
        {
          id: "both0",
          label: "Both are always 0",
          feedback: "Each qubit is still 50/50; the pattern is that they disagree, not that they are fixed.",
        },
      ],
      teaching: "Different Bell states encode different correlations: agree (Φ) or disagree (Ψ).",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Look at qubit B alone",
      prompt: "If you record only qubit B's results and ignore qubit A entirely, what do you see?",
      options: [
        {
          id: "noise",
          label: "Random 50/50 with no pattern",
          correct: true,
          feedback: "Correct. B alone looks like a fair coin. The correlation only emerges by comparing with A.",
        },
        {
          id: "signal",
          label: "A pattern that reveals what A did",
          feedback: "B alone is featureless 50/50. Nothing about A is visible without comparing records.",
        },
        {
          id: "copy",
          label: "Exactly A's sequence",
          feedback: "Only by comparing can you see they match. On its own, B is just noise.",
        },
      ],
      teaching: "One half of an entangled pair, viewed alone, is indistinguishable from random noise.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You measured entanglement:",
      points: [
        "Measuring one qubit collapses the whole pair at once.",
        "Each individual outcome is random; the qubits' agreement is certain.",
        "Correlations appear only when the two records are compared.",
      ],
      next: "Each outcome was random and B alone looked like noise. Could that collapse still send a message? Next.",
    },
  ],
};

const lessonNoSignaling: Lesson = {
  id: "no-signaling",
  title: "No Faster-Than-Light Communication",
  description: "Why entanglement cannot send a message.",
  badge: {
    id: NO_SIGNALING_BADGE,
    title: "No Signaling",
    subtitle: "Completed No Faster-Than-Light Communication",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "A faster-than-light message?",
      prompt:
        "Measuring A instantly collapses the pair. Could Alice send Bob a message faster than light by choosing whether to measure her qubit?",
      options: [
        {
          id: "no",
          label: "No,  Bob's local statistics never change",
          correct: true,
          feedback: "Correct. Nothing Alice does shifts Bob's own measurement probabilities, so no message gets through.",
        },
        {
          id: "yes",
          label: "Yes,  collapse is instant, so the message is too",
          feedback: "Collapse is instant, but it leaves Bob's statistics untouched. There is nothing for him to read.",
        },
        {
          id: "lightspeed",
          label: "Yes, but only at the speed of light",
          feedback: "No information flows through the entanglement at all,  Bob's marginal is fixed regardless.",
        },
      ],
      teaching: "Test it as an experiment: watch whether anything Alice does changes Bob's statistics.",
    },
    {
      type: "two-qubit-explorer",
      id: "alice-acts",
      title: "Let Alice act on her qubit",
      body:
        "The pair is \\( |\\Phi^+\\rangle \\). Alice controls qubit A: apply H or Z to it, or measure it. Watch qubit B's marginal,  Bob's local statistics.",
      preset: [
        { gate: "H", qubit: 0 },
        { gate: "CNOT", qubit: 0 },
      ],
      allowedGates: ["H", "Z"],
      showCnot: false,
      allowMeasureSingle: true,
      allowMeasureBoth: false,
      allowHistogram: false,
      showMarginals: true,
      teaching:
        "Whatever Alice does to qubit A,  H, Z, measure, or nothing,  qubit B's marginal stays at 50%. Bob sees pure noise; none of Alice's choices leak through.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Did Bob's marginal move?",
      prompt: "As you applied H or Z to qubit A, what happened to qubit B's marginal probability?",
      options: [
        {
          id: "stayed",
          label: "It stayed at 50%",
          correct: true,
          feedback: "Correct. Bob's local statistics are fixed at 50/50 no matter what Alice does to her qubit.",
        },
        {
          id: "swapped",
          label: "It swapped between 0% and 100%",
          feedback: "That never happened. Bob's marginal held at 50% throughout.",
        },
        {
          id: "tracked",
          label: "It tracked Alice's gate",
          feedback: "Bob's marginal is insensitive to Alice's gates,  it stayed at 50%.",
        },
      ],
      teaching: "No local operation on one qubit changes the other qubit's marginal.",
    },
    {
      type: "two-qubit-explorer",
      id: "compare-runs",
      title: "Compare Bob's column",
      body:
        "Run 200 joint measurements. Cover Alice's digit and tally only Bob's: count his 0s and 1s. The pair is still \\( |\\Phi^+\\rangle \\).",
      preset: [
        { gate: "H", qubit: 0 },
        { gate: "CNOT", qubit: 0 },
      ],
      lockCircuit: true,
      allowMeasureSingle: true,
      allowMeasureBoth: true,
      allowHistogram: true,
      teaching:
        "Bob's digit is 50/50 in every run. The 00/11 correlation only appears once Alice's and Bob's records are compared,  over an ordinary channel limited by light speed.",
    },
    {
      type: "informative",
      id: "explain",
      title: "The no-signaling principle",
      body: [
        "Entanglement guarantees correlated results, but each qubit's marginal statistics are fixed at 50/50 regardless of what the other party does.",
        "Since no local operation changes the distant qubit's probabilities, no information can be sent. The correlations only surface when the two records are compared.",
      ],
      misconception:
        "Collapse is not a signal. The correlations are real, but they appear only after the parties compare results over an ordinary channel, which is limited by the speed of light.",
      realWorld:
        "No-signaling is why entanglement cannot send faster-than-light messages: real quantum networks still need an ordinary, light-speed channel to finish the job.",
      resources: [
        {
          label: "No-communication theorem (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/No-communication_theorem",
          description: "Why entanglement cannot transmit information.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-basis",
      title: "Change the basis",
      prompt: "Alice measures her qubit in a different basis (she applies H first). Does Bob's histogram change?",
      options: [
        {
          id: "no",
          label: "No,  Bob's statistics are unchanged",
          correct: true,
          feedback: "Correct. Alice's basis choice cannot affect Bob's marginal, so his histogram is the same.",
        },
        {
          id: "yes",
          label: "Yes,  a different basis sends a different signal",
          feedback: "Bob's marginal is fixed at 50/50 for any basis Alice picks. No signal is sent.",
        },
        {
          id: "sometimes",
          label: "Only when the qubits are entangled",
          feedback: "Even with entanglement, Bob's local statistics never change. Correlation is not communication.",
        },
      ],
      teaching: "Alice's choice of basis leaves Bob's local statistics untouched.",
    },
    {
      type: "prediction",
      id: "q-applied",
      title: "How to see the correlation",
      prompt: "For Alice and Bob to actually observe the correlation, what must happen?",
      options: [
        {
          id: "compare",
          label: "They compare their records over an ordinary channel",
          correct: true,
          feedback: "Correct. The correlation lives in the comparison, which travels no faster than light.",
        },
        {
          id: "nothing",
          label: "Nothing,  Bob already knows from his own data",
          feedback: "Bob's own data is just noise. The correlation appears only by comparing with Alice.",
        },
        {
          id: "faster",
          label: "They measure faster",
          feedback: "Speed is not the issue. Without comparing records, neither sees any correlation at all.",
        },
      ],
      teaching: "Correlations are revealed by comparison, not by measurement alone.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "The bottom line",
      prompt: "Does entanglement let you send information faster than light?",
      options: [
        {
          id: "no",
          label: "No,  only correlations, revealed by later comparison",
          correct: true,
          feedback: "Correct. Entanglement creates correlations, not a communication channel.",
        },
        {
          id: "yes",
          label: "Yes,  the instant collapse carries the message",
          feedback: "Collapse changes no one's local statistics, so it carries no message.",
        },
      ],
      teaching: "Entanglement gives correlation without communication,  no faster-than-light signaling.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You tested entanglement as a communication channel:",
      points: [
        "Each qubit's marginal statistics are fixed, whatever the other party does.",
        "No local operation changes the distant qubit's probabilities, so no information flows.",
        "Correlations appear only by comparing records over an ordinary channel.",
      ],
      next: "Unit 5: Algorithms,  putting interference and entanglement to work.",
    },
  ],
};

const lessonQuantumAlgorithm: Lesson = {
  id: "quantum-algorithm",
  title: "What Is a Quantum Algorithm?",
  description: "An algorithm is a designed sequence of gates.",
  badge: {
    id: QUANTUM_ALGORITHM_BADGE,
    title: "Quantum Algorithm",
    subtitle: "Completed What Is a Quantum Algorithm?",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "From qubits to a program",
      prompt:
        "You've met qubits, gates, interference, and entanglement. Put together, what is a quantum algorithm?",
      options: [
        {
          id: "sequence",
          label: "A carefully chosen sequence of gates, ending in a measurement",
          correct: true,
          feedback: "Correct. An algorithm is a designed gate sequence that shapes interference toward a useful answer.",
        },
        {
          id: "storeall",
          label: "A machine that stores every possible answer",
          feedback: "Qubits don't store answers like memory. An algorithm is a gate sequence that shapes amplitudes.",
        },
        {
          id: "faster",
          label: "A faster version of a classical program",
          feedback: "It is not classical code sped up. It is a sequence of gates acting on quantum states.",
        },
      ],
      teaching: "A quantum algorithm is a gate sequence that shapes interference, then a measurement.",
    },
    {
      type: "circuit-runner",
      id: "build",
      title: "Build and run a circuit",
      body: "Build a short circuit on two qubits and run it. This sequence of gates is your program.",
      teaching:
        "Running a quantum program means applying its gates to the qubits and then measuring. Different gate sequences shape different output distributions.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What did running produce?",
      prompt: "When you ran your circuit, what did the output show?",
      options: [
        {
          id: "dist",
          label: "A distribution of measurement outcomes",
          correct: true,
          feedback: "Correct. A run produces measurement outcomes; the gates set how likely each one is.",
        },
        {
          id: "single",
          label: "The single correct answer, directly",
          feedback: "Measurement returns one outcome per run; the algorithm shapes which outcomes are likely.",
        },
        {
          id: "allatonce",
          label: "Every possible answer at once",
          feedback: "You never read every answer. You read measured outcomes drawn from the shaped distribution.",
        },
      ],
      teaching: "An algorithm's output is a distribution of measurements, shaped by its gates.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Algorithm as gate sequence",
      body: [
        "A quantum algorithm is a sequence of gates acting on qubits, followed by measurement.",
        "The gates are chosen so interference makes useful outcomes likely and useless ones unlikely.",
      ],
      misconception:
        "An algorithm is not the qubits secretly holding every answer. It is the gate sequence that shapes interference toward the answer you want.",
      realWorld:
        "This is exactly how real processors at Google and IBM run: load a state, apply a gate sequence, measure, then repeat many times to read out the distribution.",
      whyMatters:
        "Once you see an algorithm as choreographed interference, the famous algorithms ahead stop looking like magic and start looking like design.",
      memoryConnection:
        "This is interference from Unit 3 put to work. The gates steer amplitudes so the answers you want reinforce and the rest cancel.",
      resources: [
        {
          label: "Quantum algorithm (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_algorithm",
          description: "Overview of quantum algorithms.",
          kind: "article",
        },
      ],
    },
    {
      type: "circuit-runner",
      id: "build-target",
      title: "Design a target output",
      body: "Design a program whose measurement is always \\( |11\\rangle \\). Build it, then run and check.",
      allowedGates: ["X", "H", "Z"],
      showCnot: true,
      goalIndex: 3,
      correctFeedback:
        "Correct. Two X gates send \\( |00\\rangle \\) to \\( |11\\rangle \\), measured every time,  a deterministic little algorithm.",
      incorrectFeedback:
        "Not yet. Recall which gate forces \\( |1\\rangle \\) on each qubit.",
      teaching: "Even a trivial program is a gate sequence with a designed, predictable output.",
    },
    {
      type: "prediction",
      id: "q-good",
      title: "What makes an algorithm good?",
      prompt: "What separates a good quantum algorithm from a random gate sequence?",
      options: [
        {
          id: "interfere",
          label: "It shapes interference so the right answers are the likely measurements",
          correct: true,
          feedback: "Correct. The art is arranging gates so useful outcomes interfere constructively.",
        },
        {
          id: "morequbits",
          label: "It uses as many qubits as possible",
          feedback: "More qubits is not the point. A good algorithm shapes interference toward the answer.",
        },
        {
          id: "moremeasure",
          label: "It measures as often as possible",
          feedback: "Measuring more does not help; designing the interference does.",
        },
      ],
      teaching: "A good algorithm engineers interference so the answer is the most likely measurement.",
    },
    {
      type: "prediction",
      id: "q-measure",
      title: "Why end with measurement?",
      prompt: "An algorithm ends by measuring. Why not just read the full quantum state directly?",
      options: [
        {
          id: "onlyone",
          label: "Measurement returns one outcome, so we design interference to make it the useful one",
          correct: true,
          feedback: "Correct. You can't read amplitudes directly; the algorithm makes the wanted outcome likely.",
        },
        {
          id: "slow",
          label: "Reading the state directly would be slow",
          feedback: "It is not about speed: a quantum state simply cannot be read out directly.",
        },
        {
          id: "noise",
          label: "Measurement is more accurate than the state",
          feedback: "Measurement is the only readout we have, and it returns a single outcome.",
        },
      ],
      teaching: "Since measurement yields one outcome, algorithms shape interference toward the right one.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Every answer at once?",
      prompt: "A quantum algorithm works because the qubits secretly hold and check every answer at once. True?",
      options: [
        {
          id: "no",
          label: "No,  gate sequences shape interference toward the answer",
          correct: true,
          feedback: "Correct. There is no parallel store of answers; there is interference, designed by the gates.",
        },
        {
          id: "yes",
          label: "Yes,  superposition holds all answers and the computer reads the right one",
          feedback: "Superposition is not a lookup table. The advantage comes from interference, not storage.",
        },
      ],
      teaching: "Algorithms compute by shaping interference, not by storing every answer.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You connected the pieces into a program:",
      points: [
        "A quantum algorithm is a designed sequence of gates, then a measurement.",
        "The gates shape interference so useful outcomes are the likely measurements.",
        "Power comes from interference, not from storing every answer.",
      ],
      next: "An algorithm is a gate sequence. Next, the first one to beat classical,  Deutsch–Jozsa,  with a single interference experiment.",
    },
  ],
};

const lessonDeutschJozsa: Lesson = {
  id: "deutsch-jozsa",
  title: "Deutsch–Jozsa",
  description: "Answer in one query what classically takes many.",
  badge: {
    id: DEUTSCH_JOZSA_BADGE,
    title: "Deutsch–Jozsa",
    subtitle: "Completed Deutsch–Jozsa",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Constant or balanced?",
      prompt:
        "A hidden function is either constant (same output for every input) or balanced (half 0s, half 1s). Classically, how many inputs might you have to check to be sure which?",
      options: [
        {
          id: "half",
          label: "More than half of all inputs, in the worst case",
          correct: true,
          feedback: "Correct. Until you've checked more than half, the function could still be either kind.",
        },
        {
          id: "one",
          label: "Just one input",
          feedback: "One output is consistent with both constant and balanced. You need many checks classically.",
        },
        {
          id: "two",
          label: "Exactly two, always",
          feedback: "Two equal outputs don't decide it. The worst case needs more than half the inputs.",
        },
      ],
      teaching: "Classically, certainty can require checking more than half the inputs.",
    },
    {
      type: "oracle-explorer",
      id: "explore",
      title: "Query a hidden function",
      body: "Load a hidden function. Query inputs classically one at a time, then run the single quantum experiment.",
      teaching:
        "Classically you may need to check more than half the inputs. The quantum experiment uses interference to answer constant-or-balanced in a single query.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "When were you certain?",
      prompt: "Querying classically, when could you first be sure a function was constant?",
      options: [
        {
          id: "half",
          label: "Only after checking more than half the inputs and seeing all the same",
          correct: true,
          feedback: "Correct. Any fewer, and a balanced function could still have produced what you saw.",
        },
        {
          id: "one",
          label: "After a single query",
          feedback: "One result fits both cases. Constant needs more than half checked to confirm.",
        },
        {
          id: "never",
          label: "You can never be certain",
          feedback: "You can,  once more than half agree, it must be constant. It just takes many checks.",
        },
      ],
      teaching: "Classical certainty about a global property can cost many queries.",
    },
    {
      type: "informative",
      id: "explain",
      title: "One interference experiment",
      body: [
        "Deutsch–Jozsa asks only one yes/no question: is the function constant or balanced?",
        "A quantum circuit evaluates the function in superposition and lets the results interfere,  constant and balanced produce different patterns, distinguishable in a single measurement.",
      ],
      misconception:
        "The speedup is not from checking every input at once and reading them all. Interference combines the results so that only the constant-vs-balanced answer survives.",
      realWorld:
        "This was the first proof that a quantum computer can beat every classical one at a task, and the trick it introduced (evaluate in superposition, then interfere) reappears in Shor's and Grover's algorithms.",
      resources: [
        {
          label: "Deutsch–Jozsa algorithm (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Deutsch%E2%80%93Jozsa_algorithm",
          description: "The first algorithm with a provable quantum advantage.",
          kind: "article",
        },
      ],
    },
    {
      type: "oracle-explorer",
      id: "classify",
      title: "Classify with one experiment",
      body: "Load a different hidden function and classify it with a single quantum experiment. Confirm with a few classical queries.",
      teaching:
        "One quantum experiment settles the question no matter how many inputs the function has,  an exponential gap in the number of queries.",
    },
    {
      type: "prediction",
      id: "q-count",
      title: "Quantum query count",
      prompt: "For a function on \\( n \\) input bits, how many quantum experiments does Deutsch–Jozsa need?",
      options: [
        {
          id: "one",
          label: "One",
          correct: true,
          feedback: "Correct. A single interference experiment answers it, regardless of \\( n \\).",
        },
        {
          id: "n",
          label: "About \\( n \\)",
          feedback: "It does not scale with \\( n \\): one experiment suffices.",
        },
        {
          id: "half",
          label: "More than half of \\( 2^n \\)",
          feedback: "That is the classical worst case. Quantumly it is a single query.",
        },
      ],
      teaching: "Deutsch–Jozsa answers in one query what classically can take exponentially many.",
    },
    {
      type: "prediction",
      id: "q-useful",
      title: "A proof of principle",
      prompt: "Why is Deutsch–Jozsa not itself a practically useful algorithm?",
      options: [
        {
          id: "artificial",
          label: "The constant-vs-balanced question is artificial; it exists to prove the principle",
          correct: true,
          feedback: "Correct. Its value is conceptual: it shows interference can beat classical querying outright.",
        },
        {
          id: "slow",
          label: "It is actually slower than classical",
          feedback: "It is faster,  exponentially fewer queries. It is just not a problem anyone needs solved.",
        },
        {
          id: "qubits",
          label: "It needs too many qubits to run",
          feedback: "Qubit count is not the issue; the problem itself is contrived for demonstration.",
        },
      ],
      teaching: "Deutsch–Jozsa is a clean proof that quantum interference can beat classical querying.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "What does it learn?",
      prompt: "Does the quantum circuit learn the function's entire input-output table?",
      options: [
        {
          id: "global",
          label: "No,  only the one global property: constant or balanced",
          correct: true,
          feedback: "Correct. Interference extracts a single global fact, not the whole table.",
        },
        {
          id: "all",
          label: "Yes,  it reads every output at once",
          feedback: "It cannot read every output. It extracts only the constant-vs-balanced answer.",
        },
      ],
      teaching: "Quantum algorithms extract global properties, not full tables of values.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You saw interference replace many queries:",
      points: [
        "Classically, constant-vs-balanced can take more than half the inputs to decide.",
        "A quantum circuit answers it in one interference experiment.",
        "It extracts a global property, not the whole function.",
      ],
      next: "One experiment replaced many checks. Next, Grover's search,  watch interference concentrate probability on a hidden answer.",
    },
  ],
};

const lessonGrover: Lesson = {
  id: "grover-search",
  title: "Grover Search",
  description: "Watch interference concentrate on the answer.",
  badge: {
    id: GROVER_BADGE,
    title: "Grover Search",
    subtitle: "Completed Grover Search",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Finding a needle, no clues",
      prompt:
        "One of many boxes hides a target, with no clues about where. Classically, about how many boxes must you open to find it?",
      options: [
        {
          id: "half",
          label: "About half of them on average",
          correct: true,
          feedback: "Correct. With no structure, you check boxes one by one,  about N/2 on average.",
        },
        {
          id: "one",
          label: "Just one, if you're lucky",
          feedback: "Luck aside, the average and worst cases scale with the number of boxes.",
        },
        {
          id: "all",
          label: "All of them, every time",
          feedback: "Only in the worst case. On average it's about half,  still growing with N.",
        },
      ],
      teaching: "Unstructured classical search costs about N checks for N boxes.",
    },
    {
      type: "search-explorer",
      id: "classical",
      title: "Search by hand",
      body: "Try it classically. Open boxes until you find the target, then start a new target.",
      teaching:
        "With no clues you can only check boxes one at a time,  about N/2 on average, N in the worst case.",
    },
    {
      type: "prediction",
      id: "observe-classical",
      title: "How does classical search scale?",
      prompt: "With no structure to exploit, classical search scales roughly like:",
      options: [
        {
          id: "n",
          label: "The number of boxes, \\( N \\)",
          correct: true,
          feedback: "Correct. No shortcuts means checking on the order of \\( N \\) boxes.",
        },
        {
          id: "sqrt",
          label: "The square root of \\( N \\)",
          feedback: "That's the quantum result you're about to see, not the classical one.",
        },
        {
          id: "const",
          label: "A constant, independent of \\( N \\)",
          feedback: "Without clues, more boxes means more checks,  it grows with \\( N \\).",
        },
      ],
      teaching: "Classical unstructured search is linear in \\( N \\).",
    },
    {
      type: "amplitude-amplifier",
      id: "grover",
      title: "Amplify the answer",
      body: "Now the quantum approach. All answers start equally likely. Apply Grover iterations and watch the target's probability.",
      teaching:
        "Each iteration flips the target's phase, then reflects all amplitudes about their mean. Interference grows the target and shrinks the rest,  this is amplitude amplification.",
    },
    {
      type: "prediction",
      id: "observe-grover",
      title: "What did the target bar do?",
      prompt: "As you applied Grover iterations, what happened to the target's probability bar?",
      options: [
        {
          id: "grew",
          label: "It grew while the others shrank",
          correct: true,
          feedback: "Correct. Interference concentrated probability onto the target answer.",
        },
        {
          id: "allgrew",
          label: "All bars grew together",
          feedback: "The total is fixed; the target grew because the others were cancelled down.",
        },
        {
          id: "none",
          label: "Nothing changed",
          feedback: "Each iteration visibly raised the target and lowered the rest.",
        },
      ],
      teaching: "Amplitude amplification pumps probability from the wrong answers into the target.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Amplitude amplification",
      body: [
        "Grover marks the target by flipping the sign of its amplitude, then reflects all amplitudes about their average.",
        "Repeating concentrates probability on the target,  finding it in about \\( \\sqrt{N} \\) steps instead of \\( N \\).",
      ],
      misconception:
        "A quantum computer does not look inside every box at once and 'see' the answer. Every box is explored as an amplitude, and interference makes the target the most likely measurement.",
      realWorld:
        "Grover's quadratic speedup applies to real search-like work: scanning unsorted data, brute-forcing keys, and accelerating optimization and constraint solvers.",
      resources: [
        {
          label: "Grover's algorithm (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Grover%27s_algorithm",
          description: "Amplitude amplification and the quadratic speedup.",
          kind: "article",
        },
      ],
    },
    {
      type: "prediction",
      id: "q-steps",
      title: "How fast is Grover?",
      prompt: "Grover finds the target in about how many steps for \\( N \\) boxes?",
      options: [
        {
          id: "sqrt",
          label: "About \\( \\sqrt{N} \\)",
          correct: true,
          feedback: "Correct. A quadratic speedup: roughly \\( \\sqrt{N} \\) iterations instead of \\( N \\) checks.",
        },
        {
          id: "n",
          label: "About \\( N \\), like classical",
          feedback: "Grover beats classical: about \\( \\sqrt{N} \\), not \\( N \\).",
        },
        {
          id: "one",
          label: "Just one, regardless of \\( N \\)",
          feedback: "Not constant,  it needs about \\( \\sqrt{N} \\) iterations.",
        },
      ],
      teaching: "Grover gives a quadratic speedup: about \\( \\sqrt{N} \\) steps.",
    },
    {
      type: "amplitude-amplifier",
      id: "grover-overshoot",
      title: "Can you over-amplify?",
      body: "Try a larger search. Apply iterations until the target is most likely,  then keep going and watch what happens.",
      size: 16,
      teaching:
        "More iterations is not always better: past the peak, interference reverses and the target's probability falls. There is an optimal number of iterations.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Exponential or quadratic?",
      prompt: "Quantum search is exponentially faster than classical. True?",
      options: [
        {
          id: "quad",
          label: "No,  it's a quadratic (about \\( \\sqrt{N} \\)) speedup, real but modest",
          correct: true,
          feedback: "Correct. Grover is quadratic, not exponential. Still useful, but not a magic shortcut.",
        },
        {
          id: "exp",
          label: "Yes,  it's exponential",
          feedback: "Search is only quadratic. Exponential speedups need special structure, like Shor's.",
        },
      ],
      teaching: "Grover's speedup is quadratic,  meaningful, but bounded.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You watched interference become computation:",
      points: [
        "Classical unstructured search costs about \\( N \\) checks.",
        "Grover amplifies the target's amplitude, finding it in about \\( \\sqrt{N} \\) steps.",
        "The speedup is quadratic, and over-iterating undoes it.",
      ],
      next: "Grover amplified one answer. Next, Shor's algorithm uses interference to find a hidden period,  and break encryption.",
    },
  ],
};

const lessonShor: Lesson = {
  id: "shors-algorithm",
  title: "Shor's Algorithm",
  description: "Find a hidden period, reveal the factors.",
  badge: {
    id: SHOR_BADGE,
    title: "Shor's Algorithm",
    subtitle: "Completed Shor's Algorithm",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Undoing multiplication",
      prompt:
        "Multiplying two large primes is easy; factoring the product back is hard classically. Shor's algorithm factors quickly by finding something hidden. What does it look for?",
      options: [
        {
          id: "period",
          label: "A repeating period in a related sequence",
          correct: true,
          feedback: "Correct. Shor turns factoring into finding a hidden period, which interference does fast.",
        },
        {
          id: "trial",
          label: "The factors by trying divisors one by one",
          feedback: "That's slow classical trial division. Shor instead finds a hidden repeating period.",
        },
        {
          id: "all",
          label: "Every possible factor at the same time",
          feedback: "It doesn't test all factors. It finds a period, and the factors follow from it.",
        },
      ],
      teaching: "Shor reframes factoring as finding a hidden period.",
    },
    {
      type: "pattern-explorer",
      id: "find-period",
      title: "Find the hidden period",
      body: "A sequence built from \\( N = 15 \\) repeats. Find how often it repeats,  its period.",
      n: 15,
      cycle: [7, 4, 13, 1],
      period: 4,
      factors: [3, 5],
      terms: 12,
      teaching:
        "Once you know the period, the factors fall out by simple arithmetic. Finding the period is the hard part,  and the part a quantum computer does fast.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What did the period reveal?",
      prompt: "When you found the right period, what appeared?",
      options: [
        {
          id: "factors",
          label: "The factors of \\( N \\)",
          correct: true,
          feedback: "Correct. The period leads directly to the factors by ordinary arithmetic.",
        },
        {
          id: "bigger",
          label: "A larger number to factor",
          feedback: "No new problem appears,  the period hands you the factors.",
        },
        {
          id: "nothing",
          label: "Nothing useful",
          feedback: "The period is exactly what's useful: it reveals the factors.",
        },
      ],
      teaching: "A hidden period unlocks the factors.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Factoring as period-finding",
      body: [
        "Shor turns factoring into period-finding. A quantum circuit builds a superposition over a repeating sequence and uses interference to expose its period in one shot.",
        "Once you know the period, ordinary arithmetic produces the factors. There is no quantum magic in that last step.",
      ],
      misconception:
        "Shor does not try every possible factor in parallel. Interference reveals the sequence's hidden period; the factoring follows from that period classically.",
      realWorld:
        "Most internet security rests on factoring being too slow for classical machines. A large enough quantum computer running Shor would break RSA, which is why agencies are already moving to post-quantum cryptography.",
      whyMatters:
        "Shor is the clearest proof that the right quantum algorithm can be exponentially faster, not just a little faster, than anything classical.",
      resources: [
        {
          label: "Shor's algorithm (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Shor%27s_algorithm",
          description: "Period-finding and its impact on cryptography.",
          kind: "article",
        },
      ],
    },
    {
      type: "pattern-explorer",
      id: "find-period-21",
      title: "Try a bigger number",
      body: "Another sequence, this time from \\( N = 21 \\). Find its period, then read off the factors.",
      n: 21,
      cycle: [2, 4, 8, 16, 11, 1],
      period: 6,
      factors: [3, 7],
      terms: 12,
      teaching:
        "Same idea, bigger number: the period unlocks the factors. The quantum speedup is entirely in finding that period.",
    },
    {
      type: "prediction",
      id: "q-why",
      title: "Why Shor matters",
      prompt: "Why is Shor's algorithm considered revolutionary?",
      options: [
        {
          id: "crypto",
          label: "It factors exponentially faster, threatening today's public-key encryption",
          correct: true,
          feedback: "Correct. Much of modern cryptography rests on factoring being hard,  Shor undermines that.",
        },
        {
          id: "sort",
          label: "It sorts data faster",
          feedback: "Shor is about factoring via period-finding, not sorting.",
        },
        {
          id: "search",
          label: "It searches lists faster",
          feedback: "That's Grover. Shor's impact is exponentially faster factoring.",
        },
      ],
      teaching: "Shor's exponential speedup for factoring threatens widely used encryption.",
    },
    {
      type: "prediction",
      id: "q-step",
      title: "Which step is quantum?",
      prompt: "Which part of factoring does the quantum computer actually accelerate?",
      options: [
        {
          id: "period",
          label: "Finding the hidden period",
          correct: true,
          feedback: "Correct. Period-finding is the quantum step; the rest is ordinary arithmetic.",
        },
        {
          id: "multiply",
          label: "Multiplying the primes",
          feedback: "Multiplication is already easy classically. The quantum step is period-finding.",
        },
        {
          id: "read",
          label: "Reading out the answer",
          feedback: "Readout is a single measurement. The hard, accelerated step is finding the period.",
        },
      ],
      teaching: "Quantum interference accelerates the period-finding step specifically.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "All factors at once?",
      prompt: "Does Shor's algorithm test all possible factors simultaneously?",
      options: [
        {
          id: "no",
          label: "No,  it finds a period by interference; the factors follow",
          correct: true,
          feedback: "Correct. There's no parallel factor-testing; there's interference revealing a period.",
        },
        {
          id: "yes",
          label: "Yes,  superposition checks every factor at once",
          feedback: "Superposition is not parallel checking. The speedup is interference exposing a period.",
        },
      ],
      teaching: "Shor's power is period-finding by interference, not parallel factor testing.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You saw interference crack a hard problem:",
      points: [
        "Shor reframes factoring as finding a hidden period.",
        "Interference exposes the period; arithmetic then gives the factors.",
        "Its exponential speedup threatens factoring-based cryptography.",
      ],
      next: "Interference broke a hard problem. But quantum computers don't speed up everything,  next, when quantum wins and when it doesn't.",
    },
  ],
};

const lessonQuantumWins: Lesson = {
  id: "when-quantum-wins",
  title: "When Quantum Wins",
  description: "Quantum computers are specialized tools.",
  badge: {
    id: QUANTUM_WINS_BADGE,
    title: "When Quantum Wins",
    subtitle: "Completed When Quantum Wins",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Faster at everything?",
      prompt:
        "You've seen quantum algorithms beat classical ones on specific problems. Are quantum computers faster at everything?",
      options: [
        {
          id: "no",
          label: "No,  only where interference can exploit a problem's structure",
          correct: true,
          feedback: "Correct. Quantum advantage is selective, not universal.",
        },
        {
          id: "yes",
          label: "Yes,  they speed up any computation",
          feedback: "Most tasks see no advantage. Quantum wins only where interference fits the structure.",
        },
        {
          id: "small",
          label: "Only for very small problems",
          feedback: "Size is not the criterion; structure is. Some big problems win, many small ones don't.",
        },
      ],
      teaching: "Quantum advantage depends on a problem's structure, not its size.",
    },
    {
      type: "problem-classifier",
      id: "classify",
      title: "Classify the problems",
      body: "Sort each problem by the kind of quantum speedup it gets: exponential, quadratic, or none.",
      teaching:
        "Exponential wins (factoring, quantum simulation) exploit deep structure; unstructured search gets only a quadratic boost; sorting gets nothing.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Where were the biggest wins?",
      prompt: "Which problems tended to get the largest, exponential speedup?",
      options: [
        {
          id: "factsim",
          label: "Factoring and simulating quantum systems",
          correct: true,
          feedback: "Correct. Both have structure interference exploits,  periods and quantum dynamics.",
        },
        {
          id: "sort",
          label: "Sorting and basic arithmetic",
          feedback: "Those see no real speedup. Exponential wins came from factoring and simulation.",
        },
        {
          id: "all",
          label: "All of them equally",
          feedback: "The speedups differed sharply: exponential, quadratic, or none.",
        },
      ],
      teaching: "Exponential speedups cluster around problems with exploitable structure.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Specialized, not universal",
      body: [
        "Quantum advantage appears when a problem has structure interference can exploit: hidden periods (Shor) or quantum dynamics (simulation).",
        "Unstructured search gains only a quadratic factor, and many everyday tasks gain nothing. Quantum computers are accelerators for specific problems, not faster classical computers.",
      ],
      misconception:
        "A quantum computer is not a universal speed-up. For most tasks it offers no advantage; it shines only where interference fits the problem's structure.",
      realWorld:
        "This is why experts expect quantum machines to act as accelerators for specific jobs, like simulating molecules for drug and materials discovery, working beside classical computers rather than replacing them.",
      resources: [
        {
          label: "Quantum advantage (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_advantage",
          description: "Where quantum computers do and don't help.",
          kind: "article",
        },
      ],
    },
    {
      type: "amplitude-amplifier",
      id: "recap-quadratic",
      title: "Quadratic, not exponential",
      body: "Recall search: even Grover's best is quadratic. Apply iterations and notice how modest the gain is next to factoring.",
      size: 16,
      teaching:
        "Search concentrates probability with interference, but only quadratically,  about \\( \\sqrt{N} \\) vs \\( N \\). Exponential wins need special structure like Shor's periods.",
    },
    {
      type: "prediction",
      id: "q-sort",
      title: "Sorting records",
      prompt: "A startup wants a quantum computer to sort customer records faster. Good idea?",
      options: [
        {
          id: "no",
          label: "No,  sorting gets no quantum speedup",
          correct: true,
          feedback: "Correct. Sorting is already efficient classically; quantum offers nothing here.",
        },
        {
          id: "huge",
          label: "Yes,  a huge speedup",
          feedback: "Sorting has no structure for interference to exploit; there is no quantum advantage.",
        },
        {
          id: "exp",
          label: "Yes,  exponentially faster",
          feedback: "No exponential win exists for sorting. It gains nothing from a quantum computer.",
        },
      ],
      teaching: "Many practical tasks, like sorting, get no quantum advantage at all.",
    },
    {
      type: "prediction",
      id: "q-simulate",
      title: "Simulating a molecule",
      prompt: "Simulating a new molecule's quantum behavior,  a job for a quantum computer?",
      options: [
        {
          id: "yes",
          label: "Yes,  quantum simulation is a natural, exponential win",
          correct: true,
          feedback: "Correct. Simulating quantum systems is where quantum computers most clearly excel.",
        },
        {
          id: "no",
          label: "No,  classical computers do it just as well",
          feedback: "Classically this scales exponentially. It's a prime quantum use case.",
        },
        {
          id: "quad",
          label: "Only a quadratic speedup",
          feedback: "Simulation is an exponential win, not merely quadratic.",
        },
      ],
      teaching: "Simulating quantum systems is the most natural exponential quantum win.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "What benefits from interference?",
      prompt: "Which kinds of problems benefit from interference?",
      options: [
        {
          id: "structure",
          label: "Those with structure interference can exploit, like periods or quantum dynamics",
          correct: true,
          feedback: "Correct. Interference helps exactly when the problem's structure lets useful answers reinforce.",
        },
        {
          id: "all",
          label: "All problems benefit equally",
          feedback: "Most problems gain nothing. Interference helps only structured ones.",
        },
        {
          id: "tiny",
          label: "Only very small problems",
          feedback: "It's about structure, not size: large structured problems win, small unstructured ones don't.",
        },
      ],
      teaching: "Interference is a tool for structured problems, not a universal speed-up.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You placed quantum computing in context:",
      points: [
        "Quantum computers are specialized tools, not universal replacements.",
        "Exponential wins (factoring, simulation) exploit structure; search is only quadratic; sorting gains nothing.",
        "Interference helps when a problem's structure lets useful answers reinforce.",
      ],
      next: "You've turned quantum mechanics into computation. Next unit: the real hardware,  physical qubits, noise, and error correction.",
    },
  ],
};

const HW_SUPERCONDUCTING = {
  id: "superconducting",
  name: "Superconducting",
  temperature: "~15 mK, in a dilution refrigerator",
  strengths: "Fast gates; built with chip fabrication",
  limitations: "Short coherence; needs extreme cooling",
  metrics: { gateSpeed: 90, coherence: 35, scalability: 75, fidelity: 70, compactness: 60 },
};
const HW_TRAPPED_IONS = {
  id: "trapped-ions",
  name: "Trapped ions",
  temperature: "Ultra-high vacuum, laser-cooled",
  strengths: "Long coherence; very high fidelity",
  limitations: "Slow gates; harder to scale",
  metrics: { gateSpeed: 30, coherence: 90, scalability: 45, fidelity: 92, compactness: 40 },
};
const HW_NEUTRAL_ATOMS = {
  id: "neutral-atoms",
  name: "Neutral atoms",
  temperature: "Laser-cooled atoms in optical tweezers",
  strengths: "Flexible, scalable arrays",
  limitations: "Younger technology; moderate speed",
  metrics: { gateSpeed: 45, coherence: 70, scalability: 82, fidelity: 68, compactness: 55 },
};
const HW_PHOTONIC = {
  id: "photonic",
  name: "Photonic",
  temperature: "Room temperature",
  strengths: "Travels through fiber; room temperature",
  limitations: "Photons interact weakly; probabilistic gates",
  metrics: { gateSpeed: 70, coherence: 88, scalability: 50, fidelity: 60, compactness: 72 },
};

const lessonBuildingQC: Lesson = {
  id: "building-quantum-computer",
  title: "Building a Quantum Computer",
  description: "Qubits are physical objects, not symbols.",
  badge: {
    id: BUILDING_QC_BADGE,
    title: "Building a Quantum Computer",
    subtitle: "Completed Building a Quantum Computer",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "What is a qubit, physically?",
      prompt:
        "Units 1–5 treated qubits as abstract symbols. In reality a qubit is a physical object. Which of these can store one?",
      options: [
        {
          id: "many",
          label: "Many systems,  superconducting circuits, trapped ions, atoms, photons",
          correct: true,
          feedback: "Correct. A qubit is any controllable two-level physical system, and several kinds exist.",
        },
        {
          id: "silicon",
          label: "Only silicon transistors, like classical chips",
          feedback: "Transistors store classical bits. Qubits use very different physical systems.",
        },
        {
          id: "software",
          label: "Only software in a normal computer",
          feedback: "A qubit is physical hardware, not a piece of code running on a laptop.",
        },
      ],
      teaching: "A qubit is a real, controllable physical system,  and there are several ways to build one.",
    },
    {
      type: "hardware-comparison",
      id: "gallery",
      title: "Explore four platforms",
      body: "Explore four ways to build qubits. Click each to reveal how cold it runs, its strengths, and its limits.",
      platforms: [HW_SUPERCONDUCTING, HW_TRAPPED_IONS, HW_NEUTRAL_ATOMS, HW_PHOTONIC],
      teaching:
        "Every platform stores a qubit in a real physical system, and each makes different engineering trade-offs in speed, coherence, scalability, and fidelity.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "What do they share?",
      prompt: "Looking across the platforms, what did nearly all of them require to behave quantum-mechanically?",
      options: [
        {
          id: "isolation",
          label: "Extreme isolation,  near absolute zero, vacuum, or careful optics",
          correct: true,
          feedback: "Correct. Qubits must be shielded from their environment, or they lose their quantum behavior.",
        },
        {
          id: "room",
          label: "Ordinary room conditions",
          feedback: "Most need extreme cooling or vacuum. Isolation from noise is the common theme.",
        },
        {
          id: "software",
          label: "Just better software",
          feedback: "The challenge is physical isolation, not code.",
        },
      ],
      teaching: "Real qubits demand extreme isolation to stay quantum.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Qubits are physical",
      body: [
        "A qubit is a controllable two-level physical system: a superconducting circuit, a trapped ion, a neutral atom, or a photon.",
        "All of them must be isolated from their environment, because any stray interaction leaks away the quantum information.",
      ],
      misconception:
        "A qubit is not a tiny classical bit or a line of code. It is a fragile physical system that must be shielded from the outside world.",
      realWorld:
        "Real qubits live in extreme conditions: superconducting chips chilled near absolute zero, or single ions held in vacuum by lasers, all heavily shielded so the outside world cannot disturb them.",
      resources: [
        {
          label: "Quantum computing: hardware (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_computing#Physical_realizations",
          description: "Physical realizations of qubits.",
          kind: "article",
        },
      ],
    },
    {
      type: "app-classifier",
      id: "match",
      title: "Match the standout trait",
      body: "Match each standout trait to the platform it best describes.",
      categories: [
        { key: "superconducting", label: "Superconducting" },
        { key: "trapped-ions", label: "Trapped ions" },
        { key: "neutral-atoms", label: "Neutral atoms" },
        { key: "photonic", label: "Photonic" },
      ],
      items: [
        {
          id: "coldest",
          label: "Runs the coldest, near absolute zero in a refrigerator",
          answer: "superconducting",
          note: "Superconducting circuits operate around 15 mK.",
        },
        {
          id: "coherence",
          label: "Longest coherence and highest fidelity",
          answer: "trapped-ions",
          note: "Trapped ions hold their state a long time with very low error.",
        },
        {
          id: "roomtemp",
          label: "Works at room temperature",
          answer: "photonic",
          note: "Photonic qubits need no cooling, but photons interact only weakly.",
        },
        {
          id: "arrays",
          label: "Flexible, scalable arrays of atoms",
          answer: "neutral-atoms",
          note: "Neutral atoms are arranged with optical tweezers into large arrays.",
        },
      ],
      teaching: "Each platform's strength comes from how its qubits are physically realized.",
    },
    {
      type: "prediction",
      id: "q-best",
      title: "Is there a best platform?",
      prompt: "Why is no single platform clearly the best today?",
      options: [
        {
          id: "tradeoffs",
          label: "Each trades off speed, coherence, scalability, and fidelity differently",
          correct: true,
          feedback: "Correct. Improving one property often costs another, so the choice depends on the goal.",
        },
        {
          id: "soon",
          label: "One will obviously win once it gets a bit faster",
          feedback: "Speed is only one axis. Coherence, fidelity, and scaling all matter too.",
        },
        {
          id: "same",
          label: "They are all basically identical",
          feedback: "Their trade-offs differ sharply, as the comparison bars showed.",
        },
      ],
      teaching: "Hardware choice is a balance of competing engineering trade-offs.",
    },
    {
      type: "prediction",
      id: "q-identify",
      title: "Identify the platform",
      prompt: "A machine runs near \\( 15 \\) mK inside a dilution refrigerator. Which platform is it most likely using?",
      options: [
        {
          id: "super",
          label: "Superconducting qubits",
          correct: true,
          feedback: "Correct. Superconducting circuits need millikelvin temperatures to work.",
        },
        {
          id: "photon",
          label: "Photonic qubits",
          feedback: "Photonic qubits run at room temperature, not millikelvin.",
        },
        {
          id: "ion",
          label: "Trapped ions",
          feedback: "Ions use vacuum and laser cooling, not a dilution refrigerator.",
        },
      ],
      teaching: "Operating conditions are a fingerprint of the underlying hardware.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "A small classical bit?",
      prompt: "True or false: a qubit is basically a very small classical bit.",
      options: [
        {
          id: "false",
          label: "False,  it is a fragile quantum system needing isolation",
          correct: true,
          feedback: "Correct. Qubits hold superposition and phase, and lose them if disturbed,  unlike classical bits.",
        },
        {
          id: "true",
          label: "True,  just smaller and faster",
          feedback: "A qubit is physically and behaviorally different: it is quantum, and fragile.",
        },
      ],
      teaching: "Qubits are fragile quantum systems, not miniature classical bits.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You met the physical side of quantum computing:",
      points: [
        "A qubit is a real, controllable two-level physical system.",
        "Superconducting circuits, trapped ions, neutral atoms, and photons each make different trade-offs.",
        "All require extreme isolation from the environment.",
      ],
      next: "Qubits are physical and varied. Next, compare the two leading platforms head to head.",
    },
  ],
};

const lessonHardwarePlatforms: Lesson = {
  id: "hardware-platforms",
  title: "Superconducting Qubits vs Trapped Ions",
  description: "Compare the two leading platforms.",
  badge: {
    id: HARDWARE_PLATFORMS_BADGE,
    title: "Superconducting vs Trapped Ions",
    subtitle: "Completed Superconducting Qubits vs Trapped Ions",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Fast versus faithful",
      prompt:
        "Two platforms lead today. One has fast gates but a short memory; the other is slow but remembers a long time. Which should you pick?",
      options: [
        {
          id: "depends",
          label: "It depends on what the machine is for",
          correct: true,
          feedback: "Correct. The right platform depends on whether you need speed, accuracy, memory, or scale.",
        },
        {
          id: "super",
          label: "Always superconducting,  speed wins",
          feedback: "Speed isn't everything; long coherence and high fidelity matter for many tasks.",
        },
        {
          id: "ion",
          label: "Always trapped ions,  accuracy wins",
          feedback: "Accuracy matters, but slow gates and hard scaling can rule ions out for some uses.",
        },
      ],
      teaching: "There is no universally best qubit,  only the best for a given job.",
    },
    {
      type: "hardware-comparison",
      id: "compare",
      title: "Head to head",
      body: "Compare superconducting qubits and trapped ions across gate speed, coherence, scalability, fidelity, and size.",
      platforms: [HW_SUPERCONDUCTING, HW_TRAPPED_IONS],
      teaching:
        "Superconducting: fast gates and chip-style fabrication, but short coherence and millikelvin cooling. Trapped ions: long \\( T_2 \\) and high fidelity, but slow gates and harder scaling.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Who remembers longer?",
      prompt: "From the comparison, which platform had the longer coherence time?",
      options: [
        {
          id: "ions",
          label: "Trapped ions",
          correct: true,
          feedback: "Correct. Trapped ions hold their quantum state far longer than superconducting qubits.",
        },
        {
          id: "super",
          label: "Superconducting",
          feedback: "Superconducting qubits are fast but lose coherence quickly. Ions remember longer.",
        },
      ],
      teaching: "Trapped ions lead on coherence; superconducting leads on speed.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Two leading designs",
      body: [
        "Superconducting circuits are fabricated like chips and run fast gates, but their coherence is short and they need millikelvin cooling.",
        "Trapped ions have long coherence and very high fidelity, but their gates are slower and scaling to many qubits is harder.",
      ],
      misconception:
        "There is no single best qubit. The right platform depends on what you need: speed, accuracy, memory, or scale.",
      realWorld:
        "These trade-offs play out commercially: superconducting machines from IBM and Google chase speed and scale, while trapped-ion machines from IonQ and Quantinuum chase accuracy and long memory.",
      resources: [
        {
          label: "Superconducting quantum computing (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Superconducting_quantum_computing",
          description: "How superconducting qubits work.",
          kind: "article",
        },
        {
          label: "Trapped-ion quantum computer (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Trapped_ion_quantum_computer",
          description: "How trapped-ion qubits work.",
          kind: "article",
        },
      ],
    },
    {
      type: "app-classifier",
      id: "match-goal",
      title: "Choose the platform",
      body: "Match each goal to the better platform, then check.",
      categories: [
        { key: "superconducting", label: "Superconducting" },
        { key: "trapped-ions", label: "Trapped ions" },
      ],
      items: [
        {
          id: "research",
          label: "A 50-qubit research machine you can fabricate and scale",
          answer: "superconducting",
          note: "Chip-style fabrication makes superconducting devices easier to scale to many qubits.",
        },
        {
          id: "memory",
          label: "A highly accurate quantum memory that holds a state a long time",
          answer: "trapped-ions",
          note: "Long coherence and high fidelity make trapped ions ideal for storage.",
        },
        {
          id: "fastest",
          label: "The fastest possible gate operations",
          answer: "superconducting",
          note: "Superconducting gates are among the fastest available.",
        },
        {
          id: "fidelity",
          label: "The highest gate fidelity",
          answer: "trapped-ions",
          note: "Trapped ions currently reach the highest gate fidelities.",
        },
      ],
      teaching: "Matching hardware to the task is the heart of quantum engineering.",
    },
    {
      type: "prediction",
      id: "q-prototypes",
      title: "Why superconducting for prototypes?",
      prompt: "Why do many large prototype machines today use superconducting qubits?",
      options: [
        {
          id: "fab",
          label: "They are fabricated like chips, easing scaling, and run fast gates",
          correct: true,
          feedback: "Correct. Familiar fabrication and speed make them practical for large early devices.",
        },
        {
          id: "cheap",
          label: "They need no cooling, so they are cheap",
          feedback: "They actually need millikelvin cooling. Their advantage is fabrication and speed.",
        },
        {
          id: "perfect",
          label: "They never make errors",
          feedback: "All platforms are noisy. Superconducting wins on scaling and speed, not perfection.",
        },
      ],
      teaching: "Fabrication and gate speed make superconducting qubits popular for large prototypes.",
    },
    {
      type: "prediction",
      id: "q-memory",
      title: "Pick for a memory",
      prompt: "You need a qubit that holds its state a long time with minimal error. Which platform?",
      options: [
        {
          id: "ions",
          label: "Trapped ions",
          correct: true,
          feedback: "Correct. Long coherence and high fidelity make ions the better memory.",
        },
        {
          id: "super",
          label: "Superconducting",
          feedback: "Short coherence makes superconducting a poor choice for long-lived memory.",
        },
      ],
      teaching: "Long-lived, high-fidelity storage favors trapped ions.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Simply better?",
      prompt: "Is one of these platforms simply better than the other overall?",
      options: [
        {
          id: "no",
          label: "No,  each wins on different metrics",
          correct: true,
          feedback: "Correct. Speed, coherence, fidelity, and scalability pull in different directions.",
        },
        {
          id: "yes",
          label: "Yes,  one dominates on every metric",
          feedback: "Neither dominates everywhere; they trade strengths.",
        },
      ],
      teaching: "Leading platforms trade strengths rather than one dominating all.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You compared the two leading platforms:",
      points: [
        "Superconducting: fast gates, chip fabrication, short coherence, deep cooling.",
        "Trapped ions: long coherence and high fidelity, but slow gates and harder scaling.",
        "The best platform depends entirely on the application.",
      ],
      next: "Each platform trades speed for stability. But all qubits share one enemy: noise. Next, watch quantum information decay.",
    },
  ],
};

const lessonNoiseDecoherence: Lesson = {
  id: "noise-decoherence",
  title: "Noise and Decoherence",
  description: "Watch quantum information decay.",
  badge: {
    id: NOISE_DECOHERENCE_BADGE,
    title: "Noise and Decoherence",
    subtitle: "Completed Noise and Decoherence",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Wait too long",
      prompt:
        "The same interference that powers algorithms is fragile. If you prepare a superposition and wait too long before measuring, what happens?",
      options: [
        {
          id: "random",
          label: "It decays toward a random 50/50 outcome",
          correct: true,
          feedback: "Correct. The environment scrambles the state, washing out the quantum information.",
        },
        {
          id: "perfect",
          label: "It stays perfect forever",
          feedback: "Real qubits hold their state only briefly before noise degrades it.",
        },
        {
          id: "flip",
          label: "It flips cleanly to the opposite state",
          feedback: "Decoherence is not a clean flip; it blurs the state toward randomness.",
        },
      ],
      teaching: "Quantum information leaks away over time,  this is decoherence.",
    },
    {
      type: "decoherence",
      id: "explore-time",
      title: "Watch the state shrink",
      body: "Prepare a state and let it sit. Raise the noise and elapsed time, and watch the Bloch vector shrink.",
      showGates: false,
      teaching:
        "As time passes and noise acts, the Bloch vector shrinks toward the center,  the state drifts from definite toward random. These timescales are called \\( T_1 \\) and \\( T_2 \\).",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Where did the probability go?",
      prompt: "As the Bloch vector shrank, the probability of the intended outcome moved toward what value?",
      options: [
        {
          id: "fifty",
          label: "50%,  a coin flip",
          correct: true,
          feedback: "Correct. A fully decohered qubit is random: the intended outcome becomes just 50/50.",
        },
        {
          id: "hundred",
          label: "100%,  more certain",
          feedback: "Decoherence destroys certainty; it moves toward randomness, not toward 100%.",
        },
        {
          id: "zero",
          label: "0%,  the opposite outcome",
          feedback: "It does not flip to the opposite; it blurs to an even 50/50.",
        },
      ],
      teaching: "Decoherence drives outcomes toward an even, random 50/50.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Losing coherence",
      body: [
        "Decoherence is the loss of quantum information to the environment. The Bloch vector shrinks and superpositions blur into ordinary randomness.",
        "\\( T_1 \\) measures how fast a qubit leaks energy. \\( T_2 \\) measures how fast it loses phase coherence, which is the very thing interference depends on.",
      ],
      misconception:
        "Quantum computers do not always produce perfect answers. Every gate and every microsecond adds noise, so real results are probabilistic and degrade over time.",
      realWorld:
        "This is why quantum chips sit in dilution refrigerators near absolute zero. Heat and stray fields are exactly the environment that destroys coherence.",
      whyMatters:
        "Decoherence is the central obstacle to scaling quantum computers, which is why the next lesson on error correction exists at all.",
      memoryConnection:
        "Remember the Bloch sphere from Unit 1? Decoherence is literally that arrow shrinking toward the center as the qubit forgets its state.",
      resources: [
        {
          label: "Quantum decoherence (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_decoherence",
          description: "How quantum states lose coherence.",
          kind: "article",
        },
      ],
    },
    {
      type: "decoherence",
      id: "explore-gates",
      title: "Every gate adds noise",
      body: "Now add gates. Each operation is imperfect. Increase the gate count and watch coherence drop even without waiting.",
      showGates: true,
      teaching:
        "More gates means more chances for error. Long algorithms accumulate noise, which is why circuit depth is limited on today's hardware.",
    },
    {
      type: "prediction",
      id: "q-shallow",
      title: "Why keep circuits short?",
      prompt: "Why must today's quantum algorithms be kept short?",
      options: [
        {
          id: "depth",
          label: "Each gate adds error and coherence decays, so deep circuits become unreliable",
          correct: true,
          feedback: "Correct. Noise accumulates with depth and time, eventually drowning the signal.",
        },
        {
          id: "memory",
          label: "The computer runs out of memory",
          feedback: "It's not memory,  it's noise. Depth and time degrade the quantum state.",
        },
        {
          id: "slow",
          label: "Long circuits are just slow to type",
          feedback: "The real limit is physical: noise builds up with every gate and microsecond.",
        },
      ],
      teaching: "Noise accumulates with depth, capping how deep useful circuits can be.",
    },
    {
      type: "prediction",
      id: "q-t2",
      title: "Which qubit lasts?",
      prompt: "Two qubits: one with long \\( T_2 \\), one with short \\( T_2 \\). Which runs a longer algorithm reliably?",
      options: [
        {
          id: "long",
          label: "The long-\\( T_2 \\) qubit",
          correct: true,
          feedback: "Correct. A longer coherence time leaves more room for gates before noise dominates.",
        },
        {
          id: "short",
          label: "The short-\\( T_2 \\) qubit",
          feedback: "Short \\( T_2 \\) means coherence dies quickly, cutting algorithms short.",
        },
      ],
      teaching: "Longer coherence time allows deeper, more reliable computation.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Exact answers every time?",
      prompt: "Do real quantum computers return the exact answer every single run?",
      options: [
        {
          id: "no",
          label: "No,  noise makes outcomes probabilistic, so we repeat and average",
          correct: true,
          feedback: "Correct. Results scatter due to noise; many runs are combined to extract the answer.",
        },
        {
          id: "yes",
          label: "Yes,  quantum computers are exact",
          feedback: "Noise makes every run imperfect. Real devices rely on repetition and statistics.",
        },
      ],
      teaching: "Real quantum results are statistical, gathered over many noisy runs.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You watched quantum information degrade:",
      points: [
        "Decoherence shrinks the Bloch vector, blurring superpositions into randomness.",
        "\\( T_1 \\) and \\( T_2 \\) set how long a qubit stays useful; gates add still more noise.",
        "Real outcomes are probabilistic, recovered by repeating runs.",
      ],
      next: "Noise erodes quantum information. But we can fight back,  without copying it. Next, error correction.",
    },
  ],
};

const lessonErrorCorrection: Lesson = {
  id: "error-correction",
  title: "Quantum Error Correction",
  description: "Protect qubits without copying them.",
  badge: {
    id: ERROR_CORRECTION_BADGE,
    title: "Quantum Error Correction",
    subtitle: "Completed Quantum Error Correction",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "Fixing errors without copying",
      prompt:
        "Classically we fix errors by copying a bit and taking the majority. The No-Cloning theorem forbids copying a qubit. Can quantum computers still correct errors?",
      options: [
        {
          id: "spread",
          label: "Yes,  by spreading information across qubits, not copying it",
          correct: true,
          feedback: "Correct. Encoding spreads the logical state so errors can be detected and undone.",
        },
        {
          id: "no",
          label: "No,  No-Cloning makes error correction impossible",
          feedback: "Correction is possible; it spreads information rather than copying the unknown state.",
        },
        {
          id: "restart",
          label: "Only by measuring and restarting",
          feedback: "Measuring the data would destroy it. Correction detects errors without reading the state.",
        },
      ],
      teaching: "Quantum error correction spreads information; it never copies the qubit.",
    },
    {
      type: "error-correction",
      id: "encode",
      title: "Encode and recover",
      body: "Encode one logical qubit into several physical qubits. Inject a little noise, then recover by majority vote.",
      teaching:
        "With low noise, at most one physical qubit flips, and the majority restores the logical value. The information is spread, not copied,  checks read error patterns, not the data itself.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "How many can flip?",
      prompt: "With three physical qubits, recovery by majority vote succeeds as long as how many flip?",
      options: [
        {
          id: "one",
          label: "At most one",
          correct: true,
          feedback: "Correct. If two or three of three flip, the majority is wrong and recovery fails.",
        },
        {
          id: "any",
          label: "Any number",
          feedback: "Too many flips overwhelm the majority. Three qubits tolerate only one error.",
        },
        {
          id: "all",
          label: "All three",
          feedback: "If all flip, the majority is fully wrong. The limit is one error for three qubits.",
        },
      ],
      teaching: "A three-qubit code corrects a single error, no more.",
    },
    {
      type: "informative",
      id: "explain",
      title: "Spread, don't copy",
      body: [
        "Error correction encodes one logical qubit across many physical qubits. Special measurements detect where an error occurred without measuring the data itself, so the state survives.",
        "This respects No-Cloning: nothing is copied. The information is spread out, and redundancy lets errors be found and undone.",
      ],
      misconception:
        "Error correction does not copy the qubit, which No-Cloning forbids. It distributes the information so errors can be detected and reversed.",
      realWorld:
        "Error correction is the make-or-break technology for useful quantum computers: recent experiments have shown that adding more physical qubits can finally start lowering the logical error rate.",
      resources: [
        {
          label: "Quantum error correction (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Quantum_error_correction",
          description: "How logical qubits are protected.",
          kind: "article",
        },
      ],
    },
    {
      type: "error-correction",
      id: "threshold",
      title: "Find the breaking point",
      body: "Now crank up the noise. Find the point where too many qubits flip and recovery fails.",
      teaching:
        "When more than half the physical qubits flip, the majority vote gives the wrong answer. Correction works only while errors stay rare,  below a threshold.",
    },
    {
      type: "prediction",
      id: "q-more",
      title: "More physical qubits",
      prompt: "Encoding each logical qubit into more physical qubits does what?",
      options: [
        {
          id: "tolerate",
          label: "Tolerates more errors, if the per-qubit error rate is low enough",
          correct: true,
          feedback: "Correct. More redundancy corrects more errors,  but only below the error threshold.",
        },
        {
          id: "nothing",
          label: "Nothing,  redundancy never helps qubits",
          feedback: "Redundancy does help, exactly as it did in the simulator, when noise is low enough.",
        },
        {
          id: "always",
          label: "Guarantees perfect correction at any noise level",
          feedback: "Only below a threshold. Above it, more qubits actually hurt.",
        },
      ],
      teaching: "More physical qubits tolerate more errors, provided noise stays below threshold.",
    },
    {
      type: "prediction",
      id: "q-threshold",
      title: "The condition for success",
      prompt: "Error correction reliably helps only if the physical error rate is what?",
      options: [
        {
          id: "below",
          label: "Below a threshold",
          correct: true,
          feedback: "Correct. Below threshold, adding qubits drives the logical error rate down.",
        },
        {
          id: "zero",
          label: "Exactly zero",
          feedback: "It need not be zero,  just low enough to be below the threshold.",
        },
        {
          id: "any",
          label: "Any value at all",
          feedback: "Above the threshold, correction fails and more qubits make it worse.",
        },
      ],
      teaching: "Error correction works below a noise threshold, not at arbitrary noise.",
    },
    {
      type: "prediction",
      id: "q-misconception",
      title: "Does it break No-Cloning?",
      prompt: "Does quantum error correction violate the No-Cloning theorem?",
      options: [
        {
          id: "no",
          label: "No,  it spreads information without copying the state",
          correct: true,
          feedback: "Correct. The logical state is encoded across qubits, never duplicated.",
        },
        {
          id: "yes",
          label: "Yes,  it secretly copies the qubit",
          feedback: "It does not copy. Encoding distributes information; that is what makes it allowed.",
        },
      ],
      teaching: "Error correction is consistent with No-Cloning: it spreads, never copies.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Summary",
      intro: "You protected a logical qubit:",
      points: [
        "One logical qubit is encoded across several physical qubits.",
        "Majority-style recovery fixes errors while they stay below a threshold.",
        "Information is spread, not copied,  consistent with No-Cloning.",
      ],
      next: "Redundancy protects qubits without copying them. Next, where all of this is heading,  the future of quantum computing.",
    },
  ],
};

const lessonFutureQuantum: Lesson = {
  id: "future-quantum",
  title: "The Future of Quantum Computing",
  description: "Where the field is, and where it is heading.",
  badge: {
    id: FUTURE_QUANTUM_BADGE,
    title: "The Future of Quantum Computing",
    subtitle: "Completed The Future of Quantum Computing",
  },
  steps: [
    {
      type: "prediction",
      id: "hook",
      title: "What will quantum computers be good for?",
      prompt:
        "You've seen what quantum computers can do and how fragile they are. Which kinds of problems are most likely to benefit from them?",
      options: [
        {
          id: "structured",
          label: "A specific few with the right structure, like chemistry and cryptography",
          correct: true,
          feedback: "Correct. Quantum advantage is targeted, not universal,  it follows the structure of the problem.",
        },
        {
          id: "everything",
          label: "Essentially everything we run today",
          feedback: "Most tasks gain nothing. The wins are concentrated in specific, structured problems.",
        },
        {
          id: "nothing",
          label: "Nothing practical, ever",
          feedback: "Some applications, like simulating molecules, are genuinely promising.",
        },
      ],
      teaching: "Quantum advantage is specialized: it targets problems with exploitable structure.",
    },
    {
      type: "app-classifier",
      id: "applications",
      title: "Classify the applications",
      body: "Sort each application by how well it fits a quantum computer, then check.",
      categories: [
        { key: "strong", label: "Strong quantum fit" },
        { key: "limited", label: "Limited or none" },
      ],
      items: [
        {
          id: "drug",
          label: "Drug discovery (simulating molecules)",
          answer: "strong",
          note: "Simulating quantum chemistry is a natural exponential win.",
        },
        {
          id: "materials",
          label: "Materials science (new quantum materials)",
          answer: "strong",
          note: "Like chemistry, this is quantum simulation,  a strong fit.",
        },
        {
          id: "crypto",
          label: "Breaking today's public-key encryption",
          answer: "strong",
          note: "Shor's algorithm factors exponentially faster, threatening RSA.",
        },
        {
          id: "logistics",
          label: "Everyday logistics optimization",
          answer: "limited",
          note: "Speedups here are usually modest at best, often none.",
        },
        {
          id: "web",
          label: "Running everyday web and business apps",
          answer: "limited",
          note: "These have no structure for interference to exploit,  no advantage.",
        },
      ],
      teaching: "The biggest wins cluster around simulation and a few structured problems like factoring.",
    },
    {
      type: "prediction",
      id: "observe",
      title: "Where were the biggest wins?",
      prompt: "Which kind of application showed the clearest, largest quantum advantage?",
      options: [
        {
          id: "sim",
          label: "Simulating quantum systems (chemistry, materials)",
          correct: true,
          feedback: "Correct. Quantum computers are naturally suited to simulating quantum physics.",
        },
        {
          id: "web",
          label: "Everyday web and business apps",
          feedback: "Those gain nothing. Simulation is the standout strong fit.",
        },
        {
          id: "all",
          label: "All applications equally",
          feedback: "The fit varied sharply; simulation and factoring led.",
        },
      ],
      teaching: "Simulating quantum systems is the most natural quantum application.",
    },
    {
      type: "informative",
      id: "explain",
      title: "From NISQ to fault tolerance",
      body: [
        "Today's machines are noisy and intermediate-scale (NISQ): dozens to hundreds of imperfect qubits, with circuits kept shallow.",
        "Reaching broadly useful, large computations needs fault tolerance,  error correction at scale,  which is the field's central engineering goal.",
      ],
      misconception:
        "Quantum computers will not replace classical computers. They are specialized accelerators that will work alongside classical machines for specific tasks.",
      realWorld:
        "You can already run small programs on real NISQ hardware over the cloud today, while the field races toward fault-tolerant machines that could one day break encryption or design new materials.",
      resources: [
        {
          label: "Noisy intermediate-scale quantum era (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Noisy_intermediate-scale_quantum_era",
          description: "Where quantum hardware stands today.",
          kind: "article",
        },
      ],
    },
    {
      type: "tech-timeline",
      id: "timeline",
      title: "The road ahead",
      body: "Click through the stages from today's machines toward useful quantum computing.",
      milestones: [
        {
          id: "nisq",
          period: "Today",
          title: "NISQ machines",
          detail: "Dozens to hundreds of noisy qubits running shallow circuits. Useful for research, not yet for large practical problems.",
        },
        {
          id: "logical",
          period: "Near term",
          title: "Early error-corrected qubits",
          detail: "Many physical qubits combine into a few reliable logical qubits, proving error correction works at small scale.",
        },
        {
          id: "fault",
          period: "Goal",
          title: "Fault-tolerant machines",
          detail: "Error correction at scale lets deep algorithms run reliably, despite noisy hardware underneath.",
        },
        {
          id: "useful",
          period: "Beyond",
          title: "Broad quantum advantage",
          detail: "Chemistry, materials, and other structured problems solved faster than any classical computer can manage.",
        },
      ],
      teaching: "Progress runs from noisy prototypes toward fault-tolerant machines that unlock real applications.",
    },
    {
      type: "prediction",
      id: "q-blocker",
      title: "The central challenge",
      prompt: "What stands between today's machines and broad usefulness?",
      options: [
        {
          id: "ftqc",
          label: "Scalable, fault-tolerant error correction",
          correct: true,
          feedback: "Correct. Taming noise at scale with error correction is the key remaining hurdle.",
        },
        {
          id: "speed",
          label: "Faster classical processors",
          feedback: "Classical speed isn't the bottleneck; controlling quantum noise at scale is.",
        },
        {
          id: "software",
          label: "Just more apps",
          feedback: "The hard part is hardware and error correction, not the number of apps.",
        },
      ],
      teaching: "Fault tolerance at scale is the field's defining engineering challenge.",
    },
    {
      type: "bloch-explorer",
      id: "recap-state",
      title: "Recap: a single qubit",
      body: "A final review. From Unit 1: a qubit's state lives on the Bloch sphere. Drag it once more and watch the probabilities.",
      showPhi: true,
      teaching:
        "Where it began: one qubit, two angles, and a probability rule. Everything else is built on this.",
    },
    {
      type: "amplitude-amplifier",
      id: "recap-interference",
      title: "Recap: interference at work",
      body: "From Units 3 and 5: interference concentrates probability on the right answer. Apply a few iterations.",
      size: 8,
      teaching:
        "Quantum power is here: amplitudes interfere before measurement, amplifying useful answers,  not trying every answer at once.",
    },
    {
      type: "two-qubit-explorer",
      id: "recap-entanglement",
      title: "Recap: entanglement",
      body: "From Unit 4: build an entangled pair (H on q0, then CNOT) and measure many times.",
      allowedGates: ["X", "H", "Z"],
      showCnot: true,
      allowMeasureSingle: false,
      allowMeasureBoth: true,
      allowHistogram: true,
      teaching:
        "Entanglement links qubits into one joint state,  correlations with no classical counterpart, yet no faster-than-light signaling.",
    },
    {
      type: "prediction",
      id: "q-synthesis",
      title: "What makes it different?",
      prompt: "Pulling it all together, what makes quantum computing fundamentally different from classical computing?",
      options: [
        {
          id: "interfere",
          label: "Amplitudes interfere before measurement, and qubits can entangle",
          correct: true,
          feedback: "Correct. Interference and entanglement,  not faster hardware,  are the real difference.",
        },
        {
          id: "faster",
          label: "It is simply faster classical hardware",
          feedback: "It is not faster classical hardware; it computes by interference and entanglement.",
        },
        {
          id: "morebits",
          label: "It just stores many more bits",
          feedback: "It is not extra storage. Power comes from interference among amplitudes.",
        },
      ],
      teaching: "Interference and entanglement, not raw speed or storage, set quantum computing apart.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Course summary",
      intro: "You completed the journey from a single qubit to real machines:",
      points: [
        "What makes it different: amplitudes interfere before measurement, and qubits entangle.",
        "Why it is powerful: interference amplifies useful answers for structured problems.",
        "Why it is hard: qubits are fragile, noise causes decoherence, and error correction is demanding.",
        "Where it is heading: from noisy prototypes toward fault-tolerant, genuinely useful machines.",
      ],
      next: "You've completed Quantum Computing Fundamentals,  from superposition and measurement to algorithms and the hardware that will one day run them.",
    },
  ],
};

const chapters: Unit[] = [
  {
    id: "chapter-information",
    title: "Unit 1: Information",
    description: "Qubits, measurement, and quantum states.",
    lessonIds: [
      lesson1.id,
      lesson2.id,
      lessonBloch.id,
      lessonPhase.id,
      lessonNoCloning.id,
    ],
  },
  {
    id: "chapter-transforming",
    title: "Unit 2: Transforming Information",
    description: "Gates and the circuits that combine them.",
    lessonIds: [
      lesson3.id,
      lessonPauliZ.id,
      lessonHadamard.id,
      lesson4.id,
      lessonReversibility.id,
      lessonUniversal.id,
    ],
  },
  {
    id: "chapter-why-quantum",
    title: "Unit 3: Why Quantum Works",
    description: "How amplitudes and interference power quantum.",
    lessonIds: [
      lesson5.id,
      lessonConstructive.id,
      lessonDestructive.id,
      lessonAdvantage.id,
    ],
  },
  {
    id: "chapter-multiple-qubits",
    title: "Unit 4: Multiple Qubits",
    description: "Entanglement and correlated measurements.",
    lessonIds: [
      lessonClassicalCorrelation.id,
      lessonEntanglement.id,
      lessonBellStates.id,
      lessonMeasuringEntangled.id,
      lessonNoSignaling.id,
    ],
  },
  {
    id: "chapter-algorithms",
    title: "Unit 5: Quantum Algorithms",
    description: "How quantum mechanics becomes computation.",
    lessonIds: [
      lessonQuantumAlgorithm.id,
      lessonDeutschJozsa.id,
      lessonGrover.id,
      lessonShor.id,
      lessonQuantumWins.id,
    ],
  },
  {
    id: "chapter-hardware",
    title: "Unit 6: Real Quantum Computers",
    description: "How real quantum computers are built and run.",
    lessonIds: [
      lessonBuildingQC.id,
      lessonHardwarePlatforms.id,
      lessonNoiseDecoherence.id,
      lessonErrorCorrection.id,
      lessonFutureQuantum.id,
    ],
  },
];

export const quantumBasicsCourse: Course = {
  id: "quantum-basics",
  title: "Quantum Computing Fundamentals",
  description: "An interactive, experiment-first introduction to quantum computing.",
  units: chapters,
  lessons: [
    lesson1,
    lesson2,
    lessonBloch,
    lessonPhase,
    lessonNoCloning,
    lesson3,
    lessonPauliZ,
    lessonHadamard,
    lesson4,
    lessonReversibility,
    lessonUniversal,
    lesson5,
    lessonConstructive,
    lessonDestructive,
    lessonAdvantage,
    lessonClassicalCorrelation,
    lessonEntanglement,
    lessonBellStates,
    lessonMeasuringEntangled,
    lessonNoSignaling,
    lessonQuantumAlgorithm,
    lessonDeutschJozsa,
    lessonGrover,
    lessonShor,
    lessonQuantumWins,
    lessonBuildingQC,
    lessonHardwarePlatforms,
    lessonNoiseDecoherence,
    lessonErrorCorrection,
    lessonFutureQuantum,
  ],
};

export type UnitStatus = "completed" | "active" | "locked" | "coming-soon";

export function getLesson(lessonId: string): Lesson | undefined {
  return quantumBasicsCourse.lessons.find((l) => l.id === lessonId);
}

export function getNextLesson(lessonId: string): Lesson | undefined {
  const idx = quantumBasicsCourse.lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return undefined;
  return quantumBasicsCourse.lessons[idx + 1];
}

export function getUnits(): Unit[] {
  return quantumBasicsCourse.units;
}

/** Resolve a chapter's lesson IDs to Lesson objects (skips any not yet built). */
export function getLessonsForUnit(unit: Unit): Lesson[] {
  return unit.lessonIds
    .map((id) => getLesson(id))
    .filter((l): l is Lesson => !!l);
}

export function getUnitStatus(unit: Unit, profile: UserProfile | null): UnitStatus {
  const lessons = getLessonsForUnit(unit);
  if (lessons.length === 0) return "coming-soon";
  if (lessons.every((l) => profile?.progress?.[l.id]?.completed)) return "completed";
  if (isLessonUnlocked(lessons[0].id, profile)) return "active";
  return "locked";
}

/**
 * A lesson is unlocked if it is the first lesson, the previous lesson has been
 * completed, or the lesson itself has already been completed (so completed
 * lessons stay reachable even when new lessons are inserted before them).
 * Lessons with no steps stay locked.
 */
export function isLessonUnlocked(
  lessonId: string,
  profile: UserProfile | null
): boolean {
  const idx = quantumBasicsCourse.lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return false;
  const lesson = quantumBasicsCourse.lessons[idx];
  if (lesson.steps.length === 0) return false;
  if (profile?.progress?.[lessonId]?.completed) return true;
  if (idx === 0) return true;
  const prev = quantumBasicsCourse.lessons[idx - 1];
  return !!profile?.progress?.[prev.id]?.completed;
}

// --- Achievement / progress helpers (pure) ---------------------------------

/** Lessons that are actually built (have at least one step). */
function builtLessons(): Lesson[] {
  return quantumBasicsCourse.lessons.filter((l) => l.steps.length > 0);
}

/** Units that contain at least one built lesson. */
function builtUnits(): Unit[] {
  return quantumBasicsCourse.units.filter((u) => getLessonsForUnit(u).length > 0);
}

/** Total number of built lessons across the course. */
export function getTotalLessonCount(): number {
  return builtLessons().length;
}

/** How many built lessons the learner has completed. */
export function getCompletedLessonCount(profile: UserProfile | null): number {
  return builtLessons().filter((l) => profile?.progress?.[l.id]?.completed).length;
}

/** Total number of built units across the course. */
export function getTotalUnitCount(): number {
  return builtUnits().length;
}

/** True when every lesson in the unit is completed (and the unit has lessons). */
export function isUnitComplete(unit: Unit, profile: UserProfile | null): boolean {
  const lessons = getLessonsForUnit(unit);
  return lessons.length > 0 && lessons.every((l) => !!profile?.progress?.[l.id]?.completed);
}

/** How many built units are fully completed. */
export function getCompletedUnitCount(profile: UserProfile | null): number {
  return builtUnits().filter((u) => isUnitComplete(u, profile)).length;
}

/** Completed/total lesson counts within a single unit. */
export function getUnitLessonProgress(
  unit: Unit,
  profile: UserProfile | null
): { completed: number; total: number } {
  const lessons = getLessonsForUnit(unit);
  return {
    completed: lessons.filter((l) => !!profile?.progress?.[l.id]?.completed).length,
    total: lessons.length,
  };
}

/** True when every built lesson in every unit is completed. */
export function isCourseComplete(profile: UserProfile | null): boolean {
  const lessons = builtLessons();
  return lessons.length > 0 && lessons.every((l) => !!profile?.progress?.[l.id]?.completed);
}

export interface AchievementProgress {
  current: number;
  target: number;
  unlocked: boolean;
  /** Fraction toward the target, clamped to [0, 1]. */
  ratio: number;
}

/** Progress toward a numeric goal (e.g. a streak length). Pure and testable. */
export function getAchievementProgress(current: number, target: number): AchievementProgress {
  const safeTarget = target > 0 ? target : 1;
  return {
    current,
    target,
    unlocked: current >= target,
    ratio: Math.max(0, Math.min(1, current / safeTarget)),
  };
}
