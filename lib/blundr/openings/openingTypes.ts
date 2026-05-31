export interface RepertoireLineInput {
  openingId: string;
  lineId: string;
  openingName: string;
  sideToTrain: "white" | "black";
  movesSan: string[];
}

export interface RepertoireContinuation {
  san: string;
  uci: string;
  color: "w" | "b";
  resultingFen: string;
  resultingFen4: string;
  source: "lesson_line" | "opening_branch" | "transposition" | "legacy_recoverable";
  lineId: string;
  openingId: string;
  ply: number;
}

export interface RepertoireNode {
  fen4: string;
  fullFen: string;
  ply: number;
  lineId: string;
  openingId: string;
  openingName: string;
  sideToMove: "w" | "b";
  continuations: RepertoireContinuation[];
  transpositionKey: string;
  terminal: boolean;
  lineLength: number;
}

export interface OpeningTreeBuildIssue {
  openingId: string;
  lineId: string;
  ply: number;
  san: string;
  reason: string;
}

export interface OpeningTree {
  openingId: string;
  openingName: string;
  sideToTrain: "white" | "black";
  nodesByFen4: Record<string, RepertoireNode[]>;
  nodesByTranspositionKey: Record<string, RepertoireNode[]>;
  invalidSan: OpeningTreeBuildIssue[];
  lineCount: number;
  nodeCount: number;
}

export type ExpectedMoveSource =
  | "lesson_line"
  | "opening_branch"
  | "transposition"
  | "legacy_recoverable"
  | "opening_family_plan"
  | "continuation_candidate"
  | "engine_preview_fallback"
  | "guided_branch_needs_continuation"
  | "true_terminal_node"
  | "none";

export type BookResolutionState =
  | "user_move_available"
  | "opponent_to_move"
  | "waiting_for_opponent_branch"
  | "known_branch_available"
  | "transposition_available"
  | "adaptive_branch_available"
  | "true_terminal_node"
  | "unresolved_missing_mapping"
  | "guided_branch_needs_continuation"
  | "continuation_candidate";

export type CoachingCoverageTier =
  | "exact_line_deep_coached"
  | "known_branch_deep_coached"
  | "transposition_deep_coached"
  | "opening_family_plan_coached"
  | "general_feature_coached"
  | "continuation_candidate"
  | "unresolved";

export interface ResolvedExpectedMove {
  expectedMoveSan: string | null;
  expectedMoveUci: string | null;
  source: ExpectedMoveSource;
  bookResolutionState?: BookResolutionState;
  coverageTier: CoachingCoverageTier;
  legal: boolean | null;
  lineCursor: number | null;
  lineLength: number | null;
  reason: string;
  candidateMoves: RepertoireContinuation[];
  exhausted: boolean;
  shouldTransitionToContinuation: boolean;
  debug: Record<string, unknown>;
}
