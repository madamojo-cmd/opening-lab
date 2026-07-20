import type { LearningEventV2 } from "@/lib/blundr/contracts";

export function shouldCreateWeaknessProjection(input: {
  taxonomy: LearningEventV2["taxonomy"];
  correct: boolean;
}): boolean {
  return (
    input.taxonomy === "move_incorrect" ||
    input.taxonomy === "cue_revealed" ||
    input.taxonomy === "daily_revealed" ||
    input.taxonomy === "finding_recorded" ||
    (input.taxonomy === "daily_answered" && !input.correct)
  );
}
