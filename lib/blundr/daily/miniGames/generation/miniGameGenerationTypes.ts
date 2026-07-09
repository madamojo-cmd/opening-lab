import type { BlundrBoardPreferences } from "@/lib/blundr/board/boardThemeTypes";
import type { Square } from "@/lib/blundr/geometry/boardTypes";
import type { DailyMiniGameId, DailyMiniGameSkillId, DailyMiniGameSource } from "../dailyMiniGameTypes";
import type { MiniGameEngineQuality } from "./miniGameEngineQualityTypes";

export const MINI_GAME_GENERATOR_VERSION = "8p-stockfish-adjudicated-v1" as const;

export type GeneratedMiniGameDifficulty = "easy" | "medium" | "hard";

export type MiniGameObjectiveVerification = {
  verified: true;
  verifier: string;
  objectiveScore?: number;
  notes?: string[];
};

export type GeneratedMiniGameScenario = {
  scenarioKey: string;
  miniGameId: DailyMiniGameId;
  source: DailyMiniGameSource;

  family: string;
  motif?: string;
  difficulty: GeneratedMiniGameDifficulty;
  estimatedTimeSeconds: number;

  board: {
    fen: string;
    orientation: "white" | "black";
    sideToMove: "w" | "b";
    lockedOrientation: true;
  };

  prompt: string;
  instruction: string;
  goal: string;
  explanation: string;

  solution: {
    primaryMoveUci: string;
    acceptedMoves: string[];
    from: Square;
    to: Square;
    promotion?: "q" | "r" | "b" | "n";
    verification: MiniGameObjectiveVerification;
  };

  overlays: {
    selectedSquares?: Square[];
    targetSquares?: Square[];
    keySquares?: Square[];
    dangerSquares?: Square[];
    arrows?: Array<{ from: Square; to: Square; type: string }>;
    route?: Square[];
    lastMove?: { from: Square; to: Square };
  };

  conceptTags: string[];

  metadata: {
    seed: string | number;
    generatorVersion: string;
    generatorKind: "procedural";
    usedStaticFallback: boolean;
    templateId?: string;
    scaffoldId?: string;
    transformIds: string[];
    validationPassed: true;
    objectiveValidationPassed: true;
    solutionVerified: true;
  };
  engineQuality?: MiniGameEngineQuality;
};

export type MiniGameGeneratorAnalysis = {
  complexity: number;
  decoyCount: number;
  blockerCount: number;
  routeLength: number;
  forcing: boolean;
  materialBalance: number;
  candidateCount: number;
  note?: string;
};

export type MiniGameGenerationCandidate = {
  miniGameId: DailyMiniGameId;
  source: DailyMiniGameSource;
  seed: string | number;
  family: string;
  motif?: string;
  difficulty: GeneratedMiniGameDifficulty;
  estimatedTimeSeconds: number;
  board: GeneratedMiniGameScenario["board"];
  prompt: string;
  instruction: string;
  goal: string;
  explanation: string;
  solution: {
    primaryMoveUci: string;
    acceptedMoves?: string[];
    from: Square;
    to: Square;
    promotion?: "q" | "r" | "b" | "n";
    verification?: Partial<MiniGameObjectiveVerification>;
  };
  overlays: GeneratedMiniGameScenario["overlays"];
  conceptTags: string[];
  analysis: MiniGameGeneratorAnalysis;
  transformIds?: string[];
  templateId?: string;
  scaffoldId?: string;
  engineQuality?: MiniGameEngineQuality | null;
};

export type MiniGameGenerationInput = {
  miniGameId: DailyMiniGameId;
  seed: string | number;
  difficulty: GeneratedMiniGameDifficulty;
  source: DailyMiniGameSource;
  userBoardPreference?: Partial<BlundrBoardPreferences> | null;
  recentScenarioKeys?: readonly string[] | null;
  dateKey: string;
  userId?: string | null;
};

export type MiniGameScenarioValidationIssue = {
  code: string;
  message: string;
  path?: string;
};

export type MiniGameScenarioValidationResult = {
  valid: boolean;
  issues: MiniGameScenarioValidationIssue[];
  notes: string[];
};

export type MiniGameObjectiveValidationResult = {
  passed: boolean;
  objectiveScore: number;
  notes: string[];
  issues: MiniGameScenarioValidationIssue[];
};

export type MiniGameSolutionVerificationResult = {
  verified: boolean;
  verifier: string;
  objectiveScore: number;
  notes: string[];
  issues: MiniGameScenarioValidationIssue[];
};

export type ProceduralMiniGameGenerator = {
  id: DailyMiniGameId;
  title: string;
  summary: string;
  displayName?: string;
  shortDescription?: string;
  skillIds: readonly DailyMiniGameSkillId[];
  recommendedFor: readonly GeneratedMiniGameDifficulty[];
  instructions?: string;
  estimatedSeconds?: number;
  tags?: readonly string[];
  canAppearInDailyBlundr?: boolean;
  canAppearInStandalonePractice?: boolean;
  selectionPriority?: number;
  generateCandidate: (input: MiniGameGenerationInput) => MiniGameGenerationCandidate | null;
  validateObjective: (candidate: MiniGameGenerationCandidate) => MiniGameObjectiveValidationResult;
  verifySolution: (candidate: MiniGameGenerationCandidate) => MiniGameSolutionVerificationResult;
  classifyDifficulty: (candidate: MiniGameGenerationCandidate) => GeneratedMiniGameDifficulty;
  buildFallbackScenario: (input: MiniGameGenerationInput) => GeneratedMiniGameScenario | null;
};

export type MiniGameGenerationAttemptResult = {
  scenario: GeneratedMiniGameScenario | null;
  attempts: number;
  usedStaticFallback: boolean;
  failureReason: string | null;
};

export function isGeneratedMiniGameDifficulty(value: unknown): value is GeneratedMiniGameDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

export function normalizeGeneratedMiniGameDifficulty(value: unknown): GeneratedMiniGameDifficulty {
  return value === "easy" || value === "medium" || value === "hard" ? value : "medium";
}

export function mapLegacyDifficultyToGeneratedDifficulty(value: unknown): GeneratedMiniGameDifficulty {
  const text = String(value ?? "").trim();
  if (text === "intro" || text === "beginner") return "easy";
  if (text === "early_intermediate" || text === "intermediate") return "medium";
  return "hard";
}

export function mapGeneratedDifficultyToLegacyDifficulty(value: GeneratedMiniGameDifficulty): "intro" | "beginner" | "early_intermediate" | "intermediate" | "advanced" | "expert" {
  if (value === "easy") return "beginner";
  if (value === "medium") return "intermediate";
  return "advanced";
}

export function createEmptyScenarioValidationResult(): MiniGameScenarioValidationResult {
  return {
    valid: true,
    issues: [],
    notes: [],
  };
}
