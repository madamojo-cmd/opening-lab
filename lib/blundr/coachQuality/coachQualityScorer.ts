import type { CoachBenchmarkEvaluation, CoachBenchmarkFixture, CoachBenchmarkResult } from "./coachBenchmarkTypes";

function includesAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

function leaksMoveNotation(text: string): boolean {
  const lower = text.toLowerCase();
  if (/\b[a-h][1-8][a-h][1-8]\b/.test(lower)) return true;
  if (/\bo-o(-o)?\b/.test(lower)) return true;
  if (/\bplay\s+[nbrqk]?[a-h]?[1-8]?x?[a-h][1-8]\b/i.test(text)) return true;
  return false;
}

export function scoreCoachBenchmarkFixture(fixture: CoachBenchmarkFixture, evaluation: CoachBenchmarkEvaluation): CoachBenchmarkResult {
  const failures: string[] = [];
  const text = [evaluation.text ?? "", evaluation.mode ?? "", evaluation.intent ?? ""].join(" ").trim();

  if (fixture.expected.allowedCoachModes?.length && evaluation.mode && !fixture.expected.allowedCoachModes.includes(evaluation.mode as any)) {
    failures.push(`mode_not_allowed:${evaluation.mode}`);
  }
  if (fixture.expected.allowedLiveOpportunities?.length && evaluation.opportunity && !fixture.expected.allowedLiveOpportunities.includes(evaluation.opportunity as any)) {
    failures.push(`opportunity_not_allowed:${evaluation.opportunity}`);
  }
  if (fixture.expected.allowedIntents?.length && evaluation.intent && !fixture.expected.allowedIntents.includes(evaluation.intent as any)) {
    failures.push(`intent_not_allowed:${evaluation.intent}`);
  }

  if (evaluation.exactMoveAllowed !== fixture.expected.exactMoveAllowed) {
    failures.push(`exact_move_policy_mismatch:${evaluation.exactMoveAllowed}`);
  }

  const hasAnswerButton = evaluation.buttons.includes("answer");
  const hasPlanButton = evaluation.buttons.includes("show_plan");
  if (hasAnswerButton !== fixture.expected.shouldShowAnswerButton) failures.push(`answer_button_policy_mismatch:${hasAnswerButton}`);
  if (hasPlanButton !== fixture.expected.shouldShowPlanButton) failures.push(`plan_button_policy_mismatch:${hasPlanButton}`);

  if (typeof fixture.expected.shouldMarkReviewWorthy === "boolean") {
    if (Boolean(evaluation.shouldMarkReviewWorthy) !== fixture.expected.shouldMarkReviewWorthy) {
      failures.push(`review_mark_policy_mismatch:${Boolean(evaluation.shouldMarkReviewWorthy)}`);
    }
  }

  if (fixture.expected.shouldStaySilent && !evaluation.silent) failures.push("expected_silence_not_respected");
  if (!fixture.expected.shouldStaySilent && evaluation.silent && fixture.bookStatus !== "in_book") failures.push("unexpected_silence");

  if (fixture.expected.forbiddenTerms.length && includesAny(text, fixture.expected.forbiddenTerms)) {
    failures.push("forbidden_term_detected");
  }

  if (fixture.viewMode === "plain" && !fixture.userState.answerShown && !fixture.userState.hintUsed && leaksMoveNotation(text)) {
    failures.push("plain_view_answer_leak");
  }

  if (fixture.bookStatus !== "in_book" && !fixture.expected.exactMoveAllowed && hasAnswerButton) {
    failures.push("out_of_book_answer_button_leak");
  }

  if (fixture.expected.forbiddenClaimTypes?.length) {
    const blocked = evaluation.claimTypes.filter((claim) => fixture.expected.forbiddenClaimTypes?.includes(claim as any));
    if (blocked.length) failures.push(`forbidden_claim_type:${blocked.join(",")}`);
  }

  if (!evaluation.silent && text && !/bishop|rook|king|pawn|f7|d4|e4|center|e-file|diagonal|safety|break|pressure|development|target|plan|activity|open file|least active/i.test(text)) {
    failures.push("copy_lacks_concrete_object");
  }

  if ((evaluation.text ?? "").length > 160) failures.push("copy_too_long");

  const score = Math.max(0, 100 - failures.length * 10);
  return {
    fixtureId: fixture.id,
    passed: failures.length === 0,
    score,
    failures,
    selectedMode: evaluation.mode,
    selectedOpportunity: evaluation.opportunity,
    selectedIntent: evaluation.intent,
    selectedText: evaluation.text,
    selectedButtons: evaluation.buttons,
    exactMoveAllowed: evaluation.exactMoveAllowed,
    claimTypes: evaluation.claimTypes,
  };
}
