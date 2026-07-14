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
import type { RuntimeOpeningNode } from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";

export function extractDeterministicFindings(input: {
  userId: string;
  game: ProviderGameRecord;
  segment: OpeningSegmentRecord;
  plies: readonly ReplayedPly[];
  nodes: readonly RuntimeOpeningNode[];
  access: OpeningAccessSnapshot;
}): ExtractedFinding[] {
  const nodeByFen = new Map(input.nodes.map((node) => [node.playKey, node]));
  const findings: ExtractedFinding[] = [];
  for (const ply of input.plies) {
    if (!ply.isPlayerMove || ply.ply < input.segment.firstMatchedPly) continue;
    const playKey = input.plies
      .slice(0, Math.max(0, ply.ply - 1))
      .map((entry) => entry.moveUci)
      .join(",");
    const node =
      nodeByFen.get(playKey) ??
      nodeByFen.get(ply.fenBefore.split(" ").slice(0, 4).join(" ")) ??
      nodeByFen.get(ply.fenBefore);
    if (!node || node.openingId !== input.segment.openingId) continue;
    const expectedMove = node.playSequenceUci
      .split(/[\s,]+/)
      .filter(Boolean)
      .at(-1);
    const isExpected = expectedMove === ply.moveUci;
    if (isExpected) continue;
    const position = createPositionIdentity({
      canonicalFen: ply.fenBefore,
      openingId: input.segment.openingId,
      expectedMoveUci: expectedMove ?? null,
      repertoireSide: input.game.playerColor,
      moveOrderKey: node.playSequenceUci,
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
