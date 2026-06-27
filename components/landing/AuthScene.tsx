import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import WizardTowerArt from "./WizardTowerArt";

/**
 * Wraps the auth form in a "tower gate" study-hall panel: a two-column layout
 * with a decorative tower scene beside a clean, professional form. SVG/CSS only.
 */
export default function AuthScene({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-slate-50 via-indigo-50/60 to-indigo-100/40 px-4 py-12 sm:px-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-indigo-100 bg-white/90 shadow-xl backdrop-blur-sm">
        <div className="grid lg:grid-cols-2">
          {/* Decorative gate panel */}
          <aside className="relative hidden flex-col justify-between bg-gradient-to-b from-indigo-600 to-indigo-800 p-8 text-indigo-50 lg:flex">
            <div className="relative z-10">
              <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-indigo-200 hover:text-white">
                Brilliant Quantum
              </Link>
              <h2 className="mt-6 text-3xl font-bold leading-snug sm:text-4xl">
                {isSignup ? "Step through the tower gate." : "Welcome back to the tower."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-indigo-200">
                Learn quantum computing through interactive experiments, guided by your own wizard
                companion.
              </p>
            </div>
            <div className="pointer-events-none relative z-0 mx-auto mt-6 w-72">
              <WizardTowerArt className="aspect-[220/260] w-full opacity-95" />
            </div>
          </aside>

          {/* Form side */}
          <section className="p-8 sm:p-10">
            <div className="mb-6 lg:hidden">
              <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-indigo-500">
                Brilliant Quantum
              </Link>
            </div>
            <AuthForm mode={mode} />
          </section>
        </div>
      </div>
    </main>
  );
}
