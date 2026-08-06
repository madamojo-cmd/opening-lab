import "server-only";

import { createRuntimeEvidenceIndices } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";
import { loadTrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";
import { Chess } from "chess.js";
import {
  verifyRuntimeLearningPosition,
  type RuntimeLearningPositionInput,
  type VerifiedRuntimeLearningPosition,
} from "./runtimeLearningPosition";

let trainerIndexPromise: Promise<
  ReturnType<typeof createRuntimeEvidenceIndices>["trainer"]
> | null = null;

async function getTrainerIndex() {
  trainerIndexPromise ??= loadTrainingRuntimePackage().then(
    (runtime) =>
      createRuntimeEvidenceIndices(runtime.nodes, runtime.candidates).trainer,
  );
  return trainerIndexPromise;
}

export async function resolveVerifiedRuntimeLearningPosition(
  input: RuntimeLearningPositionInput,
): Promise<VerifiedRuntimeLearningPosition | null> {
  const trainer = await getTrainerIndex();
  return verifyRuntimeLearningPosition(input, trainer);
}

/** Coordinate-only resolution is intentionally server-only and is used by Review
 * to derive the FEN and answer from the shipped runtime, never a queue row. */
export async function resolveRuntimeReviewPosition(input: {
  openingId: string;
  moveOrderKey: string;
}): Promise<VerifiedRuntimeLearningPosition | null> {
  const trainer = await getTrainerIndex();
  const node = trainer.nodesByKey.get(
    `${input.openingId}:${input.moveOrderKey}`,
  );
  if (!node) return null;
  try {
    const chess = new Chess();
    for (const move of node.playSequenceUci.split(",").filter(Boolean))
      chess.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move[4] as "q" | "r" | "b" | "n" | undefined,
      });
    const expected =
      trainer.childMovesByParent.get(
        `${input.openingId}:${input.moveOrderKey}`,
      )?.[0]?.moveUci ?? null;
    return {
      openingId: input.openingId,
      moveOrderKey: input.moveOrderKey,
      canonicalFen: chess.fen(),
      expectedMoveUci: expected,
    };
  } catch {
    return null;
  }
}
