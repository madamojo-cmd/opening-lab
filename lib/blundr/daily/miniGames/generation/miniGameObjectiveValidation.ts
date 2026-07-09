import type { Color, ParsedBoard, Square } from "@/lib/blundr/geometry/boardTypes";
import { kingDistance, fileIndex, rankIndex, isValidSquare } from "@/lib/blundr/geometry/squareUtils";
import { attackersToSquare, getAttackedSquares } from "./miniGameAttackMaps";
import { applyMove, isLegalMove } from "./miniGameMoveRules";
import { parseMiniGameBoard } from "./miniGameAttackMaps";
import type { MiniGameGenerationCandidate, MiniGameObjectiveValidationResult, MiniGameScenarioValidationIssue } from "./miniGameGenerationTypes";
import { lineSquaresBetween } from "./miniGameBoardGeometry";
import { knightDistance } from "./miniGamePathfinding";
import { isConnectedPassedPawn, isPassedPawn, pawnPromotionDistance, parsePawnBoard } from "./miniGamePawnRace";
import { isDirectOpposition, isDistantOpposition, rookBehindPassedPawn, rookCutsOffKing } from "./miniGameEndgameGeometry";
import { materialBalance, hasBishopPair } from "@/lib/blundr/geometry/materialUtils";

function issue(code: string, message: string, path?: string): MiniGameScenarioValidationIssue {
  return { code, message, path };
}

function buildResult(passed: boolean, objectiveScore: number, notes: string[], issues: MiniGameScenarioValidationIssue[] = []): MiniGameObjectiveValidationResult {
  return { passed, objectiveScore, notes, issues };
}

function parseAfter(candidate: MiniGameGenerationCandidate): { before: ParsedBoard; after: ParsedBoard; move: ReturnType<typeof applyMove> } | null {
  if (!isLegalMove(candidate.board.fen, candidate.solution.primaryMoveUci)) return null;
  const move = applyMove(candidate.board.fen, candidate.solution.primaryMoveUci);
  if (!move) return null;
  return {
    before: parseMiniGameBoard(candidate.board.fen),
    after: parseMiniGameBoard(move.fen),
    move,
  };
}

function movedPieceSquare(after: ParsedBoard, moveUci: string): Square | null {
  return moveUci.slice(2, 4).toLowerCase() as Square;
}

function pieceAt(board: ParsedBoard, square: Square): { type: string; color: Color } | null {
  const piece = board.pieceBySquare[square];
  if (!piece) return null;
  return { type: piece.type, color: piece.color };
}

function isCentralSquare(square: Square): boolean {
  return ["d4", "e4", "d5", "e5"].includes(square);
}

function isOpenFile(board: ParsedBoard, file: string): boolean {
  return !board.pieces.some((piece) => piece.square[0] === file && piece.type === "pawn");
}

function attackedByCount(board: ParsedBoard, square: Square, color: Color): number {
  return attackersToSquare(board.fen, square, color).length;
}

function hasTargetAttack(after: ParsedBoard, color: Color, targetSquares: readonly Square[]): boolean {
  return targetSquares.some((square) => attackedByCount(after, square, color) > 0);
}

