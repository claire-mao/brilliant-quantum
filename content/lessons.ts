import type { Course, Lesson, UserProfile } from "@/lib/types";

export const QUANTUM_BEGINNER_BADGE = "quantum-beginner";
export const MEASUREMENT_ROOKIE_BADGE = "measurement-rookie";
export const QUANTUM_GATES_STARTER_BADGE = "quantum-gates-starter";
export const QUANTUM_CIRCUIT_BUILDER_BADGE = "quantum-circuit-builder";
export const INTERFERENCE_EXPLORER_BADGE = "interference-explorer";

const lesson1: Lesson = {
  id: "qubits-superposition",
  title: "Qubits & Superposition",
  description: "Discover how a qubit is different from a classical bit - by playing with one.",
  badge: {
    id: QUANTUM_BEGINNER_BADGE,
    title: "Quantum Beginner",
    subtitle: "Completed Qubits & Superposition",
  },
  steps: [
    {
      type: "bit-explorer",
      id: "classical-bit",
      title: "Meet a classical bit",
      prompt:
        "Flip the switch a few times. A normal computer bit is always either 0 or 1. Can a classical bit be both 0 and 1 at the same time?",
      options: [
        {
          id: "no",
          label: "No, it's always one or the other",
          correct: true,
          feedback:
            "Exactly. A classical bit is like a light switch: it's either OFF (0) or ON (1). It always holds one definite value - never both at once.",
        },
        {
          id: "yes",
          label: "Yes, it can be both",
          feedback:
            "Not for a classical bit. A regular bit always has one definite value, 0 or 1. Holding both at once is a quantum idea - and that's exactly where we're headed next.",
        },
      ],
    },
    {
      type: "informative",
      id: "why-quantum",
      title: "Why quantum computing matters",
      emoji: "⚛️",
      body: [
        "Regular computers are amazing, but some problems are just too big for them - like designing new medicines, building better batteries, or modeling how molecules behave.",
        "Quantum computers work in a fundamentally different way. By using qubits instead of bits, they can explore many possibilities at once, which could crack problems that would take a normal computer billions of years.",
        "You don't need any heavy math to start. In this lesson, you'll build the core intuition by playing with a qubit yourself.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/",
          description: "Free beginner-friendly courses on quantum computing.",
          kind: "docs",
        },
        {
          label: "Qiskit beginner resources",
          url: "https://www.ibm.com/quantum/qiskit",
          description: "Tools and tutorials for writing your first quantum programs.",
          kind: "docs",
        },
        {
          label: "Watch: Quantum computing for beginners",
          url: "https://www.youtube.com/results?search_query=quantum+computing+for+beginners",
          description: "Short explainer videos (opens YouTube in a new tab).",
          kind: "video",
        },
      ],
    },
    {
      type: "prediction",
      id: "predict-qubit",
      title: "Predict: what makes a qubit different?",
      prompt:
        "A classical bit might be 100% a 0. A qubit could be 50% likely to measure 0 and 50% likely to measure 1. Before we dig in - what do you think makes a qubit different?",
      options: [
        {
          id: "both",
          label: "It can hold both possibilities at once",
          correct: true,
          feedback:
            "That's the key idea! A qubit can be in a blend of 0 and 1 at the same time - called superposition. The percentages describe how likely each result is when you measure it.",
        },
        {
          id: "random",
          label: "It just changes randomly",
          feedback:
            "Close, but not quite. A qubit isn't randomly flipping. It holds a real blend of 0 and 1 (superposition), and the probabilities are fixed until you measure it.",
        },
        {
          id: "faster",
          label: "It's just a faster bit",
          feedback:
            "It's not about raw speed. The real difference is that a qubit can be in a blend of 0 and 1 at once - something a classical bit simply cannot do.",
        },
      ],
    },
    {
      type: "playground",
      id: "superposition-playground",
      title: "Superposition playground",
      body:
        "A qubit can exist in a superposition of outcomes. The probabilities describe what a measurement might produce. Drag the slider and watch the two bars: P(0) and P(1) always add up to 100%.",
    },
    {
      type: "informative",
      id: "what-measurement-means",
      title: "What measurement means",
      emoji: "🔎",
      body: [
        "So far the qubit has been a blend of 0 and 1. But the moment you look - or \"measure\" - it has to commit to a single answer: 0 or 1.",
        "Think of a spinning coin. While it spins, asking \"heads or tails?\" doesn't make sense. The instant it lands, it's one or the other.",
        "The probabilities don't tell you what one measurement will be - they tell you how often each result shows up if you measure many times. Let's see that in action next.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning: measurement",
          url: "https://learning.quantum.ibm.com/",
          description: "Go deeper on measurement when you're ready.",
          kind: "docs",
        },
      ],
    },
    {
      type: "simulation",
      id: "run-measurements",
      title: "Run some measurements",
      prompt:
        "Set a probability, then tap \"Measure 100 times\" to actually measure the qubit again and again. What do you notice about the results?",
      teaching:
        "Each measurement forces the qubit to pick a single answer - 0 or 1. You can't control any single result, but over many measurements the outcomes follow the probabilities. The higher the probability, the more often that result shows up.",
      defaultProbability: 70,
      sampleSize: 100,
    },
    {
      type: "prediction",
      id: "prediction-challenge",
      title: "Quick prediction",
      prompt:
        "Imagine a qubit set to P(1) = 75%. If we measure it many times, which result should appear more often?",
      options: [
        {
          id: "one",
          label: "1",
          correct: true,
          feedback:
            "Right! With a 75% chance of 1, you'd expect about 75 ones and 25 zeros out of 100 measurements. The higher-probability outcome shows up more often.",
        },
        {
          id: "zero",
          label: "0",
          feedback:
            "Not this time. P(1) = 75% means measuring 1 is the likely result. P(0) would only be 25%, so 0 would actually appear less often.",
        },
        {
          id: "equal",
          label: "About equal",
          feedback:
            "They'd only be equal if both were 50%. Here P(1) = 75% and P(0) = 25%, so 1 should appear about three times as often as 0.",
        },
      ],
    },
    {
      type: "challenge",
      id: "build-target",
      title: "Build the target qubit",
      prompt: "Now you try. Set the qubit so it has a 75% chance of measuring 1.",
      targetProbability: 75,
      tolerance: 5,
      correctFeedback:
        "Great! You've created a qubit where measuring 1 is much more likely than measuring 0 - about 75% to 25%. That's superposition you designed yourself.",
      incorrectFeedback:
        "Not quite there. You want P(1) to be about 75%, which leaves P(0) at about 25%. Nudge the slider toward the higher end and check again.",
    },
    {
      type: "reflection",
      id: "reflection",
      title: "You did it!",
      intro: "In a few minutes of playing, you uncovered the core ideas behind a qubit:",
      points: [
        "Classical bits hold one definite value - 0 or 1.",
        "Qubits use probabilities to describe a superposition of 0 and 1.",
        "Measuring a qubit produces a single outcome, 0 or 1.",
        "Higher-probability outcomes appear more often over many measurements.",
      ],
    },
  ],
};

