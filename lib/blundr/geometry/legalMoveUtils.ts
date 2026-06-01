import { Chess } from "chess.js";

export interface LegalMoveSummary {
  san: string;
  uci: string;
  from: string;
  to: string;
  piece: string;
  isCapture: boolean;
  isCheck: boolean;
  promotion?: string;
}

export function normalizeMoveIdentifier(move: string): string {
  return move.trim().replace(/0/g, "O");
}

export function getLegalMoves(fen: string): LegalMoveSummary[] {
  try {
    const chess = new Chess(fen);
    return (chess.moves({ verbose: true }) as any[]).map((move) => ({
      san: move.san,
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      from: move.from,
      to: move.to,
      piece: move.piece,
      isCapture: Boolean(move.captured),
      isCheck: String(move.san).includes("+") || String(move.san).includes("#"),
      promotion: move.promotion,
    }));
  } catch {
    return [];
  }
}

export function isLegalMove(fen: string, uci: string): boolean {
  return getLegalMoves(fen).some((move) => move.uci === uci);
}

export function applyMove(fen: string, uci: string): string | null {
  try {
    const chess = new Chess(fen);
    const moveInput: { from: string; to: string; promotion?: string } = {
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
    };
    if (uci.length > 4) {
      moveInput.promotion = uci.slice(4, 5);
    }
    const move = chess.move(moveInput);
    return move ? chess.fen() : null;
  } catch {
    return null;
  }
}

export function sanToUci(fen: string, san: string): string | null {
  try {
    const chess = new Chess(fen);
    const move = chess.move(normalizeMoveIdentifier(san) as any);
    return move ? `${move.from}${move.to}${move.promotion ?? ""}` : null;
  } catch {
    return null;
  }
}

export function isCastlingMove(move: string): boolean {
  const normalized = normalizeMoveIdentifier(move);
  return ["O-O", "O-O-O", "e1g1", "e8g8", "e1c1", "e8c8"].includes(normalized);
}
