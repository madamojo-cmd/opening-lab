import { Chess } from "chess.js";
import type { PositionFeatureSet } from "./liveCoachTypes";

function filesFromBoard(board: ReturnType<Chess["board"]>) {
  const files = new Map<string, { w: number; b: number }>();
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const sq = board[rank][file];
      if (!sq || sq.type !== "p") continue;
      const letter = String.fromCharCode(97 + file);
      const stat = files.get(letter) ?? { w: 0, b: 0 };
      stat[sq.color as "w" | "b"] += 1;
      files.set(letter, stat);
    }
  }
  return files;
}

export function extractPositionFeatures(fen: string): PositionFeatureSet {
  try {
    const chess = new Chess(fen);
    const board = chess.board();
    const centerSquares = ["d4", "e4", "d5", "e5"];
    const centerOccupancy = centerSquares.map((sq) => chess.get(sq as any)).filter(Boolean).length;

    const centerState: PositionFeatureSet["centerState"] = centerOccupancy >= 3 ? "closed" : centerOccupancy === 2 ? "tense" : centerOccupancy <= 1 ? "open" : "fluid";
    const kingSafety: PositionFeatureSet["kingSafety"] = chess.inCheck() ? "in_check" : (fen.includes(" K") || fen.includes(" k")) ? "watch_center" : "safe";

    const pieces = board.flat().filter(Boolean) as Array<{ type: string; color: "w" | "b"; square: string }>;
    const undevelopedMinors = pieces.filter((piece) => (piece.type === "n" || piece.type === "b") && ((piece.color === "w" && /[bgh][12]/.test(piece.square)) || (piece.color === "b" && /[bgh][78]/.test(piece.square))));
    const developmentStatus: PositionFeatureSet["developmentStatus"] = undevelopedMinors.length >= 5 ? "behind" : undevelopedMinors.length <= 2 ? "ahead" : "normal";

    const leastActivePieces = undevelopedMinors.map((piece) => `${piece.color}${piece.type}@${piece.square}`).slice(0, 3);
    const fileStats = filesFromBoard(board);
    const openFiles = Array.from(fileStats.entries()).filter(([, v]) => v.w === 0 && v.b === 0).map(([f]) => f);
    const semiOpenFiles = Array.from(fileStats.entries()).filter(([, v]) => (v.w === 0) !== (v.b === 0)).map(([f]) => f);

    const plausiblePawnBreaks = ["d4", "e4", "d5", "e5"].filter((sq) => !chess.get(sq as any));

    const castling = fen.split(" ")[2] ?? "-";
    const castlingStatus = {
      white: castling.includes("K") || castling.includes("Q") ? "uncastled" : "castled",
      black: castling.includes("k") || castling.includes("q") ? "uncastled" : "castled",
    } as PositionFeatureSet["castlingStatus"];

    return {
      centerState,
      kingSafety,
      developmentStatus,
      leastActivePieces,
      openFiles,
      semiOpenFiles,
      plausiblePawnBreaks,
      castlingStatus,
      materialTension: "medium",
      pieceCoordinationTags: [centerState === "tense" ? "center_tension" : "piece_improvement"],
      tacticalAlert: chess.inCheck() ? "confirmed_simple_check" : "none",
    };
  } catch {
    return {
      centerState: "unknown",
      kingSafety: "unknown",
      developmentStatus: "unknown",
      leastActivePieces: [],
      openFiles: [],
      semiOpenFiles: [],
      plausiblePawnBreaks: [],
      castlingStatus: { white: "unknown", black: "unknown" },
      materialTension: "unknown",
      pieceCoordinationTags: [],
      tacticalAlert: "unknown",
    };
  }
}
