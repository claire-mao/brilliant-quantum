"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  deleteUser,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfile, deleteUserData } from "./progress";
import type { LessonProgress, UserProfile } from "./types";

/** All app localStorage keys are namespaced "bq-" (signals, activity, avatar, tower, celebrated). */
function clearLocalAppData(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith("bq-")) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore storage errors
  }
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  /**
   * Permanently delete the current user: Firestore data first (while still
   * authenticated), then the Firebase Auth account, then local app data. May
   * reject with `auth/requires-recent-login` if the session is too old.
   */
  deleteAccount: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /**
   * Optimistically merge a patch into `profile.progress[lessonId]` in memory so
   * UI (e.g. lesson resume) sees the new value immediately, without waiting for
   * a Firestore refetch. Existing fields are preserved.
   */
  updateLocalLessonProgress: (lessonId: string, patch: Partial<LessonProgress>) => void;
}

const DEFAULT_LESSON_PROGRESS: LessonProgress = {
  currentStep: 0,
  completed: false,
  completedAt: null,
  attempts: 0,
  bestChallengeAttempts: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) {
      setProfile(await getUserProfile(auth.currentUser.uid));
    }
  }, []);

  const updateLocalLessonProgress = useCallback(
    (lessonId: string, patch: Partial<LessonProgress>) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const existing = prev.progress?.[lessonId] ?? DEFAULT_LESSON_PROGRESS;
        return {
          ...prev,
          progress: { ...prev.progress, [lessonId]: { ...existing, ...patch } },
        };
      });
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await createUserProfile(cred.user.uid, displayName, email);
      setProfile(await getUserProfile(cred.user.uid));
    },
    []
  );

  const logIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  // Works for both sign up and log in: Google returns an existing user as a
  // simple sign-in. We only create a Firestore profile the first time, so
  // existing progress is never overwritten.
  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const u = cred.user;
    const existing = await getUserProfile(u.uid);
    if (!existing) {
      await createUserProfile(u.uid, u.displayName ?? "Apprentice", u.email ?? "");
    }
    setProfile(await getUserProfile(u.uid));
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  const deleteAccount = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) throw new Error("No authenticated user to delete.");
    // 1) Remove Firestore data while still authenticated (rules require the uid
    //    match, so this must happen before the auth user is deleted).
    await deleteUserData(current.uid);
    // 2) Delete the Firebase Auth account (may throw auth/requires-recent-login).
    await deleteUser(current);
    // 3) Wipe local app data; the auth listener will also clear user/profile.
    clearLocalAppData();
    setProfile(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        logIn,
        signInWithGoogle,
        logOut,
        deleteAccount,
        refreshProfile,
        updateLocalLessonProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
