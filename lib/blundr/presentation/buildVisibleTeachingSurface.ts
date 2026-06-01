/**
 * BLUNDR v2.7.40 VisibleTeachingSurface — the single visible owner.
 *
 * Architecture (mandated):
 *   CurrentInstructionFrame.target → BlundrBrainAnalysis → TrainerPresentationFrame → VisibleTeachingSurface → UI
 *
 * CurrentInstructionFrame.target is the SINGLE SOURCE OF TRUTH for targetUci/targetSan/targetPieceType.
 * Never read target from legacy coachDecision or other sources for the surface's target fields.
 *
 * This is the missing single visible owner for the Clean Intelligent Coach Checkpoint.
 *
 * All 12 rules enforced here (derived from v2.7.40 prompt + Gate 2/3 requirements):
 * 1. target* ALWAYS from currentInstructionFrame.target only.
 * 2. target mismatch (any consumer vs instruction target) → safety.blocked=true + full suppress of coach body/visuals/hint/showMore content.
 * 3. piece mismatch (coach/visual piece != target pieceType) → safety.blocked=true + suppress.
 * 4. Plain View (trainerView==="plain") before showMoreShown → hide coach body + visuals; only hint + showMore actions exposed.
 * 5. Actions field ALWAYS populated exclusively via visibleActionPolicy.getVisibleCoachActions (never legacy arrays).
 * 6. Legacy coachDecision is OPTIONAL input for temporary data/compat ONLY — never drives target or final visible fields; legacyBypassDetected MUST be set in debug + safety when used for bypass.
 * 7. TrainerPresentationFrame.visual and .coach content used ONLY when presentation owner aligns with instruction target (no legacy visual owner on teaching frames).
 * 8. safety.blocked=true forces coach.shouldRender=false, visual.shouldRender=false, hint suppressed, showMore content hidden.
 * 9. owner field accurately reflects source or block reason (trainer_presentation_frame is the happy path for aligned Brain frames).
 * 10. debug section always populated with bypass flags, alignment checks, presentation owners for snapshot/guard use.
 * 11. isBrainTeachingFrame derived from frame + target + phase (ready_for_user + user turn + target present).
 * 12. No forbidden labels, raw UCI/SAN in coach/hint content (responsibility shared with policy + upstream; surface passes through aligned content only).
 *
 * v2.7.40 Agent 4 extensions (Plain View hygiene):
 * - Progressive hint ladder (via buildHintLadder) drives .hint.text and pre-showMore coach body for plain.
 * - Plain pre: coach renders as minimal prompt ("Find the next move") + progressive hint in body (no answer leak) + exactly hint+show_more actions.
 * - Plain post showMore: full assisted-style coach body + visuals from presentation (aligned).
 * - hintCount + showMoreShown drive ladder + suppression.
 * - All hint texts pre-showMore never contain SAN/UCI/direct move/target square (enforced in ladder + tests).
 *
 * Agent 6 (Invariant + Debug Guard): runtime protection layer
 * - 4-target (instructionTargetUci, coachMoveUci, visualMoveUci, showMoreTargetUci) + 2-pieceType (instruction, coach) invariants enforced on active teaching frames.
 * - Any fail → safety.blocked=true, suppress coach/visual/hint/showMore (except safe fallback), owner=_blocked, debug flags + fourTargetMismatch etc.
 * - Plain leak detector (pre-showMore in plain): scans visible coach/hint/actions for UCI/SAN/squares/"Play {move}"/forbidden debug labels → block + plainLeakDetected.
 * - Visible*Owner fields populated for snapshot observability (debug panel sees technicals; prod UI clean blocked fallback).
 * - Terminal/opponent frames: actions=[] (no stale via policy + surface).
 */

import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { TrainerPresentationFrame } from "./trainerPresentationTypes";
import {
  getVisibleCoachActions,
  type VisibleCoachAction,
  type VisibleActionInput,
} from "./visibleActionPolicy";
import { buildHintLadder } from "../brain/hints/buildHintLadder"; // v2.7.40 Agent 4: progressive non-leaking hints for Plain View
import type { BlundrBrainAnalysis } from "../brain/types";

