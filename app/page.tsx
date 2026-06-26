"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import WizardTowerArt from "@/components/landing/WizardTowerArt";

const FEATURES: { title: string; body: string; icon: "flask" | "save" | "wizard" | "badge" | "spark" }[] = [
  {
    icon: "flask",
    title: "Interactive lessons",
    body: "Manipulate qubits, gates, and interference directly — learn by experimenting, not memorizing.",
  },
  {
    icon: "save",
    title: "Persistent progress",
    body: "Your place is saved as you go, so you can resume any lesson exactly where you left off.",
  },
  {
    icon: "wizard",
    title: "A guide wizard",
    body: "A friendly companion you can summon anytime for a nudge — the lesson teaches, the wizard guides.",
  },
  {
    icon: "badge",
    title: "Achievements",
    body: "Earn relics and badges as you complete units and keep a steady study streak.",
  },
  {
    icon: "spark",
    title: "Optional AI guidance",
    body: "Hints, extra practice, and lore are available as optional guide features — never required.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-slate-50 via-indigo-50/60 to-indigo-100/40">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[1100px] flex-1 items-center gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-indigo-100 backdrop-blur-sm">
            <RuneSpark />
            Quantum Computing Fundamentals
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Learn Quantum Computing Through Interactive Experiments
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Enter a guided course where qubits, gates, interference, and algorithms become things you
            can manipulate.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:w-auto"
            >
              Start learning
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <WizardTowerArt className="aspect-[220/260] w-full" />
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-white/60 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1100px] px-6 py-12">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-indigo-600">
            What waits inside the tower
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="flex gap-3 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FeatureIcon name={f.icon} />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{f.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center text-sm text-slate-500">
            Ready to begin?{" "}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
              Start learning
            </Link>{" "}
            — no advanced mathematics required.
          </p>
        </div>
      </section>
    </main>
  );
}

function RuneSpark() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-amber-500" fill="currentColor" aria-hidden="true">
      <path d="M8 1 L9.2 6 L14 8 L9.2 10 L8 15 L6.8 10 L2 8 L6.8 6 Z" />
    </svg>
  );
}

function FeatureIcon({ name }: { name: "flask" | "save" | "wizard" | "badge" | "spark" }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true,
  } as const;
  switch (name) {
    case "flask":
      return (
        <svg {...common}>
          <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" strokeLinejoin="round" />
        </svg>
      );
    case "save":
      return (
        <svg {...common}>
          <path d="M5 4h11l3 3v13H5z" strokeLinejoin="round" />
          <path d="M8 4v5h7M8 20v-6h8v6" />
        </svg>
      );
    case "wizard":
      return (
        <svg {...common}>
          <path d="M12 3 L15 10 H9 Z" strokeLinejoin="round" />
          <path d="M7 10h10l-1 4H8z" strokeLinejoin="round" />
          <path d="M9 14l-1 7h8l-1-7" strokeLinejoin="round" />
        </svg>
      );
    case "badge":
      return (
        <svg {...common}>
          <path d="M12 3 L15 8 L21 9 L17 13 L18 19 L12 16 L6 19 L7 13 L3 9 L9 8 Z" strokeLinejoin="round" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
  }
}