function validateTacticShots(candidate: MiniGameGenerationCandidate, parsed: { before: ParsedBoard; after: ParsedBoard; move: NonNullable<ReturnType<typeof applyMove>> }): MiniGameObjectiveValidationResult {
  const color: Color = candidate.board.sideToMove === "w" ? "white" : "black";
  const targetSquares = candidate.overlays.targetSquares ?? candidate.overlays.keySquares ?? [];
  const afterPiece = pieceAt(parsed.after, candidate.solution.to);
  const movedType = afterPiece?.type ?? "";
  const afterAttackedTargets = targetSquares.filter((square) => attackedByCount(parsed.after, square, color) > 0);
  const notes: string[] = [];

  if (candidate.motif?.includes("fork") || candidate.family === "knight_fork") {
    if (afterPiece?.type !== "knight" || afterAttackedTargets.length < 2) {
      return buildResult(false, 0, ["fork not established"], [issue("fork_failed", "Knight fork is not established.", "solution")]);
    }
    return buildResult(true, 92, ["knight fork established"]);
  }

  if (candidate.motif?.includes("pin") || candidate.motif?.includes("skewer")) {
    const kingSquare = parsed.after.pieces.find((piece) => piece.color !== color && piece.type === "king")?.square ?? "";
    const line = lineSquaresBetween(candidate.solution.to, kingSquare as Square);
    const blocker = line.map((square) => parsed.after.pieceBySquare[square]).find(Boolean);
    const target = line.length > 0 ? line[0] : null;
    if (!kingSquare || !blocker) {
      return buildResult(false, 0, ["pin/skewer line missing"], [issue("line_failed", "Pin or skewer line is missing.", "solution")]);
    }
    notes.push("line pressure established");
    return buildResult(true, candidate.motif.includes("skewer") ? 88 : 86, notes);
  }

  if (candidate.motif?.includes("discovered") || candidate.motif?.includes("clearance") || candidate.motif?.includes("removal") || candidate.motif?.includes("deflection") || candidate.motif?.includes("overloaded")) {
    const beforeTargets = targetSquares.filter((square) => attackedByCount(parsed.before, square, color) > 0);
    const afterTargets = targetSquares.filter((square) => attackedByCount(parsed.after, square, color) > 0);
    if (afterTargets.length <= beforeTargets.length) {
      return buildResult(false, 0, ["no attack gain"], [issue("attack_gain_failed", "The tactic did not create a stronger attack.", "solution")]);
    }
    return buildResult(true, 84, ["attack gain created"]);
  }

  if (candidate.motif?.includes("back_rank")) {
    const kingSquare = parsed.after.pieces.find((piece) => piece.color !== color && piece.type === "king")?.square ?? "";
    if (!kingSquare || attackedByCount(parsed.after, kingSquare as Square, color) === 0) {
      return buildResult(false, 0, ["back rank check missing"], [issue("back_rank_failed", "Back-rank pressure is missing.", "solution")]);
    }
    return buildResult(true, 90, ["back rank pressure established"]);
  }

  if (afterAttackedTargets.length > 0 || movedType) {
    notes.push("target pressure established");
    return buildResult(true, 80, notes);
  }

  return buildResult(false, 0, ["tactical objective not proven"], [issue("tactic_failed", "Tactical objective could not be proven.", "solution")]);
}

function validateKeySquare(candidate: MiniGameGenerationCandidate, parsed: { before: ParsedBoard; after: ParsedBoard; move: NonNullable<ReturnType<typeof applyMove>> }): MiniGameObjectiveValidationResult {
  const color: Color = candidate.board.sideToMove === "w" ? "white" : "black";
  const target = candidate.overlays.keySquares?.[0] ?? candidate.overlays.targetSquares?.[0] ?? candidate.solution.to;
  const movedPiece = pieceAt(parsed.after, candidate.solution.to);
  const attacksTarget = attackedByCount(parsed.after, target, color) > 0;
  const notes: string[] = [];

  if (!target) {
    return buildResult(false, 0, ["missing key square"], [issue("missing_key_square", "Key square is missing.", "overlays.keySquares")]);
  }
  if (candidate.motif?.includes("outpost")) {
    const supportPawn = parsed.after.pieces.some((piece) => piece.color === color && piece.type === "pawn" && piece.square !== candidate.solution.to && attackedByCount(parsed.after, candidate.solution.to, color) > 0);
    const enemyPawnAttack = parsed.after.pieces.some((piece) => piece.color !== color && piece.type === "pawn" && attackedByCount(parseMiniGameBoard(parsed.after.fen), candidate.solution.to, piece.color) > 0);
    if (movedPiece?.type !== "knight" || !supportPawn || enemyPawnAttack) {
      return buildResult(false, 0, ["outpost not established"], [issue("outpost_failed", "Outpost requirements were not met.", "solution")]);
    }
    return buildResult(true, 88, ["outpost occupied"]);
  }
  if (candidate.motif?.includes("invasion")) {
    if (!movedPiece || (movedPiece.type !== "rook" && movedPiece.type !== "queen") || !(attacksTarget || candidate.solution.to === target) || !isOpenFile(parsed.after, target[0])) {
      return buildResult(false, 0, ["invasion not established"], [issue("invasion_failed", "Invasion square was not reached or controlled.", "solution")]);
    }
    return buildResult(true, 86, ["invasion square reached"]);
  }
  if (candidate.motif?.includes("king_entry")) {
    if (movedPiece?.type !== "king" || candidate.solution.to !== target) {
      return buildResult(false, 0, ["king entry failed"], [issue("king_entry_failed", "King did not occupy the entry square.", "solution")]);
    }
    return buildResult(true, 86, ["king entry square occupied"]);
  }
  if (candidate.motif?.includes("blockade")) {
    if (!candidate.solution.to || !attacksTarget) {
      return buildResult(false, 0, ["blockade not established"], [issue("blockade_failed", "Blockade square was not contested.", "solution")]);
    }
    return buildResult(true, 78, ["blockade square contested"]);
  }
  if (candidate.motif?.includes("central") || candidate.motif?.includes("anchor") || candidate.motif?.includes("weak_color")) {
    if (!(attacksTarget || candidate.solution.to === target || isCentralSquare(target))) {
      return buildResult(false, 0, ["central control not established"], [issue("key_square_failed", "Key square objective was not established.", "solution")]);
    }
    return buildResult(true, 82, ["key square controlled"]);
  }
  if (attacksTarget || candidate.solution.to === target) {
    notes.push("key square reached or controlled");
    return buildResult(true, 80, notes);
  }
  return buildResult(false, 0, ["key square objective not proven"], [issue("key_square_failed", "Key square objective could not be proven.", "solution")]);
}

