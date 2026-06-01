import { getCoachCopyEntries, normalizeConceptId } from "./coachCopyLibrary";
import { chooseHintLevel } from "./coachHintEngine";
import { validateCoachDecision } from "./coachSafety";
import type { CoachAction, CoachButton, CoachContext, CoachDecision, CoachDecisionInput, CoachMode } from "./coachTypes";
import { selectCoachCopyVariant } from "./coachVariationPolicy";
import { buildCoachEvidencePacket } from "../coachBrain/coachEvidenceBuilder";
import { buildCoachCopyFromEvidence } from "../coachBrain/evidenceConditionedCopyBuilder";
import { resolveCoachAction } from "../coachBrain/coachActionResolver";
import { decideIntentFirstCoach } from "./intentFirstCoachEngine";

function quiet(reason: string, debug?: Record<string, unknown>): CoachDecision {
  return {
    mode: "suppressed",
    action: "stay_quiet",
    buttons: [],
    shouldShowCoachCard: false,
    shouldMarkReviewWorthy: false,
    revealRisk: "none",
    givesAnswer: false,
    claimTypes: [],
    suppressedReason: reason,
    debug,
  };
}

function deriveMode(context: CoachContext, input: CoachDecisionInput): CoachMode {
  if (context.bookStatus !== "in_book") {
    return context.exactMoveAllowed ? "supported_continuation" : "freeplay_principle";
  }
  if (input.outcome === "correct") {
    return context.elapsedMs <= 8000 ? "correct_fast" : "correct_slow";
  }
  if (context.viewMode === "assisted") {
    if (input.outcome === "wrong" || context.wrongAttempts > 0) return "assisted_wrong_move";
    return "assisted_teach";
  }
  if (context.answerShown || context.revealState === "revealed") return "plain_answer_revealed";
  if (input.outcome === "wrong" || context.wrongAttempts > 0) return "plain_wrong_move";
  return "plain_prompt";
}

function deriveAction(context: CoachContext, mode: CoachMode, input: CoachDecisionInput): { action: CoachAction; hintStrength?: string } {
  if (input.interaction === "answer" || input.interaction === "show_move") return { action: "show_answer" };
  if (input.interaction === "show_plan" || input.interaction === "analyze_idea") return { action: "show_plan" };
  if (input.interaction === "hint") {
    const level = chooseHintLevel(context, input.hintRequestCount);
    if (level === "soft_hint") return { action: "show_soft_hint", hintStrength: level };
    if (level === "strong_hint") return { action: "show_strong_hint", hintStrength: level };
    return { action: "show_answer", hintStrength: level };
  }

  if (mode === "correct_fast" || mode === "correct_slow" || mode === "assisted_reinforce") return { action: "show_reinforcement" };
  if (mode === "supported_continuation" || mode === "freeplay_principle") return { action: "show_plan" };
  return { action: "show_explanation" };
}

function buttonsFor(mode: CoachMode, context: CoachContext): CoachButton[] {
  // v2.7.40: buttonsFor now only returns VisibleCoachAction canonicals or [].
  // Legacy (show_plan, analyze_idea, show_move, answer, why, replay, hide, try_again) REMOVED from production button arrays.
  // Policy source of truth is visibleActionPolicy.getVisibleCoachActions; this is transitional shim.
  if (mode === "assisted_teach" || mode === "assisted_reinforce" || mode === "assisted_wrong_move") {
    return []; // assisted teaching: NO buttons per clean policy (visuals + coach text only)
  }
  if (context.bookStatus !== "in_book") {
    // out of book / continuation -> delegate to branch logic elsewhere; no clutter here
    return ["continue_from_here"];
  }
  if (mode === "plain_prompt" || mode === "plain_hint" || mode === "plain_wrong_move" || mode === "plain_answer_revealed") {
    // Plain teaching pre-ShowMore / pre-answer: ONLY hint + show_more (Show More introduced as first-class; full wiring Agent 4)
    if (context.answerShown || context.revealState === "revealed") {
      return [];
    }
    return ["hint", "show_more"] as unknown as CoachButton[]; // cast transitional until CoachButton union updated
  }
  return [];
}

function findEntry(context: CoachContext, mode: CoachMode, action: CoachAction, input: CoachDecisionInput) {
  const concept = normalizeConceptId(context.conceptId);

  const modeToQuery: CoachMode =
    action === "show_reinforcement"
      ? "assisted_reinforce"
      : action === "show_soft_hint" || action === "show_strong_hint"
        ? "plain_hint"
        : action === "show_answer"
          ? "plain_answer_revealed"
          : mode;

  const candidates = getCoachCopyEntries(concept, modeToQuery);
  if (!candidates.length) return null;
  return selectCoachCopyVariant(candidates, context.patternId ?? context.normalizedFen, input.utteranceMemory);
}

