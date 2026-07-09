import type { MiniGameGenerationCandidate } from "./miniGameGenerationTypes";
import { normalizeFen } from "./miniGameFenBuilder";
import { normalizeText } from "../miniGameUtils";

export type MiniGameTrainingQualityIssue = {
  code: string;
  message: string;
  fatal: boolean;
  path?: string;
};

export type MiniGameTrainingQualityResult = {
  passed: boolean;
  strictMode: boolean;
  issues: MiniGameTrainingQualityIssue[];
  notes: string[];
};

const GENERIC_PHRASES = [
  "this is the best move",
  "this move wins",
  "move to the highlighted square",
  "this improves your position",
];

const REASON_TOKENS = [
  "because",
  "this works",
  "after",
  "target",
  "structure",
  "square",
  "race",
  "defender",
  "attack",
  "controls",
  "creates",
  "prevents",
  "improves",
  "opens",
  "forces",
];

const TACTIC_MOTIFS = ["fork", "pin", "skewer", "clearance", "deflection", "overloaded"];
const STRUCTURE_WORDS = [
  "pawn chain",
  "isolated pawn",
  "iqp",
  "hanging pawn",
  "backward pawn",
  "locked center",
  "passed pawn",
  "minority attack",
  "breakthrough",
  "pawn break",
];
const IMBALANCE_WORDS = [
  "bishop pair",
  "good knight",
  "bad bishop",
  "open file",
  "exchange",
  "queen vs pieces",
  "space",
  "opposite-colored bishops",
  "initiative",
  "trade",
];
const TECHNIQUE_WORDS = [
  "opposition",
  "triangulation",
  "zugzwang",
  "rook behind passer",
  "rook cutoff",
  "lucena",
  "philidor",
  "outside passer",
  "simplification",
];
const RACE_WORDS = ["race", "opposition", "distance", "square", "key square", "shoulder", "passer", "tempo"];
const PAWN_RACE_WORDS = ["race", "breakthrough", "passer", "promotion", "capture", "tempo", "support"];

function issue(code: string, message: string, fatal: boolean, path?: string): MiniGameTrainingQualityIssue {
  return { code, message, fatal, path };
}

function normalizePlacement(fen: string): string {
  return normalizeFen(fen).split(" ")[0] ?? "";
}

function boardPieces(fen: string): string[] {
  return [...normalizePlacement(fen)].filter((value) => /[prnbqkPRNBQK]/.test(value));
}

function pawnSquares(fen: string): string[] {
  const placement = normalizePlacement(fen);
  const squares: string[] = [];
  let file = 0;
  let rank = 8;

  for (const char of placement) {
    if (char === "/") {
      file = 0;
      rank -= 1;
      continue;
    }
    if (/\d/.test(char)) {
      file += Number(char);
      continue;
    }
    const square = `${String.fromCharCode(97 + file)}${rank}`;
    if (char === "p" || char === "P") {
      squares.push(square);
    }
    file += 1;
  }

  return squares;
}

function getAllCandidateText(candidate: MiniGameGenerationCandidate): string {
  return [
    candidate.family,
    candidate.motif ?? "",
    candidate.prompt,
    candidate.instruction,
    candidate.goal,
    candidate.explanation,
    candidate.conceptTags.join(" "),
  ]
    .map((value) => normalizeText(value).toLowerCase())
    .filter(Boolean)
    .join(" | ");
}

function getPromptText(candidate: MiniGameGenerationCandidate): string {
  return normalizeText(candidate.prompt).toLowerCase();
}

function getExplanationText(candidate: MiniGameGenerationCandidate): string {
  return normalizeText(candidate.explanation).toLowerCase();
}

function getCandidateCount(candidate: MiniGameGenerationCandidate): number {
  return Math.max(
    1,
    candidate.analysis.candidateCount ?? 0,
    candidate.solution.acceptedMoves?.length ?? 0,
  );
}

export function countPieces(fen: string): number {
  return boardPieces(fen).length;
}

export function countPawns(fen: string): number {
  return boardPieces(fen).filter((piece) => piece === "p" || piece === "P").length;
}

export function countSidePieces(fen: string, side: "w" | "b" = "w"): number {
  const pieces = boardPieces(fen);
  return pieces.filter((piece) => (side === "w" ? piece === piece.toUpperCase() : piece === piece.toLowerCase())).length;
}

