import { Chess } from "chess.js";

import type { CurrentInstructionTarget } from "../runtime/currentInstructionFrame";
import type { BlundrBrainAnalysis } from "../brain/types";  // v2.7.39.3 integration start
import { getAttackedSquares, getPieceAttacksFrom } from "./attackMap";

export type CoachInputContext = {
  fenBefore: string;
  target: CurrentInstructionTarget;
  trainerMode: "restricted" | "continuation";
  trainerPhase: string;
  isContinuation: boolean;
  openingId?: string | null;
  lineId?: string | null;
  activeLineName?: string | null;
  recentCoachBodies?: string[];
  recentCoachThemes?: string[];
  legalMoveCountBefore?: number;
  brainAnalysis?: BlundrBrainAnalysis | null;  // v2.7.39.3: optional Brain input for migration
};

export type PositionDeltaPacket = {
  legalMoveCountBefore: number;
  legalMoveCountAfter: number;
  sideToMoveBefore: "w" | "b";
  sideToMoveAfter: "w" | "b";
  isCheckAfter: boolean;
  isCheckmateAfter: boolean;
  attackedSquaresBefore: string[];
  attackedSquaresAfter: string[];
  centerControlBefore: string[];
  centerControlAfter: string[];
  openedLines: string[];
  openedDiagonals: string[];
};

export type FeaturePacket = {
  developmentFeatures: string[];
  centerFeatures: string[];
  kingSafetyFeatures: string[];
  tacticalFeatures: string[];
  lineActivityFeatures: string[];
  threatFeatures: string[];
  planFeatures: string[];
  status: "ran" | "ran_empty" | "skipped_no_target" | "failed";
  failureReason?: string;
};

export type PlanType =
  | "develop_minor_piece"
  | "claim_center"
  | "support_center"
  | "prepare_castling"
  | "castle_king"
  | "activate_bishop"
  | "activate_rook"
  | "open_diagonal"
  | "open_file"
  | "prepare_pawn_break"
  | "pressure_f7"
  | "pressure_f2"
  | "defend_center"
  | "answer_threat"
  | "forcing_check"
  | "checkmate"
  | "capture_material"
  | "stable_continuation";

export type PlanPacketItem = {
  planId: string;
  planType: PlanType;
  confidence: number;
  moveUci: string;
  evidenceTags: string[];
  userFacingSummary: string;
  status: "verified" | "candidate";
};

export type PlanPacket = {
  plans: PlanPacketItem[];
  status: "ran" | "ran_empty" | "skipped_no_target" | "failed";
};

export type PedagogicalTheme =
  | "checkmate"
  | "forcing_move"
  | "check"
  | "capture_or_recapture"
  | "central_pawn_advance"
  | "minor_piece_development"
  | "bishop_activation"
  | "castle_king_safety"
  | "center_support"
  | "open_line_or_diagonal"
  | "plan_preparation"
  | "threat_response"
  | "stable_continuation";

export type PedagogicalOpportunity = {
  id: string;
  moveUci: string;
  theme: PedagogicalTheme;
  intent: string;
  score: number;
  titleCandidate: string;
  evidenceTags: string[];
  requiredFacts: string[];
  forbiddenIfMissingFacts: string[];
  source: string;
};

export type CoachExplanation = {
  title: string;
  body: string;
  intent: string;
  source: string;
  coachMoveUci: string;
  coachPieceType: string;
  selectedTheme: PedagogicalTheme | null;
  selectedEvidenceTags: string[];
  safetyStatus: "safe" | "unsafe";
  qualityScore: number;
  usedFallback: boolean;
  fallbackReason: string | null;
  selectedOpportunityId: string | null;
  selectedOpportunityLayer: string | null;
  selectedOpportunityScore: number | null;
  selectedTemplateId: string | null;
  selectedPlanType: string | null;
};

export type CoachSafetyResult = {
  safe: boolean;
  blockedReasons: string[];
  containsDebugLeak: boolean;
};

type CoachQuality = {
  hasVisibleCoach: boolean;
  userFacingCopy: boolean;
  containsDebugLeak: boolean;
  targetAligned: boolean;
  pieceAligned: boolean;
  hasPedagogicalReason: boolean;
  hasVerifiedTheme: boolean;
  selectedTheme: string | null;
  evidenceTags: string[];
  usedFallback: boolean;
  fallbackReason: string | null;
  repeatedGeneric: boolean;
  qualityScore: number;
};

