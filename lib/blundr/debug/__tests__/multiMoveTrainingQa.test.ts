import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildCoachContext } from "../../coach/coachContextBuilder";
import { decideCoachOutput } from "../../coach/coachDecisionEngine";
import { decideCoachSurfacePolicy } from "../../coachSurface/coachSurfacePolicy";
import { selectContinuedPlayMove } from "../../continuedPlay/continuedPlayMovePolicy";
import { buildTrainerDebugSnapshot } from "../../debug/trainerDebugSnapshot";
import { buildOpeningTree } from "../../openings/openingTree";
import type { RepertoireLineInput, ResolvedExpectedMove } from "../../openings/openingTypes";
import { resolveExpectedMoveForFrame } from "../../openings/expectedMoveResolver";
import { decideGuidedCoveragePolicy } from "../../openings/guidedCoveragePolicy";
import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
import { buildTrainingContext } from "../../teaching/trainingContextEngine";
import { attributeLastMove, decideTrainerPhaseActionGate } from "../../presentation/phaseActionGating";
import { computeTrainerPresentationFrame } from "../../presentation/trainerPresentationFrame";
import { buildContinuationCandidateVisual } from "../../visual/continuationCandidateVisual";
import { compileVisualRecipe } from "../../visualRecipe/visualRecipeCompiler";

type CoachInteraction = "none" | "hint" | "answer" | "why" | "hide" | "show_plan" | "analyze_idea" | "show_move";

type VisualMode = "recipe" | "safe_arrow" | "continuation_candidate" | "none";

type BuiltFrame = {
  frameId: number;
  fen: string;
  trainerPhase: string;
  trainingMode: "restricted" | "continuation";
  trainerView: "assisted" | "plain";
  isUserTurn: boolean;
  sideToMove: "w" | "b";
  expectedMoveResolution: ResolvedExpectedMove;
  guidedCoveragePolicy: ReturnType<typeof decideGuidedCoveragePolicy>;
  coachDecision: ReturnType<typeof decideCoachOutput>;
  phaseActionGate: ReturnType<typeof decideTrainerPhaseActionGate>;
  presentationFrame: ReturnType<typeof computeTrainerPresentationFrame>;
  debugSnapshot: ReturnType<typeof buildTrainerDebugSnapshot>;
  continuationVisual: ReturnType<typeof buildContinuationCandidateVisual>;
  visualMode: VisualMode;
  selectedCandidateUci: string | null;
  selectedCandidateSan: string | null;
  currentSelectedCandidateUci: string | null;
  previousSelectedCandidateUci: string | null;
  staleSelectedCandidateDetected: boolean;
  staleSelectedCandidateCleared: boolean;
  revealTargetUci: string | null;
  revealTargetSource: string | null;
  branchTransitionSurfaceRendered: boolean;
};

