"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Chess } from "chess.js";
import { BarChart3, Beaker, BookOpen, CheckCircle2, ChevronRight, Cloud, Eye, Flame, Home, Plus, RotateCcw, Search, Settings, Target, Trophy, X, XCircle, Zap } from "lucide-react";
import { getStockfishTopMovesForValidation } from "@/lib/blundr/engine/stockfishValidation";
import { mapEngineLinesToStockfishTopMoves, rateContinuationUserMove, validateContinuationSuggestionAgainstStockfish } from "@/lib/blundr/engine/stockfishContinuationValidation";
import type { ContinuationUserMoveRatingResult, MoveStrengthRating } from "@/lib/blundr/engine/stockfishEvaluationTypes";
import {
  MOVE_QUALITY_GATE_VERSION,
  buildMoveQualityCacheKey,
  evaluateTopTwoMatch,
  type MoveQualityResult,
} from "@/lib/blundr/teaching/moveQualityGate";
import { orchestrateTeaching } from "@/lib/blundr/teaching/teachingOrchestrator";
import { TEACHING_CUE_COMPILER_VERSION } from "@/lib/blundr/teaching/teachingCueTypes";
import {
  shouldRenderOpponentLastMoveHighlight,
  type OverlayPhase,
} from "@/lib/blundr/teaching/overlayLifecycle";
import { adaptVisualRecipe } from "@/lib/blundr/visualRecipe/visualRecipeAdapter";
import { compileVisualRecipe } from "@/lib/blundr/visualRecipe/visualRecipeCompiler";
import { useVisualRecipePlayback } from "@/components/board/useVisualRecipePlayback";
import { createLearningSessionId, recordLearningEvent } from "@/lib/blundr/learning/learningEvents";
import type { LearningEvent } from "@/lib/blundr/learning/learningEvents";
import { loadOpponentVariationMemory, recordOpponentChoice } from "@/lib/blundr/opponent/opponentVariationMemory";
import { selectOpponentCandidateWithVariation } from "@/lib/blundr/opponent/opponentVariationPolicy";
import { CoachCard } from "@/components/coach/CoachCard";
import { buildCoachContext } from "@/lib/blundr/coach/coachContextBuilder";
import { decideCoachOutput } from "@/lib/blundr/coach/coachDecisionEngine";
import { buildCoachUtteranceRecordKey, loadCoachUtteranceMemory, readCoachUtteranceMemoryMeta, recordCoachUtterance } from "@/lib/blundr/coach/coachUtteranceMemory";
import type { CoachButton } from "@/lib/blundr/coach/coachTypes";
import { buildPositionEvidence } from "@/lib/blundr/liveCoach/positionEvidenceBuilder";
import { profileCandidateMoves } from "@/lib/blundr/liveCoach/candidateMoveProfiler";
import { rankPedagogicalOpportunities } from "@/lib/blundr/liveCoach/pedagogicalOpportunityEngine";
import { selectBestLiveComment } from "@/lib/blundr/liveCoach/liveCoachCommentRanker";
import { pickLiveCoachCopy } from "@/lib/blundr/liveCoach/liveCoachCopyLibrary";
import { selectIntentForOpportunity } from "@/lib/blundr/liveCoach/liveCoachIntentSelector";
import { shouldLiveCoachStaySilent } from "@/lib/blundr/liveCoach/liveCoachSilencePolicy";
import { validateLiveCoachCopy } from "@/lib/blundr/liveCoach/liveCoachSafety";
import { buildLiveCoachDebug } from "@/lib/blundr/liveCoach/liveCoachDebug";
import { buildCoachExplanationPipeline, buildVerifiedUserFacingFallback, isDebugLeakText } from "@/lib/blundr/coachBrain/coachExplanationPipeline";
import { filterLegacyMainUiLines } from "@/lib/blundr/visualRecipe/legacyVisualSuppression";
import { selectContinuedPlayMove, shouldForceContinuationPause } from "@/lib/blundr/continuedPlay/continuedPlayMovePolicy";
import { decideCoachSurfacePolicy } from "@/lib/blundr/coachSurface/coachSurfacePolicy";
import { presentMoveImpact } from "@/lib/blundr/coachSurface/moveImpactPresenter";
import { computeTrainerPresentationFrame } from "@/lib/blundr/presentation/trainerPresentationFrame";
import { attributeLastMove, decideTrainerPhaseActionGate } from "@/lib/blundr/presentation/phaseActionGating";
import { buildVisibleTeachingSurface } from "@/lib/blundr/presentation/buildVisibleTeachingSurface"; // v2.7.40 Agent 3: single visible owner surface
import { buildLiveVisibleTeachingSurface } from "@/lib/blundr/presentation/buildLiveVisibleTeachingSurface";
import { adaptVisibleSurfaceToBoardVisuals, adaptVisibleSurfaceToCoachUi } from "@/lib/blundr/presentation/uiSurfaceAdapter";
import { isV28VisibleSurfaceEnabled } from "@/lib/blundr/presentation/featureFlags";
import { buildContinuationCandidateVisual } from "@/lib/blundr/visual/continuationCandidateVisual";
import { buildOpeningTree } from "@/lib/blundr/openings/openingTree";
import { resolveExpectedMoveForFrame } from "@/lib/blundr/openings/expectedMoveResolver";
import { buildOpeningResolverDebug } from "@/lib/blundr/openings/openingResolverDebug";
import { STAGE2_OPENING_AVAILABILITY_MATRIX, getStage2OpeningAvailability } from "@/lib/blundr/openings/openingAvailability";
import {
  STAGE2_RUNTIME_TRAINABLE_REPERTOIRES,
  getStage2RuntimeTrainableRepertoire,
  selectRuntimeWeightedOpeningSelection,
  selectRuntimeWeightedTrainingLineSelection,
  updateRuntimeTrainingLineKeys,
  type RuntimeWeightedTrainingLineSelection,
} from "@/lib/blundr/openings/runtimeTrainableRepertoires";
import { resolveStage2CanonicalOpeningId } from "@/lib/blundr/openings/openingIdentity";
import {
  resolveAdaptiveOpeningIdentity,
  type AdaptiveOpeningIdentity,
} from "@/lib/blundr/openings/adaptiveOpeningIdentity";
import { decideGuidedCoveragePolicy } from "@/lib/blundr/openings/guidedCoveragePolicy";
import type { RepertoireLineInput } from "@/lib/blundr/openings/openingTypes";
import { buildCurrentInstructionFrame, isBookLikeInstructionTarget } from "@/lib/blundr/runtime/currentInstructionFrame";
import { resolveBranchCompleteContract } from "@/lib/blundr/runtime/branchCompleteContract";
import { resolveContinuationFlowContract } from "@/lib/blundr/runtime/continuationFlowContract";
import { shouldFlagStaleOpponentReplyCommit } from "@/lib/blundr/runtime/opponentReplyGuard";
import { resolveRestrictedOpponentReplyAuthority } from "@/lib/blundr/runtime/restrictedOpponentReplyAuthority";
import { applyRuntimeUciMove } from "@/lib/blundr/runtime/uciReplay";
import { DEFAULT_GUIDED_COVERAGE_THRESHOLDS } from "@/lib/blundr/openings/guidedCoveragePolicy";
import { resolveRestrictedRuntimeBookHandoff } from "@/lib/blundr/runtime/restrictedRuntimeBookHandoff";
import { resolveStage2TerminalProof } from "@/lib/blundr/runtime/terminalProof";
import { getPendingPromotionFromAttempt, resolvePromotionAuthority, type PendingPromotion, type PromotionPiece } from "@/lib/blundr/runtime/promotionAuthority";
import { classifyContinuationRuntimeState, type ContinuationRuntimeStatus } from "@/lib/blundr/runtime/continuationRuntimeState";
import { resolveEffectiveContinuationCandidate } from "@/lib/blundr/runtime/resolveEffectiveContinuationCandidate";
import {
  STAGE2_APPROVED_CONTENT_ENABLED,
  STAGE2_COACHING_RESOLVER_ENABLED,
  STAGE2_SAFE_FALLBACK_ENABLED,
  resolveStage2CoachRenderState,
} from "@/lib/blundr/stage2Coaching";
import type { MaiaMoveCandidate, MaiaOpponentReplyResult, MaiaProviderStatus, MaiaSkillLevel } from "@/lib/blundr/maia/maiaTypes";
import { unavailableMaiaProvider } from "@/lib/blundr/maia/maiaProvider";
import { MaiaApiClientProvider } from "@/lib/blundr/maia/maiaApiClientProvider";
import { buildMaiaOpponentReplyDecision, classifyMaiaProviderStatus, evaluateMaiaSanityGuard, resolveMaiaSkillLevel, selectMaiaOpponentReply, withMaiaTimeout } from "@/lib/blundr/maia/maiaOpponentProvider";
import { applyMaiaMoveOnRequestFen } from "@/lib/blundr/maia/maiaLegalityRequestFenContract";
import { appendMaiaTimeline, createMaiaTimelineEvent, type MaiaTimelineEvent } from "@/lib/blundr/debug/maiaTimeline";
import { collectTrainerDebugSnapshot } from "@/lib/blundr/debug/trainerDebugCollector";
import { buildTrainerFrameResolution } from "@/lib/blundr/debug/buildTrainerFrameResolution";
import { computeInstructionFrameKey } from "@/lib/blundr/runtime/currentInstructionFrame";  // v2.7.39.1 Target Locking (Coach Perfection Gate)
import { analyzeBlundrPosition } from "@/lib/blundr/brain/analyzeBlundrPosition";  // v2.7.39.2+ Brain facade for 2.7.39.3 coach migration
import { appendDebugEvent } from "@/lib/blundr/debug/trainerDebugEventLog";
import { isBlundrDebugEnabled } from "@/lib/blundr/debug/trainerDebugGuards";
import type { DebugEvent } from "@/lib/blundr/debug/trainerDebugTypes";

const BlundrDiagnosticsPanel = dynamic(
  () => import("@/components/debug/BlundrDiagnosticsPanel").then((mod) => mod.BlundrDiagnosticsPanel),
  { ssr: false, loading: () => null },
);

type Tab = "home" | "train" | "review" | "progress" | "repertoire";
type RepertoireColor = "white" | "black";
type ChessColor = "w" | "b";
type ActiveBoardView = "attack" | "defense" | "plan";
type TrainingMode = "restricted" | "continuation";
type TrainerView = "assisted" | "plain";
type SystemState = "off" | "ready" | "loading" | "active" | "cached" | "fallback" | "error" | "complete";
type ThinkingStep = "idle" | "facts" | "engine" | "brain" | "gpt-receive" | "visual-update" | "ready" | "error";
type PatternCueStatus = "ready" | "pending" | "suppressed" | "plain" | "wrong_move" | "manual_reveal";
type PatternCue = {
  title: string;
  snippet: string;
  next?: string;
  status: PatternCueStatus;
  source: "rule_visual" | "local_fast" | "plain" | "pending" | "suppressed" | "manual";
  concept?: string;
  selectedMove?: string;
};
type Repertoire = { id: string; name: string; color: RepertoireColor; lines: string[][]; description: string; custom?: boolean };
type Continuation = { san: string; uci: string; color: ChessColor; resultingFen: string };
type Mistake = { fen: string; expectedMove: string; playedMove: string; count: number; opening: string; repertoireId: string };
type Progress = { attempts: number; correct: number; incorrect: number; streak: number; trainedPositions: Record<string, boolean>; mistakes: Record<string, Mistake> };
type ExplorerMove = { uci: string; san: string; total: number; pct: number; averageRating?: number };
type EngineLine = { san: string; uci: string; cp?: number; line: string };
type LineKind = "attack" | "defense" | "plan" | "opponent";
type ActiveLine = { from: string; to: string; kind: LineKind; label?: string };
type SquareCue = { square: string; kind: "origin" | "target" | "support" | "danger" | "opponent" };
type BoardView = { title: string; message: string; lines: ActiveLine[]; cues: SquareCue[] };
type BrainAnnotation = { source: string; fallback: boolean; selectedView: ActiveBoardView; headline: string; mainExplanation: string; visualExplanation: string; planExplanation: string; nextPlan: string; keySquares: string[]; planArrows: ActiveLine[]; attack: BoardView; defense: BoardView; plan: BoardView; threatNote?: string; suppress?: string[]; confidence?: string; reason?: string };
type BrainResponse = { pipeline: { facts: string; engine: string; gpt: string; visual: string; latencyMs: number }; engine: { source: string; fallback: boolean; pvs: EngineLine[] }; annotation: BrainAnnotation; candidates?: any; debug?: any };
type VisualArrowRole = "move" | "pressure" | "defense" | "future" | "threat" | "capture" | "retreat" | "pin" | "castle" | string;
type VisualSquareRole = "source" | "destination" | "weakness" | "center" | "defense" | "danger" | "future" | "soft_target" | "king_safety" | string;
type VisualModelArrow = { from: string; to: string; role?: VisualArrowRole; kind?: LineKind; label?: string; reason?: string };
type VisualModelSquare = { square: string; role?: VisualSquareRole; kind?: SquareCue["kind"]; reason?: string };
type VisualModelContext = { headline: string; body: string; next: string; checkQuestion?: string; explanationMode?: string; concept?: string; selectedMove?: string };
type VisualModelOutput = Partial<BrainAnnotation> & { arrows?: VisualModelArrow[]; squares?: VisualModelSquare[]; animation?: string; animationPackage?: { name: string; intensity?: number }; context?: VisualModelContext; suppress?: string[]; debug?: any };
type VisualDebugSnapshot = {
  requestKey: string | null;
  requestPayload: Record<string, unknown> | null;
  responseSummary: Record<string, unknown> | null;
  responseDebug: Record<string, unknown> | null;
  error: string | null;
  durationMs: number | null;
  updatedAt: number | null;
};
type LocalTelemetryEvent = {
  id: number;
  ts: number;
  event: "visual_request" | "visual_response" | "visual_error" | "visual_suppressed";
  details: Record<string, unknown>;
};
type LocalTelemetryStore = { enabled: boolean; events: LocalTelemetryEvent[]; updatedAt: number };
type OpponentCue = { expiresAt: number; title: string; message: string; lines: ActiveLine[]; cues: SquareCue[]; committed: boolean; fen: string };
type OpponentVariationDebug = {
  opponentVariationApplied: boolean;
  opponentVariationReason: string;
  recentOpponentBranchKeys: string[];
  selectedOpponentBranchKey?: string;
  candidateOpponentBranches: Array<{ branchKey: string; uci: string; san?: string; baseWeight: number; adjustedWeight: number; source?: string; safetyStatus?: string; selectionScore?: number; blockedReason?: string }>;
  blockedThirdRepeatBranches: string[];
  fallbackUsed: boolean;
  continuedPlaySelectedMoveInCandidateList?: boolean;
  continuedPlaySelectionConsistency?: "consistent" | "inconsistent";
  continuationMoveSafetySource?: string;
};
type PendingOpponentRequest = {
  requestId: number;
  baseFen: string;
  mode: TrainingMode;
  startedAt: number;
};
type RuntimeBookFrameCandidate = {
  uci: string;
  san?: string;
  source: "book";
  supported: true;
  runtimeBookSource: "stage2-runtime-book";
  rank?: number;
  totalGames?: number;
  playPct?: number;
  profile?: string;
  profiles?: string;
  sourceDetail?: string;
  sources?: string;
};
type RuntimeBookFrameQueryState = {
  openingId: string | null;
  playKeyBefore: string | null;
  candidates: RuntimeBookFrameCandidate[];
  hasRuntimeBookCandidates: boolean;
  bookExhausted: boolean;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
};
const HARD_CONTINUATION_BREAK_PLY = 22;
const SUGGESTION_VALIDATION_MULTIPV = 10;
const USER_MOVE_RATING_MULTIPV = 32;
const MAIA_OPPONENT_TIMEOUT_MS = 1500;
const MAIA_MAX_ALLOWED_OPPONENT_CP_LOSS = 500;
const MAIA_OPPONENT_REPLY_SANITY_GUARD_ENABLED = true;
const maiaApiClientEnabled = process.env.NEXT_PUBLIC_MAIA_API_ENABLED === "true";
const maiaOpponentProvider = maiaApiClientEnabled ? new MaiaApiClientProvider() : unavailableMaiaProvider;
type LiveBrain = { ratingLabel: string; ratingPool: string; book: SystemState; lichess: SystemState; engine: SystemState; gpt: SystemState; source: string; latency?: number; note?: string };
type LastCoachRecord = {
  frameId: number;
  fen4: string;
  trainerPhase: string;
  trainingMode: string;
  instructionTargetKind: string | null;
  instructionTargetUci: string | null;
  instructionTargetSan: string | null;
  instructionTargetPieceType: string | null;
  coachMoveUci: string | null;
  coachPieceType: string | null;
  visualMoveUci: string | null;
  revealTargetUci: string | null;
  selectedTemplateId: string | null;
  utteranceFamily: string | null;
  selectedOpportunityId: string | null;
  selectedPlanId: string | null;
  body: string;
  normalizedBody: string;
  verifiedClaims: string[];
  unverifiedClaims: string[];
  blockedUnsafeTemplateIds: string[];
};
type CoachSessionLogEntry = {
  id: number;
  ts: number;
  trainerFrameId: number;
  fen4: string;
  trainerPhase: string;
  trainingMode: string;
  isUserTurn: boolean;
  entryKind: "instructional" | "opponent_status" | "terminal" | "line_complete" | "system" | "error";
  instructionTargetUci: string | null;
  instructionTargetSan: string | null;
  instructionTargetPieceType: string | null;
  visibleTitle: string | null;
  visibleBody: string | null;
  visibleButtons: string[];
  coachDecisionSource: string | null;
  selectedTheme: string | null;
  selectedOpportunityId: string | null;
  selectedOpportunityLayer: string | null;
  selectedOpportunityScore: number | null;
  selectedTemplateId: string | null;
  runtimeSafeFallbackUsed: boolean;
  runtimeSafeFallbackReason: string | null;
  containsDebugLeak: boolean;
  qualityScore: number | null;
  hasPedagogicalReason: boolean;
  repeatedGeneric: boolean;
  targetAligned: boolean | "not_applicable";
  pieceAligned: boolean | "not_applicable";
  criticalIssuesAtFrame: string[];
  warningsAtFrame: string[];
};
type CoachCardRenderTimelineEntry = {
  id: number;
  ts: number;
  frameId: number;
  ply: number;
  fen4: string;
  trainerPhase: string;
  trainerView: TrainerView;
  trainingMode: TrainingMode;
  isUserTurn: boolean;
  coachInteraction: string;
  answerShown: boolean;
  hintShown: boolean;
  instructionKind: string | null;
  instructionTargetUci: string | null;
  instructionTargetSan: string | null;
  instructionTargetPieceType: string | null;
  expectedMoveUci: string | null;
  expectedMoveSan: string | null;
  visibleTitle: string | null;
  visibleBody: string | null;
  visibleButtons: string[];
  actualCoachCardTitle: string | null;
  actualCoachCardBody: string | null;
  actualCoachCardButtons: string[];
  actualCoachCardSource: string | null;
  visibleSurfaceMode: string | null;
  visibleSurfaceOwner: string | null;
  visibleCoachOwner: string | null;
  coachIntent: string | null;
  coachDecisionSource: string | null;
  runtimeSafeFallbackUsed: boolean;
  runtimeSafeFallbackReason: string | null;
  surfaceSafetyBlocked: boolean;
  surfaceSafetyBlockedReason: string | null;
  surfaceSafetyBlockedSeverity: string | null;
  surfaceSafetyRecoveredBySafeTeachingCopy: boolean;
  plainLeakDetected: boolean;
  targetAligned: boolean | "not_applicable";
  pieceAligned: boolean | "not_applicable";
  visualTargetAligned: boolean | "not_applicable";
  revealTargetAligned: boolean | "not_applicable";
  renderedVisualPrimitiveCount: number;
  renderedActionIds: string[];
  renderedRevealTargetUci: string | null;
  criticalIssuesAtFrame: string[];
  warningsAtFrame: string[];
  pipelineCoachCardTitle?: string | null;
  pipelineCoachCardBody?: string | null;
  pipelineCoachCardSource?: string | null;
  pipelineQualityScore?: number | null;
  renderedQualityScore?: number | null;
  qualityScoreSource?: string | null;
  qualityScoreReasonCodes?: string[];
  pipelineCopyRejected?: boolean;
  pipelineCopyRejectedReason?: string | null;
  renderedCopyAuthority?: string | null;
  pipelineCopyAuthority?: string | null;
  preAuthoritySurfaceTitle?: string | null;
  preAuthoritySurfaceBody?: string | null;
  preAuthoritySurfaceOwner?: string | null;
  preAuthoritySurfaceReason?: string | null;
};
type BoardTheme = "classic" | "slate" | "blue" | "walnut";
type PieceStyle = "unicode" | "letters" | "neo";
type BoardSettings = { boardTheme: BoardTheme; pieceStyle: PieceStyle; showAttack: boolean; showDefense: boolean; showPlan: boolean; showMoveDots: boolean; showEvalBar: boolean; showCaptured: boolean; showOpponentCue: boolean };
type CapturedSummary = { whiteCaptured: string[]; blackCaptured: string[]; materialAdvantage: { side: ChessColor | null; value: number } };

const DEFAULT_PROGRESS: Progress = { attempts: 0, correct: 0, incorrect: 0, streak: 0, trainedPositions: {}, mistakes: {} };
const PIECE_SYMBOLS: Record<string, string> = { wp:"♙", wn:"♘", wb:"♗", wr:"♖", wq:"♕", wk:"♔", bp:"♟", bn:"♞", bb:"♝", br:"♜", bq:"♛", bk:"♚" };
const LETTER_PIECES: Record<string, string> = { wp:"P", wn:"N", wb:"B", wr:"R", wq:"Q", wk:"K", bp:"p", bn:"n", bb:"b", br:"r", bq:"q", bk:"k" };
const NEO_PIECES: Record<string, string> = { wp:"♙", wn:"♘", wb:"♗", wr:"♖", wq:"♕", wk:"♔", bp:"♟", bn:"♞", bb:"♝", br:"♜", bq:"♛", bk:"♚" };
const PIECE_VALUES: Record<string, number> = { p:1, n:3, b:3, r:5, q:9, k:0 };
const INITIAL_COUNTS: Record<ChessColor, Record<string, number>> = { w:{p:8,n:2,b:2,r:2,q:1,k:1}, b:{p:8,n:2,b:2,r:2,q:1,k:1} };
const DEFAULT_BOARD_SETTINGS: BoardSettings = { boardTheme:"classic", pieceStyle:"unicode", showAttack:true, showDefense:true, showPlan:true, showMoveDots:true, showEvalBar:true, showCaptured:true, showOpponentCue:true };
const LOCAL_TELEMETRY_KEY = "blundr-v27-local-telemetry";
const STAGE2_RUNTIME_TRAINING_LINE_MEMORY_KEY = "blundr-stage2-runtime-training-line-memory-v1";
const MAX_LOCAL_TELEMETRY_EVENTS = 120;
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const FILE_TO_INDEX: Record<string, number> = Object.fromEntries(FILES.map((f, i) => [f, i]));
const RATING_PRESETS = [
  { label: "New", value: "1000", target: "<1000", skill: 800 },
  { label: "Beginner", value: "1000,1200", target: "1000–1200", skill: 1100 },
  { label: "Improver", value: "1000,1200,1400", target: "1000–1400", skill: 1300 },
  { label: "Club", value: "1200,1400,1600", target: "1200–1600", skill: 1500 },
  { label: "Strong", value: "1600,1800", target: "1600–1800", skill: 1700 },
  { label: "Advanced", value: "1800,2000,2200", target: "1800–2200", skill: 2000 },
  { label: "Expert+", value: "2200,2500", target: "2200+", skill: 2300 },
  { label: "All", value: "1000,1200,1400,1600,1800,2000,2200,2500", target: "All", skill: 1600 },
];
const OPENINGS: Repertoire[] = [
  { id:"italian-white", name:"Italian Game", color:"white", description:"Develop fast, pressure f7, castle, and prepare c3–d4.", lines:[["e4","e5","Nf3","Nc6","Bc4","Bc5","c3","Nf6","d3","d6","O-O","O-O","Re1","a6","Bb3","Ba7","Nbd2"],["e4","e5","Nf3","Nc6","Bc4","Nf6","d3","Bc5","c3","d6","O-O","O-O","Re1"],["e4","e5","Nf3","Nf6","Nxe5","d6","Nf3","Nxe4","d4","d5","Bd3","Be7","O-O","O-O"],["e4","c5","Nf3","d6","d4","cxd4","Nxd4","Nf6","Nc3","a6","Be3","e5","Nb3","Be6","f3"],["e4","e6","d4","d5","Nc3","Nf6","e5","Nfd7","f4","c5","Nf3"],["e4","c6","d4","d5","Nc3","dxe4","Nxe4","Bf5","Ng3","Bg6","h4","h6"]] },
  { id:"ruy-white", name:"Ruy Lopez", color:"white", description:"Pressure e5, build with c3/Re1, and prepare d4.", lines:[["e4","e5","Nf3","Nc6","Bb5","a6","Ba4","Nf6","O-O","Be7","Re1","b5","Bb3","d6","c3","O-O","h3"],["e4","e5","Nf3","Nc6","Bb5","Nf6","O-O","Nxe4","d4","Nd6","Bxc6","dxc6","dxe5","Nf5"],["e4","e5","Nf3","Nc6","Bb5","a6","Ba4","Nf6","O-O","Nxe4","d4","b5","Bb3","d5"]] },
  { id:"queens-gambit-white", name:"Queen's Gambit", color:"white", description:"Use central tension to pressure d5 and develop cleanly.", lines:[["d4","d5","c4","e6","Nc3","Nf6","Bg5","Be7","e3","O-O","Nf3","h6","Bh4"],["d4","d5","c4","c6","Nf3","Nf6","Nc3","dxc4","a4","Bf5","e3","e6"],["d4","Nf6","c4","e6","Nc3","Bb4","e3","O-O","Bd3","d5","Nf3","c5"]] },
  { id:"london-white", name:"London System", color:"white", description:"Build a stable setup, support d4, and look for e4/Ne5 ideas.", lines:[["d4","Nf6","Bf4","d5","e3","e6","Nf3","Bd6","Bg3","O-O","Bd3","b6","Nbd2"],["d4","d5","Bf4","Nf6","e3","e6","Nf3","c5","c3","Nc6","Nbd2"]] },
  { id:"caro-black", name:"Caro-Kann as Black", color:"black", description:"Build a resilient center and challenge e4/d4 without weakening the king.", lines:[["e4","c6","d4","d5","Nc3","dxe4","Nxe4","Bf5","Ng3","Bg6","h4","h6"],["e4","c6","d4","d5","e5","Bf5","Nf3","e6","Be2","c5","O-O","Nc6"],["e4","c6","d4","d5","exd5","cxd5","Nf3","Nf6","Bd3","Nc6"]] },
  { id:"sicilian-black", name:"Sicilian as Black", color:"black", description:"Use asymmetry to fight for d4 and create active counterplay.", lines:[["e4","c5","Nf3","d6","d4","cxd4","Nxd4","Nf6","Nc3","a6","Be3","e5"],["e4","c5","Nf3","Nc6","d4","cxd4","Nxd4","Nf6","Nc3","d6"],["e4","c5","c3","Nf6","e5","Nd5","d4","cxd4","Nf3"]] },
  { id:"french-black", name:"French Defense as Black", color:"black", description:"Challenge the white center with ...d5 and pressure the pawn chain.", lines:[["e4","e6","d4","d5","Nc3","Nf6","e5","Nfd7","f4","c5","Nf3","Nc6"],["e4","e6","d4","d5","Nd2","Nf6","e5","Nfd7","Bd3","c5"]] },
  { id:"kings-indian-black", name:"King's Indian as Black", color:"black", description:"Allow White's center, then counter with ...e5 or ...c5 and kingside activity.", lines:[["d4","Nf6","c4","g6","Nc3","Bg7","e4","d6","Nf3","O-O","Be2","e5","O-O","Nc6"],["d4","Nf6","c4","g6","Nf3","Bg7","g3","O-O","Bg2","d6","O-O","Nc6"]] }
];

function classNames(...classes:Array<string|false|null|undefined>){return classes.filter(Boolean).join(" ")}
function normalizeFen(fen:string){return fen.split(" ").slice(0,4).join(" ")}
function buildRuntimeFrameKey(input:{fen:string;trainerPhase:string;trainerView:TrainerView;trainingMode:TrainingMode;isUserTurn:boolean;instructionTargetUci:string|null}){return `${normalizeFen(input.fen)}|${input.trainerPhase}|${input.trainerView}|${input.trainingMode}|${input.isUserTurn?"user":"opp"}|${input.instructionTargetUci??"none"}`}
function moveToUci(move:{from:string;to:string;promotion?:string}){return `${move.from}${move.to}${move.promotion??""}`}
function resolveRuntimeOpeningId(repertoireId:string):string|null{
  return resolveStage2CanonicalOpeningId(repertoireId);
}
function buildRuntimePlayKeyBeforeFromSanHistory(historySan:string[]):string|null{
  if(!historySan.length)return null;
  try{
    const game=new Chess();
    const ucis:string[]=[];
    for(const san of historySan){
      const move=game.move(san);
      if(!move)return null;
      ucis.push(moveToUci(move));
    }
    return ucis.length?ucis.join(","):null;
  }catch{
    return null;
  }
}
function normalizeRuntimeTrainingLineKeys(value:unknown):string[]{
  return Array.isArray(value)
    ? value.map((entry)=>String(entry ?? "").trim()).filter((entry)=>entry.length>0)
    : [];
}
function countMatchedRuntimeLinePlies(reference:string[], current:string[]):number{
  const limit=Math.min(reference.length,current.length);
  let matched=0;
  for(;matched<limit;matched+=1){
    if(reference[matched]!==current[matched])break;
  }
  return matched;
}
function buildRuntimeTrainingLineSelection(openingId:string,recentLineKeys:string[],seed:string,repertoire?:Repertoire):RuntimeWeightedTrainingLineSelection | null{
  const runtimeRepertoire=getStage2RuntimeTrainableRepertoire(openingId);
  const selection=selectRuntimeWeightedTrainingLineSelection({
    openingId,
    recentLineKeys,
    seed,
    repertoire: runtimeRepertoire ?? null,
  });
  if(selection)return selection;
  const line=repertoire?.lines[0] ?? [];
  const playSequenceUci=buildRuntimePlayKeyBeforeFromSanHistory(line)?.split(",").filter(Boolean) ?? [];
  const playKey=playSequenceUci.join(",");
  const lineId=`${openingId}:0`;
  const lineKey=`${lineId}:${playKey}`;
  return {
    mode:"runtime_weighted_line",
    source:"local_runtime_package",
    openingId,
    selectedLineId:lineId,
    selectedLineKey:lineKey,
    selectedLineIndex:0,
    selectedPlayKey:playKey,
    selectedPlaySequenceUci:playSequenceUci,
    eligibleCount:line.length>0?1:0,
    eligibleLineIds:line.length>0?[lineId]:[],
    eligibleLineKeys:line.length>0?[lineKey]:[],
    weighted:true,
    recentLineKeys:recentLineKeys.slice(0,2),
    blockedRecentLineKeys:[],
    blockedThirdRepeatLineKeys:[],
    variationReason:line.length>0?"fallback_curated_line":"no_runtime_line_available",
    repeatUnavoidable:false,
    selectionSeed:seed,
    lineWeightsSummary:line.length>0?[{
      openingId,
      lineId,
      lineKey,
      lineIndex:0,
      playKey,
      moveCount:playSequenceUci.length,
      weight:Math.max(1, playSequenceUci.length),
    }]:[],
  };
}
function isValidSquare(square:string){return /^[a-h][1-8]$/.test(square)}
// v2.7.40 P1 Fix 3: shared reverse guard (also in continuedPlay policy) to break emergency legal fallback loops (Ra1<->Ra2 etc)
function isImmediateReverseOf(prevUci:string|null|undefined, candidateUci:string):boolean{
  if(!prevUci||prevUci.length<4||candidateUci.length<4)return false;
  const pFrom=prevUci.slice(0,2),pTo=prevUci.slice(2,4);
  const cFrom=candidateUci.slice(0,2),cTo=candidateUci.slice(2,4);
  return cFrom===pTo&&cTo===pFrom;
}
function visualLineKind(role?:string,kind?:LineKind):LineKind{if(kind&&["attack","defense","plan","opponent"].includes(kind))return kind;if(role==="defense"||role==="retreat"||role==="castle")return"defense";if(role==="pressure"||role==="threat"||role==="capture"||role==="pin")return"attack";return"plan"}
function visualCueKind(role?:string,kind?:SquareCue["kind"]):SquareCue["kind"]{if(kind&&["origin","target","support","danger","opponent"].includes(kind))return kind;if(role==="source")return"origin";if(role==="defense"||role==="king_safety")return"support";if(role==="weakness"||role==="danger"||role==="soft_target")return"danger";return"target"}
function visualAnimationClass(name?:string){const known=new Set(["quiet-development-glow","diagonal-pressure-glow","knight-pressure-center","center-break-pulse","castle-safety-aura","weak-square-pulse","pin-line-tension","fork-spark","defensive-shield","open-file-radar","queen-danger-warning","continuation-ghost-plan"]);return known.has(name??"")?`blundr-anim-${name}`:"blundr-anim-quiet-development-glow"}
function getPiece(game:Chess,square:string){return game.get(square as any)}
function isOwnPiece(game:Chess,square:string,color:ChessColor){const p=getPiece(game,square);return Boolean(p&&p.color===color)}
function pickWeighted<T extends {weight:number}>(items:T[]){const total=items.reduce((s,i)=>s+Math.max(0,i.weight),0);if(total<=0)return items[0];let roll=Math.random()*total;for(const item of items){roll-=Math.max(0,item.weight);if(roll<=0)return item}return items[0]}
function ratingPreset(value:string){return RATING_PRESETS.find(p=>p.value===value)??RATING_PRESETS[3]}
function buildTree(rep:Repertoire){const tree:Record<string,Continuation[]>={};for(const line of rep.lines){const game=new Chess();for(const san of line){const key=normalizeFen(game.fen());try{const move=game.move(san);if(!move)break;const cont={san:move.san,uci:moveToUci(move),color:move.color as ChessColor,resultingFen:game.fen()};const ex=tree[key]??[];tree[key]=ex.some(x=>x.uci===cont.uci)?ex:[...ex,cont]}catch{break}}}return tree}
function repertoireLineInputs(rep:Repertoire):RepertoireLineInput[]{return rep.lines.map((line,index)=>({openingId:rep.id,lineId:`${rep.id}:${index}`,openingName:rep.name,sideToTrain:rep.color,movesSan:line}))}
function countPositions(rep:Repertoire){return buildOpeningTree(repertoireLineInputs(rep)).nodeCount}
function getAccuracy(progress:Progress){return progress.attempts?Math.round((progress.correct/progress.attempts)*100):0}
function parseExplorerMoves(payload:any):ExplorerMove[]{const moves=Array.isArray(payload?.moves)?payload.moves:[];const denom=moves.reduce((s:number,m:any)=>s+(m.white??0)+(m.draws??0)+(m.black??0),0)||1;return moves.map((m:any)=>{const total=(m.white??0)+(m.draws??0)+(m.black??0);return{uci:m.uci,san:m.san,total,pct:Math.round((total/denom)*100),averageRating:m.averageRating}}).filter((m:ExplorerMove)=>m.uci&&m.total>0)}
function applyUci(fen:string,uci:string){try{const game=new Chess(fen);const move=applyRuntimeUciMove(game,uci);if(!move)return null;return{san:move.san,uci:moveToUci(move),fen:game.fen(),color:move.color as ChessColor}}catch{return null}}
function blankAnnotation():BrainAnnotation{return{source:"initial",fallback:true,selectedView:"plan",headline:"Ready",mainExplanation:"Make a move or tap Reveal Next Move.",visualExplanation:"The board can now show a fast local cue immediately while Brain refines the coaching text.",planExplanation:"Restricted mode keeps you inside the selected opening.",nextPlan:"Play the highlighted training move when available.",keySquares:[],planArrows:[],attack:{title:"Your attack",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},defense:{title:"Your defense",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},plan:{title:"Plan",message:"Fast local visuals will appear as soon as training starts.",lines:[],cues:[]},confidence:"initial"}}
function isKnightGeometry(from:string,to:string){if(!isValidSquare(from)||!isValidSquare(to))return false;const df=Math.abs(FILE_TO_INDEX[from[0]]-FILE_TO_INDEX[to[0]]);const dr=Math.abs(Number(from[1])-Number(to[1]));return(df===1&&dr===2)||(df===2&&dr===1)}
function lineFromContinuation(move:Continuation,kind:LineKind="plan"):ActiveLine{return{from:move.uci.slice(0,2),to:move.uci.slice(2,4),kind,label:move.san}}
function lineFromVerboseMove(move:any,kind:LineKind="plan"):ActiveLine{return{from:move.from,to:move.to,kind,label:move.san??moveToUci(move)}}
function lineFromEngine(fen:string,line:EngineLine,kind:LineKind="plan"):ActiveLine|null{const applied=applyUci(fen,line.uci);if(!applied)return null;return{from:line.uci.slice(0,2),to:line.uci.slice(2,4),kind,label:applied.san||line.san||line.uci}}
function engineAnnotationFromLine({fen,line,openingName}: {fen:string;line:EngineLine;openingName:string}):BrainAnnotation{
  const base=blankAnnotation();
  const visual=lineFromEngine(fen,line,"plan");
  if(!visual)return{...base,source:"engine pending",fallback:true,headline:"Checking continuation",mainExplanation:"Blundr Brain is checking the continuation before highlighting a move.",visualExplanation:"No random legal fallback is shown as a recommendation.",planExplanation:"Wait for the teaching cue.",nextPlan:"Teaching cue pending.",plan:{title:"Checking continuation",message:"Blundr Brain is checking the continuation.",lines:[],cues:[]},confidence:"engine-pending"};
  const cues:SquareCue[]=[{square:visual.from,kind:"origin"},{square:visual.to,kind:"target"}];
  const move=visual.label??line.san??line.uci;
  return{...base,source:"manual analysis",fallback:false,selectedView:"plan",headline:`Suggested continuation: ${move}`,mainExplanation:`Manual analysis currently prefers ${move}.`,visualExplanation:"The highlighted move is analysis-backed, not a placeholder legal move.",planExplanation:`Use ${move} as the current continuation while explanation text stays concise.`,nextPlan:`Play ${move}.`,keySquares:[visual.to],planArrows:[visual],attack:{title:"Active continuation",message:`${move} is the current continuation.`,lines:[{...visual,kind:"attack"}],cues},defense:{title:"Safety check",message:"The recommendation is validated by local analysis.",lines:[],cues:[{square:visual.from,kind:"support"}]},plan:{title:`${openingName}: continuation plan`,message:`Analysis-backed continuation: ${move}.`,lines:[visual],cues},confidence:"analysis"};
}
function deriveFastAnnotation({fen,openingName,userColor,trainingMode,expectedUserOptions,opponentBookOptions}: {fen:string;openingName:string;userColor:ChessColor;trainingMode:TrainingMode;expectedUserOptions:Continuation[];opponentBookOptions:Continuation[]}):BrainAnnotation{
  const local=new Chess(fen);
  const userTurn=local.turn()===userColor;
  const base:BrainAnnotation=blankAnnotation();
  if(local.isGameOver())return{...base,source:"fast local",fallback:true,headline:"Game over",mainExplanation:"This line has reached a terminal position.",visualExplanation:"No training cue is shown because the game is over.",planExplanation:"Restart the opening to train again.",nextPlan:"Restart or choose another repertoire.",plan:{title:"Game over",message:"Restart the opening to continue training.",lines:[],cues:[]},confidence:"local"};
  if(userTurn&&trainingMode==="restricted"&&expectedUserOptions.length){
    const lines=expectedUserOptions.slice(0,2).map(m=>lineFromContinuation(m,"plan"));
    const cues:SquareCue[]=lines.flatMap(l=>[{square:l.from,kind:"origin" as const},{square:l.to,kind:"target" as const}]);
    const moveText=expectedUserOptions.map(m=>m.san).join(" / ");
    return{...base,source:"fast local repertoire",fallback:true,selectedView:"plan",headline:`${openingName}: play ${moveText}`,mainExplanation:`The saved repertoire expects ${moveText}.`,visualExplanation:"The board is showing the source and destination for the current saved training move immediately.",planExplanation:"Stay inside the restricted opening line by playing the highlighted move.",nextPlan:`Play ${moveText}.`,keySquares:lines.map(l=>l.to),planArrows:lines,attack:{title:"Current attacking/development idea",message:`The immediate training move is ${moveText}. Use this view as a fast cue, not a tactical claim.`,lines:lines.map(l=>({...l,kind:"attack" as LineKind})),cues},defense:{title:"Current responsibility",message:"Restricted mode first checks whether the move belongs to your saved repertoire. Deeper defensive motifs are refined after the local cue appears.",lines:[],cues:lines.map(l=>({square:l.from,kind:"support" as const}))},plan:{title:"Fast local plan",message:`Play ${moveText} to continue the saved ${openingName} branch.`,lines,cues},confidence:"local"};
  }
  if(userTurn&&trainingMode==="restricted"&&!expectedUserOptions.length){
    return{...base,source:"fast local book complete",fallback:true,headline:"Book complete",mainExplanation:"The saved repertoire branch has ended on your turn.",visualExplanation:"No move is highlighted because there is no saved restricted-mode continuation.",planExplanation:"Choose Train Again or Continue vs Bot.",nextPlan:"Continue vs Bot to accept normal legal moves from this position.",plan:{title:"Book complete",message:"No saved move remains for this branch.",lines:[],cues:[]},confidence:"local"};
  }
  if(!userTurn&&trainingMode==="restricted"&&opponentBookOptions.length){
    return{...base,source:"fast local opponent book",fallback:true,selectedView:"plan",headline:"Opponent selecting move",mainExplanation:"The opponent is selecting a supported opening reply.",visualExplanation:"Opponent candidate branches are not shown on the main board before commit.",planExplanation:"After commit, the last opponent move is shown briefly.",nextPlan:"Wait for the opponent move to be committed.",keySquares:[],planArrows:[],attack:{title:"Opponent selecting",message:"Candidate branches stay in debug only until commit.",lines:[],cues:[]},defense:{title:"Prepare for reply",message:"Your next teaching cue appears after the opponent move is committed.",lines:[],cues:[]},plan:{title:"Opponent selecting",message:"Waiting for committed opponent move.",lines:[],cues:[]},confidence:"local"};
  }
  return{...base,source:"engine pending",fallback:true,selectedView:"plan",headline:trainingMode==="continuation"&&userTurn?"Checking continuation":"Waiting for opponent",mainExplanation:trainingMode==="continuation"&&userTurn?"Blundr Brain is checking the continuation before showing a cue.":"The opponent is selecting a continuation.",visualExplanation:"No provisional legal-move recommendation is drawn. The next plan visual appears only when it is validated.",planExplanation:trainingMode==="continuation"&&userTurn?"Wait for the teaching cue.":"Wait for the opponent move.",nextPlan:trainingMode==="continuation"&&userTurn?"Teaching cue pending.":"Wait for the opponent move.",attack:{title:"Checking",message:"Attack cues are withheld until the move is validated.",lines:[],cues:[]},defense:{title:"Checking",message:"Defense cues are withheld until the move is validated.",lines:[],cues:[]},plan:{title:"Checking continuation",message:"Blundr Brain is checking the continuation.",lines:[],cues:[]},confidence:"engine-pending"};
}
function impactFromEngine(line?:EngineLine){
  const cp=line?.cp;
  if(typeof cp!=="number")return{label:"Training",pct:64,tone:"bg-green-700",note:"Move impact will use Brain endpoint engine output when available."};
  if(cp>180)return{label:"Strong",pct:92,tone:"bg-green-700",note:"Blundr Brain likes this continuation."};
  if(cp>80)return{label:"Stable",pct:74,tone:"bg-green-600",note:"Healthy continuation."};
  if(cp>20)return{label:"Playable",pct:58,tone:"bg-yellow-500",note:"Playable continuation."};
  return{label:"Needs care",pct:36,tone:"bg-orange-600",note:"Look for a more forcing or developing move."};
}

function compactText(value:unknown,fallback:string,max=140){
  const text=typeof value==="string"&&value.trim()?value.trim().replace(/\s+/g," "):fallback;
  return text.length>max?`${text.slice(0,Math.max(0,max-1)).trim()}…`:text;
}

function normalizeCoachBody(body:string){
  return body
    .toLowerCase()
    .replace(/[.,!?;:]/g," ")
    .replace(/\b[a-h][1-8][a-h][1-8][qrbn]?\b/g," {MOVE} ")
    .replace(/\b[a-h][1-8]\b/g," {SQUARE} ")
    .replace(/\b(pawn|knight|bishop|rook|queen|king)\b/g," {PIECE} ")
    .replace(/\s+/g," ")
    .trim();
}

const GENERIC_COACH_TITLE_MARKERS = [
  "active piece development",
  "avoid blocking center pawn",
  "improve your position",
  "continue the position",
  "status",
];

const GENERIC_COACH_BODY_MARKERS = [
  "improve your position",
  "keeps the position moving",
  "continue the position",
  "develops play and keeps the position moving",
];

function looksGenericCoachTitle(title:string){
  const lower=title.toLowerCase();
  return GENERIC_COACH_TITLE_MARKERS.some((token)=>lower.includes(token));
}

function looksGenericCoachBody(body:string){
  const lower=body.toLowerCase();
  return GENERIC_COACH_BODY_MARKERS.some((token)=>lower.includes(token));
}

function moveSpecificityHint(text:string,moveSan:string|null,moveUci:string|null){
  const lower=text.toLowerCase();
  if(moveSan&&lower.includes(moveSan.toLowerCase()))return true;
  if(moveUci&&lower.includes(moveUci.toLowerCase()))return true;
  return /\b[a-h][1-8]\b/.test(text);
}

function computeRenderedCoachQuality(input:{
  renderedTitle:string|null;
  renderedBody:string|null;
  pipelineTitle:string|null;
  pipelineBody:string|null;
  pipelineSource:string|null;
  pipelineQualityScore:number|null;
  moveSan:string|null;
  moveUci:string|null;
  runtimeSafeFallbackUsed:boolean;
  runtimeSafeFallbackReason:string|null;
  recentRenderedBodies:string[];
}){
  const reasons:string[]=[];
  const renderedTitle=String(input.renderedTitle??"").trim();
  const renderedBody=String(input.renderedBody??"").trim();
  const pipelineTitle=String(input.pipelineTitle??"").trim();
  const pipelineBody=String(input.pipelineBody??"").trim();
  const pipelineSource=String(input.pipelineSource??"").trim()||null;
  const hasRenderedCopy=Boolean(renderedTitle||renderedBody);
  const renderedBodyStem=normalizeCoachBody(renderedBody);
  const repeatedStemCount=input.recentRenderedBodies.filter((entry)=>normalizeCoachBody(String(entry))===renderedBodyStem).length;
  let renderedQualityScore=88;
  if(!hasRenderedCopy){
    renderedQualityScore=0;
    reasons.push("missing_rendered_copy");
  }
  if(renderedTitle&&looksGenericCoachTitle(renderedTitle)){
    renderedQualityScore-=35;
    reasons.push("raw_or_generic_title");
  }
  if(renderedBody&&looksGenericCoachBody(renderedBody)){
    renderedQualityScore-=20;
    reasons.push("generic_body_template");
  }
  if(renderedBodyStem&&repeatedStemCount>=2){
    renderedQualityScore-=18;
    reasons.push("repeated_body_stem");
  }
  if(!moveSpecificityHint(renderedBody,input.moveSan,input.moveUci)){
    renderedQualityScore-=10;
    reasons.push("missing_move_specific_reason");
  }
  if(input.runtimeSafeFallbackUsed){
    renderedQualityScore-=8;
    reasons.push(input.runtimeSafeFallbackReason==="claim_validation_failed"?"claim_validation_fallback":"runtime_safe_fallback");
  }
  const renderedVsPipelineMismatch=Boolean(
    pipelineTitle&&pipelineBody&&
    (pipelineTitle!==renderedTitle||pipelineBody!==renderedBody)
  );
  const pipelineLooksBetter=Boolean(
    renderedVsPipelineMismatch &&
    !looksGenericCoachTitle(pipelineTitle) &&
    moveSpecificityHint(pipelineBody,input.moveSan,input.moveUci) &&
    (looksGenericCoachTitle(renderedTitle)||looksGenericCoachBody(renderedBody))
  );
  if(pipelineLooksBetter){
    renderedQualityScore-=20;
    reasons.push("rendered_vs_pipeline_mismatch");
  }
  renderedQualityScore=Math.max(0,Math.min(100,renderedQualityScore));
  const pipelineQualityScore=Number.isFinite(Number(input.pipelineQualityScore))?Number(input.pipelineQualityScore):null;
  return {
    hasVisibleCoach:hasRenderedCopy,
    userFacingCopy:true,
    containsDebugLeak:false,
    targetAligned:true,
    pieceAligned:true,
    hasPedagogicalReason:renderedQualityScore>=70,
    hasVerifiedTheme:true,
    selectedTheme:null,
    evidenceTags:[],
    usedFallback:Boolean(input.runtimeSafeFallbackUsed),
    fallbackReason:input.runtimeSafeFallbackReason??null,
    repeatedGeneric:repeatedStemCount>=2||looksGenericCoachTitle(renderedTitle)||looksGenericCoachBody(renderedBody),
    qualityScore:renderedQualityScore,
    pipelineQualityScore,
    renderedQualityScore,
    qualityScoreSource:"rendered_coach_card",
    qualityScoreReasonCodes:reasons,
    pipelineSource,
  };
}

function getRecentInstructionalCoachRecords(records:LastCoachRecord[],limit=5){
  return records.filter((entry)=>entry.trainerPhase==="ready_for_user"&&Boolean(entry.instructionTargetUci)).slice(-limit);
}

function normalizeCoachEntryKind(input:{trainerPhase:string;isUserTurn:boolean;instructionTargetUci:string|null;runtimeCriticalIssues?:string[]}):CoachSessionLogEntry["entryKind"]{
  if((input.runtimeCriticalIssues??[]).some((issue)=>String(issue).toLowerCase().includes("error")))return "error";
  if(input.trainerPhase==="terminal")return "terminal";
  if(input.trainerPhase==="line_complete")return "line_complete";
  if(input.trainerPhase==="opponent_selecting"||input.trainerPhase==="opponent_replying")return "opponent_status";
  if(input.trainerPhase==="ready_for_user"&&input.isUserTurn&&input.instructionTargetUci)return "instructional";
  return "system";
}

function applyThemeProvenance(debug:any){
  const theme=String(debug?.selectedTheme??debug?.coachQuality?.selectedTheme??"").trim()||null;
  if(!theme)return debug;
  const map:Record<string,{layer:string;minScore:number;planTypes:string[];templateHints:string[]}>={
    minor_piece_development:{layer:"development",minScore:320,planTypes:["development","opportunity:minor_piece_development"],templateHints:["minor_piece_development"]},
    central_pawn_advance:{layer:"center",minScore:330,planTypes:["center","opportunity:central_pawn_advance"],templateHints:["central_pawn_advance"]},
    capture_or_recapture:{layer:"tactical",minScore:450,planTypes:["tactical","opportunity:capture_or_recapture"],templateHints:["capture_or_recapture"]},
    bishop_activation:{layer:"development",minScore:300,planTypes:["development","opportunity:bishop_activation"],templateHints:["bishop_activation"]},
    checkmate:{layer:"tactical",minScore:1000,planTypes:["tactical","opportunity:checkmate"],templateHints:["checkmate"]},
    castle_king_safety:{layer:"king_safety",minScore:350,planTypes:["king_safety","opportunity:castle_king_safety"],templateHints:["castle","king_safety"]},
    center_support:{layer:"center",minScore:280,planTypes:["center","opportunity:center_support"],templateHints:["center_support"]},
    stable_continuation:{layer:"fallback",minScore:100,planTypes:["stable_continuation"],templateHints:["stable_continuation"]},
  };
  const rule=map[theme];
  if(!rule)return debug;
  const currentTemplate=String(debug?.selectedTemplateId??"");
  const templateMatches=rule.templateHints.some((hint)=>currentTemplate.includes(hint));
  const selectedTemplateId=templateMatches?currentTemplate:(debug?.verifiedFallbackUsed||debug?.candidateCoachFallbackUsed||debug?.coachQuality?.usedFallback?`fallback:${theme}:verified_safe`:`live:${theme}:${rule.layer==="tactical"?"explain_tactic":rule.layer==="center"?"explain_center":rule.layer==="development"?"explain_development":"explain_plan"}`);
  const existingPlanTypes=Array.isArray(debug?.recognizedPlanTypes)?debug.recognizedPlanTypes:[];
  const selectedPlanType=String(debug?.selectedPlanType??existingPlanTypes[0]??"");
  const selectedOpportunityScore=Math.max(Number(debug?.selectedOpportunityScore??0)||0,rule.minScore);
  return {
    ...debug,
    selectedTheme:theme,
    selectedOpportunityId:theme==="stable_continuation"&&debug?.selectedOpportunityId&&!String(debug.selectedOpportunityId).includes("supported_continuation")?debug.selectedOpportunityId:theme,
    selectedOpportunityLayer:rule.layer,
    selectedOpportunityScore,
    selectedPlanType:selectedPlanType||rule.planTypes[0],
    recognizedPlanTypes:existingPlanTypes.length?existingPlanTypes:[rule.planTypes[0]],
    selectedTemplateId,
  };
}

function normalizeCoachDebugMetadata(debug:any){
  const withProvenance=applyThemeProvenance(debug??{});
  const quality=withProvenance?.coachQuality??{};
  const fallbackByReason=Boolean(withProvenance?.fallbackReason||quality?.fallbackReason);
  const fallbackByFlag=Boolean(withProvenance?.verifiedFallbackUsed||withProvenance?.candidateCoachFallbackUsed||quality?.usedFallback);
  const source=String(withProvenance?.coachDecisionSource??quality?.source??"").trim();
  const fallbackBySource=source==="verified_safe_fallback";
  const runtimeSafeFallbackUsed=fallbackByFlag||fallbackBySource||fallbackByReason;
  const runtimeSafeFallbackReason=String(withProvenance?.fallbackReason??quality?.fallbackReason??"").trim()||null;
  const normalizedSource=runtimeSafeFallbackUsed?"verified_safe_fallback":(source||"live_coach");
  const hasTarget=Boolean(withProvenance?.coachMoveUci);
  const numericScore=Number(withProvenance?.selectedOpportunityScore);
  const selectedOpportunityScore=Number.isFinite(numericScore)&&numericScore>0?numericScore:(hasTarget?100:null);
  return {
    ...withProvenance,
    coachDecisionSource:normalizedSource,
    verifiedFallbackUsed:runtimeSafeFallbackUsed,
    fallbackReason:runtimeSafeFallbackUsed?(runtimeSafeFallbackReason??"verified_safe_fallback"):null,
    selectedOpportunityScore,
    coachQuality:{
      ...quality,
      source:normalizedSource,
      usedFallback:runtimeSafeFallbackUsed,
      fallbackReason:runtimeSafeFallbackUsed?(runtimeSafeFallbackReason??"verified_safe_fallback"):null,
      selectedTheme:withProvenance?.selectedTheme??quality?.selectedTheme??null,
      qualityScore:quality?.qualityScore??withProvenance?.qualityScore??null,
    },
  };
}

function buildUserFacingTargetFallback(input:{
  fen:string;
  target:NonNullable<ReturnType<typeof buildCurrentInstructionFrame>["target"]>;
  trainingMode:TrainingMode;
  trainerPhase:string;
  openingId?:string|null;
  lineId?:string|null;
  activeLineName?:string|null;
  recentCoachBodies?:string[];
  recentCoachThemes?:string[];
}){
  const pipeline=buildCoachExplanationPipeline({
    fenBefore:input.fen,
    target:input.target,
    trainerMode:input.trainingMode,
    trainerPhase:input.trainerPhase,
    isContinuation:input.trainingMode==="continuation",
    openingId:input.openingId,
    lineId:input.lineId,
    activeLineName:input.activeLineName,
    recentCoachBodies:input.recentCoachBodies,
    recentCoachThemes:input.recentCoachThemes,
    brainAnalysis: null,  // v2.7.39.3 ready; wired in main live coach path
  });
  const fallback=buildVerifiedUserFacingFallback(pipeline.moveFactPacket);
  return {
    title:fallback.title,
    body:fallback.body,
    reason:fallback.reason,
    theme:pipeline.coachExplanation.selectedTheme,
    quality:pipeline.coachQuality,
  };
}

function isEngineBestContinuationSource(source?:string|null){
  const value=String(source??"").trim();
  return value==="engine_best"||value==="stockfish_best_move_fallback"||value==="engine_best_move_fallback";
}

function buildEngineBestContinuationCopy(target:NonNullable<ReturnType<typeof buildCurrentInstructionFrame>["target"]>){
  const pieceNameByCode:Record<string,string>={p:"pawn",n:"knight",b:"bishop",r:"rook",q:"queen",k:"king"};
  const pieceName=pieceNameByCode[target.pieceType]??"piece";
  const destinationSquare=String(target.to??"").toLowerCase();
  const san=target.san||target.uci;
  return{
    title:`${san} — Continue the position`,
    body:`Play ${san} with the ${pieceName} to ${destinationSquare}. This is a legal continuation from the position.`,
  };
}

function detectUnverifiedCoachClaims(input:{
  body:string;
  target:{pieceType:string;isDevelopment:boolean;isDiagonalMove:boolean;isCapture:boolean;isCheck:boolean;isMate:boolean;isPromotion:boolean;isKingSafetyMove:boolean;isCentralPawnAdvance:boolean}|null;
  featureClaims:string[];
  planClaims:string[];
}){
  const text=input.body.toLowerCase();
  const claims:string[]=[];
  const verified:string[]=[];
  const features=new Set<string>([...input.featureClaims,...input.planClaims].map((x)=>String(x)));
  const target=input.target;
  const pieceChecks:[string,string][]=[["bishop","b"],["knight","n"],["rook","r"],["queen","q"],["king","k"],["pawn","p"]];
  for(const [name,code] of pieceChecks){
    if(new RegExp(`\\b${name}\\b`).test(text)){
      if(target?.pieceType===code)verified.push(`piece:${name}`);
      else claims.push("unverified_piece_claim");
    }
  }
  if(/\bdevelops?\b|\bdevelopment\b/.test(text) && !target?.isDevelopment)claims.push("unverified_development_claim");
  if(/\bdiagonal\b/.test(text) && !(target&&(target.pieceType==="b"||target.pieceType==="q")&&target.isDiagonalMove))claims.push("unverified_diagonal_claim");
  if(/\bcenter\b|\bcentral\b|center tension/.test(text) && !(target?.isCentralPawnAdvance||features.has("center_tension")||features.has("maintain_center_tension")||features.has("central_break_preparation")))claims.push("unverified_center_tension_claim");
  if(/\bpressure\b|\battack\b/.test(text) && !(features.has("attacks_square")||features.has("bishop_diagonal_pressure")||features.has("rook_on_open_file")))claims.push("unverified_pressure_claim");
  if(/king safety|castle|shelter/.test(text) && !(target?.isKingSafetyMove||features.has("king_safety_urgent")||features.has("castle_and_connect_rooks")))claims.push("unverified_king_safety_claim");
  if(/\bcaptures?\b|\btakes\b/.test(text) && !target?.isCapture)claims.push("unverified_capture_claim");
  if(/\bcheckmate\b|\bmate\b/.test(text) && !target?.isMate)claims.push("unverified_mate_claim");
  if(/\bcheck\b/.test(text) && !/\bcheckmate\b|\bmate\b/.test(text) && !target?.isCheck)claims.push("unverified_check_claim");
  if(/\bpromotion\b|=[qrbn]/.test(text) && !target?.isPromotion)claims.push("unverified_promotion_claim");
  if(/verified move:|pawn from|knight from|bishop from|rook from|queen from|king from|not_exposed_from_module|pipeline|fallback|runtime|candidate source/.test(text))claims.push("debug_copy_leaked_to_user");
  return {verifiedClaims:verified,unverifiedClaims:Array.from(new Set(claims))};
}

function isMoveQualityVerified(moveQuality:MoveQualityResult|null){
  return moveQuality?.status==="verified_top1"||moveQuality?.status==="verified_top2";
}

function getMoveQualityUserStatus(moveQuality:MoveQualityResult|null,pending:boolean):"idle"|"checking"|"verified"|"needs_review"|"not_verified"{
  if(pending)return "checking";
  if(isMoveQualityVerified(moveQuality))return "verified";
  if(moveQuality?.status==="rejected")return "needs_review";
  if(moveQuality?.status==="unavailable")return "not_verified";
  return "idle";
}

function getMoveQualityBadgeLabel(input:{
  trainerView:TrainerView;
  showAnswer:boolean;
  shouldValidateTrainingMove:boolean;
  moveQuality:MoveQualityResult|null;
  moveQualityPending:boolean;
  patternCueStatus:PatternCueStatus;
}){
  if(input.trainerView==="plain"&&!input.showAnswer)return "Plain View • No hints";
  if(input.shouldValidateTrainingMove&&!input.showAnswer){
    const status=getMoveQualityUserStatus(input.moveQuality,input.moveQualityPending);
    if(status==="checking")return "Assisted View • Checking";
    if(status==="verified")return "Assisted View • Blundr Brain Validated";
    if(status==="needs_review")return "Assisted View • Needs review";
    if(status==="not_verified")return "Assisted View • Not verified";
    return "Assisted View • Checking";
  }
  if(input.patternCueStatus==="pending")return "Assisted View • Checking";
  return "Assisted View • Cue ready";
}

function buildPatternCue(input:{
  trainerView:TrainerView;
  visualModelOutput:VisualModelOutput|null;
  visualModelPending:boolean;
  visualModelError:string|null;
  visualSuppressed:boolean;
  moveQuality:MoveQualityResult|null;
  moveQualityPending:boolean;
  shouldValidateTrainingMove:boolean;
  annotation:BrainAnnotation;
  expectedUserOptions:Continuation[];
  trainingMode:TrainingMode;
  isUserTurn:boolean;
  bookComplete:boolean;
  showAnswer:boolean;
  engineLines:EngineLine[];
}):PatternCue{
  if(input.trainerView==="plain"&&!input.showAnswer){
    return{title:"Find the next move",snippet:"Solve the position without hints.",status:"plain",source:"plain"};
  }
  if(input.shouldValidateTrainingMove&&!input.showAnswer&&input.moveQualityPending){
    return{
      title:"Checking position",
      snippet:"Blundr Brain is checking this move before showing a teaching cue.",
      status:"pending",
      source:"pending",
    };
  }
  if(input.shouldValidateTrainingMove&&!input.showAnswer&&input.moveQuality?.status==="rejected"){
    return{
      title:"Line needs review",
      snippet:"Blundr Brain did not validate this saved line, so no teaching cue will be shown.",
      next:undefined,
      source:"suppressed",
      status:"suppressed",
    };
  }
  if(input.shouldValidateTrainingMove&&!input.showAnswer&&input.moveQuality?.status==="unavailable"){
    return{
      title:"Move not verified",
      snippet:"Blundr could not verify this move, so it will not invent a teaching plan.",
      next:"Use Reveal only if you want to inspect the saved line.",
      source:"suppressed",
      status:"suppressed",
    };
  }
  if(input.shouldValidateTrainingMove&&!input.showAnswer){
    if(!isMoveQualityVerified(input.moveQuality)){
      return{
        title:"Checking position",
        snippet:"Blundr Brain is checking this move before showing a teaching cue.",
        status:"pending",
        source:"pending",
      };
    }
  }
  if(input.visualModelPending){
    return{title:"Preparing visual cue",snippet:"Blundr is checking the deterministic visual pattern for this position.",status:"pending",source:"pending"};
  }
  if(input.visualSuppressed){
    return{title:"No verified cue yet",snippet:"A recommendation is pending, so Blundr will not invent a plan.",next:"Use Reveal only if you want the answer.",status:"suppressed",source:"suppressed"};
  }
  if(input.visualModelOutput?.context){
    return{
      title:compactText(input.visualModelOutput.context.headline,"Pattern cue",80),
      snippet:compactText(input.visualModelOutput.context.body,"Use the highlighted move pattern.",140),
      next:compactText(input.visualModelOutput.context.next,"",80)||undefined,
      status:"ready",
      source:"rule_visual",
      concept:input.visualModelOutput.context.concept,
      selectedMove:input.visualModelOutput.context.selectedMove,
    };
  }
  if(input.visualModelOutput){
    return{
      title:compactText(input.visualModelOutput.headline,"Pattern cue",80),
      snippet:compactText(input.visualModelOutput.mainExplanation??input.visualModelOutput.planExplanation,"Use the highlighted move pattern.",140),
      next:compactText(input.visualModelOutput.nextPlan,"",80)||undefined,
      status:"ready",
      source:"rule_visual",
    };
  }
  if(input.showAnswer&&input.expectedUserOptions.length){
    return{
      title:"Saved line move",
      snippet:compactText(`Play ${input.expectedUserOptions.map(m=>m.san).join(" / ")}.`,"Play the saved line move.",140),
      next:"Review the highlighted pattern before continuing.",
      status:"manual_reveal",
      source:"manual",
    };
  }
  return{
    title:compactText(input.annotation.headline,"Pattern cue",80),
    snippet:compactText(input.annotation.mainExplanation??input.annotation.planExplanation,"Use the local visual cue.",140),
    next:compactText(input.annotation.nextPlan,"",80)||undefined,
    status:"ready",
    source:"local_fast",
  };
}

function evalForWhite(cp:number|undefined,turn:ChessColor){
  if(typeof cp!=="number")return undefined;
  return turn==="w"?cp:-cp;
}

function whiteEvalPercent(cpWhite:number|undefined){
  if(typeof cpWhite!=="number")return 50;
  const bounded=Math.max(-1200,Math.min(1200,cpWhite));
  return Math.max(5,Math.min(95,50+bounded/24));
}

function advantageLabel(cpWhite:number|undefined){
  if(typeof cpWhite!=="number")return "Engine pending";
  if(Math.abs(cpWhite)>90000)return cpWhite>0?"White mate":"Black mate";
  if(Math.abs(cpWhite)<18)return "Equal";
  const side=cpWhite>0?"White":"Black";
  return `${side} +${(Math.abs(cpWhite)/100).toFixed(1)}`;
}

function pieceGlyph(color:ChessColor,type:string,style:PieceStyle){
  const key=`${color}${type}`;
  if(style==="letters")return LETTER_PIECES[key]??type;
  if(style==="neo")return NEO_PIECES[key]??PIECE_SYMBOLS[key]??type;
  return PIECE_SYMBOLS[key]??type;
}

function capturedSummary(game:Chess):CapturedSummary{
  const counts:Record<ChessColor,Record<string,number>>={w:{p:0,n:0,b:0,r:0,q:0,k:0},b:{p:0,n:0,b:0,r:0,q:0,k:0}};
  for(const row of game.board()){for(const piece of row){if(piece)counts[piece.color as ChessColor][piece.type]=(counts[piece.color as ChessColor][piece.type]??0)+1}}
  const missing=(color:ChessColor)=>["q","r","b","n","p"].flatMap(type=>Array(Math.max(0,(INITIAL_COUNTS[color][type]??0)-(counts[color][type]??0))).fill(type));
  const whiteCaptured=missing("w");
  const blackCaptured=missing("b");
  const whiteCapturedValue=blackCaptured.reduce((sum,t)=>sum+(PIECE_VALUES[t]??0),0);
  const blackCapturedValue=whiteCaptured.reduce((sum,t)=>sum+(PIECE_VALUES[t]??0),0);
  const diff=whiteCapturedValue-blackCapturedValue;
  return{whiteCaptured,blackCaptured,materialAdvantage:{side:diff>0?"w":diff<0?"b":null,value:Math.abs(diff)}};
}

function gameEndingInfo(game:Chess){
  if(!game.isGameOver())return null;
  if(game.isCheckmate()){const winner=game.turn()==="w"?"Black":"White";return{title:"Checkmate",message:`${winner} wins by checkmate.`}}
  if(game.isStalemate())return{title:"Stalemate",message:"The game is drawn by stalemate."};
  if(game.isThreefoldRepetition())return{title:"Draw",message:"The game is drawn by repetition."};
  if(game.isInsufficientMaterial())return{title:"Draw",message:"The game is drawn by insufficient material."};
  if(game.isDraw())return{title:"Draw",message:"The game has ended in a draw."};
  return{title:"Game over",message:"The game has ended."};
}

function uciToSan(fen:string,uci:string){
  try{
    const g=new Chess(fen);
    const move=g.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci.length>4?uci.slice(4,5):undefined});
    return move?.san??uci;
  }catch{return uci}
}

function parseStockfishInfo(line:string,fen:string){
  const depthMatch=line.match(/\bdepth\s+(\d+)/);
  const cpMatch=line.match(/\bscore\s+cp\s+(-?\d+)/);
  const mateMatch=line.match(/\bscore\s+mate\s+(-?\d+)/);
  const multiMatch=line.match(/\bmultipv\s+(\d+)/);
  const pvMatch=line.match(/\bpv\s+(.+)$/);
  if(!pvMatch)return null;
  const uci=pvMatch[1].trim().split(/\s+/)[0];
  if(!uci||uci.length<4)return null;
  const mate=mateMatch?Number(mateMatch[1]):null;
  const cp=cpMatch?Number(cpMatch[1]):mate!==null?(mate>0?100000-mate:-100000-mate):undefined;
  return{san:uciToSan(fen,uci),uci,cp,line:pvMatch[1].trim(),depth:depthMatch?Number(depthMatch[1]):undefined,multipv:multiMatch?Number(multiMatch[1]):1};
}

async function resolveStockfishWorkerPath(){
  const manifestPath="/stockfish/manifest.json";
  const fallbackPath="/stockfish/stockfish-18-lite-single.js";

  try {
    const response = await fetch(manifestPath, { cache: "no-store" });
    if (response.ok) {
      const manifest = await response.json();
      if (manifest?.enginePath) {
        return String(manifest.enginePath);
      }
    }
  } catch {}

  try {
    const response = await fetch(fallbackPath, { cache: "no-store" });
    if (response.ok) return fallbackPath;
  } catch {}

  return null;
}

async function runBrowserStockfish(fen:string,skill:number,movetime=750,multiPv=3,signal?:AbortSignal):Promise<{source:string;pvs:EngineLine[];depth?:number;timeMs:number}|null>{
  if(typeof window==="undefined"||typeof Worker==="undefined")return null;
  if(signal?.aborted)return null;
  const enginePath=await resolveStockfishWorkerPath();
  if(!enginePath)return null;

  return new Promise((resolve)=>{
    const started=performance.now();
    let worker:Worker|null=null;
    const bestByPv=new Map<number,any>();
    let resolved=false;
    let sawUciOk=false;
    let sawReadyOk=false;
    let searchStarted=false;

    const finish=()=>{
      if(resolved)return;
      resolved=true;
      signal?.removeEventListener("abort",abortHandler);
      try{worker?.terminate()}catch{}
      const pvs=Array.from(bestByPv.entries()).sort((a,b)=>a[0]-b[0]).map(([,v])=>v).filter(Boolean).slice(0,Math.max(1,Math.min(10,multiPv)));
      if(!pvs.length){resolve(null);return}
      const maxDepth=Math.max(...pvs.map((pv)=>pv.depth??0));
      resolve({source:"stockfish-browser",pvs:pvs.map((pv)=>({san:pv.san,uci:pv.uci,cp:pv.cp,line:pv.line})),depth:maxDepth||undefined,timeMs:Math.round(performance.now()-started)});
    };
    const abortHandler=()=>{
      if(resolved)return;
      resolved=true;
      window.clearTimeout(timeout);
      try{worker?.terminate()}catch{}
      resolve(null);
    };

    const send=(cmd:string)=>{try{worker?.postMessage(cmd)}catch{}};
    const startSearch=()=>{
      if(searchStarted)return;
      if(!sawUciOk||!sawReadyOk)return;
      searchStarted=true;
      send(`position fen ${fen}`);
      send(`go movetime ${movetime}`);
    };
    const timeout=window.setTimeout(finish,Math.max(1600,movetime+1200));
    signal?.addEventListener("abort",abortHandler,{once:true});

    try{
      worker=new Worker(enginePath);
      worker.onmessage=(event)=>{
        const line=String(event.data??"");
        const parsed=parseStockfishInfo(line,fen);
        if(parsed)bestByPv.set(parsed.multipv??1,parsed);
        if(line==="uciok"){
          sawUciOk=true;
          send(`setoption name MultiPV value ${Math.max(1,Math.min(10,multiPv))}`);
          send("setoption name UCI_LimitStrength value true");
          send(`setoption name UCI_Elo value ${Math.max(1320,Math.min(3190,skill))}`);
          send("isready");
          return;
        }
        if(line==="readyok"){
          sawReadyOk=true;
          startSearch();
          return;
        }
        if(line.startsWith("bestmove")){
          window.clearTimeout(timeout);
          finish();
        }
      };
      worker.onerror=()=>{
        window.clearTimeout(timeout);
        signal?.removeEventListener("abort",abortHandler);
        try{worker?.terminate()}catch{}
        resolve(null);
      };

      send("uci");
    }catch{
      window.clearTimeout(timeout);
      signal?.removeEventListener("abort",abortHandler);
      try{worker?.terminate()}catch{}
      resolve(null);
    }
  });
}

export default function App(){
  const initialFen=useMemo(()=>new Chess().fen(),[]);
  const [trainingSessionId] = useState(()=>createLearningSessionId());
  const runtimeOpeningSelection=useMemo(
    ()=>selectRuntimeWeightedOpeningSelection(trainingSessionId),
    [trainingSessionId],
  );
  const [activeTab,setActiveTab]=useState<Tab>("home");
  const [customRepertoires,setCustomRepertoires]=useState<Repertoire[]>([]);
  const [selectedRepertoireId,setSelectedRepertoireId]=useState(runtimeOpeningSelection.selectedOpeningId);
  const [runtimeTrainingSessionId,setRuntimeTrainingSessionId]=useState<string>(()=>createLearningSessionId());
  const [continuationSessionId,setContinuationSessionId]=useState<string|null>(null);
  const [recentRuntimeTrainingLineKeys,setRecentRuntimeTrainingLineKeys]=useState<string[]>([]);
  const [selectedRuntimeTrainingLineSelection,setSelectedRuntimeTrainingLineSelection]=useState<RuntimeWeightedTrainingLineSelection | null>(()=>buildRuntimeTrainingLineSelection(runtimeOpeningSelection.selectedOpeningId,[],runtimeTrainingSessionId));
  const [fen,setFen]=useState(initialFen);
  const [positionHistory,setPositionHistory]=useState<string[]>([initialFen]);
  const [historyIndex,setHistoryIndex]=useState(0);
  const [selectedSquare,setSelectedSquare]=useState<string|null>(null);
  const [pendingPromotion,setPendingPromotion]=useState<PendingPromotion|null>(null);
  const [promotionAuthorityDebug,setPromotionAuthorityDebug]=useState<{
    frameId: number;
    selectedPromotionPiece: PromotionPiece | null;
    attemptedPromotionUci: string | null;
    acceptedPromotionUci: string | null;
    promotionAuthorityMatched: boolean | null;
    promotionAuthorityMismatchReason: string | null;
  } | null>(null);
  const [feedback,setFeedback]=useState("Choose an opening and begin training.");
  const [lastMove,setLastMove]=useState<string|null>(null);
  const [lastMoveSan,setLastMoveSan]=useState("");
  const [lastMoveColor,setLastMoveColor]=useState<ChessColor|null>(null);
  const [userExplicitlyEnteredContinuation,setUserExplicitlyEnteredContinuation]=useState(false);
  const [continueFromHereClicked,setContinueFromHereClicked]=useState(false);
  const [continuationPauseClicked,setContinuationPauseClicked]=useState(false);
  const [continuationHardStopAcknowledged,setContinuationHardStopAcknowledged]=useState(false);
  const [moveHistory,setMoveHistory]=useState<string[]>([]);
  const [progress,setProgress]=useState<Progress>(DEFAULT_PROGRESS);
  const [showAnswer,setShowAnswer]=useState(false);
  const [reviewingFen,setReviewingFen]=useState<string|null>(null);
  const [activeBoard,setActiveBoard]=useState(true);
  const [activeBoardView,setActiveBoardView]=useState<ActiveBoardView>("plan");
  const [showGptDebug,setShowGptDebug]=useState(false);
  const [showVisualDebug,setShowVisualDebug]=useState(false);
  const [showDetails,setShowDetails]=useState(false);
  // v2.7.40 Agent 4: dedicated showMoreShown for Plain View Hint+Show More escalation (resets on new frame; distinct from showDetails debug toggle)
  const [showMoreShown,setShowMoreShown]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [boardSettings,setBoardSettings]=useState<BoardSettings>(DEFAULT_BOARD_SETTINGS);
  const [ratingFilter,setRatingFilter]=useState("1200,1400,1600");
  const [speedFilter]=useState("blitz,rapid");
  const [trainingMode,setTrainingMode]=useState<TrainingMode>("restricted");
  const [trainerView,setTrainerView]=useState<TrainerView>("assisted");
  const [bookComplete,setBookComplete]=useState(false);
  const [opponentCue,setOpponentCue]=useState<OpponentCue|null>(null);
  const [opponentVariationDebug,setOpponentVariationDebug]=useState<OpponentVariationDebug|null>(null);
  const [explorerMoves,setExplorerMoves]=useState<ExplorerMove[]>([]);
  const [brainResponse,setBrainResponse]=useState<BrainResponse|null>(null);
  const [enginePreview,setEnginePreview]=useState<{fen:string;pvs:EngineLine[];source:string}|null>(null);
  const [annotation,setAnnotation]=useState<BrainAnnotation>(blankAnnotation());
  const [visualModelOutput,setVisualModelOutput]=useState<VisualModelOutput|null>(null);
  const [visualModelPending,setVisualModelPending]=useState(false);
  const [visualModelError,setVisualModelError]=useState<string|null>(null);
  const [visualDebugSnapshot,setVisualDebugSnapshot]=useState<VisualDebugSnapshot>({requestKey:null,requestPayload:null,responseSummary:null,responseDebug:null,error:null,durationMs:null,updatedAt:null});
  const [telemetryEnabled,setTelemetryEnabled]=useState(false);
  const [telemetryEvents,setTelemetryEvents]=useState<LocalTelemetryEvent[]>([]);
  const [thinkingStep,setThinkingStep]=useState<ThinkingStep>("idle");
  const [pipelineNote,setPipelineNote]=useState("Ready");
  const [visualReady,setVisualReady]=useState(false);
  const [brain,setBrain]=useState<LiveBrain>({ratingLabel:"Club",ratingPool:"1200–1600",book:"ready",lichess:"ready",engine:"ready",gpt:"ready",source:"rule visual",note:"Manual reveal/debug only"});
  const [moveQuality,setMoveQuality]=useState<MoveQualityResult|null>(null);
  const [moveQualityPending,setMoveQualityPending]=useState(false);
  const [showAddLine,setShowAddLine]=useState(false);
  const [newRepName,setNewRepName]=useState("My Custom Repertoire");
  const [newRepColor,setNewRepColor]=useState<RepertoireColor>("white");
  const [newLineText,setNewLineText]=useState("e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O");
  const [trainerPhase,setTrainerPhase]=useState<OverlayPhase>("ready_for_user");
  const [trainerFrameId,setTrainerFrameId]=useState(1);
  const [overlayFrameId,setOverlayFrameId]=useState(1);
  const [staleOverlayIgnored,setStaleOverlayIgnored]=useState(false);
  const [overlayClearedOnPhaseChange,setOverlayClearedOnPhaseChange]=useState(false);
  const [pendingOpponentRequest,setPendingOpponentRequest]=useState<PendingOpponentRequest|null>(null);
  const [maiaOpponentProviderStatus,setMaiaOpponentProviderStatus]=useState<MaiaProviderStatus>("disabled");
  const [maiaOpponentRequestId,setMaiaOpponentRequestId]=useState<number|null>(null);
  const [maiaOpponentRequestFen4,setMaiaOpponentRequestFen4]=useState<string|null>(null);
  const [maiaOpponentSkillLevel,setMaiaOpponentSkillLevel]=useState<MaiaSkillLevel|null>(null);
  const [maiaOpponentCandidateCount,setMaiaOpponentCandidateCount]=useState(0);
  const [maiaOpponentSelectedUci,setMaiaOpponentSelectedUci]=useState<string|null>(null);
  const [maiaOpponentSelectedSan,setMaiaOpponentSelectedSan]=useState<string|null>(null);
  const [maiaOpponentHumanLikelihood,setMaiaOpponentHumanLikelihood]=useState<number|null>(null);
  const [maiaOpponentDecisionReason,setMaiaOpponentDecisionReason]=useState<string>("not_requested");
  const [maiaOpponentFallbackUsed,setMaiaOpponentFallbackUsed]=useState(false);
  const [maiaOpponentFallbackReason,setMaiaOpponentFallbackReason]=useState<string|null>(null);
  const [maiaOpponentStaleResultIgnored,setMaiaOpponentStaleResultIgnored]=useState(false);
  const [maiaOpponentIllegalCandidateRejected,setMaiaOpponentIllegalCandidateRejected]=useState(false);
  const [maiaOpponentSelectedLegal,setMaiaOpponentSelectedLegal]=useState<boolean|null>(null);
  const [maiaOpponentRuntimeCandidateLegal,setMaiaOpponentRuntimeCandidateLegal]=useState<boolean|null>(null);
  const [maiaOpponentAppliedMoveUci,setMaiaOpponentAppliedMoveUci]=useState<string|null>(null);
  const [maiaOpponentAppliedMoveSan,setMaiaOpponentAppliedMoveSan]=useState<string|null>(null);
  const [maiaOpponentAppliedFromFen4,setMaiaOpponentAppliedFromFen4]=useState<string|null>(null);
  const [maiaOpponentAppliedToFen4,setMaiaOpponentAppliedToFen4]=useState<string|null>(null);
  const [maiaOpponentSanityGuardResult,setMaiaOpponentSanityGuardResult]=useState<string>("not_run");
  const [maiaOpponentSanityGuardBlockedReason,setMaiaOpponentSanityGuardBlockedReason]=useState<string|null>(null);
  const [maiaRuntimeMs,setMaiaRuntimeMs]=useState<number|null>(null);
  const [maiaRuntimeErrorReason,setMaiaRuntimeErrorReason]=useState<string|null>(null);
  const [maiaApiRouteStatus,setMaiaApiRouteStatus]=useState<string>("unknown");
  const [branchCompleteLatch,setBranchCompleteLatch]=useState<{
    active:boolean;
    reason:string|null;
    fen4:string|null;
    lineId:string|null;
    ply:number|null;
    latchedAtFrameId:number|null;
  }>({active:false,reason:null,fen4:null,lineId:null,ply:null,latchedAtFrameId:null});
  const [runtimeCriticalIssues,setRuntimeCriticalIssues]=useState<string[]>([]);
  const [coachInteraction,setCoachInteraction]=useState<"none"|"hint"|"answer"|"why"|"hide"|"show_plan"|"analyze_idea"|"show_move">("none");
  const [coachHintRequestCount,setCoachHintRequestCount]=useState(0);
  const [coachHiddenFrameId,setCoachHiddenFrameId]=useState<string|null>(null);
  const [coachReviewMarked,setCoachReviewMarked]=useState(false);
  const [coachUtteranceMemory,setCoachUtteranceMemory]=useState<any[]>([]);
  const [coachMemoryMigration,setCoachMemoryMigration]=useState({migratedOrCleared:false,clearedLegacyCount:0,legacyDetected:false});
  const [lastCoachRecords,setLastCoachRecords]=useState<LastCoachRecord[]>([]);
  const [coachTimeline,setCoachTimeline]=useState<CoachSessionLogEntry[]>([]);
  const [continuationAnalysisStatus,setContinuationAnalysisStatus]=useState<ContinuationRuntimeStatus>("idle");
  const [runtimeBookFrameQuery,setRuntimeBookFrameQuery]=useState<RuntimeBookFrameQueryState>({
    openingId:null,
    playKeyBefore:null,
    candidates:[],
    hasRuntimeBookCandidates:false,
    bookExhausted:true,
    status:"idle",
    error:null,
  });
  const [lastContinuationUserMoveRating,setLastContinuationUserMoveRating]=useState<(ContinuationUserMoveRatingResult&{
    moveUci:string;
    moveSan:string;
    pieceType:string|null;
    ratingLabel:MoveStrengthRating["label"];
    evaluatedFenBeforeMove:string;
    createdAtFrameId:number;
  })|null>(null);
  const [continuationCandidateLock,setContinuationCandidateLock]=useState<{
    continuationCandidateLockId:number;
    continuationCandidateLockFen4:string;
    continuationCandidateLockRequestId:number;
    continuationCandidateLockUci:string;
    continuationCandidateLockSan:string;
    continuationCandidateLockSource:string;
    continuationCandidateLockReason:string;
  }|null>(null);
  const [blundrDebugEnabled,setBlundrDebugEnabled]=useState(false);
  const [debugEventLog,setDebugEventLog]=useState<DebugEvent[]>([]);
  const [lastActionDebug,setLastActionDebug]=useState<Record<string,unknown>|null>(null);
  const [coachCardRenderTimeline,setCoachCardRenderTimeline]=useState<CoachCardRenderTimelineEntry[]>([]);
  const [surfaceModeTransitionTimeline,setSurfaceModeTransitionTimeline]=useState<Record<string,unknown>[]>([]);
  const [actionTimeline,setActionTimeline]=useState<Record<string,unknown>[]>([]);
  const [visualRenderTimeline,setVisualRenderTimeline]=useState<Record<string,unknown>[]>([]);
  const [plainLeakTimeline,setPlainLeakTimeline]=useState<Record<string,unknown>[]>([]);
  const [maiaTimeline,setMaiaTimeline]=useState<MaiaTimelineEvent[]>([]);
  const explorerCache=useRef<Record<string,any>>({});
  const brainSeq=useRef(0);
  const visualRequestSeq=useRef(0);
  const moveQualityCacheRef=useRef<Map<string,MoveQualityResult>>(new Map());
  const learningSessionIdRef=useRef<string>(trainingSessionId);
  const positionStartedAtRef=useRef<number>(Date.now());
  const lastMoveQualityEventKeyRef=useRef<string>("");
  const lastTeachingCueEventKeyRef=useRef<string>("");
  const telemetrySeq=useRef(0);
  const telemetryEnabledRef=useRef(false);
  const telemetryEventsRef=useRef<LocalTelemetryEvent[]>([]);
  const coachUtteranceMemoryRef=useRef<any[]>([]);
  const lastCoachRecordsRef=useRef<LastCoachRecord[]>([]);
  const coachTimelineRef=useRef<CoachSessionLogEntry[]>([]);
  const coachTimelineSeqRef=useRef(0);
  const coachCardRenderTimelineSeqRef=useRef(0);
  const surfaceTransitionSeqRef=useRef(0);
  const actionTimelineSeqRef=useRef(0);
  const visualTimelineSeqRef=useRef(0);
  const plainLeakTimelineSeqRef=useRef(0);
  const lastCoachTimelineEntryKeyRef=useRef<string|null>(null);
  const lastCoachCardRenderEntryKeyRef=useRef<string|null>(null);
  const lastSurfaceTransitionEntryKeyRef=useRef<string|null>(null);
  const lastActionTimelineEntryKeyRef=useRef<string|null>(null);
  const lastVisualTimelineEntryKeyRef=useRef<string|null>(null);
  const lastPlainLeakEntryKeyRef=useRef<string|null>(null);
  const previousSurfaceTransitionRef=useRef<{frameId:number;mode:string;hintShown:boolean;showMoreShown:boolean;targetUci:string|null;visualCount:number} | null>(null);
  const previousSelectedCandidateUciRef=useRef<string|null>(null);
  const candidateSyncDebugRef=useRef<Record<string,unknown>>({});
  // v2.7.39.1 Target Locking (Coach Perfection Gate) - official instructional target lock per stable frame key
  // Prevents enginePreview / explorer arrivals from mutating the committed continuation_candidate for the current frame.
  const lockedContinuationRef=useRef<Record<string, {uci:string; san?:string; source?:string} | null>>({});
  const fenRef=useRef(fen);
  const lastRecordedCoachUtteranceKeyRef=useRef<string>("");
  const continuationAnalysisDebounceRef=useRef<number|null>(null);
  const continuationAnalysisAbortRef=useRef<AbortController|null>(null);
  const continuationAnalysisSeqRef=useRef(0);
  const continuationCandidateLockSeqRef=useRef(0);
  const continuationCandidateRequestSeqRef=useRef(0);
  const continuationCandidateLockRef=useRef<typeof continuationCandidateLock>(null);
  const continuationEngineCacheRef=useRef<Record<string,{fen:string;pvs:EngineLine[];source:string}>>({});
  const opponentRequestSeqRef=useRef(0);
  const maiaOpponentRequestSeqRef=useRef(0);
  const maiaTimelineSeqRef=useRef(0);
  const pendingOpponentRequestRef=useRef<PendingOpponentRequest|null>(null);
  const branchCompleteBlockedOpponentRequestIdRef=useRef<number|null>(null);
  const branchCompleteLatchRef=useRef(branchCompleteLatch);
  const opponentReplyTimeoutRef=useRef<number|null>(null);
  const brainAbortRef=useRef<AbortController|null>(null);
  const visualAbortRef=useRef<AbortController|null>(null);
  useEffect(()=>{setBlundrDebugEnabled(isBlundrDebugEnabled())},[]);
  const repertoires=useMemo(()=>{
    const merged=new Map<string,Repertoire>();
    for(const repertoire of OPENINGS) merged.set(repertoire.id,repertoire);
    for(const repertoire of STAGE2_RUNTIME_TRAINABLE_REPERTOIRES) merged.set(repertoire.id,repertoire);
    for(const repertoire of customRepertoires) merged.set(repertoire.id,repertoire);
    return [...merged.values()];
  },[customRepertoires]);
  function refreshRuntimeTrainingLineSelection(nextOpeningId:string, recentLineKeys:string[] = recentRuntimeTrainingLineKeys, sessionId:string = runtimeTrainingSessionId){
    const nextSelection=buildRuntimeTrainingLineSelection(nextOpeningId,recentLineKeys,sessionId,repertoires.find((candidate)=>candidate.id===nextOpeningId));
    setSelectedRuntimeTrainingLineSelection(nextSelection);
    if(nextSelection?.selectedLineKey){
      setRecentRuntimeTrainingLineKeys((current)=>updateRuntimeTrainingLineKeys(current,nextSelection.selectedLineKey));
    }
    return nextSelection;
  }
  const canonicalSelectedRepertoireId=useMemo(
    ()=>resolveStage2CanonicalOpeningId(selectedRepertoireId)??selectedRepertoireId,
    [selectedRepertoireId],
  );
  const selectedRuntimeLineId=selectedRuntimeTrainingLineSelection?.selectedLineId??canonicalSelectedRepertoireId;
  const selectedRuntimeLineKey=selectedRuntimeTrainingLineSelection?.selectedLineKey??selectedRuntimeLineId;
  const selectedRuntimeLinePlaySequenceUci=selectedRuntimeTrainingLineSelection?.selectedPlaySequenceUci??[];
  const selectedRuntimeLinePlyLength=selectedRuntimeLinePlaySequenceUci.length;
  const runtimeOpeningIdForFrame=useMemo(
    ()=>resolveRuntimeOpeningId(canonicalSelectedRepertoireId),
    [canonicalSelectedRepertoireId],
  );
  const runtimePlayKeyBeforeForFrame=useMemo(
    ()=>buildRuntimePlayKeyBeforeFromSanHistory(moveHistory),
    [moveHistory.join("|")],
  );
  const selectedRuntimeLineCurrentPly=moveHistory.length;
  const selectedRuntimeLineExhausted=selectedRuntimeLinePlyLength>0&&selectedRuntimeLineCurrentPly>=selectedRuntimeLinePlyLength;
  const stage2OpeningDepthTargetPly=12;
  const stage2OpeningCurrentPly=selectedRuntimeLineCurrentPly;
  const stage2OpeningDepthReached=stage2OpeningCurrentPly>=stage2OpeningDepthTargetPly;
  const selectedRuntimeLineUsedFor=trainingMode==="continuation"?"memory_only":"initial_seed";
  const hardRailDetected=selectedRuntimeLinePlyLength>0&&selectedRuntimeLinePlyLength<stage2OpeningDepthTargetPly;
  const hardRailBlockedReason=hardRailDetected?"runtime_line_shorter_than_opening_depth_target":null;
  const lineSelectionPreviousTwoSame=recentRuntimeTrainingLineKeys.length>=2&&recentRuntimeTrainingLineKeys[0]===recentRuntimeTrainingLineKeys[1];
  const repertoire=repertoires.find(r=>r.id===canonicalSelectedRepertoireId)??repertoires[0];
  const openingTree=useMemo(()=>buildOpeningTree(repertoireLineInputs(repertoire)),[repertoire]);
  const game=useMemo(()=>new Chess(fen),[fen]);
  const userColor:ChessColor=repertoire.color==="white"?"w":"b";
  const opponentColor:ChessColor=userColor==="w"?"b":"w";
  const isUserTurn=game.turn()===userColor;
  const key=normalizeFen(fen);
  const exactOpeningNodes=openingTree.nodesByFen4[key]??[];
  const expectedMoveResolution=useMemo(()=>resolveExpectedMoveForFrame({
    openingTree,
    fen,
    trainerPhase,
    trainingMode,
    trainerView,
    isUserTurn,
    userColor,
    opponentColor,
    lastOpponentMoveUci:lastMoveColor===opponentColor?lastMove:null,
    lastOpponentMoveSan:lastMoveColor===opponentColor?lastMoveSan:null,
    legacyExpectedMoveCandidate:null,
    enginePreview,
    allowEngineFallbackInRestricted:false,
  }),[openingTree,fen,trainerPhase,trainingMode,trainerView,isUserTurn,userColor,opponentColor,lastMoveColor,lastMove,lastMoveSan,enginePreview]);
  const expectedMoveResolverDebug=useMemo(()=>buildOpeningResolverDebug(expectedMoveResolution),[expectedMoveResolution]);

  // v2.7.41 TDZ Fix: expectedMovesForValidation + curated / lichess end signals placed early
  // (strict ordering: after expectedMoveResolution, before continuationPolicyCandidate and anything that consumes them)
  const expectedMovesForValidation = useMemo(() => {
    // Must be computed only from raw upstream state and/or expectedMoveResolution.
    // Never from continuationPolicyCandidate, currentInstructionFrame, or instructionTarget.
    const candidates = expectedMoveResolution?.candidateMoves ?? [];
    return candidates
      .filter((move) => move.color === userColor)
      .map((move) => ({
        uci: typeof move.uci === "string" ? move.uci.trim().toLowerCase() : "",
        san: typeof move.san === "string" ? move.san : undefined,
      }))
      .filter((move) => move.uci);
  }, [expectedMoveResolution?.candidateMoves, userColor]);

  const expectedMovesForValidationKey = useMemo(
    () => expectedMovesForValidation.map((move) => `${move.uci}:${move.san ?? ""}`).join("|"),
    [expectedMovesForValidation]
  );
  const selectedOpeningAvailability=useMemo(
    ()=>getStage2OpeningAvailability(canonicalSelectedRepertoireId),
    [canonicalSelectedRepertoireId],
  );

  // v2.7.41 HOTFIX: Strict confirmed End-of-Book using real lineCursor/lineLength from resolver
  // Never infer from temporary expectedMovesForValidation.length === 0 or source includes("curated"/"terminal")
  const selectedLineCompleteConfirmed = useMemo(() => {
    if (selectedRuntimeLinePlyLength > 0) {
      return selectedRuntimeLineExhausted;
    }
    const len = expectedMoveResolution?.lineLength ?? 0;
    const cur = expectedMoveResolution?.lineCursor ?? 0;
    return len > 0 && cur >= len;
  }, [selectedRuntimeLineExhausted, selectedRuntimeLinePlyLength, expectedMoveResolution?.lineCursor, expectedMoveResolution?.lineLength]);
  const exactSelectedLineNodes = useMemo(
    () => exactOpeningNodes.filter((node) => node.lineId === selectedRuntimeLineId),
    [exactOpeningNodes, canonicalSelectedRepertoireId],
  );
  const exactSelectedLineNodeFound = exactSelectedLineNodes.length > 0;
  const selectedLineExactNodeHasChildren = useMemo(() => {
    if (!exactSelectedLineNodes.length) return "unknown" as const;
    return exactSelectedLineNodes.some((node) => node.continuations.length > 0);
  }, [exactSelectedLineNodes]);
  const hasNextOpponentMoveInSelectedLine = useMemo(() => {
    if (!exactSelectedLineNodes.length) return "unknown" as const;
    return exactSelectedLineNodes.some((node) => node.continuations.some((move) => move.color === opponentColor));
  }, [exactSelectedLineNodes, opponentColor]);
  const hasNextUserMoveInSelectedLine = useMemo(() => {
    if (!exactSelectedLineNodes.length) return "unknown" as const;
    return exactSelectedLineNodes.some((node) => node.continuations.some((move) => move.color === userColor));
  }, [exactSelectedLineNodes, userColor]);
  const explicitCuratedTerminalNode = useMemo(() => {
    const sideToMove = game.turn();
    return exactSelectedLineNodes.some((node) => node.terminal && node.sideToMove === sideToMove);
  }, [exactSelectedLineNodes, game]);
  const stage2TerminalProof = useMemo(
    () => resolveStage2TerminalProof({
      trainingMode,
      isUserTurn,
      userExplicitlyEnteredContinuation,
      selectedOpeningId: canonicalSelectedRepertoireId,
      selectedLineId:selectedRuntimeLineId,
      runtimeOpeningId: runtimeOpeningIdForFrame,
      selectedOpeningRuntimeAvailable: Boolean(selectedOpeningAvailability?.runtimeAvailable),
      fen4: normalizeFen(fen),
      lastUserMoveUci: lastMoveColor === userColor ? lastMove : null,
      lastUserMoveSan: lastMoveColor === userColor ? lastMoveSan : null,
      afterFinalUserMove: !isUserTurn && lastMoveColor === userColor,
      explicitCuratedTerminalNode,
      selectedLineCompleteConfirmed,
      exactNodeHasChildren: selectedLineExactNodeHasChildren,
      hasNextOpponentMove: hasNextOpponentMoveInSelectedLine,
      hasNextUserMove: hasNextUserMoveInSelectedLine,
      validBranchCompleteLatch: Boolean(branchCompleteLatch.active && branchCompleteLatch.lineId === selectedRuntimeLineId),
      bookCompleteAllowed: Boolean(selectedLineCompleteConfirmed || explicitCuratedTerminalNode),
      guidedCompleteAllowed: Boolean(selectedLineCompleteConfirmed || explicitCuratedTerminalNode),
      runtimeBookBookExhausted: Boolean(runtimeBookFrameQuery.bookExhausted),
      runtimeBookCandidateCount: runtimeBookFrameQuery.candidates.length,
      runtimeBookStatus: runtimeBookFrameQuery.status,
    }),
    [
      trainingMode,
      isUserTurn,
      userExplicitlyEnteredContinuation,
      canonicalSelectedRepertoireId,
      fen,
      lastMoveColor,
      userColor,
      lastMove,
      lastMoveSan,
      explicitCuratedTerminalNode,
      selectedLineCompleteConfirmed,
      selectedLineExactNodeHasChildren,
      hasNextOpponentMoveInSelectedLine,
      hasNextUserMoveInSelectedLine,
      branchCompleteLatch.active,
      branchCompleteLatch.lineId,
      runtimeOpeningIdForFrame,
      selectedOpeningAvailability?.runtimeAvailable,
      runtimeBookFrameQuery.bookExhausted,
      runtimeBookFrameQuery.candidates.length,
      runtimeBookFrameQuery.status,
    ],
  );
  const restrictedRuntimeBookHandoff = useMemo(
    () => resolveRestrictedRuntimeBookHandoff({
      trainingMode,
      isUserTurn,
      userExplicitlyEnteredContinuation,
      lastUserMoveUci: lastMoveColor === userColor ? lastMove : null,
      currentPly: moveHistory.length,
      minimumGuidedDepthPly: DEFAULT_GUIDED_COVERAGE_THRESHOLDS.minimumGuidedDepthPly,
      runtimeBookMatchesFrame:
        runtimeBookFrameQuery.status === "ready" &&
        runtimeBookFrameQuery.openingId === runtimeOpeningIdForFrame &&
        runtimeBookFrameQuery.playKeyBefore === runtimePlayKeyBeforeForFrame,
      runtimeBookStatus: runtimeBookFrameQuery.status,
      runtimeBookBookExhausted: runtimeBookFrameQuery.bookExhausted,
      runtimeBookCandidateCount: runtimeBookFrameQuery.candidates.length,
      explicitCuratedTerminalNode,
      selectedLineCompleteConfirmed,
    }),
    [
      trainingMode,
      isUserTurn,
      userExplicitlyEnteredContinuation,
      lastMoveColor,
      userColor,
      lastMove,
      moveHistory.length,
      DEFAULT_GUIDED_COVERAGE_THRESHOLDS.minimumGuidedDepthPly,
      runtimeBookFrameQuery.status,
      runtimeBookFrameQuery.openingId,
      runtimeBookFrameQuery.playKeyBefore,
      runtimeBookFrameQuery.bookExhausted,
      runtimeBookFrameQuery.candidates.length,
      runtimeOpeningIdForFrame,
      runtimePlayKeyBeforeForFrame,
      explicitCuratedTerminalNode,
      selectedLineCompleteConfirmed,
    ],
  );
  const restrictedLineExhaustedOnOpponentTurnAfterUserMove = restrictedRuntimeBookHandoff.restrictedRuntimeBookExhaustedOnOpponentTurnAfterUserMove;

  const lichessTotalGames = useMemo(() => {
    if (!explorerMoves || explorerMoves.length === 0) return null;
    return explorerMoves.reduce((sum, m) => sum + (m.total || 0), 0);
  }, [explorerMoves]);

  const lichessStatsStatus = brain.lichess === "loading" ? "loading" : (explorerMoves.length > 0 ? "resolved" : "pending");

  const lichessEndConfirmed = useMemo(() => {
    return lichessStatsStatus === "resolved" && lichessTotalGames !== null && lichessTotalGames < 500;
  }, [lichessStatsStatus, lichessTotalGames]);

  const currentPlyCount = moveHistory.length;
  const hardStopApplies =
    trainingMode === "restricted" &&
    !userExplicitlyEnteredContinuation &&
    !continueFromHereClicked &&
    currentPlyCount >= HARD_CONTINUATION_BREAK_PLY &&
    currentPlyCount > 0 &&
    !game.isGameOver();
  const lineExhaustedForPause =
    trainingMode === "restricted" &&
    isUserTurn &&
    !userExplicitlyEnteredContinuation &&
    stage2TerminalProof.proven;
  const branchExhaustedForPause =
    trainingMode === "restricted" &&
    isUserTurn &&
    !userExplicitlyEnteredContinuation &&
    stage2TerminalProof.proven;
  const continuationPauseDecision = shouldForceContinuationPause({
    plyCount: hardStopApplies ? currentPlyCount : 0,
    lineExhausted: lineExhaustedForPause,
    branchExhausted: branchExhaustedForPause,
    continuationPauseClicked: continuationHardStopAcknowledged,
  });
  const forceContinuationPause = isUserTurn && continuationPauseDecision.pauseRequired && !userExplicitlyEnteredContinuation;
  const continuationPauseAlreadyConsumed = Boolean(userExplicitlyEnteredContinuation || continueFromHereClicked);
  const hardStopBackupEligible = Boolean(
    trainingMode === "restricted" &&
    !continuationPauseAlreadyConsumed &&
    !game.isGameOver() &&
    currentPlyCount >= HARD_CONTINUATION_BREAK_PLY &&
    currentPlyCount > 0,
  );
  const hardStopBackupBlockedReason =
    hardStopBackupEligible
      ? null
      : trainingMode !== "restricted"
        ? "not_restricted_mode"
        : continuationPauseAlreadyConsumed
          ? "pause_already_consumed"
          : game.isGameOver()
            ? "terminal_position"
            : currentPlyCount <= 0
              ? "ply_not_started"
              : currentPlyCount < HARD_CONTINUATION_BREAK_PLY
                ? "below_hard_stop_threshold"
                : "unknown";

  // Base hard EoB (without loading self-ref) for safe ordering (Step 10).
  const baseHardEndOfBookGate = useMemo(() => {
    if (!isUserTurn) return false;
    if (trainingMode !== "restricted") return false;
    if (userExplicitlyEnteredContinuation) return false;
    return stage2TerminalProof.proven;
  }, [
    isUserTurn,
    trainingMode,
    userExplicitlyEnteredContinuation,
    stage2TerminalProof.proven,
  ]);

  // Step 3/4/10 (exact order): trusted curated target exists for restricted user turn (from opening tree / resolver).
  // This must take precedence over secondary async (brain/visual/lichess/pending) so the lesson is playable from move 1.
  const trustedInstructionTargetExists = useMemo(() => {
    const hasCurated = Boolean(expectedMoveResolution?.expectedMoveUci) &&
      (expectedMoveResolution?.source === "lesson_line" ||
       expectedMoveResolution?.source === "opening_branch" ||
       (expectedMoveResolution?.lineLength ?? 0) > 0);
    return isUserTurn &&
      trainingMode === "restricted" &&
      !userExplicitlyEnteredContinuation &&
      !baseHardEndOfBookGate &&
      hasCurated;
  }, [
    isUserTurn,
    trainingMode,
    userExplicitlyEnteredContinuation,
    baseHardEndOfBookGate,
    expectedMoveResolution?.expectedMoveUci,
    expectedMoveResolution?.source,
    expectedMoveResolution?.lineLength,
  ]);

  // Loading detection for instruction frames (prevents flashing Continue during transient states)
  // Step 4 correction: secondary async (visual/brain/lichess/pending) and broad trainerPhase must NOT suppress a valid curated target for restricted user turn.
  // Only treat as loading when there is genuinely no trusted instruction target yet.
  const isInstructionLoading = useMemo(() => {
    const continuationReadyForSurface =
      trainingMode === "continuation" &&
      trainerPhase === "ready_for_user" &&
      isUserTurn &&
      userExplicitlyEnteredContinuation &&
      continuationAnalysisStatus === "ready";
    if (continuationReadyForSurface) return false;
    if (trustedInstructionTargetExists) return false; // curated target wins; secondary loading may still refine explanation later
    if (trainerPhase !== "ready_for_user") return true;
    if (moveQualityPending || visualModelPending) return true;
    if (continuationAnalysisStatus === "analyzing") return true;
    if (brain.lichess === "loading") return true;
    // Transient resolver with no trusted guidance yet (between frames / pending data) — only when we don't already have a good curated one
    if ((expectedMoveResolution?.source ?? "") === "none" && !bookComplete && trainingMode === "restricted" && !trustedInstructionTargetExists) return true;
    return false;
  }, [
    trustedInstructionTargetExists,
    trainerPhase,
    moveQualityPending,
    visualModelPending,
    continuationAnalysisStatus,
    brain.lichess,
    userExplicitlyEnteredContinuation,
    expectedMoveResolution?.source,
    bookComplete,
    trainingMode,
  ]);

  // Final hardEndOfBookGate incorporates loading (per original) but declared after its inputs (Step 10 ordering).
  const hardEndOfBookGate = useMemo(() => {
    if (isInstructionLoading) return false;
    return baseHardEndOfBookGate;
  }, [isInstructionLoading, baseHardEndOfBookGate]);

  const opponentBookOptions=exactOpeningNodes.flatMap((node)=>node.continuations).filter((move,index,all)=>move.color===opponentColor&&all.findIndex((candidate)=>candidate.uci===move.uci)===index).map((move)=>({
    san:move.san,
    uci:move.uci,
    color:move.color as ChessColor,
    resultingFen:move.resultingFen,
  }));
  const guidedCoveragePolicy=useMemo(()=>decideGuidedCoveragePolicy({
    currentPly:moveHistory.length,
    fullMoveNumber:Number(fen.split(" ")[5]??Math.floor(moveHistory.length/2)+1),
    activeOpeningId:repertoire.id,
    activeLineId:canonicalSelectedRepertoireId,
    normalizedFen:key,
    sideToMove:game.turn() as ChessColor,
    userColor,
    branchFrequency:null,
    cumulativeBranchCoverage:null,
    nodeContinuationCount:exactOpeningNodes.reduce((sum,node)=>sum+node.continuations.length,0),
    userContinuationCount:expectedMoveResolution.candidateMoves.filter((move)=>move.color===userColor).length,
    opponentContinuationCount:opponentBookOptions.length,
    legalMoveCount:game.moves().length,
    knownBranchAvailable:expectedMoveResolution.candidateMoves.some((move)=>move.color===userColor),
    adaptiveBranchAvailable:false,
    continuationCandidateExists:Boolean(enginePreview&&normalizeFen(enginePreview.fen)===key&&enginePreview.pvs[0]),
    explicitCuratedTerminalNode,
  }),[moveHistory.length,fen,repertoire.id,canonicalSelectedRepertoireId,key,game,userColor,exactOpeningNodes,expectedMoveResolution.candidateMoves,opponentBookOptions.length,enginePreview,explicitCuratedTerminalNode]);
  const rating=ratingPreset(ratingFilter);
  const enabledViews:ActiveBoardView[]=([] as ActiveBoardView[]).concat(boardSettings.showAttack?["attack"]:[],boardSettings.showDefense?["defense"]:[],boardSettings.showPlan?["plan"]:[]);
  const safeBoardView:ActiveBoardView=enabledViews.includes(activeBoardView)?activeBoardView:(enabledViews[0]??"plan");
  const currentView=annotation[safeBoardView]??annotation.plan;
  const engineLines=enginePreview&&normalizeFen(enginePreview.fen)===normalizeFen(fen)?enginePreview.pvs:[];
  const continuationPolicyCandidate=useMemo(()=>{
    // Strict hotfix gate: only confirmed line complete (cursor >= length) or resolved Lichess <500
    const isHardEndOfBookForCandidate =
      stage2TerminalProof.proven &&
      !userExplicitlyEnteredContinuation;

    if (isHardEndOfBookForCandidate) {
      return null;
    }

    if(trainingMode!=="continuation"||!isUserTurn)return null;
    if(forceContinuationPause||!userExplicitlyEnteredContinuation)return null;
    const legalVerboseMoves=(game.moves({verbose:true}) as any[]);
    if(game.isGameOver()||legalVerboseMoves.length===0)return null;
    const legalUcis=new Set(legalVerboseMoves.map((move)=>moveToUci(move)));
    const stockfishTop10=engineLines
      .slice(0,10)
      .map((line,index)=>({
        uci:String(line.uci??"").toLowerCase(),
        san:line.san,
        rank:index+1,
        cp:typeof line.cp==="number"?line.cp:0,
      }))
      .filter((line)=>legalUcis.has(line.uci));
    if(!stockfishTop10.length){
      return {
        uci:"",
        san:"",
        source:"stockfish_unavailable",
        reason:"stockfish_provider_unavailable",
        isEmergencyLegalFallback:false,
        isEngineBestFallback:false,
        engineFallbackUsed:false,
        engineFallbackReason:"stockfish_provider_unavailable",
        databaseCandidatesRejected:false,
        rejectionReasons:[],
        debug:{
          providerStatus:"unavailable",
          suggestedMoveUci:null,
          stockfishBestMoveUci:null,
          stockfishSuggestedRank:null,
          stockfishSuggestedTop10:false,
          stockfishDepth:null,
          candidateReplacedByStockfish:false,
          replacementReason:"stockfish_provider_unavailable",
          topMoveUcis:[],
        },
      };
    }
    const best=stockfishTop10[0];
    const applied=applyUci(fen,best.uci);
    if(!applied){
      return {
        uci:"",
        san:"",
        source:"stockfish_unavailable",
        reason:"stockfish_top1_illegal",
        isEmergencyLegalFallback:false,
        isEngineBestFallback:false,
        engineFallbackUsed:false,
        engineFallbackReason:"stockfish_top1_illegal",
        databaseCandidatesRejected:false,
        rejectionReasons:[],
        debug:{
          providerStatus:"error",
          suggestedMoveUci:null,
          stockfishBestMoveUci:best.uci,
          stockfishSuggestedRank:null,
          stockfishSuggestedTop10:false,
          stockfishDepth:null,
          candidateReplacedByStockfish:false,
          replacementReason:"stockfish_top1_illegal",
          topMoveUcis:stockfishTop10.map((move)=>move.uci),
        },
      };
    }
    return {
      uci:applied.uci,
      san:applied.san,
      source:"engine_best",
      reason:"stockfish_top1_mvp",
      isEmergencyLegalFallback:false,
      isEngineBestFallback:true,
      engineFallbackUsed:false,
      engineFallbackReason:null,
      databaseCandidatesRejected:false,
      rejectionReasons:[],
      debug:{
        providerStatus:"ready",
        suggestedMoveUci:applied.uci,
        suggestedMoveSan:applied.san,
        stockfishBestMoveUci:best.uci,
        stockfishBestMoveSan:best.san,
        stockfishSuggestedRank:1,
        stockfishSuggestedTop10:true,
        stockfishDepth:null,
        candidateReplacedByStockfish:false,
        replacementReason:null,
        topMoveUcis:stockfishTop10.map((move)=>move.uci),
      },
    };
  },[
    trainingMode,
    isUserTurn,
    fen,
    game,
    engineLines,
    selectedLineCompleteConfirmed,
    lichessEndConfirmed,
    userExplicitlyEnteredContinuation,
    forceContinuationPause,
    continuationPauseClicked,
    userExplicitlyEnteredContinuation,
  ]);
  const continuationLockCandidate=useMemo(()=>{
    if(trainingMode!=="continuation"||!isUserTurn||!userExplicitlyEnteredContinuation)return null;
    const lock=continuationCandidateLock;
    if(!lock)return null;
    if(lock.continuationCandidateLockFen4!==normalizeFen(fen))return null;
    const legalUcis=new Set((game.moves({verbose:true}) as any[]).map((move)=>moveToUci(move)));
    if(!legalUcis.has(lock.continuationCandidateLockUci))return null;
    return {
      uci:lock.continuationCandidateLockUci,
      san:lock.continuationCandidateLockSan,
      source:lock.continuationCandidateLockSource,
      reason:lock.continuationCandidateLockReason,
      isEmergencyLegalFallback:false,
      isEngineBestFallback:false,
      engineFallbackUsed:false,
      engineFallbackReason:null,
      databaseCandidatesRejected:false,
      rejectionReasons:[],
      debug:{lockId:lock.continuationCandidateLockId,requestId:lock.continuationCandidateLockRequestId},
    };
  },[trainingMode,isUserTurn,userExplicitlyEnteredContinuation,continuationCandidateLock,fen,game]);
  const runtimeBookFrameShouldQuery = useMemo(() => {
    if (activeTab !== "train") return false;
    if (!runtimeOpeningIdForFrame || !runtimePlayKeyBeforeForFrame) return false;
    if (forceContinuationPause) return false;
    if (trainingMode === "continuation") {
      return trainerPhase === "ready_for_user" && isUserTurn && userExplicitlyEnteredContinuation;
    }
    if (
      trainingMode === "restricted" &&
      !isUserTurn &&
      !userExplicitlyEnteredContinuation &&
      Boolean(lastMove) &&
      lastMoveColor === userColor
    ) {
      return true;
    }
    return false;
  }, [
    activeTab,
    runtimeOpeningIdForFrame,
    runtimePlayKeyBeforeForFrame,
    forceContinuationPause,
    trainingMode,
    trainerPhase,
    isUserTurn,
    userExplicitlyEnteredContinuation,
    lastMove,
    lastMoveColor,
    userColor,
  ]);
  useLayoutEffect(()=>{
    if(!runtimeBookFrameShouldQuery){
      setRuntimeBookFrameQuery({
        openingId:runtimeOpeningIdForFrame??null,
        playKeyBefore:runtimePlayKeyBeforeForFrame??null,
        candidates:[],
        hasRuntimeBookCandidates:false,
        bookExhausted:false,
        status:"idle",
        error:null,
      });
      return;
    }

    const controller=new AbortController();
    setRuntimeBookFrameQuery((prev)=>({
      openingId:runtimeOpeningIdForFrame,
      playKeyBefore:runtimePlayKeyBeforeForFrame,
      candidates:prev.openingId===runtimeOpeningIdForFrame&&prev.playKeyBefore===runtimePlayKeyBeforeForFrame?prev.candidates:[],
      hasRuntimeBookCandidates:prev.openingId===runtimeOpeningIdForFrame&&prev.playKeyBefore===runtimePlayKeyBeforeForFrame?prev.hasRuntimeBookCandidates:false,
      bookExhausted:false,
      status:"loading",
      error:null,
    }));

    const params=new URLSearchParams({openingId:runtimeOpeningIdForFrame,playKeyBefore:runtimePlayKeyBeforeForFrame});
    void fetch(`/api/runtime-book/candidates?${params.toString()}`,{signal:controller.signal})
      .then(async(res)=>{
        const payload=await res.json();
        if(controller.signal.aborted)return;
        const candidates=Array.isArray(payload?.candidates)?payload.candidates:[];
        setRuntimeBookFrameQuery({
          openingId:runtimeOpeningIdForFrame,
          playKeyBefore:runtimePlayKeyBeforeForFrame,
          candidates,
          hasRuntimeBookCandidates:Boolean(payload?.hasRuntimeBookCandidates&&candidates.length>0),
          bookExhausted:Boolean(payload?.bookExhausted??candidates.length===0),
          status:"ready",
          error:null,
        });
      })
      .catch((error)=>{
        if(controller.signal.aborted)return;
        setRuntimeBookFrameQuery({
          openingId:runtimeOpeningIdForFrame,
          playKeyBefore:runtimePlayKeyBeforeForFrame,
          candidates:[],
          hasRuntimeBookCandidates:false,
          bookExhausted:true,
          status:"error",
          error:error instanceof Error?error.message:String(error),
        });
      });

    return()=>controller.abort();
  },[
    runtimeBookFrameShouldQuery,
    runtimeOpeningIdForFrame,
    runtimePlayKeyBeforeForFrame,
  ]);
  const runtimeBookPreferredCandidate=useMemo(
    ()=>runtimeBookFrameQuery.hasRuntimeBookCandidates?runtimeBookFrameQuery.candidates[0]??null:null,
    [runtimeBookFrameQuery.hasRuntimeBookCandidates,runtimeBookFrameQuery.candidates],
  );
  const runtimeGraphAuthorityUsed=Boolean(selectedRuntimeTrainingLineSelection?.source ?? selectedOpeningAvailability?.runtimeAvailable);
  const runtimeGraphCurrentPlayKey=runtimePlayKeyBeforeForFrame??null;
  const runtimeGraphCandidateCount=runtimeBookFrameQuery.candidates.length;
  const runtimeGraphSelectedCandidateUci=runtimeBookPreferredCandidate?.uci??null;
  const stockfishTopMovesForContinuation=useMemo(()=>mapEngineLinesToStockfishTopMoves({
    fen,
    pvs:engineLines.map((line)=>({uci:line.uci,san:line.san,cp:line.cp})),
    depth:10,
    multipv:SUGGESTION_VALIDATION_MULTIPV,
    providerStatus:engineLines.length?"ready":"unavailable",
    errorReason:engineLines.length?undefined:"stockfish_provider_unavailable",
  }),[fen,engineLines]);
  const continuationResolvedTargetUci=runtimeBookPreferredCandidate?.uci??stockfishTopMovesForContinuation.bestMoveUci??null;
  const continuationResolvedTargetSan=runtimeBookPreferredCandidate?.san??stockfishTopMovesForContinuation.bestMoveSan??null;
  const continuationResolvedTargetSource=runtimeBookPreferredCandidate?.uci
    ?"stage2-runtime-book"
    :continuationResolvedTargetUci
      ?"stockfish_top_move"
      :null;
  const continuationResolvedTargetLabel=runtimeBookPreferredCandidate?.uci
    ?"Book"
    :continuationResolvedTargetUci
      ?"Best"
      :null;
  const continuationTargetResolverStatus=trainingMode!=="continuation"
    ?"not_continuation_mode"
    :runtimeBookPreferredCandidate?.uci
      ?"runtime_book_ready"
    :stockfishTopMovesForContinuation.providerStatus==="ready"&&continuationResolvedTargetUci
      ?"stockfish_ready"
      :stockfishTopMovesForContinuation.providerStatus==="ready"
        ?"stockfish_ready_without_target"
        :"stockfish_unavailable";
  const continuationLegalMoveUcis=useMemo(
    ()=>((game.moves({verbose:true}) as any[]).map((move)=>moveToUci(move))),
    [game],
  );
  const restrictedOpponentReplyAuthorityPreview=useMemo(()=> {
    const runtimeBookMatchesFrame=runtimeBookFrameQuery.status==="ready"&&runtimeBookFrameQuery.openingId===runtimeOpeningIdForFrame&&runtimeBookFrameQuery.playKeyBefore===runtimePlayKeyBeforeForFrame;
    const runtimeBookSelectedCandidate=runtimeBookMatchesFrame
      ? runtimeBookFrameQuery.candidates.find((candidate)=>continuationLegalMoveUcis.includes(candidate.uci))??null
      : null;
    return resolveRestrictedOpponentReplyAuthority({
      trainingMode:"restricted",
      currentOpponentBookOptionCount:0,
      legalMoveCount:continuationLegalMoveUcis.length,
      legalMoveUcis:continuationLegalMoveUcis,
      runtimeBookMatchesFrame,
      runtimeBookStatus:runtimeBookFrameQuery.status,
      runtimeBookBookExhausted:runtimeBookFrameQuery.bookExhausted,
      runtimeBookCandidateCount:runtimeBookFrameQuery.candidates.length,
      runtimeBookOpeningId:runtimeBookFrameQuery.openingId,
      runtimeBookPlayKeyBefore:runtimeBookFrameQuery.playKeyBefore,
      currentOpeningId:selectedRepertoireId,
      currentPlayKeyBefore:runtimePlayKeyBeforeForFrame,
      runtimeBookCandidates:runtimeBookFrameQuery.candidates,
      runtimeBookTopCandidate:runtimeBookSelectedCandidate,
    });
  },[
    continuationLegalMoveUcis.join("|"),
    runtimeBookFrameQuery.status,
    runtimeBookFrameQuery.openingId,
    runtimeBookFrameQuery.playKeyBefore,
    runtimeBookFrameQuery.candidates,
    runtimeBookFrameQuery.bookExhausted,
    runtimeOpeningIdForFrame,
    runtimePlayKeyBeforeForFrame,
    selectedRepertoireId,
  ]);
  const continuationCandidateResolution=useMemo(()=>resolveEffectiveContinuationCandidate({
    trainingMode,
    isUserTurn,
    trainerPhase,
    boardFen:fen,
    boardFen4:normalizeFen(fen),
    legalMoveUcis:continuationLegalMoveUcis,
    lockedCandidate:continuationLockCandidate?{
      uci:continuationLockCandidate.uci,
      san:continuationLockCandidate.san,
      source:continuationLockCandidate.source,
      label:"Best",
    }:null,
    continuationResolvedTargetUci,
    continuationResolvedTargetSan,
    continuationResolvedTargetSource,
    continuationResolvedTargetLabel,
    continuationResolvedTargetFen4:stockfishTopMovesForContinuation.fen,
  }),[
    trainingMode,
    isUserTurn,
    trainerPhase,
    fen,
    continuationLegalMoveUcis.join("|"),
    continuationLockCandidate?.uci,
    continuationLockCandidate?.san,
    continuationLockCandidate?.source,
    continuationResolvedTargetUci,
    continuationResolvedTargetSan,
    continuationResolvedTargetSource,
    continuationResolvedTargetLabel,
    stockfishTopMovesForContinuation.fen,
    runtimeBookPreferredCandidate?.uci,
    runtimeBookPreferredCandidate?.san,
  ]);
  const effectiveContinuationCandidate=continuationCandidateResolution.candidate?{
    uci:continuationCandidateResolution.candidate.uci,
    san:continuationCandidateResolution.candidate.san,
    source:continuationCandidateResolution.candidate.source,
    label:continuationCandidateResolution.candidate.label,
    reason:continuationCandidateResolution.candidate.reason,
    fen4:continuationCandidateResolution.candidate.fen4,
    pieceTypeCode:continuationCandidateResolution.candidate.pieceTypeCode,
    pieceTypeCanonical:continuationCandidateResolution.candidate.pieceTypeCanonical,
    from:continuationCandidateResolution.candidate.from,
    to:continuationCandidateResolution.candidate.to,
    isEmergencyLegalFallback:false,
    isEngineBestFallback:false,
    engineFallbackUsed:false,
    engineFallbackReason:null,
    databaseCandidatesRejected:false,
    rejectionReasons:[],
    debug:{
      providerStatus:stockfishTopMovesForContinuation.providerStatus,
      suggestedMoveUci:continuationCandidateResolution.candidate.uci,
      suggestedMoveSan:continuationCandidateResolution.candidate.san,
      stockfishBestMoveUci:continuationResolvedTargetUci,
      stockfishBestMoveSan:continuationResolvedTargetSan,
      stockfishSuggestedRank:continuationResolvedTargetUci?1:null,
      stockfishSuggestedTop10:Boolean(continuationResolvedTargetUci),
      stockfishDepth:stockfishTopMovesForContinuation.depth,
      candidateReplacedByStockfish:false,
      replacementReason:null,
      topMoveUcis:stockfishTopMovesForContinuation.topMoves.map((move)=>move.uci),
    },
  }:null;
  const continuationSuggestionValidation=useMemo(()=>{
    if(trainingMode!=="continuation")return null;
    if(!effectiveContinuationCandidate?.uci)return null;
    return validateContinuationSuggestionAgainstStockfish({
      candidateUci:effectiveContinuationCandidate.uci,
      candidateSan:effectiveContinuationCandidate.san??effectiveContinuationCandidate.uci,
      stockfish:stockfishTopMovesForContinuation,
    });
  },[trainingMode,effectiveContinuationCandidate?.uci,effectiveContinuationCandidate?.san,stockfishTopMovesForContinuation]);
  const validatedContinuationCandidate=effectiveContinuationCandidate;
  const branchCompleteContract=useMemo(()=>resolveBranchCompleteContract({
    trainingMode,
    trainerPhase,
    isUserTurn,
    userExplicitlyEnteredContinuation,
    isTerminal:game.isGameOver()||game.moves().length===0,
    hasInstructionTarget:Boolean(expectedMoveResolution.expectedMoveUci),
    hasContinuationCandidate:Boolean(
      trainingMode==="continuation"&&
      userExplicitlyEnteredContinuation&&
      validatedContinuationCandidate?.uci
    ),
    pendingOpponentRequestExists:Boolean(pendingOpponentRequest),
    expectedMoveSource:expectedMoveResolution.source,
    expectedMoveReason:expectedMoveResolution.reason,
    expectedMoveUci:expectedMoveResolution.expectedMoveUci,
    lineExhaustedByCursor:selectedLineCompleteConfirmed,
    lineExhaustedByLichess:lichessEndConfirmed,
    afterFinalUserMove:!isUserTurn&&lastMoveColor===userColor,
    selectedLineId:selectedRuntimeLineId,
    fen4:normalizeFen(fen),
    lastUserMoveUci:lastMoveColor===userColor?lastMove:null,
    lastUserMoveSan:lastMoveColor===userColor?lastMoveSan:null,
    exactNodeHasChildren:selectedLineExactNodeHasChildren,
    hasNextOpponentMove:hasNextOpponentMoveInSelectedLine,
    hasNextUserMove:hasNextUserMoveInSelectedLine,
    explicitCuratedTerminalNode,
    validBranchCompleteLatch:Boolean(branchCompleteLatch.active&&branchCompleteLatch.lineId===selectedRuntimeLineId),
  }),[
    trainingMode,
    trainerPhase,
    isUserTurn,
    userExplicitlyEnteredContinuation,
    game,
    expectedMoveResolution.source,
    expectedMoveResolution.reason,
    expectedMoveResolution.expectedMoveUci,
    validatedContinuationCandidate?.uci,
    pendingOpponentRequest,
    selectedLineCompleteConfirmed,
    lichessEndConfirmed,
    lastMoveColor,
    userColor,
    canonicalSelectedRepertoireId,
    fen,
    lastMove,
    lastMoveSan,
    selectedLineExactNodeHasChildren,
    hasNextOpponentMoveInSelectedLine,
    hasNextUserMoveInSelectedLine,
    explicitCuratedTerminalNode,
    branchCompleteLatch.active,
    branchCompleteLatch.lineId,
    restrictedLineExhaustedOnOpponentTurnAfterUserMove,
  ]);
  const branchCompleteEligibleNow=Boolean(stage2TerminalProof.proven&&!trustedInstructionTargetExists&&!continueFromHereClicked&&!userExplicitlyEnteredContinuation);
  const continueFromHereClickHandled=Boolean(continueFromHereClicked&&userExplicitlyEnteredContinuation&&trainingMode==="continuation"&&!branchCompleteEligibleNow);
  const continueFromHereClickBlockedReason=continueFromHereClicked&&!continueFromHereClickHandled
    ? (branchCompleteEligibleNow ? "branch_complete_still_active" : "continuation_not_entered")
    : null;
  const branchCompleteReasonNow=stage2TerminalProof.proven
    ? stage2TerminalProof.reason ?? branchCompleteContract.reason ?? "line_complete"
    : stage2TerminalProof.blockedReasons[0] ?? branchCompleteContract.blockedReason ?? "terminal_proof_required";
  const branchCompleteShouldCancelPending=branchCompleteEligibleNow&&Boolean(pendingOpponentRequest);
  const continuationFlowContract=useMemo(()=>resolveContinuationFlowContract({
    trainingMode,
    branchComplete:branchCompleteEligibleNow,
    isUserTurn,
    hasTarget:Boolean(validatedContinuationCandidate?.uci&&trainingMode==="continuation"&&userExplicitlyEnteredContinuation),
    selectedCandidateUci:validatedContinuationCandidate?.uci??null,
    selectedCandidateSan:validatedContinuationCandidate?.san??null,
    selectedCandidateSource:validatedContinuationCandidate?.source??null,
    pendingOpponentRequestExists:Boolean(pendingOpponentRequest),
    candidateAnalysisStatus:continuationAnalysisStatus,
    continuationRuntimeStatus:continuationAnalysisStatus,
    terminalReason:game.isGameOver()?"terminal_position":null,
  }),[
    trainingMode,
    branchCompleteEligibleNow,
    isUserTurn,
    validatedContinuationCandidate?.uci,
    validatedContinuationCandidate?.san,
    validatedContinuationCandidate?.source,
    pendingOpponentRequest,
    continuationAnalysisStatus,
    game,
    userExplicitlyEnteredContinuation,
  ]);
  const currentInstructionFrame=useMemo(()=>{
    if(game.isGameOver()||game.moves().length===0){
      return buildCurrentInstructionFrame({
        kind: "terminal",
        fenBefore: fen,
        ply: game.history().length,
        sideToMove: game.turn() === "w" ? "white" : "black",
        target: null,
        mode: "terminal",
        source: "terminal",
      });
    }

    if(branchCompleteEligibleNow){
      return buildCurrentInstructionFrame({
        kind: "branch_complete",
        fenBefore: fen,
        ply: game.history().length,
        sideToMove: game.turn() === "w" ? "white" : "black",
        target: null,
        mode: "blocked",
        source: "none",
        branchComplete: {
          isComplete: true,
          reason: branchCompleteReasonNow,
          continueFromHereAvailable: true,
        },
      });
    }

    if(trainingMode==="continuation"&&userExplicitlyEnteredContinuation){
      if(continuationFlowContract.state==="continuation_terminal"){
        return buildCurrentInstructionFrame({
          kind: "terminal",
          fenBefore: fen,
          ply: game.history().length,
          sideToMove: game.turn() === "w" ? "white" : "black",
          target: null,
          mode: "terminal",
          source: "terminal",
        });
      }
      if(continuationFlowContract.state==="continuation_opponent_replying"){
        return buildCurrentInstructionFrame({
          kind: "opponent_replying",
          fenBefore: fen,
          ply: game.history().length,
          sideToMove: game.turn() === "w" ? "white" : "black",
          target: null,
          mode: "blocked",
          source: "none",
        });
      }
      if(
        continuationFlowContract.state==="continuation_analyzing"||
        continuationFlowContract.state==="continuation_error"||
        continuationFlowContract.state==="continuation_user_move_pending"
      ){
        return buildCurrentInstructionFrame({
          kind: "transitioning",
          fenBefore: fen,
          ply: game.history().length,
          sideToMove: game.turn() === "w" ? "white" : "black",
          target: null,
          mode: "continuation",
          source: "continuation_policy",
        });
      }
    }

    // Step 4/5 exact priority (transcript as source of truth):
    // 1. hardEndOfBookGate (terminal proof only) → branch transition (Continue)
    // 2. trusted curated target exists → normal guided instruction (playable from move 1)
    // 3. isInstructionLoading (no trusted target yet + actually resolving) → Thinking...
    // 4. safe neutral
    if (!game.isGameOver() && game.moves().length>0 && isUserTurn&&forceContinuationPause&&!userExplicitlyEnteredContinuation) {
      return buildCurrentInstructionFrame({
        kind: "branch_complete",
        fenBefore: fen,
        ply: game.history().length,
        sideToMove: game.turn() === "w" ? "white" : "black",
        target: null,
        mode: "blocked",
        source: "none",
        branchComplete: {
          isComplete: true,
          reason: "continuation_pause_required",
          continueFromHereAvailable: true,
        },
      });
    }

    if (!game.isGameOver() && game.moves().length>0 && hardEndOfBookGate && !userExplicitlyEnteredContinuation) {
      return buildCurrentInstructionFrame({
        kind: "branch_complete",
        fenBefore: fen,
        ply: game.history().length,
        sideToMove: game.turn() === "w" ? "white" : "black",
        target: null,
        mode: "blocked",
        source: "none",
        branchComplete: {
          isComplete: true,
          reason: selectedLineCompleteConfirmed ? "curated_line_complete" : "line_complete",
          continueFromHereAvailable: true,
        },
      });
    }

    if (trustedInstructionTargetExists) {
      // Fall through to the normal buildCurrentInstructionFrame path below with a good guidedMove.
      // This ensures the first curated move (e.g. e4) produces a real target on initial Italian load.
    }

    if (isInstructionLoading) {
      return buildCurrentInstructionFrame({
        kind: "transitioning",
        fenBefore: fen,
        ply: game.history().length,
        sideToMove: game.turn() === "w" ? "white" : "black",
        target: null,
        mode: "blocked",
        source: "none",
      });
    }

    const thisFrameKey = computeInstructionFrameKey({
      fen,
      trainingMode,
      isUserTurn,
      trainerPhase,
      source: trainingMode==="continuation" ? "continuation_candidate" : "guided",
    });

    // v2.7.39.1 locking: if we have a locked continuation for this exact frameKey, prefer it over fresh engineLines
    // This is the core "prevent replacement" guard (Coach Perfection Gate 3A).
    const lockedForThisFrame = lockedContinuationRef.current[thisFrameKey];
    const useLocked = !!(trainingMode==="continuation" && isUserTurn && lockedForThisFrame?.uci);
    const guidedMoveAuthorityEligible =
      Boolean(expectedMoveResolution.expectedMoveUci) &&
      expectedMoveResolution.source !== "continuation_candidate" &&
      expectedMoveResolution.source !== "opening_family_plan";

    return buildCurrentInstructionFrame({
      frameId:trainerFrameId,
      fen,
      trainingMode,
      trainerPhase,
      trainerView,
      isUserTurn,
      guidedMove:guidedMoveAuthorityEligible?{
        uci:expectedMoveResolution.expectedMoveUci,
        san:expectedMoveResolution.expectedMoveSan,
        source:expectedMoveResolution.source,
        kind:expectedMoveResolution.source==="opening_branch"?"lichess_branch_move":expectedMoveResolution.source==="opening_family_plan"?"adaptive_branch_move":"guided_move",
        trust:"book_verified",
      }:null,
      continuationCandidate:trainingMode==="continuation"&&isUserTurn&&userExplicitlyEnteredContinuation&&!forceContinuationPause&&validatedContinuationCandidate?.uci&&validatedContinuationCandidate.source!=="no_reliable_continuation"?{
        uci: useLocked && lockedForThisFrame
          ? lockedForThisFrame.uci
          : validatedContinuationCandidate.uci,
        san: useLocked && lockedForThisFrame
          ? lockedForThisFrame.san
          : validatedContinuationCandidate.san,
        source: useLocked && lockedForThisFrame
          ? (lockedForThisFrame.source ?? "locked_continuation_candidate")
          : validatedContinuationCandidate.source,
        trust:"continuation_verified",
      }:null,
      preferredTargetKind:trainingMode==="continuation"?"continuation_candidate":"guided_move",
    });
  },[
    trainerFrameId,
    fen,
    trainingMode,
    trainerPhase,
    trainerView,
    isUserTurn,
    expectedMoveResolution,
    game,
    engineLines,
    validatedContinuationCandidate,
    isInstructionLoading,
    hardEndOfBookGate,
    userExplicitlyEnteredContinuation,
    selectedLineCompleteConfirmed,
    continuationPauseClicked,
    userExplicitlyEnteredContinuation,
    forceContinuationPause,
    continuationPauseDecision.pauseReason,
    branchCompleteEligibleNow,
    branchCompleteReasonNow,
    continuationFlowContract.state,
  ]);
  const instructionTarget=currentInstructionFrame.target;

  // v2.7.39.1 Target Locking: record the official continuation candidate under its stable frame key
  // so future enginePreview/explorer updates cannot mutate it for this frame (unless explicit unlock).
  if (instructionTarget?.kind === "continuation_candidate" && instructionTarget.uci) {
    const lockKey = currentInstructionFrame.instructionFrameKey || computeInstructionFrameKey({
      fen,
      trainingMode,
      isUserTurn,
      trainerPhase,
      source: "continuation_candidate",
    });
    if (!lockedContinuationRef.current[lockKey]) {
      lockedContinuationRef.current[lockKey] = {
        uci: instructionTarget.uci,
        san: instructionTarget.san,
        source: instructionTarget.source,
      };
    }
  } else if (trainingMode !== "continuation") {
    // Clear locks when leaving continuation mode (simple policy for now)
    lockedContinuationRef.current = {};
  }

  const continuationRuntimeState=useMemo(()=>classifyContinuationRuntimeState({
    fen,
    trainingMode,
    isUserTurn,
    userExplicitlyEnteredContinuation,
    hasContinuationCandidate:instructionTarget?.kind==="continuation_candidate",
    analysisStatus:continuationAnalysisStatus,
  }),[fen,trainingMode,isUserTurn,userExplicitlyEnteredContinuation,instructionTarget?.kind,continuationAnalysisStatus]);
  const expectedUserOptions=useMemo<Continuation[]>(()=>isBookLikeInstructionTarget(instructionTarget)?[{
    san:instructionTarget.san,
    uci:instructionTarget.uci,
    color:instructionTarget.color,
    resultingFen:instructionTarget.resultingFen,
  }]:[],[instructionTarget]);
  const currentSelectedCandidateUci=instructionTarget?.kind==="continuation_candidate"?instructionTarget.uci:null;
  const currentSelectedCandidateSan=instructionTarget?.kind==="continuation_candidate"?instructionTarget.san:null;
  const currentSelectedCandidateSource=instructionTarget?.source??"none";
  const currentSelectedCandidateLegal=Boolean(currentSelectedCandidateUci&&(game.moves({verbose:true}) as any[]).some((move)=>moveToUci(move)===currentSelectedCandidateUci));
  const expectedUserOptionsSignature=expectedUserOptions.map((move)=>`${move.uci??""}:${move.san??""}`).join("|");
  // expectedMovesForValidation and expectedMovesForValidationKey are now declared early (from expectedMoveResolution only)
  // to satisfy declaration ordering and eliminate TDZ in continuationPolicyCandidate + hardEndOfBookGate consumers.
  const expectedUserUcis=expectedMovesForValidation.map(move=>move.uci);
  const expectedUserSans=expectedMovesForValidation.map(move=>move.san).filter(Boolean) as string[];
  const frameKey=useMemo(()=>buildRuntimeFrameKey({
    fen,
    trainerPhase,
    trainerView,
    trainingMode,
    isUserTurn,
    instructionTargetUci:instructionTarget?.uci??null,
  }),[fen,trainerPhase,trainerView,trainingMode,isUserTurn,instructionTarget?.uci]);
  useEffect(()=>{
    const previous=previousSelectedCandidateUciRef.current;
    const staleDetected=Boolean(previous&&currentSelectedCandidateUci&&previous!==currentSelectedCandidateUci);
    candidateSyncDebugRef.current={
      currentSelectedCandidateUci,
      previousSelectedCandidateUci:previous,
      staleSelectedCandidateDetected:staleDetected,
      staleSelectedCandidateCleared:staleDetected,
    };
    previousSelectedCandidateUciRef.current=currentSelectedCandidateUci??null;
  },[currentSelectedCandidateUci]);
  const shouldValidateTrainingMove=activeTab==="train"&&trainingMode==="restricted"&&isUserTurn&&!bookComplete&&historyIndex>=positionHistory.length-1&&expectedMovesForValidation.length>0;
  const moveQualityUserStatus=getMoveQualityUserStatus(moveQuality,moveQualityPending);
  const moveQualityVerified=isMoveQualityVerified(moveQuality);
  const hideUnverifiedTrainingHints=trainingMode==="restricted"&&isUserTurn&&!showAnswer&&shouldValidateTrainingMove&&!moveQualityVerified;
  const visualSuppressed=Boolean(visualModelOutput?.suppress?.includes("recommendation_pending"));
  const activeVisualModelOutput=visualModelOutput&&!visualSuppressed?visualModelOutput:null;
  const teachingOrchestration=useMemo(()=>{
    if(activeTab!=="train"||trainingMode!=="restricted"||!isUserTurn)return null;
    const expectedMove=expectedMovesForValidation[0];
    if(!expectedMove)return null;
    const expectedMoveBook=explorerMoves.find((m)=>m.uci===expectedMove.uci);
    const totalBookGames=explorerMoves.reduce((sum,m)=>sum+(m.total||0),0);
    const moveGames=expectedMoveBook?.total??0;
    try{
      return orchestrateTeaching({
        teachingInput:{
          fenBefore:fen,
          move:{
            san:expectedMove.san??expectedMove.uci,
            uci:expectedMove.uci,
            from:expectedMove.uci.slice(0,2),
            to:expectedMove.uci.slice(2,4),
            promotion:expectedMove.uci.length>4?expectedMove.uci.slice(4,5):undefined,
          },
          sideToMove:userColor,
          userColor,
          trainerView,
          trainingMode,
          validation:{
            required:shouldValidateTrainingMove,
            userStatus:moveQualityUserStatus,
            internalStatus:moveQuality?.status,
          },
          context:{
            openingName:repertoire.name,
            isUserTurn,
            reviewMode:historyIndex<positionHistory.length-1,
            previousMoveSan:lastMoveSan||undefined,
          },
          userMemory:{
            patternSeenCount:progress.trainedPositions[normalizeFen(fen)]?1:0,
            patternMissedCount:progress.mistakes[normalizeFen(fen)]?.count??0,
            patternSuccessCount:progress.trainedPositions[normalizeFen(fen)]?1:0,
          },
        },
        expectedMove:{uci:expectedMove.uci,san:expectedMove.san},
        engineTopMoves:engineLines.map((line,index)=>({uci:line.uci,san:line.san,rank:index+1,scoreCp:line.cp})),
        bookTopMoves:explorerMoves.slice(0,5).map((move)=>({uci:move.uci,san:move.san,moveShare:move.pct/100,moveGames:move.total,totalGames:totalBookGames})),
        repertoireMoves:expectedMovesForValidation.map((move)=>({uci:move.uci,san:move.san})),
        bookSupportInput:{
          source:"explorer",
          totalGames:totalBookGames,
          moveGames,
          moveShare:totalBookGames>0?moveGames/totalBookGames:0,
        },
        trainerView,
        showAnswer,
        isUserTurn,
        trainingMode,
      });
    }catch{
      return null;
    }
  },[activeTab,trainingMode,isUserTurn,expectedMovesForValidationKey,fen,userColor,trainerView,showAnswer,shouldValidateTrainingMove,moveQualityUserStatus,moveQuality?.status,repertoire.name,historyIndex,positionHistory.length,lastMoveSan,explorerMoves,engineLines,progress.trainedPositions,progress.mistakes]);
  const boardFen=normalizeFen(fen);
  const effectiveViewModeForVisual = (trainerView === "plain" && showMoreShown) ? "assisted" : trainerView;
  const visualRecipe=useMemo(()=>teachingOrchestration?compileVisualRecipe({
    trainingContext:teachingOrchestration,
    expectedMoveUci:teachingOrchestration.cue.metadata.moveUci,
    expectedMoveSan:teachingOrchestration.cue.metadata.moveSan,
    openingId:canonicalSelectedRepertoireId,
    lineId:selectedRuntimeLineId,
    fen,
    frameId:trainerFrameId,
    viewMode:effectiveViewModeForVisual,
    revealState:showAnswer?"revealed":"hidden",
    trainerPhase,
    userToMove:isUserTurn,
  }):null,[teachingOrchestration,selectedRepertoireId,fen,trainerFrameId,trainerView,showAnswer,trainerPhase,isUserTurn,showMoreShown,effectiveViewModeForVisual]);
  const visualRecipeMoveUci=visualRecipe?.moveUci?.toLowerCase()??null;
  const visualRecipeTargetMatchesInstructionTarget=instructionTarget?.uci?(!visualRecipeMoveUci||visualRecipeMoveUci===instructionTarget.uci):"unknown";
  const visualRecipeBlockedByTargetMismatch=Boolean(instructionTarget?.uci&&visualRecipeMoveUci&&visualRecipeMoveUci!==instructionTarget.uci);
  const visualRecipeForRender=!instructionTarget?.uci||visualRecipeBlockedByTargetMismatch?null:visualRecipe;
  const visualRecipeOverlay=useMemo(()=>adaptVisualRecipe({
    recipe:visualRecipeForRender,
    phase:trainerPhase,
    userToMove:isUserTurn,
    viewMode:effectiveViewModeForVisual,
    boardFen,
    trainerFrameId,
    overlayFrameId,
    opponentCandidateRenderedInMainUi:false,
  }),[visualRecipeForRender,trainerPhase,isUserTurn,trainerView,boardFen,trainerFrameId,overlayFrameId,showMoreShown,effectiveViewModeForVisual]);
  const visualRecipePlayback=useVisualRecipePlayback({
    recipe:visualRecipeForRender,
    phase:trainerPhase,
    viewMode:effectiveViewModeForVisual,
    boardFen,
    trainerFrameId,
    overlayFrameId,
    userToMove:isUserTurn,
    adapterAllowed:visualRecipeOverlay.adapterAllowed,
    adapterSuppressedReason:visualRecipeOverlay.adapterSuppressedReason,
    opponentCandidateRenderedInMainUi:false,
    enabled:trainerPhase==="ready_for_user"&&isUserTurn&&visualRecipeOverlay.adapterAllowed&&effectiveViewModeForVisual==="assisted",
  });
  const overlayFen=teachingOrchestration?normalizeFen(teachingOrchestration.cue.metadata.fenBefore):undefined;
  const overlaySource=teachingOrchestration?visualRecipeOverlay.overlaySource:activeVisualModelOutput?"visual_model":"annotation";
  const overlaySuppressedReason=teachingOrchestration?visualRecipeOverlay.suppressedReason:
    trainerView==="plain"&&!showAnswer?"plain_view":
    trainerPhase!=="ready_for_user"?"phase_not_ready_for_user":
    !isUserTurn?"not_user_turn":
    undefined;
  const staleOverlayFlag=staleOverlayIgnored||visualRecipeOverlay.staleOverlayIgnored;
  const visualRecipeMainLines:ActiveLine[]=useMemo(()=>{
    if(overlaySuppressedReason||!instructionTarget?.uci)return[];
    const legalLines=visualRecipePlayback.lines.filter((line)=>isValidSquare(line.from)&&isValidSquare(line.to));
    if(!legalLines.length)return[];
    const expectedFrom=instructionTarget.from;
    const expectedTo=instructionTarget.to;
    const matching=legalLines.find((line)=>line.from===expectedFrom&&line.to===expectedTo);
    const primary=matching??{from:expectedFrom,to:expectedTo,kind:"plan" as const,label:instructionTarget.san};
    return [primary];
  },[overlaySuppressedReason,visualRecipePlayback.lines,instructionTarget?.uci,instructionTarget?.from,instructionTarget?.to,instructionTarget?.san]);
  const legacyVisualLines:ActiveLine[]=visualModelOutput?(activeVisualModelOutput&&trainerPhase==="ready_for_user"&&isUserTurn&&trainerView==="assisted"?filterLegacyMainUiLines((activeVisualModelOutput.arrows??[]).filter(a=>isValidSquare(a.from)&&isValidSquare(a.to)).slice(0,2).map(a=>({from:a.from,to:a.to,kind:visualLineKind(a.role,a.kind),label:a.label}))):[]):filterLegacyMainUiLines(currentView.lines);
  const visualContext=activeVisualModelOutput?.context;
  const visualAnimationName=activeVisualModelOutput?.animationPackage?.name??activeVisualModelOutput?.animation;
  const safeMoveArrowVisual=useMemo(()=> {
    const moveUci=trainingMode==="restricted"&&isBookLikeInstructionTarget(instructionTarget)?instructionTarget.uci:null;
    const moveSan=trainingMode==="restricted"&&isBookLikeInstructionTarget(instructionTarget)?instructionTarget.san:null;
    const moveLegal=Boolean(moveUci&&(game.moves({verbose:true}) as any[]).some((move)=>moveToUci(move)===moveUci));
    const shouldRender=Boolean(
      activeBoard &&
      trainerPhase==="ready_for_user" &&
      isUserTurn &&
      trainerView==="assisted" &&
      moveUci &&
      moveLegal &&
      trainingMode==="restricted" &&
      !visualRecipeMainLines.length
    );
    if(!shouldRender||!moveUci){
      return {source:"guided_target_fallback" as const,shouldRender:false,lines:[],highlights:[],blockedReason:moveUci?"not_authorized_visual_surface":"missing_candidate_uci"};
    }
    return {
      source:"guided_target_fallback" as const,
      shouldRender:true,
      lines:[{from:moveUci.slice(0,2),to:moveUci.slice(2,4),kind:"plan",label:moveSan??moveUci}],
      highlights:[{square:moveUci.slice(2,4),role:"target"}],
      blockedReason:undefined,
    };
  },[activeBoard,trainerPhase,isUserTurn,trainerView,trainingMode,instructionTarget,visualRecipeMainLines.length,game]);
  const basePatternCue=buildPatternCue({trainerView,visualModelOutput,visualModelPending,visualModelError,visualSuppressed,moveQuality,moveQualityPending,shouldValidateTrainingMove,annotation,expectedUserOptions,trainingMode,isUserTurn,bookComplete,showAnswer,engineLines});
  const patternCue=teachingOrchestration&&(teachingOrchestration.permission.canShowPatternCue||teachingOrchestration.permission.canShowContextCue)?{
    ...basePatternCue,
    status:"ready" as PatternCueStatus,
    source:teachingOrchestration.permission.canShowPatternCue?"rule_visual" as const:"local_fast" as const,
    title:teachingOrchestration.cue.userFacing.title||"Move not verified",
    snippet:teachingOrchestration.cue.userFacing.snippet||"Blundr will not invent a plan here.",
    next:teachingOrchestration.nextPlay.allowed?teachingOrchestration.cue.userFacing.next:undefined,
    concept:teachingOrchestration.cue.conceptId,
  }:basePatternCue;
  const patternCueBadgeLabel=trainerView==="assisted"&&!showAnswer&&teachingOrchestration?`Assisted View • ${teachingOrchestration.userLabel}`:getMoveQualityBadgeLabel({trainerView,showAnswer,shouldValidateTrainingMove,moveQuality,moveQualityPending,patternCueStatus:patternCue.status});
  const showValidatedBadge=trainerView==="assisted"&&!showAnswer&&Boolean(teachingOrchestration?.cue.userFacing.badge);
  const moveImpact=teachingOrchestration?.moveImpact??impactFromEngine(engineLines[0]);
  const coachMemoryForDecision=coachUtteranceMemoryRef.current;
  const coachContextResult=useMemo(()=>buildCoachContext({
    frameId:trainerFrameId,
    boardFen:fen,
    viewMode:trainingMode==="continuation"?"freeplay":(trainerView==="assisted"?"assisted":"plain"),
    revealState:showAnswer?"revealed":"hidden",
    phase:trainerPhase,
    userToMove:isUserTurn,
    bookStatus:bookComplete?"book_complete":trainingMode==="continuation"?"out_of_book":"in_book",
    trainingContext:teachingOrchestration?{
      conceptId:teachingOrchestration.cue.conceptId,
      patternId:`${canonicalSelectedRepertoireId}:${teachingOrchestration.cue.conceptId}`,
      moveTrust:teachingOrchestration.moveTrust,
      contextTrust:teachingOrchestration.contextTrust,
    }:undefined,
    visualRecipe:visualRecipe?{
      frameId:visualRecipe.frameId,
      fen:visualRecipe.fen,
      mode:visualRecipe.mode,
      conceptId:visualRecipe.conceptId,
      patternId:visualRecipe.patternId,
      visualRecipeId:visualRecipe.visualRecipeId,
      moveUci:visualRecipe.moveUci,
      moveSan:visualRecipe.moveSan,
      keySquares:visualRecipe.learningAnchor.keySquares,
      keyPieces:visualRecipe.learningAnchor.keyPieces,
      primitiveTypes:visualRecipe.beats.flatMap((beat)=>beat.primitives.map((primitive)=>primitive.type)),
      canShowAnswerMove:visualRecipe.permissions.canShowAnswerMove,
      canShowContext:visualRecipe.permissions.canShowContext,
    }:null,
    attempts:progress.attempts,
    wrongAttempts:reviewingFen&&progress.mistakes[reviewingFen]?progress.mistakes[reviewingFen].count:0,
    hintUsed:coachHintRequestCount>0,
    answerShown:showAnswer,
    elapsedMs:Math.max(0,Date.now()-positionStartedAtRef.current),
    priorPatternMisses:progress.mistakes[normalizeFen(fen)]?.count??0,
    priorPatternSuccesses:progress.trainedPositions[normalizeFen(fen)]?1:0,
    recentUtteranceIds:coachMemoryForDecision.slice(-5).map((entry:any)=>entry.utteranceId),
    recentUtteranceFamilies:coachMemoryForDecision.slice(-5).map((entry:any)=>entry.utteranceFamily),
  }),[trainerFrameId,fen,trainingMode,trainerView,showAnswer,trainerPhase,isUserTurn,bookComplete,teachingOrchestration,visualRecipe,progress,reviewingFen,coachHintRequestCount,selectedRepertoireId,coachMemoryForDecision]);
  const adaptiveCoachDecision=useMemo(()=>decideCoachOutput({
    context:coachContextResult.context,
    interaction:coachInteraction,
    outcome:reviewingFen&&progress.mistakes[reviewingFen]?"wrong":"none",
    hintRequestCount:coachHintRequestCount,
    utteranceMemory:coachMemoryForDecision,
    brainInput:{
      fen,
      trainerFrameId:String(trainerFrameId),
      trainingMode:bookComplete||trainingMode==="continuation"?"continuation":"restricted",
      viewMode:trainingMode==="continuation"?"freeplay":(trainerView==="assisted"?"assisted":"plain"),
      bookStatus:bookComplete?"book_complete":trainingMode==="continuation"?"out_of_book":"in_book",
      expectedMoveUci:expectedUserOptions[0]?.uci,
      expectedMoveSan:expectedUserOptions[0]?.san,
      selectedCandidateMoveUci:currentSelectedCandidateUci??undefined,
      selectedCandidateMoveSan:currentSelectedCandidateSan??undefined,
      enginePreview,
      visualRecipe,
      trainingContext:teachingOrchestration,
      teachingOrchestration,
      repertoireMoves:expectedUserOptions.map((move)=>move.uci),
      lichessContinuationMoves:explorerMoves.map((move)=>move.uci),
      stale:coachContextResult.context?(!coachContextResult.context.recipeFrameMatchesBoard||!coachContextResult.context.recipeFenMatchesBoard):true,
      expectedMoveSource:expectedMoveResolution.source,
      expectedMoveCoverageTier:expectedMoveResolution.coverageTier,
      expectedMoveResolutionReason:expectedMoveResolution.reason,
    },
  }),[coachContextResult,coachInteraction,reviewingFen,progress.mistakes,coachHintRequestCount,coachMemoryForDecision,fen,trainerFrameId,bookComplete,trainingMode,trainerView,expectedUserOptionsSignature,currentSelectedCandidateUci,currentSelectedCandidateSan,enginePreview,visualRecipe,teachingOrchestration,explorerMoves,expectedMoveResolution]);
  const liveCoachState=useMemo(()=>{
    if(trainerPhase==="ready_for_user"&&isUserTurn&&instructionTarget){
      const evidence=buildPositionEvidence({
        frameId:String(trainerFrameId),
        trainerFrameId:String(trainerFrameId),
        fen,
        boardFen:fen,
        moveHistorySan:moveHistory,
        bookStatus:bookComplete?"book_complete":trainingMode==="continuation"?"out_of_book":"in_book",
        focusMove:instructionTarget?{uci:instructionTarget.uci}:null,
      });
      const candidates=profileCandidateMoves(evidence);
      const opportunities=rankPedagogicalOpportunities(evidence,candidates);
      const selected=selectBestLiveComment(opportunities);
      const recentInstructional=getRecentInstructionalCoachRecords(lastCoachRecordsRef.current,5);
      // Production requirement (Brain V2 spec 1.5): Brain must always run on teaching frames.
      // Only debug *rendering* / snapshot collection is gated by blundrDebugEnabled.
      const brainFrameKey = computeInstructionFrameKey({ fen, trainingMode, isUserTurn, trainerPhase, source: instructionTarget?.kind || trainingMode });
      const brainAnalysisForCoach = instructionTarget ? analyzeBlundrPosition({
        fen,
        currentInstructionFrame: currentInstructionFrame, // production shape
        frameKey: brainFrameKey,
        trainingMode: trainingMode === "restricted" ? "guided" : trainingMode,
        isUserTurn,
        debugEnabled: blundrDebugEnabled,
      } as any) : null; // temporary 'as any' during full type migration
      const coachPipeline=buildCoachExplanationPipeline({
        fenBefore:fen,
        target:instructionTarget,
        trainerMode:trainingMode,
        trainerPhase,
        isContinuation:trainingMode==="continuation",
        openingId:repertoire.id,
        lineId:selectedRuntimeLineId,
        activeLineName:repertoire.name,
        recentCoachBodies:recentInstructional.map((entry)=>entry.body),
        recentCoachThemes:recentInstructional.map((entry)=>String(entry.selectedOpportunityId??"")),
        brainAnalysis: brainAnalysisForCoach,
      });
      const silence=shouldLiveCoachStaySilent({
        evidence,
        selected,
        userRequestedHelp:coachInteraction==="hint"||coachInteraction==="why",
        repeatedConcept:false,
      });
      const text=silence.silent?"":coachPipeline.coachExplanation.body||pickLiveCoachCopy(selected?.opportunity??"silence",`${canonicalSelectedRepertoireId}:${normalizeFen(fen)}`);
      const lintedText=validateLiveCoachCopy(text).allowed&&!isDebugLeakText(text)?text:buildVerifiedUserFacingFallback(coachPipeline.moveFactPacket).body;
      const safeText=lintedText;
      const exactMoveAllowed=Boolean(selected?.exactMoveAllowed&&selected?.candidateMoveUci&&selected?.candidateMoveSan);
      const mode=exactMoveAllowed?"supported_continuation":"freeplay_principle";
      const selectedCandidate=candidates.find((candidate)=>candidate.moveUci===instructionTarget.uci)??null;
      const selectedTemplateId=coachPipeline.coachExplanation.selectedTheme?`live:${coachPipeline.coachExplanation.selectedTheme}:${coachPipeline.coachExplanation.selectedTheme==="capture_or_recapture"||coachPipeline.coachExplanation.selectedTheme==="checkmate"?"explain_tactic":coachPipeline.coachExplanation.selectedTheme==="central_pawn_advance"?"explain_center":"explain_development"}`:(selected?`live:${selected.opportunity}:${selected.intent}`:null);
      const normalizedLiveDebug=normalizeCoachDebugMetadata({
        ...buildLiveCoachDebug({evidence,candidates,selected,silenceReason:silence.reason}),
        coachCopySource:"live_coach",
        advancedFeatureClaimTypes:selectedCandidate?.featureSupport??[],
        recognizedPlanTypes:selected?[`opportunity:${selected.opportunity}`]:[],
        selectedOpportunityId:coachPipeline.coachExplanation.selectedTheme??selected?.opportunity??null,
        selectedOpportunityMoveUci:selected?.candidateMoveUci??instructionTarget.uci,
        selectedTemplateId:selectedTemplateId??undefined,
        templateCandidatesTop5:selected?[{id:selectedTemplateId??"live:none",score:selected.totalScore??0,intent:selected.intent,opportunity:selected.opportunity}]:[],
        blockedTemplatesTop10:[],
        whySelectedOpportunityWon:selected?.reason??null,
        featureClaimCount:selectedCandidate?.featureSupport?.length??0,
        blockedFeatureClaims:[],
        blockedPlans:[],
        opportunityCount:opportunities.length,
        renderableOpportunityCount:opportunities.filter((opportunity)=>opportunity.totalScore!==undefined).length,
        explanationRenderMs:0,
        coachDecisionSource:coachPipeline.coachExplanation.usedFallback?"verified_safe_fallback":"live_coach",
        selectedTheme:coachPipeline.coachExplanation.selectedTheme,
        selectedOpportunityLayer:coachPipeline.coachExplanation.selectedOpportunityLayer??null,
        selectedOpportunityScore:coachPipeline.coachExplanation.selectedOpportunityScore??coachPipeline.opportunityPacket.selected?.score??null,
        selectedPlanType:coachPipeline.coachExplanation.selectedPlanType??coachPipeline.planPacket.plans[0]?.planType??null,
        coachQuality:coachPipeline.coachQuality,
        moveFactPacket:coachPipeline.moveFactPacket,
        positionDeltaPacket:coachPipeline.positionDeltaPacket,
        featurePacket:{status:coachPipeline.featurePacket.status,...coachPipeline.featurePacket},
        planPacket:{status:coachPipeline.planPacket.status,plans:coachPipeline.planPacket.plans},
        opportunityPacket:{
          status:coachPipeline.opportunityPacket.opportunities.length?"ran":"ran_empty",
          opportunitiesTop5:coachPipeline.opportunityPacket.opportunities.slice(0,5),
          selectedOpportunity:coachPipeline.opportunityPacket.selected,
        },
        safetyResult:coachPipeline.safetyResult,
      });
      return{
        mode,
        title:coachPipeline.coachExplanation.title,
        text:safeText,
        evidence,
        candidates,
        opportunities,
        selected,
        coachPipeline,
        silent:silence.silent||!safeText,
        buttons:exactMoveAllowed?(["hint","show_plan","analyze_idea","show_move"] as CoachButton[]):(["hint","show_plan","analyze_idea"] as CoachButton[]),
        debug:normalizedLiveDebug,
      };
    }
    return null;
  },[bookComplete,trainingMode,trainerPhase,isUserTurn,trainerFrameId,fen,moveHistory,coachInteraction,selectedRepertoireId,instructionTarget,repertoire.id,repertoire.name]);
  const selectedContinuationCandidateForCoach=trainingMode==="continuation"&&currentSelectedCandidateUci?{uci:currentSelectedCandidateUci,san:currentSelectedCandidateSan??currentSelectedCandidateUci}:null;
  const rawCoachDecision=useMemo<any>(()=>{
    if(coachHiddenFrameId===String(trainerFrameId))return{...adaptiveCoachDecision,shouldShowCoachCard:false,suppressedReason:"hidden_for_frame"};
    if(trainingMode==="continuation"&&continuationRuntimeState.status==="terminal"){
      return {
        mode:"freeplay_principle",
        action:"show_plan",
        frameId:String(trainerFrameId),
        normalizedFen:normalizeFen(fen),
        title:"Line complete",
        body:continuationRuntimeState.reason==="checkmate"?"This line has reached checkmate. Restart the line or review the pattern.":"This position has no legal continuation. Restart the line or choose another branch.",
        buttons:["hide"],
        shouldShowCoachCard:true,
        shouldMarkReviewWorthy:true,
        exactMoveAllowed:false,
        revealRisk:"none" as const,
        givesAnswer:false,
        claimTypes:["terminal_position"],
        utteranceId:`${normalizeFen(fen)}:continuation_terminal`,
        utteranceFamily:"continuation_terminal",
        debug:{coachIntent:"continuation_terminal",continuationRuntimeStatus:"terminal",continuationTerminalReason:continuationRuntimeState.reason,coachMoveUci:null,coachPieceType:null,coachVerifiedFactsUsed:false,verifiedFallbackUsed:true,fallbackReason:"terminal_position"},
      };
    }
    if(trainingMode==="continuation"&&continuationRuntimeState.status==="opponent_replying"){
      return {
        mode:"freeplay_principle",
        action:"show_plan",
        frameId:String(trainerFrameId),
        normalizedFen:normalizeFen(fen),
        title:"Opponent reply",
        body:"The opponent is choosing a reply before Blundr can suggest your continuation.",
        buttons:["hide"],
        shouldShowCoachCard:true,
        shouldMarkReviewWorthy:false,
        exactMoveAllowed:false,
        revealRisk:"none" as const,
        givesAnswer:false,
        claimTypes:["transition_context"],
        utteranceId:`${normalizeFen(fen)}:continuation_opponent_replying`,
        utteranceFamily:"continuation_transition",
        debug:{coachIntent:"opponent_replying",continuationRuntimeStatus:"opponent_replying",coachMoveUci:null,coachPieceType:null,coachVerifiedFactsUsed:false,verifiedFallbackUsed:true,fallbackReason:"opponent_replying"},
      };
    }
    if(trainingMode==="continuation"&&isUserTurn&&continuationRuntimeState.status==="analyzing"){
      return {
        mode:"freeplay_principle",
        action:"show_plan",
        frameId:String(trainerFrameId),
        normalizedFen:normalizeFen(fen),
        title:"Analyzing continuation",
        body:"Blundr is analyzing the continuation candidate.",
        buttons:["analyze_idea"],
        shouldShowCoachCard:true,
        shouldMarkReviewWorthy:false,
        exactMoveAllowed:false,
        revealRisk:"none" as const,
        givesAnswer:false,
        claimTypes:["plan_principle"],
        debug:{coachIntent:"analyzing_continuation",coachMoveUci:null,coachPieceType:null,coachVerifiedFactsUsed:false,advancedFeatureClaimTypes:[],recognizedPlanTypes:[],selectedOpportunityId:undefined},
      };
    }
    if(
      trainingMode==="continuation"&&
      isUserTurn&&
      userExplicitlyEnteredContinuation&&
      !forceContinuationPause&&
      continuationAnalysisStatus!=="analyzing"&&
      continuationPolicyCandidate?.source==="no_reliable_continuation"
    ){
      return {
        mode:"freeplay_principle",
        action:"show_plan",
        frameId:String(trainerFrameId),
        normalizedFen:normalizeFen(fen),
        title:"Continuation unavailable",
        body:"This position does not have enough reliable continuation data to coach yet.",
        buttons:["hide"],
        shouldShowCoachCard:true,
        shouldMarkReviewWorthy:false,
        exactMoveAllowed:false,
        revealRisk:"none" as const,
        givesAnswer:false,
        claimTypes:["plan_principle"],
        debug:{coachIntent:"no_reliable_continuation",coachMoveUci:null,coachPieceType:null,coachVerifiedFactsUsed:false,verifiedFallbackUsed:true,fallbackReason:"no_reliable_continuation"},
      };
    }
    if(liveCoachState){
      return{
        mode:liveCoachState.mode as any,
        action:"show_plan" as const,
        frameId:String(trainerFrameId),
        normalizedFen:normalizeFen(fen),
        title:liveCoachState.title??(liveCoachState.mode==="supported_continuation"?"Suggested continuation":"Position context"),
        body:liveCoachState.text,
        buttons:liveCoachState.buttons,
        shouldShowCoachCard:!liveCoachState.silent,
        shouldMarkReviewWorthy:coachReviewMarked,
        exactMoveAllowed:Boolean(liveCoachState.selected?.exactMoveAllowed),
        revealRisk:"none" as const,
        givesAnswer:false,
        claimTypes:["plan_principle"],
        debug:{
          ...liveCoachState.debug,
          selectedIntent:liveCoachState.selected?.intent??(liveCoachState.selected?selectIntentForOpportunity(liveCoachState.selected.opportunity):undefined),
          coachMoveUci:instructionTarget?.uci??null,
          coachPieceType:instructionTarget?.pieceType??null,
          coachVerifiedFactsUsed:Boolean(instructionTarget),
          advancedFeaturePacketExists:Array.isArray((liveCoachState.debug as any)?.advancedFeatureClaimTypes),
          strategicPlanPacketExists:Array.isArray((liveCoachState.debug as any)?.recognizedPlanTypes),
          selectedOpportunityId:(liveCoachState.debug as any)?.selectedOpportunityId??liveCoachState.selected?.opportunity??undefined,
          selectedOpportunityMoveUci:(liveCoachState.debug as any)?.selectedOpportunityMoveUci??instructionTarget?.uci??null,
          selectedTemplateId:(liveCoachState.debug as any)?.selectedTemplateId,
          templateCandidatesTop5:(liveCoachState.debug as any)?.templateCandidatesTop5??[],
          blockedTemplatesTop10:(liveCoachState.debug as any)?.blockedTemplatesTop10??[],
          whySelectedOpportunityWon:(liveCoachState.debug as any)?.whySelectedOpportunityWon??null,
          opportunityCount:(liveCoachState.debug as any)?.opportunityCount??liveCoachState.opportunities?.length??0,
          renderableOpportunityCount:(liveCoachState.debug as any)?.renderableOpportunityCount??liveCoachState.opportunities?.length??0,
        },
      };
    }
    return adaptiveCoachDecision;
  },[adaptiveCoachDecision,liveCoachState,coachHiddenFrameId,trainerFrameId,coachReviewMarked,instructionTarget,trainingMode,trainerPhase,isUserTurn,continuationAnalysisStatus,continuationRuntimeState,fen,userExplicitlyEnteredContinuation,forceContinuationPause,continuationPolicyCandidate?.source]);
  const phaseActionGate=useMemo(()=>decideTrainerPhaseActionGate({
    trainerPhase,
    isUserTurn,
    trainingMode,
    expectedMoveSan:instructionTarget?.san??null,
    expectedMoveUci:instructionTarget?.uci??null,
    trustedContinuationCandidateAvailable:Boolean(selectedContinuationCandidateForCoach),
    coachShouldShow:Boolean(rawCoachDecision?.shouldShowCoachCard),
    coachButtons:(rawCoachDecision?.buttons??[]) as CoachButton[],
  }),[trainerPhase,isUserTurn,trainingMode,instructionTarget,rawCoachDecision,selectedContinuationCandidateForCoach]);
  const coachDecision=useMemo<any>(()=>{
    const coachDebugBase={coachMoveUci:instructionTarget?.uci??null,coachPieceType:instructionTarget?.pieceType??null,coachVerifiedFactsUsed:Boolean(instructionTarget)};
    const recentInstructional=getRecentInstructionalCoachRecords(lastCoachRecordsRef.current,5);
    const candidateCoachAllowed=trainingMode==="continuation"&&instructionTarget?.kind==="continuation_candidate"&&currentSelectedCandidateLegal;
    const transitionCoachAllowed=trainingMode==="continuation"&&["continuation_terminal","opponent_replying","analyzing_continuation"].includes(String(rawCoachDecision?.debug?.coachIntent??""));
    const rawIntent=rawCoachDecision?.debug?.coachIntent??rawCoachDecision?.debug?.selectedIntent;
    const missingDeepCoach=!(rawCoachDecision?.debug?.selectedTemplateId||rawCoachDecision?.debug?.mappingTemplateId)&&!rawCoachDecision?.debug?.selectedOpportunityId;
    const genericCandidateCoach=rawCoachDecision?.title==="Position context"||rawIntent==="silent"||missingDeepCoach;
    if(!phaseActionGate.shouldRenderCoach&&!transitionCoachAllowed){
      return {
        ...rawCoachDecision,
        shouldShowCoachCard:false,
        buttons:[],
        suppressedReason:phaseActionGate.blockedReason??rawCoachDecision?.suppressedReason,
        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate}),
      };
    }
    if(candidateCoachAllowed&&instructionTarget&&isEngineBestContinuationSource(instructionTarget.source)){
      const engineCopy=buildEngineBestContinuationCopy(instructionTarget);
      return{
        ...rawCoachDecision,
        mode:"supported_continuation",
        action:"show_plan",
        title:engineCopy.title,
        body:engineCopy.body,
        buttons:phaseActionGate.filteredButtons.length?phaseActionGate.filteredButtons:["show_plan","analyze_idea","show_move","hide"],
        shouldShowCoachCard:true,
        exactMoveAllowed:true,
        givesAnswer:false,
        revealRisk:"low",
        utteranceId:`${normalizeFen(fen)}:engine_best_fallback:${currentSelectedCandidateUci}`,
        utteranceFamily:"candidate_fallback",
        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate,coachIntent:"show_continued_plan",coachDecisionSource:"verified_safe_fallback",candidateCoachFallbackUsed:true,candidateCoachFallbackReason:"engine_best_move_fallback",selectedCandidateSource:"engine_best",verifiedFallbackUsed:true,fallbackReason:"engine_best_move_fallback"}),
      };
    }
    if(candidateCoachAllowed&&genericCandidateCoach){
      const safeFallback=instructionTarget?buildUserFacingTargetFallback({
        fen,
        target:instructionTarget,
        trainingMode,
        trainerPhase,
        openingId:repertoire.id,
        lineId:selectedRuntimeLineId,
        activeLineName:repertoire.name,
        recentCoachBodies:recentInstructional.map((entry)=>entry.body),
        recentCoachThemes:recentInstructional.map((entry)=>String(entry.selectedOpportunityId??"")),
      }):null;
      return {
        ...rawCoachDecision,
        mode:"supported_continuation",
        action:"show_plan",
        title:safeFallback?.title??"Suggested continuation",
        body:safeFallback?.body??"A verified continuation is available.",
        buttons:phaseActionGate.filteredButtons.length?phaseActionGate.filteredButtons:["show_plan","analyze_idea","show_move","hide"],
        shouldShowCoachCard:true,
        exactMoveAllowed:true,
        givesAnswer:false,
        revealRisk:"low",
        utteranceId:`${normalizeFen(fen)}:candidate_fallback:${currentSelectedCandidateUci}`,
        utteranceFamily:"candidate_fallback",
        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate,coachIntent:"show_continued_plan",candidateCoachFallbackUsed:true,candidateCoachFallbackReason:"missing_template_or_silent_generic_candidate",coachSelectedCandidateMove:currentSelectedCandidateUci,coachDecisionSource:"verified_safe_fallback",selectedTheme:safeFallback?.theme,coachQuality:safeFallback?.quality,fallbackReason:safeFallback?.reason??"candidate_safe_fallback"}),
      };
    }
    if(rawIntent==="silent"){
      return {
        ...rawCoachDecision,
        shouldShowCoachCard:false,
        buttons:[],
        suppressedReason:"silent_intent",
        debug:normalizeCoachDebugMetadata({...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate,coachRenderedDespiteSilentIntent:false}),
      };
    }
    let out={
      ...rawCoachDecision,
      buttons:phaseActionGate.filteredButtons,
      debug:{...(rawCoachDecision?.debug??{}),...coachDebugBase,phaseActionGate},
    };
    const body=String(out.body??"").trim();
    const normalizedBody=normalizeCoachBody(body);
    const recent=lastCoachRecordsRef.current.slice(-5);
    const sameNormalizedCount=recent.filter((record)=>record.normalizedBody===normalizedBody).length;
    const sameFamilyCount=recent.filter((record)=>record.utteranceFamily&&record.utteranceFamily===out.utteranceFamily).length;
    const repeatedGenericPattern=sameNormalizedCount>=2||sameFamilyCount>=2;
    if(repeatedGenericPattern&&instructionTarget){
      const safeFallback=buildUserFacingTargetFallback({
        fen,
        target:instructionTarget,
        trainingMode,
        trainerPhase,
        openingId:repertoire.id,
        lineId:selectedRuntimeLineId,
        activeLineName:repertoire.name,
        recentCoachBodies:recentInstructional.map((entry)=>entry.body),
        recentCoachThemes:recentInstructional.map((entry)=>String(entry.selectedOpportunityId??"")),
      });
      out={
        ...out,
        title:safeFallback.title,
        body:safeFallback.body,
        debug:{
          ...(out.debug??{}),
          repetitionGuardApplied:true,
          repetitionGuardReason:sameNormalizedCount>=2?"same_normalized_body_3_in_5":"same_family_3_in_5",
          repeatedGenericCoachCopyDetected:true,
          verifiedFallbackUsed:true,
          fallbackReason:"repetition_guard",
          coachDecisionSource:"verified_safe_fallback",
          selectedTheme:safeFallback.theme,
          coachQuality:safeFallback.quality,
        },
      };
    }
    const featureClaims=Array.isArray((out.debug as any)?.advancedFeatureClaimTypes)?(out.debug as any).advancedFeatureClaimTypes:[];
    const planClaims=Array.isArray((out.debug as any)?.recognizedPlanTypes)?(out.debug as any).recognizedPlanTypes:[];
    const bodyForValidation=String(out.body??"").trim();
    const claimValidation=detectUnverifiedCoachClaims({
      body:bodyForValidation,
      target:instructionTarget?{
        pieceType:instructionTarget.pieceType,
        isDevelopment:instructionTarget.isDevelopment,
        isDiagonalMove:instructionTarget.isDiagonalMove,
        isCapture:instructionTarget.isCapture,
        isCheck:instructionTarget.isCheck,
        isMate:instructionTarget.isMate,
        isPromotion:instructionTarget.isPromotion,
        isKingSafetyMove:instructionTarget.isKingSafetyMove,
        isCentralPawnAdvance:instructionTarget.isCentralPawnAdvance,
      }:null,
      featureClaims,
      planClaims,
    });
    if(instructionTarget&&claimValidation.unverifiedClaims.length){
      const safeFallback=buildUserFacingTargetFallback({
        fen,
        target:instructionTarget,
        trainingMode,
        trainerPhase,
        openingId:repertoire.id,
        lineId:selectedRuntimeLineId,
        activeLineName:repertoire.name,
        recentCoachBodies:recentInstructional.map((entry)=>entry.body),
        recentCoachThemes:recentInstructional.map((entry)=>String(entry.selectedOpportunityId??"")),
      });
      out={
        ...out,
        title:out.title==="Analyzing continuation"?out.title:safeFallback.title,
        body:safeFallback.body,
        debug:{
          ...(out.debug??{}),
          verifiedFallbackUsed:true,
          fallbackReason:"claim_validation_failed",
          unverifiedClaims:[],
          originalUnverifiedClaims:claimValidation.unverifiedClaims,
          verifiedClaims:claimValidation.verifiedClaims,
          coachDecisionSource:"verified_safe_fallback",
          selectedTheme:safeFallback.theme,
          coachQuality:safeFallback.quality,
        },
      };
    }else{
      out={
        ...out,
        debug:{
          ...(out.debug??{}),
          verifiedClaims:claimValidation.verifiedClaims,
          unverifiedClaims:claimValidation.unverifiedClaims,
        },
      };
    }
    return {...out,debug:normalizeCoachDebugMetadata(out.debug??{})};
  },[rawCoachDecision,phaseActionGate,trainingMode,currentSelectedCandidateUci,currentSelectedCandidateLegal,instructionTarget,fen,trainerPhase,repertoire.id,repertoire.name,selectedRepertoireId]);
  const coachHiddenForFrame=coachHiddenFrameId===String(trainerFrameId);
  const coachSurfacePolicy=useMemo(()=>decideCoachSurfacePolicy({
    coachShouldShow:Boolean(coachDecision?.shouldShowCoachCard),
    coachSuppressedReason:coachDecision?.suppressedReason,
    coachHiddenForFrame,
    trainingMode,
    viewMode:trainingMode==="continuation"?"freeplay":(trainerView==="assisted"?"assisted":"plain"),
    hasExpectedMove:expectedUserOptions.length>0,
    exactMoveAllowed:Boolean(coachDecision?.exactMoveAllowed),
    moveQualityGateStatus:moveQuality?.status,
    engineValidationStatus:(coachDecision?.debug as any)?.coachEngineStatus??(enginePreview?.pvs?.length?"ready":"idle"),
    visualRecipeValid:Boolean(visualRecipe&&visualRecipeOverlay.adapterAllowed&&trainerPhase==="ready_for_user"&&isUserTurn),
  }),[coachDecision,coachHiddenForFrame,trainingMode,trainerView,expectedUserOptions.length,moveQuality?.status,enginePreview,visualRecipe,visualRecipeOverlay.adapterAllowed,trainerPhase,isUserTurn]);
  // branch transition surface supports both end-of-book and continuation pause checkpoints.
  const branchTransitionSurface=useMemo(()=>{
    if(game.isGameOver()||game.moves().length===0)return null;
    if (trainingMode === "restricted" && isUserTurn && trustedInstructionTargetExists) {
      return null;
    }
    const transitionTitle = "Line complete";
    const transitionBody = "You finished this training line. Continue from this position or train the line again.";
    const transitionButtons = ["continue_from_here","restart_line"] as const;
    if (stage2TerminalProof.proven && branchCompleteContract.branchCompleteEligible) {
      return {
        render: true,
        title: transitionTitle,
        body: transitionBody,
        buttons: transitionButtons,
        reason: stage2TerminalProof.reason ?? "terminal_proof",
      } as const;
    }
    if (isUserTurn&&forceContinuationPause&&!userExplicitlyEnteredContinuation) {
      const reason = continuationPauseDecision.pauseReason==="move_11_hard_stop"?"hard_stop_backup":(continuationPauseDecision.pauseReason ?? "line_complete");
      return {
        render: true,
        title: transitionTitle,
        body: transitionBody,
        buttons: transitionButtons,
        reason,
      } as const;
    }
    if (trainingMode==="continuation"&&isUserTurn&&!forceContinuationPause&&!userExplicitlyEnteredContinuation) {
      return {
        render: true,
        title: transitionTitle,
        body: transitionBody,
        buttons: transitionButtons,
        reason: "continuation_break_requires_explicit_continue",
      } as const;
    }
    if (!hardEndOfBookGate) {
      return null;
    }
    return {
      render: true,
      title: transitionTitle,
      body: transitionBody,
      buttons: transitionButtons,
      reason: stage2TerminalProof.reason ?? "terminal_proof",
    } as const;
  }, [hardEndOfBookGate, stage2TerminalProof.proven, stage2TerminalProof.reason, branchCompleteContract.branchCompleteEligible, trainingMode, isUserTurn, forceContinuationPause, continuationPauseDecision.pauseReason, userExplicitlyEnteredContinuation, game, trustedInstructionTargetExists]);
  const moveImpactPresentation=useMemo(()=>presentMoveImpact({
    exactMoveAllowed:Boolean(coachDecision?.exactMoveAllowed),
    engineStatus:(coachDecision?.debug as any)?.coachEngineStatus??(enginePreview?.pvs?.length?"ready":"idle"),
    isSafeMove:Boolean((coachDecision?.debug as any)?.coachEngineSafeMoves?.length),
    isPlayableMove:Boolean((coachDecision?.debug as any)?.coachSelectedCandidateMove),
    isStudyLineMove:Boolean(teachingOrchestration?.moveTrust==="book_supported"||teachingOrchestration?.moveTrust==="repertoire_supported"),
    reviewWorthy:Boolean(coachDecision?.shouldMarkReviewWorthy),
  }),[coachDecision,enginePreview,teachingOrchestration]);
  const continuationCandidateVisual=useMemo(()=>buildContinuationCandidateVisual({
    boardFen:fen,
    candidateUci:trainingMode==="continuation"&&instructionTarget?.kind==="continuation_candidate"?instructionTarget.uci:null,
    candidateSan:trainingMode==="continuation"&&instructionTarget?.kind==="continuation_candidate"?instructionTarget.san:null,
  }),[fen,trainingMode,instructionTarget]);

  // v2.7.40 Agent 5: early brain analysis passed to TrainerPresentationFrame so coach copy comes from BlundrBrain (target->brain->pres->surface chain)
  // (duplicate lightweight call is acceptable for this checkpoint; brain is pure sync facade)
  const brainAnalysisForPresentation = (instructionTarget && currentInstructionFrame) ? analyzeBlundrPosition({
    fen,
    currentInstructionFrame: currentInstructionFrame,
    frameKey: computeInstructionFrameKey({ fen, trainingMode, isUserTurn, trainerPhase, source: instructionTarget?.kind || trainingMode }),
    trainingMode: trainingMode === "restricted" ? "guided" : trainingMode,
    isUserTurn,
    debugEnabled: blundrDebugEnabled,
  } as any) : null;

  const presentationFrame=useMemo(()=>computeTrainerPresentationFrame({
    frameId:trainerFrameId,
    fen,
    activeBoard,
    trainerView,
    trainerPhase,
    trainingMode,
    isUserTurn,
    answerShown:showAnswer || (trainerView === "plain" && showMoreShown),
    visualRecipeId:visualRecipeForRender?.visualRecipeId,
    visualRecipeLines:visualRecipeMainLines,
    continuationCandidateLines:continuationCandidateVisual.lines,
    safeMoveArrowLines:safeMoveArrowVisual.lines,
    legacyLines:legacyVisualLines,
    activePrimitiveIds:visualRecipePlayback.activePrimitiveIds,
    recipeFrameMatchesBoard:visualRecipeOverlay.recipeFrameMatchesBoard,
    recipeFenMatchesBoard:visualRecipeOverlay.recipeFenMatchesBoard,
    adapterAllowed:visualRecipeOverlay.adapterAllowed,
    overlayFrameId,
    playbackReady:visualRecipePlayback.animationState==="playing"||visualRecipePlayback.animationState==="held_end_state"||visualRecipePlayback.animationState==="skipped_to_end",
    coachShouldShow:Boolean(coachDecision?.shouldShowCoachCard),
    coachHiddenForFrame,
    coachIntent:(coachDecision?.debug as any)?.coachIntent,
    coachTitle:coachDecision?.title,
    coachBody:coachDecision?.body,
    coachButtons:coachDecision?.buttons,
    coachSuppressedReason:coachDecision?.suppressedReason,
    coachUtteranceFamily:coachDecision?.utteranceFamily,
    coachTemplateId:(coachDecision?.debug as any)?.selectedTemplateId,
    coachSelectedTheme:(coachDecision?.debug as any)?.selectedTheme??null,
    coachQuality:(coachDecision?.debug as any)?.coachQuality??null,
    moveFactPacket:(coachDecision?.debug as any)?.moveFactPacket??null,
    positionDeltaPacket:(coachDecision?.debug as any)?.positionDeltaPacket??null,
    featurePacket:(coachDecision?.debug as any)?.featurePacket??null,
    planPacket:(coachDecision?.debug as any)?.planPacket??null,
    opportunityPacket:(coachDecision?.debug as any)?.opportunityPacket??null,
    safetyResult:(coachDecision?.debug as any)?.safetyResult??null,
    branchTransitionSurface:Boolean(branchTransitionSurface?.render),
    branchTransitionTitle:branchTransitionSurface?.title,
    branchTransitionBody:branchTransitionSurface?.body,
    branchTransitionButtons:branchTransitionSurface?.buttons as any,
    coachSurfacePolicy,
    // Agent 5: brain for canonical coach copy (quarantines legacy liveCoach/coachDecision text from pres coach on teaching frames)
    brainAnalysis: brainAnalysisForPresentation as any,
  }),[trainerFrameId,fen,activeBoard,trainerView,trainerPhase,trainingMode,isUserTurn,visualRecipeForRender,visualRecipeMainLines,safeMoveArrowVisual.lines,continuationCandidateVisual.lines,legacyVisualLines,visualRecipePlayback.activePrimitiveIds,visualRecipePlayback.animationState,visualRecipeOverlay,overlayFrameId,coachDecision,coachHiddenForFrame,coachSurfacePolicy,branchTransitionSurface,brainAnalysisForPresentation,showMoreShown]);
  const displayedCoachDecision=useMemo(()=>{
    const normalizedCurrentFen=normalizeFen(fen);
    const decisionFrameId=String((coachDecision as any)?.frameId??"");
    const decisionFen=String((coachDecision as any)?.normalizedFen??"");
    const staleCoachFrame=Boolean((coachDecision as any)?.shouldShowCoachCard&&(decisionFrameId&&decisionFrameId!==String(trainerFrameId)||decisionFen&&decisionFen!==normalizedCurrentFen));
    if(staleCoachFrame){
      return{
        ...coachDecision,
        shouldShowCoachCard:false,
        suppressedReason:"stale_coach_frame",
        debug:{
          ...(coachDecision?.debug??{}),
          staleCoachFrame:true,
          currentFrameKey:frameKey,
        },
      };
    }
    if(presentationFrame.coach.owner!=="branch_transition_surface")return coachDecision;
    return {
      ...coachDecision,
      shouldShowCoachCard:true,
      title:presentationFrame.coach.title??"Line complete",
      body:presentationFrame.coach.body??"You finished this training line. Continue from this position or train the line again.",
      buttons:(presentationFrame.coach.buttons as CoachButton[])??(["continue_from_here","restart_line"] as CoachButton[]),
      mode:"supported_continuation" as const,
      action:"show_plan" as const,
      revealRisk:"none" as const,
      givesAnswer:false,
      suppressedReason:undefined,
      debug:{
        ...(coachDecision?.debug??{}),
        coachIntent:"branch_transition",
        branchTransitionSurfaceRendered:true,
        branchTransitionPayloadValid:true,
        currentFrameKey:frameKey,
      },
    };
  },[presentationFrame.coach.owner,presentationFrame.coach.title,presentationFrame.coach.body,coachDecision,fen,trainerFrameId,frameKey]);
  const coachFrameStale=Boolean((displayedCoachDecision?.debug as any)?.staleCoachFrame);
  const visualFrameStale=Boolean(trainerPhase==="ready_for_user"&&presentationFrame.visual.shouldRender&&overlayFrameId!==trainerFrameId);
  const revealTargetStale=Boolean((lastActionDebug as any)?.revealTargetUci&&instructionTarget?.uci&&(lastActionDebug as any)?.revealTargetUci!==instructionTarget.uci);
  const displayedCoachButtons=displayedCoachDecision?.buttons??[];
  useEffect(()=>{
    if(!displayedCoachDecision?.shouldShowCoachCard)return;
    if(!displayedCoachDecision?.utteranceId)return;
    if(typeof window==="undefined")return;
    const frameId=(displayedCoachDecision as any)?.frameId??coachContextResult.context?.frameId??String(trainerFrameId);
    const normalizedDecisionFen=(displayedCoachDecision as any)?.normalizedFen??coachContextResult.context?.normalizedFen??normalizeFen(fen);
    const viewMode=coachContextResult.context?.viewMode??(trainerView==="assisted"?"assisted":"plain");
    const recordKey=buildCoachUtteranceRecordKey({
      frameId,
      normalizedFen:normalizedDecisionFen,
      viewMode,
      coachMode:displayedCoachDecision.mode,
      coachAction:displayedCoachDecision.action,
      utteranceId:displayedCoachDecision.utteranceId,
    });
    if(lastRecordedCoachUtteranceKeyRef.current===recordKey)return;
    lastRecordedCoachUtteranceKeyRef.current=recordKey;
    const entry={
      patternId:coachContextResult.context?.patternId??normalizedDecisionFen,
      conceptId:coachContextResult.context?.conceptId??"center_tension",
      visualRecipeId:coachContextResult.context?.visualRecipeId??"",
      coachMode:displayedCoachDecision.mode,
      coachAction:displayedCoachDecision.action,
      utteranceId:displayedCoachDecision.utteranceId,
      utteranceFamily:displayedCoachDecision.utteranceFamily??"",
      text:displayedCoachDecision.body??displayedCoachDecision.hint??displayedCoachDecision.answer??"",
      shownAt:Date.now(),
    } as any;
    const next=recordCoachUtterance(entry,window.localStorage);
    coachUtteranceMemoryRef.current=next;
    const bodyText=String(displayedCoachDecision.body??displayedCoachDecision.hint??displayedCoachDecision.answer??"");
    const blockedUnsafeTemplateIds=(displayedCoachDecision.debug as any)?.mappingBlockedReasons??[];
    const record:LastCoachRecord={
      frameId:Number(trainerFrameId),
      fen4:normalizeFen(fen),
      trainerPhase,
      trainingMode,
      instructionTargetKind:instructionTarget?.kind??null,
      instructionTargetUci:instructionTarget?.uci??null,
      instructionTargetSan:instructionTarget?.san??null,
      instructionTargetPieceType:instructionTarget?.pieceType??null,
      coachMoveUci:(displayedCoachDecision.debug as any)?.coachMoveUci??instructionTarget?.uci??null,
      coachPieceType:(displayedCoachDecision.debug as any)?.coachPieceType??instructionTarget?.pieceType??null,
      visualMoveUci:presentationFrame.visual.shouldRender&&Array.isArray(presentationFrame.visual.lines)&&presentationFrame.visual.lines[0]?(String((presentationFrame.visual.lines[0] as any).from)+String((presentationFrame.visual.lines[0] as any).to)):null,
      revealTargetUci:(lastActionDebug as any)?.revealTargetUci??instructionTarget?.uci??null,
      selectedTemplateId:(displayedCoachDecision.debug as any)?.selectedTemplateId??null,
      utteranceFamily:displayedCoachDecision.utteranceFamily??null,
      selectedOpportunityId:(displayedCoachDecision.debug as any)?.selectedOpportunityId??null,
      selectedPlanId:(displayedCoachDecision.debug as any)?.selectedPlanId??null,
      body:bodyText,
      normalizedBody:normalizeCoachBody(bodyText),
      verifiedClaims:(displayedCoachDecision.debug as any)?.verifiedClaims??[],
      unverifiedClaims:(displayedCoachDecision.debug as any)?.unverifiedClaims??[],
      blockedUnsafeTemplateIds:Array.isArray(blockedUnsafeTemplateIds)?blockedUnsafeTemplateIds:[],
    };
    const isInstructionalRecord=trainerPhase==="ready_for_user"&&isUserTurn&&Boolean(instructionTarget?.uci);
    if(isInstructionalRecord)setLastCoachRecords((prev)=>[...prev.slice(-19),record]);
  },[
    displayedCoachDecision?.shouldShowCoachCard,
    displayedCoachDecision?.utteranceId,
    displayedCoachDecision?.mode,
    displayedCoachDecision?.action,
    trainerFrameId,
    fen,
    trainerView,
    coachContextResult.context?.frameId,
    coachContextResult.context?.viewMode,
    coachContextResult.context?.patternId,
    coachContextResult.context?.conceptId,
    coachContextResult.context?.visualRecipeId,
    displayedCoachDecision?.utteranceFamily,
    displayedCoachDecision?.body,
    displayedCoachDecision?.hint,
    displayedCoachDecision?.answer,
    trainerPhase,
    isUserTurn,
    trainingMode,
    instructionTarget,
    presentationFrame.visual.shouldRender,
    presentationFrame.visual.lines,
    lastActionDebug,
  ]);
  useEffect(()=>{
    const visibleTitle=presentationFrame.coach.shouldRender?String(presentationFrame.coach.title??"").trim():(displayedCoachDecision?.shouldShowCoachCard?String(displayedCoachDecision?.title??"").trim():"");
    const visibleBody=presentationFrame.coach.shouldRender?String(presentationFrame.coach.body??"").trim():(displayedCoachDecision?.shouldShowCoachCard?String(displayedCoachDecision?.body??"").trim():"");
    const visibleButtons=(presentationFrame.coach.shouldRender?presentationFrame.coach.buttons:displayedCoachDecision?.buttons)??[];
    const instructionTargetUci=instructionTarget?.uci??null;
    const entryKind=normalizeCoachEntryKind({trainerPhase,isUserTurn,instructionTargetUci,runtimeCriticalIssues});
    const shouldLog=Boolean(visibleTitle||visibleBody||visibleButtons.length||["opponent_status","terminal","line_complete","error"].includes(entryKind));
    if(!shouldLog)return;
    const baseQuality=(displayedCoachDecision?.debug as any)?.coachQuality??{};
    const renderedCoachQualityAtFrame=computeRenderedCoachQuality({
      renderedTitle: visibleTitle || null,
      renderedBody: visibleBody || null,
      pipelineTitle: displayedCoachDecision?.shouldShowCoachCard ? String(displayedCoachDecision?.title ?? "").trim() : null,
      pipelineBody: displayedCoachDecision?.shouldShowCoachCard ? String(displayedCoachDecision?.body ?? "").trim() : null,
      pipelineSource: String((displayedCoachDecision?.debug as any)?.coachDecisionSource ?? baseQuality?.source ?? "").trim() || null,
      pipelineQualityScore: Number.isFinite(Number(baseQuality?.qualityScore)) ? Number(baseQuality.qualityScore) : null,
      moveSan: instructionTarget?.san ?? null,
      moveUci: instructionTargetUci,
      runtimeSafeFallbackUsed: Boolean((displayedCoachDecision?.debug as any)?.verifiedFallbackUsed ?? baseQuality?.usedFallback),
      runtimeSafeFallbackReason: String((displayedCoachDecision?.debug as any)?.fallbackReason ?? baseQuality?.fallbackReason ?? "").trim() || null,
      recentRenderedBodies: coachTimeline.slice(-8).map((entry:any)=>String(entry?.visibleBody ?? "")),
    });
    const normalizedDebug=normalizeCoachDebugMetadata({
      ...((displayedCoachDecision?.debug as any)??{}),
      coachQuality: {
        ...baseQuality,
        ...renderedCoachQualityAtFrame,
        targetAligned: baseQuality?.targetAligned,
        pieceAligned: baseQuality?.pieceAligned,
        selectedTheme: baseQuality?.selectedTheme ?? (displayedCoachDecision?.debug as any)?.selectedTheme ?? null,
        evidenceTags: Array.isArray(baseQuality?.evidenceTags) ? baseQuality.evidenceTags : [],
      },
    });
    const runtimeCriticalIssuesKey=runtimeCriticalIssues.join("|");
    const visibleButtonsKey=visibleButtons.map(String).join("|");
    const coachTimelineEntryKey=[
      String(trainerFrameId),
      normalizeFen(fen),
      trainerPhase,
      trainingMode,
      isUserTurn?"1":"0",
      entryKind,
      instructionTargetUci??"none",
      instructionTarget?.san??"none",
      instructionTarget?.pieceType??"none",
      visibleTitle||"none",
      visibleBody||"none",
      visibleButtonsKey||"none",
      normalizedDebug.coachDecisionSource??"none",
      normalizedDebug.selectedTheme??"none",
      normalizedDebug.selectedOpportunityId??"none",
      normalizedDebug.selectedOpportunityLayer??"none",
      String(normalizedDebug.selectedOpportunityScore??"none"),
      normalizedDebug.selectedTemplateId??"none",
      normalizedDebug.verifiedFallbackUsed?"1":"0",
      normalizedDebug.fallbackReason??"none",
      String(normalizedDebug.coachQuality?.qualityScore??"none"),
      normalizedDebug.coachQuality?.targetAligned?"1":"0",
      normalizedDebug.coachQuality?.pieceAligned?"1":"0",
      runtimeCriticalIssuesKey||"none",
    ].join("||");
    if(coachTimelineEntryKey===lastCoachTimelineEntryKeyRef.current)return;
    lastCoachTimelineEntryKeyRef.current=coachTimelineEntryKey;
    const nextEntry:CoachSessionLogEntry={
      id:++coachTimelineSeqRef.current,
      ts:Date.now(),
      trainerFrameId:Number(trainerFrameId),
      fen4:normalizeFen(fen),
      trainerPhase,
      trainingMode,
      isUserTurn,
      entryKind,
      instructionTargetUci,
      instructionTargetSan:instructionTarget?.san??null,
      instructionTargetPieceType:instructionTarget?.pieceType??null,
      visibleTitle:visibleTitle||null,
      visibleBody:visibleBody||null,
      visibleButtons:visibleButtons.map(String),
      coachDecisionSource:normalizedDebug.coachDecisionSource??null,
      selectedTheme:normalizedDebug.selectedTheme??null,
      selectedOpportunityId:normalizedDebug.selectedOpportunityId??null,
      selectedOpportunityLayer:normalizedDebug.selectedOpportunityLayer??null,
      selectedOpportunityScore:typeof normalizedDebug.selectedOpportunityScore==="number"?normalizedDebug.selectedOpportunityScore:null,
      selectedTemplateId:normalizedDebug.selectedTemplateId??null,
      runtimeSafeFallbackUsed:Boolean(normalizedDebug.verifiedFallbackUsed),
      runtimeSafeFallbackReason:normalizedDebug.fallbackReason??null,
      containsDebugLeak:Boolean(normalizedDebug.coachQuality?.containsDebugLeak||isDebugLeakText(visibleBody||"")),
      qualityScore:typeof normalizedDebug.coachQuality?.qualityScore==="number"?normalizedDebug.coachQuality.qualityScore:null,
      hasPedagogicalReason:Boolean(normalizedDebug.coachQuality?.hasPedagogicalReason),
      repeatedGeneric:Boolean(normalizedDebug.coachQuality?.repeatedGeneric),
      targetAligned:instructionTargetUci?Boolean(normalizedDebug.coachQuality?.targetAligned):"not_applicable",
      pieceAligned:instructionTarget?.pieceType?Boolean(normalizedDebug.coachQuality?.pieceAligned):"not_applicable",
      criticalIssuesAtFrame:runtimeCriticalIssues.slice(),
      warningsAtFrame:[],
    };
    setCoachTimeline((prev)=>{
      const last=prev[prev.length-1];
      if(last&&last.trainerFrameId===nextEntry.trainerFrameId&&last.visibleTitle===nextEntry.visibleTitle&&last.visibleBody===nextEntry.visibleBody)return prev;
      return [...prev.slice(-99),nextEntry];
    });
  },[
    trainerFrameId,
    fen,
    trainerPhase,
    trainingMode,
    isUserTurn,
    instructionTarget?.uci,
    instructionTarget?.san,
    instructionTarget?.pieceType,
    presentationFrame.coach.shouldRender,
    presentationFrame.coach.title,
    presentationFrame.coach.body,
    (presentationFrame.coach.buttons??[]).map(String).join("|"),
    displayedCoachDecision?.shouldShowCoachCard,
    displayedCoachDecision?.title,
    displayedCoachDecision?.body,
    (displayedCoachDecision?.buttons??[]).map(String).join("|"),
    (displayedCoachDecision?.debug as any)?.coachDecisionSource,
    (displayedCoachDecision?.debug as any)?.selectedTheme,
    (displayedCoachDecision?.debug as any)?.selectedOpportunityId,
    (displayedCoachDecision?.debug as any)?.selectedOpportunityLayer,
    (displayedCoachDecision?.debug as any)?.selectedOpportunityScore,
    (displayedCoachDecision?.debug as any)?.selectedTemplateId,
    (displayedCoachDecision?.debug as any)?.verifiedFallbackUsed,
    (displayedCoachDecision?.debug as any)?.fallbackReason,
    coachTimeline.map((entry)=>String((entry as any)?.visibleBody ?? "")).join("|"),
    runtimeCriticalIssues.join("|"),
  ]);
  function currentDebugActionState(){
    return {
      answerShown:showAnswer,
      hintShown:coachHintRequestCount>0,
      coachInteraction,
      showAnswer,
      selectedCandidate:currentSelectedCandidateUci,
      enginePreviewExists:Boolean(enginePreview),
    };
  }
  function recordDebugAction(input:{action:string;normalizedAction:string;before:Record<string,unknown>;after:Record<string,unknown>;result:"handled"|"ignored"|"no_op"|"blocked"|"error";reason?:string;extra?:Record<string,unknown>}){
    if(!blundrDebugEnabled)return;
    const stateChanged=JSON.stringify(input.before)!==JSON.stringify(input.after);
    // v2.7.40 stabilization: prefer VisibleTeachingSurface.actions (single source) for rendered button reporting in debug.
    // This eliminates the "renderedButtonActions: ['hint'] vs lastClicked show_more" desync in diagnostics.
    const renderedFromSurface = (visibleTeachingSurface?.coach?.shouldRender ? (visibleTeachingSurface.actions as any) : null);
    const effectiveRenderedButtons = renderedFromSurface || displayedCoachButtons;
    const details={
      lastButtonRendered:effectiveRenderedButtons[0]??null,
      renderedButtonActions:effectiveRenderedButtons,
      lastClickedAction:input.action,
      lastClickedAt:Date.now(),
      actionHandlerEntered:true,
      actionHandlerName:"handleCoachAction",
      normalizedAction:input.normalizedAction,
      actionAliasApplied:input.action!==input.normalizedAction,
      actionBeforeState:input.before,
      actionAfterState:input.after,
      actionResult:input.result,
      actionBlockedReason:input.reason??null,
      revealExpectedMoveTriggered:input.normalizedAction==="answer"||input.normalizedAction==="reveal_next_move",
      revealCandidateTriggered:input.normalizedAction==="show_move",
      candidateAnalysisTriggered:input.normalizedAction==="analyze_idea",
      stateChanged,
      frameId:Number(trainerFrameId),
      revealTargetUci:input.extra?.revealTargetUci??(input.normalizedAction.includes("reveal")||input.normalizedAction==="answer"?instructionTarget?.uci??null:null),
      revealTargetSource:input.extra?.revealTargetSource??(instructionTarget?"instruction_target":"none"),
      revealIdempotentNoop:Boolean(input.extra?.revealIdempotentNoop),
      revealBlockedBecauseCoachHidden:Boolean(input.extra?.revealBlockedBecauseCoachHidden),
      ...input.extra,
    };
    setLastActionDebug(details);
    setDebugEventLog((events)=>appendDebugEvent(events,{type:"coach_action_clicked",action:input.action,normalizedAction:input.normalizedAction,before:input.before,after:input.after,result:input.result,reason:input.reason,details}));
    setActionTimeline((prev)=>{
      const renderedActionIds = effectiveRenderedButtons.map((value:any)=>String(value));
      const actionEntryKey = [
        String(trainerFrameId),
        renderedActionIds.join("|") || "none",
        String(input.normalizedAction),
        String(input.result),
        String(input.reason ?? "none"),
        String((input.after as any)?.coachInteraction ?? coachInteraction ?? "none"),
        Boolean((input.after as any)?.answerShown ?? showAnswer) ? "1" : "0",
        Boolean((input.after as any)?.hintShown ?? (coachHintRequestCount > 0)) ? "1" : "0",
        String(instructionTarget?.uci ?? "none"),
        stateChanged ? "1" : "0",
      ].join("||");
      if(actionEntryKey===lastActionTimelineEntryKeyRef.current)return prev;
      lastActionTimelineEntryKeyRef.current=actionEntryKey;
      const next = {
        id: ++actionTimelineSeqRef.current,
        ts: Date.now(),
        frameId: Number(trainerFrameId),
        renderedActionIds,
        clickedActionId: String(input.normalizedAction),
        clickedActionPayload: input.extra ?? null,
        resultingTrainerPhase: trainerPhase,
        resultingCoachInteraction: (input.after as any)?.coachInteraction ?? coachInteraction,
        resultingAnswerShown: Boolean((input.after as any)?.answerShown ?? showAnswer),
        resultingHintShown: Boolean((input.after as any)?.hintShown ?? (coachHintRequestCount > 0)),
        resultingTarget: instructionTarget?.uci ?? null,
        stateChanged,
        actionIgnored: input.result === "ignored" || input.result === "blocked",
      };
      return [...prev.slice(-99), next];
    });
  }
  function handleCoachAction(button:CoachButton|string){
    const before=currentDebugActionState();
    if(button==="continue_from_here"){
      const after={...before,coachInteraction:"continue_from_here",showAnswer:false};
      const current=new Chess(fen);
      const legalMoveCount=current.moves().length;
      const terminalDetected=current.isGameOver()||legalMoveCount===0;
      const continuationUserTurn=!terminalDetected&&current.turn()===userColor;
      setCoachInteraction("show_plan");
      recordDebugAction({
        action:button,
        normalizedAction:"continue_from_here",
        before,
        after,
        result:terminalDetected?"handled":"handled",
        reason:terminalDetected?"user_continue_from_here_terminal":"user_continue_from_here",
        extra:{
          continueFromHereClicked:true,
          terminalDetected,
          continuationTerminalReason:terminalDetected?(current.isCheckmate?.()?"checkmate":"no_legal_moves"):null,
          candidateAnalysisTriggered:continuationUserTurn,
          continuationRuntimeStatus:terminalDetected?"terminal":continuationUserTurn?"analyzing":"opponent_replying",
        },
      });
      continueVsBot();
      return;
    }
    // v2.7.41 Clean Convergence: Single visible action authority.
    // The only source of truth for what buttons can be clicked is visibleTeachingSurface.actions (when the surface owns the frame).
    // Everything else (phaseActionGate, old coachDecision.buttons, legacy) is ignored for teaching actions.
    const surfaceActionsAtClick = (visibleTeachingSurface?.coach?.shouldRender ? (visibleTeachingSurface.actions as any) : []) as string[];
    const allowedBySurface = surfaceActionsAtClick.includes(String(button));
    const internalWhitelist = ["replay", "hide", "continue_from_here", "restart_line"];
    if (!internalWhitelist.includes(String(button)) && !allowedBySurface) {
      recordDebugAction({action:button,normalizedAction:String(button),before,after:before,result:"blocked",reason:"action_not_in_current_visible_surface"});
      return;
    }
    if(button==="replay"){visualRecipePlayback.replay();recordDebugAction({action:button,normalizedAction:"replay",before,after:before,result:"handled",reason:"playback_replay_requested"});return;}
    if(button==="restart_line"){
      const after={...before,coachInteraction:"replay",showAnswer:false,hintShown:false};
      recordDebugAction({action:button,normalizedAction:"restart_line",before,after,result:"handled",reason:"user_restart_line"});
      resetBoard();
      return;
    }
    if(button==="hide"){const after={...before,coachInteraction:"hide"};setCoachHiddenFrameId(String(trainerFrameId));setCoachInteraction("hide");recordDebugAction({action:button,normalizedAction:"hide",before,after,result:"handled"});return;}
    if(button==="hint"){const after={...before,hintShown:true,coachInteraction:"hint"};setCoachHintRequestCount((count)=>count+1);setCoachInteraction("hint");recordDebugAction({action:button,normalizedAction:"hint",before,after,result:"handled"});return;}
    if((button as any)==="hide_more"){const after={...before,coachInteraction:"hide",showMoreShown:false};setShowMoreShown(false);setCoachInteraction("hide");recordDebugAction({action:String(button),normalizedAction:"hide_more",before,after,result:"handled"});return;}
    if(button==="show_more" || (button as any)==="show_more"){const after={...before,showMoreShown:true,coachInteraction:"show_plan"};setShowMoreShown(true);setCoachInteraction("show_plan");recordDebugAction({action:button,normalizedAction:"show_more",before,after,result:"handled",reason:"plain_show_more_escalation_to_full_content"});return;}
    if((button as any)==="reveal_target"){const after={...before,answerShown:true,showAnswer:true,coachInteraction:"answer"};setCoachInteraction("answer");setCoachReviewMarked(true);setShowAnswer(true);recordDebugAction({action:String(button),normalizedAction:"reveal_target",before,after,result:"handled"});handleReveal();return;}
    if(button==="answer"){const after={...before,answerShown:true,showAnswer:true,coachInteraction:"answer"};setCoachInteraction("answer");setCoachReviewMarked(true);recordDebugAction({action:button,normalizedAction:"answer",before,after,result:"handled"});handleReveal();return;}
    if(button==="why"){const after={...before,coachInteraction:"why"};setCoachInteraction("why");recordDebugAction({action:button,normalizedAction:"why",before,after,result:"handled"});return;}
    if(button==="show_plan"){const after={...before,coachInteraction:"show_plan"};setCoachInteraction("show_plan");recordDebugAction({action:button,normalizedAction:"show_plan",before,after,result:"handled"});return;}
    if(button==="analyze_idea"){const after={...before,coachInteraction:"analyze_idea"};setCoachInteraction("analyze_idea");recordDebugAction({action:button,normalizedAction:"analyze_idea",before,after,result:"handled",reason:(bookComplete||trainingMode==="continuation")&&isUserTurn?"analysis_requested":"state_only"});if((bookComplete||trainingMode==="continuation")&&isUserTurn)void runBrain("coach_analyze",{skipGpt:true});return;}
    if(button==="show_move"){if(!coachDecision?.exactMoveAllowed){recordDebugAction({action:button,normalizedAction:"show_move",before,after:before,result:"blocked",reason:"exact_move_not_allowed"});return;}const after={...before,answerShown:true,showAnswer:true,coachInteraction:"show_move"};setCoachInteraction("show_move");setCoachReviewMarked(true);setShowAnswer(true);recordDebugAction({action:button,normalizedAction:"show_move",before,after,result:"handled"});return;}
    recordDebugAction({action:String(button),normalizedAction:"none",before,after:before,result:"ignored",reason:"unknown_button"});
    setCoachInteraction("none");
  }
  const accuracy=getAccuracy(progress);
  const mistakes=Object.values(progress.mistakes).sort((a,b)=>b.count-a.count);
  const cpWhite=evalForWhite(engineLines[0]?.cp,game.turn() as ChessColor);
  const whitePct=whiteEvalPercent(cpWhite);
  const evalText=advantageLabel(cpWhite);
  const captured=capturedSummary(game);
  const adaptiveOpeningMoveHistoryUci = (buildRuntimePlayKeyBeforeFromSanHistory(moveHistory) ?? "")
    .split(",")
    .map((move) => move.trim())
    .filter(Boolean);
  const adaptiveOpeningIdentity = resolveAdaptiveOpeningIdentity({
    selectedOpeningId: repertoire.id,
    selectedOpeningName: repertoire.name,
    moveHistoryUci: adaptiveOpeningMoveHistoryUci,
  });
  const endingInfo=gameEndingInfo(game);

  // v2.7.40 Agent 3 (late placement after all frame deps): VisibleTeachingSurface — single owner.
  // Legacy coach paths are inputs only for debug/safety. Surface now owns visible teaching output.
  // v2.7.40 Agent 4: local brain analysis for surface/ladder (dupe of internal liveCoach but safe scope; analyze is lightweight facade)
  const brainAnalysisForSurface = (instructionTarget && currentInstructionFrame) ? analyzeBlundrPosition({
    fen,
    currentInstructionFrame: currentInstructionFrame,
    frameKey: computeInstructionFrameKey({ fen, trainingMode, isUserTurn, trainerPhase, source: instructionTarget?.kind || trainingMode }),
    trainingMode: trainingMode === "restricted" ? "guided" : trainingMode,
    isUserTurn,
    debugEnabled: blundrDebugEnabled,
  } as any) : null;

  // Agent 6: compute explicit 4-target + 2-piece sources (from display + pres + instruction) to pass to surface guard for invariant checks
  const intendedCoachMoveUci = (displayedCoachDecision?.debug as any)?.coachMoveUci ?? (rawCoachDecision?.debug as any)?.coachMoveUci ?? instructionTarget?.uci ?? null;
  const intendedVisualMoveUci = presentationFrame?.visual?.shouldRender && Array.isArray(presentationFrame.visual.lines) && presentationFrame.visual.lines[0]
    ? `${(presentationFrame.visual.lines[0] as any).from}${(presentationFrame.visual.lines[0] as any).to}` : null;
  const intendedShowMoreTargetUci = showMoreShown ? instructionTarget?.uci ?? null : null;
  const intendedCoachPieceType = (displayedCoachDecision?.debug as any)?.coachPieceType ?? instructionTarget?.pieceType ?? null;

  // v2.7.40 P0 Fix 2: on active teaching frames (CurrentInstructionFrame.target present + ready user turn), surface is sole visible owner.
  // Pass no legacyCoachDecision (even for debug detect) so surface.legacyBypassDetected=false and noLegacyBypass=true.
  const isActiveTeachingFrame = Boolean(instructionTarget) && trainerPhase === "ready_for_user" && isUserTurn;
  const v28VisibleSurfaceEnabled = isV28VisibleSurfaceEnabled();

  const legacyVisibleTeachingSurface = buildVisibleTeachingSurface({
    currentInstructionFrame,
    trainerPresentationFrame: presentationFrame as any, // v2.7.40: compute shape vs interface drift (pre-existing); surface tolerates
    legacyCoachDecision: isActiveTeachingFrame ? null : (coachDecision ?? rawCoachDecision ?? (liveCoachState as any)?.coach ?? null),
    showMoreShown, // v2.7.40 Agent 4: dedicated state (not showDetails)
    trainerView,
    trainingMode,
    isUserTurn,
    trainerPhase,
    bookStatus: bookComplete ? "book_complete" : "in_book",
    isBranchTransition: !!branchTransitionSurface?.render,
    isTerminal: !!endingInfo,
    // Agent 4: pass for ladder (progressive hints + evidence)
    hintCount: coachHintRequestCount,
    brainAnalysis: brainAnalysisForSurface as any,
    selectedTeachingConcept: (brainAnalysisForSurface as any)?.pedagogicalFocus?.focus ?? null,
    // Agent 6: pass targets/pieces for 4-target/2-piece invariant runtime guard
    coachMoveUci: intendedCoachMoveUci,
    visualMoveUci: intendedVisualMoveUci,
    showMoreTargetUci: intendedShowMoreTargetUci,
    coachPieceType: intendedCoachPieceType,
  });

  const v28VisibleSurface = (v28VisibleSurfaceEnabled && currentInstructionFrame) ? buildLiveVisibleTeachingSurface({
    frame: currentInstructionFrame as any,
    requestedMode: trainerView as "assisted" | "plain",
    showMoreRevealed: showMoreShown,
    moveSequence: moveHistory,
    openingKey: canonicalSelectedRepertoireId || undefined,
    openingName: repertoire.name || undefined,
    lineKey: canonicalSelectedRepertoireId || undefined,
    lineName: repertoire.name || undefined,
    expectedMoveReason: expectedMoveResolution?.reason,
    themeTags: [],
    branchComplete: currentInstructionFrame?.kind === "branch_complete",
    endOfBook: Boolean(bookComplete),
    continuationEligible: trainingMode === "continuation",
  }) : null;
  const v28SurfaceActive = Boolean(v28VisibleSurfaceEnabled && v28VisibleSurface);

  const v28CoachUiModel = v28VisibleSurface ? adaptVisibleSurfaceToCoachUi(v28VisibleSurface) : null;
  const v28BoardVisualUiModel = v28VisibleSurface ? adaptVisibleSurfaceToBoardVisuals(v28VisibleSurface) : null;
  const v28ActionKinds = v28CoachUiModel?.actions.map((action) => action.kind) ?? [];
  const plainBeforeShowMore = v28VisibleSurface?.mode === "plain_before_show_more";
  const plainHintShown = coachHintRequestCount > 0;
  const v28VisualLines: ActiveLine[] = (v28BoardVisualUiModel?.visualRecipes ?? [])
    .filter((visual) => Boolean(visual.from && visual.to))
    .map((visual) => ({
      from: visual.from as string,
      to: visual.to as string,
      kind: "plan" as const,
      label: visual.type,
    }));

  const visibleTeachingSurface = v28VisibleSurface ? {
    owner: "v28_visible_surface",
    mode: v28VisibleSurface.mode,
    copy: {
      title: v28CoachUiModel?.title ?? null,
      body: v28CoachUiModel?.body ?? null,
      bullets: v28CoachUiModel?.bullets ?? [],
    },
    isBrainTeachingFrame: isActiveTeachingFrame,
    targetUci: v28VisibleSurface.targetUci,
    targetSan: v28VisibleSurface.targetSan,
    targetPieceType: v28VisibleSurface.pieceType,
    coach: {
      shouldRender: Boolean(v28CoachUiModel),
      title: v28CoachUiModel?.title ?? null,
      body: v28CoachUiModel?.body ?? null,
      suppressedReason: v28VisibleSurface.mode === "blocked" ? "blocked_surface" : null,
    },
    hint: {
      text: plainBeforeShowMore && plainHintShown ? (v28CoachUiModel?.body ?? null) : null,
      suppressed: !(plainBeforeShowMore && plainHintShown),
    },
    showMore: {
      shown: showMoreShown,
      content: showMoreShown ? (v28CoachUiModel?.body ?? null) : null,
      actionAvailable: v28ActionKinds.includes("show_more"),
    },
    visual: {
      shouldRender: v28VisualLines.length > 0,
      lines: v28VisualLines,
      highlights: [],
      source: "visible_surface_v28",
      blockedReason: v28VisualLines.length > 0 ? null : "no_surface_visuals",
    },
    actions: v28ActionKinds,
    safety: {
      blocked: Boolean(v28VisibleSurface.safety.blocked ?? !v28VisibleSurface.safety.allowed),
      reason: v28VisibleSurface.safety.blockedReason ?? v28VisibleSurface.safety.criticalIssues[0] ?? null,
      blockedSeverity: v28VisibleSurface.safety.blockedSeverity ?? null,
      blockedPolicy: v28VisibleSurface.safety.blockedPolicy ?? null,
      targetMismatch: Boolean(v28VisibleSurface.safety.targetMismatch) || v28VisibleSurface.safety.criticalIssues.includes("target_mismatch"),
      pieceMismatch: v28VisibleSurface.safety.criticalIssues.includes("piece_mismatch"),
      visualMismatch: Boolean((v28VisibleSurface.safety as any).visualMismatch),
      revealMismatch: Boolean((v28VisibleSurface.safety as any).revealMismatch),
      unsupportedStrongClaim: Boolean((v28VisibleSurface.safety as any).unsupportedStrongClaim),
      legacyBypassDetected: false,
      plainLeakDetected: Boolean(v28VisibleSurface.safety.plainLeakDetected) || v28VisibleSurface.safety.criticalIssues.includes("plain_leak"),
      recoveredBySafeTeachingCopy: Boolean(v28VisibleSurface.safety.recoveredBySafeTeachingCopy),
    },
    debug: {
      visibleCoachOwner: "visible_surface_v28",
      visibleVisualOwner: "visible_surface_v28",
      visibleActionOwner: "visible_surface_v28",
      plainLeakDetected: v28VisibleSurface.safety.criticalIssues.includes("plain_leak"),
      fourTargetMismatch: false,
      twoPieceTypeMismatch: false,
    },
  } as any : legacyVisibleTeachingSurface;

  // v2.7.41 Clean Convergence: Emergency legal fallback must never be presented as normal coached teaching.
  // If the current continuation candidate came from pure legal fallback (no trusted source), force neutral non-lesson messaging
  // and prevent it from looking like a "best move" lesson. This stops dumb "Focus on development" / rook shuffle copy.
  let convergedVisibleSurface = visibleTeachingSurface;
  if (isActiveTeachingFrame && validatedContinuationCandidate?.isEmergencyLegalFallback) {
    convergedVisibleSurface = {
      ...visibleTeachingSurface,
      coach: {
        ...visibleTeachingSurface.coach,
        title: visibleTeachingSurface.coach.title || "Continue from here",
        body: "Try to improve your position with an active legal move. Blundr does not have a trusted continuation here yet.",
        suppressedReason: "emergency_legal_fallback_neutral",
      },
    } as any;
  }
  const pipelineCoachTitle = displayedCoachDecision?.shouldShowCoachCard
    ? String(displayedCoachDecision.title ?? "").trim()
    : "";
  const pipelineCoachBody = displayedCoachDecision?.shouldShowCoachCard
    ? String(displayedCoachDecision.body ?? "").trim()
    : "";
  const pipelineCoachQuality = (displayedCoachDecision?.debug as any)?.coachQuality ?? {};
  const pipelineSafetyPassed = !Array.isArray((displayedCoachDecision?.debug as any)?.unverifiedClaims)
    || ((displayedCoachDecision?.debug as any)?.unverifiedClaims as unknown[]).length === 0;
  const stage2CoachRenderState = resolveStage2CoachRenderState({
    openingId: runtimeBookFrameQuery.openingId ?? runtimeOpeningIdForFrame ?? undefined,
    playKeyBefore: runtimeBookFrameQuery.playKeyBefore ?? runtimePlayKeyBeforeForFrame ?? undefined,
    learnerSide: selectedOpeningAvailability?.learnerPerspective ?? undefined,
    sideToMove: game.turn() === "b" ? "black" : "white",
    targetUci: instructionTarget?.uci ?? undefined,
    targetSan: instructionTarget?.san ?? undefined,
    targetPieceType: instructionTarget?.pieceType ?? undefined,
    visibleSurfaceMode: v28VisibleSurface?.mode ?? null,
    runtimeBookStatus: runtimeBookFrameQuery.status,
    runtimeBookCandidateCount: runtimeBookFrameQuery.candidates.length,
    runtimeBookTopCandidateUci: runtimeBookFrameQuery.candidates[0]?.uci,
    runtimeBookTopCandidateSan: runtimeBookFrameQuery.candidates[0]?.san,
    runtimeBookTopCandidateRank: runtimeBookFrameQuery.candidates[0]?.rank,
    runtimeBookTopCandidateTotalGames: runtimeBookFrameQuery.candidates[0]?.totalGames,
    runtimeBookBookExhausted: runtimeBookFrameQuery.bookExhausted,
    plainRevealState: v28VisibleSurface?.mode === "plain_before_show_more" ? (plainHintShown ? "hint" : "hidden") : (
      v28VisibleSurface?.mode === "plain_after_show_more" ? "show_more" : "revealed"
    ),
    trainerPhase,
    isUserTurn,
    surfaceSafetyBlocked: Boolean(visibleTeachingSurface?.safety?.blocked),
    surfaceCopy: {
      title: v28CoachUiModel?.title ?? convergedVisibleSurface.coach.title ?? "Training move",
      body: v28CoachUiModel?.body ?? convergedVisibleSurface.coach.body ?? convergedVisibleSurface.hint.text ?? "",
      bullets: v28CoachUiModel?.bullets ?? [],
    },
    pipelineCopy: {
      title: pipelineCoachTitle,
      body: pipelineCoachBody,
      bullets: [],
    },
    pipelineTargetAligned: pipelineCoachQuality?.targetAligned,
    pipelinePieceAligned: pipelineCoachQuality?.pieceAligned,
    pipelineContainsDebugLeak: Boolean(pipelineCoachQuality?.containsDebugLeak || isDebugLeakText(pipelineCoachBody)),
    pipelinePassedSafety: pipelineSafetyPassed,
  });
  const stage2CoachContext = stage2CoachRenderState.stage2CoachContext;
  const stage2CoachingPacketResolution = stage2CoachRenderState.stage2CoachingPacketResolution;
  const pipelineCopyAuthorityDecision = stage2CoachRenderState.pipelineCopyAuthorityDecision;
  const stage2CoachCopyEnrichment = stage2CoachRenderState.stage2CoachCopyEnrichment;
  const coachCardTitleFromSurface = plainBeforeShowMore && !plainHintShown
    ? "Find the next move"
    : stage2CoachCopyEnrichment.copy.title;
  const coachCardBodyFromSurface = plainBeforeShowMore
    ? (plainHintShown ? stage2CoachCopyEnrichment.copy.body : "")
    : stage2CoachCopyEnrichment.copy.body;
  const visibleSurfaceActionKinds = (v28CoachUiModel?.actions ?? [])
    .filter((action) => action.visible)
    .map((action) => action.kind);
  const coachCardButtonsFromSurface = (visibleSurfaceActionKinds.length > 0 ? visibleSurfaceActionKinds : convergedVisibleSurface.actions) as any;
  const coachCardBulletsFromSurface = stage2CoachCopyEnrichment.copy.bullets;
  const surfaceCoachCardDecision = convergedVisibleSurface.coach.shouldRender ? ({
    shouldShowCoachCard: true,
    title: coachCardTitleFromSurface,
    body: coachCardBodyFromSurface,
    bullets: coachCardBulletsFromSurface,
    buttons: coachCardButtonsFromSurface,
    utteranceId: "surface",
    mode: "supported_continuation",
    action: "show_plan",
    revealRisk: "none",
    givesAnswer: false,
    suppressedReason: visibleTeachingSurface.coach.suppressedReason,
    hint: visibleTeachingSurface.hint.text,
    showMoreContent: visibleTeachingSurface.showMore.content,
  } as any) : null;
  const renderedCoachQualityForDebug=useMemo(()=>{
    const baseQuality=(displayedCoachDecision?.debug as any)?.coachQuality??{};
    const renderedTitle=surfaceCoachCardDecision?.shouldShowCoachCard?String(surfaceCoachCardDecision.title??"").trim()||null:null;
    const renderedBody=surfaceCoachCardDecision?.shouldShowCoachCard?String(surfaceCoachCardDecision.body??"").trim()||null:null;
    const pipelineTitle=displayedCoachDecision?.shouldShowCoachCard?String(displayedCoachDecision.title??"").trim()||null:null;
    const pipelineBody=displayedCoachDecision?.shouldShowCoachCard?String(displayedCoachDecision.body??"").trim()||null:null;
    const recentRenderedBodies=coachCardRenderTimeline
      .filter((entry)=>entry.trainerPhase==="ready_for_user"&&entry.isUserTurn&&Boolean(entry.instructionTargetUci))
      .slice(-8)
      .map((entry)=>String(entry.actualCoachCardBody??entry.visibleBody??""));
    const scored=computeRenderedCoachQuality({
      renderedTitle,
      renderedBody,
      pipelineTitle,
      pipelineBody,
      pipelineSource:String((displayedCoachDecision?.debug as any)?.coachDecisionSource??baseQuality?.source??"").trim()||null,
      pipelineQualityScore:Number.isFinite(Number(baseQuality?.qualityScore))?Number(baseQuality.qualityScore):null,
      moveSan:instructionTarget?.san??expectedUserOptions[0]?.san??null,
      moveUci:instructionTarget?.uci??expectedUserOptions[0]?.uci??null,
      runtimeSafeFallbackUsed:Boolean((displayedCoachDecision?.debug as any)?.verifiedFallbackUsed??baseQuality?.usedFallback),
      runtimeSafeFallbackReason:String((displayedCoachDecision?.debug as any)?.fallbackReason??baseQuality?.fallbackReason??"").trim()||null,
      recentRenderedBodies,
    }) as any;
    return {
      ...baseQuality,
      ...scored,
      targetAligned:baseQuality?.targetAligned,
      pieceAligned:baseQuality?.pieceAligned,
      selectedTheme:baseQuality?.selectedTheme??(displayedCoachDecision?.debug as any)?.selectedTheme??null,
      evidenceTags:Array.isArray(baseQuality?.evidenceTags)?baseQuality.evidenceTags:[],
    };
  },[
    surfaceCoachCardDecision?.shouldShowCoachCard,
    surfaceCoachCardDecision?.title,
    surfaceCoachCardDecision?.body,
    displayedCoachDecision?.shouldShowCoachCard,
    displayedCoachDecision?.title,
    displayedCoachDecision?.body,
    (displayedCoachDecision?.debug as any)?.coachDecisionSource,
    (displayedCoachDecision?.debug as any)?.verifiedFallbackUsed,
    (displayedCoachDecision?.debug as any)?.fallbackReason,
    (displayedCoachDecision?.debug as any)?.coachQuality,
    instructionTarget?.san,
    instructionTarget?.uci,
    expectedUserOptions[0]?.san,
    expectedUserOptions[0]?.uci,
    coachCardRenderTimeline,
  ]);
  const continuationRatingBadgeVisible=Boolean(
    trainingMode==="continuation"&&
    userExplicitlyEnteredContinuation&&
    lastContinuationUserMoveRating&&
    lastContinuationUserMoveRating.providerStatus==="ready"&&
    lastContinuationUserMoveRating.badgeVisible&&
    lastContinuationUserMoveRating.ratingLabel!=="Ungraded"&&
    trainerView!=="plain"&&
    v28VisibleSurface?.mode!=="branch_complete"&&
    v28VisibleSurface?.mode!=="continuation_analyzing"
  );
  const continuationRatingBadge=continuationRatingBadgeVisible?{
    label:lastContinuationUserMoveRating?.visibleBadgeLabel ?? "Best",
    severity:lastContinuationUserMoveRating?.severity ?? "unknown",
    ariaLabel:`Last move rating: ${lastContinuationUserMoveRating?.visibleBadgeLabel ?? "Best"}`,
  }:null;

  const isReviewingHistory=historyIndex<positionHistory.length-1;
  const selectedLegalMoves=selectedSquare&&boardSettings.showMoveDots&&isUserTurn&&!isReviewingHistory&&!game.isGameOver()?(game.moves({square:selectedSquare as any,verbose:true}) as any[]):[];
  const gptDebugText=JSON.stringify({pipeline:brainResponse?.pipeline??null,engine:enginePreview??null,moveQuality,moveQualityPending,shouldValidateTrainingMove,debug:brainResponse?.debug??null},null,2);
  const visualDebugText=JSON.stringify(visualDebugSnapshot,null,2);
  const telemetryDebugText=JSON.stringify(telemetryEvents.slice(-30),null,2);
  const visualModelRequestKey=useMemo(()=>JSON.stringify({
    fen:normalizeFen(fen),
    moveHistory,
    trainingPhase:trainingMode==="continuation"?"continuation":bookComplete?"book_complete":isUserTurn?"user_turn":"opponent_turn",
    userColor,
    expectedMove:expectedUserOptions[0]?.uci??null,
    bookStatus:bookComplete?"complete":expectedUserOptions.length?"in_book":"pending",
    stockfishBest:engineLines[0]?.uci??null,
    stockfishCp:engineLines[0]?.cp??null,
    openingName:repertoire.name,
    rating:rating.label,
  }),[fen,moveHistory.join("|"),trainingMode,bookComplete,isUserTurn,userColor,expectedUserOptions.map(m=>m.uci).join("|"),engineLines[0]?.uci,engineLines[0]?.cp,repertoire.name,rating.label]);
  function recordLocalTelemetry(event:LocalTelemetryEvent["event"],details:Record<string,unknown>){
    if(!telemetryEnabledRef.current)return;
    const entry:LocalTelemetryEvent={id:++telemetrySeq.current,ts:Date.now(),event,details};
    setTelemetryEvents(prev=>{
      const next=[...prev,entry].slice(-MAX_LOCAL_TELEMETRY_EVENTS);
      telemetryEventsRef.current=next;
      return next;
    });
  }
  function trackLearningEvent(input:Partial<LearningEvent>&Pick<LearningEvent,"type"|"source">){
    recordLearningEvent({
      sessionId:learningSessionIdRef.current,
      source:input.source,
      type:input.type,
      fen,
      openingId:canonicalSelectedRepertoireId,
      openingName:repertoire.name,
      trainerView,
      trainingMode,
      moveQualityStatus:moveQuality?.status,
      moveQualityUserStatus,
      ...input,
    });
  }
  function pushMaiaTimelineEvent(input:{
    event:MaiaTimelineEvent["event"];
    requestId:number|null;
    fen4:string;
    candidateCount:number;
    selectedUci:string|null;
    selectedSan:string|null;
    reason:string|null;
    fallbackReason:string|null;
    skillLevel:MaiaSkillLevel|null;
    sideToMove:ChessColor;
  }){
    const entry=createMaiaTimelineEvent({
      id:++maiaTimelineSeqRef.current,
      event:input.event,
      frameId:Number(trainerFrameId),
      requestId:input.requestId,
      fen4:input.fen4,
      trainingMode,
      userExplicitlyEnteredContinuation:Boolean(userExplicitlyEnteredContinuation),
      sideToMove:input.sideToMove,
      skillLevel:input.skillLevel,
      candidateCount:input.candidateCount,
      selectedUci:input.selectedUci,
      selectedSan:input.selectedSan,
      reason:input.reason,
      fallbackReason:input.fallbackReason,
    });
    setMaiaTimeline((prev)=>appendMaiaTimeline(prev,entry,75));
  }
  function pushRuntimeCriticalIssue(issue:string){
    setRuntimeCriticalIssues((prev)=>prev.includes(issue)?prev:[...prev.slice(-19),issue]);
  }
  function clearRuntimeCriticalIssue(issue:string){
    setRuntimeCriticalIssues((prev)=>{
      if(!prev.includes(issue))return prev;
      return prev.filter((entry)=>entry!==issue);
    });
  }
  function clearOpponentReplyTimeout(){
    if(opponentReplyTimeoutRef.current!==null){
      window.clearTimeout(opponentReplyTimeoutRef.current);
      opponentReplyTimeoutRef.current=null;
    }
  }
  function clearPendingOpponentReplyRequest(options?:{clearStaleIssue?:boolean}){
    const hadPendingRef=pendingOpponentRequestRef.current!==null;
    const hadPendingState=pendingOpponentRequest!==null;
    const hadTimeout=opponentReplyTimeoutRef.current!==null;
    if(!hadPendingRef&&!hadPendingState&&!hadTimeout){
      return false;
    }
    clearOpponentReplyTimeout();
    if(hadPendingRef){
      pendingOpponentRequestRef.current=null;
    }
    if(hadPendingState){
      setPendingOpponentRequest(null);
    }
    if(options?.clearStaleIssue&&(hadPendingRef||hadPendingState))clearRuntimeCriticalIssue("stale_opponent_reply_commit");
    return true;
  }
  function commitRuntimeFrame(input:{
    nextFen?:string;
    nextPhase:OverlayPhase;
    recordHistory?:boolean;
    clearPendingOpponentRequest?:boolean;
  }){
    if(typeof input.nextFen==="string"){
      setFen(input.nextFen);
      if(input.recordHistory)recordPosition(input.nextFen);
    }
    setTrainerPhase(input.nextPhase);
    setOverlayClearedOnPhaseChange(true);
    setTrainerFrameId((id)=>{
      const next=id+1;
      setOverlayFrameId(next);
      return next;
    });
    if(input.clearPendingOpponentRequest)clearPendingOpponentReplyRequest({clearStaleIssue:true});
  }
  function bumpRuntimeFrame(){
    setTrainerFrameId((id)=>{
      const next=id+1;
      setOverlayFrameId(next);
      return next;
    });
  }
  function scheduleOpponentReply(input:{mode:TrainingMode;delayMs?:number;baseFen?:string}){
    if((branchCompleteEligibleNow||stage2TerminalProof.proven)&&input.mode==="restricted"){
      clearPendingOpponentReplyRequest({clearStaleIssue:true});
      return null;
    }
    const baseFenNormalized=normalizeFen(input.baseFen??fenRef.current??fen);
    const currentPending=pendingOpponentRequestRef.current;
    if(currentPending&&currentPending.baseFen===baseFenNormalized&&currentPending.mode===input.mode){
      clearRuntimeCriticalIssue("stale_opponent_reply_commit");
      setTrainerPhase("opponent_replying");
      return currentPending;
    }
    const request:PendingOpponentRequest={
      requestId:++opponentRequestSeqRef.current,
      baseFen:baseFenNormalized,
      mode:input.mode,
      startedAt:Date.now(),
    };
    clearOpponentReplyTimeout();
    pendingOpponentRequestRef.current=request;
    setPendingOpponentRequest(request);
    clearRuntimeCriticalIssue("stale_opponent_reply_commit");
    setTrainerPhase("opponent_replying");
    opponentReplyTimeoutRef.current=window.setTimeout(()=>{
      if(pendingOpponentRequestRef.current?.requestId!==request.requestId)return;
      void playOpponentMove(request);
    },Math.max(0,input.delayMs??350));
    return request;
  }
  useEffect(()=>{const saved=localStorage.getItem("blundr-v22-progress");const savedCustom=localStorage.getItem("blundr-v22-custom");const savedSettings=localStorage.getItem("blundr-board-settings");const savedTelemetry=localStorage.getItem(LOCAL_TELEMETRY_KEY);if(saved)try{setProgress(JSON.parse(saved))}catch{}if(savedCustom)try{setCustomRepertoires(JSON.parse(savedCustom))}catch{}if(savedSettings)try{setBoardSettings({...DEFAULT_BOARD_SETTINGS,...JSON.parse(savedSettings)})}catch{}if(savedTelemetry)try{const parsed=JSON.parse(savedTelemetry) as Partial<LocalTelemetryStore>;const nextEvents=Array.isArray(parsed.events)?parsed.events.slice(-MAX_LOCAL_TELEMETRY_EVENTS):[];setTelemetryEnabled(Boolean(parsed.enabled));setTelemetryEvents(nextEvents);telemetryEventsRef.current=nextEvents;telemetrySeq.current=nextEvents.reduce((max,event)=>Math.max(max,Number(event.id)||0),0)}catch{}},[]);
  useEffect(()=>{
    try{
      const savedRuntimeLineMemory=localStorage.getItem(STAGE2_RUNTIME_TRAINING_LINE_MEMORY_KEY);
      if(!savedRuntimeLineMemory)return;
      const parsed=normalizeRuntimeTrainingLineKeys(JSON.parse(savedRuntimeLineMemory));
      setRecentRuntimeTrainingLineKeys(parsed);
      const nextSelection=buildRuntimeTrainingLineSelection(selectedRepertoireId,parsed,trainingSessionId,repertoire);
      if(nextSelection){
        setSelectedRuntimeTrainingLineSelection(nextSelection);
      }
    }catch{}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(()=>{
    if(typeof window==="undefined")return;
    const loaded=loadCoachUtteranceMemory(window.localStorage);
    const meta=readCoachUtteranceMemoryMeta(window.localStorage);
    coachUtteranceMemoryRef.current=loaded;
    setCoachUtteranceMemory(loaded);
    setCoachMemoryMigration(meta);
  },[]);
  useEffect(()=>{
    if(trainingMode!=="continuation"){
      setContinuationPauseClicked(false);
      setContinuationHardStopAcknowledged(false);
      return;
    }
    if(currentPlyCount<22){
      setContinuationHardStopAcknowledged(false);
      return;
    }
    if(!continuationHardStopAcknowledged){
      setContinuationPauseClicked(false);
    }
  },[trainingMode,currentPlyCount,continuationHardStopAcknowledged]);
  useEffect(()=>localStorage.setItem("blundr-v22-progress",JSON.stringify(progress)),[progress]);
  useEffect(()=>localStorage.setItem("blundr-v22-custom",JSON.stringify(customRepertoires)),[customRepertoires]);
  useEffect(()=>localStorage.setItem("blundr-board-settings",JSON.stringify(boardSettings)),[boardSettings]);
  useEffect(()=>localStorage.setItem(STAGE2_RUNTIME_TRAINING_LINE_MEMORY_KEY,JSON.stringify(recentRuntimeTrainingLineKeys.slice(0,2))),[recentRuntimeTrainingLineKeys]);
  useEffect(()=>{telemetryEnabledRef.current=telemetryEnabled},[telemetryEnabled]);
  useEffect(()=>{telemetryEventsRef.current=telemetryEvents},[telemetryEvents]);
  useEffect(()=>{branchCompleteLatchRef.current=branchCompleteLatch},[branchCompleteLatch]);
  useEffect(()=>{continuationCandidateLockRef.current=continuationCandidateLock},[continuationCandidateLock]);
  useEffect(()=>{lastCoachRecordsRef.current=lastCoachRecords},[lastCoachRecords]);
  useEffect(()=>{coachTimelineRef.current=coachTimeline},[coachTimeline]);
  useEffect(()=>{
    pendingOpponentRequestRef.current=pendingOpponentRequest;
    if(!pendingOpponentRequest)clearOpponentReplyTimeout();
  },[pendingOpponentRequest]);
  useEffect(()=>{
    if(trainingMode!=="continuation"||!userExplicitlyEnteredContinuation||!isUserTurn)return;
    if(!validatedContinuationCandidate?.uci)return;
    const fen4=normalizeFen(fen);
    const existing=continuationCandidateLockRef.current;
    if(existing&&existing.continuationCandidateLockFen4===fen4&&existing.continuationCandidateLockUci===validatedContinuationCandidate.uci){
      return;
    }
    const requestId=Math.max(1,continuationCandidateRequestSeqRef.current);
    const lock={
      continuationCandidateLockId:++continuationCandidateLockSeqRef.current,
      continuationCandidateLockFen4:fen4,
      continuationCandidateLockRequestId:requestId,
      continuationCandidateLockUci:validatedContinuationCandidate.uci,
      continuationCandidateLockSan:validatedContinuationCandidate.san??validatedContinuationCandidate.uci,
      continuationCandidateLockSource:String(validatedContinuationCandidate.source??"continuation_policy"),
      continuationCandidateLockReason:String(validatedContinuationCandidate.reason??"candidate_locked"),
    };
    setContinuationCandidateLock(lock);
  },[trainingMode,userExplicitlyEnteredContinuation,isUserTurn,validatedContinuationCandidate?.uci,validatedContinuationCandidate?.san,validatedContinuationCandidate?.source,validatedContinuationCandidate?.reason,fen]);
  useEffect(()=>{
    if(!branchCompleteEligibleNow||!stage2TerminalProof.proven)return;
    const existing=branchCompleteLatchRef.current;
    const fen4=normalizeFen(fen);
    if(existing.active&&existing.lineId===selectedRuntimeLineId&&existing.fen4===fen4)return;
    setBranchCompleteLatch({
      active:true,
      reason:branchCompleteReasonNow??stage2TerminalProof.reason??"line_complete",
      fen4,
      lineId:selectedRuntimeLineId,
      ply:moveHistory.length,
      latchedAtFrameId:trainerFrameId,
    });
  },[branchCompleteEligibleNow,stage2TerminalProof.proven,stage2TerminalProof.reason,branchCompleteReasonNow,fen,canonicalSelectedRepertoireId,moveHistory.length,trainerFrameId]);
  useEffect(()=>{
    if(!branchCompleteShouldCancelPending)return;
    const pendingId=pendingOpponentRequestRef.current?.requestId??null;
    const hasPendingState=pendingOpponentRequest!==null;
    const hasPendingRef=pendingId!==null;
    const isOpponentTransitionPhase=
      trainerPhase==="opponent_replying"||
      trainerPhase==="opponent_selecting";
    if(!hasPendingState&&!hasPendingRef&&!isOpponentTransitionPhase){
      return;
    }
    if(hasPendingRef){
      if(branchCompleteBlockedOpponentRequestIdRef.current===pendingId){
        return;
      }
      branchCompleteBlockedOpponentRequestIdRef.current=pendingId;
    }
    if(hasPendingState||hasPendingRef){
      clearPendingOpponentReplyRequest({clearStaleIssue:true});
    }
    if(isOpponentTransitionPhase){
      setTrainerPhase((current)=>(
        current==="opponent_replying"||current==="opponent_selecting"
          ?"ready_for_user"
          :current
      ));
    }
  },[branchCompleteShouldCancelPending,pendingOpponentRequest?.requestId,trainerPhase]);
  useEffect(()=>{
    if(!pendingOpponentRequest)return;
    const pendingMatchesBoard=normalizeFen(fen)===pendingOpponentRequest.baseFen;
    if(trainerPhase==="opponent_replying"&&!isUserTurn&&pendingMatchesBoard){
      clearRuntimeCriticalIssue("stale_opponent_reply_commit");
    }
  },[pendingOpponentRequest,fen,trainerPhase,isUserTurn]);
  useEffect(()=>{const store:LocalTelemetryStore={enabled:telemetryEnabled,events:telemetryEvents.slice(-MAX_LOCAL_TELEMETRY_EVENTS),updatedAt:Date.now()};localStorage.setItem(LOCAL_TELEMETRY_KEY,JSON.stringify(store))},[telemetryEnabled,telemetryEvents]);
  useEffect(()=>{
    const api={
      getEvents:()=>telemetryEventsRef.current.slice(),
      clear:()=>setTelemetryEvents([]),
      setEnabled:(enabled:boolean)=>setTelemetryEnabled(Boolean(enabled)),
      getVisualDebug:()=>visualDebugSnapshot,
    };
    (window as any).__blundrLocalTelemetry=api;
    return()=>{if((window as any).__blundrLocalTelemetry===api)delete (window as any).__blundrLocalTelemetry};
  },[visualDebugSnapshot]);
  useEffect(()=>{const t=window.setInterval(()=>{if(opponentCue&&Date.now()>opponentCue.expiresAt)setOpponentCue(null)},250);return()=>window.clearInterval(t)},[opponentCue]);
  useEffect(()=>()=>{continuationAnalysisAbortRef.current?.abort();if(continuationAnalysisDebounceRef.current!==null)window.clearTimeout(continuationAnalysisDebounceRef.current);clearOpponentReplyTimeout()},[]);
  useEffect(()=>{setStaleOverlayIgnored(false)},[trainerFrameId]);
  useEffect(()=>{
    if(trainerPhase==="ready_for_user")setOverlayFrameId(trainerFrameId);
  },[trainerPhase,trainerFrameId,fen]);
  useEffect(()=>{
    if(presentationFrame.visual.shouldRender&&trainerPhase==="ready_for_user")setOverlayClearedOnPhaseChange(false);
  },[presentationFrame.visual.shouldRender,trainerPhase]);
  useEffect(()=>setBrain(p=>({...p,ratingLabel:rating.label,ratingPool:rating.target})),[rating.label,rating.target]);
  useEffect(()=>{
    fenRef.current=fen;
    const fen4=normalizeFen(fen);
    if(continuationCandidateLockRef.current&&continuationCandidateLockRef.current.continuationCandidateLockFen4!==fen4){
      setContinuationCandidateLock(null);
    }
    setBrainResponse(null);
    setEnginePreview(null);
    setVisualModelOutput(null);
    setVisualModelError(null);
    setVisualDebugSnapshot(prev=>({...prev,responseSummary:null,responseDebug:null,error:null,durationMs:null,updatedAt:Date.now()}));
    setOverlayClearedOnPhaseChange(true);
  },[fen]);
  useEffect(()=>{
    if(activeTab!=="train")return;
    if(trainingMode!=="continuation"){
      setContinuationAnalysisStatus("idle");
      return;
    }
    if(game.isGameOver()||game.moves().length===0){
      setContinuationAnalysisStatus("terminal");
      return;
    }
    if(!isUserTurn){
      setContinuationAnalysisStatus("opponent_replying");
      return;
    }
    if(trainerPhase!=="ready_for_user"){
      setContinuationAnalysisStatus("idle");
      return;
    }
    if(forceContinuationPause||!userExplicitlyEnteredContinuation){
      setContinuationAnalysisStatus("idle");
      return;
    }
    if(continuationLockCandidate?.uci){
      setContinuationAnalysisStatus("ready");
      return;
    }
    if(validatedContinuationCandidate?.uci&&validatedContinuationCandidate.source!=="no_reliable_continuation"){
      clearRuntimeCriticalIssue("continuation_no_reliable_candidate");
      setContinuationAnalysisStatus("ready");
      return;
    }
    const normalized=normalizeFen(fen);
    const cacheKey=`${normalized}|${userColor}|${rating.skill}|10`;
    const cached=continuationEngineCacheRef.current[cacheKey];
    if(cached){
      setContinuationAnalysisStatus("ready");
      if(!enginePreview||normalizeFen(enginePreview.fen)!==normalized){
        setEnginePreview(cached);
      }
      return;
    }
    if(enginePreview&&normalizeFen(enginePreview.fen)===normalized&&enginePreview.pvs.length>0){
      setContinuationAnalysisStatus("ready");
      return;
    }

    continuationCandidateRequestSeqRef.current+=1;
    const candidateRequestId=continuationCandidateRequestSeqRef.current;
    setContinuationAnalysisStatus("analyzing");

    if(continuationAnalysisDebounceRef.current!==null){
      window.clearTimeout(continuationAnalysisDebounceRef.current);
      continuationAnalysisDebounceRef.current=null;
    }
    continuationAnalysisDebounceRef.current=window.setTimeout(()=>{
      continuationAnalysisDebounceRef.current=null;
      continuationAnalysisAbortRef.current?.abort();
      const controller=new AbortController();
      continuationAnalysisAbortRef.current=controller;
      const requestSeq=++continuationAnalysisSeqRef.current;
      void runBrowserStockfish(fen,rating.skill,900,10,controller.signal).then((result)=>{
        if(controller.signal.aborted)return;
        if(requestSeq!==continuationAnalysisSeqRef.current)return;
        if(normalizeFen(fenRef.current)!==normalized)return;
        const existingLock=continuationCandidateLockRef.current;
        if(
          existingLock&&
          existingLock.continuationCandidateLockFen4===normalized&&
          existingLock.continuationCandidateLockRequestId>candidateRequestId
        ){
          return;
        }
        if(!result?.pvs?.length){
          setContinuationAnalysisStatus("error");
          return;
        }
        const next={fen,pvs:result.pvs,source:result.source};
        continuationEngineCacheRef.current[cacheKey]=next;
        setEnginePreview(next);
        setContinuationAnalysisStatus("ready");
      }).catch(()=>{
        if(controller.signal.aborted)return;
        setContinuationAnalysisStatus("error");
      });
    },250);
    return()=>{
      if(continuationAnalysisDebounceRef.current!==null){
        window.clearTimeout(continuationAnalysisDebounceRef.current);
        continuationAnalysisDebounceRef.current=null;
      }
    };
  },[
    activeTab,
    trainingMode,
    isUserTurn,
    trainerPhase,
    fen,
    userColor,
    rating.skill,
    enginePreview?.fen,
    enginePreview?.pvs?.length,
    validatedContinuationCandidate?.uci,
    validatedContinuationCandidate?.san,
    validatedContinuationCandidate?.source,
    continuationLockCandidate?.uci,
    forceContinuationPause,
    userExplicitlyEnteredContinuation,
  ]);
  useEffect(()=>{
    if(activeTab!=="train"||trainingMode!=="continuation"||trainerPhase!=="ready_for_user"||!isUserTurn)return;
    if(game.isGameOver()||game.moves().length===0)return;
    if(forceContinuationPause||!userExplicitlyEnteredContinuation)return;
    if(instructionTarget?.kind==="continuation_candidate"){
      clearRuntimeCriticalIssue("continuation_ready_without_candidate");
      clearRuntimeCriticalIssue("continuation_no_reliable_candidate");
      return;
    }
    if(engineLines.length>0 && (!validatedContinuationCandidate?.uci || validatedContinuationCandidate.source==="no_reliable_continuation")){
      pushRuntimeCriticalIssue("continuation_no_reliable_candidate");
      setContinuationAnalysisStatus("error");
      return;
    }
    const transitionalContinuationState =
      continuationRuntimeState.status==="analyzing"||
      continuationRuntimeState.status==="requested"||
      continuationRuntimeState.status==="opponent_replying"||
      continuationRuntimeState.status==="terminal";
    if(
      continuationAnalysisStatus==="ready"&&
      continuationRuntimeState.status==="ready"&&
      !transitionalContinuationState&&
      !validatedContinuationCandidate?.uci&&
      validatedContinuationCandidate?.source!=="freeplay_continuation"
    ){
      pushRuntimeCriticalIssue("continuation_ready_without_candidate");
    }
  },[
    activeTab,
    trainingMode,
    trainerPhase,
    isUserTurn,
    instructionTarget?.kind,
    fen,
    forceContinuationPause,
    userExplicitlyEnteredContinuation,
    engineLines.length,
    validatedContinuationCandidate?.uci,
    validatedContinuationCandidate?.source,
    continuationAnalysisStatus,
    continuationRuntimeState.status,
  ]);
  useEffect(()=>{if(activeTab==="train")positionStartedAtRef.current=Date.now()},[fen,activeTab]);
  useEffect(()=>{setCoachInteraction("none");setCoachHintRequestCount(0);setCoachReviewMarked(false);setCoachHiddenFrameId(null);setShowMoreShown(false);setLastActionDebug(null);},[fen,trainerFrameId,trainerView,trainerPhase]);
  useEffect(()=>{if(!enabledViews.includes(activeBoardView)&&enabledViews.length)setActiveBoardView(enabledViews[0])},[activeBoardView,enabledViews.join("|")]);
  useEffect(()=>{
    if(!shouldValidateTrainingMove){
      setMoveQuality(null);
      setMoveQualityPending(false);
      return;
    }

    const expectedMoves=expectedMovesForValidation;
    if(!expectedMoves.length){
      setMoveQuality({
        status:"unavailable",
        fen,
        expectedMovesUci:[],
        topMoves:[],
        reason:"No UCI expected move was available for validation.",
        checkedAt:Date.now(),
      });
      setMoveQualityPending(false);
      return;
    }

    const cacheKey=buildMoveQualityCacheKey({
      fen,
      expectedMovesUci:expectedMoves.map((move)=>move.uci),
    });

    const cached=moveQualityCacheRef.current.get(cacheKey);
    if(cached){
      setMoveQuality(cached);
      setMoveQualityPending(false);
      return;
    }

    let cancelled=false;
    setMoveQualityPending(true);
    setMoveQuality({
      status:"pending",
      fen,
      expectedMovesUci:expectedMoves.map((move)=>move.uci),
      topMoves:[],
      reason:"Validating expected move with Stockfish.",
      checkedAt:Date.now(),
    });

    async function runValidation(){
      try{
        const topMoves=await getStockfishTopMovesForValidation({
          fen,
          multipv:2,
          depth:10,
          timeoutMs:5000,
        });
        if(cancelled)return;
        const result=evaluateTopTwoMatch({
          fen,
          expectedMoves,
          topMoves,
        });
        moveQualityCacheRef.current.set(cacheKey,result);
        setMoveQuality(result);
        setMoveQualityPending(false);
      }catch(error){
        if(cancelled)return;
        const result:MoveQualityResult={
          status:"unavailable",
          fen,
          expectedMovesUci:expectedMoves.map((move)=>move.uci),
          topMoves:[],
          reason:error instanceof Error?error.message:"Stockfish validation failed.",
          checkedAt:Date.now(),
        };
        moveQualityCacheRef.current.set(cacheKey,result);
        setMoveQuality(result);
        setMoveQualityPending(false);
      }
    }

    void runValidation();
    return()=>{cancelled=true};
  },[fen,shouldValidateTrainingMove,expectedMovesForValidationKey]);
  useEffect(()=>{
    if(activeTab!=="train"||!shouldValidateTrainingMove||!moveQuality)return;
    if(moveQualityPending)return;
    const eventKey=`${normalizeFen(fen)}|${moveQuality.status}|${moveQuality.checkedAt}`;
    if(lastMoveQualityEventKeyRef.current===eventKey)return;
    lastMoveQualityEventKeyRef.current=eventKey;
    trackLearningEvent({
      type:"move_quality_checked",
      source:"train",
      fen,
      moveQualityStatus:moveQuality.status,
      moveQualityUserStatus,
      metadata:{
        required:shouldValidateTrainingMove,
        topMoveCount:moveQuality.topMoves.length,
      },
    });
  },[activeTab,fen,moveQuality,moveQualityPending,moveQualityUserStatus,shouldValidateTrainingMove]);
  useEffect(()=>{
    if(activeTab!=="train"||!teachingOrchestration?.cue)return;
    const cue=teachingOrchestration.cue;
    const meta=teachingOrchestration.learningMetadata;
    const metaText=(key:string)=>typeof meta[key]==="string"?meta[key] as string:"";
    const metaNumber=(key:string)=>typeof meta[key]==="number"?Number(meta[key]):null;
    const metaBoolean=(key:string)=>typeof meta[key]==="boolean"?Boolean(meta[key]):false;
    const eventKey=`${normalizeFen(fen)}|${cue.metadata.moveUci}|${cue.conceptId}|${metaText("trainingContextMode")}|${metaText("moveTrust")}|${cue.cueMode}`;
    if(lastTeachingCueEventKeyRef.current===eventKey)return;
    lastTeachingCueEventKeyRef.current=eventKey;
    trackLearningEvent({
      type:"teaching_cue_compiled",
      source:"train",
      fen,
      expectedMoveSan:cue.metadata.moveSan,
      expectedMoveUci:cue.metadata.moveUci,
      metadata:{
        cueMode:metaText("cueMode"),
        trainingContextMode:metaText("trainingContextMode"),
        moveTrust:metaText("moveTrust"),
        contextTrust:metaText("contextTrust"),
        userFacingMode:metaText("userFacingMode"),
        selectedStoryId:metaText("selectedStoryId"),
        selectedStoryKind:metaText("selectedStoryKind"),
        storyScoreTotal:metaNumber("storyScoreTotal"),
        storySpecificityScore:metaNumber("storySpecificityScore"),
        concreteGroundingScore:metaNumber("concreteGroundingScore"),
        genericnessPenalty:metaNumber("genericnessPenalty"),
        moveSemanticEffects:metaText("moveSemanticEffects"),
        topAlternativeThemes:metaText("topAlternativeThemes"),
        answerVisualsShown:metaBoolean("answerVisualsShown"),
        contextVisualsShown:metaBoolean("contextVisualsShown"),
        planVisualsShown:metaBoolean("planVisualsShown"),
        nextPlayAllowed:metaBoolean("nextPlayAllowed"),
        nextPlaySuppressed:metaBoolean("nextPlaySuppressed"),
        nextPlaySuppressionReason:metaText("nextPlaySuppressionReason"),
        visualConceptAlignment:metaText("visualConceptAlignment"),
        conceptId:metaText("conceptId"),
        confidence:metaNumber("confidence"),
        compilerVersion:metaText("compilerVersion"),
        suppressionReasons:metaText("suppressionReasons"),
        visualBudgetUsed:metaText("visualBudgetUsed"),
      },
    });
  },[activeTab,teachingOrchestration,fen]);
  useEffect(()=>{
    if(activeTab!=="train"||isReviewingHistory)return;
    const requestFen=fen;
    const requestStarted=performance.now();
    const requestSeq=++visualRequestSeq.current;
    visualAbortRef.current?.abort();
    const requestGame=new Chess(requestFen);
    const continuationEnginePending=trainingMode==="continuation"&&requestGame.turn()===userColor&&!engineLines[0];
    if(requestGame.isGameOver()){setVisualModelPending(false);setVisualModelError(null);return}
    if(continuationEnginePending){setVisualModelPending(false);setVisualModelError(null);return}
    const controller=new AbortController();
    visualAbortRef.current=controller;
    setVisualModelPending(true);
    setVisualModelError(null);
    const trainingPhase=trainingMode==="continuation"?"continuation":bookComplete?"book_complete":isUserTurn?"user_turn":"opponent_turn";
    const payload={
      fen:requestFen,
      moveHistory,
      userColor,
      userRatingBucket:rating.label,
      trainingPhase,
      trainingMode,
      expectedMove:expectedUserOptions[0]?{san:expectedUserOptions[0].san,uci:expectedUserOptions[0].uci}:undefined,
      expectedMoves:expectedUserOptions.map(m=>({san:m.san,uci:m.uci})),
      bookStatus:bookComplete?"complete":expectedUserOptions.length?"in_book":"pending",
      openingName:repertoire.name,
      stockfishSummary:engineLines[0]?{bestMove:{san:engineLines[0].san,uci:engineLines[0].uci},pvs:engineLines}:undefined,
      coachingMemory:{
        conceptSeenCount:progress.trainedPositions[normalizeFen(requestFen)]?1:0,
        missedCount:progress.mistakes[normalizeFen(requestFen)]?.count??0,
        successCount:progress.trainedPositions[normalizeFen(requestFen)]?1:0,
      },
    };
    setVisualDebugSnapshot({requestKey:visualModelRequestKey,requestPayload:payload as Record<string,unknown>,responseSummary:null,responseDebug:null,error:null,durationMs:null,updatedAt:Date.now()});
    recordLocalTelemetry("visual_request",{requestKey:visualModelRequestKey,fen:normalizeFen(requestFen),trainingPhase,trainingMode,bookStatus:payload.bookStatus,hasExpectedMove:Boolean(expectedUserOptions[0]),hasEngine:Boolean(engineLines[0])});
    if(controller.signal.aborted)return;
    if(requestSeq!==visualRequestSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen)){setStaleOverlayIgnored(true);return;}
    void fetch("/api/blundr-visual-model",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),signal:controller.signal})
      .then(async(res)=>{if(!res.ok)throw new Error(`visual model ${res.status}`);return await res.json() as VisualModelOutput})
      .then((data)=>{if(requestSeq!==visualRequestSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen)){setStaleOverlayIgnored(true);return;}const durationMs=Math.round(performance.now()-requestStarted);const suppress=Array.isArray(data.suppress)?data.suppress:[];const responseSummary={source:typeof data.source==="string"?data.source:null,fallback:Boolean(data.fallback),suppress,arrowCount:Array.isArray(data.arrows)?data.arrows.length:0,squareCount:Array.isArray(data.squares)?data.squares.length:0,animation:data.animationPackage?.name??data.animation??null,contextHeadline:data.context?.headline??null};setVisualDebugSnapshot(prev=>({...prev,responseSummary,responseDebug:data.debug&&typeof data.debug==="object"?data.debug as Record<string,unknown>:null,error:null,durationMs,updatedAt:Date.now()}));setVisualModelOutput(data);setVisualModelPending(false);recordLocalTelemetry("visual_response",{requestKey:visualModelRequestKey,fen:normalizeFen(requestFen),durationMs,source:responseSummary.source,fallback:responseSummary.fallback,suppressed:suppress.includes("recommendation_pending"),arrowCount:responseSummary.arrowCount,squareCount:responseSummary.squareCount});if(suppress.includes("recommendation_pending"))recordLocalTelemetry("visual_suppressed",{requestKey:visualModelRequestKey,fen:normalizeFen(requestFen),reason:"recommendation_pending"})})
      .catch((error)=>{if(error instanceof Error&&error.name==="AbortError")return;if(requestSeq!==visualRequestSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen)){setStaleOverlayIgnored(true);return;}const message=error instanceof Error?error.message:"Visual model failed";setVisualDebugSnapshot(prev=>({...prev,error:message,responseSummary:null,responseDebug:null,durationMs:Math.round(performance.now()-requestStarted),updatedAt:Date.now()}));setVisualModelError(message);setVisualModelPending(false);recordLocalTelemetry("visual_error",{requestKey:visualModelRequestKey,fen:normalizeFen(requestFen),message})});
    return()=>controller.abort();
  },[activeTab,isReviewingHistory,visualModelRequestKey]);
  useEffect(()=>{if(activeTab!=="train")return;const fast=deriveFastAnnotation({fen,openingName:repertoire.name,userColor,trainingMode,expectedUserOptions,opponentBookOptions});setAnnotation(fast);setVisualReady(true);setThinkingStep("ready");setPipelineNote(trainingMode==="continuation"&&isUserTurn?continuationAnalysisStatus==="analyzing"?"Analyzing continuation candidate.":"Continuation candidate ready.":"Teaching cue ready.");setBrain(p=>({...p,source:"rule visual",gpt:"ready",note:"Manual reveal/debug only"}))},[fen,activeTab,selectedRepertoireId,trainingMode,ratingFilter,continuationAnalysisStatus]);
  useEffect(()=>{
    if(activeTab!=="train"||!shouldValidateTrainingMove)return;
    if(moveQualityPending){setPipelineNote("Blundr Brain is checking the position.");return}
    if(moveQuality?.status==="verified_top1"||moveQuality?.status==="verified_top2"){setPipelineNote("Teaching cue ready.");return}
    if(moveQuality?.status==="rejected"){setPipelineNote("Saved line needs review. Blundr will not invent a teaching cue.");return}
    if(moveQuality?.status==="unavailable"){setPipelineNote("Move not verified. Blundr will stay quiet instead of guessing.");}
  },[activeTab,shouldValidateTrainingMove,moveQualityPending,moveQuality?.status]);
  useEffect(()=>{if(activeTab==="train"&&trainingMode==="restricted"&&isUserTurn&&expectedMoveResolution.shouldTransitionToContinuation&&guidedCoveragePolicy.guidedCompleteAllowed&&!bookComplete&&!game.isGameOver()){setBookComplete(true);setFeedback("Guided line complete. Continue from here against the bot, or restart the opening.");setBrain(p=>({...p,book:"complete",source:guidedCoveragePolicy.guidedCoverageState,gpt:p.gpt}))}},[activeTab,trainingMode,isUserTurn,expectedMoveResolution.shouldTransitionToContinuation,guidedCoveragePolicy.guidedCompleteAllowed,guidedCoveragePolicy.guidedCoverageState,bookComplete,fen]);
  useEffect(()=>{
    if(activeTab!=="train"||trainingMode!=="restricted"||!isUserTurn||bookComplete||game.isGameOver())return;
    if(expectedMoveResolution.source==="guided_branch_needs_continuation"){
      setFeedback("This branch is beyond the guided line. Continue from here, or restart the opening.");
      setBrain(p=>({...p,book:"ready",source:"guided branch needs continuation",note:expectedMoveResolution.reason,gpt:p.gpt}));
      return;
    }
    if(expectedUserOptions.length===0&&expectedMoveResolution.source==="none"){
      setFeedback("This branch is not mapped yet. Continue from here, or restart the opening.");
      setBrain(p=>({...p,book:"ready",source:"resolver unresolved",note:guidedCoveragePolicy.bookCompleteBlockedReason??expectedMoveResolution.reason,gpt:p.gpt}));
    }
  },[activeTab,trainingMode,isUserTurn,expectedUserOptions.length,expectedMoveResolution.source,expectedMoveResolution.reason,guidedCoveragePolicy.bookCompleteBlockedReason,guidedCoveragePolicy.guidedCompleteBlockedReason,bookComplete,fen,game.isGameOver()]);
  useEffect(()=>{
    if(activeTab!=="train"||bookComplete||isReviewingHistory)return;
    if(game.isGameOver()){
      if(trainingMode==="continuation")setContinuationAnalysisStatus("terminal");
      setTrainerPhase("terminal");
      clearPendingOpponentReplyRequest({clearStaleIssue:true});
      setFeedback((endingInfo?.title??"Game over")+". Restart the opening to train again.");
      return;
    }
    if(branchCompleteEligibleNow){
      if(pendingOpponentRequest) return;
      if(!isUserTurn) setTrainerPhase("ready_for_user");
      return;
    }
    if(!isUserTurn){
      if(
        runtimeBookFrameShouldQuery &&
        runtimeBookFrameQuery.status!=="ready" &&
        runtimeBookFrameQuery.status!=="error"
      ) {
        return;
      }
      if(pendingOpponentRequest)return;
      scheduleOpponentReply({mode:trainingMode,delayMs:900,baseFen:fen});
      return;
    }
    if(pendingOpponentRequest) clearPendingOpponentReplyRequest({clearStaleIssue:true});
  },[activeTab,fen,bookComplete,isUserTurn,isReviewingHistory,canonicalSelectedRepertoireId,trainingMode,ratingFilter,game,endingInfo?.title,trainerPhase,pendingOpponentRequest?.requestId,branchCompleteEligibleNow,runtimeBookFrameShouldQuery,runtimeBookFrameQuery.status]);
  async function loadExplorer(positionFen:string){
    const cacheKey=`${normalizeFen(positionFen)}|${ratingFilter}|${speedFilter}`;
    if(explorerCache.current[cacheKey]){
      const parsed=parseExplorerMoves(explorerCache.current[cacheKey]);
      setExplorerMoves(parsed);
      setBrain(p=>({...p,lichess:"cached",note:"Local runtime package cache"}));
      return parsed;
    }
    const currentFen4=normalizeFen(positionFen);
    const currentOpeningNodes=openingTree.nodesByFen4[currentFen4]??[];
    const seenUcis=new Set<string>();
    const localRows=currentOpeningNodes.flatMap((node)=>node.continuations).flatMap((move)=>{
      if(seenUcis.has(move.uci)) return [];
      seenUcis.add(move.uci);
      const total=currentOpeningNodes.filter((openingNode)=>openingNode.continuations.some((continuation)=>continuation.uci===move.uci)).length;
      return [{
        uci:move.uci,
        san:move.san,
        white:move.color==="w"?Math.max(1,total):0,
        draws:0,
        black:move.color==="b"?Math.max(1,total):0,
        averageRating:undefined,
      }];
    });
    const source = localRows.length ? "local_crawled_package" : "local_legal_fallback";
    const payload = {
      source,
      fallback: source === "local_legal_fallback",
      reason: source === "local_crawled_package" ? `${localRows.length} local runtime moves` : "Local legal-move fallback",
      moves: localRows.length
        ? localRows
        : (new Chess(positionFen).moves({ verbose: true }) as any[]).map((move) => ({
            uci: moveToUci(move),
            san: move.san,
            white: 1,
            draws: 0,
            black: 0,
            averageRating: undefined,
          })),
    };
    explorerCache.current[cacheKey]=payload;
    const parsed=parseExplorerMoves(payload);
    setExplorerMoves(parsed);
    setBrain(p=>({...p,lichess:source==="local_crawled_package"?"active":"fallback",latency:0,note:payload.reason}));
    return parsed;
  }
  async function runBrain(eventType:string,extra:Record<string,any>={}){
    if(activeTab!=="train")return null;
    const requestFen=fen;
    const requestSeq=++brainSeq.current;
    brainAbortRef.current?.abort();
    const controller=new AbortController();
    brainAbortRef.current=controller;
    setThinkingStep("facts");
    setPipelineNote("Manual Brain check started.");
    setBrain(p=>({...p,engine:"loading",gpt:extra.skipGpt?"fallback":"loading",source:"Manual analysis"}));
    setThinkingStep("engine");
    setPipelineNote("Manual analysis started.");
    const browserEngine=extra.skipClientEngine?null:await runBrowserStockfish(requestFen,rating.skill,eventType==="reveal"?1000:700);
    if(requestSeq!==brainSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen)){setStaleOverlayIgnored(true);return null;}
    const clientEngine=browserEngine?{source:browserEngine.source,pvs:browserEngine.pvs,depth:browserEngine.depth,timeMs:browserEngine.timeMs}:undefined;
    if(browserEngine?.pvs?.length){
      setEnginePreview({fen:requestFen,pvs:browserEngine.pvs,source:browserEngine.source});
      const requestGame=new Chess(requestFen);
      if(trainingMode==="continuation"&&requestGame.turn()===userColor){
        setAnnotation(engineAnnotationFromLine({fen:requestFen,line:browserEngine.pvs[0],openingName:repertoire.name}));
        setVisualReady(true);
        setPipelineNote(`Manual analysis ready: ${browserEngine.pvs[0].san}.`);
      }
    }
    setBrain(p=>({...p,engine:browserEngine?"active":"fallback",source:browserEngine?"Manual analysis":"Engine fallback",note:browserEngine?`depth ${browserEngine.depth??"?"} • ${browserEngine.timeMs} ms`:"Manual analysis unavailable"}));
    const payload={fen:requestFen,openingId:repertoire.id,openingName:repertoire.name,userColor,trainingMode,eventType,selectedView:activeBoardView,moveHistory,lastMoveSan,lastMoveUci:lastMove,expectedMoves:expectedUserOptions.map(m=>({san:m.san,uci:m.uci})),opponentBookMoves:opponentBookOptions.map(m=>({san:m.san,uci:m.uci})),ratingPool:rating.target,ratingLabel:rating.label,ratingFilter,speedFilter,skill:rating.skill,clientEngine,...extra};
    setThinkingStep("brain");
    setPipelineNote(extra.skipGpt?"Manual analysis request sent.":"Sending local facts to Brain because the user requested reveal/debug.");
    const start=performance.now();
    try{
      const res=await fetch("/api/brain",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload),signal:controller.signal});
      const data=await res.json() as BrainResponse;
      if(requestSeq!==brainSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen)){setStaleOverlayIgnored(true);return null;}
      setThinkingStep("gpt-receive");
      setPipelineNote(data.annotation?.fallback?"Manual Brain response received (fallback).":"Manual Brain response received.");
      setBrainResponse(data);
      if(data.engine?.pvs?.length)setEnginePreview({fen:requestFen,pvs:data.engine.pvs,source:data.engine.source});
      const requestGame=new Chess(requestFen);
      const safeAnnotation=trainingMode==="continuation"&&requestGame.turn()===userColor&&data.engine?.pvs?.[0]
        ? engineAnnotationFromLine({fen:requestFen,line:data.engine.pvs[0],openingName:repertoire.name})
        : data.annotation;
      setAnnotation(safeAnnotation);
      setVisualReady(true);
      setThinkingStep("visual-update");
      setPipelineNote("Applied manual Brain output.");
      window.setTimeout(()=>{if(requestSeq===brainSeq.current&&normalizeFen(fenRef.current)===normalizeFen(requestFen)){setThinkingStep("ready");setPipelineNote("Manual Brain check complete.")}},250);
      setBrain(p=>({...p,engine:data.engine?.fallback?"fallback":"active",gpt:data.annotation?.fallback?"fallback":"active",latency:Math.round(performance.now()-start),source:data.annotation?.fallback?"manual brain fallback":"manual brain",note:data.pipeline?.gpt||data.annotation?.reason||"Manual reveal/debug only"}));
      return data;
    }catch(e){
      if(e instanceof Error&&e.name==="AbortError")return null;
      if(requestSeq!==brainSeq.current||normalizeFen(fenRef.current)!==normalizeFen(requestFen)){setStaleOverlayIgnored(true);return null;}
      setVisualReady(true);
      setThinkingStep("error");
      setPipelineNote(e instanceof Error?e.message:"Brain endpoint failed");
      setBrain(p=>({...p,engine:"error",gpt:"error",source:"Brain error",note:e instanceof Error?e.message:"Brain failed"}));
      return null;
    }
  }
  function resetHistory(startFen:string){setPositionHistory([startFen]);setHistoryIndex(0)}
  function resetBranchAndContinuationState(){
    setUserExplicitlyEnteredContinuation(false);
    setContinueFromHereClicked(false);
    setContinuationSessionId(null);
    setContinuationPauseClicked(false);
    setContinuationHardStopAcknowledged(false);
    setContinuationAnalysisStatus("idle");
    setLastContinuationUserMoveRating(null);
    setShowAnswer(false);
    setShowMoreShown(false);
    setCoachInteraction("none");
    setCoachHintRequestCount(0);
    setCoachReviewMarked(false);
    setCoachHiddenFrameId(null);
    setLastActionDebug(null);
    setExplorerMoves([]);
    setRuntimeCriticalIssues([]);
    setOpponentCue(null);
    setOpponentVariationDebug(null);
    setPendingOpponentRequest(null);
    setMaiaOpponentProviderStatus("disabled");
    setMaiaOpponentRequestId(null);
    setMaiaOpponentRequestFen4(null);
    setMaiaOpponentSkillLevel(null);
    setMaiaOpponentCandidateCount(0);
    setMaiaOpponentSelectedUci(null);
    setMaiaOpponentSelectedSan(null);
    setMaiaOpponentHumanLikelihood(null);
    setMaiaOpponentDecisionReason("not_requested");
    setMaiaOpponentFallbackUsed(false);
    setMaiaOpponentFallbackReason(null);
    setMaiaOpponentStaleResultIgnored(false);
    setMaiaOpponentIllegalCandidateRejected(false);
    setMaiaOpponentSelectedLegal(null);
    setMaiaOpponentRuntimeCandidateLegal(null);
    setMaiaOpponentAppliedMoveUci(null);
    setMaiaOpponentAppliedMoveSan(null);
    setMaiaOpponentAppliedFromFen4(null);
    setMaiaOpponentAppliedToFen4(null);
    setMaiaOpponentSanityGuardResult("not_run");
    setMaiaOpponentSanityGuardBlockedReason(null);
    setMaiaRuntimeMs(null);
    setMaiaRuntimeErrorReason(null);
    setMaiaApiRouteStatus("unknown");
    setMaiaTimeline([]);
    setBranchCompleteLatch({active:false,reason:null,fen4:null,lineId:null,ply:null,latchedAtFrameId:null});
    previousSelectedCandidateUciRef.current=null;
    candidateSyncDebugRef.current={
      currentSelectedCandidateUci:null,
      previousSelectedCandidateUci:null,
      staleSelectedCandidateDetected:false,
      staleSelectedCandidateCleared:false,
    };
    lockedContinuationRef.current={};
    continuationCandidateRequestSeqRef.current=0;
    continuationCandidateLockSeqRef.current=0;
    continuationCandidateLockRef.current=null;
    setContinuationCandidateLock(null);
    continuationEngineCacheRef.current={};
    maiaOpponentRequestSeqRef.current=0;
    maiaTimelineSeqRef.current=0;
  }
  function selectRepertoire(id:string){const startFen=new Chess().fen();const canonicalId=resolveStage2CanonicalOpeningId(id)??id;const nextLineSessionId=createLearningSessionId();setSelectedRepertoireId(canonicalId);setRuntimeTrainingSessionId(nextLineSessionId);refreshRuntimeTrainingLineSelection(canonicalId,recentRuntimeTrainingLineKeys,nextLineSessionId);setFen(startFen);resetHistory(startFen);setSelectedSquare(null);setPendingPromotion(null);setPromotionAuthorityDebug(null);setFeedback("Opening loaded. Play the restricted training move.");setLastMove(null);setLastMoveSan("");setLastMoveColor(null);setReviewingFen(null);resetBranchAndContinuationState();setMoveHistory([]);setTrainingMode("restricted");setTrainerPhase("ready_for_user");setBookComplete(false);clearPendingOpponentReplyRequest({clearStaleIssue:true});setAnnotation(blankAnnotation());setEnginePreview(null);setBrain(p=>({...p,book:"ready",lichess:"ready",source:"rule visual",note:"Manual reveal/debug only"}));setActiveBoardView("plan");setActiveTab("train");bumpRuntimeFrame()}
  function resetBoard(){const startFen=new Chess().fen();const nextLineSessionId=createLearningSessionId();setRuntimeTrainingSessionId(nextLineSessionId);refreshRuntimeTrainingLineSelection(selectedRepertoireId,recentRuntimeTrainingLineKeys,nextLineSessionId);setFen(startFen);resetHistory(startFen);setSelectedSquare(null);setPendingPromotion(null);setPromotionAuthorityDebug(null);setFeedback("Restarted. Find the first training move.");setLastMove(null);setLastMoveSan("");setLastMoveColor(null);setReviewingFen(null);resetBranchAndContinuationState();setMoveHistory([]);setTrainingMode("restricted");setTrainerPhase("ready_for_user");setBookComplete(false);clearPendingOpponentReplyRequest({clearStaleIssue:true});setAnnotation(blankAnnotation());setEnginePreview(null);setBrain(p=>({...p,book:"ready",lichess:"ready",source:"rule visual",note:"Manual reveal/debug only"}));setActiveTab("train");bumpRuntimeFrame()}
  function recordPosition(nextFen:string){const nextIndex=historyIndex+1;setPositionHistory(prev=>[...prev.slice(0,nextIndex),nextFen]);setHistoryIndex(nextIndex)}
  function jumpHistory(direction:-1|1){const next=Math.max(0,Math.min(positionHistory.length-1,historyIndex+direction));if(next===historyIndex)return;setHistoryIndex(next);setFen(positionHistory[next]);setSelectedSquare(null);setPendingPromotion(null);setPromotionAuthorityDebug(null);setLastMove(null);setLastMoveSan("");setLastMoveColor(null);clearPendingOpponentReplyRequest({clearStaleIssue:true});setOpponentCue(null);setOpponentVariationDebug(null);setBookComplete(false);setFeedback(next===positionHistory.length-1?"Returned to the live position.":`Reviewing previous position ${next} of ${positionHistory.length-1}. Use the arrows to return to live play.`);bumpRuntimeFrame()}
  async function playOpponentMove(request:PendingOpponentRequest){
    const liveFenRaw=fenRef.current;
    const currentRequest=pendingOpponentRequestRef.current;
    if(shouldFlagStaleOpponentReplyCommit({
      request:{requestId:request.requestId,baseFen:request.baseFen},
      currentPendingRequest:currentRequest?{requestId:currentRequest.requestId,baseFen:currentRequest.baseFen}:null,
      liveFen:liveFenRaw,
    })){
      pushRuntimeCriticalIssue("stale_opponent_reply_commit");
      return;
    }
    const current=new Chess(liveFenRaw);
    const mode:TrainingMode=request.mode;
    const currentOpeningNodes=openingTree.nodesByFen4[normalizeFen(current.fen())]??[];
    const currentOpponentBookOptions=currentOpeningNodes.flatMap((node)=>node.continuations).filter((move,index,all)=>move.color===opponentColor&&all.findIndex((candidate)=>candidate.uci===move.uci)===index).map((move)=>({
      san:move.san,
      uci:move.uci,
      color:move.color as ChessColor,
      resultingFen:move.resultingFen,
    }));
    const positionKey=normalizeFen(current.fen());
    const variationContext={openingId:repertoire.id,lineId:selectedRuntimeLineId,trainingMode:mode,positionKey};
    const memory=loadOpponentVariationMemory();
    let variationDebug:OpponentVariationDebug={
      opponentVariationApplied:false,
      opponentVariationReason:"not_applied",
      recentOpponentBranchKeys:[],
      selectedOpponentBranchKey:undefined,
      candidateOpponentBranches:[],
      blockedThirdRepeatBranches:[],
      fallbackUsed:false,
    };
    setTrainerPhase("opponent_replying");
    setOverlayClearedOnPhaseChange(true);
    setBrain(p=>({...p,source:"opponent thinking",book:mode==="restricted"?(currentOpponentBookOptions.length?"active":"complete"):"complete",lichess:"loading"}));
    await new Promise(r=>setTimeout(r,700));
    let chosen:{san:string;uci:string;fen:string}|null=null;
    let source="";
    let continuationPolicyDecision:ReturnType<typeof selectContinuedPlayMove>|null=null;
    if(mode==="restricted"){
      if(!currentOpponentBookOptions.length){
        const runtimeBookMatchesFrame=runtimeBookFrameQuery.status==="ready"&&runtimeBookFrameQuery.openingId===runtimeOpeningIdForFrame&&runtimeBookFrameQuery.playKeyBefore===runtimePlayKeyBeforeForFrame;
        const runtimeBookRestrictedCandidates=runtimeBookMatchesFrame ? runtimeBookFrameQuery.candidates : [];
        const runtimeBookRestrictedTopCandidate=runtimeBookRestrictedCandidates.find((candidate)=>continuationLegalMoveUcis.includes(candidate.uci))??null;
        const restrictedOpponentReplyAuthority=resolveRestrictedOpponentReplyAuthority({
          trainingMode:"restricted",
          currentOpponentBookOptionCount:currentOpponentBookOptions.length,
          legalMoveCount:continuationLegalMoveUcis.length,
          legalMoveUcis:continuationLegalMoveUcis,
          runtimeBookMatchesFrame,
          runtimeBookStatus:runtimeBookFrameQuery.status,
          runtimeBookBookExhausted:runtimeBookFrameQuery.bookExhausted,
          runtimeBookCandidateCount:runtimeBookRestrictedCandidates.length,
          runtimeBookOpeningId:runtimeBookFrameQuery.openingId,
          runtimeBookPlayKeyBefore:runtimeBookFrameQuery.playKeyBefore,
          currentOpeningId:selectedRepertoireId,
          currentPlayKeyBefore:runtimePlayKeyBeforeForFrame,
          runtimeBookCandidates:runtimeBookRestrictedCandidates,
          runtimeBookTopCandidate:runtimeBookRestrictedTopCandidate,
        });
        if(restrictedOpponentReplyAuthority.kind==="terminal"){
          clearPendingOpponentReplyRequest({clearStaleIssue:true});
          setTrainerPhase("terminal");
          setFeedback("Game over. Restart the opening to train again.");
          setBrain(p=>({...p,book:"complete",source:"terminal_position",lichess:"ready"}));
          return;
        }
        if(restrictedOpponentReplyAuthority.kind==="runtime_reply"&&restrictedOpponentReplyAuthority.opponentReplyAuthorityCandidateUci){
          const applied=applyUci(current.fen(),restrictedOpponentReplyAuthority.opponentReplyAuthorityCandidateUci);
          if(!applied){
            clearPendingOpponentReplyRequest({clearStaleIssue:true});
            pushRuntimeCriticalIssue("restricted_opponent_reply_missing_runtime_authority");
            setTrainerPhase("error");
            setFeedback("The runtime-backed opponent reply was legal in the catalog but could not be applied in the current position.");
            setBrain(p=>({...p,book:"complete",source:"restricted_runtime_reply_apply_failed",lichess:"ready"}));
            return;
          }
          clearPendingOpponentReplyRequest({clearStaleIssue:true});
          chosen={san:applied.san,uci:applied.uci,fen:applied.fen};
          source=`Runtime book reply (${restrictedOpponentReplyAuthority.opponentReplyAuthoritySource})`;
          variationDebug={
            ...variationDebug,
            fallbackUsed:false,
            opponentVariationApplied:true,
            opponentVariationReason:"runtime_book_reply_selected",
            selectedOpponentBranchKey:`${positionKey}::${applied.uci}`,
            candidateOpponentBranches:runtimeBookRestrictedCandidates.map((candidate)=>({
              branchKey:`${positionKey}::${candidate.uci}`,
              uci:candidate.uci,
              san:candidate.san,
              baseWeight:Number(candidate.totalGames ?? 1),
              adjustedWeight:Number(candidate.playPct ?? 0),
              source:String(candidate.sourceDetail ?? candidate.sources ?? "runtime_book"),
              safetyStatus:"runtime_book",
              selectionScore:Number(candidate.rank ?? candidate.totalGames ?? 0),
            })),
            blockedThirdRepeatBranches:[],
          };
        }else if(restrictedOpponentReplyAuthority.kind==="blocked"){
          clearPendingOpponentReplyRequest({clearStaleIssue:true});
          pushRuntimeCriticalIssue("restricted_opponent_reply_missing_runtime_authority");
          setTrainerPhase("error");
          setFeedback("No runtime-backed opponent reply is available for this frame. Select another line or reopen the opening.");
          setBrain(p=>({...p,book:"complete",source:"restricted_opponent_reply_blocked",lichess:"ready"}));
          return;
        }else{
          clearPendingOpponentReplyRequest({clearStaleIssue:true});
          pushRuntimeCriticalIssue("restricted_opponent_reply_missing_runtime_authority");
          setTrainerPhase("error");
          setFeedback("No runtime-backed opponent reply is available for this frame. Select another line or reopen the opening.");
          setBrain(p=>({...p,book:"complete",source:"restricted_opponent_reply_blocked",lichess:"ready"}));
          return;
        }
      }else{
        const explorer=await loadExplorer(current.fen());
        const valid=currentOpponentBookOptions.map(book=>{const match=explorer.find(m=>m.uci===book.uci);return{...book,weight:match?.total??1,pct:match?.pct??0,branchKey:`${positionKey}::${book.uci}`}});
        const decision=selectOpponentCandidateWithVariation({
          context:variationContext,
          memory,
          candidates:valid.map((candidate)=>({
            uci:candidate.uci,
            san:candidate.san,
            branchKey:candidate.branchKey,
            weight:candidate.weight,
            legal:true,
            supported:true,
            engineSafe:true,
            severeBlunder:false,
            source:"opening_branch",
            pct:candidate.pct,
          })),
        });
        const weighted=decision?valid.find((candidate)=>candidate.branchKey===decision.selected.branchKey)??valid[0]:pickWeighted(valid);
        variationDebug=decision?{...decision}:variationDebug;
        chosen={san:weighted.san,uci:weighted.uci,fen:weighted.resultingFen};
        source=weighted.pct?`Lichess-weighted opening branch (${weighted.pct}%)`:"Saved opening branch";
      }
    }else{
      const legalMovesVerbose=current.moves({verbose:true}) as any[];
      const legalMovesUci=legalMovesVerbose.map((move)=>moveToUci(move));
      const currentFen4=normalizeFen(current.fen());
      const maiaSkill=resolveMaiaSkillLevel({
        appDifficultyLevel:rating.label,
        continuationDifficulty:rating.target,
      });
      const defaultMaiaStatus=classifyMaiaProviderStatus({isAvailable:maiaOpponentProvider.isAvailable()});
      const maiaGate=buildMaiaOpponentReplyDecision({
        trainingMode:"continuation",
        userExplicitlyEnteredContinuation:Boolean(userExplicitlyEnteredContinuation),
        sideToMove:current.turn() as ChessColor,
        opponentColor,
        branchCompleteActive:Boolean(branchCompleteEligibleNow),
        continuationAnalysisStatus,
        continuationRuntimeStatus:continuationRuntimeState.status,
        selectedLineExhausted:Boolean(branchCompleteContract.selectedLineExhausted),
        hasUserContinuationMove:Boolean(lastContinuationUserMoveRating?.moveUci),
        terminalPosition:current.isGameOver()||legalMovesUci.length===0,
        legalMovesCount:legalMovesUci.length,
        providerStatus:defaultMaiaStatus,
        staleRequest:false,
        fallbackRequested:true,
        skillLevel:maiaSkill,
      });
      setMaiaOpponentProviderStatus(defaultMaiaStatus);
      setMaiaOpponentSkillLevel(maiaSkill);
      setMaiaOpponentDecisionReason(maiaGate.reason);
      setMaiaOpponentRequestFen4(currentFen4);
      setMaiaOpponentCandidateCount(0);
      setMaiaOpponentSelectedUci(null);
      setMaiaOpponentSelectedSan(null);
      setMaiaOpponentSelectedLegal(null);
      setMaiaOpponentRuntimeCandidateLegal(null);
      setMaiaOpponentHumanLikelihood(null);
      setMaiaOpponentStaleResultIgnored(false);
      setMaiaOpponentIllegalCandidateRejected(false);
      setMaiaOpponentAppliedMoveUci(null);
      setMaiaOpponentAppliedMoveSan(null);
      setMaiaOpponentAppliedFromFen4(null);
      setMaiaOpponentAppliedToFen4(null);
      setMaiaOpponentFallbackUsed(false);
      setMaiaOpponentFallbackReason(null);
      setMaiaOpponentSanityGuardResult("not_run");
      setMaiaOpponentSanityGuardBlockedReason(null);
      if(!maiaGate.allowed){
        pushMaiaTimelineEvent({
          event:"maia_request_blocked",
          requestId:null,
          fen4:currentFen4,
          candidateCount:0,
          selectedUci:null,
          selectedSan:null,
          reason:maiaGate.reason,
          fallbackReason:null,
          skillLevel:maiaSkill,
          sideToMove:current.turn() as ChessColor,
        });
      }
      if(maiaGate.allowed){
        const maiaRequestId=++maiaOpponentRequestSeqRef.current;
        setMaiaOpponentRequestId(maiaRequestId);
        pushMaiaTimelineEvent({
          event:"maia_request_created",
          requestId:maiaRequestId,
          fen4:currentFen4,
          candidateCount:0,
          selectedUci:null,
          selectedSan:null,
          reason:"request_created",
          fallbackReason:null,
          skillLevel:maiaSkill,
          sideToMove:current.turn() as ChessColor,
        });
        const requestPayload={
          requestId:maiaRequestId,
          fen:current.fen(),
          fen4:currentFen4,
          sideToMove:current.turn() as ChessColor,
          skillLevel:maiaSkill,
          legalMovesUci,
          maxCandidates:5,
          timeoutMs:MAIA_OPPONENT_TIMEOUT_MS,
          continuationSessionId:continuationSessionId ?? selectedRepertoireId ?? null,
        };
        const maiaTimedResult=await withMaiaTimeout<MaiaOpponentReplyResult>(
          maiaOpponentProvider.getOpponentReplies(requestPayload),
          MAIA_OPPONENT_TIMEOUT_MS,
        );
        const maiaResult:MaiaOpponentReplyResult=maiaTimedResult.ok
          ? maiaTimedResult.value
          : {
            status:"timeout",
            requestId:maiaRequestId,
            fen4:currentFen4,
            skillLevel:maiaSkill,
            candidates:[],
            selectedCandidate:null,
            errorReason:"provider_timeout",
            providerMs:MAIA_OPPONENT_TIMEOUT_MS,
          };
        setMaiaOpponentProviderStatus(maiaResult.status);
        setMaiaApiRouteStatus(maiaResult.status);
        setMaiaRuntimeMs(typeof maiaResult.providerMs==="number"?maiaResult.providerMs:null);
        setMaiaRuntimeErrorReason(maiaResult.errorReason??null);
        setMaiaOpponentCandidateCount(maiaResult.candidates.length);
        pushMaiaTimelineEvent({
          event:"maia_result_received",
          requestId:maiaRequestId,
          fen4:currentFen4,
          candidateCount:maiaResult.candidates.length,
          selectedUci:maiaResult.selectedCandidate?.uci ?? null,
          selectedSan:maiaResult.selectedCandidate?.san ?? null,
          reason:maiaResult.status,
          fallbackReason:maiaResult.errorReason ?? null,
          skillLevel:maiaSkill,
          sideToMove:current.turn() as ChessColor,
        });
        const maiaResultIsStale=Boolean(
          maiaRequestId!==maiaOpponentRequestSeqRef.current||
          maiaResult.requestId!==maiaRequestId||
          normalizeFen(fenRef.current)!==currentFen4||
          shouldFlagStaleOpponentReplyCommit({
            request:{requestId:request.requestId,baseFen:request.baseFen},
            currentPendingRequest:pendingOpponentRequestRef.current?{requestId:pendingOpponentRequestRef.current.requestId,baseFen:pendingOpponentRequestRef.current.baseFen}:null,
            liveFen:fenRef.current,
          }),
        );
        if(maiaResultIsStale){
          setMaiaOpponentStaleResultIgnored(true);
          setMaiaOpponentFallbackUsed(true);
          setMaiaOpponentFallbackReason("stale_request");
          pushMaiaTimelineEvent({
            event:"maia_result_stale_ignored",
            requestId:maiaRequestId,
            fen4:currentFen4,
            candidateCount:maiaResult.candidates.length,
            selectedUci:null,
            selectedSan:null,
            reason:"stale_request",
            fallbackReason:"stale_request",
            skillLevel:maiaSkill,
            sideToMove:current.turn() as ChessColor,
          });
        }else{
          const selectedMaiaCandidate=selectMaiaOpponentReply(maiaResult,legalMovesUci);
          const selectedUci=selectedMaiaCandidate?.uci ?? null;
          const selectedSan=selectedMaiaCandidate?.san ?? null;
          setMaiaOpponentSelectedUci(selectedUci);
          setMaiaOpponentSelectedSan(selectedSan ?? null);
          setMaiaOpponentHumanLikelihood(selectedMaiaCandidate?.humanLikelihood ?? null);
          if(selectedMaiaCandidate){
            const legality=applyMaiaMoveOnRequestFen({
              requestFen:current.fen(),
              selectedUci:selectedMaiaCandidate.uci,
              legalMovesUci,
            });
            setMaiaOpponentSelectedLegal(legality.legalOnRequestFen);
            setMaiaOpponentRuntimeCandidateLegal(legality.legalOnRequestFen);
            if(!legality.legalOnRequestFen||!legality.applied||!legality.appliedMoveUci||!legality.appliedMoveSan||!legality.appliedFen){
              setMaiaOpponentIllegalCandidateRejected(true);
              setMaiaOpponentFallbackUsed(true);
              setMaiaOpponentFallbackReason("maia_candidate_illegal");
              pushMaiaTimelineEvent({
                event:"maia_candidate_rejected_illegal",
                requestId:maiaRequestId,
                fen4:currentFen4,
                candidateCount:maiaResult.candidates.length,
                selectedUci:selectedMaiaCandidate.uci,
                selectedSan:selectedMaiaCandidate.san ?? null,
                reason:"maia_candidate_illegal",
                fallbackReason:"maia_candidate_illegal",
                skillLevel:maiaSkill,
                sideToMove:current.turn() as ChessColor,
              });
            }else{
              const sanityGuard=evaluateMaiaSanityGuard({
                enabled:MAIA_OPPONENT_REPLY_SANITY_GUARD_ENABLED,
                cpLoss:null,
                maxAllowedCpLoss:MAIA_MAX_ALLOWED_OPPONENT_CP_LOSS,
              });
              setMaiaOpponentSanityGuardResult(sanityGuard.result);
              setMaiaOpponentSanityGuardBlockedReason(sanityGuard.blockedReason);
              if(!sanityGuard.allowed){
                setMaiaOpponentFallbackUsed(true);
                setMaiaOpponentFallbackReason(sanityGuard.blockedReason ?? "maia_sanity_guard_rejected_candidate");
                pushMaiaTimelineEvent({
                  event:"maia_candidate_rejected_sanity_guard",
                  requestId:maiaRequestId,
                  fen4:currentFen4,
                  candidateCount:maiaResult.candidates.length,
                  selectedUci:legality.appliedMoveUci,
                  selectedSan:legality.appliedMoveSan,
                  reason:sanityGuard.result,
                  fallbackReason:sanityGuard.blockedReason,
                  skillLevel:maiaSkill,
                  sideToMove:current.turn() as ChessColor,
                });
              }else{
                chosen={san:legality.appliedMoveSan,uci:legality.appliedMoveUci,fen:legality.appliedFen};
                source="Continuation reply";
                variationDebug.opponentVariationReason="maia_candidate_selected";
                setMaiaOpponentDecisionReason("allowed");
                setMaiaOpponentAppliedMoveUci(legality.appliedMoveUci);
                setMaiaOpponentAppliedMoveSan(legality.appliedMoveSan);
                setMaiaOpponentAppliedFromFen4(legality.appliedFromFen4);
                setMaiaOpponentAppliedToFen4(legality.appliedToFen4);
                pushMaiaTimelineEvent({
                  event:"maia_candidate_selected",
                  requestId:maiaRequestId,
                  fen4:currentFen4,
                  candidateCount:maiaResult.candidates.length,
                  selectedUci:legality.appliedMoveUci,
                  selectedSan:legality.appliedMoveSan,
                  reason:"maia_candidate_selected",
                  fallbackReason:null,
                  skillLevel:maiaSkill,
                  sideToMove:current.turn() as ChessColor,
                });
              }
            }
          }else{
            setMaiaOpponentSelectedLegal(null);
            setMaiaOpponentRuntimeCandidateLegal(null);
            const fallbackReason=maiaResult.status==="timeout"
              ?"provider_timeout"
              :maiaResult.status==="unavailable"
                ?"provider_unavailable"
                :"no_legal_candidate";
            setMaiaOpponentFallbackUsed(true);
            setMaiaOpponentFallbackReason(fallbackReason);
            pushMaiaTimelineEvent({
              event:"maia_fallback_used",
              requestId:maiaRequestId,
              fen4:currentFen4,
              candidateCount:maiaResult.candidates.length,
              selectedUci:null,
              selectedSan:null,
              reason:"fallback_used",
              fallbackReason,
              skillLevel:maiaSkill,
              sideToMove:current.turn() as ChessColor,
            });
          }
        }
      }
      if(!chosen){
        const explorer=await loadExplorer(current.fen());
        const playable=explorer.map(m=>{const a=applyUci(current.fen(),m.uci);return a?{...a,weight:m.total,pct:m.pct,branchKey:`${positionKey}::${m.uci}`}:null}).filter(Boolean) as Array<{san:string;uci:string;fen:string;weight:number;pct:number;branchKey:string}>;
        const policyEngine=(engineLines.length?{source:"engine_preview",pvs:engineLines}:await runBrowserStockfish(current.fen(),rating.skill,550,3));
        const bestCp=typeof policyEngine?.pvs?.[0]?.cp==="number"?Number(policyEngine.pvs[0].cp):undefined;
        const safeUcis=new Set<string>(
          (policyEngine?.pvs??[])
            .filter((line,index)=>{
              if(index===0)return true;
              if(bestCp===undefined||typeof line.cp!=="number")return false;
              return Math.abs(bestCp-Number(line.cp))<=100;
            })
            .map((line)=>line.uci),
        );
        if(playable.length){
          const decision=selectOpponentCandidateWithVariation({
            context:variationContext,
            memory,
            candidates:playable.map((candidate)=>({
              uci:candidate.uci,
              san:candidate.san,
              branchKey:candidate.branchKey,
              weight:candidate.weight,
              legal:true,
              supported:true,
              engineSafe:safeUcis.has(candidate.uci),
              severeBlunder:false,
              source:"lichess_continuation",
              pct:candidate.pct,
            })),
          });
          const policy=selectContinuedPlayMove({
            fen:current.fen(),
            lichessCandidates:playable.map((candidate)=>({
              uci:candidate.uci,
              san:candidate.san,
              source:"lichess",
              pct:candidate.pct,
              weight:candidate.weight,
              engineSafe:safeUcis.has(candidate.uci),
              supported:true,
            })),
            engineTop:policyEngine?.pvs?.[0]?{uci:policyEngine.pvs[0].uci,san:policyEngine.pvs[0].san,source:"engine",engineSafe:true,supported:true}:null,
          });
          continuationPolicyDecision=policy;
          const preferredUci=policy?.selectedUci??(decision?playable.find((candidate)=>candidate.branchKey===decision.selected.branchKey)?.uci:undefined);
          const pick=playable.find((candidate)=>candidate.uci===preferredUci)??(decision?playable.find((candidate)=>candidate.branchKey===decision.selected.branchKey)??playable[0]:pickWeighted(playable));
          variationDebug=decision?{...decision}:variationDebug;
          chosen=pick;
          source=
            policy?.source==="lichess_engine_validated"
              ? `Lichess continuation (${pick.pct}%)`
              : policy?.source==="human_continuation_unverified"
                ? "Lichess continuation"
                : policy?.source==="engine_top"
                  ? `Engine continuation (${rating.target})`
                  : `Lichess continuation (${pick.pct}%)`;
          variationDebug.opponentVariationReason=policy?.reason??variationDebug.opponentVariationReason;
        }
        else{
          const policy=selectContinuedPlayMove({
            fen:current.fen(),
            engineTop:policyEngine?.pvs?.[0]?{uci:policyEngine.pvs[0].uci,san:policyEngine.pvs[0].san,source:"engine",engineSafe:true,supported:true}:null,
          });
          continuationPolicyDecision=policy;
          if(policy?.selectedUci){
            const a=applyUci(current.fen(),policy.selectedUci);
            if(a){
              chosen=a;
              source=policy.source==="emergency_legal_fallback"?"Emergency legal fallback":`Engine continuation (${rating.target})`;
              variationDebug.opponentVariationReason=policy.reason;
            }
          }
          if(!chosen){
            const data=await runBrain("bot_select",{skipGpt:true});
            const top=data?.engine?.pvs?.[0];
            const a=top?applyUci(current.fen(),top.uci):null;
            if(a){chosen=a;source=`Engine continuation (${rating.target})`;}
          }
        }
      }
    }
    if(!chosen){
      const emergency=selectContinuedPlayMove({fen:current.fen()});
      continuationPolicyDecision=emergency;
      if(emergency?.selectedUci){
        const a=applyUci(current.fen(),emergency.selectedUci);
        if(a){
          chosen={san:a.san,uci:a.uci,fen:a.fen};
          source="Emergency legal fallback";
          variationDebug.fallbackUsed=true;
          variationDebug.opponentVariationReason=emergency.reason;
        }
      }
      if(!chosen){
        const legal=current.moves({verbose:true}) as any[];
        if(!legal.length){
          clearPendingOpponentReplyRequest({clearStaleIssue:true});
          setTrainerPhase("terminal");
          return;
        }
        const move=legal[0];
        current.move({from:move.from,to:move.to,promotion:move.promotion??undefined});
        chosen={san:move.san,uci:moveToUci(move),fen:current.fen()};
        source="Emergency legal fallback";
        variationDebug.fallbackUsed=true;
        variationDebug.opponentVariationReason="no_supported_alternative";
      }
    }
    const requestAfterCompute=pendingOpponentRequestRef.current;
    if(shouldFlagStaleOpponentReplyCommit({
      request:{requestId:request.requestId,baseFen:request.baseFen},
      currentPendingRequest:requestAfterCompute?{requestId:requestAfterCompute.requestId,baseFen:requestAfterCompute.baseFen}:null,
      liveFen:fenRef.current,
    })){
      pushRuntimeCriticalIssue("stale_opponent_reply_commit");
      return;
    }
    const selectedBranchKey=`${positionKey}::${chosen.uci}`;
    variationDebug.selectedOpponentBranchKey=selectedBranchKey;
    if(continuationPolicyDecision?.debug){
      variationDebug.candidateOpponentBranches=continuationPolicyDecision.debug.candidates.map((candidate)=>({
        branchKey:`${positionKey}::${candidate.moveUci}`,
        uci:candidate.moveUci,
        san:candidate.moveSan,
        baseWeight:candidate.selectionScore,
        adjustedWeight:candidate.selectionScore,
        source:candidate.source,
        safetyStatus:candidate.safetyStatus,
        selectionScore:candidate.selectionScore,
        blockedReason:candidate.blockedReason,
      }));
      variationDebug.continuedPlaySelectedMoveInCandidateList=continuationPolicyDecision.debug.selectedMoveInCandidateList;
      variationDebug.continuedPlaySelectionConsistency=continuationPolicyDecision.debug.selectionConsistency;
      variationDebug.continuationMoveSafetySource=continuationPolicyDecision.debug.continuationMoveSafetySource;
      if(!continuationPolicyDecision.debug.selectedMoveInCandidateList){
        variationDebug.opponentVariationReason="selection_inconsistent_with_candidates";
      }
    }
    if(!variationDebug.opponentVariationReason||variationDebug.opponentVariationReason==="not_applied"){
      const recent=variationDebug.recentOpponentBranchKeys;
      if(recent.length>=2&&recent[0]===selectedBranchKey&&recent[1]===selectedBranchKey)variationDebug.opponentVariationReason="no_supported_alternative";
      else if(recent[0]===selectedBranchKey)variationDebug.opponentVariationReason="allowed_repeat_not_third_consecutive";
      else variationDebug.opponentVariationReason="normal_weighted_selection";
    }
    const variationNote=
      variationDebug.opponentVariationApplied
        ? `Variation: avoided third repeat (${variationDebug.blockedThirdRepeatBranches.join(", ")}).`
        : variationDebug.opponentVariationReason==="allowed_repeat_not_third_consecutive"
          ? "Variation: allowed repeat, not third consecutive."
          : variationDebug.opponentVariationReason==="no_supported_alternative"
            ? "Variation: no supported alternative."
            : "Variation: normal weighted selection.";
    recordOpponentChoice({
      openingId:repertoire.id,
      lineId:selectedRuntimeLineId,
      trainingMode:mode,
      positionKey,
      opponentMoveUci:chosen.uci,
      opponentMoveSan:chosen.san,
      branchKey:selectedBranchKey,
      source,
      playedAt:Date.now(),
    });
    if(mode==="continuation"){
      pushMaiaTimelineEvent({
        event:"maia_opponent_move_applied",
        requestId:maiaOpponentRequestId,
        fen4:positionKey,
        candidateCount:maiaOpponentCandidateCount,
        selectedUci:chosen.uci,
        selectedSan:chosen.san,
        reason:source==="Continuation reply"?"maia_candidate_selected":"fallback_or_existing_policy",
        fallbackReason:source==="Continuation reply"?null:(maiaOpponentFallbackReason ?? null),
        skillLevel:maiaOpponentSkillLevel,
        sideToMove:opponentColor,
      });
    }
    setOpponentVariationDebug(variationDebug);
    const next=new Chess(chosen.fen);
    const nextPhase:OverlayPhase=next.isGameOver()?"terminal":(next.turn()===userColor?"ready_for_user":"opponent_selecting");
    commitRuntimeFrame({nextFen:chosen.fen,nextPhase,recordHistory:true,clearPendingOpponentRequest:true});
    clearRuntimeCriticalIssue("stale_opponent_reply_commit");
    setLastMove(chosen.uci);setLastMoveSan(chosen.san);setLastMoveColor(opponentColor);setMoveHistory(prev=>[...prev,chosen.san]);setSelectedSquare(null);setShowAnswer(false);setOpponentCue(boardSettings.showOpponentCue?{expiresAt:Date.now()+2500,title:`Opponent: ${chosen.san}`,message:"Brief opponent cue. Your selected user-side view stays visible after this fades.",lines:[{from:chosen.uci.slice(0,2),to:chosen.uci.slice(2,4),kind:"opponent",label:chosen.san}],cues:[{square:chosen.uci.slice(2,4),kind:"opponent"}],committed:true,fen:normalizeFen(chosen.fen)}:null);setFeedback(`Opponent played ${chosen.san}. Source: ${source}. ${variationNote}`);setBrain(p=>({...p,source,lichess:source.includes("Lichess")?"active":p.lichess,note:variationNote}))
  }
  function handleTrainerViewChange(nextTrainerView:TrainerView){
    if(nextTrainerView===trainerView)return;
    setTrainerView(nextTrainerView);
    trackLearningEvent({
      type:"trainer_view_changed",
      source:"train",
      metadata:{nextTrainerView},
    });
  }
  function handleReveal(){
    const before=currentDebugActionState();
    if(!phaseActionGate.revealButtonVisible){
      recordDebugAction({action:"reveal_next_move",normalizedAction:"reveal_next_move",before,after:before,result:"blocked",reason:coachHiddenForFrame?"coach_hidden":phaseActionGate.blockedReason??"no_revealable_move",extra:{revealBlockedBecauseCoachHidden:coachHiddenForFrame,revealTargetUci:instructionTarget?.uci??null,revealTargetSource:instructionTarget?"instruction_target":"none"}});
      return;
    }
    if(showAnswer){
      recordDebugAction({action:"reveal_next_move",normalizedAction:"reveal_next_move",before,after:before,result:"no_op",reason:"reveal_idempotent",extra:{revealIdempotentNoop:true,revealTargetUci:instructionTarget?.uci??null,revealTargetSource:instructionTarget?"instruction_target":"none"}});
      return;
    }
    const after={...before,answerShown:true,showAnswer:true,coachInteraction:coachInteraction==="none"?"answer":coachInteraction};
    if(coachHiddenForFrame)setCoachHiddenFrameId(null);
    setShowAnswer(true);
    recordDebugAction({action:"reveal_next_move",normalizedAction:"reveal_next_move",before,after,result:"handled",reason:"manual_reveal_button",extra:{revealTargetUci:instructionTarget?.uci??null,revealTargetSource:instructionTarget?"instruction_target":"none"}});
    trackLearningEvent({
      type:"cue_revealed",
      source:"train",
      expectedMoveSan:instructionTarget?.san,
      expectedMoveUci:instructionTarget?.uci,
    });
    void runBrain("reveal");
  }
  function continueVsBot(){
    const current=new Chess(fen);
    const legal=current.moves().length;
    const terminal=current.isGameOver()||legal===0;
    const nextContinuationSessionId=continuationSessionId??createLearningSessionId();
    setUserExplicitlyEnteredContinuation(true);
    setContinueFromHereClicked(true);
    setContinuationPauseClicked(true);
    setContinuationSessionId(nextContinuationSessionId);
    if(currentPlyCount>=22){
      setContinuationHardStopAcknowledged(true);
    }
    setTrainingMode("continuation");
    setBookComplete(false);
    setBranchCompleteLatch({active:false,reason:null,fen4:null,lineId:null,ply:null,latchedAtFrameId:null});
    clearPendingOpponentReplyRequest({clearStaleIssue:true});
    setEnginePreview(null);
    setMaiaOpponentProviderStatus("loading");
    setMaiaApiRouteStatus("loading");
    if(terminal){
      setContinuationAnalysisStatus("terminal");
      setTrainerPhase("terminal");
      setFeedback("Line complete. Restart the line or review the pattern.");
      setBrain(p=>({...p,source:"continuation terminal",book:"complete",note:"No legal continuation exists."}));
      trackLearningEvent({type:"cue_revealed",source:"train",fen,metadata:{eventType:"continuation_terminal",lastUserMoveSan:lastMoveSan,lastUserMoveUci:lastMove,terminalReason:current.isCheckmate?.()?"checkmate":"no_legal_moves"}});
      return;
    }
    if(current.turn()!==userColor){
      setContinuationAnalysisStatus("opponent_replying");
      setTrainerPhase("opponent_replying");
      setFeedback("Continuation mode active. Opponent is choosing a reply.");
      setBrain(p=>({...p,source:"continuation mode",book:"complete"}));
      scheduleOpponentReply({mode:"continuation",delayMs:250,baseFen:current.fen()});
      return;
    }
    continuationCandidateRequestSeqRef.current+=1;
    setContinuationCandidateLock(null);
    setContinuationAnalysisStatus("analyzing");
    setTrainerPhase("ready_for_user");
    setFeedback(`Continuation mode active. Blundr is selecting a continuation at ${rating.target}.`);
    setBrain(p=>({...p,source:"continuation mode",book:"complete"}));
  }
  function continueFromHere(){setCoachInteraction("show_plan");continueVsBot()}
  function handleSquareTap(square:string){
    if(bookComplete)return;
    visualRecipePlayback.consumeSkipOnInteraction();
    if(endingInfo){setFeedback("Game over. Restart the opening to continue.");return}
    if(isReviewingHistory){setFeedback("You are reviewing an older position. Use the forward arrow to return to the live board before moving.");return}
    if(!isUserTurn){setFeedback("Opponent is thinking. Wait for your turn.");return}
    if(!selectedSquare){if(isOwnPiece(game,square,userColor)){setSelectedSquare(square);setFeedback(`Selected ${square}. Legal destinations are highlighted.`)}else setFeedback("Tap one of your pieces first.");return}
    if(square===selectedSquare){setSelectedSquare(null);setFeedback("Selection cleared.");return}
    if(isOwnPiece(game,square,userColor)){setSelectedSquare(square);setFeedback(`Selected ${square}. Legal destinations are highlighted.`);return}
    void attemptMove(selectedSquare,square)
  }
  function logMistake(positionFen:string,expected:string,played:string){const k=normalizeFen(positionFen);setProgress(prev=>{const old=prev.mistakes[k];return{...prev,attempts:prev.attempts+1,incorrect:prev.incorrect+1,streak:0,mistakes:{...prev.mistakes,[k]:{fen:positionFen,expectedMove:expected,playedMove:played,count:old?old.count+1:1,opening:repertoire.name,repertoireId:repertoire.id}}}})}
  async function attemptMove(from:string,to:string,promotionPiece?:PromotionPiece | null){
    const current=new Chess(fen);
    const beforeFen=fen;
    const currentKey=normalizeFen(current.fen());
    const timeToMoveMs=Math.max(0,Date.now()-positionStartedAtRef.current);
    const promotionAttempt = promotionPiece ? null : getPendingPromotionFromAttempt({ fen: beforeFen, from, to, color: userColor });
    if (promotionAttempt) {
      setPendingPromotion(promotionAttempt);
      setPromotionAuthorityDebug(null);
      setFeedback("Choose a promotion piece.");
      return;
    }
    let legal:any=null;
    try{
      const moveInput: { from: string; to: string; promotion?: PromotionPiece } = { from, to };
      if (promotionPiece) moveInput.promotion = promotionPiece;
      legal=current.move(moveInput);
    }catch{}
    setSelectedSquare(null);
    setPendingPromotion(null);
    if(!legal){
      setPromotionAuthorityDebug(null);
      setFeedback(promotionPiece ? "Illegal promotion move. Try another piece." : "Illegal move. Try another move.");
      return;
    }
    const playedUci=moveToUci(legal);
    if (promotionPiece) {
      const promotionAuthorityResult=resolvePromotionAuthority({
        attemptedPromotionUci: playedUci,
        authorityPromotionUci: expectedUserOptions[0]?.uci ?? instructionTarget?.uci ?? null,
      });
      setPromotionAuthorityDebug({
        frameId: trainerFrameId,
        ...promotionAuthorityResult,
        acceptedPromotionUci: promotionAuthorityResult.promotionAuthorityMatched ? playedUci : null,
      });
    }
    if(trainingMode==="continuation"){
      let ratingSource=mapEngineLinesToStockfishTopMoves({
        fen:beforeFen,
        pvs:engineLines.map((line)=>({uci:line.uci,san:line.san,cp:line.cp})),
        depth:10,
        multipv:USER_MOVE_RATING_MULTIPV,
        providerStatus:engineLines.length?"ready":"unavailable",
      });
      if(ratingSource.providerStatus!=="ready"){
        const runtimeEval=await runBrowserStockfish(beforeFen,rating.skill,700,USER_MOVE_RATING_MULTIPV);
        ratingSource=mapEngineLinesToStockfishTopMoves({
          fen:beforeFen,
          pvs:(runtimeEval?.pvs ?? []).map((line)=>({uci:line.uci,san:line.san,cp:line.cp})),
          depth:runtimeEval?.depth ?? 10,
          multipv:USER_MOVE_RATING_MULTIPV,
          providerStatus:runtimeEval?.pvs?.length?"ready":"unavailable",
          errorReason:runtimeEval?.pvs?.length?undefined:"stockfish_provider_unavailable",
        });
      }
      const userMoveFoundInTopMoves=ratingSource.topMoves.some((move)=>move.uci===playedUci);
      let directAfterMoveEvaluation:{
        providerStatus:"ready"|"loading"|"unavailable"|"error";
        centipawnsFromMoverPerspective?:number|null;
        centipawnsFromSideToMove?:number|null;
        depth?:number|null;
        timeout?:boolean;
      }|undefined=undefined;
      if(!userMoveFoundInTopMoves&&ratingSource.providerStatus==="ready"){
        try{
          const afterEval=await runBrowserStockfish(current.fen(),rating.skill,650,1);
          const cpFromSideToMove=typeof afterEval?.pvs?.[0]?.cp==="number"?Number(afterEval.pvs[0].cp):null;
          directAfterMoveEvaluation={
            providerStatus:afterEval?.pvs?.length?"ready":"unavailable",
            centipawnsFromMoverPerspective:cpFromSideToMove===null?null:-cpFromSideToMove,
            centipawnsFromSideToMove:cpFromSideToMove,
            depth:afterEval?.depth ?? null,
            timeout:false,
          };
        }catch{
          directAfterMoveEvaluation={
            providerStatus:"error",
            centipawnsFromMoverPerspective:null,
            centipawnsFromSideToMove:null,
            depth:null,
            timeout:true,
          };
        }
      }
      const strength=rateContinuationUserMove({
        userMoveUci:playedUci,
        userMoveSan:legal.san,
        stockfish:ratingSource,
        legal:true,
        stale:false,
        directAfterMoveEvaluation,
        geniusMotifs:{
          givesCheckmate:Boolean(legal.san?.includes("#")),
          createsForcedMate:Boolean(legal.san?.includes("#")),
          winsMajorMaterial:Boolean(legal.captured && ["q","r"].includes(String(legal.captured))),
        },
      });
      setLastContinuationUserMoveRating({
        moveUci:playedUci,
        moveSan:legal.san,
        pieceType:String(legal.piece ?? ""),
        ratingLabel:strength.label,
        severity:strength.severity,
        centipawnLoss:strength.centipawnLoss,
        rank:strength.rank,
        bestMoveUci:ratingSource.bestMoveUci,
        bestMoveSan:ratingSource.bestMoveSan,
        depth:strength.depth,
        reason:strength.reason,
        evaluatedFenBeforeMove:normalizeFen(beforeFen),
        providerStatus:strength.providerStatus,
        createdAtFrameId:trainerFrameId,
        visibleBadgeLabel:strength.visibleBadgeLabel,
        badgeVisible:strength.badgeVisible,
        badgeSuppressedReason:strength.badgeSuppressedReason,
        ratingMethod:strength.ratingMethod,
        userMoveFoundInTopMoves:strength.userMoveFoundInTopMoves,
        userMoveRank:strength.userMoveRank,
        bestEvalCp:strength.bestEvalCp,
        userEvalCp:strength.userEvalCp,
        mateBefore:strength.mateBefore,
        mateAfter:strength.mateAfter,
        normalizedForMoverColor:strength.normalizedForMoverColor,
        legal:strength.legal,
        stale:strength.stale,
        confidence:strength.confidence,
        isUserFacing:strength.isUserFacing,
        label:strength.label,
        debug:strength.debug,
      });
    }else{
      setLastContinuationUserMoveRating(null);
    }
    const expectedMove=expectedUserOptions[0];
    if(trainingMode==="restricted"){
      const correct=expectedUserOptions.some(m=>m.uci===playedUci);
      if(!correct){
        const expected=expectedMove?.san??"No saved move";
        logMistake(beforeFen,expected,legal.san);
        setShowAnswer(true);
        setCoachReviewMarked(true);
        if(isMoveQualityVerified(moveQuality)){
          setFeedback(`Not quite. ${legal.san} is legal, but this drill is looking for ${expected}. Blundr Brain validated this pattern.`);
        }else if(moveQuality?.status==="rejected"||moveQuality?.status==="unavailable"){
          setFeedback(`Not quite. ${legal.san} is legal, but this saved line needs review before Blundr teaches it as a pattern.`);
        }else{
          setFeedback(`Not quite. ${legal.san} is legal, but this drill is looking for the saved line move.`);
        }
        trackLearningEvent({
          type:"move_incorrect",
          source:"train",
          fen:beforeFen,
          expectedMoveSan:expectedMove?.san,
          expectedMoveUci:expectedMove?.uci,
          playedMoveSan:legal.san,
          playedMoveUci:playedUci,
          correct:false,
          timeToMoveMs,
        });
        return;
      }
    }
    const nextFen=current.fen();
    const nextGame=new Chess(nextFen);
    const nextIsUserTurn=nextGame.turn()===userColor;
    const nextExpectedMoveResolution=resolveExpectedMoveForFrame({
      openingTree,
      fen:nextFen,
      trainerPhase:nextGame.isGameOver()?"terminal":(nextIsUserTurn?"ready_for_user":"opponent_replying"),
      trainingMode,
      trainerView,
      isUserTurn:nextIsUserTurn,
      userColor,
      opponentColor,
      lastOpponentMoveUci:lastMoveColor===opponentColor?lastMove:null,
      lastOpponentMoveSan:lastMoveColor===opponentColor?lastMoveSan:null,
      legacyExpectedMoveCandidate:null,
      enginePreview:null,
      allowEngineFallbackInRestricted:false,
    });
    const nextLineCompleteConfirmed=(nextExpectedMoveResolution.lineLength??0)>0&&(nextExpectedMoveResolution.lineCursor??0)>=(nextExpectedMoveResolution.lineLength??0);
    const nextExactOpeningNodes=openingTree.nodesByFen4[normalizeFen(nextFen)]??[];
    const nextExactSelectedLineNodes=nextExactOpeningNodes.filter((node)=>node.lineId===selectedRuntimeLineId);
    const nextExactNodeHasChildren=nextExactSelectedLineNodes.length?nextExactSelectedLineNodes.some((node)=>node.continuations.length>0):"unknown";
    const nextHasNextOpponentMove=nextExactSelectedLineNodes.length?nextExactSelectedLineNodes.some((node)=>node.continuations.some((move)=>move.color===opponentColor)):"unknown";
    const nextHasNextUserMove=nextExactSelectedLineNodes.length?nextExactSelectedLineNodes.some((node)=>node.continuations.some((move)=>move.color===userColor)):"unknown";
    const nextExplicitCuratedTerminalNode=nextExactSelectedLineNodes.some((node)=>node.terminal&&node.sideToMove===nextGame.turn());
    const nextRuntimePlayKeyBefore=buildRuntimePlayKeyBeforeFromSanHistory([...moveHistory,legal.san])??null;
    const nextRuntimeLineCurrentPly=moveHistory.length+1;
    const nextRuntimeLineExhausted=selectedRuntimeLinePlyLength>0&&nextRuntimeLineCurrentPly>=selectedRuntimeLinePlyLength;
    const nextSelectedLineConfirmedComplete=Boolean(
      (selectedRuntimeLinePlyLength>0 ? nextRuntimeLineExhausted : nextLineCompleteConfirmed) &&
      nextExactNodeHasChildren===false
    );
    const nextRestrictedRuntimeBookExhaustedOnOpponentTurnAfterUserMove=Boolean(
      trainingMode==="restricted"&&
      !userExplicitlyEnteredContinuation&&
      !nextIsUserTurn&&
      legal.color===userColor&&
      playedUci&&
      nextExactSelectedLineNodes.length>0&&
      nextHasNextOpponentMove===false
    );
    const nextRestrictedRuntimeBookExhaustedEligibleForBranchComplete=Boolean(
      nextRestrictedRuntimeBookExhaustedOnOpponentTurnAfterUserMove&&
      (
        nextExplicitCuratedTerminalNode ||
        nextSelectedLineConfirmedComplete
      )
    );
    const nextBranchCompleteContract=resolveBranchCompleteContract({
      trainingMode,
      trainerPhase:nextGame.isGameOver()?"terminal":(nextIsUserTurn?"ready_for_user":"opponent_replying"),
      isUserTurn:nextIsUserTurn,
      userExplicitlyEnteredContinuation,
      isTerminal:nextGame.isGameOver()||nextGame.moves().length===0,
      hasInstructionTarget:Boolean(nextExpectedMoveResolution.expectedMoveUci),
      hasContinuationCandidate:false,
      pendingOpponentRequestExists:false,
      expectedMoveSource:nextExpectedMoveResolution.source,
      expectedMoveReason:nextExpectedMoveResolution.reason,
      expectedMoveUci:nextExpectedMoveResolution.expectedMoveUci,
      lineExhaustedByCursor:nextSelectedLineConfirmedComplete||nextRestrictedRuntimeBookExhaustedEligibleForBranchComplete,
      lineExhaustedByLichess:false,
      afterFinalUserMove:!nextIsUserTurn&&legal.color===userColor,
      selectedLineId:selectedRuntimeLineId,
      fen4:normalizeFen(nextFen),
      lastUserMoveUci:legal.color===userColor?playedUci:null,
      lastUserMoveSan:legal.color===userColor?legal.san:null,
      exactNodeHasChildren:nextExactNodeHasChildren,
      hasNextOpponentMove:nextHasNextOpponentMove,
      hasNextUserMove:nextHasNextUserMove,
      explicitCuratedTerminalNode:nextExplicitCuratedTerminalNode,
      validBranchCompleteLatch:false,
    });
    const nextTerminalProof=resolveStage2TerminalProof({
      trainingMode,
      isUserTurn:nextIsUserTurn,
      userExplicitlyEnteredContinuation,
      selectedOpeningId:canonicalSelectedRepertoireId,
      selectedLineId:selectedRuntimeLineId,
      runtimeOpeningId:runtimeOpeningIdForFrame,
      selectedOpeningRuntimeAvailable:Boolean(selectedOpeningAvailability?.runtimeAvailable),
      fen4:normalizeFen(nextFen),
      lastUserMoveUci:legal.color===userColor?playedUci:null,
      lastUserMoveSan:legal.color===userColor?legal.san:null,
      afterFinalUserMove:!nextIsUserTurn&&legal.color===userColor,
      explicitCuratedTerminalNode:nextExplicitCuratedTerminalNode,
      selectedLineCompleteConfirmed:nextSelectedLineConfirmedComplete,
      exactNodeHasChildren:nextExactNodeHasChildren,
      hasNextOpponentMove:nextHasNextOpponentMove,
      hasNextUserMove:nextHasNextUserMove,
      validBranchCompleteLatch:false,
      bookCompleteAllowed:Boolean(nextSelectedLineConfirmedComplete||nextExplicitCuratedTerminalNode),
      guidedCompleteAllowed:Boolean(nextSelectedLineConfirmedComplete||nextExplicitCuratedTerminalNode),
      runtimeBookBookExhausted:false,
      runtimeBookCandidateCount:0,
      runtimeBookStatus:null,
    });
    const nextBranchCompleteEligible=Boolean(nextBranchCompleteContract.branchCompleteEligible&&nextTerminalProof.proven);
    const needsOpponentReply=!nextGame.isGameOver()&&nextGame.turn()!==userColor&&!nextBranchCompleteEligible;
    commitRuntimeFrame({
      nextFen,
      nextPhase:nextGame.isGameOver()?"terminal":(needsOpponentReply?"opponent_selecting":"ready_for_user"),
      recordHistory:true,
      clearPendingOpponentRequest:!needsOpponentReply,
    });
    setCoachInteraction("none");
    setLastMove(playedUci);
    setLastMoveSan(legal.san);
    setLastMoveColor(userColor);
    setMoveHistory(prev=>[...prev,legal.san]);
    setOpponentCue(null);
    setOpponentVariationDebug(null);
    setShowAnswer(false);
    if(nextBranchCompleteEligible){
      setBranchCompleteLatch({
        active:true,
        reason:nextTerminalProof.reason??nextBranchCompleteContract.reason??"line_complete",
        fen4:normalizeFen(nextFen),
        lineId:selectedRuntimeLineId,
        ply:moveHistory.length+1,
        latchedAtFrameId:trainerFrameId+1,
      });
    }
    setFeedback(trainingMode==="restricted"?`Correct: ${legal.san}.`:`Played ${legal.san}. Move will be evaluated.`);
    if(needsOpponentReply){
      scheduleOpponentReply({mode:trainingMode,delayMs:350,baseFen:nextFen});
    }
    setProgress(prev=>{
      const next={...prev.mistakes};
      if(reviewingFen&&next[reviewingFen]){
        if(next[reviewingFen].count<=1)delete next[reviewingFen];
        else next[reviewingFen]={...next[reviewingFen],count:next[reviewingFen].count-1};
      }
      return{...prev,attempts:prev.attempts+1,correct:prev.correct+1,streak:prev.streak+1,trainedPositions:{...prev.trainedPositions,[currentKey]:true},mistakes:next};
    });
    trackLearningEvent({
      type:"move_correct",
      source:"train",
      fen:beforeFen,
      expectedMoveSan:expectedMove?.san,
      expectedMoveUci:expectedMove?.uci,
      playedMoveSan:legal.san,
      playedMoveUci:playedUci,
      correct:true,
      timeToMoveMs,
    });
    setReviewingFen(null);
  }
  function cancelPromotionSelection(){
    setPendingPromotion(null);
    setPromotionAuthorityDebug(null);
    setFeedback("Promotion cancelled.");
  }
  function handlePromotionPieceSelection(promotionPiece:PromotionPiece){
    if(!pendingPromotion)return;
    void attemptMove(pendingPromotion.from,pendingPromotion.to,promotionPiece);
  }
  function practiceMistake(m:Mistake){const rep=repertoires.find(r=>r.id===m.repertoireId);if(rep)setSelectedRepertoireId(resolveStage2CanonicalOpeningId(rep.id)??rep.id);setFen(m.fen);resetHistory(m.fen);setReviewingFen(normalizeFen(m.fen));setSelectedSquare(null);setPendingPromotion(null);setPromotionAuthorityDebug(null);setFeedback("Review this opening position. Play the expected move.");setLastMove(null);setLastMoveSan("");setLastMoveColor(null);resetBranchAndContinuationState();setMoveHistory([]);setTrainingMode("restricted");setTrainerPhase("ready_for_user");setBookComplete(false);clearPendingOpponentReplyRequest({clearStaleIssue:true});setActiveTab("train");bumpRuntimeFrame()}
  function createCustomRepertoire(){const moves=newLineText.replace(/\d+\./g," ").replace(/\s+/g," ").trim().split(" ").filter(Boolean);if(!moves.length)return;const test=new Chess();for(const move of moves){try{if(!test.move(move)){setFeedback(`Could not parse move: ${move}`);return}}catch{setFeedback(`Could not parse move: ${move}`);return}}const rep:Repertoire={id:`custom-${Date.now()}`,name:newRepName.trim()||"My Custom Repertoire",color:newRepColor,description:"Custom line saved on this device.",lines:[moves],custom:true};setCustomRepertoires(prev=>[...prev,rep]);setSelectedRepertoireId(rep.id);setShowAddLine(false);const startFen=new Chess().fen();setFen(startFen);resetHistory(startFen);setLastMove(null);setLastMoveSan("");setLastMoveColor(null);setTrainingMode("restricted");setBookComplete(false);clearPendingOpponentReplyRequest({clearStaleIssue:true});setFeedback("Custom repertoire saved. Restricted training is active.");setActiveTab("train");bumpRuntimeFrame()}
  const squareStyles:Record<string,CSSProperties>={};
  if(lastMove&&lastMove.length>=4){
    squareStyles[lastMove.slice(0,2)]={boxShadow:"inset 0 0 0 999px rgba(255,255,255,.12), inset 0 0 22px rgba(255,255,255,.5)"};
    squareStyles[lastMove.slice(2,4)]={boxShadow:"inset 0 0 0 999px rgba(255,255,255,.16), inset 0 0 24px rgba(255,255,255,.62)"};
  }
  if(activeBoard){
    const suppressPlainPreVisuals = v28VisibleSurface?.mode === "plain_before_show_more";
    const visualSquares=suppressPlainPreVisuals?[]:(!presentationFrame.visual.shouldRender?[]:(presentationFrame.visual.source==="visual_recipe"?visualRecipePlayback.squares.filter((sq)=>isValidSquare(sq.square)).slice(0,4):visualModelOutput?(activeVisualModelOutput&&trainerPhase==="ready_for_user"&&isUserTurn&&trainerView==="assisted"?(activeVisualModelOutput.squares??[]):[]):currentView.cues.slice(0,3).map(c=>({square:c.square,kind:c.kind,role:c.kind}))));
    for(const cue of visualSquares.slice(0,4)){
      if(!isValidSquare(cue.square))continue;
      const role=cue.role??cue.kind;
      const bg=role==="source"||cue.kind==="origin"?"rgba(94,126,255,.24)":role==="defense"||role==="king_safety"||cue.kind==="support"?"rgba(80,190,120,.24)":role==="weakness"||role==="danger"||role==="soft_target"||cue.kind==="danger"?"rgba(255,80,80,.24)":role==="center"?"rgba(255,210,70,.30)":"rgba(255,210,70,.26)";
      const shadow=role==="destination"?"inset 0 0 0 3px rgba(94,126,255,.82), inset 0 0 26px rgba(94,126,255,.48)":role==="king_safety"?"inset 0 0 0 3px rgba(22,163,74,.62), inset 0 0 24px rgba(22,163,74,.42)":role==="weakness"||role==="danger"?"inset 0 0 0 3px rgba(239,68,68,.58), inset 0 0 24px rgba(239,68,68,.34)":"inset 0 0 22px rgba(255,210,70,.58)";
      squareStyles[cue.square]={...squareStyles[cue.square],background:`radial-gradient(circle, ${bg} 0%, ${bg} 38%, transparent 72%)`,boxShadow:shadow};
    }
    if(opponentCue&&boardSettings.showOpponentCue&&shouldRenderOpponentLastMoveHighlight({committed:opponentCue.committed,cueFen:opponentCue.fen,boardFen:normalizeFen(fen)}))for(const cue of opponentCue.cues){
      squareStyles[cue.square]={...squareStyles[cue.square],background:"radial-gradient(circle, rgba(184,132,255,.28) 0%, rgba(184,132,255,.18) 38%, transparent 72%)"};
    }
  }
  if(boardSettings.showMoveDots&&selectedLegalMoves.length){
    for(const m of selectedLegalMoves){
      const isCapture=Boolean(m.captured);
      const dot=isCapture?"rgba(239,68,68,.38)":"rgba(22,163,74,.46)";
      squareStyles[m.to]={...squareStyles[m.to],background:`radial-gradient(circle, ${dot} 0%, ${dot} 18%, transparent 23%)`,boxShadow:isCapture?"inset 0 0 0 3px rgba(239,68,68,.58)":"inset 0 0 0 2px rgba(22,163,74,.30)"};
    }
  }
  if(presentationFrame.visual.source==="continuation_candidate"){
    for(const highlight of continuationCandidateVisual.highlights){
      squareStyles[highlight.square]={...squareStyles[highlight.square],background:"radial-gradient(circle, rgba(22,163,74,.24) 0%, rgba(22,163,74,.16) 38%, transparent 72%)",boxShadow:"inset 0 0 0 3px rgba(22,163,74,.45)"};
    }
  } else if(presentationFrame.visual.source==="guided_target_fallback"){
    for(const highlight of safeMoveArrowVisual.highlights){
      squareStyles[highlight.square]={...squareStyles[highlight.square],background:"radial-gradient(circle, rgba(22,163,74,.24) 0%, rgba(22,163,74,.16) 38%, transparent 72%)",boxShadow:"inset 0 0 0 3px rgba(22,163,74,.45)"};
    }
  }
  if(selectedSquare)squareStyles[selectedSquare]={...squareStyles[selectedSquare],boxShadow:"inset 0 0 0 3px rgba(22,101,52,.85), inset 0 0 24px rgba(22,101,52,.5)"};
  const visualSourceForRender=String(presentationFrame.visual.source??"none");
  const staleCanSuppressVisual=visualFrameStale&&visualSourceForRender==="visual_recipe";
  // v2.7.40 Agent 3: Visual overlays prefer VisibleTeachingSurface (enforces alignment + plain-pre + mismatch blocks)
  const surfaceVisualLines = v28SurfaceActive
    ? ((visibleTeachingSurface?.visual?.lines as ActiveLine[]) ?? [])
    : (visibleTeachingSurface?.visual?.shouldRender ? (visibleTeachingSurface.visual.lines as ActiveLine[]) : null);
  const rawBoardLines:ActiveLine[]= surfaceVisualLines ?? (presentationFrame.visual.shouldRender&&!staleCanSuppressVisual?(presentationFrame.visual.lines as ActiveLine[]):[]);
  const boardLinesToRender:ActiveLine[]=useMemo(()=>{
    if(v28VisibleSurface){
      return rawBoardLines;
    }
    if(!instructionTarget?.uci)return[];
    const expectedFrom=instructionTarget.from;
    const expectedTo=instructionTarget.to;
    const matching=rawBoardLines.find((line)=>line.from===expectedFrom&&line.to===expectedTo);
    const primary=matching??{from:expectedFrom,to:expectedTo,kind:"plan" as const,label:instructionTarget.san};
    return [primary];
  },[v28VisibleSurface,instructionTarget?.uci,instructionTarget?.from,instructionTarget?.to,instructionTarget?.san,rawBoardLines]);
  const suppressPlainPreTargetHighlights = v28VisibleSurface?.mode === "plain_before_show_more";
  if(!instructionTarget?.uci || suppressPlainPreTargetHighlights){
    for(const square of Object.keys(squareStyles))delete squareStyles[square];
  }else if(trainerPhase==="ready_for_user"&&isUserTurn){
    const allowedSquares=new Set([instructionTarget.from,instructionTarget.to]);
    for(const square of Object.keys(squareStyles)){
      if(!allowedSquares.has(square))delete squareStyles[square];
    }
  }
  const transientLinesToRender:ActiveLine[]=activeBoard&&opponentCue&&boardSettings.showOpponentCue&&shouldRenderOpponentLastMoveHighlight({committed:opponentCue.committed,cueFen:opponentCue.fen,boardFen:normalizeFen(fen)})?opponentCue.lines:[];
  const legalVerboseMoves=(game.moves({verbose:true}) as any[]);
  const expectedMoveLegal=expectedUserOptions[0]?legalVerboseMoves.some((move)=>moveToUci(move)===expectedUserOptions[0].uci):null;
  useEffect(()=>{
    const actualTitle = surfaceCoachCardDecision?.shouldShowCoachCard ? String(surfaceCoachCardDecision.title ?? "").trim() : null;
    const actualBody = surfaceCoachCardDecision?.shouldShowCoachCard ? String(surfaceCoachCardDecision.body ?? "").trim() : null;
    const actualButtons = surfaceCoachCardDecision?.shouldShowCoachCard ? ((surfaceCoachCardDecision.buttons ?? []) as any[]).map(String) : [];
    const pipelineTitle = displayedCoachDecision?.shouldShowCoachCard ? String(displayedCoachDecision.title ?? "").trim() : null;
    const pipelineBody = displayedCoachDecision?.shouldShowCoachCard ? String(displayedCoachDecision.body ?? "").trim() : null;
    const pipelineSource = String((displayedCoachDecision?.debug as any)?.coachDecisionSource ?? "").trim() || null;
    const preAuthoritySurfaceTitle = visibleTeachingSurface?.coach?.shouldRender ? String(visibleTeachingSurface.coach.title ?? "").trim() : null;
    const preAuthoritySurfaceBody = visibleTeachingSurface?.coach?.shouldRender ? String(visibleTeachingSurface.coach.body ?? "").trim() : null;
    const debugVisibleTitle = actualTitle;
    const debugVisibleBody = actualBody;
    const debugVisibleButtons = Array.isArray(visibleTeachingSurface?.actions) ? visibleTeachingSurface.actions.map(String) : [];
    const visualCount = Array.isArray(boardLinesToRender) ? boardLinesToRender.length : 0;
    const revealTargetUci = instructionTarget?.uci ?? null;
    const visualAligned = instructionTarget?.uci ? Boolean(boardLinesToRender[0] && `${boardLinesToRender[0].from}${boardLinesToRender[0].to}` === instructionTarget.uci) : "not_applicable";
    const revealAligned = instructionTarget?.uci ? (showMoreShown ? true : "not_applicable") : "not_applicable";
    const criticalIssuesAtFrame = runtimeCriticalIssues.slice();
    if ((actualTitle ?? null) !== (debugVisibleTitle ?? null) || (actualBody ?? null) !== (debugVisibleBody ?? null) || JSON.stringify(actualButtons) !== JSON.stringify(debugVisibleButtons)) {
      criticalIssuesAtFrame.push("coach_card_debug_parity_mismatch");
    }
    if (JSON.stringify(actualButtons) !== JSON.stringify(debugVisibleButtons)) {
      criticalIssuesAtFrame.push("action_debug_parity_mismatch");
    }
    if (visualCount !== Number((visibleTeachingSurface?.visual?.lines ?? []).length)) {
      criticalIssuesAtFrame.push("visual_debug_parity_mismatch");
    }
    const entry: CoachCardRenderTimelineEntry = {
      id: ++coachCardRenderTimelineSeqRef.current,
      ts: Date.now(),
      frameId: Number(trainerFrameId),
      ply: moveHistory.length,
      fen4: normalizeFen(fen),
      trainerPhase,
      trainerView,
      trainingMode,
      isUserTurn,
      coachInteraction,
      answerShown: showAnswer,
      hintShown: coachHintRequestCount > 0,
      instructionKind: currentInstructionFrame?.kind ?? null,
      instructionTargetUci: instructionTarget?.uci ?? null,
      instructionTargetSan: instructionTarget?.san ?? null,
      instructionTargetPieceType: instructionTarget?.pieceType ?? null,
      expectedMoveUci: expectedUserOptions[0]?.uci ?? null,
      expectedMoveSan: expectedUserOptions[0]?.san ?? null,
      visibleTitle: debugVisibleTitle,
      visibleBody: debugVisibleBody,
      visibleButtons: debugVisibleButtons,
      actualCoachCardTitle: actualTitle,
      actualCoachCardBody: actualBody,
      actualCoachCardButtons: actualButtons,
      actualCoachCardSource: "surfaceCoachCardDecision",
      visibleSurfaceMode: visibleTeachingSurface?.mode ?? null,
      visibleSurfaceOwner: visibleTeachingSurface?.owner ?? null,
      visibleCoachOwner: visibleTeachingSurface?.debug?.visibleCoachOwner ?? null,
      coachIntent: String(displayedCoachDecision?.debug?.coachIntent ?? visibleTeachingSurface?.mode ?? ""),
      coachDecisionSource: String(displayedCoachDecision?.debug?.coachDecisionSource ?? ""),
      runtimeSafeFallbackUsed: Boolean(displayedCoachDecision?.debug?.verifiedFallbackUsed),
      runtimeSafeFallbackReason: String(displayedCoachDecision?.debug?.fallbackReason ?? "").trim() || null,
      surfaceSafetyBlocked: Boolean(visibleTeachingSurface?.safety?.blocked),
      surfaceSafetyBlockedReason: visibleTeachingSurface?.safety?.reason ?? visibleTeachingSurface?.safety?.blockedReason ?? null,
      surfaceSafetyBlockedSeverity: visibleTeachingSurface?.safety?.blockedSeverity ?? null,
      surfaceSafetyRecoveredBySafeTeachingCopy: Boolean(visibleTeachingSurface?.safety?.recoveredBySafeTeachingCopy),
      plainLeakDetected: Boolean(visibleTeachingSurface?.safety?.plainLeakDetected),
      targetAligned: instructionTarget?.uci ? Boolean(displayedCoachDecision?.debug?.coachQuality?.targetAligned) : "not_applicable",
      pieceAligned: instructionTarget?.pieceType ? Boolean(displayedCoachDecision?.debug?.coachQuality?.pieceAligned) : "not_applicable",
      visualTargetAligned: visualAligned,
      revealTargetAligned: revealAligned,
      renderedVisualPrimitiveCount: visualCount,
      renderedActionIds: actualButtons,
      renderedRevealTargetUci: revealTargetUci,
      criticalIssuesAtFrame,
      warningsAtFrame: [],
      pipelineCoachCardTitle: pipelineTitle,
      pipelineCoachCardBody: pipelineBody,
      pipelineCoachCardSource: pipelineSource,
      pipelineQualityScore: Number.isFinite(Number((displayedCoachDecision?.debug as any)?.coachQuality?.qualityScore))
        ? Number((displayedCoachDecision?.debug as any)?.coachQuality?.qualityScore)
        : null,
      renderedQualityScore: Number.isFinite(Number(renderedCoachQualityForDebug?.qualityScore))
        ? Number(renderedCoachQualityForDebug?.qualityScore)
        : null,
      qualityScoreSource: String((renderedCoachQualityForDebug as any)?.qualityScoreSource ?? "") || null,
      qualityScoreReasonCodes: Array.isArray((renderedCoachQualityForDebug as any)?.qualityScoreReasonCodes)
        ? (renderedCoachQualityForDebug as any).qualityScoreReasonCodes.map(String)
        : [],
      pipelineCopyRejected: pipelineCopyAuthorityDecision.pipelineCopyRejected,
      pipelineCopyRejectedReason: pipelineCopyAuthorityDecision.pipelineCopyRejectedReason,
      renderedCopyAuthority: pipelineCopyAuthorityDecision.renderedCopyAuthority,
      pipelineCopyAuthority: pipelineCopyAuthorityDecision.pipelineCopyAuthority,
      preAuthoritySurfaceTitle,
      preAuthoritySurfaceBody,
      preAuthoritySurfaceOwner: visibleTeachingSurface?.owner ?? null,
      preAuthoritySurfaceReason: preAuthoritySurfaceTitle !== actualTitle || preAuthoritySurfaceBody !== actualBody
        ? "surface_candidate_replaced_by_rendered_authority"
        : null,
    };
    const coachCardRenderEntryKey=[
      String(trainerFrameId),
      normalizeFen(fen),
      trainerPhase,
      trainerView,
      trainingMode,
      isUserTurn?"1":"0",
      coachInteraction,
      (coachHintRequestCount>0)?"1":"0",
      showAnswer?"1":"0",
      String(debugVisibleTitle??"none"),
      String(debugVisibleBody??"none"),
      debugVisibleButtons.join("|")||"none",
      String(actualTitle??"none"),
      String(actualBody??"none"),
      String(pipelineTitle??"none"),
      String(pipelineBody??"none"),
      String(pipelineSource??"none"),
      actualButtons.join("|")||"none",
      String(visibleTeachingSurface?.mode??"none"),
      String(displayedCoachDecision?.debug?.coachIntent??visibleTeachingSurface?.mode??"none"),
      String(instructionTarget?.uci??"none"),
      String(expectedUserOptions[0]?.uci??"none"),
      Boolean(visibleTeachingSurface?.safety?.blocked)?"1":"0",
      String(visibleTeachingSurface?.safety?.reason??visibleTeachingSurface?.safety?.blockedReason??"none"),
      actualButtons.join("|")||"none",
      String(visualCount),
      runtimeCriticalIssues.join("|")||"none",
    ].join("||");
    if(coachCardRenderEntryKey===lastCoachCardRenderEntryKeyRef.current)return;
    lastCoachCardRenderEntryKeyRef.current=coachCardRenderEntryKey;
    setCoachCardRenderTimeline((prev)=>[...prev.slice(-74),entry]);
  },[
    trainerFrameId,fen,trainerPhase,trainerView,trainingMode,isUserTurn,coachInteraction,showAnswer,coachHintRequestCount,showMoreShown,
    currentInstructionFrame?.kind,instructionTarget?.uci,instructionTarget?.san,instructionTarget?.pieceType,expectedUserOptions[0]?.uci,expectedUserOptions[0]?.san,moveHistory.length,
    surfaceCoachCardDecision?.shouldShowCoachCard,surfaceCoachCardDecision?.title,surfaceCoachCardDecision?.body,(surfaceCoachCardDecision?.buttons??[]).map(String).join("|"),
    visibleTeachingSurface?.mode,visibleTeachingSurface?.owner,visibleTeachingSurface?.coach?.title,visibleTeachingSurface?.coach?.body,(visibleTeachingSurface?.actions??[]).map(String).join("|"),
    visibleTeachingSurface?.safety?.blocked,visibleTeachingSurface?.safety?.reason,visibleTeachingSurface?.safety?.blockedReason,visibleTeachingSurface?.safety?.blockedSeverity,visibleTeachingSurface?.safety?.recoveredBySafeTeachingCopy,visibleTeachingSurface?.safety?.plainLeakDetected,
    displayedCoachDecision?.debug?.coachIntent,displayedCoachDecision?.debug?.coachDecisionSource,displayedCoachDecision?.debug?.verifiedFallbackUsed,displayedCoachDecision?.debug?.fallbackReason,displayedCoachDecision?.debug?.coachQuality?.targetAligned,displayedCoachDecision?.debug?.coachQuality?.pieceAligned,
    displayedCoachDecision?.title,displayedCoachDecision?.body,renderedCoachQualityForDebug?.qualityScore,JSON.stringify((renderedCoachQualityForDebug as any)?.qualityScoreReasonCodes??[]),
    pipelineCopyAuthorityDecision.pipelineCopyRejected,pipelineCopyAuthorityDecision.pipelineCopyRejectedReason,pipelineCopyAuthorityDecision.renderedCopyAuthority,pipelineCopyAuthorityDecision.pipelineCopyAuthority,
    boardLinesToRender.map((line)=>`${line.from}${line.to}`).join("|"),runtimeCriticalIssues.join("|"),
  ]);
  useEffect(()=>{
    const renderedActionIds = (surfaceCoachCardDecision?.buttons as any[] | undefined)?.map(String) ?? [];
    const primitiveIds = (v28BoardVisualUiModel?.visualRecipes ?? []).map((visual)=>String(visual.id));
    const primitiveIdsKey = primitiveIds.join("|");
    const boardVisualIds = boardLinesToRender.map((line)=>`${line.from}${line.to}`);
    const boardVisualIdsKey = boardVisualIds.join("|");
    const renderedActionIdsKey = renderedActionIds.join("|");
    const moveArrowCount = (v28BoardVisualUiModel?.visualRecipes ?? []).filter((visual)=>visual.type==="move_arrow").length;
    const srcDstCount = (v28BoardVisualUiModel?.visualRecipes ?? []).filter((visual)=>visual.type==="source_highlight"||visual.type==="destination_highlight").length;
    const entry = {
      id: ++visualTimelineSeqRef.current,
      ts: Date.now(),
      frameId: Number(trainerFrameId),
      trainerView,
      visibleSurfaceMode: v28VisibleSurface?.mode ?? visibleTeachingSurface?.mode ?? null,
      surfaceVisualPrimitiveIds: primitiveIds,
      boardVisualPrimitiveIds: boardVisualIds,
      moveArrowCount,
      sourceDestinationHighlightCount: srcDstCount,
      visualTargetUci: v28VisibleSurface?.targetUci ?? instructionTarget?.uci ?? null,
      plainBeforeShowMoreSuppressedVisuals: v28VisibleSurface?.mode === "plain_before_show_more" ? primitiveIds.length === 0 && boardLinesToRender.length === 0 : "not_applicable",
      showMoreRestoredAssistedEquivalentVisuals: v28VisibleSurface?.mode === "plain_after_show_more" ? boardLinesToRender.length > 0 : "not_applicable",
      renderedActionIds,
    };
    const visualEntryKey=[
      String(trainerFrameId),
      trainerView,
      String(v28VisibleSurface?.mode ?? visibleTeachingSurface?.mode ?? "none"),
      primitiveIdsKey||"none",
      boardVisualIdsKey||"none",
      String(moveArrowCount),
      String(srcDstCount),
      String(v28VisibleSurface?.targetUci ?? instructionTarget?.uci ?? "none"),
      String(v28VisibleSurface?.mode === "plain_before_show_more" ? primitiveIds.length === 0 && boardLinesToRender.length === 0 : "na"),
      String(v28VisibleSurface?.mode === "plain_after_show_more" ? boardLinesToRender.length > 0 : "na"),
      renderedActionIdsKey||"none",
    ].join("||");
    if(visualEntryKey===lastVisualTimelineEntryKeyRef.current)return;
    lastVisualTimelineEntryKeyRef.current=visualEntryKey;
    setVisualRenderTimeline((prev)=>[...prev.slice(-74),entry]);
  },[
    trainerFrameId,trainerView,v28VisibleSurface?.mode,v28VisibleSurface?.targetUci,visibleTeachingSurface?.mode,instructionTarget?.uci,
    (v28BoardVisualUiModel?.visualRecipes ?? []).map((visual)=>String(visual.id)).join("|"),
    (v28BoardVisualUiModel?.visualRecipes ?? []).filter((visual)=>visual.type==="move_arrow").length,
    (v28BoardVisualUiModel?.visualRecipes ?? []).filter((visual)=>visual.type==="source_highlight"||visual.type==="destination_highlight").length,
    boardLinesToRender.map((line)=>`${line.from}${line.to}`).join("|"),
    (surfaceCoachCardDecision?.buttons??[]).map(String).join("|"),
  ]);
  useEffect(()=>{
    if (trainerView !== "plain") return;
    const target = instructionTarget;
    const title = String(surfaceCoachCardDecision?.title ?? "");
    const body = String(surfaceCoachCardDecision?.body ?? "");
    const text = `${title}\n${body}`.toLowerCase();
    const san = String(target?.san ?? "").toLowerCase();
    const uci = String(target?.uci ?? "").toLowerCase();
    const from = String(target?.from ?? "").toLowerCase();
    const to = String(target?.to ?? "").toLowerCase();
    const piece = String(target?.pieceType ?? "").toLowerCase();
    const renderedActionIds = ((surfaceCoachCardDecision?.buttons as any[] | undefined) ?? []).map(String);
    const renderedActionIdsKey = renderedActionIds.join("|");
    const showMoreClicked = Boolean(showMoreShown);
    const hintClicked = coachHintRequestCount > 0;
    const targetVisualRendered = boardLinesToRender.length > 0;
    const sourceDestinationHighlightRendered = Boolean((from&&squareStyles[from])||(to&&squareStyles[to]));
    const revealActionRendered = renderedActionIds.includes("reveal_target");
    const leakedSan = Boolean(san && text.includes(san));
    const leakedUci = Boolean(uci && text.includes(uci));
    const leakedFrom = Boolean(from && text.includes(from));
    const leakedTo = Boolean(to && text.includes(to));
    const leakedPiece = Boolean(piece && piece.length > 1 && text.includes(piece));
    const leakKinds = [
      leakedSan ? "san" : "",
      leakedUci ? "uci" : "",
      leakedFrom ? "from" : "",
      leakedTo ? "to" : "",
      leakedPiece ? "piece" : "",
      targetVisualRendered ? "visual" : "",
      sourceDestinationHighlightRendered ? "src_dst" : "",
      revealActionRendered ? "reveal" : "",
    ].filter(Boolean);
    const leakKindsKey = leakKinds.join("|");
    const preShowMoreLeak = !showMoreClicked && (leakedSan || leakedUci || leakedFrom || leakedTo || leakedPiece || targetVisualRendered || sourceDestinationHighlightRendered || revealActionRendered);
    const entry = {
      id: ++plainLeakTimelineSeqRef.current,
      ts: Date.now(),
      frameId: Number(trainerFrameId),
      showMoreClicked,
      hintClicked,
      leakedSan,
      leakedUci,
      leakedFrom,
      leakedTo,
      leakedPiece,
      targetVisualRendered,
      sourceDestinationHighlightRendered,
      revealActionRendered,
      preShowMoreLeak,
    };
    const plainLeakEntryKey = [
      String(trainerFrameId),
      trainerView,
      showMoreClicked?"1":"0",
      hintClicked?"1":"0",
      san||"none",
      uci||"none",
      from||"none",
      to||"none",
      piece||"none",
      renderedActionIdsKey||"none",
      targetVisualRendered?"1":"0",
      sourceDestinationHighlightRendered?"1":"0",
      revealActionRendered?"1":"0",
      leakKindsKey||"none",
      preShowMoreLeak?"1":"0",
    ].join("||");
    if(plainLeakEntryKey===lastPlainLeakEntryKeyRef.current)return;
    lastPlainLeakEntryKeyRef.current=plainLeakEntryKey;
    setPlainLeakTimeline((prev)=>[...prev.slice(-74),entry]);
  },[
    trainerFrameId,trainerView,showMoreShown,coachHintRequestCount,surfaceCoachCardDecision?.title,surfaceCoachCardDecision?.body,
    instructionTarget?.san,instructionTarget?.uci,instructionTarget?.from,instructionTarget?.to,instructionTarget?.pieceType,
    boardLinesToRender.map((line)=>`${line.from}${line.to}`).join("|"),
    (surfaceCoachCardDecision?.buttons??[]).map(String).join("|"),
    instructionTarget?.from ? Number(Boolean(squareStyles[instructionTarget.from])) : 0,
    instructionTarget?.to ? Number(Boolean(squareStyles[instructionTarget.to])) : 0,
  ]);
  useEffect(()=>{
    const nextState = {
      frameId: Number(trainerFrameId),
      mode: String(v28VisibleSurface?.mode ?? visibleTeachingSurface?.mode ?? "unknown"),
      hintShown: coachHintRequestCount > 0,
      showMoreShown,
      targetUci: instructionTarget?.uci ?? null,
      visualCount: boardLinesToRender.length,
    };
    const previous = previousSurfaceTransitionRef.current;
    if (previous && (previous.frameId !== nextState.frameId || previous.mode !== nextState.mode || previous.hintShown !== nextState.hintShown || previous.showMoreShown !== nextState.showMoreShown || previous.targetUci !== nextState.targetUci)) {
      const trigger = previous.frameId !== nextState.frameId ? "frame_changed" : previous.mode !== nextState.mode ? "mode_changed" : previous.hintShown !== nextState.hintShown ? "hint_toggled" : "show_more_toggled";
      const transitionEntryKey = [
        String(previous.frameId),
        String(nextState.frameId),
        previous.mode,
        nextState.mode,
        trigger,
        String(previous.targetUci ?? "none"),
        String(nextState.targetUci ?? "none"),
        previous.hintShown && !nextState.hintShown ? "1" : "0",
        previous.showMoreShown && !nextState.showMoreShown ? "1" : "0",
        previous.visualCount > 0 && nextState.visualCount === 0 ? "1" : "0",
      ].join("||");
      if(transitionEntryKey!==lastSurfaceTransitionEntryKeyRef.current){
        lastSurfaceTransitionEntryKeyRef.current=transitionEntryKey;
      setSurfaceModeTransitionTimeline((prev)=>[
        ...prev.slice(-74),
        {
          id: ++surfaceTransitionSeqRef.current,
          ts: Date.now(),
          previousFrameId: previous.frameId,
          nextFrameId: nextState.frameId,
          previousMode: previous.mode,
          nextMode: nextState.mode,
          trigger,
          targetBefore: previous.targetUci,
          targetAfter: nextState.targetUci,
          hintReset: previous.hintShown && !nextState.hintShown,
          showMoreReset: previous.showMoreShown && !nextState.showMoreShown,
          visualsReset: previous.visualCount > 0 && nextState.visualCount === 0,
        },
      ]);
      }
    }
    previousSurfaceTransitionRef.current = nextState;
  },[
    trainerFrameId,v28VisibleSurface?.mode,visibleTeachingSurface?.mode,coachHintRequestCount,showMoreShown,instructionTarget?.uci,boardLinesToRender.length,
  ]);
  const visualMoveUciForDebug=boardLinesToRender[0]?`${boardLinesToRender[0].from}${boardLinesToRender[0].to}`:null;
  const visualTargetMatchesInstructionTarget=instructionTarget?.uci?visualMoveUciForDebug===instructionTarget.uci:"unknown";
  const promotionDebugActive=promotionAuthorityDebug?.frameId===trainerFrameId?promotionAuthorityDebug:null;
  const acceptedTargetUci=promotionDebugActive
    ? promotionDebugActive.acceptedPromotionUci??instructionTarget?.uci??null
    : instructionTarget?.uci??null;
  const promotionAuthorityTargetUci=expectedUserOptions[0]?.uci??instructionTarget?.uci??null;
  const trainerFrameResolution=buildTrainerFrameResolution({
    trainerFrameId,
    trainerPhase,
    trainerView,
    trainingMode,
    isUserTurn,
    selectedOpeningId: canonicalSelectedRepertoireId,
    selectedRepertoireId,
    selectedOpeningRuntimeAvailable: selectedOpeningAvailability?.runtimeAvailable ?? null,
    runtimeAvailable: selectedOpeningAvailability?.runtimeAvailable ?? false,
    runtimeOpeningId: runtimeOpeningIdForFrame ?? null,
    runtimeBookOpeningId: runtimeBookFrameQuery.openingId ?? runtimeOpeningIdForFrame ?? null,
    instructionTargetUci: instructionTarget?.uci ?? null,
    instructionTargetSan: instructionTarget?.san ?? null,
    instructionTargetPieceType: instructionTarget?.pieceType ?? null,
    coachMoveUci: (displayedCoachDecision?.debug as any)?.coachMoveUci ?? instructionTarget?.uci ?? null,
    coachPieceType: (displayedCoachDecision?.debug as any)?.coachPieceType ?? instructionTarget?.pieceType ?? null,
    acceptedTargetUci,
    pendingPromotion,
    promotionPickerRendered: Boolean(pendingPromotion),
    promotionOptions: pendingPromotion?.legalPromotionUcis ?? [],
    selectedPromotionPiece: promotionDebugActive?.selectedPromotionPiece ?? null,
    attemptedPromotionUci: promotionDebugActive?.attemptedPromotionUci ?? null,
    acceptedPromotionUci: promotionDebugActive?.acceptedPromotionUci ?? null,
    promotionAuthorityMatched: promotionDebugActive?.promotionAuthorityMatched ?? null,
    promotionAuthorityMismatchReason: promotionDebugActive?.promotionAuthorityMismatchReason ?? null,
    promotionAuthorityTargetUci,
    selectedLineCompleteConfirmed,
    exactNodeHasChildren: selectedLineExactNodeHasChildren,
    hasNextOpponentMove: hasNextOpponentMoveInSelectedLine,
    hasNextUserMove: hasNextUserMoveInSelectedLine,
    validBranchCompleteLatch: Boolean(branchCompleteLatch.active && branchCompleteLatch.lineId === selectedRuntimeLineId),
    selectedRuntimeLinePlyLength,
    selectedRuntimeLineCurrentPly,
    selectedRuntimeLineExhausted,
    terminalProofLineAuthority: stage2OpeningDepthReached ? "actual_runtime_branch_or_depth" : (selectedRuntimeTrainingLineSelection?.selectedLineKey ? "selected_runtime_line_play_sequence_uci" : "expected_move_resolution"),
    terminalProofBlockedReason: stage2TerminalProof.blockedReasons[0] ?? null,
    afterFinalUserMove: !isUserTurn && lastMoveColor === userColor,
    runtimeBookBookExhausted: runtimeBookFrameQuery.bookExhausted,
    runtimeBookCandidateCount: runtimeBookFrameQuery.candidates.length,
    runtimeBookStatus: runtimeBookFrameQuery.status,
    visibleTeachingSurface,
    visibleSurfaceOwner: visibleTeachingSurface?.owner ?? null,
    visibleSurfaceMode: v28VisibleSurface?.mode ?? visibleTeachingSurface?.mode ?? null,
    displayedCoachDecision,
    actualCoachCardTitle: surfaceCoachCardDecision?.title ?? null,
    actualCoachCardBody: surfaceCoachCardDecision?.body ?? null,
    actualCoachCardButtons: (surfaceCoachCardDecision?.buttons ?? []).map(String),
    actualCoachCardSource: surfaceCoachCardDecision ? "surfaceCoachCardDecision" : null,
    actualActionSource: v28SurfaceActive ? "visible_surface_v28" : "legacy_or_presentation",
    actualVisualSource: v28SurfaceActive ? "visible_surface_v28" : String(presentationFrame?.visual?.source ?? "none"),
    renderedQualityScore: renderedCoachQualityForDebug?.qualityScore ?? null,
    renderedQualityScoreSource: renderedCoachQualityForDebug?.qualityScoreSource ?? null,
    coachQuality: renderedCoachQualityForDebug,
    visualRecipe,
    visualRecipeMoveUci: visualRecipe?.moveUci ?? null,
    visualRecipeMoveSan: visualRecipe?.moveSan ?? null,
    visualRecipeTargetMatchesInstructionTarget: visualMoveUciForDebug ? visualMoveUciForDebug === instructionTarget?.uci : "unknown",
    visualRecipeBlockedByTargetMismatch: Boolean(visualRecipeBlockedByTargetMismatch),
    visualRecipeOverlay,
    renderedVisualPrimitiveCount: boardLinesToRender.length,
    surfaceVisualPrimitiveCount: (v28BoardVisualUiModel?.visualRecipes ?? []).length,
    stage2ApprovedPacketMatched: stage2CoachingPacketResolution.kind === "approved_packet",
    stage2ApprovedPacketKind: stage2CoachingPacketResolution.kind,
    stage2ApprovedPacketId: stage2CoachingPacketResolution.kind === "approved_packet" ? stage2CoachingPacketResolution.packet.packetId : null,
    stage2ApprovedPacketSourceBundle: stage2CoachingPacketResolution.kind === "approved_packet" ? stage2CoachingPacketResolution.packet.sourceCandidatePackages?.[0] ?? stage2CoachingPacketResolution.packet.sourceCandidatePackage ?? null : null,
    stage2ApprovedPacketSourceFile: stage2CoachingPacketResolution.kind === "approved_packet" ? stage2CoachingPacketResolution.packet.sourceFile ?? null : null,
    stage2ApprovedPacketSourceRuntimeMoveUci: stage2CoachingPacketResolution.kind === "approved_packet" ? stage2CoachingPacketResolution.packet.sourceRuntimeMoveUci ?? null : null,
    stage2ApprovedPacketStatus: stage2CoachingPacketResolution.kind === "approved_packet" ? stage2CoachingPacketResolution.packet.status : null,
    stage2ApprovedPacketApprovalReadiness: stage2CoachingPacketResolution.kind === "approved_packet" ? stage2CoachingPacketResolution.packet.approvalReadiness : null,
    stage2ApprovedPacketMissReason:
      stage2CoachingPacketResolution.kind === "approved_packet"
        ? null
        : stage2CoachingPacketResolution.kind === "safe_fallback"
          ? "approved_packet_exact_match_not_found"
          : stage2CoachingPacketResolution.reason,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: v28SurfaceActive ? "visible_surface_v28" : String(presentationFrame?.visual?.source ?? "none"),
    stage2CoachingPacketKind: stage2CoachingPacketResolution.kind,
    stage2CoachingSafetyStatus: stage2CoachingPacketResolution.kind === "none" ? null : stage2CoachingPacketResolution.packet.safetyStatus,
    stage2CoachingSurface: stage2CoachContext.surface,
    stage2CoachingSourceFile: stage2CoachingPacketResolution.kind === "none" ? null : stage2CoachingPacketResolution.packet.sourceFile,
    stage2CoachingRuntimeMatched: stage2CoachingPacketResolution.kind === "none" ? null : stage2CoachingPacketResolution.packet.runtimeReconciliation.status === "matched",
    presentationFrame,
    v28VisibleSurface,
    expectedMoveUci: expectedUserOptions[0]?.uci ?? null,
    expectedMoveSan: expectedUserOptions[0]?.san ?? null,
  });
  const selectedContinuationCandidate=trainingMode==="continuation"&&currentSelectedCandidateUci?{uci:currentSelectedCandidateUci,san:currentSelectedCandidateSan??currentSelectedCandidateUci}:null;
  const lastMoveAttribution=attributeLastMove({lastMoveSan,lastMoveUci:lastMove,lastMoveColor,userColor});
  const legacyTrainingCardActuallyRendered=false;
  const legacyAnswerCardActuallyRendered=false;
  const legacyMoveImpactActuallyRendered=false;
  const legacyNextTextActuallyRendered=false;
  const promotionPickerRendered=Boolean(pendingPromotion);
  const diagnosticsSnapshot=blundrDebugEnabled?collectTrainerDebugSnapshot({
    debugEnabled:blundrDebugEnabled,
    trainerFrameId,
    historyIndex,
    trainerPhase,
    trainerView,
    trainingMode,
    bookComplete,
    isUserTurn,
    showAnswer,
    coachHintRequestCount,
    coachHiddenForFrame,
    coachInteraction,
    instructionTargetUci:instructionTarget?.uci??null,
    instructionTargetFrom:instructionTarget?.from??null,
    instructionTargetTo:instructionTarget?.to??null,
    instructionTargetPieceType:instructionTarget?.pieceType??null,
    instructionTargetKind:instructionTarget?.kind??null,
    // v2.7.39.1 Target Locking - stable frame identity for preventing official target drift
    instructionFrameKey: computeInstructionFrameKey({
      fen,
      trainingMode,
      isUserTurn,
      trainerPhase,
      source: instructionTarget?.kind || (trainingMode==="continuation" ? "continuation_candidate" : "guided"),
    }),
    expectedMoveSan:expectedUserOptions[0]?.san,
    expectedMoveUci:expectedUserOptions[0]?.uci,
    expectedMoveResolution,
    expectedMoveResolverDebug,
    guidedCoveragePolicy,
    lastUserMoveSan:lastMoveAttribution.lastUserMoveSan,
    lastUserMoveUci:lastMoveAttribution.lastUserMoveUci,
    lastOpponentMoveSan:lastMoveAttribution.lastOpponentMoveSan,
    lastOpponentMoveUci:lastMoveAttribution.lastOpponentMoveUci,
    selectedLineId:selectedRuntimeLineId,
    selectedOpeningId:selectedRepertoireId,
    canonicalSelectedOpeningId:canonicalSelectedRepertoireId,
    selectedConceptId:visualRecipe?.conceptId??teachingOrchestration?.cue.conceptId,
    activeLineName:repertoire.name,
    openingSelectionMode:runtimeOpeningSelection.mode,
    openingSelectionSource:runtimeOpeningSelection.source,
    openingSelectionEligibleCount:runtimeOpeningSelection.eligibleCount,
    openingSelectionEligibleOpeningIds:runtimeOpeningSelection.eligibleOpeningIds,
    openingSelectionWeighted:runtimeOpeningSelection.weighted,
    openingSelectionContentGated:runtimeOpeningSelection.contentGated,
    openingSelectionStageGated:runtimeOpeningSelection.stageGated,
    openingSelectionVisibilityGated:runtimeOpeningSelection.visibilityGated,
    openingSelectionWeightsSummary:runtimeOpeningSelection.weightsSummary,
    openingSelectionStickyReason:runtimeOpeningSelection.openingSelectionStickyReason,
    openingSelectionSeed:runtimeOpeningSelection.openingSelectionSeed,
    openingSelectionWasPersisted:runtimeOpeningSelection.openingSelectionWasPersisted,
    lineSelectionMode:selectedRuntimeTrainingLineSelection?.mode??null,
    lineSelectionSource:selectedRuntimeTrainingLineSelection?.source??(selectedOpeningAvailability?.runtimeAvailable?"local_runtime_package":"curated_repertoire"),
    lineSelectionWeighted:Boolean(selectedRuntimeTrainingLineSelection?.weighted ?? selectedOpeningAvailability?.runtimeAvailable),
    lineSelectionContentGated:false,
    lineSelectionRuntimeBacked:Boolean(selectedRuntimeTrainingLineSelection?.source==="local_runtime_package"||selectedOpeningAvailability?.runtimeAvailable),
    lineSelectionEligibleCount:selectedRuntimeTrainingLineSelection?.eligibleCount??0,
    lineSelectionEligibleLineIds:selectedRuntimeTrainingLineSelection?.eligibleLineIds??[],
    lineSelectionEligibleLineKeys:selectedRuntimeTrainingLineSelection?.eligibleLineKeys??[],
    lineSelectionRecentLineKeys:recentRuntimeTrainingLineKeys,
    lineSelectionBlockedRecentLineKeys:selectedRuntimeTrainingLineSelection?.blockedRecentLineKeys??[],
    lineSelectionBlockedThirdRepeatLineKeys:selectedRuntimeTrainingLineSelection?.blockedThirdRepeatLineKeys??selectedRuntimeTrainingLineSelection?.blockedRecentLineKeys??[],
    lineSelectionSelectedLineKey:selectedRuntimeLineKey,
    lineSelectionPreviousTwoSame:lineSelectionPreviousTwoSame,
    lineSelectionSessionId:runtimeTrainingSessionId,
    lineSelectionVariationReason:selectedRuntimeTrainingLineSelection?.variationReason??null,
    lineSelectionRepeatUnavoidable:selectedRuntimeTrainingLineSelection?.repeatUnavoidable??false,
    lineSelectionSeed:selectedRuntimeTrainingLineSelection?.selectionSeed??null,
    selectedRuntimeLineId:selectedRuntimeTrainingLineSelection?.selectedLineId??null,
    selectedRuntimeLineKey,
    selectedRuntimeLineIndex:selectedRuntimeTrainingLineSelection?.selectedLineIndex??null,
    selectedRuntimeLinePlayKey:selectedRuntimeTrainingLineSelection?.selectedPlayKey??null,
    selectedRuntimeLinePlaySequenceUci:selectedRuntimeTrainingLineSelection?.selectedPlaySequenceUci??[],
    selectedRuntimeLinePlyLength:selectedRuntimeLinePlyLength,
    selectedRuntimeLineCurrentPly:selectedRuntimeLineCurrentPly,
    selectedRuntimeLineExhausted:selectedRuntimeLineExhausted,
    stage2OpeningDepthTargetPly,
    stage2OpeningCurrentPly,
    stage2OpeningDepthReached,
    runtimeGraphAuthorityUsed,
    runtimeGraphCurrentPlayKey,
    runtimeGraphCandidateCount,
    runtimeGraphSelectedCandidateUci,
    selectedRuntimeLineUsedFor,
    hardRailDetected,
    hardRailBlockedReason,
    selectedLineCompleteConfirmed,
    terminalProofLineAuthority:stage2OpeningDepthReached ? "actual_runtime_branch_or_depth" : (selectedRuntimeTrainingLineSelection?.selectedLineKey ? "selected_runtime_line_play_sequence_uci" : "expected_move_resolution"),
    terminalProofBlockedReason:stage2TerminalProof.blockedReasons[0]??null,
    currentInstructionFrame,
    playKeyBefore:runtimePlayKeyBeforeForFrame??null,
    playKey:runtimePlayKeyBeforeForFrame&&instructionTarget?.uci?`${runtimePlayKeyBeforeForFrame},${instructionTarget.uci}`:(instructionTarget?.uci??null),
    currentInstructionFrameKind:currentInstructionFrame?.kind??null,
    instructionTargetSource:currentInstructionFrame?.targetSource??null,
    moveHistory,
    fen,
    feedback,
    overlayFen,
    sideToMove:game.turn(),
    legalMoveCount:legalVerboseMoves.length,
    expectedMoveLegal,
    expectedMoveResolvedFromSan:expectedUserOptions[0]?.san??null,
    expectedMoveResolvedFromUci:expectedUserOptions[0]?.uci??null,
    sanUciResolutionStatus:expectedUserOptions[0]?"resolved":expectedMoveResolution.source,
    sanUciResolutionReason:expectedMoveResolution.reason,
    visualRecipe:visualRecipeForRender,
    visualRecipeOverlay,
    visualRecipePlayback,
    visualRecipePrimitiveIds:visualRecipe?.beats.flatMap((beat)=>beat.primitives.map((primitive)=>primitive.id))??[],
    playbackKey:visualRecipePlayback.playbackKey,
    playbackReady:visualRecipePlayback.animationState==="playing"||visualRecipePlayback.animationState==="held_end_state"||visualRecipePlayback.animationState==="skipped_to_end",
    boardLines:boardLinesToRender,
    squareStyles,
    overlayFrameId,
    visualReady,
    visualModelOutput,
    coachSurfacePolicyAffectsVisualLayer:false,
    selectedCandidateSan:selectedContinuationCandidate?.san,
    selectedCandidateUci:selectedContinuationCandidate?.uci,
    selectedCandidateSource:currentSelectedCandidateSource,
    pendingPromotion,
    promotionPickerRendered,
    promotionOptions:pendingPromotion?.legalPromotionUcis??[],
    selectedPromotionPiece:promotionDebugActive?.selectedPromotionPiece??null,
    attemptedPromotionUci:promotionDebugActive?.attemptedPromotionUci??null,
    acceptedPromotionUci:promotionDebugActive?.acceptedPromotionUci??null,
    acceptedTargetUci,
    promotionAuthorityMatched:promotionDebugActive?.promotionAuthorityMatched??null,
    promotionAuthorityMismatchReason:promotionDebugActive?.promotionAuthorityMismatchReason??null,
    promotionAuthorityTargetUci,
    visualMoveUci:visualMoveUciForDebug,
    visualRecipeMoveUci,
    visualRecipeTargetMatchesInstructionTarget,
    visualRecipeBlockedByTargetMismatch,
    visualTargetMatchesInstructionTarget,
    showMoreShown,
    selectedCandidateSafetySource:(coachDecision?.debug as any)?.coachEngineStatus,
    enginePreview,
    continuationCandidateLines:continuationCandidateVisual.lines,
    shouldRenderContinuationLines:trainingMode==="continuation"&&continuationCandidateVisual.shouldRender&&boardLinesToRender.length>0,
    continuationVisualBlockedReason:trainingMode==="continuation"&&selectedContinuationCandidate&&!boardLinesToRender.length?(continuationCandidateVisual.blockedReason??"candidate_exists_but_no_board_lines"):"none",
    continuationAnalysisStatus,
    continuationRuntimeStatus:continuationRuntimeState.status,
    continuationTerminalReason:continuationRuntimeState.reason??null,
    continuationFlowState:continuationFlowContract.state,
    continuationFlowReason:continuationFlowContract.reason,
    continuationFlowCriticalIssue:continuationFlowContract.criticalIssueIfInvalid,
    continuationCandidateLockId:continuationCandidateLock?.continuationCandidateLockId??null,
    continuationCandidateLockFen4:continuationCandidateLock?.continuationCandidateLockFen4??null,
    continuationCandidateLockRequestId:continuationCandidateLock?.continuationCandidateLockRequestId??null,
    continuationCandidateLockUci:continuationCandidateLock?.continuationCandidateLockUci??null,
    continuationCandidateLockSan:continuationCandidateLock?.continuationCandidateLockSan??null,
    continuationCandidateLockSource:continuationCandidateLock?.continuationCandidateLockSource??null,
    continuationCandidateLockReason:continuationCandidateLock?.continuationCandidateLockReason??null,
    continuationPauseRequired:forceContinuationPause,
    continuationPauseClicked,
    continuationPauseReason:continuationPauseDecision.pauseReason,
    continuationHardStopMoveNumber:continuationPauseDecision.hardStopMoveNumber,
    continuationHardStopPlyLimit:continuationPauseDecision.hardStopPlyLimit,
    continuationCurrentPlyCount:continuationPauseDecision.currentPlyCount,
    continueFromHereClickHandled,
    continueFromHereClickBlockedReason,
    continuationSessionId,
    continuationCandidateEvaluationBlockedUntilClick:Boolean(forceContinuationPause&&!continuationPauseClicked),
    continuationInstructionTargetBeforeClick:!continuationPauseClicked?instructionTarget?.uci??null:null,
    continuationVisualTargetBeforeClick:!continuationPauseClicked?visualMoveUciForDebug:null,
    continuationCoachTargetBeforeClick:!continuationPauseClicked?((displayedCoachDecision?.debug as any)?.coachMoveUci??instructionTarget?.uci??null):null,
    continuationPolicyDebug:continuationPolicyCandidate?.debug??null,
    continuationSelectionSource:validatedContinuationCandidate?.source??null,
    continuationSelectionReason:validatedContinuationCandidate?.reason??null,
    runtimeBookQueried:Boolean(runtimeBookFrameShouldQuery),
    runtimeBookOpeningId:runtimeBookFrameQuery.openingId??runtimeOpeningIdForFrame??null,
    runtimeBookPlayKeyBefore:runtimeBookFrameQuery.playKeyBefore??runtimePlayKeyBeforeForFrame??null,
    runtimeBookStatus:runtimeBookFrameQuery.status,
    runtimeBookCandidateCount:runtimeBookFrameQuery.candidates.length,
    runtimeBookTopCandidateUci:runtimeBookFrameQuery.candidates[0]?.uci??null,
    runtimeBookTopCandidateSan:runtimeBookFrameQuery.candidates[0]?.san??null,
    runtimeBookTopCandidateRank:runtimeBookFrameQuery.candidates[0]?.rank??null,
    runtimeBookTopCandidateGames:runtimeBookFrameQuery.candidates[0]?.totalGames??null,
    runtimeBookTopCandidatePlayPct:runtimeBookFrameQuery.candidates[0]?.playPct??null,
    opponentReplyAuthoritySource:restrictedOpponentReplyAuthorityPreview.opponentReplyAuthoritySource,
    opponentReplyAuthorityCandidateUci:restrictedOpponentReplyAuthorityPreview.opponentReplyAuthorityCandidateUci,
    opponentReplyAuthorityCandidateSan:restrictedOpponentReplyAuthorityPreview.opponentReplyAuthorityCandidateSan,
    opponentReplyAuthorityCandidateGames:restrictedOpponentReplyAuthorityPreview.opponentReplyAuthorityCandidateGames,
    opponentReplyAuthorityCandidatePlayPct:restrictedOpponentReplyAuthorityPreview.opponentReplyAuthorityCandidatePlayPct,
    opponentReplyAuthorityRejectedReason:restrictedOpponentReplyAuthorityPreview.opponentReplyAuthorityRejectedReason,
    runtimeBookBookExhausted:runtimeBookFrameQuery.bookExhausted,
    runtimeBookFallbackUsed:Boolean(
      runtimeBookFrameQuery.bookExhausted&&
      continuationResolvedTargetSource==="stockfish_top_move"
    ),
    runtimeBookFallbackAuthority:runtimeBookFrameQuery.bookExhausted?(
      continuationResolvedTargetSource==="stockfish_top_move"?"stockfish":"none"
    ):null,
    runtimeDataSource:"local_crawled_package",
    runtimePackageId:"stage2-21-opening-stepdown-runtime-v1",
    openingCount:STAGE2_OPENING_AVAILABILITY_MATRIX.length,
    visibleOpeningCount:STAGE2_OPENING_AVAILABILITY_MATRIX.filter((opening)=>opening.userVisible).length,
    selectedOpeningRuntimeAvailable:selectedOpeningAvailability?.runtimeAvailable ?? null,
    selectedOpeningContentStatus:selectedOpeningAvailability?.contentStatus ?? null,
    candidateSource:selectedOpeningAvailability?.runtimeAvailable ? "local_runtime_package" : "curated_repertoire",
    liveLichessCalled:false,
    openingAvailabilityStatus:selectedOpeningAvailability?.runtimeAvailable ? "runtime_available" : (selectedOpeningAvailability?.qaStatus ?? "smoke_pass"),
    stage2CoachingResolverEnabled:STAGE2_COACHING_RESOLVER_ENABLED,
    stage2ApprovedContentEnabled:STAGE2_APPROVED_CONTENT_ENABLED,
    stage2SafeFallbackEnabled:STAGE2_SAFE_FALLBACK_ENABLED,
    stage2CoachingPacketKind:stage2CoachingPacketResolution.kind,
    stage2CoachingSafetyStatus:stage2CoachingPacketResolution.kind==="none"?null:stage2CoachingPacketResolution.packet.safetyStatus,
    stage2CoachingSurface:stage2CoachContext.surface,
    stage2CoachingSourceFile:stage2CoachingPacketResolution.kind==="none"?null:stage2CoachingPacketResolution.packet.sourceFile,
    stage2CoachingRuntimeMatched:stage2CoachingPacketResolution.kind==="none"?null:stage2CoachingPacketResolution.packet.runtimeReconciliation.status==="matched",
    continuationTargetResolverStatus,
    continuationResolvedTargetUci,
    continuationResolvedTargetSource,
    continuationResolvedTargetLabel,
    effectiveContinuationCandidateUci:continuationCandidateResolution.guard.effectiveContinuationCandidateUci,
    effectiveContinuationCandidateSan:continuationCandidateResolution.guard.effectiveContinuationCandidateSan,
    effectiveContinuationCandidateSource:continuationCandidateResolution.guard.effectiveContinuationCandidateSource,
    effectiveContinuationCandidateFen4:effectiveContinuationCandidate?.fen4??null,
    effectiveContinuationCandidateBlockedReason:continuationCandidateResolution.guard.effectiveContinuationCandidateBlockedReason,
    stockfishPromotionGuardTrainingMode:continuationCandidateResolution.guard.stockfishPromotionGuardTrainingMode,
    stockfishPromotionGuardIsUserTurn:continuationCandidateResolution.guard.stockfishPromotionGuardIsUserTurn,
    stockfishPromotionGuardTrainerPhase:continuationCandidateResolution.guard.stockfishPromotionGuardTrainerPhase,
    stockfishPromotionGuardFenMatches:continuationCandidateResolution.guard.stockfishPromotionGuardFenMatches,
    stockfishPromotionGuardLegal:continuationCandidateResolution.guard.stockfishPromotionGuardLegal,
    stockfishPromotionGuardSourceAllowed:continuationCandidateResolution.guard.stockfishPromotionGuardSourceAllowed,
    continuationEngineFallbackUsed:Boolean(validatedContinuationCandidate?.engineFallbackUsed||validatedContinuationCandidate?.isEngineBestFallback),
    continuationEngineFallbackReason:validatedContinuationCandidate?.engineFallbackReason??null,
    continuationDatabaseCandidatesRejected:Boolean(validatedContinuationCandidate?.databaseCandidatesRejected),
    continuationRejectionReasons:validatedContinuationCandidate?.rejectionReasons??[],
    continuationSelectedCandidateSource:validatedContinuationCandidate?.isEngineBestFallback?"engine_best":(validatedContinuationCandidate?.source??null),
    continuationAnalysisStatusLabel:validatedContinuationCandidate?.isEngineBestFallback?"complete":continuationAnalysisStatus,
    stockfishProviderStatus:stockfishTopMovesForContinuation.providerStatus,
    stockfishDepth:stockfishTopMovesForContinuation.depth,
    stockfishMultipv:stockfishTopMovesForContinuation.multipv,
    suggestionValidationMultipv:SUGGESTION_VALIDATION_MULTIPV,
    userMoveRatingMultipv:USER_MOVE_RATING_MULTIPV,
    stockfishBestMoveUci:stockfishTopMovesForContinuation.bestMoveUci,
    stockfishBestMoveSan:stockfishTopMovesForContinuation.bestMoveSan,
    stockfishTopMoveUcis:stockfishTopMovesForContinuation.topMoves.map((move)=>move.uci),
    stockfishTopMoveSans:stockfishTopMovesForContinuation.topMoves.map((move)=>move.san),
    stockfishEvaluationFen:stockfishTopMovesForContinuation.fen,
    stockfishEvaluationMatchesBoardFen:normalizeFen(stockfishTopMovesForContinuation.fen)===normalizeFen(fen),
    suggestedMoveUci:validatedContinuationCandidate?.uci??null,
    suggestedMoveSan:validatedContinuationCandidate?.san??null,
    stockfishSuggestedRank:continuationSuggestionValidation?.rank??null,
    stockfishSuggestedTop10:Boolean(continuationSuggestionValidation?.isTop10),
    suggestionAccepted:Boolean(continuationSuggestionValidation?.accepted),
    candidateReplacedByStockfish:Boolean(continuationSuggestionValidation && !continuationSuggestionValidation.accepted && Boolean(continuationSuggestionValidation.replacementUci)),
    replacementUci:continuationSuggestionValidation?.replacementUci??null,
    replacementReason:continuationSuggestionValidation?.rejectionReason??null,
    lastContinuationUserMoveRating,
    userMoveFoundInMultipv32:lastContinuationUserMoveRating?.userMoveFoundInTopMoves??null,
    userMoveOutsideMultipv32:lastContinuationUserMoveRating?lastContinuationUserMoveRating.userMoveFoundInTopMoves===false:null,
    directEvalFallbackUsed:lastContinuationUserMoveRating?.ratingMethod==="direct_after_move_eval",
    renderedBadgeLabel:continuationRatingBadge?.label??null,
    badgeVisible:Boolean(continuationRatingBadgeVisible),
    badgeSuppressedReason:continuationRatingBadgeVisible?"none":(
      trainingMode!=="continuation"
        ?"not_continuation_mode"
        :trainerView==="plain"
          ?"plain_pre_show_more_badge_hidden"
          :!lastContinuationUserMoveRating
            ?"no_last_user_move_rating"
            :lastContinuationUserMoveRating.badgeSuppressedReason!=="none"
              ?lastContinuationUserMoveRating.badgeSuppressedReason
              :lastContinuationUserMoveRating.providerStatus!=="ready"
                ?"engine_unavailable"
                :"surface_mode_hidden"
    ),
    continuationAnalysisRequestId:continuationAnalysisSeqRef.current,
    continuationAnalysisFen4:enginePreview?.fen?normalizeFen(enginePreview.fen):null,
    opponentVariationDebug,
    maiaEnabled:true,
    maiaRuntimeEnabled:process.env.NEXT_PUBLIC_MAIA_API_ENABLED==="true",
    maiaApiClientEnabled:maiaApiClientEnabled,
    maiaProviderName:maiaOpponentProvider.name,
    maiaProviderVersion:maiaOpponentProvider.version,
    maiaProviderStatus:maiaOpponentProviderStatus,
    maiaRuntimeStatus:maiaOpponentProviderStatus,
    maiaRuntimeProvider:maiaOpponentProvider.name,
    maiaRuntimeHealthStatus:maiaOpponentProviderStatus,
    maiaApiRouteStatus:maiaApiRouteStatus,
    maiaRuntimeErrorReason:maiaRuntimeErrorReason,
    maiaRuntimeMs:maiaRuntimeMs,
    maiaSkillLevel:maiaOpponentSkillLevel,
    maiaRequestId:maiaOpponentRequestId,
    maiaRequestFen4:maiaOpponentRequestFen4,
    maiaContinuationEnabled: Boolean(trainingMode==="continuation"&&userExplicitlyEnteredContinuation),
    maiaContinuationStatus: maiaOpponentProviderStatus,
    maiaContinuationLoaded: maiaOpponentProviderStatus==="ready",
    maiaContinuationError: maiaRuntimeErrorReason,
    maiaOpponentProviderUsed: Boolean(trainingMode==="continuation"&&userExplicitlyEnteredContinuation),
    maiaOpponentRequestPending: Boolean(pendingOpponentRequest),
    maiaOpponentLastMoveUci: lastMoveColor===opponentColor?lastMove:null,
    maiaContinuationOnly:true,
    maiaAllowedThisFrame:trainingMode==="continuation"&&userExplicitlyEnteredContinuation,
    maiaBlockedReason:maiaOpponentDecisionReason,
    maiaCandidateCount:maiaOpponentCandidateCount,
    maiaCandidatesTop5:[],
    maiaSelectedUci:maiaOpponentSelectedUci,
    maiaSelectedSan:maiaOpponentSelectedSan,
    maiaSelectedLegal:maiaOpponentSelectedLegal,
    maiaRuntimeCandidateLegal:maiaOpponentRuntimeCandidateLegal,
    maiaAppliedMoveUci:maiaOpponentAppliedMoveUci,
    maiaAppliedMoveSan:maiaOpponentAppliedMoveSan,
    maiaAppliedFromFen4:maiaOpponentAppliedFromFen4,
    maiaAppliedToFen4:maiaOpponentAppliedToFen4,
    maiaSelectedHumanLikelihood:maiaOpponentHumanLikelihood,
    maiaSelectedRank:null,
    maiaFallbackUsed:maiaOpponentFallbackUsed,
    maiaFallbackReason:maiaOpponentFallbackReason,
    maiaStaleResultIgnored:maiaOpponentStaleResultIgnored,
    maiaIllegalCandidateRejected:maiaOpponentIllegalCandidateRejected,
    maiaTouchedInstructionTarget:false,
    maiaTouchedVisibleSurface:false,
    maiaTouchedCoachCopy:false,
    maiaTouchedRatingBadge:false,
    maiaTouchedBranchComplete:false,
    maiaSanityGuardEnabled:MAIA_OPPONENT_REPLY_SANITY_GUARD_ENABLED,
    maiaSanityGuardResult:maiaOpponentSanityGuardResult,
    maiaSanityGuardBlockedReason:maiaOpponentSanityGuardBlockedReason,
    coachDecision:displayedCoachDecision,
    coachMoveUci:(displayedCoachDecision?.debug as any)?.coachMoveUci??instructionTarget?.uci??null,
    coachPieceType:(displayedCoachDecision?.debug as any)?.coachPieceType??instructionTarget?.pieceType??null,
    revealTargetUci:(lastActionDebug as any)?.frameId===trainerFrameId ? (lastActionDebug as any)?.revealTargetUci ?? instructionTarget?.uci ?? null : instructionTarget?.uci ?? null,
    revealTargetSource:(lastActionDebug as any)?.frameId===trainerFrameId ? (lastActionDebug as any)?.revealTargetSource ?? (instructionTarget?"instruction_target":"none") : (instructionTarget?"instruction_target":"none"),
    frameKey,
    coachFrameStale,
    visualFrameStale,
    revealTargetStale,
    overlayFrameLagDetected:trainerPhase==="ready_for_user"&&overlayFrameId!==trainerFrameId,
    memoryMigratedOrCleared:coachMemoryMigration.migratedOrCleared,
    coachMemoryLegacyDetected:coachMemoryMigration.legacyDetected,
    coachMemoryClearedLegacyCount:coachMemoryMigration.clearedLegacyCount,
    liveCoachState,
    presentationFrame,
    coachSurfacePolicy,
    branchTransitionSurfaceRendered:Boolean(branchTransitionSurface?.render||v28VisibleSurface?.mode==="branch_complete"),
    branchTransitionReason:branchTransitionSurface?.reason??null,
    continueFromHereAvailable:Boolean((branchTransitionSurface?.render)||(v28CoachUiModel?.actions ?? []).some((action)=>action.kind==="continue_from_here"&&action.visible!==false)),
    branchCompleteEligible: branchCompleteEligibleNow,
    branchCompleteReason: branchCompleteReasonNow,
    branchCompleteBlockedReason: branchCompleteContract.branchCompleteBlockedReason,
    branchCompleteLineExhaustedEvidence: branchCompleteContract.lineExhaustedEvidence,
    branchCompleteAfterFinalUserMove: branchCompleteContract.afterFinalUserMove,
    restrictedLineExhaustedOnOpponentTurn: restrictedLineExhaustedOnOpponentTurnAfterUserMove,
    branchCompleteRecoveredFromOpponentTurn: restrictedLineExhaustedOnOpponentTurnAfterUserMove&&branchCompleteEligibleNow,
    blockedOpponentRequestInRestrictedExhaustedLine: restrictedLineExhaustedOnOpponentTurnAfterUserMove&&!pendingOpponentRequest,
    selectedLineExhausted: branchCompleteContract.selectedLineExhausted,
    selectedLineExhaustionReason: branchCompleteContract.selectedLineExhaustionReason,
    selectedLineExhaustionBlockedReason: branchCompleteContract.selectedLineExhaustionBlockedReason,
    exactNodeHasChildren: branchCompleteContract.exactNodeHasChildren,
    hasNextOpponentMove: branchCompleteContract.hasNextOpponentMove,
    hasNextUserMove: branchCompleteContract.hasNextUserMove,
    knownFinalFenMatched: branchCompleteContract.knownFinalFenMatched,
    knownFinalMoveMatched: branchCompleteContract.knownFinalMoveMatched,
    finalGuidedUserMoveCompletedLine: branchCompleteContract.finalGuidedUserMoveCompletedLine,
    explicitCuratedTerminalNode: explicitCuratedTerminalNode,
    pendingOpponentRequestConflict: branchCompleteContract.pendingOpponentRequestConflict,
    pendingOpponentRequestCancelledForBranchComplete:Boolean(branchCompleteShouldCancelPending&&!pendingOpponentRequest),
    branchCompleteBlockedOpponentRequestId:branchCompleteBlockedOpponentRequestIdRef.current,
    continueFromHereClicked,
    opportunityCount:(displayedCoachDecision?.debug as any)?.opportunityCount??liveCoachState?.opportunities?.length,
    renderableOpportunityCount:(displayedCoachDecision?.debug as any)?.renderableOpportunityCount??liveCoachState?.opportunities?.length,
    coachQuality:renderedCoachQualityForDebug??(displayedCoachDecision?.debug as any)?.coachQuality??null,
    pipelineCoachCardTitle:displayedCoachDecision?.shouldShowCoachCard?String(displayedCoachDecision?.title??"").trim()||null:null,
    pipelineCoachCardBody:displayedCoachDecision?.shouldShowCoachCard?String(displayedCoachDecision?.body??"").trim()||null:null,
    pipelineCoachCardSource:String((displayedCoachDecision?.debug as any)?.coachDecisionSource??"").trim()||null,
    moveFactPacket:(displayedCoachDecision?.debug as any)?.moveFactPacket??null,
    positionDeltaPacket:(displayedCoachDecision?.debug as any)?.positionDeltaPacket??null,
    featurePacket:(displayedCoachDecision?.debug as any)?.featurePacket??null,
    planPacket:(displayedCoachDecision?.debug as any)?.planPacket??null,
    opportunityPacket:(displayedCoachDecision?.debug as any)?.opportunityPacket??null,
    safetyResult:(displayedCoachDecision?.debug as any)?.safetyResult??null,
    pendingOpponentRequest,
    runtimeCriticalIssues,
    lastActionDebug,
    eventLog:debugEventLog,
    lastCoachRecords,
    lastCoachBodies:getRecentInstructionalCoachRecords(lastCoachRecordsRef.current,5).map((entry)=>entry.body),
    coachTimeline,
    coachCardRenderTimeline,
    surfaceModeTransitionTimeline,
    actionTimeline,
    visualRenderTimeline,
    plainLeakTimeline,
    maiaTimeline,
    trainerFrameResolution,
    actualCoachCardTitle: trainerFrameResolution.coachCard.finalRendered.title,
    actualCoachCardBody: trainerFrameResolution.coachCard.finalRendered.body,
    actualCoachCardButtons: trainerFrameResolution.coachCard.finalRendered.buttons,
    actualCoachCardSource: trainerFrameResolution.coachCard.finalRendered.source ?? null,
    actualActionSource: trainerFrameResolution.visual.renderedSource ?? (v28SurfaceActive ? "visible_surface_v28" : "legacy_or_presentation"),
    actualVisualSource: trainerFrameResolution.visual.renderedSource ?? (v28SurfaceActive ? "visible_surface_v28" : String(presentationFrame?.visual?.source ?? "none")),
    renderedActionIds: trainerFrameResolution.coachCard.finalRendered.buttons,
    surfaceActionIds: (v28CoachUiModel?.actions ?? []).filter((action)=>action.visible).map((action)=>String(action.kind)),
    renderedVisualPrimitiveCount: trainerFrameResolution.visual.renderedPrimitiveCount,
    surfaceVisualPrimitiveCount: trainerFrameResolution.visual.surfacePrimitiveCount,
    orchestrateTeachingVisibleBypass: Boolean(
      v28SurfaceActive &&
      teachingOrchestration &&
      (legacyTrainingCardActuallyRendered || legacyAnswerCardActuallyRendered || legacyMoveImpactActuallyRendered || legacyNextTextActuallyRendered),
    ),
    // v2.7.41 Clean Convergence: Force legacy would/actually to false on teaching frames for clean debug health
    legacyTrainingCardWouldRender: false,
    legacyTrainingCardActuallyRendered: false,
    legacyAnswerCardWouldRender: false,
    legacyAnswerCardActuallyRendered,
    // v2.7.41 Clean Convergence: Hard zero for all legacy visible signals on teaching frames
    legacyMoveImpactWouldRender: false,
    legacyMoveImpactActuallyRendered: false,
    legacyNextTextWouldRender: false,
    legacyNextTextActuallyRendered: false,
    moveImpactPresentation,
    currentSelectedCandidateUci,
    previousSelectedCandidateUci:candidateSyncDebugRef.current.previousSelectedCandidateUci,
    staleSelectedCandidateDetected:candidateSyncDebugRef.current.staleSelectedCandidateDetected,
    staleSelectedCandidateCleared:candidateSyncDebugRef.current.staleSelectedCandidateCleared,
    autoContinuationReason:userExplicitlyEnteredContinuation?"user_explicit":"none",
    userExplicitlyEnteredContinuation,
    prematureContinuationBlocked:trainingMode!=="continuation"&&!guidedCoveragePolicy.guidedCompleteAllowed,
    transitionToContinuationAllowed:userExplicitlyEnteredContinuation,
    transitionToContinuationReason:userExplicitlyEnteredContinuation?"user_explicit":"not_allowed_until_continue_line",
    continuationPauseAlreadyConsumed,
    hardStopBackupEligible,
    hardStopBackupBlockedReason,
    hardStopPlyLimit:HARD_CONTINUATION_BREAK_PLY,
    // Agent 6: surface + invariant fields for strengthened snapshot + debug panel
    visibleTeachingSurface: convergedVisibleSurface as any,
    visibleSurfaceOwner: visibleTeachingSurface?.owner ?? null,
    visibleCoachOwner: visibleTeachingSurface?.debug?.visibleCoachOwner ?? presentationFrame?.coach?.owner ?? "none",
    visibleVisualOwner: visibleTeachingSurface?.debug?.visibleVisualOwner ?? presentationFrame?.visual?.source ?? "none",
    visibleActionOwner: visibleTeachingSurface?.debug?.visibleActionOwner ?? "visibleActionPolicy",
    showMoreTargetUci: intendedShowMoreTargetUci,
    plainLeakDetected: visibleTeachingSurface?.safety?.plainLeakDetected ?? false,
    legacyBypassDetectedFromSurface: visibleTeachingSurface?.safety?.legacyBypassDetected ?? false,
    surfaceSafetyBlocked: visibleTeachingSurface?.safety?.blocked ?? false,
    surfaceFourTargetMismatch: visibleTeachingSurface?.debug?.fourTargetMismatch ?? false,
    surfaceTwoPieceMismatch: visibleTeachingSurface?.debug?.twoPieceTypeMismatch ?? false,
  }):null;
  return <main className="min-h-screen bg-[#f7f7f4] text-stone-950"><div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-5">
    {activeTab==="home"&&<section className="space-y-6"><header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm"><Beaker size={20}/></div><div><h1 className="text-2xl font-bold tracking-tight">Blundr</h1><p className="text-sm text-stone-500">Visual opening training with a controlled trainer.</p></div></div><button onClick={()=>setShowSettings(true)} className="rounded-2xl bg-white p-3 shadow-sm"><Settings className="text-stone-500" size={20}/></button></header><div className="grid grid-cols-2 gap-3"><MetricCard label="Accuracy" value={`${accuracy}%`} sub="all time" icon={<Trophy size={19}/>}/><MetricCard label="Streak" value={String(progress.streak)} sub="correct" icon={<Flame size={19}/>}/><MetricCard label="Review" value={String(mistakes.length)} sub="mistakes" icon={<XCircle size={19}/>} warning/><MetricCard label="Runtime openings" value={String(STAGE2_OPENING_AVAILABILITY_MATRIX.length)} sub="local crawled" icon={<BookOpen size={19}/>}/></div><div className="rounded-3xl bg-stone-900 p-4 text-white shadow-sm"><div className="flex items-center gap-2 text-sm font-bold text-green-300"><Cloud size={17}/> v2.7.33</div><p className="mt-2 text-sm leading-6 text-stone-300">Training now uses rule-only visual cues by default. Blundr Brain is reserved for manual reveal/debug, so normal practice stays fast, deterministic, and inexpensive.</p></div><div className="space-y-3">{repertoires.slice(0,5).map(r=><button key={r.id} onClick={()=>selectRepertoire(r.id)} className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-3 text-left shadow-sm"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">{r.color==="white"?"♙":"♟"}</div><div className="min-w-0 flex-1"><div className="font-bold">{r.name}</div><div className="text-sm text-stone-500">{r.lines.length} lines • {countPositions(r)} positions</div><p className="mt-1 line-clamp-2 text-xs text-stone-400">{r.description}</p></div><ChevronRight className="text-stone-400" size={20}/></button>)}</div></section>}
    {activeTab==="repertoire"&&<section className="space-y-5"><header className="flex items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight">Repertoires</h1><p className="text-sm text-stone-500">Reliable openings included in the app.</p></div><button onClick={()=>setShowAddLine(true)} className="rounded-2xl bg-green-700 px-4 py-2 text-sm font-black text-white">Add</button></header><div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm"><Search size={18} className="text-stone-400"/><span className="text-sm text-stone-400">Search repertoires</span></div><div className="space-y-3">{repertoires.map(r=><button key={r.id} onClick={()=>selectRepertoire(r.id)} className={classNames("flex w-full items-center gap-3 rounded-3xl border bg-white p-3 text-left shadow-sm",r.id===canonicalSelectedRepertoireId?"border-green-700":"border-stone-200")}><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-3xl">{r.color==="white"?"♙":"♟"}</div><div className="min-w-0 flex-1"><div className="font-bold">{r.name}</div><div className="text-sm text-stone-500">{r.lines.length} lines • {countPositions(r)} positions • {r.color}</div><p className="mt-1 line-clamp-2 text-xs text-stone-400">{r.description}</p></div><ChevronRight className="text-stone-400" size={20}/></button>)}</div><div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-lg font-black tracking-tight">Runtime catalog</h2><p className="text-sm text-stone-500">Local crawled runtime package training lines for all 21 openings.</p></div><div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{STAGE2_OPENING_AVAILABILITY_MATRIX.length} visible</div></div><div className="grid gap-2">{STAGE2_OPENING_AVAILABILITY_MATRIX.map((opening)=>{const trainable=repertoires.some((rep)=>rep.id===opening.openingId);return <button key={opening.openingId} onClick={()=>selectRepertoire(opening.openingId)} className={classNames("flex items-center justify-between gap-3 rounded-2xl border p-3 text-left shadow-sm",trainable?"border-green-200 bg-green-50":"border-stone-200 bg-stone-50 opacity-90",opening.openingId===canonicalSelectedRepertoireId?"ring-2 ring-green-700/30":"")}><div className="min-w-0"><div className="font-bold">{opening.displayName}</div><div className="text-xs text-stone-500">{opening.openingId} • {opening.learnerPerspective} • {opening.runtimeNodeCount.toLocaleString()} nodes • {opening.runtimeCandidateMoveCount.toLocaleString()} moves</div></div><div className="text-right text-xs font-black text-stone-500"><div>{opening.contentStatus}</div><div>{opening.qaStatus}</div></div></button>})}</div></div></section>}
    {activeTab==="train"&&<section className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{repertoire.name}</h1>
          <p className="text-sm font-semibold text-green-700">{trainingMode==="restricted"?"Restricted trainer":"Continuation"} • {rating.target}{isReviewingHistory?" • reviewing":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setShowSettings(true)} className="rounded-2xl bg-white p-3 shadow-sm"><Settings size={20}/></button>
          <button onClick={resetBoard} className="rounded-2xl bg-white p-3 shadow-sm"><RotateCcw size={20}/></button>
        </div>
      </header>
      {blundrDebugEnabled && (
        <>
          <LiveBrain brain={brain}/>
          <GptDebugPanel open={showGptDebug} setOpen={setShowGptDebug} text={gptDebugText}/>
          <VisualDebugPanel
            open={showVisualDebug}
            setOpen={setShowVisualDebug}
            visualText={visualDebugText}
            telemetryText={telemetryDebugText}
            telemetryEnabled={telemetryEnabled}
            setTelemetryEnabled={setTelemetryEnabled}
            telemetryCount={telemetryEvents.length}
            onClearTelemetry={()=>setTelemetryEvents([])}
          />
        </>
      )}
      <div className="rounded-3xl bg-white p-3 shadow-sm">
        {blundrDebugEnabled && (
          <div className="mb-3 grid grid-cols-4 gap-2">{RATING_PRESETS.map(p=><button key={p.value} onClick={()=>setRatingFilter(p.value)} className={classNames("rounded-full px-2 py-2 text-[11px] font-black",ratingFilter===p.value?"bg-green-700 text-white":"bg-stone-100 text-stone-600")}>{p.label}</button>)}</div>
        )}
        <div className="mb-3 flex items-center justify-between gap-3">
          {blundrDebugEnabled && (
            <button onClick={()=>setActiveBoard(!activeBoard)} className={classNames("rounded-full px-4 py-2 text-sm font-black",activeBoard?"bg-stone-950 text-white":"bg-stone-100 text-stone-600")}>Active Board {activeBoard?"ON":"OFF"}</button>
          )}
          <PipelineStatus step={thinkingStep} note={pipelineNote}/>
        </div>
        <div className="mb-3 rounded-2xl bg-stone-50 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>handleTrainerViewChange("assisted")} className={classNames("rounded-full px-3 py-2 text-xs font-black",trainerView==="assisted"?"bg-green-700 text-white":"bg-white text-stone-600 ring-1 ring-stone-200")}>Assisted</button>
            <button onClick={()=>handleTrainerViewChange("plain")} className={classNames("rounded-full px-3 py-2 text-xs font-black",trainerView==="plain"?"bg-green-700 text-white":"bg-white text-stone-600 ring-1 ring-stone-200")}>Plain</button>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-stone-500">{trainerView==="assisted"?"Shows the visual pattern cue before the move.":"Hides pre-move hints for independent recall."}</p>
        </div>
        {blundrDebugEnabled && activeBoard && enabledViews.length>0 && <div className="mb-3 grid gap-2" style={{gridTemplateColumns:`repeat(${enabledViews.length}, minmax(0,1fr))`}}>{enabledViews.map(v=><button key={v} onClick={()=>setActiveBoardView(v)} className={classNames("rounded-full px-4 py-2 text-sm font-black capitalize",safeBoardView===v?"bg-green-700 text-white shadow-sm":"bg-white text-stone-500 ring-1 ring-stone-200")}>{v}</button>)}</div>}
        <TapChessboard game={game} orientation={repertoire.color} selectedSquare={selectedSquare} squareStyles={squareStyles} lines={boardLinesToRender} transientLines={transientLinesToRender} onSquareTap={handleSquareTap} whitePct={whitePct} evalText={evalText} settings={boardSettings} captured={captured} userColor={userColor} animationName={visualAnimationName} adaptiveOpeningIdentity={adaptiveOpeningIdentity} pendingPromotion={pendingPromotion} onPromotionSelect={handlePromotionPieceSelection} onPromotionCancel={cancelPromotionSelection}/>
        <HistoryControls index={historyIndex} total={positionHistory.length} onBack={()=>jumpHistory(-1)} onForward={()=>jumpHistory(1)}/>
      </div>
      {showDetails&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="font-black text-stone-800">Coach Debug</div><div className="mt-2">coachMode: {coachDecision.mode}</div><div>coachAction: {coachDecision.action}</div><div>coachUtteranceId: {coachDecision.utteranceId??"none"}</div><div>coachUtteranceFamily: {coachDecision.utteranceFamily??"none"}</div><div>coachVariationReason: {String((coachDecision.debug as any)?.coachVariationReason??"n/a")}</div><div>coachHintStrength: {String((coachDecision.debug as any)?.coachHintStrength??"none")}</div><div>coachRevealRisk: {coachDecision.revealRisk}</div><div>coachGivesAnswer: {coachDecision.givesAnswer?"true":"false"}</div><div>coachButtons: {displayedCoachDecision.buttons.join(", ")||"none"}</div><div>coachShouldMarkReviewWorthy: {coachDecision.shouldMarkReviewWorthy?"true":"false"}</div><div>coachSuppressedReason: {coachDecision.suppressedReason??"none"}</div><div>coachFrameMatchesBoard: {coachContextResult.context?.recipeFrameMatchesBoard?"true":"false"}</div><div>coachFenMatchesBoard: {coachContextResult.context?.recipeFenMatchesBoard?"true":"false"}</div><div>recentCoachUtteranceIds: {coachUtteranceMemory.slice(-5).map((entry:any)=>entry.utteranceId).join(", ")||"none"}</div><div>coachSafetyWarnings: {JSON.stringify((coachDecision.debug as any)?.coachSafetyWarnings??[])}</div><div>coachReviewMarked: {coachReviewMarked?"true":"false"}</div><div>selectedOpportunity: {String((coachDecision.debug as any)?.selectedOpportunity??liveCoachState?.selected?.opportunity??"none")}</div><div>selectedIntent: {String((coachDecision.debug as any)?.selectedIntent??liveCoachState?.selected?.intent??"none")}</div><div>exactMoveAllowed: {coachContextResult.context?.exactMoveAllowed?"true":"false"}</div><div>claimTypes: {coachDecision.claimTypes.join(", ")||"none"}</div><div>blockedClaims: {String((coachDecision.debug as any)?.blockedClaims??"none")}</div><div>silenceReason: {String((coachDecision.debug as any)?.silenceReason??liveCoachState?.debug?.silenceReason??"none")}</div><div>branchTransitionSurfaceRendered: {branchTransitionSurface?.render?"true":"false"}</div><div>branchTransitionReason: {branchTransitionSurface?.reason??"none"}</div><div>continueFromHereAvailable: {branchTransitionSurface?.render?"true":"false"}</div><div>continueFromHereClicked: {continueFromHereClicked?"true":"false"}</div><div>coachSurfaceOwner: {coachSurfacePolicy.owner}</div><div>allowLegacyTrainingCard: {coachSurfacePolicy.allowLegacyTrainingCard?"true":"false"}</div><div>allowMoveImpactCard: {coachSurfacePolicy.allowMoveImpactCard?"true":"false"}</div><div>allowNextMoveText: {coachSurfacePolicy.allowNextMoveText?"true":"false"}</div><div>legacyCueSuppressedReason: {coachSurfacePolicy.reason}</div><div>moveImpactPresenterReason: {moveImpactPresentation.reason}</div></div>}
      {!v28SurfaceActive&&bookComplete&&<div className="rounded-3xl border border-green-200 bg-green-50 p-4 shadow-sm"><h2 className="text-lg font-black text-green-900">Line complete</h2><p className="mt-2 text-sm leading-6 text-green-800">You finished this training line. Continue from this position or train the line again.</p><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={continueFromHere} className="rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm">Continue Line</button><button onClick={resetBoard} className="rounded-2xl bg-white px-4 py-3 font-black text-green-800 shadow-sm">Train Again</button></div></div>}
      {endingInfo&&<GameEndCard title={endingInfo.title} message={endingInfo.message} onRestart={resetBoard}/>} 
      {/* v2.7.40 Clean Intelligent Coach Checkpoint: "Reveal Next Move" button DELETED from all non-debug teaching paths.
         Plain View must only ever show Hint + Show More. No Reveal/Show Answer/Show Move allowed.
         handleReveal still exists for internal/debug paths only. */}
      {/* v2.7.41 Clean Convergence: Hard-kill all legacy visible teaching ownership. Surface is the only authority. */}
      {false && showAnswer&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyAnswerCard&&!visibleTeachingSurface?.coach?.shouldRender&&!isActiveTeachingFrame&&<div className="rounded-3xl bg-stone-900 p-4 text-white"><div className="text-sm text-stone-300">Study-line move</div><div className="mt-2 text-2xl font-black">{expectedUserOptions.length?expectedUserOptions.map(m=>m.san).join(" / "):engineLines[0]?.san??"Analysis pending"}</div><p className="mt-2 text-xs leading-5 text-stone-400">Source: {trainingMode==="restricted"?"Saved repertoire line":"Continuation analysis"}</p></div>}
      {/* v2.7.41 Clean Convergence: Legacy training card path is permanently disabled for teaching frames. */}
      {false && activeBoard&&!displayedCoachDecision?.shouldShowCoachCard&&!branchTransitionSurface&&coachSurfacePolicy.allowLegacyTrainingCard&&!visibleTeachingSurface?.coach?.shouldRender&&!isActiveTeachingFrame&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 shadow-sm"><div className="mb-2 flex items-center justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wide text-green-700">{patternCueBadgeLabel.replace("Cue ready","Plan mode")}</div><h2 className="text-lg font-black">{patternCue.title}</h2></div><button onClick={()=>setShowDetails(!showDetails)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{showDetails?"Hide":"Show more"}</button></div><p className="text-sm leading-6 text-stone-700">{patternCue.snippet}</p>{opponentCue&&boardSettings.showOpponentCue&&shouldRenderOpponentLastMoveHighlight({committed:opponentCue.committed,cueFen:opponentCue.fen,boardFen:normalizeFen(fen)})&&<p className="mt-2 rounded-2xl bg-purple-50 p-3 text-sm leading-6 text-purple-800"><span className="font-black">Last opponent move: </span>{opponentCue.message}</p>}{coachSurfacePolicy.allowNextMoveText&&patternCue.next&&(trainerView==="assisted"||showAnswer)&&<p className="mt-2 rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600"><span className="font-black text-stone-900">Next: </span>{patternCue.next}</p>}{visualModelError&&<p className="mt-2 rounded-2xl bg-amber-50 p-2 text-[11px] font-bold leading-5 text-amber-700">Visual cue unavailable: {visualModelError}</p>}{coachSurfacePolicy.allowMoveImpactCard&&moveImpactPresentation.show&&<MoveImpact impact={{label:moveImpactPresentation.label,pct:moveImpact.pct,tone:moveImpact.tone,note:moveImpactPresentation.note}}/>}{showDetails&&<div className="mt-3 space-y-2"><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Headline: {patternCue.title}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual: {activeVisualModelOutput?.animationPackage?.name??annotation.visualExplanation}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Move Quality Gate</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Version: {MOVE_QUALITY_GATE_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Required: {shouldValidateTrainingMove?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Status: {moveQualityPending?"pending":moveQuality?.status??"idle"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected UCI: {moveQuality?.expectedMovesUci?.join(", ")||expectedUserUcis.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Expected SAN: {expectedUserSans.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Stockfish top two: {moveQuality?.topMoves?.map((line)=>line.uci).join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Reason: {moveQuality?.reason??"No validation result."}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Checked: {moveQuality?.checkedAt?new Date(moveQuality.checkedAt).toLocaleTimeString():"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Hints hidden: {hideUnverifiedTrainingHints?"yes":"no"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Teaching Cue Compiler</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler version: {TEACHING_CUE_COMPILER_VERSION}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler concept: {teachingOrchestration?.cue.conceptId??"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler confidence: {teachingOrchestration?Number((teachingOrchestration.cue.debug.confidence??0).toFixed(3)):"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler reason: {teachingOrchestration?.cue.debug.selectedReason??"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler delta: {teachingOrchestration?.cue.debug.deltaSummary?.join(" | ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Compiler scores: {teachingOrchestration?.cue.debug.detectorScores?.map((s)=>`${s.conceptId}:${s.finalScore.toFixed(2)}`).slice(0,6).join(", ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Orchestrator tier: {teachingOrchestration?.classification.tier??"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Selected story: {teachingOrchestration?.selectedStory?.kind??"n/a"} ({teachingOrchestration?.selectedStory?.score.total?.toFixed?.(2)??"n/a"})</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Rejected stories: {teachingOrchestration?.debug.rejectedStories?.map((r)=>`${r.kind}:${r.total.toFixed(2)}`).join(", ")||"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Visual budget: {teachingOrchestration?JSON.stringify(teachingOrchestration.debug.visualBudget):"n/a"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Suppressed visuals: {teachingOrchestration?.debug.suppressionReasons?.join(", ")||"none"}</div><div className="rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500">Learning events are being stored locally for future progress and Review features.</div>{annotation.reason&&<div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Fallback reason: {annotation.reason}</div>}</div>}</div>}
      {showDetails&&teachingOrchestration&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="font-black text-stone-800">Training Context Engine</div><div className="mt-2">Mode: {teachingOrchestration.mode}</div><div>Move trust / context trust: {teachingOrchestration.moveTrust} / {teachingOrchestration.contextTrust}</div><div>Saved move not validated: {teachingOrchestration.debug.savedMoveNotValidated?"yes":"no"}</div><div>Next suppressed: {teachingOrchestration.debug.nextPlaySuppressionReason??"no"}</div><div>Move semantic effects: {teachingOrchestration.debug.moveSemanticSummary.join(" | ")||"n/a"}</div><div>Top move comparisons: {teachingOrchestration.debug.topMoveComparisons.map((c)=>`${c.relationship}:${c.alternativeTheme}`).join(", ")||"n/a"}</div><div>Selected grounding: {teachingOrchestration.debug.selectedStoryGrounding?JSON.stringify(teachingOrchestration.debug.selectedStoryGrounding):"n/a"}</div><div>Visual alignment: {teachingOrchestration.debug.visualConceptAlignment}</div></div>}
      {/* v2.7.40 Agent 3 wiring: CoachCard now driven exclusively by VisibleTeachingSurface (coach + hint + showMore + actions).
         Direct displayedCoachDecision / liveCoachState / rawCoachDecision no longer control visible teaching output on active frames.
         They remain in memo deps for legacy input to surface (bypass detection only). */}
      {surfaceCoachCardDecision?.shouldShowCoachCard && v28VisibleSurface?.mode === "branch_complete" ? (
        <div className="rounded-3xl border border-green-200 bg-gradient-to-b from-green-50 to-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-green-700">Line Complete</div>
          <h3 className="mt-1 text-base font-black text-stone-900">{surfaceCoachCardDecision.title ?? "Line complete"}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-700">{surfaceCoachCardDecision.body ?? ""}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {((v28CoachUiModel?.actions ?? []).filter((action)=>action.visible)).map((action)=>(
              <button
                key={action.kind}
                type="button"
                disabled={!action.enabled}
                onClick={()=>handleCoachAction(action.kind)}
                className={action.kind==="continue_from_here"?"rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm":"rounded-2xl bg-white px-4 py-3 font-black text-green-800 shadow-sm"}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : surfaceCoachCardDecision?.shouldShowCoachCard ? (
        <CoachCard
          key={`${trainerFrameId}:surface:${convergedVisibleSurface.targetUci ?? "no-target"}`}
          decision={surfaceCoachCardDecision}
          onAction={handleCoachAction}
          replayEnabled={visualRecipePlayback.replayAvailable && trainerView !== "plain"}
          surfaceActions={v28CoachUiModel?.actions}
          topRightBadge={continuationRatingBadge}
        />
      ) : null}
      {showDetails&&visualRecipe&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="font-black text-stone-800">Visual Recipe</div><div className="mt-2">visualRecipeId: {visualRecipe.visualRecipeId}</div><div>recipeSchemaVersion: {visualRecipe.recipeSchemaVersion}</div><div>patternId: {visualRecipe.patternId}</div><div>recipeMode: {visualRecipe.mode}</div><div>recipeConceptId: {visualRecipe.conceptId}</div><div>recipeFrameId: {visualRecipe.frameId??"n/a"}</div><div>recipeFen: {visualRecipe.fen}</div><div>recipeBeatCount: {visualRecipe.beats.length}</div><div>recipePrimitiveCount: {visualRecipe.beats.reduce((sum,beat)=>sum+beat.primitives.length,0)}</div><div>recipePrimitives: {visualRecipe.beats.flatMap((beat)=>beat.primitives.map((primitive)=>`${primitive.type}:${primitive.id}`)).join(", ")||"none"}</div><div>recipePermissions: {JSON.stringify(visualRecipe.permissions)}</div><div>recipeLearningAnchor: {JSON.stringify(visualRecipe.learningAnchor)}</div><div>recipeSuppressedReason: {visualRecipe.debug?.recipeSuppressedReason??"none"}</div><div>recipeLanes: {visualRecipe.debug?.recipeLanes?.join(", ")||"none"}</div><div>recipeEffectFamilies: {visualRecipe.debug?.recipeEffectFamilies?.join(", ")||"none"}</div><div>recipePrioritySummary: {visualRecipe.debug?.recipePrioritySummary??"none"}</div><div>recipeTimingProfile: {visualRecipe.debug?.recipeTimingProfile?JSON.stringify(visualRecipe.debug.recipeTimingProfile):"n/a"}</div><div>recipeOpacityPolicy: {visualRecipe.debug?.recipeOpacityPolicy?JSON.stringify(visualRecipe.debug.recipeOpacityPolicy):"n/a"}</div><div>suppressedByPriority: {visualRecipe.debug?.suppressedByPriority?.join(", ")||"none"}</div><div>suppressedByBudget: {visualRecipe.debug?.suppressedByBudget?.join(", ")||"none"}</div><div>tacticalPrimitivesPresent: {visualRecipe.debug?.tacticalPrimitivesPresent?"true":"false"}</div><div>tacticalPrimitivesRendered: {visualRecipeOverlay.tacticalPrimitivesRendered?"true":"false"}</div><div>schemaSerializable: {visualRecipe.debug?.schemaSerializable?"true":"false"}</div><div>adapterAllowed: {visualRecipeOverlay.adapterAllowed?"true":"false"}</div><div>adapterSuppressedReason: {visualRecipeOverlay.adapterSuppressedReason??"none"}</div><div>recipeFenRaw: {visualRecipeOverlay.recipeFenRaw??"n/a"}</div><div>boardFenRaw: {visualRecipeOverlay.boardFenRaw}</div><div>recipeFenNormalized: {visualRecipeOverlay.recipeFenNormalized??"n/a"}</div><div>boardFenNormalized: {visualRecipeOverlay.boardFenNormalized??"n/a"}</div><div>recipeFrameIdRaw: {String(visualRecipeOverlay.recipeFrameIdRaw??"n/a")}</div><div>boardFrameIdRaw: {String(visualRecipeOverlay.boardFrameIdRaw)}</div><div>recipeFrameMatchesBoard: {visualRecipeOverlay.recipeFrameMatchesBoard?"true":"false"}</div><div>recipeFenMatchesBoard: {visualRecipeOverlay.recipeFenMatchesBoard?"true":"false"}</div></div>}
      {showDetails&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="font-black text-stone-800">Overlay Lifecycle</div><div className="mt-2">trainerFrameId: {trainerFrameId}</div><div>overlayFrameId: {overlayFrameId}</div><div>overlayFen: {overlayFen??visualRecipe?.fen??"n/a"}</div><div>boardFen: {boardFen}</div><div>overlaySuppressedReason: {overlaySuppressedReason??"none"}</div><div>overlaySource: {overlaySource}</div><div>opponentCandidateRenderedInMainUi: {visualRecipeOverlay.opponentCandidateRenderedInMainUi?"true":"false"}</div><div>staleOverlayIgnored: {staleOverlayFlag?"true":"false"}</div><div>overlayClearedOnPhaseChange: {overlayClearedOnPhaseChange?"true":"false"}</div></div>}
      {showDetails&&visualRecipe&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="flex items-center justify-between gap-3"><div className="font-black text-stone-800">Animation Playback</div><div className="flex items-center gap-2"><button onClick={visualRecipePlayback.replay} disabled={!visualRecipePlayback.replayAvailable||trainerView==="plain"} className={classNames("rounded-full px-3 py-1 text-[11px] font-black",visualRecipePlayback.replayAvailable&&trainerView!=="plain"?"bg-stone-900 text-white":"bg-stone-100 text-stone-400")}>Replay</button><button onClick={visualRecipePlayback.skipToEnd} disabled={visualRecipePlayback.animationState!=="playing"} className={classNames("rounded-full px-3 py-1 text-[11px] font-black",visualRecipePlayback.animationState==="playing"?"bg-stone-900 text-white":"bg-stone-100 text-stone-400")}>Skip</button></div></div><div className="mt-2">animationState: {visualRecipePlayback.animationState}</div><div>activeVisualRecipeId: {visualRecipePlayback.activeVisualRecipeId??"none"}</div><div>activePatternId: {visualRecipePlayback.activePatternId??"none"}</div><div>activeBeatIndex: {visualRecipePlayback.activeBeatIndex??"n/a"}</div><div>activeBeatId: {visualRecipePlayback.activeBeatId??"n/a"}</div><div>activePrimitiveIds: {visualRecipePlayback.activePrimitiveIds.join(", ")||"none"}</div><div>animationReducedMotion: {visualRecipePlayback.animationReducedMotion?"true":"false"}</div><div>animationSkippedToEnd: {visualRecipePlayback.animationSkippedToEnd?"true":"false"}</div><div>animationClearedReason: {visualRecipePlayback.animationClearedReason??"none"}</div><div>animationSuppressedReason: {visualRecipePlayback.animationSuppressedReason??"none"}</div><div>recipeFrameMatchesBoard: {visualRecipePlayback.recipeFrameMatchesBoard?"true":"false"}</div><div>recipeFenMatchesBoard: {visualRecipePlayback.recipeFenMatchesBoard?"true":"false"}</div><div>replayAvailable: {visualRecipePlayback.replayAvailable?"true":"false"}</div><div>tacticalPrimitivesRendered: {visualRecipePlayback.tacticalPrimitivesRendered?"true":"false"}</div></div>}
      {showDetails&&opponentVariationDebug&&<div className="rounded-3xl border border-stone-200 bg-white/95 p-4 text-xs font-semibold text-stone-500 shadow-sm"><div className="font-black text-stone-800">Opponent Variation Guard</div><div className="mt-2">Variation applied: {opponentVariationDebug.opponentVariationApplied?"yes":"no"}</div><div>Reason: {opponentVariationDebug.opponentVariationReason||"n/a"}</div><div>Recent branch keys: {opponentVariationDebug.recentOpponentBranchKeys.join(", ")||"n/a"}</div><div>Selected branch key: {opponentVariationDebug.selectedOpponentBranchKey??"n/a"}</div><div>Candidates: {opponentVariationDebug.candidateOpponentBranches.map((c)=>`${c.san??c.uci}:${c.baseWeight.toFixed(2)}→${c.adjustedWeight.toFixed(2)}:${c.safetyStatus??"unknown"}:${c.selectionScore?.toFixed?.(2)??"n/a"}${c.blockedReason?`(${c.blockedReason})`:""}`).join(", ")||"n/a"}</div><div>Blocked third-repeat branches: {opponentVariationDebug.blockedThirdRepeatBranches.join(", ")||"none"}</div><div>Fallback used: {opponentVariationDebug.fallbackUsed?"yes":"no"}</div><div>continuedPlaySelectedMoveInCandidateList: {opponentVariationDebug.continuedPlaySelectedMoveInCandidateList?"true":"false"}</div><div>continuedPlaySelectionConsistency: {opponentVariationDebug.continuedPlaySelectionConsistency??"n/a"}</div><div>continuationMoveSafetySource: {opponentVariationDebug.continuationMoveSafetySource??"n/a"}</div></div>}
      <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start gap-3">{feedback.toLowerCase().includes("correct")?<CheckCircle2 className="mt-0.5 text-green-700" size={24}/>:feedback.toLowerCase().includes("not quite")||feedback.toLowerCase().includes("illegal")?<XCircle className="mt-0.5 text-red-600" size={24}/>:<Target className="mt-0.5 text-green-700" size={24}/>}<div><div className="font-bold">{endingInfo?endingInfo.title:isReviewingHistory?"Review mode":isUserTurn?"Your move":"Opponent thinking"}</div><p className="text-sm leading-6 text-stone-600">{feedback}</p></div></div></div>
    </section>}
    {activeTab==="review"&&<section className="space-y-5"><header><h1 className="text-2xl font-bold tracking-tight">Review Mistakes</h1><p className="text-sm text-stone-500">Wrong opening moves are saved here.</p></header>{mistakes.length===0?<div className="rounded-3xl bg-white p-6 text-center shadow-sm"><CheckCircle2 className="mx-auto mb-3 text-green-700" size={40}/><h2 className="text-lg font-bold">No mistakes due</h2><p className="mt-2 text-sm text-stone-500">Missed training positions will appear here.</p></div>:<div className="space-y-3">{mistakes.map(m=><button key={m.fen} onClick={()=>practiceMistake(m)} className="w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="font-bold">{m.opening}</div><div className="mt-1 text-sm text-stone-500">Expected: <span className="font-bold text-green-700">{m.expectedMove}</span></div><div className="text-sm text-stone-500">You played: {m.playedMove}</div></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Missed {m.count}x</span></div></button>)}</div>}</section>}
    {activeTab==="progress"&&<section className="space-y-5"><header><h1 className="text-2xl font-bold tracking-tight">Progress</h1><p className="text-sm text-stone-500">Your training snapshot.</p></header><div className="grid grid-cols-3 gap-2"><MetricCard compact label="Accuracy" value={`${accuracy}%`} sub="overall" icon={<Target size={18}/>}/><MetricCard compact label="Trained" value={String(Object.keys(progress.trainedPositions).length)} sub="positions" icon={<BookOpen size={18}/>}/><MetricCard compact label="Review" value={String(mistakes.length)} sub="due" icon={<XCircle size={18}/>} warning/></div></section>}
  </div>{showAddLine&&<div className="fixed inset-0 z-[60] flex items-end bg-black/35 p-4"><div className="mx-auto w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Add Custom Line</h2><button onClick={()=>setShowAddLine(false)} className="rounded-full bg-stone-100 p-2"><X size={18}/></button></div><label className="text-sm font-bold text-stone-700">Name</label><input value={newRepName} onChange={e=>setNewRepName(e.target.value)} className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-green-700"/><label className="mt-4 block text-sm font-bold text-stone-700">Train as</label><div className="mt-1 grid grid-cols-2 rounded-2xl bg-stone-200 p-1 text-sm font-semibold"><button onClick={()=>setNewRepColor("white")} className={classNames("rounded-xl py-2",newRepColor==="white"?"bg-white text-green-700 shadow-sm":"text-stone-500")}>White</button><button onClick={()=>setNewRepColor("black")} className={classNames("rounded-xl py-2",newRepColor==="black"?"bg-white text-green-700 shadow-sm":"text-stone-500")}>Black</button></div><label className="mt-4 block text-sm font-bold text-stone-700">Line in SAN</label><textarea value={newLineText} onChange={e=>setNewLineText(e.target.value)} rows={5} className="mt-1 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-green-700"/><button onClick={createCustomRepertoire} className="mt-4 w-full rounded-2xl bg-green-700 px-4 py-4 font-black text-white shadow-sm">Save and Train</button></div></div>}{showSettings&&<SettingsPanel settings={boardSettings} setSettings={setBoardSettings} onClose={()=>setShowSettings(false)}/>}<BottomNav activeTab={activeTab} setActiveTab={setActiveTab}/><BlundrDiagnosticsPanel snapshot={diagnosticsSnapshot} enabled={blundrDebugEnabled} onEnabledChange={setBlundrDebugEnabled} onClearEvents={()=>setDebugEventLog([])}/></main>
}

function boardThemeClasses(theme:BoardTheme,isDark:boolean){
  if(theme==="slate")return isDark?"bg-slate-600":"bg-slate-200";
  if(theme==="blue")return isDark?"bg-sky-700":"bg-sky-100";
  if(theme==="walnut")return isDark?"bg-amber-800":"bg-amber-100";
  return isDark?"bg-[#779954]":"bg-[#edeed1]";
}
function coordTone(theme:BoardTheme,isDark:boolean){
  if(theme==="classic")return isDark?"text-[#edeed1]":"text-[#779954]";
  return isDark?"text-white/70":"text-stone-600/70";
}

function TapChessboard({game,orientation,selectedSquare,squareStyles,lines,transientLines,onSquareTap,whitePct,evalText,settings,captured,userColor,animationName,adaptiveOpeningIdentity,pendingPromotion,onPromotionSelect,onPromotionCancel}:{game:Chess;orientation:RepertoireColor;selectedSquare:string|null;squareStyles:Record<string,CSSProperties>;lines:ActiveLine[];transientLines:ActiveLine[];onSquareTap:(s:string)=>void;whitePct:number;evalText:string;settings:BoardSettings;captured:CapturedSummary;userColor:ChessColor;animationName?:string;adaptiveOpeningIdentity:AdaptiveOpeningIdentity | null;pendingPromotion:PendingPromotion | null;onPromotionSelect:(piece:PromotionPiece)=>void;onPromotionCancel:()=>void;}){
  const ranks=orientation==="white"?[8,7,6,5,4,3,2,1]:[1,2,3,4,5,6,7,8];
  const files=orientation==="white"?FILES:[...FILES].reverse();
  const centerFor=(sq:string)=>{
    const fileIndex=FILE_TO_INDEX[sq[0]],rank=Number(sq[1]);
    const col=orientation==="white"?fileIndex:7-fileIndex;
    const row=orientation==="white"?8-rank:rank-1;
    return{x:(col+.5)*12.5,y:(row+.5)*12.5}
  };
  const topColor:ChessColor=userColor==="w"?"b":"w";
  const bottomColor=userColor;
  return <div className="mx-auto w-full max-w-[450px]">
    {settings.showCaptured?<CapturedStrip color={topColor} captured={topColor==="w"?captured.blackCaptured:captured.whiteCaptured} advantage={captured.materialAdvantage.side===topColor?captured.materialAdvantage.value:0} label="Opponent" settings={settings}/>:null}
    <div className="flex items-stretch gap-2">
      {settings.showEvalBar?<EvalBar whitePct={whitePct} evalText={evalText}/>:null}
      <div className="flex-1 rounded-[28px] bg-white p-3 shadow-xl shadow-stone-300/40 ring-1 ring-stone-200">
        <div className={classNames("relative aspect-square w-full overflow-hidden rounded-[18px] border border-stone-300 bg-stone-200",visualAnimationClass(animationName))}>
          <BoardLines lines={lines} centerFor={centerFor} transient={false}/>
          <BoardLines lines={transientLines} centerFor={centerFor} transient/>
          <div className="grid h-full w-full grid-cols-8 grid-rows-8">
            {ranks.flatMap((rank,rowIndex)=>files.map((file,colIndex)=>{
              const square=`${file}${rank}`;
              const piece=getPiece(game,square);
              const isDark=(FILES.indexOf(file)+rank)%2===1;
              const showRank=colIndex===0;
              const showFile=rowIndex===7;
              return <button key={square} type="button" onClick={()=>onSquareTap(square)} className={classNames("relative flex h-full w-full select-none items-center justify-center overflow-hidden",boardThemeClasses(settings.boardTheme,isDark),selectedSquare===square?"ring-4 ring-inset ring-green-800":"")} style={squareStyles[square]??{}}>
                {showRank?<span className={classNames("pointer-events-none absolute left-1 top-0.5 text-[10px] font-black",coordTone(settings.boardTheme,isDark))}>{rank}</span>:null}
                {showFile?<span className={classNames("pointer-events-none absolute bottom-0.5 right-1 text-[10px] font-black",coordTone(settings.boardTheme,isDark))}>{file}</span>:null}
                <span className={classNames("pointer-events-none flex h-full w-full items-center justify-center leading-none antialiased",settings.pieceStyle==="letters"?"font-black font-sans":"font-serif",piece?.color==="w"?"text-stone-50 [text-shadow:0_2px_3px_rgba(0,0,0,.55)]":"text-stone-950 [text-shadow:0_1px_1px_rgba(255,255,255,.25)]")} style={{fontSize:settings.pieceStyle==="letters"?"min(8.5vw,36px)":"min(10vw,42px)",transform:"translateY(-1px)"}}>{piece?pieceGlyph(piece.color as ChessColor,piece.type,settings.pieceStyle):""}</span>
              </button>
            }))}
          </div>
          {pendingPromotion&&<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 p-4" onClick={onPromotionCancel}>
            <div className="w-full max-w-[250px] rounded-[24px] border border-stone-200 bg-white p-3 shadow-2xl" onClick={(event)=>event.stopPropagation()}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-stone-500">Promotion</div>
                  <div className="text-sm font-black text-stone-900">{pendingPromotion.from} → {pendingPromotion.to}</div>
                </div>
                <button type="button" onClick={onPromotionCancel} className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-black text-stone-600">Cancel</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["q","r","b","n"] as PromotionPiece[]).map((piece) => {
                  const enabled = pendingPromotion.legalPromotionUcis.some((uci) => uci.endsWith(piece));
                  return (
                    <button
                      key={piece}
                      type="button"
                      disabled={!enabled}
                      onClick={() => onPromotionSelect(piece)}
                      className={classNames(
                        "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-black shadow-sm transition",
                        enabled ? "border-stone-200 bg-stone-50 text-stone-900 hover:bg-white" : "cursor-not-allowed border-stone-100 bg-stone-50 text-stone-300",
                      )}
                    >
                      <span className={classNames("text-lg leading-none", pendingPromotion.color === "w" ? "text-stone-950" : "text-stone-950")}>{pieceGlyph(pendingPromotion.color, piece, settings.pieceStyle)}</span>
                      <span>{piece.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
    {settings.showCaptured?<CapturedStrip color={bottomColor} captured={bottomColor==="w"?captured.blackCaptured:captured.whiteCaptured} advantage={captured.materialAdvantage.side===bottomColor?captured.materialAdvantage.value:0} label="You" settings={settings}/>:null}
    <AdaptiveOpeningIdentityBadge identity={adaptiveOpeningIdentity}/>
  </div>
}

function AdaptiveOpeningIdentityBadge({identity}:{identity:AdaptiveOpeningIdentity | null}){
  if(!identity)return null;
  const openingName=identity.openingFamilyName??identity.currentOpeningName;
  return <div className="mx-1 mt-2 rounded-2xl border border-stone-200 bg-white/90 px-3 py-2 text-xs leading-5 text-stone-600 shadow-sm">
    <div><span className="font-black text-stone-900">Opening: </span>{openingName}</div>
    {identity.opponentOpeningName?<div><span className="font-black text-stone-900">Opponent: </span>{identity.opponentOpeningName}</div>:null}
  </div>;
}

function CapturedStrip({color,captured,advantage,label,settings}:{color:ChessColor;captured:string[];advantage:number;label:string;settings:BoardSettings}){
  return <div className="my-2 flex min-h-8 items-center justify-between rounded-2xl bg-white/90 px-3 py-2 text-xs font-black text-stone-600 shadow-sm ring-1 ring-stone-200">
    <div className="flex min-w-0 items-center gap-2"><span className="shrink-0 text-stone-400">{label}</span><span className="truncate text-base leading-none">{captured.length?captured.map((t,i)=><span key={`${t}-${i}`}>{pieceGlyph(color,t,settings.pieceStyle)}</span>):<span className="text-xs text-stone-300">no captures</span>}</span></div>
    {advantage>0?<span className="rounded-full bg-green-50 px-2 py-1 text-green-700">+{advantage} material</span>:<span className="rounded-full bg-stone-100 px-2 py-1 text-stone-400">even</span>}
  </div>
}

function EvalBar({whitePct,evalText}:{whitePct:number;evalText:string}){
  const blackPct=100-whitePct;
  return <div className="relative flex w-10 shrink-0 flex-col overflow-hidden rounded-2xl bg-stone-950 shadow-sm ring-1 ring-stone-200">
    <div className="flex items-center justify-center bg-stone-950 text-[10px] font-black text-white transition-all duration-500" style={{height:`${blackPct}%`,minHeight:"8%"}}>{blackPct>34?<span className="rotate-90 tracking-tight">Black</span>:null}</div>
    <div className="flex items-center justify-center bg-stone-50 text-[10px] font-black text-stone-950 transition-all duration-500" style={{height:`${whitePct}%`,minHeight:"8%"}}>{whitePct>34?<span className="-rotate-90 tracking-tight">White</span>:null}</div>
    <div className="pointer-events-none absolute inset-x-0 top-2 mx-auto max-w-9 rounded-full bg-amber-50/95 px-1 text-center text-[8px] font-black leading-3 text-amber-700 shadow-sm">{evalText}</div>
  </div>
}

function temporalGateColor(line:ActiveLine,transient:boolean){if(transient||line.kind==="opponent")return{primary:"#b884ff",secondary:"#d2b0ff",danger:"#f0e5ff",soft:"rgba(184,132,255,.14)"};if(line.kind==="defense")return{primary:"#21b8a6",secondary:"#84e8dd",danger:"#d8faf4",soft:"rgba(33,184,166,.14)"};if(line.kind==="attack")return{primary:"#ff7a59",secondary:"#ffc26a",danger:"#ffe3b0",soft:"rgba(255,122,89,.14)"};return{primary:"#5e7eff",secondary:"#9cb7ff",danger:"#dce6ff",soft:"rgba(94,126,255,.14)"}}
function BoardLines({lines,centerFor,transient}:{lines:ActiveLine[];centerFor:(s:string)=>{x:number;y:number};transient:boolean}){const visible=lines.filter(l=>isValidSquare(l.from)&&isValidSquare(l.to)).slice(0,transient?1:2);if(!visible.length)return null;return <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none"><defs>{visible.map((l,i)=>{const c=temporalGateColor(l,transient);return <linearGradient key={i} id={`tg-${transient?"t":"p"}-${i}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={c.primary} stopOpacity=".22"/><stop offset="54%" stopColor={c.secondary} stopOpacity=".92"/><stop offset="100%" stopColor={c.primary} stopOpacity=".76"/></linearGradient>})}</defs>{visible.map((l,i)=>{const f=centerFor(l.from),t=centerFor(l.to),c=temporalGateColor(l,transient);const knight=isKnightGeometry(l.from,l.to);const corner={x:t.x,y:f.y};const d=knight?`M ${f.x} ${f.y} L ${corner.x} ${corner.y} L ${t.x} ${t.y}`:`M ${f.x} ${f.y} Q ${(f.x+t.x)/2} ${(f.y+t.y)/2-3.2} ${t.x} ${t.y}`;const points=`${f.x},${f.y} ${corner.x},${corner.y} ${t.x},${t.y}`;const dash=transient?"2.4 1.8":undefined;return <g key={`${l.from}-${l.to}-${i}`} className={transient?"blundr-opponent-line":"blundr-intent-line"}><circle cx={f.x} cy={f.y} r="4.0" fill={c.soft} opacity=".95"/><circle cx={f.x} cy={f.y} r="3.15" fill="none" stroke={c.primary} strokeWidth=".72" opacity=".9"/><circle cx={t.x} cy={t.y} r="6.1" fill={c.soft} opacity=".95"/><circle cx={t.x} cy={t.y} r="4.7" fill="none" stroke={c.primary} strokeWidth=".82" opacity=".96"/><circle cx={t.x} cy={t.y} r="2.15" fill={c.primary} opacity=".22"/>{knight?<><polyline points={points} fill="none" stroke={c.soft} strokeWidth={transient?"2.4":"2.15"} strokeLinecap="round" strokeLinejoin="round" opacity=".9"/><polyline points={points} fill="none" stroke={`url(#tg-${transient?"t":"p"}-${i})`} strokeWidth={transient?"1.2":"1.02"} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash}/></>:<><path d={d} fill="none" stroke={c.soft} strokeWidth={transient?"2.3":"2.0"} strokeLinecap="round" opacity=".9"/><path d={d} fill="none" stroke={`url(#tg-${transient?"t":"p"}-${i})`} strokeWidth={transient?"1.12":".98"} strokeLinecap="round" strokeDasharray={dash}/></>}</g>})}</svg>}

function HistoryControls({index,total,onBack,onForward}:{index:number;total:number;onBack:()=>void;onForward:()=>void}){return <div className="mt-3 flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2 text-xs font-black text-stone-500"><button disabled={index<=0} onClick={onBack} className="rounded-full bg-white px-3 py-2 text-stone-700 shadow-sm disabled:opacity-30">← Back</button><span>{total<=1?"Start position":`Move review ${index}/${total-1}`}</span><button disabled={index>=total-1} onClick={onForward} className="rounded-full bg-white px-3 py-2 text-stone-700 shadow-sm disabled:opacity-30">Forward →</button></div>}
function GameEndCard({title,message,onRestart}:{title:string;message:string;onRestart:()=>void}){return <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center shadow-sm"><div className="text-xs font-black uppercase tracking-wide text-amber-700">Game concluded</div><h2 className="mt-1 text-2xl font-black text-amber-950">{title}</h2><p className="mt-2 text-sm leading-6 text-amber-800">{message}</p><button onClick={onRestart} className="mt-4 w-full rounded-2xl bg-amber-600 px-4 py-3 font-black text-white shadow-sm">Restart</button></div>}

function SettingsPanel({settings,setSettings,onClose}:{settings:BoardSettings;setSettings:(s:BoardSettings)=>void;onClose:()=>void}){
  const update=<K extends keyof BoardSettings>(key:K,value:BoardSettings[K])=>setSettings({...settings,[key]:value});
  const toggle=(key:keyof Pick<BoardSettings,"showAttack"|"showDefense"|"showPlan"|"showMoveDots"|"showEvalBar"|"showCaptured"|"showOpponentCue">)=>setSettings({...settings,[key]:!settings[key]});
  const OptionButton=({active,label,onClick}:{active:boolean;label:string;onClick:()=>void})=><button onClick={onClick} className={classNames("rounded-2xl px-3 py-2 text-xs font-black",active?"bg-green-700 text-white":"bg-stone-100 text-stone-600")}>{label}</button>;
  const Toggle=({id,label}:{id:keyof Pick<BoardSettings,"showAttack"|"showDefense"|"showPlan"|"showMoveDots"|"showEvalBar"|"showCaptured"|"showOpponentCue">;label:string})=><button onClick={()=>toggle(id)} className={classNames("flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-black",settings[id]?"bg-green-50 text-green-800":"bg-stone-100 text-stone-500")}><span>{label}</span><span>{settings[id]?"ON":"OFF"}</span></button>;
  return <div className="fixed inset-0 z-[70] flex items-end bg-black/35 p-4"><div className="mx-auto max-h-[86vh] w-full max-w-md overflow-auto rounded-3xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black">Board Settings</h2><p className="text-xs font-semibold text-stone-500">Customize board, pieces, and active displays.</p></div><button onClick={onClose} className="rounded-full bg-stone-100 p-2"><X size={18}/></button></div><div className="space-y-5"><div><div className="mb-2 text-sm font-black">Board</div><div className="grid grid-cols-4 gap-2"><OptionButton active={settings.boardTheme==="classic"} label="Classic" onClick={()=>update("boardTheme","classic")}/><OptionButton active={settings.boardTheme==="slate"} label="Slate" onClick={()=>update("boardTheme","slate")}/><OptionButton active={settings.boardTheme==="blue"} label="Blue" onClick={()=>update("boardTheme","blue")}/><OptionButton active={settings.boardTheme==="walnut"} label="Walnut" onClick={()=>update("boardTheme","walnut")}/></div></div><div><div className="mb-2 text-sm font-black">Pieces</div><div className="grid grid-cols-3 gap-2"><OptionButton active={settings.pieceStyle==="unicode"} label="Classic" onClick={()=>update("pieceStyle","unicode")}/><OptionButton active={settings.pieceStyle==="neo"} label="Neo" onClick={()=>update("pieceStyle","neo")}/><OptionButton active={settings.pieceStyle==="letters"} label="Letters" onClick={()=>update("pieceStyle","letters")}/></div></div><div><div className="mb-2 text-sm font-black">Active displays</div><div className="grid grid-cols-2 gap-2"><Toggle id="showMoveDots" label="Legal move dots"/><Toggle id="showEvalBar" label="Advantage bar"/><Toggle id="showCaptured" label="Captured pieces"/><Toggle id="showOpponentCue" label="Show Last Opponent Move"/></div></div><button onClick={onClose} className="w-full rounded-2xl bg-stone-950 px-4 py-4 font-black text-white">Done</button></div></div></div>
}

function PipelineStatus({step,note}:{step:ThinkingStep;note:string}){const labels:Record<ThinkingStep,string>={idle:"Ready",facts:"Analyzing",engine:"Engine",brain:"Blundr Brain","gpt-receive":"Receiving","visual-update":"Updating",ready:"Ready",error:"Error"};const tone=step==="error"?"bg-red-50 text-red-700 ring-red-100":step==="ready"||step==="idle"?"bg-green-50 text-green-700 ring-green-100":"bg-blue-50 text-blue-700 ring-blue-100";return <div className={classNames("max-w-[190px] rounded-2xl px-3 py-2 text-right text-[11px] font-black leading-4 ring-1",tone)} title={note}><div>{labels[step]}</div><div className="truncate text-[10px] font-semibold opacity-75">{note}</div></div>}
function MoveImpact({impact}:{impact:{label:string;pct:number;tone:string;note:string}}){return <div className="mt-3 rounded-2xl bg-stone-50 p-3"><div className="mb-2 flex items-center justify-between text-xs font-black"><span>Move Impact</span><span className="text-green-700">{impact.label}</span></div><div className="h-2 rounded-full bg-stone-200"><div className={classNames("h-2 rounded-full",impact.tone)} style={{width:`${impact.pct}%`}}/></div><p className="mt-2 text-xs leading-5 text-stone-500">{impact.note}</p></div>}
function GptDebugPanel({open,setOpen,text}:{open:boolean;setOpen:(v:boolean)=>void;text:string}){
  return <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-black text-stone-950">GPT Debug Cell</div>
        <div className="text-xs font-semibold text-stone-500">Live prompt/input/output from /api/brain</div>
      </div>
      <button onClick={()=>setOpen(!open)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{open?"Hide":"Show"}</button>
    </div>
    {open?<pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-stone-950 p-3 text-[10px] leading-4 text-green-200 whitespace-pre-wrap">{text}</pre>:null}
  </div>
}

function VisualDebugPanel({open,setOpen,visualText,telemetryText,telemetryEnabled,setTelemetryEnabled,telemetryCount,onClearTelemetry}:{open:boolean;setOpen:(v:boolean)=>void;visualText:string;telemetryText:string;telemetryEnabled:boolean;setTelemetryEnabled:(v:boolean)=>void;telemetryCount:number;onClearTelemetry:()=>void}){
  return <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-black text-stone-950">Visual Debug Panel</div>
        <div className="text-xs font-semibold text-stone-500">Rule visual payload/response plus local-only telemetry events.</div>
      </div>
      <button onClick={()=>setOpen(!open)} className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-600">{open?"Hide":"Show"}</button>
    </div>
    {open?<div className="mt-3 space-y-3">
      <div className="flex items-center justify-between rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-600">
        <span>Telemetry: {telemetryEnabled?"enabled":"disabled"} • {telemetryCount} event{telemetryCount===1?"":"s"}</span>
        <div className="flex items-center gap-2">
          <button onClick={()=>setTelemetryEnabled(!telemetryEnabled)} className={classNames("rounded-full px-3 py-1 font-black",telemetryEnabled?"bg-green-700 text-white":"bg-stone-200 text-stone-700")}>{telemetryEnabled?"Disable":"Enable"}</button>
          <button onClick={onClearTelemetry} className="rounded-full bg-stone-200 px-3 py-1 font-black text-stone-700">Clear</button>
        </div>
      </div>
      <div>
        <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-stone-500">Visual Snapshot</div>
        <pre className="max-h-52 overflow-auto rounded-2xl bg-stone-950 p-3 text-[10px] leading-4 text-green-200 whitespace-pre-wrap">{visualText}</pre>
      </div>
      <div>
        <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-stone-500">Local Telemetry Events</div>
        <pre className="max-h-52 overflow-auto rounded-2xl bg-stone-950 p-3 text-[10px] leading-4 text-green-200 whitespace-pre-wrap">{telemetryText}</pre>
      </div>
    </div>:null}
  </div>
}

function LiveBrain({brain}:{brain:LiveBrain}){return <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm"><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-black"><Zap size={16} className="text-green-700"/> Live Brain</div><span className="text-xs font-black text-stone-400">{brain.ratingLabel} • {brain.ratingPool}</span></div><div className="grid grid-cols-4 gap-1.5"><Status label="Book" state={brain.book}/><Status label="Lichess" state={brain.lichess}/><Status label="Engine" state={brain.engine}/><Status label="Brain" state={brain.gpt}/></div><div className="mt-2 rounded-2xl bg-stone-50 px-3 py-2 text-xs font-semibold leading-5 text-stone-500">Source: <span className="font-black text-stone-800">{brain.source}</span>{brain.latency?` • ${brain.latency} ms`:""}{brain.note?` • ${brain.note}`:""}</div></div>}
function Status({label,state}:{label:string;state:SystemState}){const tone=state==="active"||state==="ready"||state==="cached"?"bg-green-50 text-green-700":state==="loading"?"bg-blue-50 text-blue-700":state==="fallback"||state==="complete"?"bg-amber-50 text-amber-700":state==="error"?"bg-red-50 text-red-700":"bg-stone-100 text-stone-500";return <div className={classNames("rounded-full px-2 py-1 text-center text-[10px] font-black",tone)}>{label}: {state}</div>}
function MetricCard({label,value,sub,icon,warning=false,compact=false}:{label:string;value:string;sub:string;icon:ReactNode;warning?:boolean;compact?:boolean}){return <div className={classNames("rounded-3xl bg-white shadow-sm",compact?"p-3":"p-4")}><div className={classNames("mb-2",warning?"text-orange-600":"text-green-700")}>{icon}</div><div className="text-xs text-stone-500">{label}</div><div className={classNames("font-black tracking-tight",compact?"text-xl":"text-3xl")}>{value}</div><div className="text-xs text-stone-400">{sub}</div></div>}
function BottomNav({activeTab,setActiveTab}:{activeTab:string;setActiveTab:(tab:Tab)=>void}){const tabs=[{id:"home",label:"Home",icon:Home},{id:"train",label:"Train",icon:Target},{id:"review",label:"Review",icon:CheckCircle2},{id:"progress",label:"Progress",icon:BarChart3},{id:"repertoire",label:"Repertoire",icon:BookOpen}] as const;return <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-2 pb-4 pt-2 backdrop-blur"><div className="mx-auto grid max-w-md grid-cols-5 gap-1">{tabs.map(tab=>{const Icon=tab.icon;const active=activeTab===tab.id;return <button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={classNames("flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold",active?"bg-green-50 text-green-700":"text-stone-500")}><Icon size={19}/>{tab.label}</button>})}</div></nav>}
