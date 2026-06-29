import { describe, expect, it } from "vitest";
import {
  BOSS_FLOOR,
  highestUnlockedFloor,
  isBossFloor,
  isFloorUnlocked,
  pickConceptForFloor,
  slotsOnFloor,
  TOTAL_FLOORS,
} from "@/lib/tower/floor-plan";
import type { FloorUnlockProgress } from "@/lib/tower/floor-plan";
import type { UserProfile } from "@/lib/types";

const emptyProgress = (): FloorUnlockProgress => ({
  clearedByFloor: {},
  bossSeed: 1,
  highestFloor: 1,
});

describe("tower floor plan", () => {
  it("defines seven floors with a single boss encounter", () => {
    expect(TOTAL_FLOORS).toBe(7);
    expect(isBossFloor(BOSS_FLOOR)).toBe(true);
    expect(slotsOnFloor(BOSS_FLOOR)).toBe(1);
    expect(slotsOnFloor(1)).toBeGreaterThan(1);
  });

  it("locks review floors until the matching unit is complete", () => {
    expect(isFloorUnlocked(1, emptyProgress(), null)).toBe(false);
    expect(isFloorUnlocked(2, emptyProgress(), null)).toBe(false);
  });

  it("respects saved highestFloor when computing travel ceiling", () => {
    const progress = { ...emptyProgress(), highestFloor: 5 };
    expect(highestUnlockedFloor(progress, null)).toBe(5);
  });

  it("picks a deterministic concept for a floor/chamber seed", () => {
    const a = pickConceptForFloor(1, 0, null, 42);
    const b = pickConceptForFloor(1, 0, null, 42);
    const c = pickConceptForFloor(1, 1, null, 42);
    expect(a).toBe(b);
    expect(typeof a).toBe("string");
    expect(c).toBeDefined();
  });

  it("honors a forced review target concept", () => {
    const tag = pickConceptForFloor(3, 1, null, 99, { targetConcept: "entanglement" });
    expect(tag).toBe("entanglement");
  });
});

describe("floor 7 unlock", () => {
  it("requires clearing floors 1–6 unless the full course is complete", () => {
    const progress: FloorUnlockProgress = {
      clearedByFloor: { 1: [0, 1, 2], 2: [0, 1, 2], 3: [0, 1, 2], 4: [0, 1, 2], 5: [0, 1, 2], 6: [0, 1, 2] },
      bossSeed: 3,
      highestFloor: 7,
    };
    expect(isFloorUnlocked(BOSS_FLOOR, progress, null)).toBe(true);

    const profile = {
      uid: "u",
      displayName: "Learner",
      progress: {},
      streak: 0,
      avatar: {},
    } as UserProfile;
    expect(isFloorUnlocked(BOSS_FLOOR, emptyProgress(), profile)).toBe(false);
  });
});
