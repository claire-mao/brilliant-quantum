"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function NavBar() {
  const { user, profile, logOut } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logOut();
    router.replace("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-indigo-600">
          Brilliant Quantum
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {profile?.displayName ?? user.displayName ?? "Learner"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
