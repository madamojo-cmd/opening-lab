export const DAILY_BLUNDR_SCHEMA_VERSION = 1 as const;

export type DailyBlundrCardKind = "recall" | "mastery" | "weak_spot" | "mini_game" | "training_game";
export type DailyBlundrCardSource = "learning_event" | "progress_mistake" | "merged";
export type DailyBlundrAttemptOutcome = "correct" | "incorrect" | "skip" | "reveal";

export type DailyBlundrDomain =
  | "opening_review"
  | "daily_recall"
  | "mini_game"
  | "training_game"
  | "pawn_structure"
  | "key_square"
  | "piece_imbalance"
  | "tactical_idea"
  | "special_technique";

export type DailyBlundrDifficulty =
  | "intro"
  | "beginner"
  | "early_intermediate"
  | "intermediate"
  | "advanced"
  | "expert";

export type DailyBlundrMasteryTarget = {
  conceptKey: string;
  domain: DailyBlundrDomain;
  label?: string | null;
  difficultyHint?: DailyBlundrDifficulty | null;
};

export type DailyBlundrSeed = {
  source: DailyBlundrCardSource;
  cardKey: string;
  positionKey: string;
  fen: string;
  expectedMoveUci: string | null;
  expectedMoveSan: string | null;
  playedMoveUci: string | null;
  playedMoveSan: string | null;
  openingId: string | null;
  openingName: string | null;
  patternId: string | null;
  concept: string | null;
  count: number;
  weight: number;
  lastSeenAt: string | null;
  note: string | null;
  signals: string[];
  masteryTargets: DailyBlundrMasteryTarget[];
  confidence: "high" | "medium" | "low";
  difficulty: DailyBlundrDifficulty;
};

export type DailyBlundrCard = DailyBlundrSeed & {
  id: string;
  kind: DailyBlundrCardKind;
  title: string;
  prompt: string;
  playedMoveUci: string | null;
  playedMoveSan: string | null;
  repertoireId?: string | null;
  deckRank: number;
  priority: number;
  masteryKey: string;
  sourceCount: number;
  summary: string;
};

export type DailyBlundrAttempt = {
  id: string;
  cardId: string;
  source: DailyBlundrCardSource;
  createdAt: string;
  completedAt: string;
  outcome: DailyBlundrAttemptOutcome;
  correct: boolean;
  attemptedMoveUci: string | null;
  attemptedMoveSan: string | null;
  responseMoveUci?: string | null;
  responseMoveSan?: string | null;
  expectedMoveUci: string | null;
  expectedMoveSan: string | null;
  usedReveal?: boolean;
  responseTimeMs?: number | null;
  note: string | null;
};

export type DailyBlundrCardProgress = {
  attempts: number;
  correct: number;
  incorrect: number;
  completed: boolean;
  lastAttemptAt: string | null;
  lastAttemptOutcome: DailyBlundrAttemptOutcome | null;
  lastAttemptMoveUci: string | null;
  lastAttemptMoveSan: string | null;
  completedAt: string | null;
};

export type DailyBlundrSessionStatus = "not_started" | "in_progress" | "completed";

export type DailyBlundrSession = {
  schemaVersion: typeof DAILY_BLUNDR_SCHEMA_VERSION;
  dateKey: string;
  status: DailyBlundrSessionStatus;
  cardIds: string[];
  cards: DailyBlundrCard[];
  deckFingerprint: string;
  cardOrder: string[];
  completedCardIds: string[];
  currentCardId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  rewardClaimedAt: string | null;
  rewardAwardedAt: string | null;
  attempts: DailyBlundrAttempt[];
  cardProgressById: Record<string, DailyBlundrCardProgress>;
  updatedAt: string | null;
};

export type DailyBlundrSessionStore = {
  schemaVersion: typeof DAILY_BLUNDR_SCHEMA_VERSION;
  sessionsByDate: Record<string, DailyBlundrSession>;
  updatedAt: string | null;
};

export type DailyBlundrProgress = {
  schemaVersion: typeof DAILY_BLUNDR_SCHEMA_VERSION;
  currentDailyStreak: number;
  longestDailyStreak: number;
  dailyStreak: number;
  lastCompletedDateKey: string | null;
  lastRewardDateKey: string | null;
  completionCount: number;
  localDailyXp: number;
  lastRewardClaimedAt: string | null;
  updatedAt: string | null;
};

export type DailyBlundrMasteryRecord = {
  key: string;
  label: string;
  domain: DailyBlundrDomain;
  cardKind: DailyBlundrCardKind;
  sources: DailyBlundrCardSource[];
  exposureCount: number;
  attemptCount: number;
  attempts: number;
  correctCount: number;
  correct: number;
  incorrectCount: number;
  incorrect: number;
  recentAccuracy: number;
  lifetimeAccuracy: number;
  avgResponseTimeMs: number | null;
  hintRate: number;
  revealRate: number;
  currentMastery: number;
  confidence: number;
  currentDifficulty: DailyBlundrDifficulty;
  streak: number;
  lapses: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  lastAttemptAt: string | null;
  lastCorrectAt: string | null;
  lastIncorrectAt: string | null;
  updatedAt: string | null;
};

export type DailyBlundrMasteryState = {
  schemaVersion: typeof DAILY_BLUNDR_SCHEMA_VERSION;
  records: Record<string, DailyBlundrMasteryRecord>;
  updatedAt: string | null;
};

export type DailyBlundrStore = {
  sessions: DailyBlundrSessionStore;
  progress: DailyBlundrProgress;
  mastery: DailyBlundrMasteryState;
};

export type DailyBlundrDeckSummary = {
  totalSeeds: number;
  totalCards: number;
  fromLearningEvents: number;
  fromProgressMistakes: number;
  mergedCards: number;
};