const lesson2: Lesson = {
  id: "measurement",
  title: "Measurement",
  description: "What really happens the moment you measure a qubit?",
  badge: {
    id: MEASUREMENT_ROOKIE_BADGE,
    title: "Measurement Rookie",
    subtitle: "Completed the Measurement lesson",
  },
  steps: [
    {
      type: "informative",
      id: "what-is-measurement",
      title: "What does measurement mean?",
      emoji: "🔎",
      body: [
        "A qubit can sit in a blend of 0 and 1 - that's superposition. But you can never see that blend directly.",
        "Measuring a qubit is like asking it a single yes/no question: \"Are you 0 or 1?\" The qubit has to answer with exactly one of them.",
        "Before you measure, all you can talk about is probabilities - how likely each answer is. After you measure, you have one real, concrete result.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/",
          description: "Free beginner-friendly courses, including measurement.",
          kind: "docs",
        },
      ],
    },
    {
      type: "prediction",
      id: "predict-before-measuring",
      title: "Predict before measuring",
      prompt:
        "Here's a qubit ready to be measured: P(0) = 30% and P(1) = 70%. If you measure it just once, what can happen?",
      options: [
        {
          id: "must-one",
          label: "It must return 1, because 70% is bigger.",
          feedback:
            "Not quite. 70% means 1 is more likely, but not guaranteed. A single measurement can still come out 0 - about 30% of the time.",
        },
        {
          id: "either",
          label: "It can return either 0 or 1, but 1 is more likely.",
          correct: true,
          feedback:
            "Exactly right. A single measurement gives either 0 or 1. With P(1) = 70%, getting 1 is more likely, but 0 can absolutely happen.",
        },
        {
          id: "point-seven",
          label: "It returns 0.7.",
          feedback:
            "A measurement never returns a fraction. The 0.7 is the probability of getting 1 - the actual result is always a whole 0 or 1.",
        },
      ],
    },
    {
      type: "single-measurement",
      id: "single-measurement",
      title: "Measure the qubit once",
      body:
        "This qubit is prepared with a 70% chance of measuring 1. Right now it's uncertain - a blend of both answers. Tap \"Measure once\" and watch what happens.",
      probabilityOfOne: 70,
      teaching:
        "The moment you measured, the qubit collapsed to a single result. That result is completely real - but it does not, on its own, tell you the original 70/30 odds. One measurement is just one answer.",
    },
    {
      type: "fresh-batch",
      id: "fresh-batch",
      title: "Try again with fresh qubits",
      body:
        "Each run prepares a brand-new qubit with the same 70% chance of measuring 1, then measures it. Run a batch and look at the sequence of results.",
      prompt: "What pattern do you notice as you run it a few times?",
      probabilityOfOne: 70,
      sampleSize: 10,
      teaching:
        "No single result is predictable, but 1 tends to show up more often than 0 - because 1 is more likely. The more qubits you measure, the clearer that pattern gets.",
    },
    {
      type: "informative",
      id: "collapse-explained",
      title: "Collapse",
      emoji: "💥",
      body: [
        "When you measure a qubit, its superposition collapses: the blend of possibilities turns into one observed result, 0 or 1.",
        "Here's the key part: once a qubit has collapsed, it stays there. If you immediately measure that same qubit again, you get the exact same result - it's no longer uncertain.",
        "So how do you ever see the probabilities? You prepare many fresh qubits with the same settings and measure each one. The collection of results reveals the pattern.",
      ],
    },
    {
      type: "collapse-check",
      id: "collapse-check",
      title: "Collapse check",
      measuredResult: 1,
      prompt:
        "You just measured a qubit and it returned 1, so it has collapsed. If you measure that same qubit again right away, what should happen?",
      options: [
        {
          id: "same",
          label: "It should return 1 again.",
          correct: true,
          feedback:
            "Correct! Once a qubit collapses to 1, measuring it again immediately gives 1 every time. The uncertainty is gone for that qubit.",
        },
        {
          id: "reset",
          label: "It should go back to 70/30.",
          feedback:
            "Not quite. Measuring doesn't reset the qubit. To see 70/30 again you'd need to prepare a fresh qubit, not re-measure this collapsed one.",
        },
        {
          id: "balance",
          label: "It must return 0 next to balance things out.",
          feedback:
            "There's no \"balancing\" rule. The qubit has already collapsed to 1, so it simply stays 1 when measured again. Past results don't force future ones.",
        },
      ],
      teaching:
        "A collapsed qubit keeps its result. Probabilities only describe fresh, un-measured qubits.",
    },
    {
      type: "simulation",
      id: "many-measurements",
      title: "Many measurements reveal the probabilities",
      prompt:
        "Set any probability you like, then measure 100 fresh qubits. Try a few different settings and watch how the histogram follows your slider.",
      teaching:
        "With 100 fresh qubits, the counts of 0s and 1s closely match the probabilities you set. Measuring many freshly prepared qubits is how you reveal the underlying odds.",
      defaultProbability: 70,
      sampleSize: 100,
    },
    {
      type: "prediction",
      id: "mastery-challenge",
      title: "Final challenge",
      prompt:
        "A qubit is prepared with P(1) = 20%. You measure 100 fresh copies. Which result should appear more often?",
      options: [
        {
          id: "zero",
          label: "0",
          correct: true,
          feedback:
            "Exactly. P(1) = 20% means P(0) = 80%, so 0 should appear far more often - roughly 80 times out of 100.",
        },
        {
          id: "one",
          label: "1",
          feedback:
            "Not this time. P(1) is only 20%, so 1 is the rarer result here. 0, at 80%, should appear much more often.",
        },
        {
          id: "equal",
          label: "They must be exactly equal.",
          feedback:
            "They'd only be roughly equal if both were near 50%. With P(1) = 20% and P(0) = 80%, 0 should clearly win.",
        },
      ],
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Measurement mastered!",
      intro: "You now understand what measurement really does to a qubit:",
      points: [
        "Measurement gives one concrete answer: 0 or 1.",
        "Higher probability means more likely, not guaranteed.",
        "Collapse means the measured qubit now matches what you observed.",
        "To estimate probabilities, measure many freshly prepared qubits.",
      ],
    },
  ],
};

