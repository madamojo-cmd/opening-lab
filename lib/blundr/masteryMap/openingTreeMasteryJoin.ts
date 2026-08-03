import type {
  NodeMasteryReadModel,
  WeaknessProjection,
} from "@/lib/blundr/contracts";
import type { RuntimeOpeningNode } from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import {
  parentRuntimePlayKey,
  RUNTIME_STARTPOS_PLAY_KEY,
} from "@/lib/blundr/trainingRuntime/runtimePlayKey";
import { resolveMasteryStatus } from "./masteryStatusPolicy";
import type { MasteryMapNode } from "./masteryMapTypes";

export type MasteryMapEvidence = {
  positionKey: string;
  evidenceCount: number;
  importedGameEvidenceCount: number;
  alternateRoute: boolean;
};

function runtimeCoordinate(
  openingId: string | null | undefined,
  playKey: string | null | undefined,
): string | null {
  const opening = String(openingId ?? "").trim();
  const play = String(playKey ?? "").trim();
  return opening && play ? `${opening}:${play}` : null;
}

export function joinOpeningTreeToMastery(input: {
  openingId: string;
  runtimeNodes: readonly RuntimeOpeningNode[];
  mastery: readonly NodeMasteryReadModel[];
  weaknesses: readonly WeaknessProjection[];
  evidence?: readonly MasteryMapEvidence[];
  now?: number;
}): MasteryMapNode[] {
  const masteryByCoordinate = new Map(
    input.mastery.flatMap((row) => {
      const coordinate = runtimeCoordinate(row.openingId, row.playKey);
      return coordinate ? [[coordinate, row] as const] : [];
    }),
  );
  const weaknessByCoordinate = new Map(
    input.weaknesses.flatMap((row) => {
      const coordinate = runtimeCoordinate(row.openingId, row.playKey);
      return coordinate ? [[coordinate, row] as const] : [];
    }),
  );
  const evidenceByKey = new Map(
    (input.evidence ?? []).map((row) => [row.positionKey, row]),
  );
  const now = input.now ?? Date.now();
  const nodes = input.runtimeNodes
    .filter((node) => node.openingId === input.openingId)
    .map((runtimeNode) => {
      const coordinate = runtimeCoordinate(
        runtimeNode.openingId,
        runtimeNode.playKey,
      )!;
      const mastery = masteryByCoordinate.get(coordinate);
      const weakness = weaknessByCoordinate.get(coordinate);
      const positionKey = String(
        mastery?.positionKey ??
          weakness?.positionKey ??
          runtimeNode.positionKey ??
          "",
      );
      const evidence = evidenceByKey.get(positionKey);
      const confidence = Math.max(
        0,
        Math.min(1, Number(mastery?.confidence ?? weakness?.confidence ?? 0)),
      );
      const first = mastery?.firstAttemptResult ?? null;
      const due = Boolean(
        mastery?.updatedAt &&
          Date.parse(mastery.updatedAt) + 7 * 86_400_000 <= now,
      );
      const status = resolveMasteryStatus({
        repeatedLapse: Boolean(
          weakness && weakness.score >= 0.7 && weakness.confidence >= 0.65,
        ),
        weak: Boolean(weakness && weakness.confidence >= 0.5),
        due,
        learning: Boolean(mastery && mastery.attempts > 0 && confidence < 0.75),
        mastered: Boolean(
          mastery && mastery.attempts >= 2 && confidence >= 0.8,
        ),
      });
      return {
        nodeId: runtimeNode.nodeId,
        positionKey,
        openingId: input.openingId,
        sanSequence: String(runtimeNode.playSequenceUci ?? runtimeNode.playKey)
          .split(",")
          .filter(Boolean),
        status,
        confidence,
        lastFirstAttemptResult: first,
        nextDueAt: due ? new Date(now).toISOString() : null,
        evidenceCount:
          evidence?.evidenceCount ?? (mastery ? mastery.attempts : 0),
        importedGameEvidenceCount: evidence?.importedGameEvidenceCount ?? 0,
        weaknessExplanation: weakness?.explanation ?? null,
        recommendedDailyIntervention:
          weakness?.recommendedDailyIntervention ?? null,
        alternateRoute: evidence?.alternateRoute ?? false,
        childCount: 0,
        access: weakness?.access ?? "active",
      } satisfies MasteryMapNode;
    });
  const childCounts = new Map<string, number>();
  for (const node of nodes) {
    const playKey = node.sanSequence.length
      ? node.sanSequence.join(",")
      : RUNTIME_STARTPOS_PLAY_KEY;
    const parent = parentRuntimePlayKey(playKey);
    if (parent) childCounts.set(parent, (childCounts.get(parent) ?? 0) + 1);
  }
  return nodes.map((node) => ({
    ...node,
    childCount:
      childCounts.get(
        node.sanSequence.length
          ? node.sanSequence.join(",")
          : RUNTIME_STARTPOS_PLAY_KEY,
      ) ?? 0,
  }));
}
