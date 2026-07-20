import "server-only";

import { createRuntimeEvidenceIndices } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";
import { loadTrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";
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
