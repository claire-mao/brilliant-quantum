"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import type {
  ActiveCompanion,
  AgentId,
  CompanionApi,
  CompanionUpdate,
  SummonRequest,
} from "@/lib/companions/types";
import CompanionLayer from "./CompanionLayer";
import { playSound } from "@/lib/sound/sounds";

const ENTER_MS = 500;
const LEAVE_MS = 360;
const INTERACTION_PAUSE_MS = 4000;
const DEV = process.env.NODE_ENV === "development";

/** Temporary dev-only trace of who writes the wizard bubble (source + text). */
function logMessage(event: string, agent: string, source: string, message?: string) {
  if (!DEV) return;
  console.log(`[companion] ${event}`, { agent, source, message, at: new Date().toISOString() });
}

const NOOP: CompanionApi = {
  summon: () => {},
  update: () => {},
  dismiss: () => {},
  isActive: () => false,
  registerInteraction: () => {},
  isInteractionPaused: () => false,
  setBubbleActionHandler: () => {},
  clearBubbleActionHandler: () => {},
};

const CompanionContext = createContext<CompanionApi>(NOOP);

/** Summon / update / dismiss floating companions from anywhere in the app. */
export function useCompanion(): CompanionApi {
  return useContext(CompanionContext);
}

/** Read bubble-action handlers registered on the provider. */
export function useBubbleActionHandlers(): MutableRefObject<Record<string, () => void>> {
  return useContext(BubbleHandlerContext);
}

const BubbleHandlerContext = createContext<MutableRefObject<Record<string, () => void>>>({
  current: {},
});

/**
 * Agent manager + floating layer. Keeps a map of active companions keyed by
 * agent id (multi-companion ready), drives lifecycle phases with timers, and is
 * fully additive: it never touches lessons, routing, or progress.
 */
