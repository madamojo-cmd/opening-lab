import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
import type { BoardTruth, CoachEvidenceClaim, OpeningContext } from "../types";

function normalizePiece(piece: string | undefined): string {
  const lower = String(piece ?? "").toLowerCase();
  if (lower === "p" || lower === "pawn") return "pawn";
  if (lower === "n" || lower === "knight") return "knight";
  if (lower === "b" || lower === "bishop") return "bishop";
  if (lower === "r" || lower === "rook") return "rook";
  if (lower === "q" || lower === "queen") return "queen";
  if (lower === "k" || lower === "king") return "king";
  return lower;
}

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
    pieceType: frame.target ? normalizePiece(frame.target.pieceType) : undefined,
    textSafeSummary: summary,
    machineFacts,
    provenance: [
      {
        source: "move_semantics",
        confidence: strength === "verified" ? "high" : strength === "probable" ? "medium" : "low",
      },
    ],
  };
}

function isCenterSquare(square: string | undefined): boolean {
  return ["d4", "e4", "d5", "e5", "c4", "f4", "c5", "f5"].includes(String(square ?? "").toLowerCase());
}

function isBackRankKnight(square: string, sideToMove: "white" | "black"): boolean {
  const rank = sideToMove === "white" ? "1" : "8";
  return square[1] === rank;
}

function isBackRankBishop(square: string, sideToMove: "white" | "black"): boolean {
  const rank = sideToMove === "white" ? "1" : "8";
  return square[1] === rank;
}

export function buildMoveSemanticsClaims(input: {
  frame: CurrentInstructionFrame;
  boardTruth: BoardTruth;
  openingContext?: OpeningContext;
}): CoachEvidenceClaim[] {
  const { frame, boardTruth, openingContext } = input;
  const target = frame.target;
  if (!target) return [];

  const piece = normalizePiece(target.pieceType);
  const claims: CoachEvidenceClaim[] = [];

  if (boardTruth.targetLegal === false || boardTruth.targetLegal === "unknown") {
    claims.push(
      claim(frame, "blocked_illegal_target", "safe_fallback", "blocked", "Target cannot be validated as legal.", {
        targetLegal: boardTruth.targetLegal,
      }),
    );
    return claims;
  }

  if (piece === "pawn") {
    claims.push(
      claim(frame, "pawn_push", "piece_activity", "verified", "Pawn advances according to target move semantics.", {
        moveFamily: "pawn_push",
      }),
    );
  }

  if (isCenterSquare(target.to)) {
    claims.push(
      claim(frame, "center_control", "center_control", "verified", "Move influences central squares.", {
        centerSquare: target.to,
      }),
    );
  }

  if (piece === "knight" && isBackRankKnight(target.from, frame.sideToMove)) {
    claims.push(
      claim(frame, "knight_development", "development", "verified", "Knight develops from back rank toward active square.", {
        piece: "knight",
      }),
    );
    claims.push(
      claim(frame, "knight_activity", "piece_activity", "probable", "Knight activity increases through development.", {
        to: target.to,
      }),
    );
  }

  if (piece === "bishop" && isBackRankBishop(target.from, frame.sideToMove)) {
    claims.push(
      claim(frame, "bishop_development", "development", "verified", "Bishop develops from back rank.", {
        piece: "bishop",
      }),
    );
    const df = Math.abs(target.from.charCodeAt(0) - target.to.charCodeAt(0));
    const dr = Math.abs(Number(target.from[1]) - Number(target.to[1]));
    if (df === dr && df > 0) {
      claims.push(
        claim(frame, "bishop_diagonal_pressure", "pressure", "probable", "Bishop move projects along a diagonal.", {
          diagonal: true,
        }),
      );
    }
  }

  if (piece === "rook" && (target.from[0] !== target.to[0] || target.from[1] !== target.to[1])) {
    claims.push(
      claim(frame, "rook_activation", "piece_activity", "probable", "Rook changes file/rank activity.", {
        fileShift: target.from[0] !== target.to[0],
      }),
    );
  }

  if (piece === "queen") {
    claims.push(
      claim(frame, "queen_development", "piece_activity", "probable", "Queen move changes activity profile.", {
        piece: "queen",
      }),
    );
  }

  if (target.flags.isCapture || boardTruth.isCapture) {
    claims.push(
      claim(frame, "capture", "capture", "verified", "Move captures material on destination square.", {
        capture: true,
      }),
    );
  }

  if (target.flags.isCheck || boardTruth.isCheck) {
    claims.push(
      claim(frame, "check", "check", "verified", "Move gives check to opposing king.", {
        check: true,
      }),
    );
  }

  if (target.flags.isCheckmate || boardTruth.isCheckmate) {
    claims.push(
      claim(frame, "checkmate", "checkmate", "verified", "Move results in checkmate.", {
        checkmate: true,
      }),
    );
  }

  if (target.flags.isCastle || boardTruth.isCastle) {
    claims.push(
      claim(frame, "castling", "castling", "verified", "Castling improves king safety and rook connection.", {
        castle: true,
      }),
    );
    claims.push(
      claim(frame, "king_safety_from_castle", "king_safety", "verified", "Castling directly addresses king safety.", {
        kingSafety: true,
      }),
    );
  }

  if (piece === "pawn" && ["c", "d", "e", "f"].includes(target.from[0]) && ["c", "d", "e", "f"].includes(target.to[0])) {
    claims.push(
      claim(frame, "pawn_break_or_center_push", "pawn_break", "probable", "Central pawn move may support a pawn break plan.", {
        openingTheme: openingContext?.themeTags ?? [],
      }),
    );
  }

  if (!claims.length) {
    claims.push(
      claim(frame, "quiet_improving_move", "piece_activity", "probable", "Move appears to improve piece placement without tactical forcing proof.", {
        quiet: true,
      }),
    );
  }

  return claims;
}
