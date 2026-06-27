"use client";

import { useEffect, useRef, useState } from "react";
import {
  AURA_COLORS,
  AURA_STYLES,
  HAT_COLORS,
  ROBE_COLORS,
  WAND_STYLES,
  type AuraStyle,
  type AvatarConfig,
  type WandStyle,
} from "@/lib/profile/avatar";
import AvatarWizard from "./AvatarWizard";

const WAND_LABEL: Record<WandStyle, string> = {
  classic: "Classic orb",
  crystal: "Crystal",
  star: "Star",
};
const AURA_LABEL: Record<AuraStyle, string> = {
  hearts: "Hearts",
  lightning: "Lightning",
  circles: "Circles",
  orbit: "Orbit",
  starburst: "Starburst",
  "rune-ring": "Rune Ring",
};

/**
 * Controls for customizing the wizard avatar. Controlled component: it renders a
 * live preview and reports changes via onChange (the page persists them).
 */
export default function AvatarBuilder({
  value,
  onChange,
}: {
  value: AvatarConfig;
  onChange: (next: AvatarConfig) => void;
}) {
  const [meow, setMeow] = useState(false);
  const meowTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (meowTimer.current) clearTimeout(meowTimer.current);
    };
  }, []);

  function set<K extends keyof AvatarConfig>(key: K, v: AvatarConfig[K]) {
    onChange({ ...value, [key]: v });
  }

  function toggleFamiliar() {
    const next = !value.familiar;
    set("familiar", next);
    if (next) {
      setMeow(true);
      if (meowTimer.current) clearTimeout(meowTimer.current);
      meowTimer.current = window.setTimeout(() => setMeow(false), 1600);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4">
          <AvatarWizard config={value} className="h-40 w-40" meow={meow} />
        </div>
        <p className="max-w-[13rem] text-center text-xs text-violet-200/80">
          Hover to cast your spell!
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Swatches label="Hat color" colors={HAT_COLORS} selected={value.hat} onPick={(c) => set("hat", c)} />
        <Swatches label="Robe color" colors={ROBE_COLORS} selected={value.robe} onPick={(c) => set("robe", c)} />
        <Swatches label="Aura color" colors={AURA_COLORS} selected={value.aura} onPick={(c) => set("aura", c)} />

        <ChipGroup
          label="Wand style"
          options={WAND_STYLES}
          selected={value.wand}
          labels={WAND_LABEL}
          onPick={(v) => set("wand", v)}
        />
        <ChipGroup
          label="Aura"
          options={AURA_STYLES}
          selected={value.auraStyle}
          labels={AURA_LABEL}
          onPick={(v) => set("auraStyle", v)}
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Familiar cat</p>
          <button
            type="button"
            role="switch"
            aria-checked={value.familiar}
            onClick={toggleFamiliar}
            className={`mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              value.familiar
                ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${value.familiar ? "bg-emerald-300" : "bg-slate-500"}`} />
            {value.familiar ? "Companion on" : "Companion off"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  labels,
  onPick,
}: {
  label: string;
  options: T[];
  selected: T;
  labels: Record<T, string>;
  onPick: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onPick(opt)}
            aria-pressed={selected === opt}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected === opt
                ? "border-violet-400/60 bg-violet-500/20 text-violet-100"
                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Swatches({
  label,
  colors,
  selected,
  onPick,
}: {
  label: string;
  colors: string[];
  selected: string;
  onPick: (color: string) => void;
}) {
  const isCustom = !colors.includes(selected);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`${label} ${color}`}
            aria-pressed={selected === color}
            onClick={() => onPick(color)}
            style={{ backgroundColor: color }}
            className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-[#0d0a24] transition-transform hover:scale-110 ${
              selected === color ? "ring-white" : "ring-transparent"
            }`}
          />
        ))}

        {/* Custom color picker (native <input type="color">) */}
        <label
          title={`${label} custom`}
          className={`relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-[#0d0a24] transition-transform hover:scale-110 ${
            isCustom ? "ring-white" : "ring-transparent"
          }`}
          style={
            isCustom
              ? { backgroundColor: selected }
              : {
                  background:
                    "conic-gradient(from 0deg, #f87171, #fbbf24, #34d399, #38bdf8, #a78bfa, #f472b6, #f87171)",
                }
          }
        >
          {!isCustom && (
            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 text-white drop-shadow" aria-hidden="true">
              <path d="M6 2 V10 M2 6 H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
          <input
            type="color"
            value={selected}
            onChange={(e) => onPick(e.target.value)}
            aria-label={`${label} custom color`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}
