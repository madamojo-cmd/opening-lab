import type {
  Stage2RuntimeBookIndex,
  Stage2RuntimeBookLoadResult,
  Stage2RuntimeBookMove,
  Stage2RuntimeBookNode,
} from "./runtimeBookTypes";

function nodeKey(openingId: string, playKey: string): string {
  return `${openingId}::${playKey}`;
}

function moveKey(openingId: string, playKeyBefore: string): string {
  return `${openingId}::${playKeyBefore}`;
}

function rankSortValue(move: Stage2RuntimeBookMove): number {
  if (typeof move.rank === "number" && Number.isFinite(move.rank)) return move.rank;
  return Number.POSITIVE_INFINITY;
}

function totalGamesSortValue(move: Stage2RuntimeBookMove): number {
  if (typeof move.totalGames === "number" && Number.isFinite(move.totalGames)) return move.totalGames;
  return Number.NEGATIVE_INFINITY;
}

export function buildStage2RuntimeBookIndex(loadResult: Stage2RuntimeBookLoadResult): Stage2RuntimeBookIndex {
  const nodeIndexByOpeningAndPlayKey = new Map<string, Stage2RuntimeBookNode>();
  const moveIndexByOpeningAndPlayKeyBefore = new Map<string, Stage2RuntimeBookMove[]>();
  const openingIds = new Set<string>();
  const maxPlyByOpening = new Map<string, number>();

  for (const nodeRow of loadResult.nodes) {
    const node = { ...nodeRow };
    const openingId = String(node.openingId ?? "");
    if (!openingId) continue;
    openingIds.add(openingId);

    const ply = typeof node.ply === "number" && Number.isFinite(node.ply) ? node.ply : undefined;
    if (ply != null) {
      const prev = maxPlyByOpening.get(openingId) ?? Number.NEGATIVE_INFINITY;
      if (ply > prev) maxPlyByOpening.set(openingId, ply);
    }

    if (typeof node.playKey === "string") {
      nodeIndexByOpeningAndPlayKey.set(nodeKey(openingId, node.playKey), node);
    }
  }

  for (const moveRow of loadResult.moves) {
    const move = { ...moveRow };
    const openingId = String(move.openingId ?? "");
    if (!openingId) continue;
    openingIds.add(openingId);
    const playKeyBefore = typeof move.playKeyBefore === "string" ? move.playKeyBefore : "";
    const key = moveKey(openingId, playKeyBefore);
    const group = moveIndexByOpeningAndPlayKeyBefore.get(key) ?? [];
    group.push(move);
    moveIndexByOpeningAndPlayKeyBefore.set(key, group);
  }

  for (const [key, group] of moveIndexByOpeningAndPlayKeyBefore) {
    const withOrder = group.map((move, index) => ({ move, index }));
    withOrder.sort((a, b) => {
      const rankDelta = rankSortValue(a.move) - rankSortValue(b.move);
      if (rankDelta !== 0) return rankDelta;
      const gamesDelta = totalGamesSortValue(b.move) - totalGamesSortValue(a.move);
      if (gamesDelta !== 0) return gamesDelta;
      return a.index - b.index;
    });
    moveIndexByOpeningAndPlayKeyBefore.set(
      key,
      withOrder.map((entry) => entry.move),
    );
  }

  const maxPlyByOpeningRecord: Record<string, number> = {};
  for (const [openingId, maxPly] of maxPlyByOpening) {
    maxPlyByOpeningRecord[openingId] = maxPly;
  }

  return {
    packageRoot: loadResult.packageRoot,
    runtimeDir: loadResult.runtimeDir,
    nodeCount: loadResult.nodes.length,
    moveCount: loadResult.moves.length,
    openingIds: [...openingIds].sort(),
    maxPlyByOpening: maxPlyByOpeningRecord,
    nodeIndexByOpeningAndPlayKey,
    moveIndexByOpeningAndPlayKeyBefore,
  };
}
