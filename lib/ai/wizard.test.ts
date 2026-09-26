import { describe, expect, it } from "vitest";
import { hintRevealsAnswer, parseWizardReply, toHintLevel, wizardPrompt } from "./wizard";

describe("wizardPrompt", () => {
  const base = {
    lessonId: "double-slit",
    lessonTitle: "The Double Slit",
    step: "4 of 9: Adding a detector (prediction)",
    concept: "Measurement",
    question: "What changed in the experiment when the detector was added?",
    choices: ["The pattern vanished", "Nothing changed", "Particles sped up"],
    correctAnswer: "The pattern vanished",
    studentAnswer: "Nothing changed",
    incorrectAttempts: 1,
  };

  it("includes the exact on-screen question, choices and attempt state for hints", () => {
    const { system, user } = wizardPrompt({ action: "hint", hintLevel: 2, ...base });
    expect(user).toContain("What changed in the experiment when the detector was added?");
    expect(user).toContain("(1) The pattern vanished");
    expect(user).toContain("Incorrect attempts so far: 1");
    expect(user).toContain("hint level 2");
    expect(user).toContain("NEVER reveal");
    expect(system).toContain('{"text": string}');
  });

  it("switches to a lesson-level nudge when there is no question", () => {
    const { user } = wizardPrompt({
      action: "hint",
      hintLevel: 1,
      lessonTitle: "Qubits",
      stepSummary: "A qubit holds amplitudes for 0 and 1.",
    });
    expect(user).toContain("no question on this step");
    expect(user).toContain("A qubit holds amplitudes");
  });

  it("passes the avoid list for facts and practice", () => {
    const facts = wizardPrompt({ action: "fun_fact", ...base, avoidFacts: ["Fact one.", "Fact two."] });
    expect(facts.user).toContain("- Fact one.");
    expect(facts.user).toContain("- Fact two.");
    expect(facts.user).toMatch(/do not repeat, reword, or closely paraphrase/);
    const hint = wizardPrompt({ action: "hint", ...base, avoidFacts: ["Fact one."] });
    expect(hint.user).not.toContain("Fact one.");
    const practice = wizardPrompt({ action: "practice", ...base, avoid: ["Old question?"] });
    expect(practice.user).toContain("- Old question?");
    expect(practice.system).toContain('"answer": string');
  });
});

describe("parseWizardReply", () => {
  it("parses plain and fenced JSON", () => {
    expect(parseWizardReply('{"text":"Compare before and after."}', "hint")).toEqual({
      text: "Compare before and after.",
    });
    expect(parseWizardReply('```json\n{"text":"A fact."}\n```', "fun_fact")).toEqual({ text: "A fact." });
  });

  it("requires an answer for practice", () => {
    expect(parseWizardReply('{"text":"Q?"}', "practice")).toBeNull();
    expect(parseWizardReply('{"text":"Q?","answer":"A."}', "practice")).toEqual({ text: "Q?", answer: "A." });
  });

  it("accepts a bare sentence for text-only actions", () => {
    expect(parseWizardReply("Just a hint.", "hint")).toEqual({ text: "Just a hint." });
    expect(parseWizardReply("", "hint")).toBeNull();
  });
});

describe("toHintLevel", () => {
  it("clamps to 1..3", () => {
    expect(toHintLevel(undefined)).toBe(1);
    expect(toHintLevel(2)).toBe(2);
    expect(toHintLevel(7)).toBe(3);
  });
});

describe("hintRevealsAnswer", () => {
  it("catches the correct label verbatim or by its key words", () => {
    expect(hintRevealsAnswer("So the answer is: the interference pattern disappeared.", "The interference pattern disappeared")).toBe(true);
    expect(hintRevealsAnswer("Notice the interference pattern simply disappeared.", "The interference pattern disappeared")).toBe(true);
    expect(hintRevealsAnswer("Compare what happens before and after the detector.", "The interference pattern disappeared")).toBe(false);
    expect(hintRevealsAnswer("Think about it.", undefined)).toBe(false);
  });
});