export default function CompanionProvider({ children }: { children: ReactNode }) {
  const [companions, setCompanions] = useState<Record<string, ActiveCompanion>>({});
  const companionsRef = useRef<Record<string, ActiveCompanion>>({});
  const runCounter = useRef(0);
  const runIds = useRef<Record<string, number>>({});
  const timers = useRef<Record<string, number[]>>({});
  const interactionPausedUntil = useRef(0);
  const bubbleHandlers = useRef<Record<string, () => void>>({});
  // Tracks the source of each agent's current bubble message. Manual dashboard /
  // profile lines are "pinned": automatic writes are refused so they cannot clobber them.
  const messageMetaRef = useRef<Record<string, { source: string; at: number }>>({});

  const isBlockedByManual = useCallback((agent: string, source: string) => {
    const meta = messageMetaRef.current[agent];
    if (!meta || source.startsWith("manual")) return false;
    return meta.source === "manual-dashboard" || meta.source === "manual-profile";
  }, []);

  const clearTimers = useCallback((agent: AgentId) => {
    (timers.current[agent] ?? []).forEach((t) => clearTimeout(t));
    timers.current[agent] = [];
  }, []);

  const addTimer = useCallback((agent: AgentId, id: number) => {
    timers.current[agent] = [...(timers.current[agent] ?? []), id];
  }, []);

  const registerInteraction = useCallback(() => {
    interactionPausedUntil.current = Date.now() + INTERACTION_PAUSE_MS;
  }, []);

  const isInteractionPaused = useCallback(() => {
    return Date.now() < interactionPausedUntil.current;
  }, []);

  const isActive = useCallback((agent: AgentId = "wizard") => {
    const c = companionsRef.current[agent];
    return !!c && c.phase !== "leaving";
  }, []);

  useEffect(() => {
    companionsRef.current = companions;
  }, [companions]);

  const setBubbleActionHandler = useCallback((id: string, handler: () => void) => {
    bubbleHandlers.current[id] = handler;
  }, []);

  const clearBubbleActionHandler = useCallback((id: string) => {
    delete bubbleHandlers.current[id];
  }, []);

  const dismiss = useCallback(
    (agent: AgentId = "wizard") => {
      // Clearing the pin lets the next (manual or auto) summon proceed normally.
      delete messageMetaRef.current[agent];
      clearTimers(agent);
      setCompanions((prev) =>
        prev[agent] ? { ...prev, [agent]: { ...prev[agent], phase: "leaving" } } : prev
      );
      const timer = window.setTimeout(() => {
        setCompanions((prev) => {
          if (!prev[agent]) return prev;
          const next = { ...prev };
          delete next[agent];
          return next;
        });
      }, LEAVE_MS);
      addTimer(agent, timer);
    },
    [clearTimers, addTimer]
  );

  const summon = useCallback(
    (request: SummonRequest) => {
      const agent: AgentId = request.agent ?? "wizard";
      const source = request.source ?? "auto";
      // Never let an automatic summon overwrite a pinned manual dashboard/profile message.
      if (isBlockedByManual(agent, source)) {
        logMessage("summon refused (manual pinned)", agent, source, request.message);
        return;
      }
      clearTimers(agent);
      playSound("wizard");
      // Deterministic: spawn in front of the wizard's home unless told otherwise.
      const anchorId = request.anchorId ?? "house";
      runCounter.current += 1;
      const runId = runCounter.current;
      runIds.current[agent] = runId;

      setCompanions((prev) => ({
        ...prev,
        [agent]: {
          agent,
          anchorId,
          state: request.state,
          message: request.message,
          phase: "entering",
          runId,
          bubbleActions: request.bubbleActions,
          wandAim: request.wandAim,
          showMotes: request.showMotes ?? true,
          messageSource: source,
        },
      }));
      messageMetaRef.current[agent] = { source, at: Date.now() };
      logMessage("summon", agent, source, request.message);

      const enter = window.setTimeout(() => {
        setCompanions((prev) =>
          prev[agent] && prev[agent].runId === runId
            ? { ...prev, [agent]: { ...prev[agent], phase: "present" } }
            : prev
        );
      }, ENTER_MS);
      addTimer(agent, enter);

      if (request.autoDismissMs) {
        const auto = window.setTimeout(() => {
          if (runIds.current[agent] === runId) dismiss(agent);
        }, request.autoDismissMs);
        addTimer(agent, auto);
      }
    },
    [clearTimers, addTimer, dismiss, isBlockedByManual]
  );

  const update = useCallback(
    (agent: AgentId, partial: CompanionUpdate) => {
      const source = partial.source ?? "auto";
      const changesMessage = "message" in partial;
      // An automatic message change must not clobber a pinned manual message.
      if (changesMessage && isBlockedByManual(agent, source)) {
        logMessage("update refused (manual pinned)", agent, source, partial.message);
        return;
      }
      if (changesMessage) {
        messageMetaRef.current[agent] = { source, at: Date.now() };
        logMessage("update", agent, source, partial.message);
      }
      setCompanions((prev) =>
        prev[agent]
          ? {
              ...prev,
              [agent]: {
                ...prev[agent],
                state: partial.state ?? prev[agent].state,
                // "message" / "bubbleActions" honor explicit presence so callers
                // can clear them (e.g. switch to a plain thinking/hint bubble).
                message: "message" in partial ? partial.message : prev[agent].message,
                bubbleActions:
                  "bubbleActions" in partial ? partial.bubbleActions : prev[agent].bubbleActions,
                anchorId: partial.anchorId ?? prev[agent].anchorId,
                wandAim: partial.wandAim ?? prev[agent].wandAim,
                showMotes: partial.showMotes ?? prev[agent].showMotes,
                messageSource: changesMessage ? source : prev[agent].messageSource,
              },
            }
          : prev
      );
      if (partial.autoDismissMs) {
        clearTimers(agent);
        const token = runIds.current[agent];
        const auto = window.setTimeout(() => {
          if (runIds.current[agent] === token) dismiss(agent);
        }, partial.autoDismissMs);
        addTimer(agent, auto);
      }
    },
    [clearTimers, addTimer, dismiss, isBlockedByManual]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      Object.values(pending)
        .flat()
        .forEach((t) => clearTimeout(t));
    };
  }, []);

  const api = useMemo<CompanionApi>(
    () => ({
      summon,
      update,
      dismiss,
      isActive,
      registerInteraction,
      isInteractionPaused,
      setBubbleActionHandler,
      clearBubbleActionHandler,
    }),
    [summon, update, dismiss, isActive, registerInteraction, isInteractionPaused, setBubbleActionHandler, clearBubbleActionHandler]
  );

  return (
    <BubbleHandlerContext.Provider value={bubbleHandlers}>
      <CompanionContext.Provider value={api}>
        {children}
        <CompanionLayer
          companions={Object.values(companions)}
          onDismiss={dismiss}
          onUpdate={update}
          isInteractionPaused={isInteractionPaused}
        />
      </CompanionContext.Provider>
    </BubbleHandlerContext.Provider>
  );
}
