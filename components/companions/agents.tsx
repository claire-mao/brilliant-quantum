"use client";

import type { ComponentType } from "react";
import type { AgentId, CompanionState } from "@/lib/companions/types";
import type { WizardPhysics } from "@/lib/companions/physics";
import type { WandMode } from "../WizardCompanion";
import GuideWizard from "./GuideWizard";

export interface AvatarProps {
  state: CompanionState;
  physics?: WizardPhysics;
  wandMode?: WandMode;
  wandAim?: number;
  showMotes?: boolean;
}

/**
 * Registry of companion avatars. The floating layer renders whichever agent is
 * summoned by looking it up here.
 */
export const AGENT_AVATARS: Partial<Record<AgentId, ComponentType<AvatarProps>>> = {
  wizard: GuideWizard,
};
