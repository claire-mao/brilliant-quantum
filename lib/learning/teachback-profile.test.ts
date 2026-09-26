import { describe, expect, it } from "vitest";
import { blendMastery, masteryRows, masteryTone } from "./teachback-profile";

describe("teachback profile", () => {
  it("blends mastery toward the newest session", () => {
    expect(blendMastery(null, 47)).toBe(47);
    expect(blendMastery(40, 80)).toBe(64);
    expect(blendMastery(80, 40)).toBe(56);
  });

  it("orders rows by teaching order and labels concepts", () => {
    const rows = masteryRows({
      entanglement: { score: 38, lastScore: 38, sessions: 1, updatedAt: 0, history: [] },
      superposition: { score: 82, lastScore: 82, sessions: 2, updatedAt: 0, history: [] },
    });
    expect(rows.map((r) => r.label)).toEqual(["Superposition", "Entanglement"]);
    expect(masteryTone(82).label).toBe("Strong");
    expect(masteryTone(38).label).toBe("Emerging");
  });
});
