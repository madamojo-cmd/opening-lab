import {
  createPositionIdentity,
  type OpeningAccessSnapshot,
} from "@/lib/blundr/contracts";
import { findingFingerprint } from "./gameFingerprint";
import type {
  ExtractedFinding,
  OpeningSegmentRecord,
  ProviderGameRecord,
  ReplayedPly,
} from "./gameDataTypes";
import type { TrainerTreeIndex } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";
import type { RuntimeOpeningNode } from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { canonicalPositionFen } from "@/lib/blundr/chess/canonicalPosition";

function nodesByCanonicalFen(
  trainer: TrainerTreeIndex,
): ReadonlyMap<string, readonly RuntimeOpeningNode[]> {
  const map = new Map<string, RuntimeOpeningNode[]>();
  for (const node of trainer.nodesByKey.values()) {
    if (!node.canonicalFen) continue;
    const key = canonicalPositionFen(node.canonicalFen);
    map.set(key, [...(map.get(key) ?? []), node]);
  }
  return map;
}

function nodeForPly(input: {
  segment: OpeningSegmentRecord;
  ply: ReplayedPly;
  plies: readonly ReplayedPly[];
  trainer: TrainerTreeIndex;
  canonicalNodes: ReadonlyMap<string, readonly RuntimeOpeningNode[]>;
}): RuntimeOpeningNode | null {
  const playKey = input.plies
    .slice(0, Math.max(0, input.ply.ply - 1))
    .map((entry) => entry.moveUci)
    .join(",");
  const exact = input.trainer.nodesByKey.get(
    `${input.segment.openingId}:${playKey}`,
  );
  if (exact) return exact;
  return (
    input.canonicalNodes
      .get(input.ply.canonicalFenBefore)
      ?.find(
        (node) =>
          node.openingId === input.segment.openingId &&
          node.sideToMove === input.ply.sideToMove,
      ) ?? null
  );
}

function clampImportWeight(value: number): number {
  return Math.max(-0.2, Math.min(1.5, value));
}

export function extractDeterministicFindings(input: {
  userId: string;
  game: ProviderGameRecord;
  segment: OpeningSegmentRecord;
  plies: readonly ReplayedPly[];
  trainer: TrainerTreeIndex;
  access: OpeningAccessSnapshot;
}): ExtractedFinding[] {
  const findings: ExtractedFinding[] = [];
  const canonicalNodes = nodesByCanonicalFen(input.trainer);
  for (const ply of input.plies) {
    if (!ply.isPlayerMove || ply.ply < input.segment.firstMatchedPly) continue;
    const node = nodeForPly({
      segment: input.segment,
      ply,
      plies: input.plies,
      trainer: input.trainer,
      canonicalNodes,
    });
    if (!node) continue;
    const runtimeKey = `${input.segment.openingId}:${node.playKey}`;
    const approvedMoves =
      input.trainer.childMovesByParent.get(runtimeKey) ?? [];
    // A finding is only verifiable when the current position and at least one
    // next move are backed by stored Trainer nodes. Candidate-only evidence
    // must never manufacture path progression or imported-game weaknesses.
    if (approvedMoves.length === 0) continue;
    const expectedMove = approvedMoves[0]?.moveUci ?? null;
    const playedApprovedIndex = approvedMoves.findIndex(
      (candidate) => candidate.moveUci === ply.moveUci,
    );
    const outcome =
      playedApprovedIndex === 0
        ? "followed_known_repertoire"
        : playedApprovedIndex > 0
          ? "alternate_unlocked_continuation"
          : expectedMove
            ? "missed_known_move"
            : "deviated_from_repertoire";
    const isPositive =
      outcome === "followed_known_repertoire" ||
      outcome === "alternate_unlocked_continuation";
    const position = createPositionIdentity({
      canonicalFen: node.canonicalFen ?? ply.canonicalFenBefore,
      openingId: input.segment.openingId,
      expectedMoveUci: expectedMove,
      repertoireSide: input.game.playerColor,
      moveOrderKey: node.playKey,
      runtimePackageVersion: input.game.processingVersion,
    });
    const fingerprint = findingFingerprint({
      userId: input.userId,
      gameFingerprint: input.game.fallbackFingerprint,
      segmentId: input.segment.segmentId,
      positionKey: position.positionKey,
      category: "opening_move",
      outcome,
      userMoveUci: ply.moveUci,
    });
    const timeConfidence = input.game.timeControl
      ?.toLowerCase()
      .includes("blitz")
      ? 0.2
      : 0.45;
    const importWeight = clampImportWeight(
      isPositive
        ? -0.1
        : timeConfidence + (outcome === "missed_known_move" ? 0.35 : 0.2),
    );
    findings.push({
      findingId: fingerprint,
      fingerprint,
      gameFingerprint: input.game.fallbackFingerprint,
      segmentId: input.segment.segmentId,
      position,
      category: "opening_move",
      confidence: isPositive ? 0.3 : timeConfidence,
      severity: isPositive ? "low" : "medium",
      source: {
        source: "imported_game",
        sourceId:
          input.game.providerFingerprint ?? input.game.fallbackFingerprint,
        observedAt: input.game.playedAt,
        firstAttempt: true,
        metadata: {
          ply: ply.ply,
          provider: input.game.provider,
          terminationReason: input.game.terminationReason,
          outcome,
          userMoveUci: ply.moveUci,
        },
      },
      evidence: {
        source: "imported_game",
        sourceId:
          input.game.providerFingerprint ?? input.game.fallbackFingerprint,
        observedAt: input.game.playedAt,
        firstAttempt: true,
        metadata: {
          ply: ply.ply,
          provider: input.game.provider,
          terminationReason: input.game.terminationReason,
          outcome,
          userMoveUci: ply.moveUci,
        },
      },
      explanation:
        outcome === "followed_known_repertoire"
          ? "The imported game followed the preferred unlocked repertoire move at this position."
          : outcome === "alternate_unlocked_continuation"
            ? "The imported game used another unlocked repertoire continuation at this position."
            : "The imported game missed an unlocked repertoire move at this position.",
      recommendedDailyIntervention: isPositive ? "none" : "review_position",
      status: input.access.decision === "active" ? "active" : "gated_pending",
      outcome,
      userMoveUci: ply.moveUci,
      expectedMoveSet: approvedMoves.map((candidate) => candidate.moveUci),
      importWeight,
    });
  }
  return findings;
}
