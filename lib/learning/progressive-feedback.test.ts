import { describe, expect, it } from "vitest";
import {
  REVEAL_THRESHOLD,
  formatRevealBlock,
  getCorrectHeadline,
  getProgressiveFeedback,
  shouldRevealAnswer,
} from "@/lib/learning/progressive-feedback";

describe("progressive feedback", () => {
  it("escalates cue levels before the reveal threshold", () => {
    expect(getProgressiveFeedback(1).level).toBe("retrieval");
    expect(getProgressiveFeedback(2).level).toBe("attention");
    expect(getProgressiveFeedback(3).level).toBe("concept");
    expect(getProgressiveFeedback(REVEAL_THRESHOLD).level).toBe("full");
  });

  it("uses tower-specific generic hints when requested", () => {
    const lesson = getProgressiveFeedback(1, {}, "lesson").message;
    const tower = getProgressiveFeedback(1, {}, "tower").message;
    expect(lesson).not.toBe(tower);
    expect(tower).toMatch(/chamber/i);
  });

  it("reveals after enough wrong attempts or an explicit explanation request", () => {
    expect(shouldRevealAnswer(1, false, false)).toBe(false);
    expect(shouldRevealAnswer(REVEAL_THRESHOLD, false, false)).toBe(true);
    expect(shouldRevealAnswer(1, true, false)).toBe(true);
    expect(shouldRevealAnswer(1, false, true)).toBe(true);
  });

  it("formats reveal copy with the correct headline", () => {
    expect(getCorrectHeadline(0)).toBe("Correct.");
    expect(formatRevealBlock("Because superposition.", "Option A")).toContain("Option A");
    expect(formatRevealBlock("Because superposition.", "Option A")).toContain("superposition");
  });
});