function countPawnGroups(fen: string): number {
  return new Set(pawnSquares(fen).map((square) => square.slice(0, 1))).size;
}

function hasStructureLanguage(candidate: MiniGameGenerationCandidate): boolean {
  return STRUCTURE_WORDS.some((word) => getAllCandidateText(candidate).includes(word));
}

function hasImbalanceLanguage(candidate: MiniGameGenerationCandidate): boolean {
  return IMBALANCE_WORDS.some((word) => getAllCandidateText(candidate).includes(word));
}

function hasTechniqueLanguage(candidate: MiniGameGenerationCandidate): boolean {
  return TECHNIQUE_WORDS.some((word) => getAllCandidateText(candidate).includes(word));
}

function hasRaceLanguage(candidate: MiniGameGenerationCandidate): boolean {
  return RACE_WORDS.some((word) => getAllCandidateText(candidate).includes(word));
}

function hasPawnRaceLanguage(candidate: MiniGameGenerationCandidate): boolean {
  return PAWN_RACE_WORDS.some((word) => getAllCandidateText(candidate).includes(word));
}

export function hasGenericExplanation(explanation: string, strict = false): boolean {
  const text = normalizeText(explanation).toLowerCase();
  if (!text) return true;
  if (GENERIC_PHRASES.some((phrase) => text.includes(phrase))) return true;
  const reasonHits = REASON_TOKENS.filter((token) => text.includes(token)).length;
  const chessSpecificHits = [
    "king",
    "queen",
    "rook",
    "bishop",
    "knight",
    "pawn",
    "file",
    "rank",
    "center",
    "opposition",
    "passer",
    "outpost",
    "invasion",
    "fork",
    "pin",
    "skewer",
    "break",
    "trade",
    "control",
    "attack",
    "defend",
  ].filter((token) => text.includes(token)).length;
  if (strict) {
    return text.length < 60 || reasonHits < 2 || chessSpecificHits === 0;
  }
  return text.length < 24 || (reasonHits === 0 && chessSpecificHits === 0);
}

export function hasPreAnswerSpoilerOverlays(candidate: MiniGameGenerationCandidate): boolean {
  const strictMode = getCandidateCount(candidate) <= 2;
  const hasArrows = Boolean(candidate.overlays.arrows?.length);
  const hasHighlights = Boolean(candidate.overlays.targetSquares?.length || candidate.overlays.keySquares?.length);
  const hasMotifSpoiler = candidate.miniGameId === "tactic_shots" && (candidate.difficulty === "medium" || candidate.difficulty === "hard")
    ? TACTIC_MOTIFS.some((motif) => getPromptText(candidate).includes(motif))
    : false;

  if (hasArrows) {
    return true;
  }
  if (strictMode && candidate.miniGameId === "tactic_shots" && (candidate.difficulty === "medium" || candidate.difficulty === "hard")) {
    return hasHighlights || hasMotifSpoiler;
  }
  if (strictMode && candidate.miniGameId === "tactic_shots") {
    return hasHighlights || hasMotifSpoiler;
  }
  return false;
}

export function hasMinimumPlausibleChoices(candidate: MiniGameGenerationCandidate): boolean {
  return getCandidateCount(candidate) >= 2;
}