/**
 * Agent 6 plain leak detector (runtime guard, pre-showMore Plain View).
 * Scans final visible strings (coach title/body/hint from ladder, actions) for forbidden:
 * UCI, SAN-ish, bare target squares, "Play {move}", debug labels (verified, pipeline, fallback, etc).
 * Returns true if leak would be visible to user.
 * Called only on plain pre; ladder + policy are first line, this is hard runtime stop.
 */
export function detectPlainTeachingLeak(texts: string[], actionsJson: string, visualsJson: string): boolean {
  const haystack = (texts.join("\n") + "\n" + actionsJson + "\n" + visualsJson).toLowerCase();
  const banned: RegExp[] = [
    // UCI patterns (e2e4, a1h8 etc)
    /[a-h][1-8][a-h][1-8]/,
    // SAN-ish (Nf3, Qxd5+, e4, exd5, O-O, O-O-O, but conservative to avoid word false pos; squares + piece prefix)
    /\b[nbrqk][a-h]?[1-8]?x?[a-h][1-8](=[nbrq])?[\+#]?/i,
    /\b[a-h]x[a-h][1-8]/i,
    // bare squares (contextual risk in teaching copy)
    /\b[a-h][1-8]\b/,
    // explicit play phrases + move reveal
    /play\s+(the\s+)?(next\s+)?move/i,
    /play\s+[a-h1-8]/i,
    /"[^"]*[a-h][1-8][^"]*"/,
    // debug / internal leak terms (from existing hasDebugLeakText + more)
    /verified move|verified_top|pipeline|not_exposed_from_module|candidate source|fallback|runtime|debug leak|unsafe_unverified/i,
    /from module|template_blocked|safety_linter/i,
    // forbidden labels that should never appear in plain pre
    /show answer|reveal (next|move)|show move|show plan/i,
  ];
  return banned.some((re) => re.test(haystack));
}

// Owner variants (per v2.7.40 prompt contract)
export type VisibleTeachingSurfaceOwner =
  | "trainer_presentation_frame"
  | "legacy_direct"
  | "target_mismatch_blocked"
  | "piece_mismatch_blocked"
  | "plain_pre_showmore_suppressed"
  | "plain_leak_blocked"
  | "non_teaching_frame"
  | "no_instruction_target";

// Core surface type (full shape per original v2.7.40 prompt)
export interface VisibleTeachingSurface {
  owner: VisibleTeachingSurfaceOwner;
  isBrainTeachingFrame: boolean;

  // STRICTLY from CurrentInstructionFrame.target — never legacy
  targetUci: string | null;
  targetSan: string | null;
  targetPieceType: string | null;

  coach: {
    shouldRender: boolean;
    title: string | null;
    body: string | null;
    suppressedReason: string | null;
    // Additional for CoachCard consumption (title/body + derived)
  };

  hint: {
    text: string | null;
    suppressed: boolean;
    reason?: string;
  };

  showMore: {
    shown: boolean;
    content: string | null; // full assisted when shown; suppressed otherwise
    actionAvailable: boolean;
  };

  visual: {
    shouldRender: boolean;
    lines: unknown[];
    highlights: unknown[];
    source: string;
    blockedReason: string | null;
  };

  actions: VisibleCoachAction[];

  safety: {
    blocked: boolean;
    reason: string | null;
    targetMismatch: boolean;
    pieceMismatch: boolean;
    legacyBypassDetected: boolean;
    plainLeakDetected: boolean; // Agent 6: runtime plain view leak guard (pre-showMore)
  };

  debug: {
    legacyBypassDetected: boolean;
    presentationCoachOwner: string;
    presentationVisualSource: string;
    instructionTargetUci: string | null;
    frameAligned: boolean;
    plainPreShowMore: boolean;
    computedAt: string; // for snapshot stability
    // Agent 6: full owner reporting for debug snapshot + invariants
    visibleSurfaceOwner: VisibleTeachingSurfaceOwner;
    visibleCoachOwner: string;
    visibleVisualOwner: string;
    visibleActionOwner: string;
    plainLeakDetected: boolean;
    fourTargetMismatch: boolean;
    twoPieceTypeMismatch: boolean;
  };
}

export interface BuildVisibleTeachingSurfaceInput {
  currentInstructionFrame: CurrentInstructionFrame;
  trainerPresentationFrame: TrainerPresentationFrame;
  // Optional legacy for temp compat / debug only (per rules)
  legacyCoachDecision?: {
    title?: string | null;
    body?: string | null;
    targetUci?: string | null;
    targetSan?: string | null;
    pieceType?: string | null;
    buttons?: string[];
    // etc. — never used for target derivation
  } | null;
  showMoreShown?: boolean;
  // Context for policy + alignment
  trainerView?: "assisted" | "plain";
  trainingMode?: "restricted" | "continuation";
  isUserTurn?: boolean;
  trainerPhase?: string;
  bookStatus?: "in_book" | "book_complete" | "near_book" | "out_of_book";
  isBranchTransition?: boolean;
  isTerminal?: boolean;
  // Brain optional per current skeleton state; used for future alignment if present
  brainAnalysis?: { currentTarget?: { uci?: string; pieceType?: string } | null } | null | BlundrBrainAnalysis;
  // v2.7.40 Agent 4: for progressive ladder (Plain View)
  hintCount?: number;
  selectedTeachingConcept?: string | null;
  userLevel?: string;
  // Agent 6 Invariant Guard: explicit 4-target + 2-pieceType sources for cross-check (vs instruction target)
  coachMoveUci?: string | null;
  visualMoveUci?: string | null;
  showMoreTargetUci?: string | null;
  coachPieceType?: string | null;
}

/**
 * buildVisibleTeachingSurface
 * The single owner builder. Enforces all rules strictly.
 */
export function buildVisibleTeachingSurface(
  input: BuildVisibleTeachingSurfaceInput
): VisibleTeachingSurface {
  const {
    currentInstructionFrame,
    trainerPresentationFrame,
    legacyCoachDecision = null,
    showMoreShown = false,
    trainerView = "assisted",
    trainingMode = "restricted",
    isUserTurn = true,
    trainerPhase = "ready_for_user",
    bookStatus,
    isBranchTransition = false,
    isTerminal = false,
    brainAnalysis = null,
    hintCount = 0,
    selectedTeachingConcept = null,
    userLevel,
    // Agent 6: destructure for 4-target + 2-piece invariant checks
    coachMoveUci = null,
    visualMoveUci = null,
    showMoreTargetUci = null,
    coachPieceType = null,
  } = input;

  const instructionTarget = currentInstructionFrame?.target ?? null;
  const targetUci = instructionTarget?.uci ?? null;
  const targetSan = instructionTarget?.san ?? null;
  const targetPieceType = instructionTarget?.pieceType ?? null;

  const isBrainTeachingFrame =
    Boolean(instructionTarget) &&
    trainerPhase === "ready_for_user" &&
    isUserTurn &&
    currentInstructionFrame?.trainerPhase === "ready_for_user";

  // Alignment checks against instruction target (core invariant)
  const presentationCoachUci = null; // presentation currently does not carry per-coach uci; rely on frame target
  const presentationVisualSource = trainerPresentationFrame?.visual?.source ?? "none";
  const presentationCoachOwner = trainerPresentationFrame?.coach?.owner ?? "none";
  // Early for mismatch guard (defined before use)
  const isLegacyVisualSource = presentationVisualSource === "legacy" || presentationVisualSource === "legacy_fallback";

  // Detect legacy bypass usage (for debug + safety flag only)
  const legacyBypassDetected = Boolean(
    legacyCoachDecision &&
      (legacyCoachDecision.targetUci || legacyCoachDecision.body || legacyCoachDecision.title)
  );

  // Target mismatch detection (any provided legacy vs canonical instruction target)
  let targetMismatch = false;
  if (legacyCoachDecision?.targetUci && targetUci) {
    targetMismatch = legacyCoachDecision.targetUci !== targetUci;
  }
  // Also flag if presentation claims visual but we can detect divergence in future (for now use source)
  // v2.7.40: any legacy visual source on teaching is mismatch risk (quarantined)
  if (isLegacyVisualSource && isBrainTeachingFrame) {
    // legacy visual on brain frame is a form of mismatch risk
    targetMismatch = targetMismatch || true;
  }

  // Piece mismatch (from legacy input or brain target vs instruction)
  let pieceMismatch = false;
  if (legacyCoachDecision?.pieceType && targetPieceType) {
    pieceMismatch = legacyCoachDecision.pieceType !== targetPieceType;
  }
  const brainTargetPiece = brainAnalysis?.currentTarget?.pieceType;
  if (brainTargetPiece && targetPieceType && brainTargetPiece !== targetPieceType) {
    pieceMismatch = true;
  }

  // === Agent 6: 4-target + 2-pieceType invariant runtime guard ===
  // On active teaching frame, instructionTargetUci is source of truth.
  // coachMoveUci, visualMoveUci, showMoreTargetUci (when shown) + coachPieceType MUST align or block.
  let fourTargetMismatch = false;
  let twoPieceTypeMismatch = false;
  if (isBrainTeachingFrame && targetUci) {
    const provided4 = [coachMoveUci, visualMoveUci, (showMoreShown ? showMoreTargetUci : null)].filter(Boolean) as string[];
    for (const t of provided4) {
      if (t !== targetUci) {
        fourTargetMismatch = true;
        break;
      }
    }
    if (coachPieceType && targetPieceType && coachPieceType !== targetPieceType) {
      twoPieceTypeMismatch = true;
    }
  }
  if (fourTargetMismatch) targetMismatch = true;
  if (twoPieceTypeMismatch) pieceMismatch = true;

  const anyMismatch = targetMismatch || pieceMismatch;

  // Safety block decision
  const blockedByMismatch = anyMismatch || !instructionTarget;
  const blockedReason = !instructionTarget
    ? "no_instruction_target"
    : targetMismatch
    ? "target_mismatch_vs_current_instruction_frame"
    : pieceMismatch
    ? "piece_mismatch_vs_current_instruction_frame_target"
    : fourTargetMismatch
    ? "four_target_invariant_failed"
    : twoPieceTypeMismatch
    ? "two_piece_type_invariant_failed"
    : null;

  let safetyBlocked = blockedByMismatch;

  // Plain View pre-showMore rule (hides body + visuals; limits actions)
  const isPlainPreShowMore = trainerView === "plain" && !showMoreShown && isBrainTeachingFrame;

  // v2.7.40 Agent 4: Compute progressive hint ladder (always safe; only currentHint used pre-showMore)
  const ladder = buildHintLadder({
    target: currentInstructionFrame?.target ?? null,
    brainAnalysis: brainAnalysis as any, // tolerate minimal or full
    selectedTeachingConcept,
    userLevel,
    hintCount,
    trainerView: trainerView as "plain" | "assisted",
    showMoreShown,
  });
  const progressiveHint = ladder.currentHint;

  // === Agent 6 early plain leak pre-scan (after ladder, before decisions) for early safety block on plain pre ===
  // Use known plain pre action set + potential prompt/hint texts (even if coach not yet decided)
  let earlyPlainLeakDetected = false;
  if (isPlainPreShowMore) {
    const earlyTexts = [progressiveHint, "Find the next move"].filter(Boolean) as string[];
    const earlyPlainActions = JSON.stringify(["hint", "show_more"]);
    earlyPlainLeakDetected = detectPlainTeachingLeak(earlyTexts, earlyPlainActions, "[]");
  }
  if (earlyPlainLeakDetected && isPlainPreShowMore) {
    safetyBlocked = true;
  }

  // Derive actions EXCLUSIVELY from policy
  const policyInput: VisibleActionInput = {
    trainerView: trainerView as any,
    trainerPhase,
    isUserTurn,
    trainingMode: trainingMode as any,
    bookStatus,
    isBranchTransition,
    isTerminal,
    hasActiveTarget: Boolean(targetUci),
    coachOwner: presentationCoachOwner,
    answerShown: showMoreShown, // proxy; real showAnswer state upstream
  };
  const policyResult = getVisibleCoachActions(policyInput);
  let actions: VisibleCoachAction[] = policyResult.actions;

  // For plain pre-showmore: policy already gives ["hint","show_more"] — surface enforces no other.
  if (isPlainPreShowMore) {
    actions = actions.filter((a) => a === "hint" || a === "show_more");
  }

  // Content from TrainerPresentationFrame ONLY when aligned (no mismatch)
  // Agent 4: for plain pre we still render a *prompt* coach card (title + progressive hint body + actions), but no full body/visuals
  const presentationProvidesContent = !safetyBlocked && !isPlainPreShowMore;

  // v2.7.41 Clean Convergence: VisibleTeachingSurface is the SINGLE visible owner on teaching frames.
  // Force coachShouldRender = true on any active brain teaching frame (after safety checks).
  // This starves legacyTrainingCard, legacyAnswerCard, liveCoach visible, moveImpact, nextText etc.
  // Old presentation coach content is used when available; otherwise safe neutral fallback is provided.
  const coachShouldRender =
    !safetyBlocked &&
    (isBrainTeachingFrame || isPlainPreShowMore || presentationProvidesContent && (trainerPresentationFrame?.coach?.shouldRender ?? false));

  let coachTitle: string | null = null;
  let coachBody: string | null = null;
  if (coachShouldRender) {
    if (isPlainPreShowMore) {
      // Prompt + progressive non-leaking hint (no full assisted body yet)
      coachTitle = "Find the next move";
      coachBody = progressiveHint || null; // shows only after first Hint click; null before = clean prompt
    } else {
      coachTitle = trainerPresentationFrame.coach.title ?? "Training position";
      coachBody = trainerPresentationFrame.coach.body ?? "Focus on the key idea for this move.";
    }
  }

  // === Agent 6: Plain leak detector (final scan of visible pre-showMore Plain content) ===
  // Scans finalized coachTitle/Body (ladder/prompt only), actions, visuals for UCI/SAN/squares/"Play {..}"/forbidden labels.
  // Any detection on plain pre → force safety.blocked + plainLeakDetected (suppresses output).
  let plainLeakDetected = earlyPlainLeakDetected;
  if (isPlainPreShowMore) {
    const textsForLeakScan: string[] = [coachTitle, coachBody, progressiveHint].filter(Boolean) as string[];
    const actionsJson = JSON.stringify(actions);
    const visualsJson = "[]"; // visuals always suppressed pre in plain
    if (detectPlainTeachingLeak(textsForLeakScan, actionsJson, visualsJson)) {
      plainLeakDetected = true;
    }
  }

  // Agent 6: if (final) plain leak detected → ensure blocked
  if (plainLeakDetected && isPlainPreShowMore) {
    safetyBlocked = true;
  }

  // If legacy was the only source but we are on teaching frame, mark bypass (never promote its content to surface coach)
  const effectiveCoachSuppressed = safetyBlocked || !coachShouldRender;
  const coachSuppressedReason = safetyBlocked
    ? blockedReason
    : (isPlainPreShowMore && !progressiveHint)
    ? "plain_view_pre_showmore_prompt_only"
    : trainerPresentationFrame?.coach?.suppressedReason ?? null;

  // Hint (Agent 4): now driven by ladder for Plain; suppressed on block. Current progressive only pre-showMore.
  const hintSuppressed = safetyBlocked;
  const hintText = !hintSuppressed ? (progressiveHint || (isPlainPreShowMore ? null : (trainerPresentationFrame?.coach?.title ? `Focus on the key idea.` : null))) : null;

  // ShowMore
  const showMoreContent = showMoreShown && !safetyBlocked ? (coachBody || trainerPresentationFrame?.coach?.body || null) : null;
  const showMoreActionAvailable = actions.includes("show_more");

  // Visual from presentation ONLY when aligned + not plain-pre + not blocked
  // v2.7.40 P0 Fix 2: block any legacy visual source ( "legacy" or "legacy_fallback" ) on teaching frames; surface owns.
  const visualShouldRender =
    !safetyBlocked &&
    !isPlainPreShowMore &&
    (trainerPresentationFrame?.visual?.shouldRender ?? false) &&
    !isLegacyVisualSource; // legacy visual suppressed on teaching per rules

  const visualLines = visualShouldRender ? (trainerPresentationFrame.visual.lines ?? []) : [];
  const visualHighlights = visualShouldRender ? (trainerPresentationFrame.visual.highlights ?? []) : [];
  const visualSource = visualShouldRender ? presentationVisualSource : "none";
  const visualBlockedReason = visualShouldRender ? null : (safetyBlocked ? blockedReason : isPlainPreShowMore ? "plain_pre_showmore_visuals_hidden" : "presentation_not_aligned_or_blocked");

  // Final owner
  let owner: VisibleTeachingSurfaceOwner = "trainer_presentation_frame";
  if (!instructionTarget) owner = "no_instruction_target";
  else if (pieceMismatch) owner = "piece_mismatch_blocked";
  else if (targetMismatch) owner = "target_mismatch_blocked";
  else if (plainLeakDetected) owner = "plain_leak_blocked";
  else if (isPlainPreShowMore) owner = "plain_pre_showmore_suppressed";
  else if (!isBrainTeachingFrame) owner = "non_teaching_frame";
  else if (legacyBypassDetected && !presentationProvidesContent) owner = "legacy_direct";

  // If legacy direct was used as fallback without presentation alignment on a teaching frame
  if (legacyBypassDetected && isBrainTeachingFrame && presentationCoachOwner === "legacy_fallback") {
    owner = "legacy_direct";
  }

  return {
    owner,
    isBrainTeachingFrame,
    targetUci,
    targetSan,
    targetPieceType,

    coach: {
      shouldRender: coachShouldRender,
      title: coachTitle,
      body: coachBody,
      suppressedReason: coachSuppressedReason,
    },

    hint: {
      text: hintText,
      suppressed: hintSuppressed,
      reason: hintSuppressed ? (safetyBlocked ? blockedReason : "plain_or_alignment") : undefined,
    },

    showMore: {
      shown: showMoreShown,
      content: showMoreContent,
      actionAvailable: showMoreActionAvailable,
    },

    visual: {
      shouldRender: visualShouldRender,
      lines: visualLines,
      highlights: visualHighlights,
      source: visualSource,
      blockedReason: visualBlockedReason,
    },

    actions,

    safety: {
      blocked: safetyBlocked,
      reason: blockedReason,
      targetMismatch,
      pieceMismatch,
      legacyBypassDetected,
      plainLeakDetected,
    },

    debug: {
      legacyBypassDetected,
      presentationCoachOwner,
      presentationVisualSource,
      instructionTargetUci: targetUci,
      frameAligned: !anyMismatch && presentationProvidesContent,
      plainPreShowMore: isPlainPreShowMore,
      computedAt: new Date().toISOString(),
      // Agent 6 visible owner + invariant details for debug snapshot consumption
      visibleSurfaceOwner: owner,
      visibleCoachOwner: isPlainPreShowMore ? "plain_hint_ladder" : presentationCoachOwner,
      visibleVisualOwner: visualSource || presentationVisualSource || "none",
      visibleActionOwner: "visibleActionPolicy",
      plainLeakDetected,
      fourTargetMismatch,
      twoPieceTypeMismatch,
    },
  };
}

export default buildVisibleTeachingSurface;