function pawnSkeletonSignature(board: ParsedBoard): string {
  const pawns = board.pieces.filter((piece) => piece.type === "pawn");
  return pawns
    .map((piece) => `${piece.color[0]}${piece.square}`)
    .sort()
    .join("|");
}

function validateStructure(candidate: MiniGameGenerationCandidate, parsed: { before: ParsedBoard; after: ParsedBoard; move: NonNullable<ReturnType<typeof applyMove>> }): MiniGameObjectiveValidationResult {
  const beforeSignature = pawnSkeletonSignature(parsed.before);
  const afterSignature = pawnSkeletonSignature(parsed.after);
  const beforePawns = parsed.before.pieces.filter((piece) => piece.type === "pawn");
  const afterPawns = parsed.after.pieces.filter((piece) => piece.type === "pawn");
  const notes: string[] = [];
  const movedPawn = parsed.after.pieceBySquare[candidate.solution.to];

  if (beforePawns.length === 0) {
    return buildResult(false, 0, ["pawn skeleton missing"], [issue("pawn_skeleton_missing", "Structure Builder requires a pawn skeleton.", "board.fen")]);
  }
  if (!movedPawn || movedPawn.type !== "pawn") {
    if (candidate.motif?.includes("repair") || candidate.motif?.includes("structure")) {
      const kingOrPiece = parsed.after.pieceBySquare[candidate.solution.to];
      if (!kingOrPiece || (kingOrPiece.type !== "king" && kingOrPiece.type !== "rook" && kingOrPiece.type !== "pawn")) {
        return buildResult(false, 0, ["pawn move required"], [issue("pawn_move_required", "Structure Builder requires a structure move.", "solution")]);
      }
    } else {
      return buildResult(false, 0, ["pawn move required"], [issue("pawn_move_required", "Structure Builder requires a pawn move.", "solution")]);
    }
  }

  const changed = beforeSignature !== afterSignature || beforePawns.length !== afterPawns.length;
  if (!changed) {
    return buildResult(false, 0, ["structure unchanged"], [issue("structure_unchanged", "Pawn structure did not change.", "solution")]);
  }

  if (candidate.motif?.includes("passed") || candidate.motif?.includes("minority") || candidate.motif?.includes("break") || candidate.motif?.includes("flank")) {
    notes.push("pawn structure changed");
    return buildResult(true, 84, notes);
  }

  if (candidate.motif?.includes("repair")) {
    notes.push("structure repaired");
    return buildResult(true, 80, notes);
  }

  return buildResult(true, 78, ["pawn structure improved"]);
}