const CENTER = new Set(["d4", "e4", "d5", "e5"]);
const EXTENDED_CENTER = new Set(["c4", "f4", "c5", "f5", "d4", "e4", "d5", "e5"]);
const HOME_SQUARES = new Set(["b1", "g1", "c1", "f1", "b8", "g8", "c8", "f8"]);
const DEBUG_BANNED = [
  "verified move:",
  "pawn from",
  "knight from",
  "bishop from",
  "rook from",
  "queen from",
  "king from",
  "not_exposed_from_module",
  "pipeline",
  "fallback",
  "runtime",
  "candidate source",
];

function normalizePieceName(pieceType: string | null | undefined): string {
  const normalized = String(pieceType || "").trim().toLowerCase();
  if (normalized === "p" || normalized === "pawn") return "pawn";
  if (normalized === "n" || normalized === "knight") return "knight";
  if (normalized === "b" || normalized === "bishop") return "bishop";
  if (normalized === "r" || normalized === "rook") return "rook";
  if (normalized === "q" || normalized === "queen") return "queen";
  if (normalized === "k" || normalized === "king") return "king";
  return "piece";
}

function normalizeFen4(fen: string): string {
  return String(fen).trim().split(/\s+/).slice(0, 4).join(" ");
}

function attacksCenterSquares(fen: string, from: string): string[] {
  return getPieceAttacksFrom(fen, from).filter((sq) => CENTER.has(sq));
}

export function buildMoveFactPacket(context: CoachInputContext): CurrentInstructionTarget & {
  pieceName: string;
  fenAfter: string;
  pieceStartedOnHomeSquare: boolean;
  developsMinorPiece: boolean;
  movesTowardCenter: boolean;
  controlsCenter: boolean;
  supportsCenter: boolean;
  centralPawnAdvance: boolean;
  challengesOpponentCenter: boolean;
  gainsSpace: boolean;
  opensLine: boolean;
  opensDiagonal: boolean;
  opensFile: boolean;
  preparesCastling: boolean;
  castlesKing: boolean;
  connectsRooks: boolean;
  improvesPieceActivity: boolean;
  attacksSensitiveSquare: boolean;
  attacksF7OrF2: boolean;
  givesCheck: boolean;
  givesMate: boolean;
  recaptures: boolean;
  attacksQueen: boolean;
  attacksLoosePiece: boolean;
  createsThreat: boolean;
  respondsToThreat: boolean;
  planTags: string[];
  evidenceTags: string[];
} {
  const target = context.target;
  const piece = normalizePieceName(target.pieceType);
  const after = target.resultingFen;
  const pieceAttacksCenter = attacksCenterSquares(after, target.to);
  const centralPawnAdvance = target.pieceType === "p" && EXTENDED_CENTER.has(target.to);
  const movesTowardCenter = EXTENDED_CENTER.has(target.to) || pieceAttacksCenter.length > 0;
  const opensDiagonal = target.pieceType === "p" && ["c", "d", "e", "f"].includes(target.from[0]) && Math.abs(Number(target.to[1]) - Number(target.from[1])) === 1;
  const opensFile = target.pieceType === "p" && target.from[0] === target.to[0];
  const preparesCastling = target.isDevelopment && (target.from === "g1" || target.from === "f1" || target.from === "b8" || target.from === "c8");
  const castlesKing = target.isCastle;
  const attacksSensitiveSquare = getPieceAttacksFrom(after, target.to).includes(target.color === "w" ? "f7" : "f2");
  const planTags: string[] = [];
  if (target.isDevelopment) planTags.push("develop_minor_piece");
  if (centralPawnAdvance) planTags.push("claim_center");
  if (preparesCastling) planTags.push("prepare_castling");
  if (castlesKing) planTags.push("castle_king");
  if (target.isCheck) planTags.push("forcing_check");
  if (target.isMate) planTags.push("checkmate");
  if (target.isCapture) planTags.push("capture_material");
  const evidenceTags = Array.from(new Set([
    `piece:${piece}`,
    target.isDevelopment ? "development" : "",
    centralPawnAdvance ? "center_advance" : "",
    target.isCheck ? "check" : "",
    target.isMate ? "mate" : "",
    attacksSensitiveSquare ? "sensitive_square_pressure" : "",
  ].filter(Boolean)));
  return {
    ...target,
    pieceName: piece,
    fenAfter: after,
    pieceStartedOnHomeSquare: HOME_SQUARES.has(target.from),
    developsMinorPiece: (target.pieceType === "n" || target.pieceType === "b") && target.isDevelopment,
    movesTowardCenter,
    controlsCenter: pieceAttacksCenter.length > 0 || CENTER.has(target.to),
    supportsCenter: pieceAttacksCenter.length > 0,
    centralPawnAdvance,
    challengesOpponentCenter: centralPawnAdvance,
    gainsSpace: centralPawnAdvance,
    opensLine: opensDiagonal || opensFile,
    opensDiagonal,
    opensFile,
    preparesCastling,
    castlesKing,
    connectsRooks: castlesKing,
    improvesPieceActivity: target.isDevelopment || movesTowardCenter,
    attacksSensitiveSquare,
    attacksF7OrF2: attacksSensitiveSquare,
    givesCheck: target.isCheck,
    givesMate: target.isMate,
    recaptures: target.isCapture,
    attacksQueen: false,
    attacksLoosePiece: false,
    createsThreat: target.isCheck || attacksSensitiveSquare,
    respondsToThreat: false,
    planTags,
    evidenceTags,
  };
}

