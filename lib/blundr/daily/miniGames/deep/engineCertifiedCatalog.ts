import catalogJson from "./catalog/engineCertifiedCatalog.v1.json";
import quarantineJson from "./catalog/engineCertifiedCatalogQuarantine.v1.json";
import type { DeepMiniGameId, DeepMiniGameScenario } from "./deepMiniGameTypes";

type CatalogFamily = "tactic" | "knight" | "pawn";
type CatalogStep = {
  uci: string;
  san: string;
  piece: string;
  color: "w" | "b";
  capture: string | null;
  check: boolean;
};
type CatalogRecord = {
  family: CatalogFamily;
  miniGameId: DeepMiniGameId;
  id: string;
  fen: string;
  pieces: number;
  turn: "w" | "b";
  solution: readonly CatalogStep[];
  evaluation: {
    depth: number;
    cp: number | null;
    mate: number | null;
    gapCp: number;
    multipv: number;
  };
  legalMoves: number;
  theme: string;
  architecture: string;
  source: string;
  checksum: string;
};

const CATALOG_ID = "blundr-engine-certified-deep-minigames";
const CATALOG_VERSION = "1.0.0";
const records = catalogJson.records as readonly CatalogRecord[];
const byGameId = new Map<DeepMiniGameId, readonly CatalogRecord[]>(
  (
    ["tactic_shots_deep", "knight_gymnasium_deep", "king_pawn_lab"] as const
  ).map((miniGameId) => [
    miniGameId,
    records.filter((record) => record.miniGameId === miniGameId),
  ]),
);

function stableIndex(seed: string, length: number): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}

function toScenario(record: CatalogRecord): DeepMiniGameScenario {
  const userSteps = record.solution.filter((_, index) => index % 2 === 0);
  const opponentSteps = record.solution.filter((_, index) => index % 2 === 1);
  return {
    id: `catalog:${CATALOG_VERSION}:${record.family}:${record.id}`,
    miniGameId: record.miniGameId,
    startFen: record.fen,
    sideToMove: record.turn === "w" ? "white" : "black",
    solution: {
      userMoves: userSteps.map((step) => step.uci),
      opponentReplies: opponentSteps.map((step) => step.uci),
      requiredTargets:
        record.family === "knight"
          ? [
              ...new Set(
                userSteps
                  .filter((step) => step.piece === "n")
                  .map((step) => step.uci.slice(2, 4)),
              ),
            ]
          : undefined,
    },
    schemaVersion: "deep-schema-v1",
    generatorVersion: "prepared-engine-catalog-v1",
    validatorVersion: "deep-catalog-validator-v1",
    evidenceVersion: `stockfish-18-lite-depth-${record.evaluation.depth}`,
    evidence: {
      catalogId: CATALOG_ID,
      catalogVersion: CATALOG_VERSION,
      sourceRecordId: record.id,
      family: record.family,
      engine: "Stockfish 18 Lite",
      depth: record.evaluation.depth,
      evaluationCp: record.evaluation.cp,
      mate: record.evaluation.mate,
      bestMoveGapCp: record.evaluation.gapCp,
      multiPv: record.evaluation.multipv,
      legalMoveCount: record.legalMoves,
      pieceCount: record.pieces,
      theme: record.theme,
      architecture: record.architecture,
      checksumSha256: record.checksum,
    },
  };
}

export function selectEngineCertifiedDeepScenario(
  miniGameId: DeepMiniGameId,
  selectionSeed: string,
): DeepMiniGameScenario | null {
  const candidates = byGameId.get(miniGameId) ?? [];
  if (!candidates.length) return null;
  return toScenario(
    candidates[
      stableIndex(`${miniGameId}|${selectionSeed}`, candidates.length)
    ],
  );
}

export const ENGINE_CERTIFIED_DEEP_CATALOG_SUMMARY = Object.freeze({
  catalogId: CATALOG_ID,
  catalogVersion: CATALOG_VERSION,
  suppliedRecords: catalogJson.metadata.suppliedRecordCount,
  activeRecords: records.length,
  quarantinedRecords: quarantineJson.count,
  sourceGeneratorAvailable: catalogJson.metadata.sourceGeneratorAvailable,
});
