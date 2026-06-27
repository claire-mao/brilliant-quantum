"use client";

import type { ActiveCompanion, AgentId, CompanionUpdate } from "@/lib/companions/types";
import DraggableCompanion from "./DraggableCompanion";

/**
 * Fixed-position overlay that renders every active companion. Each instance is
 * keyed by agent + runId, so a fresh summon (new runId) remounts it at a new
 * random anchor and resets any dragged position, while in-place updates (same
 * runId) preserve where the user dropped it.
 */
export default function CompanionLayer({
  companions,
  onDismiss,
  onUpdate,
  isInteractionPaused,
}: {
  companions: ActiveCompanion[];
  onDismiss: (agent: AgentId) => void;
  onUpdate: (agent: AgentId, update: CompanionUpdate) => void;
  isInteractionPaused: () => boolean;
}) {
  return (
    <>
      {companions.map((companion) => (
        <DraggableCompanion
          key={`${companion.agent}-${companion.runId}`}
          companion={companion}
          onDismiss={onDismiss}
          onUpdate={onUpdate}
          isInteractionPaused={isInteractionPaused}
        />
      ))}
    </>
  );
}
