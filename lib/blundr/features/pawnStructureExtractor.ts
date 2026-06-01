import type { Color, ParsedBoard, Square } from "../geometry/boardTypes";
import { centerSquares, fileOf, forwardDirection } from "../geometry/squareUtils";
import { opposingPawnSquaresAhead } from "../geometry/pawnGeometry";
import type { PawnStructureFeatures } from "./advancedFeatureTypes";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function pawns(board: ParsedBoard, color?: Color): Array<{ color: Color; square: Square }> {
  return board.pieces.filter((piece) => piece.type === "pawn" && (!color || piece.color === color)).map((piece) => ({ color: piece.color, square: piece.square }));
}

function pawnFiles(board: ParsedBoard, color: Color): Record<string, Square[]> {
  const files: Record<string, Square[]> = {};
  for (const pawn of pawns(board, color)) {
    const file = fileOf(pawn.square);
    files[file] = [...(files[file] ?? []), pawn.square];
  }
  return files;
}

function islandGroups(files: string[]): string[][] {
  const sorted = files.slice().sort();
  const groups: string[][] = [];
  for (const file of sorted) {
    const last = groups[groups.length - 1];
    if (!last || FILES.indexOf(file) !== FILES.indexOf(last[last.length - 1]) + 1) groups.push([file]);
    else last.push(file);
  }
  return groups;
}

export function extractPawnStructure(board: ParsedBoard): PawnStructureFeatures {
  const isolatedPawns: Square[] = [];
  const doubledPawnFiles: string[] = [];
  const passedPawns: Square[] = [];
  const candidatePassedPawns: Square[] = [];
  const weakSquares: Square[] = [];
  const pawnChains: PawnStructureFeatures["pawnChains"] = [];
  const pawnLevers: PawnStructureFeatures["pawnLevers"] = [];

  for (const color of ["white", "black"] as const) {
    const files = pawnFiles(board, color);
    for (const [file, squares] of Object.entries(files)) {
      if (squares.length >= 2) doubledPawnFiles.push(file);
      const idx = FILES.indexOf(file);
      const adjacent = [FILES[idx - 1], FILES[idx + 1]].filter(Boolean);
      if (!adjacent.some((adj) => (files[adj] ?? []).length > 0)) isolatedPawns.push(...squares);
    }

    for (const pawn of pawns(board, color)) {
      const opposingColor = color === "white" ? "black" : "white";
      const blockers = opposingPawnSquaresAhead(pawn.square, color).filter((sq) => board.pieceBySquare[sq]?.type === "pawn" && board.pieceBySquare[sq]?.color === opposingColor);
      if (!blockers.length) passedPawns.push(pawn.square);
      const rank = Number(pawn.square[1]);
      if ((color === "white" && rank >= 4) || (color === "black" && rank <= 5)) candidatePassedPawns.push(pawn.square);
    }
  }

  for (const pawn of pawns(board)) {
    const dir = forwardDirection(pawn.color);
    for (const df of [-1, 1]) {
      const support = `${String.fromCharCode(fileOf(pawn.square).charCodeAt(0) + df)}${Number(pawn.square[1]) - dir}`;
      if (board.pieceBySquare[support]?.type === "pawn" && board.pieceBySquare[support]?.color === pawn.color) {
        pawnChains.push({ color: pawn.color, base: support, head: pawn.square, squares: [support, pawn.square] });
      }
    }
  }

  if (board.pieceBySquare.c3?.type === "pawn" && board.pieceBySquare.c3.color === "white") pawnLevers.push({ color: "white", target: "d4", supportsBreak: "d4", move: "c2c3" });
  if (board.pieceBySquare.c6?.type === "pawn" && board.pieceBySquare.c6.color === "black") pawnLevers.push({ color: "black", target: "d5", supportsBreak: "...d5", move: "c7c6" });

  const occupiedCenter = centerSquares().filter((sq) => board.pieceBySquare[sq]?.type === "pawn");
  let centerType: PawnStructureFeatures["centerType"] = "unknown";
  if (!occupiedCenter.length) centerType = "open";
  else if (occupiedCenter.length >= 3) centerType = "fixed";
  else if (occupiedCenter.length === 2) centerType = "contested";
  else centerType = "semi_open";

  for (const sq of ["d4", "e4", "d5", "e5", "c4", "f4", "c5", "f5"]) {
    if (!board.pieceBySquare[sq]) weakSquares.push(sq);
  }

  const pawnIslands = {
    white: islandGroups(Object.keys(pawnFiles(board, "white"))),
    black: islandGroups(Object.keys(pawnFiles(board, "black"))),
  };

  const majorities: PawnStructureFeatures["majorities"] = [];
  for (const wing of ["queenside", "kingside"] as const) {
    const wingFiles = wing === "queenside" ? ["a", "b", "c"] : ["f", "g", "h"];
    const white = pawns(board, "white").filter((p) => wingFiles.includes(fileOf(p.square))).length;
    const black = pawns(board, "black").filter((p) => wingFiles.includes(fileOf(p.square))).length;
    if (white > black) majorities.push({ color: "white", wing, files: wingFiles });
    if (black > white) majorities.push({ color: "black", wing, files: wingFiles });
  }

  return {
    isolatedPawns,
    doubledPawnFiles,
    backwardPawns: [],
    passedPawns,
    candidatePassedPawns,
    pawnChains,
    pawnLevers,
    centerType,
    weakSquares,
    pawnIslands,
    majorities,
  };
}