export function buildPositionDelta(context: CoachInputContext, moveFacts: ReturnType<typeof buildMoveFactPacket>): PositionDeltaPacket {
  const before = new Chess(context.fenBefore);
  const after = new Chess(moveFacts.fenAfter);
  const attackedBefore = getAttackedSquares(context.fenBefore, moveFacts.color);
  const attackedAfter = getAttackedSquares(moveFacts.fenAfter, moveFacts.color);
  const centerBefore = attackedBefore.filter((sq) => CENTER.has(sq));
  const centerAfter = attackedAfter.filter((sq) => CENTER.has(sq));
  const openedLines: string[] = moveFacts.opensFile ? [moveFacts.to[0]] : [];
  const openedDiagonals: string[] = moveFacts.opensDiagonal ? [moveFacts.from, moveFacts.to] : [];
  return {
    legalMoveCountBefore: before.moves().length,
    legalMoveCountAfter: after.moves().length,
    sideToMoveBefore: before.turn() as "w" | "b",
    sideToMoveAfter: after.turn() as "w" | "b",
    isCheckAfter: after.isCheck(),
    isCheckmateAfter: after.isCheckmate(),
    attackedSquaresBefore: attackedBefore,
    attackedSquaresAfter: attackedAfter,
    centerControlBefore: centerBefore,
    centerControlAfter: centerAfter,
    openedLines,
    openedDiagonals,
  };
}

export function detectCoachFeatures(moveFacts: ReturnType<typeof buildMoveFactPacket>, delta: PositionDeltaPacket): FeaturePacket {
  try {
    const developmentFeatures: string[] = [];
    const centerFeatures: string[] = [];
    const kingSafetyFeatures: string[] = [];
    const tacticalFeatures: string[] = [];
    const lineActivityFeatures: string[] = [];
    const threatFeatures: string[] = [];
    const planFeatures: string[] = [];
    if (moveFacts.developsMinorPiece) {
      developmentFeatures.push(`${moveFacts.pieceName}_develops`);
      planFeatures.push("develop_minor_piece");
    }
    if (moveFacts.centralPawnAdvance) {
      centerFeatures.push("central_pawn_advance");
      centerFeatures.push("gains_space");
      planFeatures.push("claim_center");
    }
    if (moveFacts.controlsCenter || delta.centerControlAfter.length > delta.centerControlBefore.length) {
      centerFeatures.push("center_control_increase");
      planFeatures.push("support_center");
    }
    if (moveFacts.castlesKing || moveFacts.preparesCastling) {
      kingSafetyFeatures.push(moveFacts.castlesKing ? "castles_king" : "prepares_castling");
      planFeatures.push(moveFacts.castlesKing ? "castle_king" : "prepare_castling");
    }
    if (moveFacts.givesMate) tacticalFeatures.push("checkmate");
    else if (moveFacts.givesCheck) tacticalFeatures.push("check");
    if (moveFacts.isCapture) tacticalFeatures.push("capture");
    if (moveFacts.opensDiagonal) lineActivityFeatures.push("open_diagonal");
    if (moveFacts.opensFile) lineActivityFeatures.push("open_file");
    if (moveFacts.attacksF7OrF2) threatFeatures.push("attacks_sensitive_square");
    const total = developmentFeatures.length + centerFeatures.length + kingSafetyFeatures.length + tacticalFeatures.length + lineActivityFeatures.length + threatFeatures.length + planFeatures.length;
    return {
      developmentFeatures,
      centerFeatures,
      kingSafetyFeatures,
      tacticalFeatures,
      lineActivityFeatures,
      threatFeatures,
      planFeatures,
      status: total > 0 ? "ran" : "ran_empty",
    };
  } catch (error) {
    return {
      developmentFeatures: [],
      centerFeatures: [],
      kingSafetyFeatures: [],
      tacticalFeatures: [],
      lineActivityFeatures: [],
      threatFeatures: [],
      planFeatures: [],
      status: "failed",
      failureReason: error instanceof Error ? error.message : "feature_detection_failed",
    };
  }
}

