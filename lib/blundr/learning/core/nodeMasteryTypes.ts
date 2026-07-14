import type {
  LearningEventV2,
  NodeMasteryReadModel,
  OpeningAccessDecision,
} from "@/lib/blundr/contracts";

export type NodeMasteryState = NodeMasteryReadModel & {
  userId: string;
  access: OpeningAccessDecision;
};
export type MasteryReductionResult = {
  state: NodeMasteryState;
  changed: boolean;
};
export type MasteryEvidence = Pick<
  LearningEventV2,
  "eventId" | "occurredAt" | "firstAttempt" | "taxonomy" | "source"
>;
