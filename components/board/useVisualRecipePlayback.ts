"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimationConductor } from "@/lib/blundr/animation/animationConductor";
import { buildVisualPlaybackKey } from "@/lib/blundr/animation/playbackKey";
import type { ActiveVisualRecipePlayback, AnimationConductorContext, ReducedMotionMode } from "@/lib/blundr/animation/animationTypes";
import type { VisualRecipe } from "@/lib/blundr/visualRecipe/visualRecipeTypes";
import { primitivesToTeachingOverlay } from "./visualPrimitiveRenderers";

function nowMs(): number {
  return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
}

function detectReducedMotion(mode: ReducedMotionMode): boolean {
  if (mode === "reduce") return true;
  if (mode === "full") return false;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function equalStringArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function snapshotsEqual(a: ActiveVisualRecipePlayback, b: ActiveVisualRecipePlayback): boolean {
  if (a.playbackState !== b.playbackState) return false;
  if (a.recipeId !== b.recipeId) return false;
  if (a.patternId !== b.patternId) return false;
  if (a.activeBeatIndex !== b.activeBeatIndex) return false;
  if (a.activeBeatId !== b.activeBeatId) return false;
  if (a.reducedMotion !== b.reducedMotion) return false;
  if (a.skippedToEnd !== b.skippedToEnd) return false;
  if (a.clearedReason !== b.clearedReason) return false;
  if (a.suppressedReason !== b.suppressedReason) return false;
  if (a.replayAvailable !== b.replayAvailable) return false;
  if (a.recipeFrameMatchesBoard !== b.recipeFrameMatchesBoard) return false;
  if (a.recipeFenMatchesBoard !== b.recipeFenMatchesBoard) return false;
  if (!equalStringArray(a.activePrimitiveIds, b.activePrimitiveIds)) return false;
  if (a.visiblePrimitives.length !== b.visiblePrimitives.length) return false;
  for (let i = 0; i < a.visiblePrimitives.length; i += 1) {
    if (a.visiblePrimitives[i]?.id !== b.visiblePrimitives[i]?.id) return false;
  }
  return true;
}

export type PlaybackInput = {
  recipe?: VisualRecipe | null;
  phase: AnimationConductorContext["phase"];
  viewMode: AnimationConductorContext["viewMode"];
  boardFen: string;
  trainerFrameId: number;
  overlayFrameId: number;
  userToMove: boolean;
  adapterAllowed: boolean;
  adapterSuppressedReason?: string;
  opponentCandidateRenderedInMainUi?: boolean;
  enabled?: boolean;
  reducedMotionMode?: ReducedMotionMode;
};

export type VisualRecipePlaybackResult = {
  lines: ReturnType<typeof primitivesToTeachingOverlay>["lines"];
  squares: ReturnType<typeof primitivesToTeachingOverlay>["squares"];
  activePrimitiveIds: string[];
  animationState: ActiveVisualRecipePlayback["playbackState"];
  activeVisualRecipeId?: string;
  activePatternId?: string;
  activeBeatIndex?: number;
  activeBeatId?: string;
  animationReducedMotion: boolean;
  animationSkippedToEnd: boolean;
  animationClearedReason?: string;
  animationSuppressedReason?: string;
  recipeFrameMatchesBoard: boolean;
  recipeFenMatchesBoard: boolean;
  replayAvailable: boolean;
  tacticalPrimitivesRendered: false;
  replay: () => void;
  skipToEnd: () => void;
  clear: () => void;
  consumeSkipOnInteraction: () => boolean;
};

export function useVisualRecipePlayback(input: PlaybackInput): VisualRecipePlaybackResult {
  const conductorRef = useRef<AnimationConductor | null>(null);
  if (!conductorRef.current) conductorRef.current = new AnimationConductor();

  const [snapshot, setSnapshot] = useState<ActiveVisualRecipePlayback>(conductorRef.current.snapshot());
  const snapshotRef = useRef<ActiveVisualRecipePlayback>(snapshot);
  const rafRef = useRef<number | null>(null);

  const reduced = detectReducedMotion(input.reducedMotionMode ?? "system");
  const enabled = input.enabled !== false;

  const latestRef = useRef({ ...input, reduced, enabled });
  latestRef.current = { ...input, reduced, enabled };

  const updateSnapshot = useCallback((next: ActiveVisualRecipePlayback) => {
    setSnapshot((prev) => {
      if (snapshotsEqual(prev, next)) return prev;
      const cloned = { ...next };
      snapshotRef.current = cloned;
      return cloned;
    });
  }, []);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const syncOnce = useCallback(() => {
    const conductor = conductorRef.current;
    if (!conductor) return;
    const latest = latestRef.current;
    const next = conductor.sync({
      recipe: latest.recipe,
      context: {
        phase: latest.phase,
        viewMode: latest.viewMode,
        boardFen: latest.boardFen,
        trainerFrameId: latest.trainerFrameId,
        overlayFrameId: latest.overlayFrameId,
        userToMove: latest.userToMove,
        adapterAllowed: latest.adapterAllowed,
        adapterSuppressedReason: latest.adapterSuppressedReason,
        opponentCandidateRenderedInMainUi: latest.opponentCandidateRenderedInMainUi,
      },
      nowMs: nowMs(),
      reducedMotionMode: latest.reduced ? "reduce" : "full",
    });
    updateSnapshot(next);
    return next;
  }, [updateSnapshot]);

  const tickRef = useRef<() => void>(() => undefined);
  tickRef.current = () => {
    const next = syncOnce();
    if (!next) {
      rafRef.current = null;
      return;
    }
    const latest = latestRef.current;
    if (next.playbackState === "playing" && latest.enabled && !latest.reduced) {
      rafRef.current = window.requestAnimationFrame(() => tickRef.current());
      return;
    }
    rafRef.current = null;
  };

  const playbackKey = useMemo(
    () => buildVisualPlaybackKey({ recipe: input.recipe, enabled, reduced, trainerFrameId: input.trainerFrameId, boardFen: input.boardFen }),
    [
      input.recipe?.visualRecipeId,
      input.recipe?.frameId,
      input.recipe?.fen,
      input.recipe?.mode,
      input.recipe?.patternId,
      enabled,
      reduced,
      input.trainerFrameId,
      input.boardFen,
    ],
  );

  useEffect(() => {
    cancelRaf();
    const latest = latestRef.current;

    if (latest.reduced) {
      syncOnce();
      return () => {
        cancelRaf();
      };
    }

    if (!latest.enabled) {
      syncOnce();
      return () => {
        cancelRaf();
      };
    }

    rafRef.current = window.requestAnimationFrame(() => tickRef.current());

    return () => {
      cancelRaf();
    };
  }, [playbackKey, cancelRaf, syncOnce]);

  const overlay = useMemo(() => primitivesToTeachingOverlay(snapshot.visiblePrimitives), [snapshot.visiblePrimitives]);

  const replay = useCallback(() => {
    const conductor = conductorRef.current;
    if (!conductor) return;
    const latest = latestRef.current;
    const next = conductor.replay({
      context: {
        phase: latest.phase,
        viewMode: latest.viewMode,
        boardFen: latest.boardFen,
        trainerFrameId: latest.trainerFrameId,
        overlayFrameId: latest.overlayFrameId,
        userToMove: latest.userToMove,
        adapterAllowed: latest.adapterAllowed,
        adapterSuppressedReason: latest.adapterSuppressedReason,
        opponentCandidateRenderedInMainUi: latest.opponentCandidateRenderedInMainUi,
      },
      nowMs: nowMs(),
      reducedMotionMode: latest.reduced ? "reduce" : "full",
    });
    updateSnapshot(next);
    if (!latest.reduced && latest.enabled && next.playbackState === "playing") {
      cancelRaf();
      rafRef.current = window.requestAnimationFrame(() => tickRef.current());
    }
  }, [cancelRaf, updateSnapshot]);

  const skipToEnd = useCallback(() => {
    const conductor = conductorRef.current;
    if (!conductor) return;
    const next = conductor.skipToEnd();
    cancelRaf();
    updateSnapshot(next);
  }, [cancelRaf, updateSnapshot]);

  const clear = useCallback(() => {
    const conductor = conductorRef.current;
    if (!conductor) return;
    const next = conductor.clear("manual_clear");
    cancelRaf();
    updateSnapshot(next);
  }, [cancelRaf, updateSnapshot]);

  const consumeSkipOnInteraction = useCallback(() => {
    if (snapshotRef.current.playbackState !== "playing") return false;
    skipToEnd();
    return true;
  }, [skipToEnd]);

  return {
    lines: overlay.lines,
    squares: overlay.squares,
    activePrimitiveIds: snapshot.activePrimitiveIds,
    animationState: snapshot.playbackState,
    activeVisualRecipeId: snapshot.recipeId,
    activePatternId: snapshot.patternId,
    activeBeatIndex: snapshot.activeBeatIndex,
    activeBeatId: snapshot.activeBeatId,
    animationReducedMotion: snapshot.reducedMotion,
    animationSkippedToEnd: snapshot.skippedToEnd,
    animationClearedReason: snapshot.clearedReason,
    animationSuppressedReason: snapshot.suppressedReason,
    recipeFrameMatchesBoard: snapshot.recipeFrameMatchesBoard,
    recipeFenMatchesBoard: snapshot.recipeFenMatchesBoard,
    replayAvailable: snapshot.replayAvailable,
    tacticalPrimitivesRendered: false,
    replay,
    skipToEnd,
    clear,
    consumeSkipOnInteraction,
  };
}
