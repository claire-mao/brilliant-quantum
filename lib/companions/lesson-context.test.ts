import { describe, expect, it } from "vitest";
import { getLesson } from "@/content/lessons";
import { correctAnswerFor, lessonContextFromStep } from "./lesson-context";

const lesson = getLesson("qubits-superposition");
const predictionIndex = lesson?.steps.findIndex((s) => s.type === "prediction") ?? -1;

describe("lesson-context", () => {
  it("publishes the on-screen question and visible choice labels, but never the answer", () => {
    expect(lesson).toBeDefined();
    expect(predictionIndex).toBeGreaterThanOrEqual(0);
    const ctx = lessonContextFromStep(lesson!, predictionIndex)!;
    expect(ctx.question).toBeTruthy();
    expect(ctx.choices?.length).toBeGreaterThan(1);
    expect(Object.keys(ctx)).not.toContain("correctAnswer");
  });

  it("resolves the graded answer server-side from lesson content", () => {
    const ctx = lessonContextFromStep(lesson!, predictionIndex)!;
    const answer = correctAnswerFor(lesson, ctx.question);
    expect(answer).toBeTruthy();
    expect(ctx.choices).toContain(answer);
    expect(correctAnswerFor(lesson, "not a real question")).toBeUndefined();
    expect(correctAnswerFor(undefined, ctx.question)).toBeUndefined();
  });
});
