"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import WizardTowerArt from "@/components/landing/WizardTowerArt";

const FEATURES: { title: string; body: string; icon: "flask" | "save" | "wizard" }[] = [
  {
    icon: "flask",
    title: "Create magic",
    body: "Bend qubits, gates, and interference with your own hands. You learn by casting, not by memorizing.",
  },
  {
    icon: "save",
    title: "Write your own grimoire",
    body: "Every spell you cast is inscribed as you go, so you can trace how far you have come and return to any lesson right where you left off.",
  },
  {
    icon: "wizard",
    title: "A wise wizard",
    body: "Let your mentor guide you step-by-step when a spell will not behave.",
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
      <section className="mx-auto grid w-full max-w-[1100px] flex-1 items-start gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold leading-[1.4] tracking-tight text-slate-900 sm:text-5xl">
            Master the Quantum Arts, One Spell at a Time
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Step into the tower, apprentice. Here qubits, gates, interference, and algorithms become
            spells you can conjure with your own hands.
          </p>
          <div className="mt-8 flex justify-center lg:justify-start">
            <Link
              href="/signup"
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:w-auto"
            >
              Begin your apprenticeship
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
          <h2 className="text-center text-xl font-semibold uppercase tracking-widest text-indigo-600 sm:text-2xl">
            What awaits inside the tower
          </h2>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="flex flex-col items-center gap-4 rounded-2xl border border-indigo-100 bg-white p-8 text-center shadow-sm"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FeatureIcon name={f.icon} />
                </span>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{f.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center text-sm text-slate-500">
            Ready to begin your journey?{" "}
            <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
              Begin your apprenticeship
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureIcon({ name }: { name: "flask" | "save" | "wizard" }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-9 w-9",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    "aria-hidden": true,
  } as const;
  switch (name) {
    case "flask":
      // Large round potion bottle
      return (
        <svg {...common}>
          <rect x="10" y="2.5" width="4" height="2.6" rx="0.6" />
          <path d="M10.7 5.1 V8.2 M13.3 5.1 V8.2" strokeLinecap="round" />
          <path
            d="M10.7 8.2 C7 9.5 4.5 12.5 4.5 15.5 A7.5 7.5 0 0 0 19.5 15.5 C19.5 12.5 17 9.5 13.3 8.2"
            strokeLinejoin="round"
          />
          <path d="M5.2 14 C9 13 15 13 18.8 14" strokeLinecap="round" />
        </svg>
      );
    case "save":
      // Open spellbook / grimoire
      return (
        <svg {...common}>
          <path
            d="M12 6 C10 4.5 7 4.2 4 4.8 V18.5 C7 17.9 10 18.2 12 19.5 C14 18.2 17 17.9 20 18.5 V4.8 C17 4.2 14 4.5 12 6 Z"
            strokeLinejoin="round"
          />
          <path d="M12 6 V19.5" strokeLinecap="round" />
        </svg>
      );
    case "wizard":
      // Wizard face: pointed hat over a large (1.5x) semicircular head + beard
      return (
        <svg {...common}>
          <path d="M12 0.2 L17.5 7.5 H6.5 Z" strokeLinejoin="round" />
          <path d="M4 7.5 H20" strokeLinecap="round" />
          <path d="M7 8.5 A5 7 0 0 0 17 8.5 Z" strokeLinejoin="round" />
          <circle cx="10.4" cy="11.5" r="0.55" fill="currentColor" stroke="none" />
          <circle cx="13.6" cy="11.5" r="0.55" fill="currentColor" stroke="none" />
          <path d="M8 14 C8 18.5 9.5 22 12 22.8 C14.5 22 16 18.5 16 14" strokeLinejoin="round" />
        </svg>
      );
  }
}
