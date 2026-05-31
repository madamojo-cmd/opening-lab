import type { CoachClaimType, CoachMode } from "../coach/coachTypes";
import type {
  CoachOpportunity,
  EngineSignalSet,
  LiveCoachIntent,
  MaiaSignalSet,
  PatternSignalSet,
  PositionFeatureSet,
} from "../liveCoach/liveCoachTypes";

export interface CoachBenchmarkFixture {
  id: string;
  title: string;
  fen: string;
  normalizedFen: string;
  sideToMove: "w" | "b";
  moveHistorySan: string[];
  viewMode: "assisted" | "plain" | "freeplay";
  bookStatus: "in_book" | "book_complete" | "near_book" | "out_of_book";
  userState: {
    attempts: number;
    wrongAttempts: number;
    hintUsed: boolean;
    answerShown: boolean;
    elapsedMs: number;
    priorPatternMisses: number;
    priorPatternSuccesses: number;
    weakConcepts: string[];
  };
  visualRecipeFixture?: {
    conceptId: string;
    patternId: string;
    moveUci?: string;
    moveSan?: string;
    keySquares: string[];
    keyPieces: string[];
    primitiveTypes: string[];
    frameMatches: boolean;
    fenMatches: boolean;
  };
  maiaFixture?: MaiaSignalSet;
  engineFixture?: EngineSignalSet;
  positionFeatureFixture?: PositionFeatureSet;
  patternSignalFixture?: PatternSignalSet;
  expected: {
    allowedCoachModes?: CoachMode[];
    allowedLiveOpportunities?: CoachOpportunity[];
    allowedIntents?: LiveCoachIntent[];
    exactMoveAllowed: boolean;
    shouldShowAnswerButton: boolean;
    shouldShowPlanButton: boolean;
    shouldMarkReviewWorthy?: boolean;
    requiredConcepts?: string[];
    requiredObjects?: string[];
    forbiddenTerms: string[];
    forbiddenClaimTypes?: CoachClaimType[];
    shouldStaySilent?: boolean;
  };
}

export interface CoachBenchmarkResult {
  fixtureId: string;
  passed: boolean;
  score: number;
  failures: string[];
  selectedMode?: string;
  selectedOpportunity?: string;
  selectedIntent?: string;
  selectedText?: string;
  selectedButtons?: string[];
  exactMoveAllowed?: boolean;
  claimTypes?: string[];
}

export interface CoachBenchmarkEvaluation {
  mode?: string;
  opportunity?: string;
  intent?: string;
  text?: string;
  buttons: string[];
  exactMoveAllowed: boolean;
  shouldMarkReviewWorthy?: boolean;
  claimTypes: string[];
  silent: boolean;
  blockedClaims?: string[];
}
