import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRecommendedReview, getLearnerConceptProfile } from "@/lib/learning/learner-model";
import type { UserProfile } from "@/lib/types";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

beforeEach(() => {
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  vi.stubGlobal("localStorage", new MemoryStorage());
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
});

describe("learner model", () => {
  it("returns a profile row for every concept tag", () => {
    const rows = getLearnerConceptProfile(null);
    expect(rows.length).toBeGreaterThan(5);
    expect(rows.every((r) => r.status === "new")).toBe(true);
  });

  it("prioritizes struggled concepts in recommended review", () => {
    localStorage.setItem(
      "bq-learning-signals-v1",
      JSON.stringify({
        superposition: {
          seen: 3,
          correct: 0,
          wrong: 4,
          hints: 0,
          lastResult: "wrong",
          lastSeenAt: Date.now(),
          dueAt: 0,
          intervalDays: 1,
          misconceptions: [],
        },
      })
    );

    const profile = {
      uid: "u",
      displayName: "Learner",
      progress: {
        "qubits-superposition": { completed: true, currentStep: 5, attempts: 1 },
      },
      streak: 1,
      avatar: {},
    } as UserProfile;

    const review = getRecommendedReview(profile);
    expect(review.some((item) => item.tag === "superposition" && item.reason === "struggled")).toBe(true);
  });
});
