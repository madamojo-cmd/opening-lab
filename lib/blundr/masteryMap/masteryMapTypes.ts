import type { OpeningAccessDecision } from "@/lib/blundr/contracts";

export type MasteryStatus =
  | "repeated_lapse"
  | "weak"
  | "due"
  | "learning"
  | "mastered"
  | "unseen";

export type MasteryMapNode = {
  nodeId: string;
  positionKey: string;
  openingId: string;
  sanSequence: readonly string[];
  status: MasteryStatus;
  confidence: number;
  lastFirstAttemptResult: "correct" | "incorrect" | "revealed" | null;
  nextDueAt: string | null;
  evidenceCount: number;
  importedGameEvidenceCount: number;
  weaknessExplanation: string | null;
  recommendedDailyIntervention: string | null;
  alternateRoute: boolean;
  childCount: number;
  access: OpeningAccessDecision;
};

export type MasteryMapReadModel = {
  openingId: string;
  openingName: string;
  side: "white" | "black" | "unknown";
  state:
    | "ready"
    | "empty"
    | "stale"
    | "partial"
    | "error"
    | "locked"
    | "unknown";
  nodes: readonly MasteryMapNode[];
  masteredPositions: number;
  learningPositions: number;
  weakPositions: number;
  unseenPositions: number;
  firstAttemptUnaidedAccuracy: number | null;
  retention7d: number | null;
  retention30d: number | null;
  importedGameMatchCount: number;
  lastTrainedAt: string | null;
  nextDueAt: string | null;
  weakBranches: readonly WeakBranch[];
};

export type WeakBranch = {
  positionKey: string;
  openingId: string;
  sanSequence: readonly string[];
  explanation: string;
  confidence: number;
  evidenceCount: number;
  recommendedActivity: string;
  recentResult: MasteryMapNode["lastFirstAttemptResult"];
};
