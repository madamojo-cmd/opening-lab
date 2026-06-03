import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
import type { BoardTruth, CoachEvidenceClaim, OpeningContext } from "../types";

function claim(
  frame: CurrentInstructionFrame,
  idSuffix: string,
  type: CoachEvidenceClaim["type"],
  strength: CoachEvidenceClaim["strength"],
  summary: string,
  machineFacts: Record<string, unknown>,
): CoachEvidenceClaim {
  return {
    id: `${frame.frameKey}:${idSuffix}`,
    frameKey: frame.frameKey,
    type,
    strength,
    targetUci: frame.target?.uci ?? "",
    pieceType: frame.target?.pieceType,
    textSafeSummary: summary,
    machineFacts,
    provenance: [
      {
        source: "strategic_feature",
        confidence: strength === "verified" ? "high" : strength === "probable" ? "medium" : "low",
      },
    ],
  };
}

function isCenterSquare(square: string): boolean {
  return ["d4", "e4", "d5", "e5", "c4", "f4", "c5", "f5"].includes(square.toLowerCase());
}

export function buildStrategicFeatureClaims(input: {
  frame: CurrentInstructionFrame;
  boardTruth: BoardTruth;
  openingContext?: OpeningContext;
}): CoachEvidenceClaim[] {
  const { frame, boardTruth, openingContext } = input;
  const target = frame.target;
  if (!target) return [];

  if (boardTruth.targetLegal === false || boardTruth.targetLegal === "unknown") {
    return [
      claim(frame, "blocked_target", "safe_fallback", "blocked", "Strategic features blocked by unverified target legality.", {
        targetLegal: boardTruth.targetLegal,
      }),
    ];
  }

  const piece = String(target.pieceType).toLowerCase();
  const claims: CoachEvidenceClaim[] = [];

  if (isCenterSquare(target.to)) {
    claims.push(claim(frame, "strategic_center_control", "center_control", "verified", "Move contributes to center control.", { square: target.to }));
    claims.push(claim(frame, "pressure_on_center", "pressure", "probable", "Move increases pressure on central lanes.", { centerPressure: true }));
  }

  if (target.flags.isCastle || boardTruth.isCastle) {
    claims.push(claim(frame, "king_safety", "king_safety", "verified", "Castling supports king safety.", { castled: true }));
    claims.push(claim(frame, "rook_activity_after_castle", "piece_activity", "probable", "Castling may improve rook activity.", { rookActivity: true }));
  }

  if (piece.startsWith("b")) {
    claims.push(claim(frame, "bishop_diagonal", "piece_activity", "probable", "Bishop move may increase long-diagonal activity.", { diagonalControl: true }));
    if (["f7", "f2"].includes(target.to) || target.to === "c4" || target.to === "c5") {
      claims.push(claim(frame, "pressure_f7_f2", "pressure", "probable", "Bishop line can project pressure near f7/f2 complexes.", { pressureOnF7F2: true }));
    }
  }

  if (piece.startsWith("n")) {
    claims.push(claim(frame, "knight_outpost_candidate", "strategic_feature", "probable", "Knight may be improving toward an outpost candidate square.", { outpostCandidate: true }));
  }

  if (piece.startsWith("r")) {
    claims.push(claim(frame, "rook_activity", "piece_activity", "probable", "Rook move may improve file activity.", { fileActivity: true }));
  }

  if (piece.startsWith("q")) {
    claims.push(claim(frame, "queen_activity", "piece_activity", "probable", "Queen move changes activity profile.", { queenActivity: true }));
  }

  if (piece.startsWith("p")) {
    claims.push(claim(frame, "space_gain", "piece_activity", "probable", "Pawn advance can gain space.", { spaceGain: true }));
    if (["c", "d", "e", "f"].includes(target.from[0]) && ["c", "d", "e", "f"].includes(target.to[0])) {
      claims.push(claim(frame, "pawn_break", "pawn_break", "probable", "Central pawn move may support pawn break plans.", { pawnBreak: true }));
    }
  }

  if ((openingContext?.themeTags ?? []).includes("prophylaxis")) {
    claims.push(claim(frame, "prophylaxis_theme", "strategic_feature", "probable", "Opening context suggests prophylactic intent.", { prophylaxis: true }));
  }

  if ((openingContext?.themeTags ?? []).includes("initiative")) {
    claims.push(claim(frame, "initiative_theme", "strategic_feature", "probable", "Opening context supports initiative framing.", { initiative: true }));
  }

  if (!claims.length) {
    claims.push(claim(frame, "quiet_improvement", "strategic_feature", "probable", "Move appears to be a quiet improving strategic action.", { quietImprovement: true }));
  }

  return claims;
}
