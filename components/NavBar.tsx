"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { recordActivity } from "@/lib/profile/activity";

export default function NavBar({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { user, profile, logOut } = useAuth();
  const router = useRouter();

  // Record a (throttled) activity ping for consistency achievements. Additive
  // only — never touches lesson flow or learning logic.
  useEffect(() => {
    if (user) recordActivity();
  }, [user]);

  async function handleLogout() {
    await logOut();
    router.replace("/login");
  }

  const dark = variant === "dark";

  return (
    <header
      className={
        dark
          ? "relative z-10 border-b border-white/10 bg-[#0b0a1f]"
          : "border-b border-slate-200 bg-white"
      }
    >
      <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo dark={dark} href={user ? "/dashboard" : "/"} />
        {user && (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/profile"
              aria-label="Open your profile"
              className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                dark
                  ? "text-slate-200 hover:bg-white/10"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ProfileGlyph dark={dark} />
              <span className="hidden max-w-[10rem] truncate sm:inline">
                {profile?.displayName ?? user.displayName ?? "Profile"}
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={
                dark
                  ? "min-h-11 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                  : "min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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

/**
 * Top-left brand. A clickable link (authenticated → /dashboard, otherwise → /).
 * On hover/focus a small SVG wand sweeps across, lighting each character in
 * sequence with subtle sparkles. On click the atom mark pulses bright white,
 * then navigation happens. All SVG/CSS; reduced-motion users get a simple
 * color/opacity change. No layout shift (only opacity/transform/color animate).
 */
function BrandLogo({ dark, href }: { dark: boolean; href: string }) {
  const router = useRouter();
  const [pulsing, setPulsing] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Let modified / non-primary clicks behave normally (open in new tab, etc.).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setPulsing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setPulsing(false);
      router.push(href);
    }, 600);
  }

  const chars = Array.from("Brilliant Quantum");
  const sparks = [
    { left: "24%", top: "8%", delay: "0s" },
    { left: "54%", top: "66%", delay: "0.18s" },
    { left: "82%", top: "16%", delay: "0.34s" },
  ];

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-label="Brilliant Quantum home"
      className={`brand-logo group relative flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight sm:text-base md:text-lg ${
        pulsing ? "brand-pulsing" : ""
      } ${dark ? "text-white" : "text-indigo-600"}`}
    >
      <span className="relative inline-flex">
        <AtomMark dark={dark} />
        <span className="brand-atom-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      </span>
      <span className="relative inline-flex whitespace-pre" aria-hidden="true">
        {chars.map((ch, i) => (
          <span key={i} className="brand-char" style={{ ["--i" as string]: i }}>
            {ch}
          </span>
        ))}
      </span>
      <span className="brand-wand pointer-events-none absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true">
        <BrandWand />
      </span>
      {sparks.map((s, i) => (
        <span
          key={i}
          className="brand-spark pointer-events-none absolute"
          style={{ left: s.left, top: s.top, ["--d" as string]: s.delay }}
          aria-hidden="true"
        />
      ))}
    </Link>
  );
}

function BrandWand() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
      <line x1="3" y1="13" x2="11" y2="5" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 1.5 L12.9 4 L15.4 4.9 L12.9 5.8 L12 8.3 L11.1 5.8 L8.6 4.9 L11.1 4 Z" fill="#fde68a" />
    </svg>
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

/**
 * Profile glyph: a small quantum wand with a star tip inside a faint ring. On
 * hover or focus the wand tilts, the ring glows, and a magic spark appears.
 * Reduced-motion users get a static glyph. Decorative only — the link carries
 * the label.
 */
function ProfileGlyph({ dark }: { dark: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${dark ? "text-violet-300" : "text-indigo-500"}`}
      aria-hidden="true"
    >
      {/* wand + tip + ring (tilts on hover/focus) */}
      <g className="nav-wand-rot">
        <circle className="nav-wand-ring" cx="17" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="5" y1="19" x2="16.5" y2="7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="5" y1="19" x2="8" y2="16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 3.4 L18.3 6.2 L21.2 7 L18.3 7.8 L17 10.6 L15.7 7.8 L12.8 7 L15.7 6.2 Z" fill="#fbbf24" />
      </g>
      {/* magic spark particle (appears on hover/focus) */}
      <circle className="nav-spark" cx="20.5" cy="3.5" r="1.1" fill="#fbbf24" />
    </svg>
  );
}
