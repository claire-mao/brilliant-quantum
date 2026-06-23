"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50 px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
          Learn by doing
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Quantum computing, made simple.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Understand qubits and superposition through short, hands-on lessons. No heavy
          math, no long videos. Just move a slider and watch it click.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 sm:w-auto"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
