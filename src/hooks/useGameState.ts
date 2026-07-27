"use client";

import { useCallback, useEffect, useState } from "react";
import { initialGameState } from "@/src/game/initialState";
import { STORAGE_KEY } from "@/src/data/caseData";
import type {
  GameState,
  InteractionDimensions,
  PatternLevel,
} from "@/src/types/game";

type LegacyState = Omit<Partial<GameState>, "designerAllocation"> & {
  openedFiles?: GameState["viewedFiles"];
  initialConfidence?: number;
  finalConfidence?: number;
  classificationAnswers?: Record<string, string>;
  evidenceAnswers?: Record<string, string>;
  moderatorAnswers?: Record<string, string>;
  resultLevel?: PatternLevel;
  reflectionScores?: InteractionDimensions;
  designerAllocation?: Record<string, number>;
};

function restoreState(saved: string): GameState {
  const legacy = JSON.parse(saved) as LegacyState;
  const oldAllocation = legacy.designerAllocation;
  const designerAllocation =
    oldAllocation &&
    "accuracy" in oldAllocation &&
    "representation" in oldAllocation &&
    "entertainment" in oldAllocation
      ? {
          history: oldAllocation.accuracy,
          players: oldAllocation.representation,
          fun: oldAllocation.entertainment,
        }
      : initialGameState.designerAllocation;

  return {
    ...initialGameState,
    ...legacy,
    viewedFiles: legacy.viewedFiles ?? legacy.openedFiles ?? [],
    reopenedFiles: legacy.reopenedFiles ?? [],
    viewedConnections: legacy.viewedConnections ?? [],
    readingTime: legacy.readingTime ?? {},
    confidenceLevels: {
      initial:
        legacy.confidenceLevels?.initial ?? legacy.initialConfidence ?? 50,
      final: legacy.confidenceLevels?.final ?? legacy.finalConfidence ?? 50,
      historian: legacy.confidenceLevels?.historian ?? null,
    },
    classificationPlacements: {
      ...(legacy.classificationAnswers ?? {}),
      ...(legacy.evidenceAnswers ?? {}),
      ...(legacy.moderatorAnswers ?? {}),
      ...(legacy.classificationPlacements ?? {}),
    },
    designerAllocation:
      legacy.designerAllocation &&
      "history" in legacy.designerAllocation
        ? (legacy.designerAllocation as GameState["designerAllocation"])
        : designerAllocation,
    interactionDimensions:
      legacy.interactionDimensions ?? initialGameState.interactionDimensions,
    patternLevel: legacy.patternLevel ?? legacy.resultLevel ?? null,
    scoringReasons: legacy.scoringReasons ?? [],
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(initialGameState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const params = new URLSearchParams(window.location.search);
      if (params.get("reset") === "true") {
        window.localStorage.removeItem(STORAGE_KEY);
        params.delete("reset");
        const query = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${query ? `?${query}` : ""}`,
        );
        setState(initialGameState);
        setHydrated(true);
        return;
      }

      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setState(restoreState(saved));
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const patchState = useCallback((patch: Partial<GameState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const updateState = useCallback((updater: (current: GameState) => GameState) => {
    setState(updater);
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(initialGameState);
  }, []);

  return { state, setState, patchState, updateState, reset, hydrated };
}