const lesson3: Lesson = {
  id: "quantum-gates",
  title: "Quantum Gates",
  description: "Learn the actions that change a qubit before you measure it.",
  badge: {
    id: QUANTUM_GATES_STARTER_BADGE,
    title: "Quantum Gates Starter",
    subtitle: "Completed the Quantum Gates lesson",
  },
  steps: [
    {
      type: "informative",
      id: "what-is-a-gate",
      title: "What is a quantum gate?",
      emoji: "🎛️",
      body: [
        "A gate is simply an operation you apply to a qubit - an action that changes it.",
        "In a regular computer, logic gates change bits. For example, a NOT gate turns a 0 into a 1.",
        "In a quantum computer, gates change a qubit's probabilities - how likely it is to measure 0 or 1.",
        "You apply gates first, to prepare the qubit, and then you measure it. Let's start with something familiar.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning: gates",
          url: "https://learning.quantum.ibm.com/",
          description: "Explore quantum gates in more depth when you're ready.",
          kind: "docs",
        },
      ],
    },
    {
      type: "bit-explorer",
      id: "classical-not",
      title: "The classical NOT gate",
      prompt:
        "Tap the bit to apply a NOT gate a few times. Watch how it changes. What does the NOT gate do?",
      options: [
        {
          id: "flip",
          label: "It flips the bit.",
          correct: true,
          feedback:
            "Exactly. NOT flips the bit: 0 becomes 1, and 1 becomes 0. The quantum X gate does the same thing to a qubit.",
        },
        {
          id: "nothing",
          label: "It leaves the bit unchanged.",
          feedback:
            "Not quite - look again. Each time you apply NOT, a 0 becomes 1 and a 1 becomes 0. It flips the value.",
        },
        {
          id: "random",
          label: "It makes the bit random.",
          feedback:
            "No - NOT is completely predictable. It always flips: 0 to 1, and 1 to 0. There's nothing random about it.",
        },
      ],
    },
    {
      type: "informative",
      id: "meet-x-gate",
      title: "Meet the X gate",
      emoji: "🔁",
      body: [
        "The quantum X gate is the qubit version of NOT.",
        "If a qubit is definitely 0, applying X makes it definitely 1.",
        "If a qubit is definitely 1, applying X makes it definitely 0.",
        "In other words, X swaps the probabilities of measuring 0 and 1.",
      ],
    },
    {
      type: "gate-playground",
      id: "x-gate-playground",
      title: "X gate playground",
      body:
        "Pick a starting state, then apply the X gate and watch the probability bars flip. Try it from both 0 and 1.",
      initialPOne: 0,
      allowStateSelect: true,
      gates: ["X"],
      teaching:
        "X flips a definite qubit: 0 becomes 1, and 1 becomes 0. The probability of measuring each value swaps.",
    },
    {
      type: "prediction",
      id: "x-gate-prediction",
      title: "Predict the X gate",
      prompt:
        "A qubit starts as a definite 0. You apply an X gate, then measure. What will the measurement return?",
      options: [
        {
          id: "zero",
          label: "0",
          feedback:
            "Not quite. X flips the qubit, so a starting 0 becomes 1. Measuring would return 1.",
        },
        {
          id: "one",
          label: "1",
          correct: true,
          feedback:
            "Correct! X flips 0 to 1, so the qubit is now definitely 1 and measurement returns 1 every time.",
        },
        {
          id: "fifty",
          label: "50/50 chance",
          feedback:
            "No - X doesn't create uncertainty. It flips a definite 0 to a definite 1. (The gate that creates 50/50 is coming up next.)",
        },
      ],
    },
    {
      type: "informative",
      id: "meet-h-gate",
      title: "Meet the H gate",
      emoji: "🌗",
      body: [
        "H is short for Hadamard, named after a mathematician.",
        "Applied to a definite 0, the H gate turns it into an even superposition.",
        "That means measurement now gives 0 about half the time and 1 about half the time.",
        "H is one of the most important gates because it creates uncertainty - the heart of quantum computing.",
      ],
    },
    {
      type: "gate-playground",
      id: "h-gate-playground",
      title: "H gate playground",
      body:
        "This qubit starts as a definite 0. Apply the H gate to create an even superposition, then measure 20 fresh qubits to see the 50/50 pattern.",
      initialPOne: 0,
      gates: ["H"],
      measureSampleSize: 20,
      teaching:
        "After H, P(0) and P(1) are both about 50%. Measuring many fresh qubits gives roughly half 0s and half 1s.",
    },
    {
      type: "gate-sequence",
      id: "gate-sequence-challenge",
      title: "Gate sequence challenge",
      prompt:
        "Build a qubit with a 50/50 chance of measuring 0 or 1. The qubit starts as a definite 0. Apply gates, then check your answer.",
      correctFeedback:
        "Perfect! Applying H to a definite 0 creates an even 50/50 superposition. That's exactly the state we wanted.",
      incorrectFeedback:
        "Not yet. Your qubit is still definite (100% one value). X only flips 0 to 1 - it never creates a superposition. Reset and try the H gate.",
      teaching:
        "H is the gate that turns a definite state into a 50/50 superposition.",
    },
    {
      type: "prediction",
      id: "gates-mastery",
      title: "Final challenge",
      prompt: "Which gate creates a 50/50 superposition from a definite 0?",
      options: [
        {
          id: "x",
          label: "X gate",
          feedback:
            "Not quite. X just flips 0 to 1 - both are still definite states. It doesn't create a 50/50 mix.",
        },
        {
          id: "h",
          label: "H gate",
          correct: true,
          feedback:
            "Correct! The H (Hadamard) gate turns a definite 0 into an even 50/50 superposition.",
        },
        {
          id: "measurement",
          label: "Measurement",
          feedback:
            "No - measurement doesn't prepare a qubit, it reads one out and collapses it. The H gate is what creates the superposition.",
        },
      ],
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Gates unlocked!",
      intro: "You now know how quantum programs shape a qubit before measuring it:",
      points: [
        "Gates change qubits before measurement.",
        "The X gate flips 0 and 1, like a NOT gate.",
        "The H gate creates a 50/50 superposition from a definite state.",
        "Quantum programs are built by applying gates, then measuring.",
      ],
    },
  ],
};

