import { Chess } from "chess.js";
import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { normalizeFen } from "./miniGameFenBuilder";
import { isGeneratedMiniGameDifficulty, type GeneratedMiniGameScenario, type MiniGameScenarioValidationIssue, type MiniGameScenarioValidationResult } from "./miniGameGenerationTypes";
import { isMiniGameEngineVerdict } from "./miniGameEngineQualityTypes";
import { normalizeSquare } from "./miniGameBoardGeometry";
import { isLegalMove } from "./miniGameMoveRules";

const KNOWN_MINI_GAME_IDS = new Set([
  "king_race",
  "knight_gymnasium",
  "pawn_wars",
  "tactic_shots",
  "key_square_conquest",
  "structure_builder",
  "imbalance_arena",
  "technique_lab",
]);

function issue(code: string, message: string, path?: string): MiniGameScenarioValidationIssue {
  return { code, message, path };
}

function validateSerializable(value: unknown): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}

function validateSquares(values: readonly (Square | string | null | undefined)[] | undefined, path: string, issues: MiniGameScenarioValidationIssue[]): void {
  if (!values) return;
  for (const value of values) {
    if (!normalizeSquare(value)) {
      issues.push(issue("invalid_square", `Invalid square: ${String(value ?? "")}`, path));
    }
  }
}

function validateBoardPawns(fen: string, issues: MiniGameScenarioValidationIssue[]): void {
  const placement = normalizeFen(fen).split(" ")[0] ?? "";
  const ranks = placement.split("/");
  const firstRank = ranks[0] ?? "";
  const eighthRank = ranks[7] ?? "";
  if (/[pP]/.test(firstRank) || /[pP]/.test(eighthRank)) {
    issues.push(issue("invalid_pawn_placement", "Pawns may not start on the first or eighth rank.", "board.fen"));
  }
}