export function decideCoachOutput(input: CoachDecisionInput): CoachDecision {
  const context = input.context;
  if (!context) return quiet("missing_context");

  if (!context.recipeFrameMatchesBoard || !context.recipeFenMatchesBoard) return quiet("stale_context");
  if (!context.userToMove && context.viewMode !== "freeplay") return quiet("not_user_turn");

  const mode = deriveMode(context, input);
  if (mode === "suppressed") return quiet("suppressed_mode");

  const { action, hintStrength } = deriveAction(context, mode, input);

  if (
    context.viewMode === "plain" &&
    action === "show_answer" &&
    context.revealState === "hidden" &&
    input.interaction !== "answer" &&
    input.interaction !== "show_move"
  ) {
    return quiet("plain_answer_permission_required");
  }

  const trainingMode = input.brainInput?.trainingMode ?? (context.bookStatus === "in_book" ? "restricted" : "continuation");
  const packet = buildCoachEvidencePacket({
    frameId: context.frameId,
    trainerFrameId: input.brainInput?.trainerFrameId ?? context.frameId,
    fen: input.brainInput?.fen ?? context.fen,
    boardFen: input.brainInput?.fen ?? context.fen,
    viewMode: input.brainInput?.viewMode ?? (context.viewMode === "reveal" ? "assisted" : context.viewMode),
    trainingMode,
    bookStatus: input.brainInput?.bookStatus ?? context.bookStatus,
    visualRecipe: input.brainInput?.visualRecipe,
    trainingContext: input.brainInput?.trainingContext,
    teachingOrchestration: input.brainInput?.teachingOrchestration,
    expectedMoveUci: input.brainInput?.expectedMoveUci ?? context.moveUci,
    expectedMoveSan: input.brainInput?.expectedMoveSan ?? context.moveSan,
    selectedCandidateMoveUci: input.brainInput?.selectedCandidateMoveUci,
    selectedCandidateMoveSan: input.brainInput?.selectedCandidateMoveSan,
    enginePreview: input.brainInput?.enginePreview,
    repertoireMoves: input.brainInput?.repertoireMoves,
    lichessContinuationMoves: input.brainInput?.lichessContinuationMoves,
    maiaRaw: input.brainInput?.maiaRaw,
    stale: input.brainInput?.stale || !context.recipeFrameMatchesBoard || !context.recipeFenMatchesBoard,
  });

  const resolved = resolveCoachAction(packet, input.interaction as any);
  const intentFirst = decideIntentFirstCoach({
    packet,
    interaction: resolved.interaction,
    conceptId: context.conceptId,
    openingId: (input.brainInput?.teachingOrchestration as any)?.openingId ?? "italian",
    visualRecipeId: context.visualRecipeId,
  });
  const evidenceCopy = buildCoachCopyFromEvidence({
    packet,
    interaction: resolved.interaction,
    previousHintLevel: input.hintRequestCount,
    portionMetric: "volumetric",
  });

  const fallback = (() => {
    const selected = findEntry(context, mode, action, input);
    if (!selected) return null;
    const entry = selected.entry;
    return {
      body: entry.text,
      utteranceId: entry.utteranceId,
      utteranceFamily: entry.utteranceFamily,
      givesAnswer: entry.givesAnswer,
      revealRisk: entry.revealRisk,
      debugReason: selected.reason,
    };
  })();
  const preferIntentFirstCopy = intentFirst.shouldShow && packet.evidenceStatus !== "unavailable" && packet.evidenceStatus !== "stale";
  const preferFallbackCopy = !preferIntentFirstCopy && (packet.evidenceStatus === "unavailable" || packet.evidenceStatus === "stale");

  const modeTitle =
    mode === "assisted_teach" || mode === "assisted_reinforce" || mode === "assisted_wrong_move"
      ? "Opening pattern"
      : mode === "supported_continuation"
        ? "Suggested continuation"
        : "Position context";

  const decision: CoachDecision = {
    mode,
    action,
    frameId: context.frameId,
    normalizedFen: context.normalizedFen,
    title: preferIntentFirstCopy ? intentFirst.title : (evidenceCopy.title || modeTitle),
    body:
      (preferIntentFirstCopy ? intentFirst.body : undefined) ??
      (action === "show_soft_hint" || action === "show_strong_hint" ? (preferFallbackCopy ? fallback?.body : evidenceCopy.hint) : undefined) ??
      (preferFallbackCopy ? fallback?.body : evidenceCopy.body) ??
      fallback?.body,
    hint: action === "show_soft_hint" || action === "show_strong_hint" ? (preferFallbackCopy ? fallback?.body : evidenceCopy.hint) : undefined,
    answer: evidenceCopy.givesAnswer ? (preferFallbackCopy ? fallback?.body : evidenceCopy.answer ?? evidenceCopy.body) : undefined,
    why:
      context.conceptId === "develop_with_pressure"
        ? "Good opening moves often develop a piece while creating a concrete target."
        : context.conceptId === "castle_for_safety"
          ? "Castling moves the king away from the center and connects the rook."
          : context.conceptId === "prepare_center_break"
            ? "The c-pawn gives d4 extra support so the center break is more reliable."
            : context.conceptId === "rook_to_center"
              ? "Rooks become more useful when they support central files."
              : "The center usually decides which pieces become active.",
    buttons: preferIntentFirstCopy ? intentFirst.buttons : preferFallbackCopy ? buttonsFor(mode, context) : (evidenceCopy.buttons.length ? evidenceCopy.buttons : buttonsFor(mode, context)),
    shouldShowCoachCard: preferIntentFirstCopy ? intentFirst.shouldShow : preferFallbackCopy ? Boolean(fallback) : evidenceCopy.shouldShowCoachCard,
    shouldMarkReviewWorthy: preferIntentFirstCopy ? intentFirst.reviewWorthy : preferFallbackCopy ? (context.viewMode === "plain" && (context.wrongAttempts >= 2 || input.interaction === "answer")) : evidenceCopy.shouldMarkReviewWorthy,
    revealRisk: preferIntentFirstCopy ? (intentFirst.revealRisk === "high" ? "full_answer" : intentFirst.revealRisk) : preferFallbackCopy ? (fallback?.revealRisk ?? "low") : (evidenceCopy.givesAnswer ? "full_answer" : "low"),
    givesAnswer: preferIntentFirstCopy ? intentFirst.givesAnswer : preferFallbackCopy ? Boolean(fallback?.givesAnswer) : evidenceCopy.givesAnswer,
    exactMoveAllowed: packet.exactMoveAllowed,
    claimTypes: evidenceCopy.givesAnswer ? ["engine_safe_recommendation", "opening_pattern"] : ["plan_principle", "board_fact"],
    utteranceId: preferIntentFirstCopy ? `${context.normalizedFen}:${intentFirst.intent}:${intentFirst.templateId ?? intentFirst.utteranceFamily}` : preferFallbackCopy ? fallback?.utteranceId : (evidenceCopy.utteranceId || fallback?.utteranceId),
    utteranceFamily: preferIntentFirstCopy ? intentFirst.utteranceFamily : preferFallbackCopy ? fallback?.utteranceFamily : (evidenceCopy.utteranceFamily || fallback?.utteranceFamily),
    suppressedReason: preferIntentFirstCopy ? undefined : preferFallbackCopy ? undefined : evidenceCopy.suppressedReason,
    debug: {
      ...intentFirst.debug,
      coachVariationReason: fallback?.debugReason,
      coachHintStrength: hintStrength ?? (input.interaction === "hint" ? "adaptive" : "none"),
      reviewReason: intentFirst.reviewWorthy ? "intent_first_review_worthy" : evidenceCopy.reviewReason ?? (evidenceCopy.shouldMarkReviewWorthy ? "hint_answer_wrong_or_slow" : "none"),
      concept: context.conceptId,
      coachIntent: intentFirst.intent,
      coachEvidenceStatus: packet.evidenceStatus,
      coachEvidenceStale: packet.stale,
      coachSelectedCandidateMove: packet.selectedCandidateMoveSan ?? packet.selectedCandidateMoveUci ?? "none",
      coachExactMoveAllowed: packet.exactMoveAllowed,
      coachAllowedClaims: packet.allowedClaims,
      coachBlockedClaims: packet.blockedClaims,
      coachMoveFacts: packet.moveFacts,
      coachBoardFactsSummary: packet.boardFacts,
      coachEngineStatus: packet.engineSupport.status,
      coachEngineBestMove: packet.engineSupport.bestMoveSan ?? packet.engineSupport.bestMoveUci,
      coachEngineSafeMoves: packet.engineSupport.safeMoveUcis,
      coachMaiaStatus: packet.maiaSupport.status,
      coachRepertoireSupport: packet.repertoireSupport,
      coachInteraction: input.interaction,
      coachCopySource: preferIntentFirstCopy ? "intent_first" : evidenceCopy.copySource,
      coachSuppressedReason: evidenceCopy.suppressedReason,
      expectedMoveSource: input.brainInput?.expectedMoveSource,
      expectedMoveCoverageTier: input.brainInput?.expectedMoveCoverageTier,
      expectedMoveResolutionReason: input.brainInput?.expectedMoveResolutionReason,
    },
  };

  if (mode === "plain_answer_revealed" && action === "show_answer" && context.moveSan) {
    decision.title = "Revealed move";
    decision.body = `The revealed move is ${context.moveSan}. Use this exact move to continue the plan.`;
    decision.answer = decision.body;
    decision.shouldShowCoachCard = true;
    decision.givesAnswer = true;
    decision.revealRisk = "full_answer";
    decision.utteranceFamily = "revealed_move";
    decision.debug = {
      ...decision.debug,
      coachIntent: "reveal_answer",
      revealedMoveFallbackUsed: true,
      coachSelectedCandidateMove: context.moveSan,
    };
  }

  const safety = validateCoachDecision(context, decision);
  if (!safety.allowed) {
    return {
      ...quiet("safety_blocked", { coachSafetyWarnings: safety.warnings, blockedClaims: packet.blockedClaims }),
      frameId: context.frameId,
      normalizedFen: context.normalizedFen,
      exactMoveAllowed: false,
    };
  }

  return {
    ...decision,
    debug: {
      ...decision.debug,
      coachSafetyWarnings: safety.warnings,
    },
  };
}