export function recognizeCoachPlans(moveFacts: ReturnType<typeof buildMoveFactPacket>, features: FeaturePacket): PlanPacket {
  const plans: PlanPacketItem[] = [];
  const add = (planType: PlanType, confidence: number, summary: string, status: "verified" | "candidate" = "verified") => {
    plans.push({
      planId: `${planType}:${moveFacts.uci}`,
      planType,
      confidence,
      moveUci: moveFacts.uci,
      evidenceTags: moveFacts.evidenceTags,
      userFacingSummary: summary,
      status,
    });
  };
  if (moveFacts.givesMate) add("checkmate", 1, "This move ends the game immediately.");
  else if (moveFacts.givesCheck) add("forcing_check", 0.92, "This move gives check and forces a reply.");
  if (moveFacts.isCapture) add("capture_material", 0.8, "This move wins material by capture.");
  if (moveFacts.castlesKing) add("castle_king", 0.92, "This castles and improves king safety.");
  if (moveFacts.preparesCastling) add("prepare_castling", 0.75, "This supports safe castling.");
  if (moveFacts.developsMinorPiece) add("develop_minor_piece", 0.86, "This develops a minor piece.");
  if (moveFacts.centralPawnAdvance) add("claim_center", 0.88, "This claims central space.");
  if (moveFacts.controlsCenter || features.centerFeatures.length) add("support_center", 0.72, "This increases central control.");
  if (moveFacts.pieceType === "b" && moveFacts.isDevelopment) add("activate_bishop", 0.82, "This activates the bishop on a useful diagonal.");
  if (moveFacts.pieceType === "r" && (moveFacts.opensFile || moveFacts.improvesPieceActivity)) add("activate_rook", 0.72, "This improves rook activity.");
  if (moveFacts.opensDiagonal) add("open_diagonal", 0.7, "This opens a diagonal for your pieces.");
  if (moveFacts.opensFile) add("open_file", 0.7, "This opens a file for rook play.");
  if (!plans.length) add("stable_continuation", 0.5, "This keeps improving your position.", "candidate");
  return { plans, status: plans.length ? "ran" : "ran_empty" };
}

function rankTheme(theme: PedagogicalTheme): number {
  if (theme === "checkmate") return 1000;
  if (theme === "forcing_move") return 600;
  if (theme === "check") return 580;
  if (theme === "capture_or_recapture") return 450;
  if (theme === "threat_response") return 400;
  if (theme === "castle_king_safety") return 350;
  if (theme === "central_pawn_advance") return 330;
  if (theme === "minor_piece_development") return 320;
  if (theme === "bishop_activation") return 300;
  if (theme === "center_support") return 280;
  if (theme === "plan_preparation") return 260;
  if (theme === "open_line_or_diagonal") return 240;
  return 100;
}

