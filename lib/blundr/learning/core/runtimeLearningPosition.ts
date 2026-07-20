import { Chess } from "chess.js";
import { resolveStage2CanonicalOpeningId } from "@/lib/blundr/openings/openingIdentity";
import type { TrainerTreeIndex } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";

export type RuntimeLearningPositionInput = {
  openingId: string | null;
  moveOrderKey: string | null;
  canonicalFen: string;
  expectedMoveUci?: string | null;
};

export type VerifiedRuntimeLearningPosition = {
  openingId: string;
  moveOrderKey: string;
  canonicalFen: string;
  expectedMoveUci: string | null;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeFen(value: unknown): string {
  return normalizeText(value).split(/\s+/).slice(0, 4).join(" ");
}

function fenForSequence(sequence: string): string | null {
  try {
    const chess = new Chess();
    for (const move of normalizeText(sequence)
      .split(/[\s,]+/)
      .filter(Boolean)) {
      chess.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move[4] as "q" | "r" | "b" | "n" | undefined,
      });
    }
    return chess.fen();
  } catch {
    return null;
  }
}

export function verifyRuntimeLearningPosition(
  input: RuntimeLearningPositionInput,
  trainer: TrainerTreeIndex,
): VerifiedRuntimeLearningPosition | null {
  const openingId = resolveStage2CanonicalOpeningId(input.openingId ?? "");
  const moveOrderKey = normalizeText(input.moveOrderKey);
  const requestedFen = normalizeFen(input.canonicalFen);
  const expectedMoveUci = normalizeText(input.expectedMoveUci) || null;
  if (!openingId || !requestedFen) return null;
  const node = trainer.nodesByKey.get(`${openingId}:${moveOrderKey}`);
  if (!node) return null;
  if (
    expectedMoveUci &&
    !(
      trainer.childMovesByParent.get(`${openingId}:${moveOrderKey}`) ?? []
    ).some((candidate) => candidate.moveUci === expectedMoveUci)
  )
    return null;
  const runtimeFen = fenForSequence(node.playSequenceUci);
  if (!runtimeFen || normalizeFen(runtimeFen) !== requestedFen) return null;
  return {
    openingId,
    moveOrderKey,
    canonicalFen: runtimeFen,
    expectedMoveUci,
  };
}
