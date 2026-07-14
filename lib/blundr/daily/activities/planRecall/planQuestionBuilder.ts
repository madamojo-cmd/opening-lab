import {
  buildActivityIdentity,
  rejection,
  type ActivityBuildResult,
} from "@/lib/blundr/daily/core/dailyActivityConformance";
import { validateActivityAccess } from "../activityUtils";
import type { PlanQuestion, PlanRecallSolution } from "./planRecallTypes";
export function buildPlanRecall(input: {
  openingId: string;
  side: "white" | "black";
  positionKey: string;
  positionFen: string;
  access: {
    decision: string;
    checkedAt: string;
    expiresAt: string | null;
  } | null;
  question: PlanQuestion;
}): ActivityBuildResult<PlanRecallSolution> {
  const accessError = validateActivityAccess({ access: input.access });
  if (accessError) return accessError;
  if (
    !input.question.validForFen ||
    !input.question.evidence.verified ||
    !input.question.choices.length ||
    !input.question.acceptedIds.length
  )
    return rejection(
      "missing_approved_content",
      "No validated plan question is available.",
    );
  if (
    !input.question.acceptedIds.every((id) =>
      input.question.choices.some((choice) => choice.id === id),
    )
  )
    return rejection("invalid_content", "The plan answer set is inconsistent.");
  return {
    ok: true,
    activityId: "daily_plan_recall",
    schemaVersion: "2026-07-13.v1",
    generatorVersion: "plan-recall-generator-v1",
    validatorVersion: "plan-recall-validator-v1",
    cardFingerprint: buildActivityIdentity(
      "daily_plan_recall",
      input.positionKey,
      input.question.evidence.sourceId,
    ),
    positionKey: input.positionKey,
    openingId: input.openingId,
    side: input.side,
    evidence: [input.question.evidence],
    solution: { question: input.question },
  };
}
