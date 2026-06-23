import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "./types";

function userRef(uid: string) {
  return doc(db, "users", uid);
}

export async function createUserProfile(
  uid: string,
  displayName: string,
  email: string
): Promise<void> {
  await setDoc(userRef(uid), {
    uid,
    displayName,
    email,
    createdAt: serverTimestamp(),
    badges: [],
    streak: 0,
    lastActiveDate: "",
    progress: {},
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/** Persist the current step for a lesson (resume point). */
export async function saveLessonStep(
  uid: string,
  lessonId: string,
  currentStep: number
): Promise<void> {
  await setDoc(
    userRef(uid),
    {
      progress: {
        [lessonId]: { currentStep, completed: false },
      },
    },
    { merge: true }
  );
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Mark a lesson complete, award the badge, and bump the streak.
 * Returns the updated profile so callers can reflect new badges/streak.
 */
export async function completeLesson(
  uid: string,
  lessonId: string,
  totalSteps: number,
  badge: string
): Promise<UserProfile | null> {
  const current = await getUserProfile(uid);
  const today = todayString();

  let streak = current?.streak ?? 0;
  const last = current?.lastActiveDate ?? "";
  if (last !== today) {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    streak = last === yesterday ? streak + 1 : 1;
  }
  if (streak < 1) streak = 1;

  const badges = new Set(current?.badges ?? []);
  badges.add(badge);

  await setDoc(
    userRef(uid),
    {
      streak,
      lastActiveDate: today,
      badges: Array.from(badges),
      progress: {
        [lessonId]: {
          currentStep: totalSteps,
          completed: true,
          completedAt: serverTimestamp(),
        },
      },
    },
    { merge: true }
  );

  return getUserProfile(uid);
}