export function rankCoachOpportunities(
  context: CoachInputContext,
  moveFacts: ReturnType<typeof buildMoveFactPacket>,
  features: FeaturePacket,
  planPacket: PlanPacket,
): { opportunities: PedagogicalOpportunity[]; selected: PedagogicalOpportunity } {
  const opportunities: PedagogicalOpportunity[] = [];
  const add = (theme: PedagogicalTheme, title: string, evidence: string[], requiredFacts: string[]) => {
    const repeatedPenalty = (context.recentCoachThemes ?? []).slice(-3).includes(theme) ? 75 : 0;
    opportunities.push({
      id: `opp:${theme}:${moveFacts.uci}`,
      moveUci: moveFacts.uci,
      theme,
      intent: "explain_plan",
      score: rankTheme(theme) - repeatedPenalty,
      titleCandidate: title,
      evidenceTags: evidence,
      requiredFacts,
      forbiddenIfMissingFacts: [],
      source: "verified_coach_explanation",
    });
  };
  if (moveFacts.givesMate) add("checkmate", "Finish the attack", ["mate"], ["isMate"]);
  else if (moveFacts.givesCheck) add("check", "Use the forcing move", ["check"], ["isCheck"]);
  if (moveFacts.isCapture) add("capture_or_recapture", "Win material cleanly", ["capture"], ["isCapture"]);
  if (moveFacts.castlesKing || (moveFacts.preparesCastling && moveFacts.pieceType !== "b")) {
    add("castle_king_safety", "Get the king safe", ["king_safety"], ["isKingSafetyMove"]);
  }
  if (moveFacts.centralPawnAdvance) add("central_pawn_advance", "Claim the center", ["center_advance"], ["isCentralPawnAdvance"]);
  if (moveFacts.developsMinorPiece && moveFacts.pieceType === "n") add("minor_piece_development", "Develop the knight", ["development", "piece:knight"], ["isDevelopment"]);
  else if (moveFacts.developsMinorPiece && moveFacts.pieceType !== "b") add("minor_piece_development", "Develop with purpose", ["development"], ["isDevelopment"]);
  if (moveFacts.pieceType === "b" && moveFacts.isDevelopment) add("bishop_activation", "Activate the bishop", ["bishop_activity"], ["isDevelopment"]);
  if (moveFacts.controlsCenter || features.centerFeatures.length) add("center_support", "Support the center", ["center_control_increase"], ["controlsCenter"]);
  if (moveFacts.opensDiagonal || moveFacts.opensFile) add("open_line_or_diagonal", "Open lines for your pieces", ["line_activity"], ["opensLine"]);
  if (!opportunities.length || planPacket.plans.every((plan) => plan.planType === "stable_continuation")) {
    add("stable_continuation", "Keep improving", ["stable"], []);
  }
  opportunities.sort((a, b) => b.score - a.score);
  return { opportunities, selected: opportunities[0] };
}

export function buildVerifiedUserFacingFallback(moveFacts: ReturnType<typeof buildMoveFactPacket>): { title: string; body: string; reason: string } {
  if (!moveFacts || !moveFacts.san) {
    return { title: "Improve your position", body: "A legal developing move is available.", reason: "no_verified_move" };
  }
  const san = moveFacts.san;
  const pieceName = moveFacts.pieceName || normalizePieceName(moveFacts.pieceType);
  const dest = (moveFacts.to || "").toLowerCase();
  const centralSquares = new Set(["d4", "e4", "d5", "e5"]);
  const isCentralCapture = moveFacts.isCapture && centralSquares.has(dest);
  let shortTitle = "Continue the position";
  let reasonText = `This improves your ${pieceName} and keeps your position flexible.`;
  if (moveFacts.givesMate) {
    shortTitle = "Checkmate";
    reasonText = `This is checkmate, so Black has no legal reply.`;
  } else if (moveFacts.givesCheck) {
    shortTitle = "Give check";
    reasonText = `This gives check and forces a response.`;
  } else if (moveFacts.castlesKing) {
    shortTitle = "Castle to safety";
    reasonText = `This moves your king to safety and brings the rook into the game.`;
  } else if (moveFacts.isCapture) {
    shortTitle = isCentralCapture ? "Capture in the center" : "Gain material";
    reasonText = `This capture improves your material balance.`;
  } else if (moveFacts.centralPawnAdvance) {
    shortTitle = "Challenge the center";
    reasonText = `This contests central space and opens lines for your pieces.`;
  } else if (moveFacts.developsMinorPiece) {
    shortTitle = moveFacts.pieceType === "n" ? "Develop the knight" : "Develop the bishop";
    reasonText = `This develops your ${pieceName} toward active central squares.`;
    if (moveFacts.pieceType === "b" && moveFacts.attacksF7OrF2) {
      reasonText = `This places the bishop on an active diagonal and helps create pressure toward f7.`;
    }
  } else if (moveFacts.pieceType === "b" && moveFacts.isDevelopment) {
    shortTitle = "Develop the bishop";
    reasonText = `This develops the bishop to an active diagonal.`;
  }
  return {
    title: `${san} — ${shortTitle}`,
    body: `Move the ${pieceName} to ${dest}. ${reasonText}`,
    reason: "verified_structured",
  };
}

