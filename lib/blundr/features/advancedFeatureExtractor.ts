import { parseFenBoard } from "../geometry/fenBoardParser";
import type { AdvancedFeaturePacket, BlockedFeatureClaim, FeatureClaim } from "./advancedFeatureTypes";
import { canMention, riskForConfidence } from "./featureConfidence";
import { extractImbalances } from "./imbalanceExtractor";
import { extractKingSafety } from "./kingSafetyExtractor";
import { extractPawnStructure } from "./pawnStructureExtractor";
import { extractPieceQuality } from "./pieceQualityExtractor";
import { extractTacticalMotifs } from "./tacticalMotifExtractor";

export function extractAdvancedFeatures(fen: string): AdvancedFeaturePacket {
  const started = Date.now();
  const board = parseFenBoard(fen);
  const pawnStarted = Date.now();
  const pawnStructure = extractPawnStructure(board);
  const kingStarted = Date.now();
  const kingSafety = extractKingSafety(board);
  const pieceStarted = Date.now();
  const pieceQuality = extractPieceQuality(board);
  const imbalanceStarted = Date.now();
  const imbalances = extractImbalances({ board, pawnStructure, kingSafety, pieceQuality });
  const tacticalStarted = Date.now();
  const tacticalMotifs = extractTacticalMotifs(board);

  const claims: FeatureClaim[] = [];
  const blocked: BlockedFeatureClaim[] = [...tacticalMotifs.blockedMotifs];
  for (const square of pawnStructure.isolatedPawns) claims.push(claim("isolated_pawn", "high", { square, evidence: [`pawn_on_${square}_has_no_adjacent_friendly_pawn`] }));
  for (const file of pawnStructure.doubledPawnFiles) claims.push(claim("doubled_pawns", "high", { file, evidence: [`multiple_pawns_on_${file}_file`] }));
  for (const square of pawnStructure.passedPawns) claims.push(claim("passed_pawn", "high", { square, evidence: [`no_opposing_pawns_ahead_of_${square}`] }));
  for (const lever of pawnStructure.pawnLevers) claims.push(claim("pawn_lever_support", "high", { color: lever.color, square: lever.target, moveUci: lever.move, evidence: [`supports_${lever.supportsBreak ?? lever.target}`], canDominate: true }));
  if (pawnStructure.centerType === "contested") claims.push(claim("center_tension", "high", { squares: ["d4", "e4", "d5", "e5"], evidence: ["central_pawns_or_controls_are_contested"], canDominate: true }));
  for (const color of kingSafety.urgentKingSafety) claims.push(claim("king_safety_urgent", "high", { color, evidence: ["central_or_exposed_king_with_opening_pressure"], canDominate: true }));
  for (const piece of pieceQuality.undevelopedPieces) claims.push(claim("undeveloped_piece", "high", { color: piece.color, square: piece.square, piece: piece.piece, evidence: [`${piece.piece}_on_start_square_${piece.square}`] }));
  for (const bishop of pieceQuality.activeBishops) claims.push(claim("active_bishop", "high", { color: bishop.color, square: bishop.square, squares: bishop.targets, piece: "bishop", evidence: [`bishop_${bishop.square}_has_active_diagonal`] }));
  for (const rook of pieceQuality.rooksOnOpenFiles) claims.push(claim("rook_on_open_file", "high", { color: rook.color, square: rook.square, file: rook.file, piece: "rook", evidence: [`no_pawns_on_${rook.file}_file`] }));
  for (const rook of pieceQuality.rooksOnSemiOpenFiles) claims.push(claim("rook_on_semi_open_file", "high", { color: rook.color, square: rook.square, file: rook.file, piece: "rook", evidence: [`no_friendly_pawn_on_${rook.file}_file`] }));
  for (const outpost of pieceQuality.knightOutposts) claims.push(claim("knight_outpost", outpost.protectedByPawn ? "high" : "medium", { color: outpost.color, square: outpost.square, piece: "knight", evidence: ["central_knight_square_with_support"] }));
  if (imbalances.developmentLead !== "none") claims.push(claim("development_lead", "medium", { color: imbalances.developmentLead, evidence: ["fewer_undeveloped_minor_pieces"] }));

  return {
    fen,
    normalizedFen: board.normalizedFen,
    sideToMove: board.sideToMove,
    pawnStructure,
    kingSafety,
    pieceQuality,
    imbalances,
    tacticalMotifs,
    featureClaims: claims,
    blockedFeatureClaims: blocked,
    timings: {
      geometryMs: pawnStarted - started,
      pawnStructureMs: kingStarted - pawnStarted,
      kingSafetyMs: pieceStarted - kingStarted,
      pieceQualityMs: imbalanceStarted - pieceStarted,
      imbalanceMs: tacticalStarted - imbalanceStarted,
      tacticalMotifMs: Date.now() - tacticalStarted,
      totalMs: Date.now() - started,
    },
    confidence: board.malformed ? "low" : "high",
    generatedAt: Date.now(),
  };
}

function claim(
  type: string,
  confidence: FeatureClaim["confidence"],
  extra: Partial<FeatureClaim> & { evidence: string[] },
): FeatureClaim {
  const risk = riskForConfidence(confidence, type.includes("tactic"));
  return {
    id: `${type}:${extra.square ?? extra.file ?? extra.moveUci ?? extra.color ?? "global"}`,
    type,
    confidence,
    risk,
    evidence: extra.evidence,
    canMention: canMention(confidence, type.includes("tactic")),
    canDominate: Boolean(extra.canDominate),
    userFacingSafe: risk === "safe_to_mention",
    ...extra,
  };
}
