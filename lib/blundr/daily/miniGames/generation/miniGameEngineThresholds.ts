import { normalizeText } from "../miniGameUtils";
import type { MiniGameEngineMode, MiniGameEngineThresholds, MiniGameEngineCandidateDescriptor } from "./miniGameEngineQualityTypes";

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function resolveEnvNumber(values: readonly string[], fallback: number): number {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

function isStrictTacticFamily(descriptor: MiniGameEngineCandidateDescriptor): boolean {
  const family = normalizeText(descriptor.family).toLowerCase();
  const motif = normalizeText(descriptor.motif ?? "").toLowerCase();
  return family.includes("fork") || family.includes("tactic") || motif.includes("fork") || motif.includes("tactic") || motif.includes("target");
}

function resolveBaseMode(descriptor: MiniGameEngineCandidateDescriptor): MiniGameEngineMode {
  switch (descriptor.miniGameId) {
    case "tactic_shots":
      return "strict";
    case "knight_gymnasium":
      return isStrictTacticFamily(descriptor) ? "strict" : "balanced";
    case "king_race":
    case "pawn_wars":
    case "technique_lab":
      return "balanced";
    case "key_square_conquest":
    case "structure_builder":
    case "imbalance_arena":
      return "strategic_sanity";
    default:
      return "balanced";
  }
}

function baseThresholdsForMode(mode: MiniGameEngineMode): Pick<MiniGameEngineThresholds, "depth" | "multipv" | "strictTopRanks" | "softTopRanks" | "maxCentipawnLoss" | "hardRejectCentipawnLoss" | "requirePreservedResult" | "requireMateSafety"> {
  if (mode === "strict") {
    return {
      depth: resolveEnvNumber([process.env.BLUNDR_MINIGAME_STOCKFISH_DEPTH ?? "", process.env.NEXT_PUBLIC_BLUNDR_MINIGAME_STOCKFISH_DEPTH ?? ""], 12),
      multipv: clampInt(resolveEnvNumber([process.env.BLUNDR_MINIGAME_STOCKFISH_MULTIPV ?? "", process.env.NEXT_PUBLIC_BLUNDR_MINIGAME_STOCKFISH_MULTIPV ?? ""], 4), 1, 4),
      strictTopRanks: [1, 2],
      softTopRanks: [1, 2],
      maxCentipawnLoss: 50,
      hardRejectCentipawnLoss: 100,
      requirePreservedResult: false,
      requireMateSafety: true,
    };
  }

  if (mode === "balanced") {
    return {
      depth: resolveEnvNumber([process.env.BLUNDR_MINIGAME_STOCKFISH_DEPTH ?? "", process.env.NEXT_PUBLIC_BLUNDR_MINIGAME_STOCKFISH_DEPTH ?? ""], 10),
      multipv: clampInt(resolveEnvNumber([process.env.BLUNDR_MINIGAME_STOCKFISH_MULTIPV ?? "", process.env.NEXT_PUBLIC_BLUNDR_MINIGAME_STOCKFISH_MULTIPV ?? ""], 4), 1, 4),
      strictTopRanks: [1, 2],
      softTopRanks: [1, 2, 3, 4, 5],
      maxCentipawnLoss: 80,
      hardRejectCentipawnLoss: 120,
      requirePreservedResult: true,
      requireMateSafety: true,
    };
  }

  return {
    depth: resolveEnvNumber([process.env.BLUNDR_MINIGAME_STOCKFISH_DEPTH ?? "", process.env.NEXT_PUBLIC_BLUNDR_MINIGAME_STOCKFISH_DEPTH ?? ""], 10),
    multipv: clampInt(resolveEnvNumber([process.env.BLUNDR_MINIGAME_STOCKFISH_MULTIPV ?? "", process.env.NEXT_PUBLIC_BLUNDR_MINIGAME_STOCKFISH_MULTIPV ?? ""], 4), 1, 4),
    strictTopRanks: [1, 2],
    softTopRanks: [1, 2, 3, 4, 5],
    maxCentipawnLoss: 80,
    hardRejectCentipawnLoss: 150,
    requirePreservedResult: true,
    requireMateSafety: true,
  };
}

function resolveMiniGameFamilyThresholds(descriptor: MiniGameEngineCandidateDescriptor, thresholds: MiniGameEngineThresholds): MiniGameEngineThresholds {
  if (descriptor.miniGameId === "key_square_conquest") {
    return { ...thresholds, maxCentipawnLoss: 70, hardRejectCentipawnLoss: 120 };
  }
  if (descriptor.miniGameId === "structure_builder") {
    return { ...thresholds, maxCentipawnLoss: 80, hardRejectCentipawnLoss: 150 };
  }
  if (descriptor.miniGameId === "imbalance_arena") {
    return { ...thresholds, maxCentipawnLoss: 80, hardRejectCentipawnLoss: 150 };
  }
  return thresholds;
}

export function resolveMiniGameEngineThresholds(descriptor: MiniGameEngineCandidateDescriptor): MiniGameEngineThresholds {
  const mode = resolveBaseMode(descriptor);
  return resolveMiniGameFamilyThresholds(descriptor, {
    mode,
    ...baseThresholdsForMode(mode),
  });
}

export function isStrictMiniGameEngineMode(mode: MiniGameEngineMode): boolean {
  return mode === "strict";
}
