import { describe, expect, it } from "vitest";
import {
  getLesson,
  getUnits,
  getUnitStatus,
  isCourseComplete,
  isLessonUnlocked,
  isUnitComplete,
} from "@/content/lessons";
import type { UserProfile } from "@/lib/types";

function profileWithCompleted(ids: string[]): UserProfile {
  return {
    uid: "test-user",
    displayName: "Test",
    progress: Object.fromEntries(ids.map((id) => [id, { completed: true, currentStep: 0, attempts: 1 }])),
    streak: 0,
    avatar: {},
  } as UserProfile;
}

describe("content/lessons progression helpers", () => {
  it("unlocks the first built lesson with no profile", () => {
    const first = getUnits()[0];
    const lessons = first.lessonIds.map((id) => getLesson(id)).filter(Boolean);
    const firstBuilt = lessons.find((l) => l && l.steps.length > 0);
    expect(firstBuilt).toBeDefined();
    expect(isLessonUnlocked(firstBuilt!.id, null)).toBe(true);
  });

  it("locks a later lesson until the previous one is completed", () => {
    const course = getUnits().flatMap((u) => u.lessonIds);
    const built = course
      .map((id) => getLesson(id))
      .filter((l): l is NonNullable<typeof l> => !!l && l.steps.length > 0);
    if (built.length < 2) return;
    const [first, second] = built;
    expect(isLessonUnlocked(second.id, null)).toBe(false);
    expect(isLessonUnlocked(second.id, profileWithCompleted([first.id]))).toBe(true);
  });

  it("marks a unit complete only when every lesson in it is done", () => {
    const unit = getUnits()[0];
    const lessons = unit.lessonIds.map((id) => getLesson(id)).filter((l) => l && l.steps.length > 0);
    expect(isUnitComplete(unit, null)).toBe(false);
    expect(isUnitComplete(unit, profileWithCompleted(lessons.map((l) => l!.id)))).toBe(true);
  });

  it("reports unit status from lesson completion", () => {
    const unit = getUnits()[0];
    expect(getUnitStatus(unit, null)).toBe("active");
  });

  it("detects full course completion", () => {
    const allIds = getUnits()
      .flatMap((u) => u.lessonIds)
      .filter((id) => {
        const l = getLesson(id);
        return l && l.steps.length > 0;
      });
    expect(isCourseComplete(profileWithCompleted(allIds))).toBe(true);
    expect(isCourseComplete(null)).toBe(false);
  });
});
