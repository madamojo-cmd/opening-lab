import "server-only";
import type { ExtractedFinding } from "./gameDataTypes";
import { appendLearningEventV2 } from "@/lib/blundr/learning/core/learningEventService.server";
import { buildImportedFindingLearningEventInput } from "./importedFindingProjection";

export async function projectImportedFinding(
  userId: string,
  finding: ExtractedFinding,
): Promise<void> {
  const input = buildImportedFindingLearningEventInput(userId, finding);
  if (!input) return;
  await appendLearningEventV2(input);
}