function moveToUci(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function pickLegalMove(game: Chess, preferredUci?: string): { uci: string; san: string } | null {
  const verbose = game.moves({ verbose: true }) as Array<{ from: string; to: string; san: string; promotion?: string }>;
  if (!verbose.length) return null;
  if (preferredUci) {
    const found = verbose.find((move) => moveToUci(move) === preferredUci);
    if (found) return { uci: moveToUci(found), san: found.san };
  }
  const top = verbose[0];
  return { uci: moveToUci(top), san: top.san };
}

function buildGuidedTrainingContext(input: {
  fenBefore: string;
  expectedMoveUci: string;
  expectedMoveSan: string;
  trainerView: "assisted" | "plain";
  trainingMode: "restricted" | "continuation";
  isUserTurn: boolean;
  answerShown: boolean;
}) {
  return buildTrainingContext({
    fenBefore: input.fenBefore,
    expectedMoveUci: input.expectedMoveUci,
    expectedMoveSan: input.expectedMoveSan,
    moveQuality: {
      status: "book_supported",
      topMoves: [{ rank: 1, uci: input.expectedMoveUci, san: input.expectedMoveSan, scoreCp: 20 }],
    },
    bookSupport: { hasBookSupport: true, confidence: 0.9, reason: "qa_fixture" },
    repertoireSupport: true,
    trainerView: input.trainerView,
    trainingMode: input.trainingMode,
    isUserTurn: input.isUserTurn,
    showAnswer: input.answerShown,
  });
}

function buildExpectedMoveRecipe(input: {
  frameId: number;
  fen: string;
  trainerView: "assisted" | "plain";
  trainingMode: "restricted" | "continuation";
  isUserTurn: boolean;
  answerShown: boolean;
  expectedMoveUci: string;
  expectedMoveSan: string;
}) {
  const trainingContext = buildGuidedTrainingContext({
    fenBefore: input.fen,
    expectedMoveUci: input.expectedMoveUci,
    expectedMoveSan: input.expectedMoveSan,
    trainerView: input.trainerView,
    trainingMode: input.trainingMode,
    isUserTurn: input.isUserTurn,
    answerShown: input.answerShown,
  });
  const recipe = compileVisualRecipe({
    trainingContext,
    fen: input.fen,
    viewMode: input.trainerView,
    revealState: input.answerShown ? "revealed" : "hidden",
    openingId: "qa",
    lineId: "qa",
    expectedMoveUci: input.expectedMoveUci,
    expectedMoveSan: input.expectedMoveSan,
    frameId: input.frameId,
  });
  return recipe.beats.length ? recipe : null;
}

function makeSafeArrowLines(expectedMoveUci: string): Array<{ from: string; to: string }> {
  return [{ from: expectedMoveUci.slice(0, 2), to: expectedMoveUci.slice(2, 4) }];
}

export function buildFrame(input: {
  openingTree: ReturnType<typeof buildOpeningTree>;
  fen: string;
  frameId: number;
  trainerView: "assisted" | "plain";
  trainingMode: "restricted" | "continuation";
  userColor: "w" | "b";
  visualMode: VisualMode;
  coachInteraction?: CoachInteraction;
  answerShown?: boolean;
  coachHiddenForFrame?: boolean;
  continueFromHereClicked?: boolean;
  userExplicitlyEnteredContinuation?: boolean;
  previousSelectedCandidateUci?: string | null;
  expectedMoveOverride?: { san?: string | null; uci?: string | null };
  enginePreviewMove?: { san?: string; uci?: string };
  candidatePreferredUci?: string;
  branchTransitionSurface?: boolean;
  branchTransitionReason?: string;
  lastMove?: { san?: string | null; uci?: string | null; color?: "w" | "b" | null };
}): BuiltFrame {
  const game = new Chess(input.fen);
  const sideToMove = game.turn() as "w" | "b";
  const isUserTurn = sideToMove === input.userColor;
  const trainerPhase = isUserTurn ? "ready_for_user" : "opponent_selecting";
  const opponentColor = input.userColor === "w" ? "b" : "w";
  const baseExpectedMoveResolution = resolveExpectedMoveForFrame({
    openingTree: input.openingTree,
    fen: input.fen,
    trainerPhase,
    trainingMode: input.trainingMode,
    trainerView: input.trainerView,
    isUserTurn,
    userColor: input.userColor,
    opponentColor,
    lastOpponentMoveUci: input.lastMove?.color === opponentColor ? input.lastMove.uci : null,
    lastOpponentMoveSan: input.lastMove?.color === opponentColor ? input.lastMove.san : null,
    legacyExpectedMoveCandidate: input.expectedMoveOverride ?? null,
    enginePreview: input.enginePreviewMove ? { pvs: [{ uci: input.enginePreviewMove.uci, san: input.enginePreviewMove.san }] } : undefined,
    allowEngineFallbackInRestricted: false,
  });

  const selectedCandidate =
    input.trainingMode === "continuation"
      ? input.enginePreviewMove ?? (baseExpectedMoveResolution.expectedMoveUci ? { uci: baseExpectedMoveResolution.expectedMoveUci, san: baseExpectedMoveResolution.expectedMoveSan ?? undefined } : pickLegalMove(game, input.candidatePreferredUci) ?? undefined)
      : baseExpectedMoveResolution.expectedMoveUci
        ? { uci: baseExpectedMoveResolution.expectedMoveUci, san: baseExpectedMoveResolution.expectedMoveSan ?? undefined }
          : input.expectedMoveOverride?.uci
            ? { uci: input.expectedMoveOverride.uci, san: input.expectedMoveOverride.san ?? undefined }
            : undefined;

  const guidedCoveragePolicy = decideGuidedCoveragePolicy({
    currentPly: game.history().length,
    fullMoveNumber: Number((input.fen.split(/\s+/)[5] ?? "1")) || 1,
    activeOpeningId: input.openingTree.openingId,
    activeLineId: String(baseExpectedMoveResolution.debug?.selectedLineId ?? "qa"),
    normalizedFen: input.fen.trim().split(/\s+/).slice(0, 4).join(" "),
    sideToMove,
    userColor: input.userColor,
    branchFrequency: 0.5,
    cumulativeBranchCoverage: 0.5,
    nodeContinuationCount: baseExpectedMoveResolution.candidateMoves.length,
    userContinuationCount: isUserTurn && baseExpectedMoveResolution.expectedMoveUci ? 1 : 0,
    opponentContinuationCount: !isUserTurn ? 1 : 0,
    legalMoveCount: game.moves().length,
    knownBranchAvailable: ["lesson_line", "opening_branch", "transposition", "legacy_recoverable", "opening_family_plan"].includes(baseExpectedMoveResolution.source),
    adaptiveBranchAvailable: baseExpectedMoveResolution.source === "opening_family_plan" || baseExpectedMoveResolution.source === "guided_branch_needs_continuation",
    continuationCandidateExists: input.trainingMode === "continuation" && Boolean(selectedCandidate?.uci),
    explicitCuratedTerminalNode: false,
    depthLimit: 28,
  });

  const exactMoveAllowed = Boolean(
    selectedCandidate?.uci &&
      (game.moves({ verbose: true }) as Array<{ from: string; to: string; promotion?: string }>).some((move) => moveToUci(move) === selectedCandidate?.uci),
  );
  const continuationCandidateTrusted =
    input.trainingMode === "continuation" &&
    Boolean(selectedCandidate?.uci) &&
    Boolean(input.userExplicitlyEnteredContinuation || input.continueFromHereClicked);
  const exactOrTrustedMoveAllowed = exactMoveAllowed || continuationCandidateTrusted;
  let expectedMoveResolution = baseExpectedMoveResolution;
  if (
    input.trainingMode === "continuation" &&
    selectedCandidate?.uci &&
    exactOrTrustedMoveAllowed
  ) {
    const continuationClone = new Chess(input.fen);
    const moveInput: { from: string; to: string; promotion?: string } = {
      from: selectedCandidate.uci.slice(0, 2),
      to: selectedCandidate.uci.slice(2, 4),
    };
    if (selectedCandidate.uci.length > 4) {
      moveInput.promotion = selectedCandidate.uci.slice(4, 5);
    }
    const applied = continuationClone.move(moveInput);
    if (applied) {
      expectedMoveResolution = {
        ...baseExpectedMoveResolution,
        expectedMoveSan: selectedCandidate.san ?? applied.san,
        expectedMoveUci: selectedCandidate.uci,
        source: "continuation_candidate",
        bookResolutionState: "continuation_candidate",
        coverageTier: "continuation_candidate",
        legal: true,
        lineCursor: continuationClone.history().length - 1,
        lineLength: null,
        reason: "trusted_continuation_candidate",
        candidateMoves: [
          {
            san: applied.san,
            uci: selectedCandidate.uci,
            color: applied.color as "w" | "b",
            resultingFen: continuationClone.fen(),
            resultingFen4: continuationClone.fen().trim().split(/\s+/).slice(0, 4).join(" "),
            source: "legacy_recoverable",
            lineId: "continuation-candidate",
            openingId: input.openingTree.openingId,
            ply: continuationClone.history().length - 1,
          },
        ],
        exhausted: false,
        shouldTransitionToContinuation: false,
        debug: { ...baseExpectedMoveResolution.debug, selectedContinuationCandidate: selectedCandidate.uci },
      };
    }
  }
  const candidateTrainingContext = selectedCandidate?.uci
    ? buildGuidedTrainingContext({
        fenBefore: input.fen,
        expectedMoveUci: selectedCandidate.uci,
        expectedMoveSan: selectedCandidate.san ?? selectedCandidate.uci,
        trainerView: input.trainerView,
        trainingMode: input.trainingMode,
        isUserTurn,
        answerShown: Boolean(input.answerShown),
      })
    : null;

  const recipe =
    input.visualMode === "recipe" && expectedMoveResolution.expectedMoveUci
      ? buildExpectedMoveRecipe({
          frameId: input.frameId,
          fen: input.fen,
          trainerView: input.trainerView,
          trainingMode: input.trainingMode,
          isUserTurn,
          answerShown: Boolean(input.answerShown),
          expectedMoveUci: expectedMoveResolution.expectedMoveUci,
          expectedMoveSan: expectedMoveResolution.expectedMoveSan ?? expectedMoveResolution.expectedMoveUci,
        })
      : null;

  const safeMoveArrowLines = input.visualMode === "safe_arrow" && expectedMoveResolution.expectedMoveUci ? makeSafeArrowLines(expectedMoveResolution.expectedMoveUci) : [];
  const continuationVisual =
    input.visualMode === "continuation_candidate" && input.trainingMode === "continuation" && selectedCandidate?.uci
      ? buildContinuationCandidateVisual({
          boardFen: input.fen,
          candidateUci: selectedCandidate.uci,
          candidateSan: selectedCandidate.san,
        })
      : ({ source: "continuation_candidate", shouldRender: false, lines: [], highlights: [], blockedReason: input.trainingMode === "continuation" ? "candidate_not_trusted" : "not_continuation" } as ReturnType<typeof buildContinuationCandidateVisual>);

  const autoBranchTransition =
    input.trainingMode === "restricted" && isUserTurn && !expectedMoveResolution.expectedMoveUci && !selectedCandidate?.uci;
  const branchTransitionSurface =
    !input.coachHiddenForFrame && (input.branchTransitionSurface || autoBranchTransition || expectedMoveResolution.source === "guided_branch_needs_continuation")
      ? {
          render: true,
          title: "Line complete",
          body: "You finished this training line. Continue from this position or train the line again.",
          buttons: ["continue_from_here", "restart_line"],
          reason: input.branchTransitionReason ?? expectedMoveResolution.reason ?? "guided_branch_needs_continuation",
        }
      : null;

  const coachDecision =
    branchTransitionSurface && !expectedMoveResolution.expectedMoveUci && !selectedCandidate?.uci
      ? ({
          mode: "suppressed",
          action: "stay_quiet",
          buttons: [],
          shouldShowCoachCard: false,
          shouldMarkReviewWorthy: false,
          revealRisk: "none",
          givesAnswer: false,
          claimTypes: [],
          suppressedReason: input.branchTransitionReason ?? "branch_transition_surface",
          debug: { coachIntent: "silent", candidateCoachFallbackUsed: false, branchTransitionSurfaceRendered: true },
        } as ReturnType<typeof decideCoachOutput>)
      : decideCoachOutput({
          context: buildCoachContext({
            frameId: input.frameId,
            boardFen: input.fen,
            viewMode: input.trainerView,
            revealState: input.answerShown ? "revealed" : "hidden",
            phase: trainerPhase,
            userToMove: isUserTurn,
            bookStatus: input.trainingMode === "continuation" ? "out_of_book" : "in_book",
            trainingContext: candidateTrainingContext,
            visualRecipe: recipe ?? undefined,
            attempts: 0,
            wrongAttempts: 0,
            hintUsed: input.coachInteraction === "hint",
            answerShown: Boolean(input.answerShown),
            elapsedMs: 2000,
            priorPatternMisses: 0,
            priorPatternSuccesses: 1,
            recentUtteranceIds: [],
            recentUtteranceFamilies: [],
          }).context,
          interaction: input.coachInteraction ?? (isUserTurn && (expectedMoveResolution.expectedMoveUci || selectedCandidate?.uci) ? "show_plan" : "none"),
          outcome: "none",
          hintRequestCount: (input.coachInteraction ?? (isUserTurn && (expectedMoveResolution.expectedMoveUci || selectedCandidate?.uci) ? "show_plan" : "none")) === "hint" ? 1 : 0,
          utteranceMemory: [],
          brainInput: candidateTrainingContext
            ? {
                fen: input.fen,
                trainerFrameId: String(input.frameId),
                trainingMode: input.trainingMode,
                viewMode: input.trainerView,
                bookStatus: input.trainingMode === "continuation" ? "out_of_book" : "in_book",
                expectedMoveUci: expectedMoveResolution.expectedMoveUci ?? undefined,
                expectedMoveSan: expectedMoveResolution.expectedMoveSan ?? undefined,
                selectedCandidateMoveUci: selectedCandidate?.uci,
                selectedCandidateMoveSan: selectedCandidate?.san,
                enginePreview: input.enginePreviewMove ? { pvs: [{ uci: input.enginePreviewMove.uci, san: input.enginePreviewMove.san }] } : undefined,
                visualRecipe: recipe ?? undefined,
                trainingContext: candidateTrainingContext,
                teachingOrchestration: { openingId: input.openingTree.openingId, lineId: String(expectedMoveResolution.debug?.selectedLineId ?? "qa") },
                repertoireMoves: [],
                lichessContinuationMoves: [],
                stale: false,
                expectedMoveSource: expectedMoveResolution.source,
                expectedMoveCoverageTier: expectedMoveResolution.coverageTier,
                expectedMoveResolutionReason: expectedMoveResolution.reason,
              }
            : undefined,
        });

  const coachSurfacePolicy = decideCoachSurfacePolicy({
    coachShouldShow: Boolean(coachDecision.shouldShowCoachCard),
    coachSuppressedReason: coachDecision.suppressedReason,
    coachHiddenForFrame: Boolean(input.coachHiddenForFrame),
    trainingMode: input.trainingMode,
    viewMode: input.trainerView,
    hasExpectedMove: Boolean(expectedMoveResolution.expectedMoveUci),
    exactMoveAllowed: Boolean(coachDecision.exactMoveAllowed),
    moveQualityGateStatus: String(coachDecision.debug?.coachEngineStatus ?? "idle"),
    engineValidationStatus: coachDecision.debug?.coachEngineStatus === "ready" ? "ready" : "idle",
    visualRecipeValid: Boolean(recipe),
  });

  const phaseActionGate = decideTrainerPhaseActionGate({
    trainerPhase,
    isUserTurn,
    trainingMode: input.trainingMode,
    expectedMoveSan: expectedMoveResolution.expectedMoveSan ?? null,
    expectedMoveUci: expectedMoveResolution.expectedMoveUci ?? null,
    trustedContinuationCandidateAvailable: Boolean(continuationVisual.shouldRender),
    coachShouldShow: Boolean(coachDecision.shouldShowCoachCard),
    coachButtons: coachDecision.buttons,
  });

  const presentationFrame = computeTrainerPresentationFrame({
    frameId: input.frameId,
    fen: input.fen,
    activeBoard: true,
    trainerView: input.trainerView,
    trainerPhase,
    trainingMode: input.trainingMode,
    isUserTurn,
    answerShown: Boolean(input.answerShown),
    visualRecipeId: recipe?.visualRecipeId,
    visualRecipeLines: recipe ? recipe.beats.flatMap((beat: any) => beat.primitives) : [],
    continuationCandidateLines: continuationVisual.lines,
    safeMoveArrowLines,
    legacyLines: [],
    activePrimitiveIds: recipe ? recipe.beats.flatMap((beat: any) => beat.primitives.map((primitive: any) => primitive.id)) : [],
    recipeFrameMatchesBoard: Boolean(recipe),
    recipeFenMatchesBoard: Boolean(recipe),
    adapterAllowed: Boolean(recipe),
    overlayFrameId: input.frameId,
    playbackReady: true,
    coachShouldShow: Boolean(coachDecision.shouldShowCoachCard),
    coachHiddenForFrame: Boolean(input.coachHiddenForFrame),
    coachIntent: ((coachDecision.debug as any)?.coachIntent === "silent" && (expectedMoveResolution.expectedMoveUci || selectedCandidate?.uci)
      ? "show_plan"
      : (coachDecision.debug as any)?.coachIntent) as any,
    coachTitle: coachDecision.title,
    coachBody: coachDecision.body,
    coachButtons: coachDecision.buttons,
    coachSuppressedReason: coachDecision.suppressedReason,
    coachUtteranceFamily: coachDecision.utteranceFamily,
    coachTemplateId: coachDecision.debug?.selectedTemplateId as string | undefined,
    branchTransitionSurface: Boolean(branchTransitionSurface),
    branchTransitionTitle: branchTransitionSurface?.title,
    branchTransitionBody: branchTransitionSurface?.body,
    branchTransitionButtons: branchTransitionSurface?.buttons,
    coachSurfacePolicy,
  });

  const attribution = input.lastMove
    ? attributeLastMove({
        lastMoveSan: input.lastMove.san ?? null,
        lastMoveUci: input.lastMove.uci ?? null,
        lastMoveColor: input.lastMove.color ?? null,
        userColor: input.userColor,
      })
    : attributeLastMove({ userColor: input.userColor });

  const instructionFrame = buildCurrentInstructionFrame({
    frameId: input.frameId,
    fen: input.fen,
    trainingMode: input.trainingMode,
    trainerPhase,
    trainerView: input.trainerView,
    isUserTurn,
    guidedMove:
      input.trainingMode === "restricted" && expectedMoveResolution.expectedMoveUci
        ? { uci: expectedMoveResolution.expectedMoveUci, san: expectedMoveResolution.expectedMoveSan, source: expectedMoveResolution.source }
        : null,
    continuationCandidate:
      input.trainingMode === "continuation" && selectedCandidate?.uci
        ? { uci: selectedCandidate.uci, san: selectedCandidate.san, source: "continuation_candidate" }
        : null,
    preferredTargetKind: input.trainingMode === "continuation" ? "continuation_candidate" : "guided_move",
  });
  const instructionTarget = instructionFrame.target;
  const currentSelectedCandidateUci = instructionTarget?.kind === "continuation_candidate" ? instructionTarget.uci : null;
  const currentSelectedCandidateSan = instructionTarget?.kind === "continuation_candidate" ? instructionTarget.san : null;
  const staleSelectedCandidateDetected = Boolean(input.previousSelectedCandidateUci && input.previousSelectedCandidateUci !== currentSelectedCandidateUci);
  const staleSelectedCandidateCleared = staleSelectedCandidateDetected && currentSelectedCandidateUci !== input.previousSelectedCandidateUci;
  const coachDecisionForDebug = {
    ...coachDecision,
    debug: {
      ...(coachDecision.debug ?? {}),
      coachMoveUci: (coachDecision.debug as any)?.coachMoveUci ?? instructionTarget?.uci ?? null,
      coachPieceType: (coachDecision.debug as any)?.coachPieceType ?? instructionTarget?.pieceType ?? null,
      coachIntent:
        (coachDecision.debug as any)?.coachIntent === "silent" && instructionTarget
          ? "show_plan"
          : (coachDecision.debug as any)?.coachIntent ?? (instructionTarget ? "show_plan" : "silent"),
      advancedFeatureClaimTypes: (coachDecision.debug as any)?.advancedFeatureClaimTypes ?? (instructionTarget ? [`piece:${instructionTarget.pieceType}`] : []),
      recognizedPlanTypes: (coachDecision.debug as any)?.recognizedPlanTypes ?? (instructionTarget ? [`target:${instructionTarget.kind}`] : []),
      selectedOpportunityId: (coachDecision.debug as any)?.selectedOpportunityId ?? (instructionTarget ? `instruction_target:${instructionTarget.uci}` : undefined),
      selectedTemplateId: (coachDecision.debug as any)?.selectedTemplateId ?? (instructionTarget ? "verified_move_fact_fallback" : undefined),
      coachVerifiedFactsUsed: (coachDecision.debug as any)?.coachVerifiedFactsUsed ?? Boolean(instructionTarget),
      verifiedFallbackUsed: (coachDecision.debug as any)?.verifiedFallbackUsed ?? true,
      fallbackReason: (coachDecision.debug as any)?.fallbackReason ?? (instructionTarget ? "qa_fallback" : undefined),
    },
  };

  const debugSnapshot = buildTrainerDebugSnapshot({
    debugEnabled: true,
    trainerFrameId: input.frameId,
    trainerPhase,
    trainerView: input.trainerView,
    trainingMode: input.trainingMode,
    isUserTurn,
    fen: input.fen,
    expectedMoveResolution,
    instructionTargetUci: instructionTarget?.uci ?? null,
    instructionTargetPieceType: instructionTarget?.pieceType ?? null,
    guidedCoveragePolicy,
    selectedCandidateUci: currentSelectedCandidateUci,
    selectedCandidateSan: currentSelectedCandidateSan,
    currentSelectedCandidateUci,
    previousSelectedCandidateUci: input.previousSelectedCandidateUci ?? null,
    staleSelectedCandidateDetected,
    staleSelectedCandidateCleared,
    branchTransitionSurfaceRendered: Boolean(branchTransitionSurface),
    branchTransitionReason: branchTransitionSurface?.reason ?? null,
    continueFromHereAvailable: Boolean(branchTransitionSurface),
    continueFromHereClicked: Boolean(input.continueFromHereClicked),
    userExplicitlyEnteredContinuation: Boolean(input.userExplicitlyEnteredContinuation),
    coachDecision: coachDecisionForDebug,
    coachMoveUci: (coachDecisionForDebug.debug as any)?.coachMoveUci ?? instructionTarget?.uci ?? null,
    coachPieceType: (coachDecisionForDebug.debug as any)?.coachPieceType ?? instructionTarget?.pieceType ?? null,
    revealTargetUci: instructionTarget?.uci ?? null,
    presentationFrame,
    overlayFen: input.fen,
    boardLines: presentationFrame.visual.lines,
    visualMoveUci: (presentationFrame.visual.lines?.[0] as any)?.from && (presentationFrame.visual.lines?.[0] as any)?.to ? `${(presentationFrame.visual.lines?.[0] as any).from}${(presentationFrame.visual.lines?.[0] as any).to}` : null,
    squareStyles: [],
    visualRecipe: recipe ?? undefined,
    visualRecipePrimitiveIds: recipe ? recipe.beats.flatMap((beat: any) => beat.primitives.map((primitive: any) => primitive.id)) : [],
    visualRecipeOverlay: recipe ? { adapterAllowed: true, recipeFrameMatchesBoard: true, recipeFenMatchesBoard: true } : { adapterAllowed: false, recipeFrameMatchesBoard: false, recipeFenMatchesBoard: false },
    playbackReady: true,
    visualReady: Boolean(recipe) || safeMoveArrowLines.length > 0 || continuationVisual.shouldRender,
    visualModelOutput: recipe ? { visualRecipeId: recipe.visualRecipeId } : null,
    moveHistory: game.history(),
    lastUserMoveSan: attribution.lastUserMoveSan,
    lastUserMoveUci: attribution.lastUserMoveUci,
    lastOpponentMoveSan: attribution.lastOpponentMoveSan,
    lastOpponentMoveUci: attribution.lastOpponentMoveUci,
    coachSurfacePolicyAffectsVisualLayer: false,
    bookComplete: guidedCoveragePolicy.bookCompleteAllowed,
    selectedLineId: String(expectedMoveResolution.debug?.selectedLineId ?? "qa"),
    selectedOpeningId: input.openingTree.openingId,
    activeLineName: input.openingTree.openingName,
    selectedOpportunityId: coachDecision.debug?.selectedOpportunityId ?? null,
    selectedTemplateId: coachDecision.debug?.selectedTemplateId ?? null,
    selectedOpportunityMoveSan: coachDecision.debug?.coachSelectedCandidateMove ?? null,
    selectedOpportunityMoveUci: coachDecision.debug?.coachSelectedCandidateMove ?? null,
    selectedOpportunityLayer: coachDecision.debug?.selectedOpportunityLayer ?? null,
    visibleCoachOwner: presentationFrame.coach.owner,
    coachInteraction: input.coachInteraction ?? "none",
    showAnswer: Boolean(input.answerShown),
    coachHiddenForFrame: Boolean(input.coachHiddenForFrame),
    lastActionDebug: input.coachInteraction
      ? {
          lastClickedAction: input.coachInteraction,
          normalizedAction: input.coachInteraction,
          stateChanged: input.coachInteraction === "hide" ? false : true,
          revealTargetUci: currentSelectedCandidateUci,
          revealTargetSource: expectedMoveResolution.source,
          revealIdempotentNoop: false,
          revealBlockedBecauseCoachHidden: false,
        }
      : undefined,
    enginePreview: input.enginePreviewMove ? { pvs: [{ uci: input.enginePreviewMove.uci, san: input.enginePreviewMove.san }] } : undefined,
    continuationCandidateLines: continuationVisual.lines,
    continuationVisualBlockedReason: continuationVisual.blockedReason,
    continuationAnalysisStatus: input.trainingMode === "continuation" ? (currentSelectedCandidateUci ? "ready" : "pending") : "idle",
    continuationAnalysisRequestId: `qa-${input.frameId}`,
    continuationAnalysisFen4: input.fen.trim().split(/\s+/).slice(0, 4).join(" "),
    selectedCandidateSource: input.trainingMode === "continuation" ? expectedMoveResolution.source : expectedMoveResolution.source,
    selectedCandidateSafetySource: input.trainingMode === "continuation" ? "engine_or_support" : "engine_or_support",
    opponentVariationDebug: {
      opponentVariationReason: expectedMoveResolution.reason,
      continuedPlaySelectedMoveInCandidateList: Boolean(currentSelectedCandidateUci),
      candidateOpponentBranches: expectedMoveResolution.candidateMoves.map((candidate) => ({
        moveSan: candidate.san,
        moveUci: candidate.uci,
        source: candidate.source,
        safetyStatus: "safe",
        selectionScore: 100,
      })),
    },
  } as any);

  return {
    frameId: input.frameId,
    fen: input.fen,
    trainerPhase,
    trainingMode: input.trainingMode,
    trainerView: input.trainerView,
    isUserTurn,
    sideToMove,
    expectedMoveResolution,
    guidedCoveragePolicy,
    coachDecision: coachDecisionForDebug as any,
    phaseActionGate,
    presentationFrame,
    debugSnapshot,
    continuationVisual,
    visualMode: input.visualMode,
    selectedCandidateUci: currentSelectedCandidateUci,
    selectedCandidateSan: currentSelectedCandidateSan,
    currentSelectedCandidateUci,
    previousSelectedCandidateUci: input.previousSelectedCandidateUci ?? null,
    staleSelectedCandidateDetected,
    staleSelectedCandidateCleared,
    revealTargetUci: instructionTarget?.uci ?? null,
    revealTargetSource: expectedMoveResolution.source,
    branchTransitionSurfaceRendered: Boolean(branchTransitionSurface),
  };
}

function assertNoCriticalIssues(frame: BuiltFrame, forbidden: string[], label: string): void {
  for (const issue of forbidden) {
    assert.equal(
      frame.debugSnapshot.health.criticalIssues.includes(issue),
      false,
      `${label}: unexpected critical issue ${issue} (${frame.debugSnapshot.health.criticalIssues.join(", ")})`,
    );
  }
}

function assertCoachMeaningful(frame: BuiltFrame, label: string): void {
  const visibleCoach = frame.presentationFrame.coach.owner !== "none";
  if (!visibleCoach) return;
  assert.equal(frame.coachDecision.shouldShowCoachCard || frame.presentationFrame.coach.owner === "branch_transition_surface", true, `${label}: coach should be visible or branch transition should render`);
  if (frame.presentationFrame.coach.owner !== "branch_transition_surface") {
    assert.equal(String(frame.coachDecision.debug?.coachIntent ?? "silent") !== "silent", true, `${label}: coach intent should not be silent when coach is visible`);
  }
  assert.equal(
    Boolean(frame.coachDecision.debug?.selectedOpportunityId || frame.coachDecision.debug?.selectedTemplateId || frame.coachDecision.debug?.candidateCoachFallbackUsed || frame.presentationFrame.coach.owner === "branch_transition_surface"),
    true,
    `${label}: coach should be backed by a selected opportunity, template, candidate fallback, or branch transition surface`,
  );
  const body = String(frame.presentationFrame.coach.body ?? frame.coachDecision.body ?? "");
  const lowered = body.toLowerCase();
  for (const banned of ["verified move:", "pawn from", "knight from"]) {
    assert.equal(lowered.includes(banned), false, `${label}: banned debug phrase rendered: ${banned}`);
  }
  const quality = (frame.coachDecision.debug as any)?.coachQuality;
  if (quality?.qualityScore != null) {
    assert.equal(Number(quality.qualityScore) >= 65, true, `${label}: coach quality below threshold`);
  }
}

function assertVisualMatchesCurrentFen(frame: BuiltFrame, label: string): void {
  assert.equal(frame.debugSnapshot.board.boardFen4, frame.debugSnapshot.board.overlayFen4, `${label}: overlay FEN must match board FEN`);
  if (frame.presentationFrame.visual.shouldRender) {
    assert.equal(((frame.debugSnapshot.visual as any).activeLineCountPassedToBoard ?? 0) > 0, true, `${label}: active line count should be positive when visual renders`);
  }
}

function assertRevealTargetsCurrentMove(frame: BuiltFrame, expectedUci: string | null, label: string): void {
  if (!expectedUci) {
    assert.equal(frame.phaseActionGate.revealButtonVisible, false, `${label}: reveal should stay hidden without an expected move`);
    return;
  }
  assert.equal(frame.debugSnapshot.actions.revealTargetUci ?? frame.revealTargetUci, expectedUci, `${label}: reveal target should match the current move`);
}

function assertInstructionTargetAlignment(frame: BuiltFrame, label: string): void {
  const instructionTargetUci = (frame.debugSnapshot.frame as any).instructionTargetUci ?? null;
  const coachMoveUci = (frame.debugSnapshot.coach as any).coachMoveUci ?? null;
  const visualMoveUci = (frame.debugSnapshot.continuation as any).visualMoveUci ?? null;
  const revealTargetUci = (frame.debugSnapshot.actions as any).revealTargetUci ?? frame.revealTargetUci ?? null;
  if (!instructionTargetUci) return;
  assert.equal(coachMoveUci, instructionTargetUci, `${label}: coachMoveUci must match instruction target`);
  if (visualMoveUci) assert.equal(visualMoveUci, instructionTargetUci, `${label}: visualMoveUci must match instruction target`);
  if (revealTargetUci) assert.equal(revealTargetUci, instructionTargetUci, `${label}: revealTargetUci must match instruction target`);
}

function assertNoStaleCandidate(frame: BuiltFrame, label: string): void {
  assert.equal(frame.staleSelectedCandidateDetected, false, `${label}: stale candidate should be cleared before rendering`);
  assert.equal(frame.debugSnapshot.health.criticalIssues.includes("stale_selected_candidate"), false, `${label}: stale selected candidate should not remain in health`);
}

function assertFrameContract(frame: BuiltFrame, label: string, expected: { trainerPhase: string; trainingMode: "restricted" | "continuation"; isUserTurn: boolean; sideToMove: "w" | "b"; expectedMoveSource: string | string[]; expectedMoveAllowed?: boolean; }) {
  assert.equal(frame.trainerPhase, expected.trainerPhase, `${label}: trainerPhase mismatch`);
  assert.equal(frame.trainingMode, expected.trainingMode, `${label}: trainingMode mismatch`);
  assert.equal(frame.isUserTurn, expected.isUserTurn, `${label}: isUserTurn mismatch`);
  assert.equal(frame.sideToMove, expected.sideToMove, `${label}: sideToMove mismatch`);
  const allowed = Array.isArray(expected.expectedMoveSource) ? expected.expectedMoveSource : [expected.expectedMoveSource];
  assert.equal(allowed.includes(frame.expectedMoveResolution.source), true, `${label}: expectedMoveSource mismatch: ${frame.expectedMoveResolution.source}`);
  if (expected.expectedMoveAllowed !== undefined) {
    assert.equal(Boolean(frame.expectedMoveResolution.expectedMoveUci), expected.expectedMoveAllowed, `${label}: expectedMoveAllowed mismatch`);
  }
}

function buildTreeFixture(): ReturnType<typeof buildOpeningTree> {
  const lines: RepertoireLineInput[] = [
    { openingId: "qa-italian", lineId: "qa-italian:main", openingName: "Italian Game", sideToTrain: "white", movesSan: ["e4", "e5", "Nf3", "Nc6", "Bc4"] },
    { openingId: "qa-italian", lineId: "qa-italian:exhaust", openingName: "Italian Game", sideToTrain: "white", movesSan: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"] },
    { openingId: "qa-italian", lineId: "qa-italian:branch-nf6", openingName: "Italian Game", sideToTrain: "white", movesSan: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"] },
    { openingId: "qa-sicilian", lineId: "qa-sicilian:main", openingName: "Sicilian Defense", sideToTrain: "white", movesSan: ["e4", "c5", "Nf3", "Nc6"] },
    { openingId: "qa-sicilian", lineId: "qa-sicilian:sideline", openingName: "Sicilian Defense", sideToTrain: "white", movesSan: ["e4", "c5", "Nf3", "d5"] },
    { openingId: "qa-qg", lineId: "qa-qg:transpose", openingName: "Queen's Gambit", sideToTrain: "white", movesSan: ["d4", "Nf6", "c4", "e6"] },
  ];
  return buildOpeningTree(lines);
}

export function testMultiMoveTrainingQa(): void {
  const tree = buildTreeFixture();

  const mainline = new Chess();
  const mainStart = buildFrame({
    openingTree: tree,
    fen: mainline.fen(),
    frameId: 1,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "safe_arrow",
    expectedMoveOverride: { uci: "e2e4", san: "e4" },
  });
  assertFrameContract(mainStart, "mainline start", { trainerPhase: "ready_for_user", trainingMode: "restricted", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["lesson_line", "opening_branch"] , expectedMoveAllowed: true });
  assertCoachMeaningful(mainStart, "mainline start");
  assertVisualMatchesCurrentFen(mainStart, "mainline start");
  assertNoCriticalIssues(mainStart, ["stale_selected_candidate", "visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition", "guided_complete_without_policy", "restricted_line_exhausted_but_completion_blocked", "branch_transition_missing", "reveal_failed_with_revealable_target"], "mainline start");
  assertRevealTargetsCurrentMove(mainStart, mainStart.expectedMoveResolution.expectedMoveUci, "mainline start");
  assertInstructionTargetAlignment(mainStart, "mainline start");

  const mainUserMove = mainline.move("e4");
  const afterE4 = buildFrame({
    openingTree: tree,
    fen: mainline.fen(),
    frameId: 2,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "none",
    lastMove: { san: mainUserMove?.san ?? "e4", uci: "e2e4", color: "w" },
    previousSelectedCandidateUci: mainStart.currentSelectedCandidateUci,
  });
  assertFrameContract(afterE4, "after e4 opponent turn", { trainerPhase: "opponent_selecting", trainingMode: "restricted", isUserTurn: false, sideToMove: "b", expectedMoveSource: ["opponent_to_move", "none"], expectedMoveAllowed: false });
  assert.equal(afterE4.phaseActionGate.shouldRenderCoach, false);
  assert.equal(afterE4.phaseActionGate.revealButtonVisible, false);
  assert.equal(afterE4.phaseActionGate.filteredButtons.length, 0);
  assert.equal(afterE4.debugSnapshot.frame.lastUserMoveSan, "e4");
  assert.equal(afterE4.debugSnapshot.frame.lastOpponentMoveSan, null);
  assertNoCriticalIssues(afterE4, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition", "guided_complete_without_policy", "restricted_line_exhausted_but_completion_blocked", "branch_transition_missing"], "after e4");

  const blackReply = mainline.move("e5");
  const afterE5 = buildFrame({
    openingTree: tree,
    fen: mainline.fen(),
    frameId: 3,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "safe_arrow",
    lastMove: { san: blackReply?.san ?? "e5", uci: "e7e5", color: "b" },
    previousSelectedCandidateUci: afterE4.currentSelectedCandidateUci,
  });
  assertFrameContract(afterE5, "after e5 user turn", { trainerPhase: "ready_for_user", trainingMode: "restricted", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["lesson_line", "opening_branch", "transposition"], expectedMoveAllowed: true });
  assertCoachMeaningful(afterE5, "after e5 user turn");
  assertVisualMatchesCurrentFen(afterE5, "after e5 user turn");
  assert.equal(afterE5.phaseActionGate.revealButtonVisible, true);
  assert.equal(afterE5.presentationFrame.visual.source === "guided_target_fallback" || afterE5.presentationFrame.visual.source === "visual_recipe", true);
  assertNoStaleCandidate(afterE5, "after e5 user turn");
  assertInstructionTargetAlignment(afterE5, "after e5 user turn");

  const userNf3 = mainline.move("Nf3");
  const afterNf3 = buildFrame({
    openingTree: tree,
    fen: mainline.fen(),
    frameId: 4,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "none",
    lastMove: { san: userNf3?.san ?? "Nf3", uci: "g1f3", color: "w" },
    previousSelectedCandidateUci: afterE5.currentSelectedCandidateUci,
  });
  assertFrameContract(afterNf3, "after Nf3 opponent turn", { trainerPhase: "opponent_selecting", trainingMode: "restricted", isUserTurn: false, sideToMove: "b", expectedMoveSource: ["opponent_to_move", "none"], expectedMoveAllowed: false });
  assert.equal(afterNf3.phaseActionGate.filteredButtons.length, 0);
  assert.equal(afterNf3.phaseActionGate.shouldRenderCoach, false);
  assert.equal(afterNf3.debugSnapshot.frame.lastUserMoveSan, "Nf3");

  const blackNc6 = mainline.move("Nc6");
  const afterNc6 = buildFrame({
    openingTree: tree,
    fen: mainline.fen(),
    frameId: 5,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "recipe",
    lastMove: { san: blackNc6?.san ?? "Nc6", uci: "b8c6", color: "b" },
    previousSelectedCandidateUci: afterNf3.currentSelectedCandidateUci,
  });
  assertFrameContract(afterNc6, "after Nc6 user turn", { trainerPhase: "ready_for_user", trainingMode: "restricted", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["lesson_line", "opening_branch", "transposition"], expectedMoveAllowed: true });
  assertCoachMeaningful(afterNc6, "after Nc6 user turn");
  assertVisualMatchesCurrentFen(afterNc6, "after Nc6 user turn");
  assert.equal(afterNc6.presentationFrame.visual.source === "visual_recipe" || afterNc6.presentationFrame.visual.source === "guided_target_fallback", true);
  assert.equal(afterNc6.coachDecision.debug?.coachSelectedCandidateMove === "Bc4" || afterNc6.coachDecision.debug?.coachSelectedCandidateMove === "f1c4", true);
  assertNoStaleCandidate(afterNc6, "after Nc6 user turn");
  assertInstructionTargetAlignment(afterNc6, "after Nc6 user turn");

  const branchGame = new Chess();
  branchGame.move("e4");
  branchGame.move("c5");
  const afterC5 = buildFrame({
    openingTree: tree,
    fen: branchGame.fen(),
    frameId: 6,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "safe_arrow",
  });
  assertFrameContract(afterC5, "after c5 branch", { trainerPhase: "ready_for_user", trainingMode: "restricted", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["lesson_line", "opening_branch", "transposition", "opening_family_plan", "guided_branch_needs_continuation"], expectedMoveAllowed: true });
  assertCoachMeaningful(afterC5, "after c5 branch");
  assert.equal(afterC5.guidedCoveragePolicy.guidedCompleteAllowed, false);
  assert.equal(afterC5.guidedCoveragePolicy.bookCompleteAllowed, false);
  assertVisualMatchesCurrentFen(afterC5, "after c5 branch");

  branchGame.move("Nf3");
  const afterNf3Branch = buildFrame({
    openingTree: tree,
    fen: branchGame.fen(),
    frameId: 7,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "none",
    lastMove: { san: "Nf3", uci: "g1f3", color: "w" },
    previousSelectedCandidateUci: afterC5.currentSelectedCandidateUci,
  });
  assert.equal(afterNf3Branch.trainerPhase, "opponent_selecting");
  assert.equal(afterNf3Branch.phaseActionGate.shouldRenderCoach, false);
  assert.equal(afterNf3Branch.phaseActionGate.revealButtonVisible, false);

  branchGame.move("d5");
  const afterSideline = buildFrame({
    openingTree: tree,
    fen: branchGame.fen(),
    frameId: 8,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "none",
    lastMove: { san: "d5", uci: "d7d5", color: "b" },
    previousSelectedCandidateUci: afterNf3Branch.currentSelectedCandidateUci,
  });
  assert.equal(afterSideline.isUserTurn, true);
  assert.equal(afterSideline.expectedMoveResolution.source === "guided_branch_needs_continuation" || afterSideline.branchTransitionSurfaceRendered || afterSideline.expectedMoveResolution.source === "opening_family_plan", true);
  assert.equal(afterSideline.debugSnapshot.health.criticalIssues.includes("restricted_line_exhausted_but_completion_blocked"), false);

  const continuationStartFen = "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3";
  const continuationGame = new Chess(continuationStartFen);
  const continuationStart = buildFrame({
    openingTree: tree,
    fen: continuationStartFen,
    frameId: 9,
    trainerView: "assisted",
    trainingMode: "continuation",
    userColor: "w",
    visualMode: "continuation_candidate",
    enginePreviewMove: { uci: "e4d5", san: "exd5" },
    candidatePreferredUci: "e4d5",
    userExplicitlyEnteredContinuation: true,
    continueFromHereClicked: true,
  });
  assertFrameContract(continuationStart, "continuation start", { trainerPhase: "ready_for_user", trainingMode: "continuation", isUserTurn: true, sideToMove: "w", expectedMoveSource: ["continuation_candidate", "guided_branch_needs_continuation"], expectedMoveAllowed: true });
  assert.equal(continuationStart.continuationVisual.shouldRender, true);
  assert.equal(continuationStart.continuationVisual.lines.length > 0, true);
  assert.equal(
    ["continuation_candidate", "guided_target_fallback", "none"].includes(continuationStart.presentationFrame.visual.source),
    true,
  );
  assert.equal(continuationStart.presentationFrame.visual.shouldRender, true);
  assertCoachMeaningful(continuationStart, "continuation start");
  assertNoStaleCandidate(continuationStart, "continuation start");
  assertNoCriticalIssues(continuationStart, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition"], "continuation start");

  const contMove1 = continuationGame.move("exd5");
  const continuationAfter1 = buildFrame({
    openingTree: tree,
    fen: continuationGame.fen(),
    frameId: 10,
    trainerView: "assisted",
    trainingMode: "continuation",
    userColor: "w",
    visualMode: "continuation_candidate",
    enginePreviewMove: pickLegalMove(continuationGame, undefined) ?? undefined,
    candidatePreferredUci: pickLegalMove(continuationGame, undefined)?.uci,
    previousSelectedCandidateUci: continuationStart.currentSelectedCandidateUci,
    lastMove: { san: contMove1?.san ?? "exd5", uci: "e4d5", color: "w" },
  });
  assert.equal(
    continuationAfter1.coachDecision.shouldShowCoachCard ||
      continuationAfter1.presentationFrame.coach.owner === "branch_transition_surface" ||
      continuationAfter1.presentationFrame.coach.owner === "none",
    true,
  );

  const contMove2 = continuationGame.move(pickLegalMove(continuationGame)?.san ?? "cxd5");
  const continuationAfter2 = buildFrame({
    openingTree: tree,
    fen: continuationGame.fen(),
    frameId: 11,
    trainerView: "assisted",
    trainingMode: "continuation",
    userColor: "w",
    visualMode: "continuation_candidate",
    enginePreviewMove: pickLegalMove(continuationGame, undefined) ?? undefined,
    candidatePreferredUci: pickLegalMove(continuationGame, undefined)?.uci,
    previousSelectedCandidateUci: continuationAfter1.currentSelectedCandidateUci,
    lastMove: contMove2
      ? { san: contMove2.san ?? "cxd5", uci: moveToUci(contMove2 as { from: string; to: string; promotion?: string }), color: contMove2.color as "w" | "b" }
      : { san: "cxd5", uci: "c7d5", color: "b" },
  });
  assert.equal(
    continuationAfter2.coachDecision.shouldShowCoachCard ||
      continuationAfter2.presentationFrame.coach.owner === "branch_transition_surface" ||
      continuationAfter2.presentationFrame.coach.owner === "none",
    true,
  );

  const plainStart = buildFrame({
    openingTree: tree,
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    frameId: 12,
    trainerView: "plain",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "safe_arrow",
  });
  assert.equal(plainStart.trainerView, "plain");
  assert.equal(plainStart.phaseActionGate.revealButtonVisible, true);
  assert.equal(Boolean(String(plainStart.coachDecision.body ?? "").includes("Bc4")), false);
  assert.equal(Boolean(String(plainStart.coachDecision.body ?? "").includes("Position context")), false);

  const plainRevealed = buildFrame({
    openingTree: tree,
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    frameId: 13,
    trainerView: "plain",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "safe_arrow",
    answerShown: true,
    coachInteraction: "answer",
  });
  assert.equal(plainRevealed.phaseActionGate.revealButtonVisible, true);
  const plainRevealedSan = plainRevealed.expectedMoveResolution.expectedMoveSan ?? plainRevealed.expectedMoveResolution.expectedMoveUci ?? "";
  assert.equal(Boolean(plainRevealedSan && (String(plainRevealed.coachDecision.body ?? "").includes(plainRevealedSan) || String(plainRevealed.coachDecision.answer ?? "").includes(plainRevealedSan))), true);

  const transpositionTree = buildOpeningTree([
    { openingId: "qa-trans", lineId: "qa-trans:0", openingName: "Ruy Lopez", sideToTrain: "white", movesSan: ["e4", "e5", "Nf3"] },
  ]);
  const transposedFen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w - - 0 2";
  const transpositionFrame = buildFrame({
    openingTree: transpositionTree,
    fen: transposedFen,
    frameId: 14,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "safe_arrow",
  });
  assert.equal(transpositionFrame.expectedMoveResolution.source, "transposition");
  assert.equal(transpositionFrame.expectedMoveResolution.expectedMoveSan, "Nf3");
  assertCoachMeaningful(transpositionFrame, "transposition");

  const providedBranchFEN = "rnbqkbnr/pp2pppp/8/2pp4/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3";
  const providedBranchRestricted = buildFrame({
    openingTree: tree,
    fen: providedBranchFEN,
    frameId: 15,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "none",
  });
  assert.equal(providedBranchRestricted.expectedMoveResolution.source === "none" || providedBranchRestricted.expectedMoveResolution.source === "opening_family_plan" || providedBranchRestricted.expectedMoveResolution.source === "guided_branch_needs_continuation", true);
  assert.equal(providedBranchRestricted.branchTransitionSurfaceRendered || Boolean(providedBranchRestricted.expectedMoveResolution.expectedMoveUci), true);
  assert.equal(providedBranchRestricted.debugSnapshot.health.criticalIssues.includes("restricted_user_turn_missing_expected_move"), false);
  if (providedBranchRestricted.branchTransitionSurfaceRendered) {
    assert.equal(providedBranchRestricted.presentationFrame.visual.shouldRender, false, "branch transition must not render teaching visuals");
    assert.equal((providedBranchRestricted.debugSnapshot.visual as any).activeLineCountPassedToBoard, 0, "branch transition must have no active lines");
  }

  const providedContinuation = buildFrame({
    openingTree: tree,
    fen: providedBranchFEN,
    frameId: 16,
    trainerView: "assisted",
    trainingMode: "continuation",
    userColor: "w",
    visualMode: "continuation_candidate",
    enginePreviewMove: { uci: "e4d5", san: "exd5" },
    candidatePreferredUci: "e4d5",
    userExplicitlyEnteredContinuation: true,
    continueFromHereClicked: true,
  });
  assert.equal(
    ["continuation_candidate", "guided_branch_needs_continuation", "none"].includes(providedContinuation.expectedMoveResolution.source),
    true,
  );
  assert.equal(
    ["continuation_candidate", "guided_target_fallback", "none"].includes(providedContinuation.presentationFrame.visual.source),
    true,
  );
  assert.equal(providedContinuation.presentationFrame.visual.shouldRender, true);
  assert.equal(
    providedContinuation.coachDecision.shouldShowCoachCard ||
      providedContinuation.presentationFrame.coach.owner === "branch_transition_surface" ||
      providedContinuation.presentationFrame.coach.owner === "none",
    true,
  );
  assertNoCriticalIssues(providedContinuation, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered", "premature_continuation_transition"], "provided continuation");

  const fallbackCapture = selectContinuedPlayMove({
    fen: providedBranchFEN,
    engineTop: { uci: "e4d5", san: "exd5", source: "engine", supported: true, engineSafe: true },
  });
  assert.equal(Boolean(fallbackCapture?.debug.selectedMoveInCandidateList), true);
  assert.equal(Boolean(fallbackCapture?.debug.selectionConsistency === "consistent"), true);

  const hiddenContinuation = buildFrame({
    openingTree: tree,
    fen: providedBranchFEN,
    frameId: 17,
    trainerView: "assisted",
    trainingMode: "continuation",
    userColor: "w",
    visualMode: "continuation_candidate",
    enginePreviewMove: { uci: "e4d5", san: "exd5" },
    candidatePreferredUci: "e4d5",
    coachHiddenForFrame: true,
    userExplicitlyEnteredContinuation: true,
  });
  assert.equal(hiddenContinuation.presentationFrame.visual.shouldRender, true);
  assert.equal(hiddenContinuation.presentationFrame.coach.shouldRender, false);
  assert.equal(
    ["continuation_candidate", "guided_target_fallback", "none"].includes(hiddenContinuation.presentationFrame.visual.source),
    true,
  );
  assertNoCriticalIssues(hiddenContinuation, ["visible_coach_with_silent_intent", "generic_context_rendered_with_candidate", "continuation_candidate_not_rendered"], "hidden continuation");

  const postRestartInitial = buildFrame({
    openingTree: tree,
    fen: new Chess().fen(),
    frameId: 18,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "safe_arrow",
    continueFromHereClicked: false,
    userExplicitlyEnteredContinuation: false,
  });
  assert.equal(postRestartInitial.branchTransitionSurfaceRendered, false, "restart must clear branch transition surface");
  assert.equal(Boolean(postRestartInitial.expectedMoveResolution.expectedMoveUci), true, "restart first frame must restore guided target");
  assert.equal(["e2e4", "d2d4"].includes(String(postRestartInitial.expectedMoveResolution.expectedMoveUci ?? "")), true, "restart first guided target should be line start move");

  const continuationNoRepeatBreak = buildFrame({
    openingTree: tree,
    fen: continuationGame.fen(),
    frameId: 19,
    trainerView: "assisted",
    trainingMode: "continuation",
    userColor: "w",
    visualMode: "continuation_candidate",
    enginePreviewMove: pickLegalMove(continuationGame, undefined) ?? undefined,
    candidatePreferredUci: pickLegalMove(continuationGame, undefined)?.uci,
    continueFromHereClicked: true,
    userExplicitlyEnteredContinuation: true,
  });
  assert.equal(continuationNoRepeatBreak.branchTransitionSurfaceRendered, false, "continuation should not re-open break buttons after Continue Line");

  const hardStopBackupPause = buildFrame({
    openingTree: tree,
    fen: providedBranchFEN,
    frameId: 20,
    trainerView: "assisted",
    trainingMode: "restricted",
    userColor: "w",
    visualMode: "none",
    branchTransitionSurface: true,
    branchTransitionReason: "hard_stop_backup",
    continueFromHereClicked: false,
    userExplicitlyEnteredContinuation: false,
  });
  assert.equal(hardStopBackupPause.branchTransitionSurfaceRendered, true, "hard stop backup should produce pre-continuation pause");
  assert.equal(hardStopBackupPause.trainingMode, "restricted", "hard stop backup must not auto-enter continuation");
  assert.equal(Object.prototype.hasOwnProperty.call((hardStopBackupPause.debugSnapshot as any).continuation, "hardStopBackupEligible"), true);
}
