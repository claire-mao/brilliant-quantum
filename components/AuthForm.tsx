"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type Mode = "login" | "signup";

function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/email-already-in-use":
      return "An account already exists with that email. Try logging in.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email. Try logging in with your email and password.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/** Codes that just mean the user dismissed the Google popup — no error to show. */
function isDismissed(code: string): boolean {
  return code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request";
}

function errorCode(err: unknown): string {
  return typeof err === "object" && err && "code" in err
    ? String((err as { code: string }).code)
    : "";
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { signUp, logIn, signInWithGoogle } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isSignup = mode === "signup";
  const busy = submitting || googleLoading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) {
        await signUp(email.trim(), password, displayName.trim());
      } else {
        await logIn(email.trim(), password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(friendlyError(errorCode(err)));
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (busy) return;
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = errorCode(err);
      if (!isDismissed(code)) setError(friendlyError(code));
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <RuneGlyph />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {isSignup
          ? "Begin your quantum training and save your progress."
          : "Log in to continue where you left off."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isSignup && (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Display name
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function RuneGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <circle cx="12" cy="12" r="8" strokeDasharray="3 4" />
      <path d="M12 7v10M8 10l8 4M16 10l-8 4" strokeLinecap="round" />
    </svg>
  );
}

/** Official multicolor Google "G" mark. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
