import type { Color, ParsedBoard, Square } from "@/lib/blundr/geometry/boardTypes";
import { attackersTo, getAttackedSquares, getPieceAttacks, squareAttackedBy } from "@/lib/blundr/geometry/attackMap";
import { parseFenBoard } from "@/lib/blundr/geometry/fenBoardParser";
import { normalizeText } from "../miniGameUtils";

export function parseMiniGameBoard(fen: string): ParsedBoard {
  return parseFenBoard(normalizeText(fen));
}

export function getMiniGameAttacks(fen: string, color: Color): Square[] {
  return getAttackedSquares(parseMiniGameBoard(fen), color);
}

export function pieceAttacksSquare(fen: string, square: Square, target: Square): boolean {
  return getPieceAttacks(parseMiniGameBoard(fen), square).includes(target);
}

export function squareIsAttackedBy(fen: string, square: Square, color: Color): boolean {
  return squareAttackedBy(parseMiniGameBoard(fen), square, color);
}

export function attackersToSquare(fen: string, square: Square, color: Color) {
  return attackersTo(parseMiniGameBoard(fen), square, color);
}
