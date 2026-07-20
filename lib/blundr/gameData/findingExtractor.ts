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

export function extractDeterministicFindings(input: {
  userId: string;
  game: ProviderGameRecord;
  segment: OpeningSegmentRecord;
  plies: readonly ReplayedPly[];
  trainer: TrainerTreeIndex;
  access: OpeningAccessSnapshot;
}): ExtractedFinding[] {
  const findings: ExtractedFinding[] = [];
  for (const ply of input.plies) {
    if (!ply.isPlayerMove || ply.ply < input.segment.firstMatchedPly) continue;
    const playKey = input.plies
      .slice(0, Math.max(0, ply.ply - 1))
      .map((entry) => entry.moveUci)
      .join(",");
    const runtimeKey = `${input.segment.openingId}:${playKey}`;
    const node = input.trainer.nodesByKey.get(runtimeKey);
    if (!node) continue;
    const approvedMoves =
      input.trainer.childMovesByParent.get(runtimeKey) ?? [];
    // A finding is only verifiable when the current position and at least one
    // next move are backed by stored Trainer nodes. Candidate-only evidence
    // must never manufacture path progression or imported-game weaknesses.
    if (approvedMoves.length === 0) continue;
    if (approvedMoves.some((candidate) => candidate.moveUci === ply.moveUci))
      continue;
    const expectedMove = approvedMoves[0]?.moveUci ?? null;
    const position = createPositionIdentity({
      canonicalFen: ply.fenBefore,
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
    });
    findings.push({
      findingId: fingerprint,
      fingerprint,
      gameFingerprint: input.game.fallbackFingerprint,
      segmentId: input.segment.segmentId,
      position,
      category: "opening_move",
      confidence: input.game.timeControl?.toLowerCase().includes("blitz")
        ? 0.2
        : 0.45,
      severity: "medium",
      source: {
        source: "imported_game",
        sourceId:
          input.game.providerFingerprint ?? input.game.fallbackFingerprint,
        observedAt: input.game.playedAt,
        firstAttempt: true,
        metadata: { ply: ply.ply, provider: input.game.provider },
      },
      evidence: {
        source: "imported_game",
        sourceId:
          input.game.providerFingerprint ?? input.game.fallbackFingerprint,
        observedAt: input.game.playedAt,
        firstAttempt: true,
        metadata: { ply: ply.ply, provider: input.game.provider },
      },
      explanation:
        "The imported game diverged from the approved repertoire move at this position.",
      recommendedDailyIntervention: "review_position",
      status: input.access.decision === "active" ? "active" : "gated_pending",
    });
  }
  return findings;
}