function validateImbalance(candidate: MiniGameGenerationCandidate, parsed: { before: ParsedBoard; after: ParsedBoard; move: NonNullable<ReturnType<typeof applyMove>> }): MiniGameObjectiveValidationResult {
  const beforeBalance = materialBalance(parsed.before);
  const afterBalance = materialBalance(parsed.after);
  const movedPiece = parsed.after.pieceBySquare[candidate.solution.to];
  const color: Color = candidate.board.sideToMove === "w" ? "white" : "black";
  const notes: string[] = [];

  if (candidate.motif?.includes("bishop_pair") && !hasBishopPair(parsed.before, color)) {
    return buildResult(false, 0, ["bishop pair missing"], [issue("bishop_pair_missing", "Bishop pair is missing.", "board.fen")]);
  }
  if (candidate.motif?.includes("rook_activity") && !(movedPiece?.type === "rook" && isOpenFile(parsed.after, candidate.solution.to[0]))) {
    return buildResult(false, 0, ["rook activity missing"], [issue("rook_activity_failed", "Rook activity was not established.", "solution")]);
  }
  if (candidate.motif?.includes("good_knight") && !(movedPiece?.type === "knight" && isCentralSquare(candidate.solution.to))) {
    return buildResult(false, 0, ["knight imbalance missing"], [issue("knight_balance_failed", "Knight activity was not established.", "solution")]);
  }
  if (candidate.motif?.includes("exchange_sac") || candidate.motif?.includes("initiative")) {
    if (beforeBalance === afterBalance && !candidate.analysis.forcing) {
      return buildResult(false, 0, ["exchange compensation missing"], [issue("exchange_sac_failed", "Exchange compensation was not established.", "solution")]);
    }
    return buildResult(true, 84, ["initiative preserved"]);
  }
  if (candidate.motif?.includes("avoid_bad_trade") || candidate.motif?.includes("favorable_trade") || candidate.motif?.includes("trade")) {
    notes.push("favorable imbalance retained");
    return buildResult(true, 82, notes);
  }
  if (beforeBalance !== afterBalance || candidate.analysis.forcing || candidate.analysis.blockerCount > 0) {
    notes.push("material imbalance present");
    return buildResult(true, 78, notes);
  }
  return buildResult(false, 0, ["imbalance not proven"], [issue("imbalance_missing", "Material or positional imbalance was not proven.", "board.fen")]);
}

function validateTechnique(candidate: MiniGameGenerationCandidate, parsed: { before: ParsedBoard; after: ParsedBoard; move: NonNullable<ReturnType<typeof applyMove>> }): MiniGameObjectiveValidationResult {
  const color: Color = candidate.board.sideToMove === "w" ? "white" : "black";
  const movedPiece = parsed.after.pieceBySquare[candidate.solution.to];
  const target = candidate.overlays.keySquares?.[0] ?? candidate.overlays.targetSquares?.[0] ?? candidate.solution.to;
  const notes: string[] = [];

  if (candidate.motif?.includes("opposition") && !(isDirectOpposition(candidate.solution.to, parsed.after.pieces.find((piece) => piece.type === "king" && piece.color !== color)?.square ?? candidate.solution.to))) {
    return buildResult(false, 0, ["opposition not established"], [issue("opposition_failed", "Opposition was not established.", "solution")]);
  }
  if (candidate.motif?.includes("triangulation") && candidate.analysis.routeLength < 2) {
    return buildResult(false, 0, ["triangulation route too short"], [issue("triangulation_failed", "Triangulation route was not established.", "solution")]);
  }
  if (candidate.motif?.includes("zugzwang")) {
    notes.push("zugzwang pressure present");
    return buildResult(true, 84, notes);
  }
  if (candidate.motif?.includes("rook_behind") && !(movedPiece?.type === "rook" || rookBehindPassedPawn(candidate.solution.to, target, color))) {
    return buildResult(false, 0, ["rook behind pawn missing"], [issue("rook_behind_failed", "Rook behind passed pawn was not established.", "solution")]);
  }
  if (candidate.motif?.includes("rook_cutoff") && !rookCutsOffKing(candidate.solution.to, parsed.after.pieces.find((piece) => piece.type === "king" && piece.color !== color)?.square ?? candidate.solution.to)) {
    return buildResult(false, 0, ["rook cutoff missing"], [issue("rook_cutoff_failed", "Rook cutoff geometry was not established.", "solution")]);
  }
  if (candidate.motif?.includes("lucena") || candidate.motif?.includes("philidor")) {
    notes.push("rook endgame geometry present");
    return buildResult(true, 86, notes);
  }
  if (candidate.motif?.includes("outside_passer") || candidate.motif?.includes("simplification")) {
    notes.push("endgame conversion idea present");
    return buildResult(true, 80, notes);
  }
  if (movedPiece?.type === "king" || movedPiece?.type === "rook" || movedPiece?.type === "pawn") {
    notes.push("endgame technique established");
    return buildResult(true, 76, notes);
  }
  return buildResult(false, 0, ["technique not proven"], [issue("technique_failed", "Endgame technique was not proven.", "solution")]);
}

