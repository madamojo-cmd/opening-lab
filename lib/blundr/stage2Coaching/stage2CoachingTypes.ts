export type CoachingSurface =
  | "assisted"
  | "plain_hint"
  | "plain_show_more"
  | "review"
  | "debug_only";

export type CoachingStatus =
  | "approved"
  | "draft"
  | "disabled"
  | "blocked";

export type SafetyStatus =
  | "safe"
  | "needs_review"
  | "blocked";

export type RuntimeReconciliation =
  | { status: "matched"; openingId: string; playKey?: string; lineId?: string; moveUci?: string }
  | { status: "unmatched"; reason: string; openingId?: string; playKey?: string; lineId?: string; moveUci?: string };

export type Stage2CoachingPacketEntry = {
  packetId?: string;
  openingId?: string;
  playKey?: string;
  lineId?: string;
  moveUci?: string;
  moveSan?: string;
  conceptId?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  surface: CoachingSurface;
  status: CoachingStatus;
  title: string;
  body: string;
  hint?: string;
  showMore?: string;
  commonMistake?: string;
  remediation?: string;
  visualRecipeRefs: string[];
  evidenceIds: string[];
  sourceFile: string;
  sourceSection: string;
  sourceCandidatePackage?: string;
  sourceCandidatePackages?: string[];
  approvalReadiness?: "ready_for_app_validation" | "app_validated";
  runtimeReconciliation: RuntimeReconciliation;
  safetyStatus: SafetyStatus;
};

export type Stage2CoachContext = {
  openingId?: string;
  playKeyBefore?: string;
  playKey?: string;
  learnerSide?: string;
  sideToMove?: string;
  targetUci?: string;
  targetSan?: string;
  targetPieceType?: string;
  surface: CoachingSurface;
  runtimeBook?: {
    status?: string;
    candidateCount?: number;
    topCandidateUci?: string;
    topCandidateSan?: string;
    topCandidateRank?: number;
    topCandidateTotalGames?: number;
    bookExhausted?: boolean;
  };
  plainRevealState?: "hidden" | "hint" | "show_more" | "revealed";
};

export type Stage2CoachingPacketResolution =
  | { kind: "approved_packet"; packet: Stage2CoachingPacketEntry }
  | { kind: "safe_fallback"; packet: Stage2CoachingPacketEntry }
  | { kind: "none"; reason: string };
