import type { BlundrBoardPieceSetId } from "./boardThemeTypes";

const PIECE_SYMBOLS: Record<string, string> = {
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  wk: "♔",
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
  bk: "♚",
};

const LETTER_PIECES: Record<string, string> = {
  wp: "P",
  wn: "N",
  wb: "B",
  wr: "R",
  wq: "Q",
  wk: "K",
  bp: "p",
  bn: "n",
  bb: "b",
  br: "r",
  bq: "q",
  bk: "k",
};

const NEO_PIECES: Record<string, string> = {
  ...PIECE_SYMBOLS,
};

export function renderBoardPieceGlyph(color: "w" | "b", type: string, pieceSetId: BlundrBoardPieceSetId): string {
  const key = `${color}${type}`;
  if (pieceSetId === "letters") return LETTER_PIECES[key] ?? type;
  if (pieceSetId === "neo") return NEO_PIECES[key] ?? PIECE_SYMBOLS[key] ?? type;
  return PIECE_SYMBOLS[key] ?? type;
}

export function resolveBoardPieceTypographyClasses(pieceSetId: BlundrBoardPieceSetId): string {
  return pieceSetId === "letters" ? "font-black font-sans" : "font-serif";
}

export function resolveBoardPieceToneClasses(color: "w" | "b"): string {
  return color === "w"
    ? "text-stone-50 [text-shadow:0_2px_3px_rgba(0,0,0,.55)]"
    : "text-stone-950 [text-shadow:0_1px_1px_rgba(255,255,255,.25)]";
}

export function resolveBoardPieceSizeStyle(pieceSetId: BlundrBoardPieceSetId): string {
  return pieceSetId === "letters" ? "min(8.5vw,36px)" : "min(10vw,42px)";
}