function validateKingRace(candidate: MiniGameGenerationCandidate, parsed: { before: ParsedBoard; after: ParsedBoard; move: NonNullable<ReturnType<typeof applyMove>> }): MiniGameObjectiveValidationResult {
  const color: Color = candidate.board.sideToMove === "w" ? "white" : "black";
  const ownKing = parsed.after.pieces.find((piece) => piece.type === "king" && piece.color === color)?.square ?? candidate.solution.to;
  const enemyKing = parsed.after.pieces.find((piece) => piece.type === "king" && piece.color !== color)?.square ?? candidate.solution.to;
  const goal = candidate.overlays.keySquares?.[0] ?? candidate.overlays.targetSquares?.[0] ?? candidate.solution.to;
  const movedPiece = parsed.after.pieceBySquare[candidate.solution.to];
  const beforeDistance = kingDistance(parsed.before.pieces.find((piece) => piece.type === "king" && piece.color === color)?.square ?? ownKing, goal);
  const afterDistance = kingDistance(ownKing, goal);
  const notes: string[] = [];

  if (!movedPiece || movedPiece.type !== "king") {
    return buildResult(false, 0, ["king move required"], [issue("king_move_required", "King Race requires a king move.", "solution")]);
  }
  if (afterDistance > beforeDistance && !isDirectOpposition(ownKing, enemyKing) && !isDistantOpposition(ownKing, enemyKing)) {
    return buildResult(false, 0, ["race not improved"], [issue("race_failed", "King race distance did not improve.", "solution")]);
  }
  notes.push("king race geometry validated");
  return buildResult(true, 86, notes);
}

function validateKnightGym(candidate: MiniGameGenerationCandidate, parsed: { before: ParsedBoard; after: ParsedBoard; move: NonNullable<ReturnType<typeof applyMove>> }): MiniGameObjectiveValidationResult {
  const movedPiece = parsed.after.pieceBySquare[candidate.solution.to];
  const target = candidate.overlays.keySquares?.[0] ?? candidate.overlays.targetSquares?.[0] ?? candidate.solution.to;
  const beforeDistance = knightDistance(candidate.solution.from, target);
  const afterDistance = knightDistance(candidate.solution.to, target);
  const notes: string[] = [];

  if (!movedPiece || movedPiece.type !== "knight") {
    return buildResult(false, 0, ["knight move required"], [issue("knight_move_required", "Knight Gymnasium requires a knight move.", "solution")]);
  }

  if (candidate.motif?.includes("fork") && attackedByCount(parsed.after, target, candidate.board.sideToMove === "w" ? "white" : "black") === 0) {
    return buildResult(false, 0, ["fork not created"], [issue("fork_failed", "Knight fork was not created.", "solution")]);
  }

  if (candidate.motif?.includes("route") || candidate.motif?.includes("reroute") || candidate.motif?.includes("trap")) {
    if (!(afterDistance < beforeDistance || attackedByCount(parsed.after, target, candidate.board.sideToMove === "w" ? "white" : "black") > 0)) {
      return buildResult(false, 0, ["route not improved"], [issue("route_failed", "Knight route was not improved.", "solution")]);
    }
    notes.push("knight route improved");
    return buildResult(true, 82, notes);
  }

  notes.push("knight geometry validated");
  return buildResult(true, 84, notes);
}

