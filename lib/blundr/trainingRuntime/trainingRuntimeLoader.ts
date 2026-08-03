// Server/request-time loader for the built versioned runtime package only.
import "server-only";
import path from "node:path";
import {
  loadVerifiedTrainingRuntimePackage,
  type TrainingRuntimePackage,
} from "./trainingRuntimePackage";
export type { TrainingRuntimePackage } from "./trainingRuntimePackage";
import { TRAINING_RUNTIME_PACKAGE_ROOT } from "./trainingRuntimeSchema";

const PACKAGE_ROOT = path.resolve(process.cwd(), TRAINING_RUNTIME_PACKAGE_ROOT);
const cache = new Map<string, Promise<TrainingRuntimePackage>>();

export function loadTrainingRuntimePackage(
  packageRoot = PACKAGE_ROOT,
): Promise<TrainingRuntimePackage> {
  const existing = cache.get(packageRoot);
  if (existing) return existing;
  const loading = loadVerifiedTrainingRuntimePackage({ packageRoot });
  cache.set(packageRoot, loading);
  return loading;
}
