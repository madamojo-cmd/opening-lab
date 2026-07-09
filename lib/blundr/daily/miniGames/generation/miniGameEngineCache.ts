import type { GeneratedMiniGameScenario } from "./miniGameGenerationTypes";
import type { MiniGameEngineAdjudicationResult, MiniGameEngineCandidateDescriptor } from "./miniGameEngineQualityTypes";
import { normalizeFen } from "./miniGameFenBuilder";
import { normalizeText } from "../miniGameUtils";

export const BLUNDR_MINIGAME_ENGINE_CACHE_READY_EVENT = "blundr:minigame-engine-cache-ready";

const ENGINE_VERSION_TOKEN = "stockfish-18-lite-single";

const candidateResultCache = new Map<string, MiniGameEngineAdjudicationResult>();
const candidateResultInFlight = new Map<string, Promise<MiniGameEngineAdjudicationResult | null>>();

function normalizeParts(values: readonly (string | number | null | undefined)[]): string {
  return values.map((value) => normalizeText(value)).map((value) => value.toLowerCase()).filter(Boolean).join("::");
}

export function getMiniGameStockfishEngineVersionToken(): string {
  return ENGINE_VERSION_TOKEN;
}

export function buildMiniGameCandidateCacheKey(input: {
  descriptor: MiniGameEngineCandidateDescriptor;
  depth: number;
  multipv: number;
  engineVersion?: string | null;
}): string {
  return normalizeParts([
    "mini_game_engine",
    input.engineVersion ?? ENGINE_VERSION_TOKEN,
    input.depth,
    input.multipv,
    input.descriptor.source,
    input.descriptor.miniGameId,
    input.descriptor.family,
    input.descriptor.motif ?? "motif",
    normalizeFen(input.descriptor.fen),
    input.descriptor.sideToMove,
    input.descriptor.primaryMoveUci,
    [...new Set((input.descriptor.acceptedMoves ?? []).map((move) => normalizeText(move).toLowerCase()).filter(Boolean))].sort().join(","),
    input.descriptor.orientation,
    [...new Set((input.descriptor.targetSquares ?? []).map((square) => normalizeText(square).toLowerCase()).filter(Boolean))].sort().join(","),
  ]);
}

export function getCachedMiniGameCandidateResult(candidateKey: string): MiniGameEngineAdjudicationResult | null {
  return candidateResultCache.get(candidateKey) ?? null;
}

export function isMiniGameCandidateResultPending(candidateKey: string): boolean {
  return candidateResultInFlight.has(candidateKey);
}

export function storeMiniGameCandidateResult(result: MiniGameEngineAdjudicationResult): MiniGameEngineAdjudicationResult {
  candidateResultCache.set(result.candidateKey, result);
  candidateResultInFlight.delete(result.candidateKey);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(BLUNDR_MINIGAME_ENGINE_CACHE_READY_EVENT, {
        detail: {
          candidateKey: result.candidateKey,
          scenarioKey: result.scenarioKey,
          accepted: result.accepted,
          rejectionReason: result.rejectionReason,
        },
      }),
    );
  }
  return result;
}

export function queueMiniGameCandidateResult(
  candidateKey: string,
  factory: () => Promise<MiniGameEngineAdjudicationResult | null>,
): Promise<MiniGameEngineAdjudicationResult | null> {
  const cached = candidateResultCache.get(candidateKey);
  if (cached) {
    return Promise.resolve(cached);
  }
  const existing = candidateResultInFlight.get(candidateKey);
  if (existing) {
    return existing;
  }
  const pending = factory()
    .then((result) => {
      if (result) {
        storeMiniGameCandidateResult(result);
      } else {
        candidateResultInFlight.delete(candidateKey);
      }
      return result;
    })
    .catch((error) => {
      candidateResultInFlight.delete(candidateKey);
      return null;
    });
  candidateResultInFlight.set(candidateKey, pending);
  return pending;
}

export function getCachedGeneratedMiniGameScenario(candidateKey: string): GeneratedMiniGameScenario | null {
  const result = candidateResultCache.get(candidateKey);
  if (!result?.accepted || !result.scenario || typeof result.scenario !== "object") {
    return null;
  }
  return result.scenario as GeneratedMiniGameScenario;
}