const lesson4: Lesson = {
  id: "quantum-circuits",
  title: "Quantum Circuits",
  description: "Put gates in order to build your first quantum programs.",
  badge: {
    id: QUANTUM_CIRCUIT_BUILDER_BADGE,
    title: "Quantum Circuit Builder",
    subtitle: "Completed the Quantum Circuits lesson",
  },
  steps: [
    {
      type: "informative",
      id: "what-is-a-circuit",
      title: "What is a quantum circuit?",
      emoji: "🧩",
      body: [
        "A quantum circuit is like a recipe for a qubit. It lists the steps to follow, in order.",
        "Each gate is one instruction. As the qubit moves through the circuit, every gate changes it a little.",
        "At the very end comes measurement, which gives you the final observed result: 0 or 1.",
        "We read a circuit from left to right, just like reading a sentence.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning: circuits",
          url: "https://learning.quantum.ibm.com/",
          description: "See real quantum circuits when you're ready for more.",
          kind: "docs",
        },
      ],
    },
    {
      type: "circuit-prediction",
      id: "circuit-order",
      title: "Circuit order",
      prompt:
        "Here's a circuit. We read it left to right. What happens first?",
      gates: ["X"],
      options: [
        {
          id: "measure",
          label: "Measurement",
          feedback:
            "Not quite. Measurement is at the far right, so it happens last. We read circuits left to right.",
        },
        {
          id: "xgate",
          label: "The X gate",
          correct: true,
          feedback:
            "Right! Reading left to right, the X gate is applied first. Measurement comes at the end.",
        },
        {
          id: "result",
          label: "The result appears before anything happens",
          feedback:
            "No - you only get a result at the end, after every gate has been applied. Nothing appears before the gates run.",
        },
      ],
    },
    {
      type: "circuit-builder",
      id: "build-guarantee-one",
      title: "Build a simple circuit",
      prompt:
        "Build a circuit that guarantees a measurement result of 1. The qubit starts at |0>. Add gates, then measure to check.",
      targetPOne: 100,
      correctFeedback:
        "Perfect! X flips |0> to |1>, so measuring is guaranteed to give 1 every time. That's X then Measure.",
      feedbackMeasuredEmpty:
        "You measured right away. Measuring |0> just gives 0 - you need to change the qubit first. Add a gate before measuring.",
      feedbackSuperposition:
        "Close, but the H gate creates a 50/50 chance, not a guaranteed 1. Reset and try flipping |0> to |1> instead.",
      incorrectFeedback:
        "Not yet. To guarantee a 1, you need the qubit to end up definitely 1. Reset and try a single flip.",
      teaching:
        "A guaranteed result needs a definite state. X flips |0> to |1>, so measurement always returns 1.",
    },
    {
      type: "circuit-playback",
      id: "circuit-playback",
      title: "Circuit playback",
      body:
        "Press play to watch this circuit run. The qubit starts at |0>, then each gate changes its probabilities, and finally we measure one result.",
      gates: ["X", "H"],
      teaching:
        "After X the qubit is definitely 1, then H spreads it to a 50/50 superposition. Measurement then samples a single 0 or 1 from those odds.",
    },
    {
      type: "circuit-prediction",
      id: "predict-final-state",
      title: "Predict the final state",
      prompt:
        "Read this circuit. If we run it on many fresh qubits and measure each one, what should we see?",
      gates: ["H"],
      options: [
        {
          id: "always0",
          label: "Always 0",
          feedback:
            "Not quite. H turns |0> into a 50/50 superposition, so you won't always get 0.",
        },
        {
          id: "always1",
          label: "Always 1",
          feedback:
            "No - H doesn't flip to a definite 1. It creates a 50/50 mix, so 1 isn't guaranteed.",
        },
        {
          id: "half",
          label: "About half 0 and half 1",
          correct: true,
          feedback:
            "Exactly! H makes a 50/50 superposition, so across many fresh qubits you'd measure roughly half 0s and half 1s.",
        },
      ],
    },
    {
      type: "circuit-builder",
      id: "build-fifty-fifty",
      title: "Build a 50/50 circuit",
      prompt:
        "Build a circuit that gives a 50/50 chance of measuring 0 or 1. The qubit starts at |0>. Add gates, then measure to check.",
      targetPOne: 50,
      correctFeedback:
        "Nice work! H turns the definite |0> into an even 50/50 superposition, so measurement is equally likely to give 0 or 1.",
      feedbackMeasuredEmpty:
        "You measured before preparing the qubit. Measurement should come after your gates - add a gate first.",
      feedbackDefinite:
        "That leaves the qubit definite (always one value). X just flips |0> to |1>; it doesn't create a 50/50 chance. Reset and try the H gate.",
      incorrectFeedback:
        "Not yet. For a 50/50 chance you need an even superposition. Reset and try the H gate.",
      teaching:
        "H is the gate that turns a definite state into a 50/50 superposition.",
    },
    {
      type: "informative",
      id: "why-circuits-matter",
      title: "Why circuits matter",
      emoji: "🚀",
      body: [
        "Quantum algorithms are built out of circuits - ordered sequences of gates.",
        "Even a few well-chosen gates can shape a qubit into a useful probability pattern.",
        "Real quantum computers run the same circuit many times and tally the results to estimate the outcome probabilities.",
      ],
    },
    {
      type: "prediction",
      id: "circuits-mastery",
      title: "Final challenge",
      prompt: "What is the basic order of a quantum program?",
      options: [
        {
          id: "measure-first",
          label: "Measure, then prepare, then gates",
          feedback:
            "Not quite. Measurement reads the final result, so it can't come first. It always happens at the end.",
        },
        {
          id: "prepare-gates-measure",
          label: "Prepare the qubit, apply gates, then measure",
          correct: true,
          feedback:
            "Correct! Every quantum program prepares a qubit, transforms it with gates, and then measures the result.",
        },
        {
          id: "gates-measure-prepare",
          label: "Apply gates, measure, then prepare",
          feedback:
            "No - you must prepare the qubit before you can apply gates to it, and measurement comes last.",
        },
      ],
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Circuits complete!",
      intro: "You can now read and build simple quantum programs:",
      points: [
        "Quantum circuits are ordered gate sequences.",
        "Gates change the qubit before measurement.",
        "Measurement happens at the end.",
        "A quantum program prepares, transforms, then measures.",
      ],
    },
  ],
};