export function renderCoachExplanation(
  moveFacts: ReturnType<typeof buildMoveFactPacket>,
  selected: PedagogicalOpportunity,
): CoachExplanation {
  const layerFromTheme = (theme: PedagogicalTheme): string =>
    theme === "checkmate" || theme === "check" || theme === "forcing_move" || theme === "capture_or_recapture" ? "tactical"
      : theme === "castle_king_safety" ? "king_safety"
      : theme === "central_pawn_advance" || theme === "center_support" ? "center"
      : theme === "minor_piece_development" || theme === "bishop_activation" ? "development"
      : theme === "stable_continuation" ? "fallback"
      : "strategy";

  // Step 3: Assisted View coaching copy must use verified SAN + piece + dest from moveFacts, in required format.
  // No generic "Focus on..." or "Play ..." or "repositioning" when verified data exists.
  const san = moveFacts.san || "move";
  const pieceName = moveFacts.pieceName || "piece";
  const dest = (moveFacts.to || "").toLowerCase();
  const centralSquares = new Set(["d4", "e4", "d5", "e5"]);
  const isCentralCapture = moveFacts.isCapture && centralSquares.has(dest);
  let shortTitle = "Continue the position";
  let reasonText = `This improves your ${pieceName} and keeps your position flexible.`;
  if (selected.theme === "checkmate" || moveFacts.givesMate) {
    shortTitle = "Checkmate";
    reasonText = `This is checkmate, so Black has no legal reply.`;
  } else if (selected.theme === "check" || selected.theme === "forcing_move" || moveFacts.givesCheck) {
    shortTitle = "Give check";
    reasonText = `This gives check and forces Black to respond before continuing their plan.`;
  } else if (selected.theme === "castle_king_safety" || moveFacts.castlesKing) {
    shortTitle = "Castle to safety";
    reasonText = moveFacts.castlesKing
      ? `This moves your king to safety and brings the rook into the game.`
      : `This supports castling and improves king safety.`;
  } else if (selected.theme === "capture_or_recapture" || moveFacts.isCapture) {
    shortTitle = isCentralCapture ? "Capture in the center" : "Gain material";
    reasonText = `This capture improves your material balance.`;
  } else if (selected.theme === "central_pawn_advance" || moveFacts.centralPawnAdvance) {
    shortTitle = "Challenge the center";
    reasonText = `This contests central space and opens lines for your pieces.`;
  } else if (selected.theme === "minor_piece_development" || moveFacts.developsMinorPiece) {
    shortTitle = moveFacts.pieceType === "n" ? "Develop the knight" : "Develop the bishop";
    reasonText = `This develops your ${pieceName} toward active central squares.`;
    if (moveFacts.pieceType === "b" && (moveFacts.attacksF7OrF2 || moveFacts.attacksSensitiveSquare)) {
      reasonText = `This places the bishop on an active diagonal and helps create pressure toward f7.`;
    }
  } else if (selected.theme === "bishop_activation" || (moveFacts.pieceType === "b" && moveFacts.isDevelopment)) {
    shortTitle = "Develop the bishop";
    reasonText = `This develops the bishop to an active diagonal and improves piece coordination.`;
  } else if (selected.theme === "center_support") {
    shortTitle = "Support the center";
    reasonText = `This improves your piece while adding support to central squares.`;
  } else if (selected.theme === "plan_preparation") {
    shortTitle = "Prepare the plan";
    reasonText = `This prepares the next central break and improves your coordination.`;
  } else if (selected.theme === "open_line_or_diagonal") {
    shortTitle = "Activate on the diagonal";
    reasonText = `This opens lines for your pieces and improves long-range activity.`;
  } else if (selected.theme === "stable_continuation") {
    shortTitle = "Continue the position";
    reasonText = `This keeps improving your position with a solid continuation.`;
  }
  const title = `${san} — ${shortTitle}`;
  const body = `Move the ${pieceName} to ${dest}. ${reasonText}`;

  return {
    title,
    body,
    intent: selected.intent,
    source: "verified_coach_explanation",
    coachMoveUci: moveFacts.uci,
    coachPieceType: moveFacts.pieceType,
    selectedTheme: selected.theme,
    selectedEvidenceTags: selected.evidenceTags,
    safetyStatus: "safe",
    qualityScore: 86,
    usedFallback: false,
    fallbackReason: null,
    selectedOpportunityId: selected.theme,
    selectedOpportunityLayer: layerFromTheme(selected.theme),
    selectedOpportunityScore: selected.score,
    selectedTemplateId: `live:${selected.theme}:${selected.theme === "capture_or_recapture" || selected.theme === "checkmate" ? "explain_tactic" : selected.theme === "central_pawn_advance" ? "explain_center" : "explain_development"}`,
    selectedPlanType: `opportunity:${selected.theme}`,
  };
}

