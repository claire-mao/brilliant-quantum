import { describe, expect, it } from "vitest";
import {
  CONCEPT_KEY_IDEAS,
  fallbackTeachBack,
  parseTeachBack,
  teachBackConcept,
  type TeachBackContext,
} from "./teachback";
import { normalizeLlamaKey } from "./llama";

const ctx: TeachBackContext = {
  lessonId: "qubits-superposition",
  lessonTitle: "Qubits & Superposition",
  conceptTag: "superposition",
  conceptLabel: "Superposition",
  keyIdeas: CONCEPT_KEY_IDEAS.superposition,
  transcript:
    "A qubit is basically both zero and one at the same time and when we look at it it randomly chooses one.",
};

describe("parseTeachBack", () => {
  it("accepts a well-formed response and clamps the score", () => {
    const out = parseTeachBack(
      JSON.stringify({
        concept: "Superposition",
        masteryScore: 142,
        correctIdeas: ["measurement gives one outcome"],
        misconceptions: ["both 0 and 1 literally"],
        missingIdeas: ["amplitudes"],
        teachingStrategy: "correct_misconception",
        tutorResponse: "You said...",
        followUpQuestion: "What are the probabilities for amplitudes 0.6 and 0.8?",
      })
    );
    expect(out).not.toBeNull();
    expect(out!.masteryScore).toBe(100);
    expect(out!.teachingStrategy).toBe("correct-misconception");
  });

  it("extracts JSON wrapped in prose and infers a missing strategy", () => {
    const out = parseTeachBack(
      'Sure! ```json {"concept":"Superposition","masteryScore":"55","correctIdeas":[],"misconceptions":["x"],"missingIdeas":[],"tutorResponse":"r","followUpQuestion":"q"} ```'
    );
    expect(out?.masteryScore).toBe(55);
    expect(out?.teachingStrategy).toBe("correct-misconception");
  });

  it("rejects responses missing required fields", () => {
    expect(parseTeachBack('{"concept":"x","masteryScore":50}')).toBeNull();
    expect(parseTeachBack("not json")).toBeNull();
  });
});

describe("fallbackTeachBack", () => {
  it("handles the canonical superposition test case", () => {
    const out = fallbackTeachBack(ctx);
    expect(out.concept).toBe("Superposition");
    expect(out.correctIdeas.some((c) => /measurement/i.test(c))).toBe(true);
    expect(out.misconceptions).toHaveLength(1);
    expect(out.misconceptions[0]).toMatch(/at the same time/);
    expect(out.teachingStrategy).toBe("correct-misconception");
    expect(out.tutorResponse).toMatch(/amplitude/i);
    expect(out.followUpQuestion.length).toBeGreaterThan(10);
    expect(out.masteryScore).toBeGreaterThan(25);
    expect(out.masteryScore).toBeLessThan(60);
  });

  it("scores a precise explanation higher with no misconceptions", () => {
    const out = fallbackTeachBack({
      ...ctx,
      transcript:
        "A superposition is a state with two probability amplitudes; squaring them gives the measurement probabilities, they can be negative which shows up in interference, and after measurement the qubit stays in that outcome.",
    });
    expect(out.misconceptions).toHaveLength(0);
    expect(out.masteryScore).toBeGreaterThan(75);
  });

  it("does not assess near-empty transcripts", () => {
    const out = fallbackTeachBack({ ...ctx, transcript: "um qubit" });
    expect(out.masteryScore).toBeLessThan(10);
  });
});

describe("teachBackConcept", () => {
  it("targets superposition for the opening lesson", () => {
    expect(teachBackConcept("qubits-superposition")).toBe("superposition");
    expect(teachBackConcept("measurement")).toBe("measurement");
    expect(teachBackConcept("nope")).toBeNull();
  });
});

describe("normalizeLlamaKey", () => {
  it("restores pipes mangled into underscores", () => {
    expect(normalizeLlamaKey("LLM_123_abcDEF")).toBe("LLM|123|abcDEF");
    expect(normalizeLlamaKey(" LLM|123|abc ")).toBe("LLM|123|abc");
    expect(normalizeLlamaKey("gsk_other")).toBe("gsk_other");
    expect(normalizeLlamaKey("")).toBeUndefined();
  });
});