export function validateGeneratedMiniGameScenario(scenario: GeneratedMiniGameScenario | null | undefined): MiniGameScenarioValidationResult {
  const issues: MiniGameScenarioValidationIssue[] = [];
  const notes: string[] = [];

  if (!scenario || typeof scenario !== "object") {
    return {
      valid: false,
      issues: [issue("missing_scenario", "Generated mini-game scenario is missing.")],
      notes: [],
    };
  }

  if (!KNOWN_MINI_GAME_IDS.has(scenario.miniGameId)) {
    issues.push(issue("unknown_mini_game_id", `Unknown mini-game id: ${String(scenario.miniGameId ?? "")}`, "miniGameId"));
  }
  if (scenario.source !== "daily_deck" && scenario.source !== "standalone_review") {
    issues.push(issue("invalid_source", `Invalid source: ${String(scenario.source ?? "")}`, "source"));
  }
  if (!String(scenario.scenarioKey ?? "").trim()) {
    issues.push(issue("missing_scenario_key", "Scenario key is required.", "scenarioKey"));
  }
  if (!String(scenario.family ?? "").trim()) {
    issues.push(issue("missing_family", "Scenario family is required.", "family"));
  }
  if (!String(scenario.prompt ?? "").trim()) {
    issues.push(issue("missing_prompt", "Prompt is required.", "prompt"));
  }
  if (!String(scenario.instruction ?? "").trim()) {
    issues.push(issue("missing_instruction", "Instruction is required.", "instruction"));
  }
  if (!String(scenario.goal ?? "").trim()) {
    issues.push(issue("missing_goal", "Goal is required.", "goal"));
  }
  if (!String(scenario.explanation ?? "").trim()) {
    issues.push(issue("missing_explanation", "Explanation is required.", "explanation"));
  }
  if (!String(scenario.board?.fen ?? "").trim()) {
    issues.push(issue("missing_fen", "Board FEN is required.", "board.fen"));
  }
  if (!scenario.board || (scenario.board.orientation !== "white" && scenario.board.orientation !== "black")) {
    issues.push(issue("invalid_orientation", "Board orientation must be white or black.", "board.orientation"));
  }
  if (scenario.board?.lockedOrientation !== true) {
    issues.push(issue("unlocked_orientation", "Board orientation must be locked.", "board.lockedOrientation"));
  }
  if (scenario.board?.sideToMove !== "w" && scenario.board?.sideToMove !== "b") {
    issues.push(issue("invalid_side_to_move", "Side to move must be w or b.", "board.sideToMove"));
  }
  if (!isGeneratedMiniGameDifficulty(scenario.difficulty)) {
    issues.push(issue("invalid_difficulty", `Invalid difficulty: ${String(scenario.difficulty ?? "")}`, "difficulty"));
  }
  if (!Number.isFinite(scenario.estimatedTimeSeconds) || scenario.estimatedTimeSeconds <= 0) {
    issues.push(issue("invalid_estimated_time", "Estimated time must be positive.", "estimatedTimeSeconds"));
  }
  if (!Array.isArray(scenario.conceptTags) || scenario.conceptTags.length === 0) {
    issues.push(issue("missing_concept_tags", "Concept tags are required.", "conceptTags"));
  }
  if (!Array.isArray(scenario.solution?.acceptedMoves) || scenario.solution.acceptedMoves.length === 0) {
    issues.push(issue("empty_accepted_moves", "Accepted moves are required.", "solution.acceptedMoves"));
  }
  if (!String(scenario.solution?.primaryMoveUci ?? "").trim()) {
    issues.push(issue("missing_solution", "Primary solution UCI is required.", "solution.primaryMoveUci"));
  }
  if (!String(scenario.solution?.from ?? "").trim() || !String(scenario.solution?.to ?? "").trim()) {
    issues.push(issue("missing_solution_squares", "Solution from/to squares are required.", "solution"));
  }
  if (!scenario.solution?.verification || scenario.solution.verification.verified !== true) {
    issues.push(issue("missing_solution_verification", "Solution verification metadata is required.", "solution.verification"));
  }
  if (!scenario.metadata || scenario.metadata.generatorKind !== "procedural") {
    issues.push(issue("invalid_generator_kind", "Generator kind must be procedural.", "metadata.generatorKind"));
  }
  if (scenario.metadata?.validationPassed !== true || scenario.metadata?.objectiveValidationPassed !== true || scenario.metadata?.solutionVerified !== true) {
    issues.push(issue("invalid_metadata_flags", "Validation metadata flags must be true.", "metadata"));
  }
  if (!Array.isArray(scenario.metadata?.transformIds)) {
    issues.push(issue("missing_transform_ids", "Transform ids must be an array.", "metadata.transformIds"));
  }
  if (!scenario.engineQuality) {
    issues.push(issue("missing_engine_quality", "Engine quality metadata is required.", "engineQuality"));
  } else {
    if (scenario.engineQuality.engine !== "stockfish") {
      issues.push(issue("invalid_engine", "Engine quality must come from Stockfish.", "engineQuality.engine"));
    }
    if (scenario.engineQuality.adjudicated !== true) {
      issues.push(issue("unadjudicated_engine", "Engine quality must be adjudicated.", "engineQuality.adjudicated"));
    }
    if (!isMiniGameEngineVerdict(scenario.engineQuality.verdict)) {
      issues.push(issue("invalid_engine_verdict", "Engine quality verdict is invalid.", "engineQuality.verdict"));
    }
    if (!Array.isArray(scenario.engineQuality.notes)) {
      issues.push(issue("missing_engine_notes", "Engine quality notes must be an array.", "engineQuality.notes"));
    }
  }
  if (!validateSerializable(scenario)) {
    issues.push(issue("non_serializable", "Scenario must be serializable."));
  }

  try {
    const chess = new Chess(normalizeFen(scenario.board.fen));
    if (chess.turn() !== scenario.board.sideToMove) {
      issues.push(issue("turn_mismatch", "FEN side to move does not match board.sideToMove.", "board.sideToMove"));
    }
  } catch {
    issues.push(issue("invalid_fen", "Board FEN could not be parsed.", "board.fen"));
  }

  validateBoardPawns(scenario.board.fen, issues);
  validateSquares(scenario.overlays?.selectedSquares, "overlays.selectedSquares", issues);
  validateSquares(scenario.overlays?.targetSquares, "overlays.targetSquares", issues);
  validateSquares(scenario.overlays?.keySquares, "overlays.keySquares", issues);
  validateSquares(scenario.overlays?.dangerSquares, "overlays.dangerSquares", issues);
  validateSquares(scenario.overlays?.route, "overlays.route", issues);
  if (scenario.overlays?.lastMove) {
    if (!normalizeSquare(scenario.overlays.lastMove.from) || !normalizeSquare(scenario.overlays.lastMove.to)) {
      issues.push(issue("invalid_last_move", "Last move squares must be valid.", "overlays.lastMove"));
    }
  }
  if (!scenario.solution.acceptedMoves.every((move) => isLegalMove(scenario.board.fen, move))) {
    issues.push(issue("illegal_accepted_move", "All accepted moves must be legal.", "solution.acceptedMoves"));
  }
  if (!isLegalMove(scenario.board.fen, scenario.solution.primaryMoveUci)) {
    issues.push(issue("illegal_primary_move", "Primary move must be legal.", "solution.primaryMoveUci"));
  }

  if (issues.length === 0) {
    notes.push("scenario_valid");
  }

  return {
    valid: issues.length === 0,
    issues,
    notes,
  };
}
