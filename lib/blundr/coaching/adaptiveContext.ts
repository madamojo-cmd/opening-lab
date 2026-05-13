import type { BlundrContext } from "../featurePacketBuilder";
import { chooseExplanationMode, type CoachingMemoryInput } from "./coachingMemory";
import { renderContextVariant } from "./contextVariants";

export type AdaptiveContextInput = {
  base: BlundrContext;
  concept?: string;
  selectedMove?: string;
  trainingPhase?: string;
  userRatingBucket?: string;
  memory?: CoachingMemoryInput;
};

export function buildAdaptiveContext(input: AdaptiveContextInput): BlundrContext {
  const concept = input.concept ?? input.base.concept;
  const selectedMove = input.selectedMove ?? input.base.selectedMove;
  const explanationKey = `${concept ?? "concept"}:${selectedMove ?? "move"}:${input.trainingPhase ?? "phase"}`;
  const explanationMode = chooseExplanationMode(input.memory, input.trainingPhase, explanationKey);

  return renderContextVariant({
    base: input.base,
    concept,
    selectedMove,
    trainingPhase: input.trainingPhase,
    userRatingBucket: input.userRatingBucket,
    explanationMode,
  });
}
