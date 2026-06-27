/**
 * Wizard avatar customization. Preferences are cosmetic and stored locally
 * (no Firestore schema change, no image uploads). Safe to read on the client.
 *
 * Hat / robe / aura colors are free-form hex strings, so the custom color picker
 * works without extra config fields. The aura is a single self-contained
 * preset (shape + motion together). Older saved configs may still contain
 * removed fields (`expression`, `showFace`, `beard`, `auraShape`, `auraEffect`)
 * — these load safely via defaults and are otherwise ignored.
 */

export type WandStyle = "classic" | "crystal" | "star";
export type AuraStyle =
  | "hearts"
  | "lightning"
  | "circles"
  | "orbit"
  | "starburst"
  | "rune-ring";

export interface AvatarConfig {
  hat: string;
  robe: string;
  aura: string;
  wand: WandStyle;
  familiar: boolean;
  auraStyle: AuraStyle;
}

export const HAT_COLORS = ["#4338ca", "#7c3aed", "#0f766e", "#b45309", "#be123c", "#1e293b"];
export const ROBE_COLORS = ["#6366f1", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];
export const AURA_COLORS = ["#a78bfa", "#fbbf24", "#34d399", "#38bdf8", "#f472b6", "#f87171"];
export const WAND_STYLES: WandStyle[] = ["classic", "crystal", "star"];
export const AURA_STYLES: AuraStyle[] = [
  "hearts",
  "lightning",
  "circles",
  "orbit",
  "starburst",
  "rune-ring",
];

export const DEFAULT_AVATAR: AvatarConfig = {
  hat: "#4338ca",
  robe: "#6366f1",
  aura: "#a78bfa",
  wand: "classic",
  familiar: false,
  auraStyle: "circles",
};

const KEY = "bq-avatar-v1";

export function loadAvatar(): AvatarConfig {
  if (typeof window === "undefined") return DEFAULT_AVATAR;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_AVATAR;
    const parsed = JSON.parse(raw) as Partial<AvatarConfig>;
    return {
      hat: typeof parsed.hat === "string" ? parsed.hat : DEFAULT_AVATAR.hat,
      robe: typeof parsed.robe === "string" ? parsed.robe : DEFAULT_AVATAR.robe,
      aura: typeof parsed.aura === "string" ? parsed.aura : DEFAULT_AVATAR.aura,
      wand: WAND_STYLES.includes(parsed.wand as WandStyle) ? (parsed.wand as WandStyle) : DEFAULT_AVATAR.wand,
      familiar: typeof parsed.familiar === "boolean" ? parsed.familiar : DEFAULT_AVATAR.familiar,
      auraStyle: AURA_STYLES.includes(parsed.auraStyle as AuraStyle)
        ? (parsed.auraStyle as AuraStyle)
        : DEFAULT_AVATAR.auraStyle,
    };
  } catch {
    return DEFAULT_AVATAR;
  }
}

export function saveAvatar(config: AvatarConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors — avatar is purely cosmetic
  }
}