const lesson5: Lesson = {
  id: "interference",
  title: "Interference",
  description: "Learn how quantum possibilities reinforce and cancel.",
  badge: {
    id: INTERFERENCE_EXPLORER_BADGE,
    title: "Interference Explorer",
    subtitle: "Completed the Interference lesson",
  },
  steps: [
    {
      type: "wave-explorer",
      id: "story-setup",
      title: "When possibilities meet",
      interactive: false,
      body: [
        "Imagine two water waves moving toward each other.",
        "When their peaks line up, they combine into one bigger wave. When a peak meets a valley, they flatten out and cancel.",
        "Quantum possibilities behave in a similar way. Up next, you'll mix two waves yourself and watch them add up or cancel out.",
      ],
    },
    {
      type: "wave-explorer",
      id: "wave-explorer",
      title: "Wave explorer",
      interactive: true,
      body: [
        "Drag the two sliders to set each wave's height (its amplitude). Watch the combined wave at the bottom.",
        "Try making both waves point the same way, then try making one point up and the other down.",
      ],
      teaching:
        "Two waves pointing the same way reinforce into a bigger wave. Pointing opposite ways, they cancel toward a flat line. That mixing is called interference.",
    },
    {
      type: "prediction",
      id: "predict-interference",
      title: "Predict the combination",
      prompt:
        "If two equal waves that both point upward combine, what happens?",
      options: [
        {
          id: "smaller",
          label: "A smaller wave",
          feedback:
            "Not quite. Two waves pointing the same way don't shrink - they add together into something larger.",
        },
        {
          id: "same",
          label: "A wave the same size",
          feedback:
            "Not this time. When both waves point the same way, they reinforce, so the result is taller than either one alone.",
        },
        {
          id: "bigger",
          label: "A bigger wave",
          correct: true,
          feedback:
            "Exactly! Two waves pointing the same way reinforce each other - this is constructive interference, and the combined wave is bigger.",
        },
      ],
    },
    {
      type: "path-amplitudes",
      id: "quantum-paths",
      title: "Quantum paths",
      mode: "experiment",
      body:
        "A quantum outcome can be reached by more than one path, and each path carries an amplitude that is either +1 or -1. Flip the signs and watch how the paths add up - and how the chance of hitting the target changes.",
      teaching:
        "When both amplitudes have the same sign they add up (+1 and +1 make +2). When they have opposite signs they cancel (+1 and -1 make 0), and the target becomes impossible.",
    },
    {
      type: "interference-sim",
      id: "run-experiments",
      title: "Run the experiments",
      body:
        "Run 100 measurements for each case. In the constructive case the two paths reinforce; in the destructive case they cancel. Run both and compare the histograms.",
      teaching:
        "Constructive interference makes the target show up almost every time, while destructive interference makes it nearly vanish - even though both setups use the same two paths.",
    },
    {
      type: "prediction",
      id: "prediction-challenge",
      title: "Prediction challenge",
      prompt:
        "Two paths reach the same target with amplitudes +1 and -1. What happens to the chance of measuring that target?",
      options: [
        {
          id: "increases",
          label: "The probability increases",
          feedback:
            "Not quite. Opposite signs don't add up - they work against each other. The probability goes down, not up.",
        },
        {
          id: "unchanged",
          label: "The probability stays unchanged",
          feedback:
            "No - the second path doesn't just sit there. A -1 amplitude actively cancels the +1, changing the result.",
        },
        {
          id: "cancel",
          label: "They cancel out",
          correct: true,
          feedback:
            "Right! +1 and -1 add to 0, so the amplitudes cancel and the target becomes impossible to measure. That's destructive interference.",
        },
      ],
    },
    {
      type: "path-amplitudes",
      id: "build-constructive",
      title: "Build constructive interference",
      mode: "build-constructive",
      body:
        "Set the two path amplitudes to create the strongest possible signal at the target, then check your answer.",
      correctFeedback:
        "Perfect! Two amplitudes with the same sign (+1 and +1) add to +2, the largest combined amplitude - so the target is measured every time. That's constructive interference.",
      incorrectFeedback:
        "Not the strongest yet. Opposite signs cancel. To get the biggest signal, make both paths point the same way (both +1).",
      teaching:
        "Same-sign amplitudes reinforce into the strongest possible signal.",
    },
    {
      type: "path-amplitudes",
      id: "build-destructive",
      title: "Build destructive interference",
      mode: "build-destructive",
      body:
        "Now set the amplitudes so the target becomes impossible to measure - drive its probability to zero - then check.",
      correctFeedback:
        "Exactly! +1 and -1 add to 0, so the amplitudes completely cancel and the target's probability drops to zero. That's destructive interference.",
      incorrectFeedback:
        "Not zero yet. Two same-sign amplitudes reinforce instead of cancelling. To wipe out the target, make the paths point opposite ways (+1 and -1).",
      teaching:
        "Opposite-sign amplitudes cancel, sending the target's probability to zero.",
    },
    {
      type: "informative",
      id: "why-this-matters",
      title: "Why this matters",
      emoji: "✨",
      body: [
        "Here's the big idea: a quantum computer doesn't win by simply trying every answer at once.",
        "It wins by using interference to boost the amplitudes of good answers and cancel the amplitudes of bad ones - so the right answer is the one you're most likely to measure.",
        "This is the engine behind famous quantum algorithms like Grover's search and Shor's factoring algorithm.",
      ],
      resources: [
        {
          label: "IBM Quantum Learning",
          url: "https://learning.quantum.ibm.com/",
          description: "Explore quantum algorithms built on interference.",
          kind: "docs",
        },
      ],
    },
    {
      type: "prediction",
      id: "interference-mastery",
      title: "Mastery check",
      prompt: "What is quantum interference?",
      options: [
        {
          id: "guessing",
          label: "Random guessing between answers",
          feedback:
            "No - interference isn't random. It's a precise effect where amplitudes combine in a predictable way.",
        },
        {
          id: "amplitudes",
          label: "Amplitudes adding together and cancelling",
          correct: true,
          feedback:
            "Correct! Interference is amplitudes combining - reinforcing when they share a sign and cancelling when they don't.",
        },
        {
          id: "faster",
          label: "A way to measure qubits faster",
          feedback:
            "Not quite. Interference isn't about speed of measurement - it's about how amplitudes add and cancel to shape probabilities.",
        },
      ],
    },
    {
      type: "reflection",
      id: "reflection",
      title: "Interference explored!",
      intro: "You've uncovered the effect that powers quantum algorithms:",
      points: [
        "Probabilities come from amplitudes, which can be positive or negative.",
        "Amplitudes with the same sign reinforce each other.",
        "Amplitudes with opposite signs cancel each other.",
        "Interference shapes probabilities - boosting good answers and cancelling bad ones.",
      ],
    },
  ],
};

export const quantumBasicsCourse: Course = {
  id: "quantum-basics",
  title: "Quantum Basics",
  description: "Start your journey into quantum computing, one small step at a time.",
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
