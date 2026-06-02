export type CoachViewMode = "assisted" | "plain" | "reveal" | "freeplay";

export type CoachMode =
  | "assisted_teach"
  | "assisted_reinforce"
  | "assisted_wrong_move"
  | "plain_prompt"
  | "plain_hint"
  | "plain_wrong_move"
  | "plain_answer_revealed"
  | "correct_fast"
  | "correct_slow"
  | "review_ready"
  | "supported_continuation"
  | "freeplay_principle"
  | "suppressed";

export type CoachAction =
  | "show_explanation"
  | "show_soft_hint"
  | "show_strong_hint"
  | "show_answer"
  | "show_reinforcement"
  | "show_plan"
  | "stay_quiet";

export type CoachButton =
  | "hint"
  | "answer"
  | "why"
  | "replay"
  | "hide"
  | "try_again"
  | "show_plan"
  | "analyze_idea"
  | "show_move"
  | "continue_from_here"
  | "restart_line"
  | "show_more"; // v2.7.40 Agent 4: first-class Plain action (visible via policy, passed through CoachCard casts)

export type CoachRevealRisk = "none" | "low" | "medium" | "full_answer";

export type CoachClaimType =
  | "board_fact"
  | "plan_principle"
  | "opening_pattern"
  | "engine_safe_recommendation"
  | "pattern_transfer"
  | "human_likelihood"
  | "tactical_claim";

export interface CoachContext {
  frameId: string;
  fen: string;
  normalizedFen: string;
  viewMode: CoachViewMode;
  revealState: "hidden" | "revealed";
  phase: string;
  userToMove: boolean;
  bookStatus: "in_book" | "book_complete" | "near_book" | "out_of_book";
  conceptId?: string;
  patternId?: string;
  visualRecipeId?: string;
  moveUci?: string;
  moveSan?: string;
  keySquares: string[];
  keyPieces: string[];
  visualPrimitiveTypes: string[];
  moveTrust?: string;
  contextTrust?: string;
  attempts: number;
  wrongAttempts: number;
  hintUsed: boolean;
  answerShown: boolean;
  elapsedMs: number;
  priorPatternMisses: number;
  priorPatternSuccesses: number;
  recentUtteranceIds: string[];
  recentUtteranceFamilies: string[];
  recipeFrameMatchesBoard: boolean;
  recipeFenMatchesBoard: boolean;
  exactMoveAllowed: boolean;
  canShowAnswerMove: boolean;
  canShowContext: boolean;
  source: "visual_recipe" | "training_context" | "live_coach" | "none";
}

export interface CoachDecision {
  mode: CoachMode;
  action: CoachAction;
  frameId?: string;
  normalizedFen?: string;
  title?: string;
  body?: string;
  hint?: string;
  answer?: string;
  why?: string;
  buttons: CoachButton[];
  shouldShowCoachCard: boolean;
  shouldMarkReviewWorthy: boolean;
  exactMoveAllowed?: boolean;
  revealRisk: CoachRevealRisk;
  givesAnswer: boolean;
  claimTypes: CoachClaimType[];
  utteranceId?: string;
  utteranceFamily?: string;
  suppressedReason?: string;
  debug?: Record<string, unknown>;
}

export interface CoachCopyEntry {
  utteranceId: string;
  utteranceFamily: string;
  conceptId: string;
  title?: string;
  text: string;
  allowedModes: CoachMode[];
  blockedModes?: CoachMode[];
  requiredConcreteObjects: string[];
  claimTypes: CoachClaimType[];
  revealRisk: CoachRevealRisk;
  givesAnswer: boolean;
  requiresAnswerPermission: boolean;
}

export interface CoachUtteranceMemoryEntry {
  patternId: string;
  conceptId: string;
  visualRecipeId: string;
  coachMode: CoachMode;
  coachAction: CoachAction;
  utteranceId: string;
  utteranceFamily: string;
  text: string;
  shownAt: number;
}

export type CoachContextInput = {
  frameId: number | string;
  boardFen: string;
  viewMode: CoachViewMode;
  revealState: "hidden" | "revealed";
  phase: string;
  userToMove: boolean;
  bookStatus: CoachContext["bookStatus"];
  trainingContext?: {
    moveTrust?: string;
    contextTrust?: string;
    conceptId?: string;
    patternId?: string;
  } | null;
  visualRecipe?: {
    frameId?: number | string;
    fen?: string;
    mode?: string;
    conceptId?: string;
    patternId?: string;
    visualRecipeId?: string;
    moveUci?: string;
    moveSan?: string;
    keySquares?: string[];
    keyPieces?: string[];
    primitiveTypes?: string[];
    canShowAnswerMove?: boolean;
    canShowContext?: boolean;
  } | null;
  attempts: number;
  wrongAttempts: number;
  hintUsed: boolean;
  answerShown: boolean;
  elapsedMs: number;
  priorPatternMisses: number;
  priorPatternSuccesses: number;
  recentUtteranceIds: string[];
  recentUtteranceFamilies: string[];
};

export type CoachDecisionInput = {
  context: CoachContext | null;
  interaction: "none" | "hint" | "answer" | "why" | "hide" | "show_plan" | "analyze_idea" | "show_move";
  outcome: "none" | "wrong" | "correct";
  hintRequestCount: number;
  utteranceMemory: CoachUtteranceMemoryEntry[];
  brainInput?: {
    fen: string;
    trainerFrameId?: string;
    trainingMode: "restricted" | "continuation";
    viewMode: "assisted" | "plain" | "freeplay";
    bookStatus: CoachContext["bookStatus"];
    expectedMoveUci?: string;
    expectedMoveSan?: string;
    selectedCandidateMoveUci?: string;
    selectedCandidateMoveSan?: string;
    enginePreview?: unknown;
    visualRecipe?: unknown;
    trainingContext?: unknown;
    teachingOrchestration?: unknown;
    repertoireMoves?: string[];
    lichessContinuationMoves?: string[];
    maiaRaw?: unknown;
    stale?: boolean;
    expectedMoveSource?: string;
    expectedMoveCoverageTier?: string;
    expectedMoveResolutionReason?: string;
  };
};