function buildIssueList(candidate: MiniGameGenerationCandidate, strictMode: boolean): MiniGameTrainingQualityIssue[] {
  const issues: MiniGameTrainingQualityIssue[] = [];
  const pieces = countPieces(candidate.board.fen);
  const pawns = countPawns(candidate.board.fen);
  const candidateCount = getCandidateCount(candidate);
  const explanationGeneric = hasGenericExplanation(candidate.explanation, strictMode);
  const spoilerOverlays = hasPreAnswerSpoilerOverlays(candidate);

  if (explanationGeneric) {
    issues.push(issue("generic_explanation", "Explanation is too generic for training use.", true, "explanation"));
  }
  if (spoilerOverlays) {
    issues.push(issue("pre_answer_spoiler", "Scenario exposes answer spoilers before reveal.", true, "overlays"));
  }
  if (!hasMinimumPlausibleChoices(candidate)) {
    issues.push(issue("not_enough_choices", "Scenario does not leave enough plausible choices.", true, "analysis.candidateCount"));
  }

  if (candidate.miniGameId === "tactic_shots") {
    const motifSpoiler = candidate.difficulty === "medium" || candidate.difficulty === "hard"
      ? TACTIC_MOTIFS.some((motif) => getPromptText(candidate).includes(motif))
      : false;
    if (strictMode && pieces < 16) {
      issues.push(issue("sparse_tactic_board", "Tactic Shots board is too sparse.", true, "board.fen"));
    }
    if (strictMode && pawns < 8) {
      issues.push(issue("sparse_tactic_pawns", "Tactic Shots needs more pawns to read like a real tactic.", true, "board.fen"));
    }
    if (candidateCount < 2) {
      issues.push(issue("weak_tactic_choices", "Tactic Shots needs at least two plausible tactical candidates.", true, "analysis.candidateCount"));
    }
    if (strictMode && motifSpoiler) {
      issues.push(issue("motif_spoiler", "Tactic Shots prompt spoils the exact motif.", true, "prompt"));
    }
  }

  if (candidate.miniGameId === "key_square_conquest") {
    const targetCount = (candidate.overlays.keySquares ?? candidate.overlays.targetSquares ?? []).length;
    const explanation = getExplanationText(candidate);
    if (!targetCount) {
      issues.push(issue("missing_key_square", "Key Square Conquest needs a visible key square.", true, "overlays.keySquares"));
    }
    if (strictMode && pieces < 14) {
      issues.push(issue("sparse_key_square_board", "Key Square Conquest board is too sparse.", true, "board.fen"));
    }
    if (strictMode && pawns < 8) {
      issues.push(issue("sparse_key_square_pawns", "Key Square Conquest needs more pawns to make the square matter.", true, "board.fen"));
    }
    const hasReasonForSquare = /because|why|matters|important|decisive|critical|weak|threat|attack|invasion|outpost|entry|anchor|support|space|file|rank|creates|forces/i.test(explanation);
    const bareControlPhrase = /control (this|the) square/.test(explanation) || /^control the square$/.test(explanation);
    if (!hasReasonForSquare || (bareControlPhrase && !/because|why|matters|important|decisive|critical|weak|threat|attack|invasion|outpost|entry|anchor|support|space|file|rank|creates|forces/i.test(explanation))) {
      issues.push(issue("key_square_explanation_missing_reason", "Key square explanation needs a reason, not just a label.", true, "explanation"));
    }
  }

  if (candidate.miniGameId === "structure_builder") {
    if (!hasStructureLanguage(candidate)) {
      issues.push(issue("missing_structure_language", "Structure Builder needs an actual pawn-structure concept.", true, "conceptTags"));
    }
    if (strictMode && pieces < 12) {
      issues.push(issue("sparse_structure_board", "Structure Builder board is too sparse.", true, "board.fen"));
    }
    if (strictMode && pawns < 8) {
      issues.push(issue("sparse_structure_pawns", "Structure Builder needs more pawns to show the structure.", true, "board.fen"));
    }
    if (strictMode && countPawnGroups(candidate.board.fen) < 2) {
      issues.push(issue("structure_groups_missing", "Structure Builder needs at least two pawn groups.", true, "board.fen"));
    }
    if (!/before|after|change|changes|break|repair|open|opens|close|closes|skeleton|chain|advance/i.test(candidate.explanation)) {
      issues.push(issue("structure_before_after_missing", "Structure Builder explanation needs before/after structure language.", true, "explanation"));
    }
    if (strictMode && countPawns(candidate.board.fen) <= 1) {
      issues.push(issue("one_pawn_structure", "One-pawn pseudo-structure scenarios are not acceptable.", true, "board.fen"));
    }
  }

  if (candidate.miniGameId === "imbalance_arena") {
    if (!hasImbalanceLanguage(candidate)) {
      issues.push(issue("missing_imbalance_language", "Imbalance Arena needs a visible imbalance concept.", true, "conceptTags"));
    }
    if (strictMode && pieces < 14) {
      issues.push(issue("sparse_imbalance_board", "Imbalance Arena board is too sparse.", true, "board.fen"));
    }
    if (strictMode && countPawns(candidate.board.fen) < 6) {
      issues.push(issue("sparse_imbalance_pawns", "Imbalance Arena needs enough pawns to read the imbalance.", true, "board.fen"));
    }
    if (!/use|preserve|convert|exploit|activate|keep|trade|improve|support|compensate/i.test(candidate.explanation)) {
      issues.push(issue("imbalance_explanation_missing_reason", "Imbalance explanation must say how the move uses the imbalance.", true, "explanation"));
    }
  }

  if (candidate.miniGameId === "technique_lab") {
    if (!hasTechniqueLanguage(candidate)) {
      issues.push(issue("missing_technique_language", "Technique Lab needs an explicit endgame technique.", true, "conceptTags"));
    }
    if (!/win|draw|hold|convert|promote|stop/i.test(candidate.goal)) {
      issues.push(issue("missing_result_goal", "Technique Lab needs a result goal.", true, "goal"));
    }
    if (!/opposition|triangulation|zugzwang|lucena|philidor|rook|passer|simplification/i.test(candidate.explanation)) {
      issues.push(issue("technique_explanation_missing_name", "Technique Lab explanation must name the technique.", true, "explanation"));
    }
  }

  if (candidate.miniGameId === "king_race") {
    if (countPieces(candidate.board.fen) < 3 || countSidePieces(candidate.board.fen, "w") < 1 || countSidePieces(candidate.board.fen, "b") < 1) {
      issues.push(issue("missing_kings", "King Race needs both kings and a pawn.", true, "board.fen"));
    }
    if (!hasRaceLanguage(candidate)) {
      issues.push(issue("missing_race_language", "King Race needs distance or race language.", true, "conceptTags"));
    }
    if (!/because|after|race|opposition|distance|square|key square|tempo/i.test(candidate.explanation)) {
      issues.push(issue("king_race_explanation_missing_reason", "King Race explanation needs race or opposition reasoning.", true, "explanation"));
    }
  }

  if (candidate.miniGameId === "knight_gymnasium") {
    if (strictMode && pieces < 8) {
      issues.push(issue("sparse_knight_board", "Knight Gymnasium board is too sparse.", true, "board.fen"));
    }
    if (strictMode && pawns < 4) {
      issues.push(issue("sparse_knight_pawns", "Knight Gymnasium needs more pawns for geometry or tactics.", true, "board.fen"));
    }
    const tacticalLanguage = /fork|attack|defense|target/.test(getAllCandidateText(candidate));
    const geometryLanguage = /route|path|reroute|jump|shorten|improve/.test(getAllCandidateText(candidate));
    if (!tacticalLanguage && !geometryLanguage) {
      issues.push(issue("knight_missing_mode_language", "Knight Gymnasium needs geometry or tactical language.", true, "explanation"));
    }
    if (geometryLanguage && /best move/i.test(candidate.explanation) && !/route|path|reroute|jump/i.test(candidate.explanation)) {
      issues.push(issue("knight_geometry_best_move_spoiler", "Geometry mode should not claim the answer is simply the best move.", true, "explanation"));
    }
    if (tacticalLanguage && !/fork|attack|defense|target/i.test(candidate.explanation)) {
      issues.push(issue("knight_tactical_missing_target", "Tactical Knight Gymnasium needs a target or fork explanation.", true, "explanation"));
    }
  }

  if (candidate.miniGameId === "pawn_wars") {
    if (strictMode && pieces < 6) {
      issues.push(issue("sparse_pawn_board", "Pawn Wars board is too sparse.", true, "board.fen"));
    }
    if (strictMode && countPawns(candidate.board.fen) < 4) {
      issues.push(issue("sparse_pawn_count", "Pawn Wars needs enough pawns for a real race.", true, "board.fen"));
    }
    if (strictMode && countPawns(candidate.board.fen) <= 1 && !/square of the pawn/.test(getAllCandidateText(candidate))) {
      issues.push(issue("only_one_pawn", "Pawn Wars cannot be just a single-pawn push.", true, "board.fen"));
    }
    if (!hasPawnRaceLanguage(candidate)) {
      issues.push(issue("missing_pawn_race_language", "Pawn Wars needs race or promotion language.", true, "conceptTags"));
    }
    if (!/king|race|passer|promotion|breakthrough|tempo|capture|support/i.test(candidate.explanation)) {
      issues.push(issue("pawn_wars_explanation_missing_reason", "Pawn Wars explanation needs a pawn-race reason.", true, "explanation"));
    }
  }

  return issues;
}

export function validateTrainingQuality(candidate: MiniGameGenerationCandidate): MiniGameTrainingQualityResult {
  const strictMode = getCandidateCount(candidate) <= 2;
  const issues = buildIssueList(candidate, strictMode);
  return {
    passed: issues.length === 0,
    strictMode,
    issues,
    notes: issues.length === 0 ? ["training_quality_passed"] : Array.from(new Set(issues.map((issue) => issue.code))),
  };
}