export function lintCoachExplanation(
  explanation: CoachExplanation,
  moveFacts: ReturnType<typeof buildMoveFactPacket>,
): CoachSafetyResult {
  const text = `${explanation.title} ${explanation.body}`.toLowerCase();
  const blockedReasons: string[] = [];
  const mentions = (word: string) => new RegExp(`\\b${word}\\b`, "i").test(text);
  const containsDebugLeak = DEBUG_BANNED.some((token) => text.includes(token));
  if (containsDebugLeak) blockedReasons.push("debug_copy_leaked_to_user");
  if (mentions("checkmate") && !moveFacts.givesMate) blockedReasons.push("unsafe_unverified_coach_claim:checkmate");
  if (mentions("check") && !mentions("checkmate") && !moveFacts.givesCheck && !moveFacts.givesMate) blockedReasons.push("unsafe_unverified_coach_claim:check");
  if ((mentions("capture") || mentions("captures")) && !moveFacts.isCapture) blockedReasons.push("unsafe_unverified_coach_claim:capture");
  if (mentions("initiative")) blockedReasons.push("unsafe_unverified_coach_claim:initiative");
  if (text.includes("without creating unnecessary weaknesses")) blockedReasons.push("unsafe_unverified_coach_claim:weakness");
  if (mentions("center") && !(moveFacts.centralPawnAdvance || moveFacts.controlsCenter || moveFacts.supportsCenter)) blockedReasons.push("unsafe_unverified_coach_claim:center");
  if (mentions("space") && !moveFacts.gainsSpace) blockedReasons.push("unsafe_unverified_coach_claim:space");
  if (mentions("bishop") && moveFacts.pieceType !== "b" && explanation.selectedTheme !== "bishop_activation") blockedReasons.push("unsafe_unverified_coach_claim:bishop");
  if (mentions("knight") && moveFacts.pieceType !== "n" && explanation.selectedTheme !== "minor_piece_development") blockedReasons.push("unsafe_unverified_coach_claim:knight");
  if (mentions("rook") && moveFacts.pieceType !== "r" && !moveFacts.connectsRooks) blockedReasons.push("unsafe_unverified_coach_claim:rook");
  if ((mentions("castle") || mentions("castling")) && !(moveFacts.castlesKing || moveFacts.preparesCastling || moveFacts.isKingSafetyMove)) blockedReasons.push("unsafe_unverified_coach_claim:castling");
  return { safe: blockedReasons.length === 0, blockedReasons, containsDebugLeak };
}

export function scoreCoachQuality(input: {
  explanation: CoachExplanation;
  safety: CoachSafetyResult;
  context: CoachInputContext;
  selected: PedagogicalOpportunity;
}): CoachQuality {
  const text = `${input.explanation.title} ${input.explanation.body}`.trim();
  const repeatedGeneric = (input.context.recentCoachBodies ?? []).slice(-4).filter((body) => body.trim() === input.explanation.body.trim()).length >= 2;
  let qualityScore = 88;
  if (input.explanation.usedFallback) qualityScore = 72;
  if (repeatedGeneric) qualityScore -= 12;
  if (!input.safety.safe) qualityScore = 0;
  if (input.safety.containsDebugLeak) qualityScore = 0;
  return {
    hasVisibleCoach: Boolean(text),
    userFacingCopy: !input.safety.containsDebugLeak,
    containsDebugLeak: input.safety.containsDebugLeak,
    targetAligned: input.explanation.coachMoveUci === input.context.target.uci,
    pieceAligned: input.explanation.coachPieceType === input.context.target.pieceType,
    hasPedagogicalReason: Boolean(input.selected && input.selected.theme !== "stable_continuation"),
    hasVerifiedTheme: Boolean(input.explanation.selectedTheme),
    selectedTheme: input.explanation.selectedTheme,
    evidenceTags: input.explanation.selectedEvidenceTags,
    usedFallback: input.explanation.usedFallback,
    fallbackReason: input.explanation.fallbackReason,
    repeatedGeneric,
    qualityScore,
  };
}

