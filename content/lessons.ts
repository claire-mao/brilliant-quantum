import type { Course, Lesson } from "@/lib/types";

export const QUANTUM_BEGINNER_BADGE = "quantum-beginner";

const lesson1: Lesson = {
  id: "qubits-superposition",
  title: "Qubits & Superposition",
  description: "Learn how a qubit is different from a classical bit.",
  steps: [
    {
      type: "explanation",
      id: "intro-bit",
      title: "A classical bit",
      body:
        "A regular computer stores information in bits. A bit is always in one of two states: 0 or 1. Think of it like a light switch that is either OFF (0) or ON (1) - never both.",
    },
    {
      type: "explanation",
      id: "intro-qubit",
      title: "Meet the qubit",
      body:
        "A quantum computer uses a qubit. Before you measure it, a qubit can be in a blend of 0 and 1 at the same time. This in-between blend is called superposition. You can think of it as a coin spinning in the air - not yet heads or tails.",
    },
    {
      type: "explanation",
      id: "intro-probability",
      title: "Superposition as probability",
      body:
        "For now, picture superposition with probabilities. A qubit can be set so that when you measure it, there is a certain chance of getting 1 and the rest of the chance of getting 0. If there is a 60% chance of measuring 1, then there is a 40% chance of measuring 0. The two always add up to 100%.",
    },
    {
      type: "explanation",
      id: "intro-measurement",
      title: "Measuring a qubit",
      body:
        "Here is the twist: you can never see the superposition directly. The moment you measure a qubit, it stops spinning and 'picks' a single answer - either 0 or 1. The probabilities only tell you how likely each answer is. Measure the same qubit many times and the results follow those odds: a qubit with a 75% chance of 1 lands on 1 about three out of every four measurements.",
    },
    {
      type: "challenge",
      id: "set-75",
      title: "Try it yourself",
      prompt: "Use the slider to set the qubit so it has a 75% chance of measuring 1.",
      targetProbability: 75,
      tolerance: 5,
      correctFeedback:
        "Nice! You set the qubit to about a 75% chance of measuring 1, which leaves about a 25% chance of measuring 0. That blend of outcomes is superposition in action.",
      incorrectFeedback:
        "Not quite. Remember, you want a 75% chance of measuring 1. Slide toward the higher end - when P(1) is 75%, P(0) automatically becomes 25%. Try again!",
    },
  ],
};

const lesson2: Lesson = {
  id: "measurement",
  title: "Measurement",
  description: "What happens when you actually measure a qubit?",
  locked: true,
  steps: [],
};

export const quantumBasicsCourse: Course = {
  id: "quantum-basics",
  title: "Quantum Basics",
  description: "Start your journey into quantum computing, one small step at a time.",
  lessons: [lesson1, lesson2],
};

export function getLesson(lessonId: string): Lesson | undefined {
  return quantumBasicsCourse.lessons.find((l) => l.id === lessonId);
}

export function getNextLesson(lessonId: string): Lesson | undefined {
  const idx = quantumBasicsCourse.lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return undefined;
  return quantumBasicsCourse.lessons[idx + 1];
}
