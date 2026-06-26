"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function NavBar({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { user, profile, logOut } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logOut();
    router.replace("/login");
  }

  const dark = variant === "dark";

  return (
    <header
      className={
        dark
          ? "relative z-10 border-b border-white/10 bg-[#0b0a1f]/70 backdrop-blur-md"
          : "border-b border-slate-200 bg-white"
      }
    >
      <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 text-lg font-bold tracking-tight ${
            dark ? "text-white" : "text-indigo-600"
          }`}
        >
          <AtomMark dark={dark} />
          Brilliant Quantum
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className={`hidden text-sm sm:inline ${dark ? "text-slate-300" : "text-slate-600"}`}>
              {profile?.displayName ?? user.displayName ?? "Learner"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className={
                dark
                  ? "rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                  : "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              }
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function AtomMark({ dark }: { dark: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${dark ? "text-violet-300" : "text-indigo-500"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