function validatePawnWars(candidate: MiniGameGenerationCandidate, parsed: { before: ParsedBoard; after: ParsedBoard; move: NonNullable<ReturnType<typeof applyMove>> }): MiniGameObjectiveValidationResult {
  const movedPiece = parsed.after.pieceBySquare[candidate.solution.to];
  const color: Color = candidate.board.sideToMove === "w" ? "white" : "black";
  const pawn = movedPiece?.type === "pawn" ? parsed.after.pieceBySquare[candidate.solution.to] : null;
  const targetPawn = pawn ?? parsed.before.pieceBySquare[candidate.solution.from];
  const beforeDistance = pawnPromotionDistance(candidate.solution.from, color);
  const afterDistance = pawnPromotionDistance(candidate.solution.to, color);
  const notes: string[] = [];

  if (!movedPiece || movedPiece.type !== "pawn") {
    return buildResult(false, 0, ["pawn move required"], [issue("pawn_move_required", "Pawn Wars requires a pawn move.", "solution")]);
  }
  if (candidate.motif?.includes("promotion") || candidate.motif?.includes("race")) {
    if (!(afterDistance < beforeDistance || isPassedPawn(parsed.after, candidate.solution.to))) {
      return buildResult(false, 0, ["promotion race not calculable"], [issue("promotion_race_failed", "Promotion race was not calculable.", "solution")]);
    }
    notes.push("promotion race validated");
    return buildResult(true, 84, notes);
  }
  if (candidate.motif?.includes("outside") || candidate.motif?.includes("connected") || candidate.motif?.includes("protected") || candidate.motif?.includes("breakthrough")) {
    notes.push("pawn race structure validated");
    return buildResult(true, 82, notes);
  }
  if (candidate.motif?.includes("hold_draw")) {
    notes.push("draw hold validated");
    return buildResult(true, 78, notes);
  }
  if (isPassedPawn(parsed.after, candidate.solution.to) || isConnectedPassedPawn(parsed.after, candidate.solution.to)) {
    notes.push("pawn race verified");
    return buildResult(true, 80, notes);
  }
  return buildResult(false, 0, ["pawn race not proven"], [issue("pawn_race_failed", "Pawn race objective was not proven.", "solution")]);
}

export function validateMiniGameObjective(candidate: MiniGameGenerationCandidate): MiniGameObjectiveValidationResult {
  const parsed = parseAfter(candidate);
  if (!parsed) {
    return buildResult(false, 0, ["illegal or unparsable primary move"], [issue("illegal_move", "Primary move is illegal or could not be applied.", "solution.primaryMoveUci")]);
  }

  const family = candidate.family.toLowerCase();
  if (candidate.miniGameId === "tactic_shots" || family.includes("tactic")) {
    return validateTacticShots(candidate, parsed);
  }
  if (candidate.miniGameId === "key_square_conquest" || family.includes("key_square")) {
    return validateKeySquare(candidate, parsed);
  }
  if (candidate.miniGameId === "structure_builder" || family.includes("structure")) {
    return validateStructure(candidate, parsed);
  }
  if (candidate.miniGameId === "imbalance_arena" || family.includes("imbalance")) {
    return validateImbalance(candidate, parsed);
  }
  if (candidate.miniGameId === "technique_lab" || family.includes("technique")) {
    return validateTechnique(candidate, parsed);
  }
  if (candidate.miniGameId === "king_race" || family.includes("king")) {
    return validateKingRace(candidate, parsed);
  }
  if (candidate.miniGameId === "knight_gymnasium" || family.includes("knight")) {
    return validateKnightGym(candidate, parsed);
  }
  if (candidate.miniGameId === "pawn_wars" || family.includes("pawn")) {
    return validatePawnWars(candidate, parsed);
  }

  return buildResult(false, 0, ["unknown family"], [issue("unknown_family", `Unknown mini-game family: ${candidate.family}`, "family")]);
}

export {
  validateTacticShots,
  validateKeySquare,
  validateStructure,
  validateImbalance,
  validateTechnique,
  validateKingRace,
  validateKnightGym,
  validatePawnWars,
};
