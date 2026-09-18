import {
  createDeterministicIdentity,
  type OpeningAccessSnapshot,
} from "@/lib/blundr/contracts";
import type {
  ReplayedPly,
  OpeningSegmentRecord,
  ProviderGameRecord,
} from "./gameDataTypes";
import type { RuntimeOpeningNode } from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { canonicalPositionFen } from "@/lib/blundr/chess/canonicalPosition";

export type SegmentMatchInput = {
  game: ProviderGameRecord;
  plies: readonly ReplayedPly[];
  nodes: readonly RuntimeOpeningNode[];
  access: (openingId: string, side: "white" | "black") => OpeningAccessSnapshot;
};

export function matchOpeningSegments(
  input: SegmentMatchInput,
): OpeningSegmentRecord[] {
  const byPlayKey = new Map<string, RuntimeOpeningNode[]>();
  const byCanonicalFen = new Map<string, RuntimeOpeningNode[]>();
  for (const node of input.nodes) {
    const playKeyList = byPlayKey.get(node.playKey) ?? [];
    playKeyList.push(node);
    byPlayKey.set(node.playKey, playKeyList);
    if (node.canonicalFen) {
      const key = canonicalPositionFen(node.canonicalFen);
      const fenList = byCanonicalFen.get(key) ?? [];
      fenList.push(node);
      byCanonicalFen.set(key, fenList);
    }
  }
  const segments: OpeningSegmentRecord[] = [];
  for (const ply of input.plies) {
    const playKey = input.plies
      .slice(0, Math.max(0, ply.ply - 1))
      .map((entry) => entry.moveUci)
      .join(",");
    const candidates = [
      ...(byPlayKey.get(playKey) ?? []),
      ...(byCanonicalFen.get(ply.canonicalFenBefore) ?? []),
    ].filter(
      (node, index, nodes) =>
        nodes.findIndex(
          (entry) =>
            entry.openingId === node.openingId &&
            entry.playKey === node.playKey,
        ) === index,
    );
    for (const node of candidates) {
      const side = input.game.playerColor;
      if (node.sideToMove !== side) continue;
      const access = input.access(node.openingId, side);
      const segmentId = createDeterministicIdentity("segment", [
        input.game.fallbackFingerprint,
        node.openingId,
        side,
        node.playKey,
      ]);
      const existing = segments.find(
        (segment) => segment.segmentId === segmentId,
      );
      if (existing) {
        existing.lastMatchedPly = Math.max(existing.lastMatchedPly, ply.ply);
        continue;
      }
      segments.push({
        segmentId,
        gameFingerprint:
          input.game.providerFingerprint ?? input.game.fallbackFingerprint,
        openingId: node.openingId,
        repertoireSide: side,
        firstMatchedPly: ply.ply,
        lastMatchedPly: ply.ply,
        divergencePly: null,
        runtimeVersion: input.game.processingVersion,
        accessState: access.decision,
      });
    }
  }
  return segments;
}
