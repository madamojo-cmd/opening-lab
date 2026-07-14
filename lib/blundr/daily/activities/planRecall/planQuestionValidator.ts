import type { PlanQuestion } from "./planRecallTypes";
export function validatePlanQuestion(question: PlanQuestion): string[] {
  const errors: string[] = [];
  if (!question.prompt.trim()) errors.push("missing_prompt");
  if (!question.choices.length) errors.push("missing_choices");
  if (!question.acceptedIds.length) errors.push("missing_answer");
  if (
    !question.acceptedIds.every((id) =>
      question.choices.some((choice) => choice.id === id),
    )
  )
    errors.push("answer_not_in_choices");
  if (!question.evidence.verified) errors.push("unverified_evidence");
  return errors;
}
