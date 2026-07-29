import type {
  ActivityAttemptState,
  ActivityRejection,
} from "@/lib/blundr/daily/core/dailyActivityConformance";

export type DeepMiniGameAdvanceKind =
  | "invalid"
  | "legal_progress"
  | "opponent_reply"
  | "objective_complete"
  | "objective_failed";
export type DeepMiniGameId =
  | "tactic_shots_deep"
  | "knight_gymnasium_deep"
  | "king_pawn_lab";
export type DeepMiniGameSolution = {
  userMoves: readonly string[];
  opponentReplies: readonly string[];
  terminalResult?: "win" | "draw" | "hold";
  requiredTargets?: readonly string[];
};
export type DeepMiniGameEvidence = {
  catalogId: string;
  catalogVersion: string;
  sourceRecordId: string;
  family: "tactic" | "knight" | "pawn";
  engine: "Stockfish 18 Lite";
  depth: number;
  evaluationCp: number | null;
  mate: number | null;
  bestMoveGapCp: number;
  multiPv: number;
  legalMoveCount: number;
  pieceCount: number;
  theme: string;
  architecture: string;
  checksumSha256: string;
};
export type DeepMiniGameScenario = {
  id: string;
  miniGameId: DeepMiniGameId;
  startFen: string;
  sideToMove: "white" | "black";
  solution: DeepMiniGameSolution;
  schemaVersion: string;
  generatorVersion: string;
  validatorVersion: string;
  evidenceVersion: string;
  evidence?: DeepMiniGameEvidence;
};
export type DeepMiniGameState = ActivityAttemptState & {
  currentFen: string;
  userMoveIndex: number;
  opponentReplyIndex: number;
  moves: readonly string[];
  targetsReached: readonly string[];
  terminalResult: "win" | "draw" | "hold" | null;
};
export type DeepMiniGamePublicState = Pick<
  DeepMiniGameState,
  | "state"
  | "currentFen"
  | "userMoveIndex"
  | "opponentReplyIndex"
  | "moves"
  | "targetsReached"
  | "terminalResult"
>;
export type DeepMiniGamePresentationModel = {
  activityId: DeepMiniGameId;
  instanceId: string;
  prompt: string;
  objective: string;
  publicState: DeepMiniGamePublicState;
};
export type DeepMiniGameResult = {
  kind: DeepMiniGameAdvanceKind;
  state: DeepMiniGameState;
  message: string;
};
export type DeepMiniGameBuildResult =
  | { ok: true; scenario: DeepMiniGameScenario }
  | ActivityRejection;