export function buildCoachExplanationPipeline(context: CoachInputContext): {
  moveFactPacket: ReturnType<typeof buildMoveFactPacket>;
  positionDeltaPacket: PositionDeltaPacket;
  featurePacket: FeaturePacket;
  planPacket: PlanPacket;
  opportunityPacket: { opportunities: PedagogicalOpportunity[]; selected: PedagogicalOpportunity };
  coachExplanation: CoachExplanation;
  safetyResult: CoachSafetyResult;
  coachQuality: CoachQuality;
  brainAnalysis?: BlundrBrainAnalysis | null;  // v2.7.39.3 exposure
} {
  const moveFactPacket = buildMoveFactPacket(context);
  const positionDeltaPacket = buildPositionDelta(context, moveFactPacket);
  let featurePacket = detectCoachFeatures(moveFactPacket, positionDeltaPacket);
  let planPacket = recognizeCoachPlans(moveFactPacket, featurePacket);
  let opportunityPacket = rankCoachOpportunities(context, moveFactPacket, featurePacket, planPacket);
  // v2.7.39.3+: Enrich with Brain data if provided (migration scaffolding - will be replaced by full new pipeline)
  if (context.brainAnalysis) {
    const b: any = context.brainAnalysis;
    if (b.features) {
      if (b.features.kingSafety) featurePacket.kingSafetyFeatures = [...featurePacket.kingSafetyFeatures, "brain:king_safety"];
      if (b.features.pawnStructure) featurePacket.centerFeatures = [...featurePacket.centerFeatures, "brain:pawn_structure"];
      featurePacket.status = "ran";
    }
    if (b.plans?.recognized?.length) {
      planPacket.plans = [
        ...planPacket.plans,
        ...b.plans.recognized.slice(0, 2).map((p: any, i: number) => ({
          planId: `brain:${p.type || i}`,
          planType: (p.type || "stable_continuation") as any,
          confidence: 0.9,
          moveUci: context.target.uci,
          evidenceTags: ["brain"],
          userFacingSummary: p.summary || "Brain-derived plan",
          status: "candidate" as const,
        })),
      ];
      planPacket.status = "ran";
    }
  }
  let coachExplanation = renderCoachExplanation(moveFactPacket, opportunityPacket.selected);
  let safetyResult = lintCoachExplanation(coachExplanation, moveFactPacket);
  if (!safetyResult.safe) {
    const fallback = buildVerifiedUserFacingFallback(moveFactPacket);
    coachExplanation = {
      ...coachExplanation,
      title: fallback.title,
      body: fallback.body,
      source: safetyResult.containsDebugLeak ? "verified_safe_fallback" : "verified_safe_fallback",
      safetyStatus: "safe",
      usedFallback: true,
      fallbackReason: fallback.reason,
      qualityScore: 72,
      selectedTemplateId: `fallback:${coachExplanation.selectedTheme ?? "stable_continuation"}:verified_safe`,
    };
    safetyResult = lintCoachExplanation(coachExplanation, moveFactPacket);
  }
  const coachQuality = scoreCoachQuality({
    explanation: coachExplanation,
    safety: safetyResult,
    context,
    selected: opportunityPacket.selected,
  });
  return {
    moveFactPacket,
    positionDeltaPacket,
    featurePacket,
    planPacket,
    opportunityPacket,
    coachExplanation,
    safetyResult,
    coachQuality,
    brainAnalysis: context.brainAnalysis ?? null,  // v2.7.39.3: pass through for migration
  };
}

export function isDebugLeakText(text: string): boolean {
  const lower = String(text).toLowerCase();
  return DEBUG_BANNED.some((token) => lower.includes(token));
}

export function normalizeFenForCoachPipeline(fen: string): string {
  return normalizeFen4(fen);
}
