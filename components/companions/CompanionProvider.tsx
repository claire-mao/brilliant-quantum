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
import { getRandomWizardAnchor } from "@/lib/companions/anchors";
import CompanionLayer from "./CompanionLayer";

const ENTER_MS = 500;
const LEAVE_MS = 360;
const INTERACTION_PAUSE_MS = 4000;

const NOOP: CompanionApi = {
  summon: () => {},
  update: () => {},
  dismiss: () => {},
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
  const runCounter = useRef(0);
  const runIds = useRef<Record<string, number>>({});
  const timers = useRef<Record<string, number[]>>({});
  const interactionPausedUntil = useRef(0);
  const bubbleHandlers = useRef<Record<string, () => void>>({});

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

  const setBubbleActionHandler = useCallback((id: string, handler: () => void) => {
    bubbleHandlers.current[id] = handler;
  }, []);

  const clearBubbleActionHandler = useCallback((id: string) => {
    delete bubbleHandlers.current[id];
  }, []);

  const dismiss = useCallback(
    (agent: AgentId = "wizard") => {
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
      clearTimers(agent);
      const anchorId = getRandomWizardAnchor(request.context);
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
        },
      }));

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
    [clearTimers, addTimer, dismiss]
  );

  const update = useCallback(
    (agent: AgentId, partial: CompanionUpdate) => {
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
    [clearTimers, addTimer, dismiss]
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
      registerInteraction,
      isInteractionPaused,
      setBubbleActionHandler,
      clearBubbleActionHandler,
    }),
    [summon, update, dismiss, registerInteraction, isInteractionPaused, setBubbleActionHandler, clearBubbleActionHandler]
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
