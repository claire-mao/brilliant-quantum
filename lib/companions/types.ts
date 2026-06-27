/**
 * Types for the floating companion system. The architecture is multi-companion
 * from the start: the manager keys active companions by agent id, so future
 * familiars (cat, owl, spellbook, crystal ball) can be added without touching
 * lesson code. Today only the Guide Wizard is instantiated.
 */

export type AgentId = "wizard" | "cat" | "owl" | "spellbook" | "crystal";

/** What the companion is doing right now. */
export type CompanionState = "thinking" | "speaking" | "celebrating";

/** Lifecycle phase, used to drive teleport-in / dismiss animations. */
export type CompanionPhase = "entering" | "present" | "leaving";

/** Why the companion was summoned — maps to candidate anchor positions. */
export type ContextKind = "hint" | "practice" | "fun-fact" | "badge" | "generic";

/** Predefined viewport anchor positions (never arbitrary pixels). */
export type AnchorId =
  | "top-left"
  | "top-center"
  | "top-right"
  | "mid-left"
  | "mid-right"
  | "center-left"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  /** In front of the wizard's home (bottom-left cabin). */
  | "house";

export interface BubbleAction {
  id: string;
  label: string;
  variant?: "primary" | "ghost";
}

export interface SummonRequest {
  /** Defaults to "wizard". */
  agent?: AgentId;
  context: ContextKind;
  state: CompanionState;
  /** Explicit spawn anchor. Defaults to the wizard's home (no random spawn). */
  anchorId?: AnchorId;
  message?: string;
  /** If set, the companion teleports away automatically after this many ms. */
  autoDismissMs?: number;
  /** Optional action buttons inside the speech bubble. */
  bubbleActions?: BubbleAction[];
  /** Aim the wand (degrees). */
  wandAim?: number;
  /** Show magic motes on appear. */
  showMotes?: boolean;
}

export interface CompanionUpdate {
  state?: CompanionState;
  message?: string;
  autoDismissMs?: number;
  /** Move the companion to a new anchor (idle walking). */
  anchorId?: AnchorId;
  bubbleActions?: BubbleAction[];
  wandAim?: number;
  showMotes?: boolean;
}

export interface ActiveCompanion {
  agent: AgentId;
  anchorId: AnchorId;
  state: CompanionState;
  message?: string;
  phase: CompanionPhase;
  /** Increments per summon so stale timers can be ignored. */
  runId: number;
  bubbleActions?: BubbleAction[];
  wandAim?: number;
  showMotes?: boolean;
}

export interface CompanionApi {
  summon(request: SummonRequest): void;
  update(agent: AgentId, update: CompanionUpdate): void;
  dismiss(agent?: AgentId): void;
  /** True while the agent is currently summoned (and not leaving). */
  isActive(agent?: AgentId): boolean;
  /** Pause idle walking while the learner interacts with lesson controls. */
  registerInteraction(): void;
  /** True while lesson interaction pause is active. */
  isInteractionPaused(): boolean;
  /** Register a handler for a speech-bubble action button (by id). */
  setBubbleActionHandler(id: string, handler: () => void): void;
  /** Remove a speech-bubble action handler. */
  clearBubbleActionHandler(id: string): void;
}
