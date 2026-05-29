import { analyzeBoard } from "./boardAnalyzer";
import { centerSquares, extendedCenterSquares, fileOf, isBackRankPieceStart, kingZoneSquares, rankOf } from "./squareUtils";
import type { BoardAnalysis, BoardPiece } from "./teachingCueTypes";
import type { FeatureGraphSummary } from "./trainingContextTypes";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const PIECE_LABEL: Record<BoardPiece["type"], string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

export type PieceFeatureNode = {
  id: string;
  color: "w" | "b";
  type: BoardPiece["type"];
  square: string;
  attackedSquares: string[];
  defendedSquares: string[];
  attackers: string[];
  defenders: string[];
  isLoose: boolean;
  isHanging: boolean;
  mobilityCount: number;
  centralInfluence: number;
  kingZoneInfluence: number;
  isDeveloped: boolean;
  activityScore: number;
  roleSummary: string;
};

export type SquareFeatureNode = {
  square: string;
  occupiedBy?: string;
  attackersByWhite: string[];
  attackersByBlack: string[];
  defendersByWhite: string[];
  defendersByBlack: string[];
  isCenter: boolean;
  isExtendedCenter: boolean;
  isWeakSquareCandidate: boolean;
  isOutpostCandidate: boolean;
  kingZoneFor?: "w" | "b";
};

export type FileFeature = {
  file: string;
  isOpen: boolean;
  isHalfOpenForWhite: boolean;
  isHalfOpenForBlack: boolean;
  rookOrQueenPotential: boolean;
  blockers: string[];
};

export type DiagonalFeature = {
  id: string;
  squares: string[];
  bishopPotential: boolean;
  blockers: string[];
  pressureTargets: string[];
};

export type KingZoneFeature = {
  color: "w" | "b";
  kingSquare?: string;
  zoneSquares: string[];
  attackedByOpponent: string[];
  defendedByOwnSide: string[];
  exposureScore: number;
};

export type ChessFeatureGraph = {
  fen: string;
  sideToMove: "w" | "b";
  pieces: PieceFeatureNode[];
  squares: Record<string, SquareFeatureNode>;
  files: FileFeature[];
  diagonals: DiagonalFeature[];
  kingZones: Record<"w" | "b", KingZoneFeature>;
  phase: FeatureGraphSummary["phase"];
  summary: FeatureGraphSummary;
  raw: BoardAnalysis;
};

function other(color: "w" | "b"): "w" | "b" {
  return color === "w" ? "b" : "w";
}

function pieceAt(board: BoardAnalysis, square: string): BoardPiece | undefined {
  return board.pieces.find((piece) => piece.square === square);
}

function attackersForColor(board: BoardAnalysis, square: string, color: "w" | "b"): string[] {
  return (board.attacksBySquare[square] ?? []).filter((attacker) => pieceAt(board, attacker)?.color === color);
}

function attackedSquaresByPiece(board: BoardAnalysis, square: string): string[] {
  return Object.entries(board.attacksBySquare)
    .filter(([, attackers]) => attackers.includes(square))
    .map(([target]) => target);
}

function defendedSquaresByPiece(board: BoardAnalysis, piece: BoardPiece): string[] {
  return attackedSquaresByPiece(board, piece.square).filter((target) => pieceAt(board, target)?.color === piece.color);
}

function classifyPhase(board: BoardAnalysis): FeatureGraphSummary["phase"] {
  const material = board.material.w + board.material.b;
  const developedPieces = board.pieces.filter((piece) => piece.type !== "p" && piece.type !== "k" && !isBackRankPieceStart(piece.square, piece.type, piece.color)).length;
  const queens = board.pieces.filter((piece) => piece.type === "q").length;
  if (material <= 28 || (queens === 0 && material <= 38)) return "endgame";
  if (developedPieces < 6) return "opening";
  if (material > 28) return "middlegame";
  return "unclear";
}

function roleSummary(piece: BoardPiece, centralInfluence: number, kingZoneInfluence: number, isLoose: boolean): string {
  if (isLoose) return `${PIECE_LABEL[piece.type]} on ${piece.square} is loose`;
  if (kingZoneInfluence > 0) return `${PIECE_LABEL[piece.type]} influences the king zone`;
  if (centralInfluence > 0) return `${PIECE_LABEL[piece.type]} fights for the center`;
  return `${PIECE_LABEL[piece.type]} on ${piece.square}`;
}

function buildDiagonal(start: string, df: number, dr: number): string[] {
  const out: string[] = [];
  const fileIndex = FILES.indexOf(fileOf(start) as (typeof FILES)[number]);
  const rank = rankOf(start);
  for (let step = 0; step < 8; step += 1) {
    const f = fileIndex + df * step;
    const r = rank + dr * step;
    if (f < 0 || f > 7 || r < 1 || r > 8) break;
    out.push(`${FILES[f]}${r}`);
  }
  return out;
}

function buildDiagonals(board: BoardAnalysis): DiagonalFeature[] {
  const starts = [
    ...FILES.map((file) => `${file}1`),
    ...FILES.slice(1).map((file) => `${file}8`),
    ...FILES.map((file) => `${file}8`),
    ...FILES.slice(1).map((file) => `${file}1`),
  ];
  const seen = new Set<string>();
  const diagonals: DiagonalFeature[] = [];
  for (const start of starts) {
    for (const [df, dr] of [[1, 1], [1, -1]] as const) {
      const squares = buildDiagonal(start, df, dr);
      if (squares.length < 3) continue;
      const id = squares.join("-");
      if (seen.has(id)) continue;
      seen.add(id);
      const blockers = squares.filter((square) => Boolean(pieceAt(board, square)));
      const pressureTargets = squares.filter((square) => {
        const piece = pieceAt(board, square);
        return Boolean(piece && piece.type !== "p");
      });
      diagonals.push({
        id,
        squares,
        bishopPotential: blockers.some((square) => {
          const piece = pieceAt(board, square);
          return piece?.type === "b" || piece?.type === "q";
        }),
        blockers,
        pressureTargets,
      });
    }
  }
  return diagonals.slice(0, 30);
}

export function buildChessFeatureGraph(fen: string): ChessFeatureGraph {
  const raw = analyzeBoard(fen);
  const center = centerSquares();
  const extended = extendedCenterSquares();
  const phase = classifyPhase(raw);
  const kingZones: Record<"w" | "b", KingZoneFeature> = { w: { color: "w", zoneSquares: [], attackedByOpponent: [], defendedByOwnSide: [], exposureScore: 0 }, b: { color: "b", zoneSquares: [], attackedByOpponent: [], defendedByOwnSide: [], exposureScore: 0 } };

  for (const color of ["w", "b"] as const) {
    const kingSquare = raw.kingSquares[color];
    const zoneSquares = kingSquare ? kingZoneSquares(kingSquare) : [];
    const attackedByOpponent = zoneSquares.flatMap((square) => attackersForColor(raw, square, other(color)));
    const defendedByOwnSide = zoneSquares.flatMap((square) => attackersForColor(raw, square, color));
    kingZones[color] = {
      color,
      kingSquare,
      zoneSquares,
      attackedByOpponent: [...new Set(attackedByOpponent)],
      defendedByOwnSide: [...new Set(defendedByOwnSide)],
      exposureScore: Math.max(0, attackedByOpponent.length - defendedByOwnSide.length),
    };
  }

  const pieces: PieceFeatureNode[] = raw.pieces.map((piece) => {
    const attackedSquares = attackedSquaresByPiece(raw, piece.square);
    const defenders = attackersForColor(raw, piece.square, piece.color);
    const attackers = attackersForColor(raw, piece.square, other(piece.color));
    const centralInfluence = attackedSquares.filter((square) => center.includes(square) || extended.includes(square)).length;
    const kingZoneInfluence = attackedSquares.filter((square) => kingZones[other(piece.color)].zoneSquares.includes(square)).length;
    const isLoose = raw.loosePieces.includes(piece.square);
    const isHanging = raw.hangingPieces.includes(piece.square);
    const isDeveloped = piece.type === "p" || piece.type === "k" ? true : !isBackRankPieceStart(piece.square, piece.type, piece.color);
    const mobilityCount = raw.pieceMobility[piece.square] ?? attackedSquares.length;
    const activityScore = mobilityCount * 0.08 + centralInfluence * 0.18 + kingZoneInfluence * 0.22 + (isDeveloped ? 0.2 : 0);
    return {
      id: `${piece.color}${piece.type}@${piece.square}`,
      color: piece.color,
      type: piece.type,
      square: piece.square,
      attackedSquares,
      defendedSquares: defendedSquaresByPiece(raw, piece),
      attackers,
      defenders,
      isLoose,
      isHanging,
      mobilityCount,
      centralInfluence,
      kingZoneInfluence,
      isDeveloped,
      activityScore,
      roleSummary: roleSummary(piece, centralInfluence, kingZoneInfluence, isLoose || isHanging),
    };
  });

  const squares: Record<string, SquareFeatureNode> = {};
  for (const file of FILES) {
    for (let rank = 1; rank <= 8; rank += 1) {
      const square = `${file}${rank}`;
      const occupant = pieceAt(raw, square);
      const attackersByWhite = attackersForColor(raw, square, "w");
      const attackersByBlack = attackersForColor(raw, square, "b");
      const weakForWhite = attackersByWhite.length > 0 && attackersByBlack.length === 0 && rank >= 4;
      const weakForBlack = attackersByBlack.length > 0 && attackersByWhite.length === 0 && rank <= 5;
      squares[square] = {
        square,
        occupiedBy: occupant ? `${occupant.color}${occupant.type}@${occupant.square}` : undefined,
        attackersByWhite,
        attackersByBlack,
        defendersByWhite: occupant?.color === "w" ? attackersByWhite : [],
        defendersByBlack: occupant?.color === "b" ? attackersByBlack : [],
        isCenter: center.includes(square),
        isExtendedCenter: extended.includes(square),
        isWeakSquareCandidate: weakForWhite || weakForBlack,
        isOutpostCandidate: (weakForWhite || weakForBlack) && ["c", "d", "e", "f"].includes(file) && rank >= 3 && rank <= 6,
        kingZoneFor: kingZones.w.zoneSquares.includes(square) ? "w" : kingZones.b.zoneSquares.includes(square) ? "b" : undefined,
      };
    }
  }

  const files: FileFeature[] = FILES.map((file) => {
    const blockers = raw.pieces.filter((piece) => fileOf(piece.square) === file).map((piece) => piece.square);
    return {
      file,
      isOpen: raw.openFiles.includes(file),
      isHalfOpenForWhite: raw.halfOpenFiles.w.includes(file),
      isHalfOpenForBlack: raw.halfOpenFiles.b.includes(file),
      rookOrQueenPotential: raw.openFiles.includes(file) || raw.halfOpenFiles.w.includes(file) || raw.halfOpenFiles.b.includes(file),
      blockers,
    };
  });

  const centerTensionSquares = center.filter((square) => {
    const node = squares[square];
    return node.attackersByWhite.length > 0 && node.attackersByBlack.length > 0;
  });

  const summary: FeatureGraphSummary = {
    phase,
    loosePieces: raw.loosePieces,
    hangingPieces: raw.hangingPieces,
    openFiles: raw.openFiles,
    halfOpenFilesWhite: raw.halfOpenFiles.w,
    halfOpenFilesBlack: raw.halfOpenFiles.b,
    centerTensionSquares,
    exposedKings: (["w", "b"] as const).filter((color) => kingZones[color].exposureScore >= 2),
    strongestContext: raw.hangingPieces[0] ? `loose_piece:${raw.hangingPieces[0]}` : centerTensionSquares[0] ? `center:${centerTensionSquares.join(",")}` : raw.openFiles[0] ? `open_file:${raw.openFiles[0]}` : undefined,
  };

  return {
    fen,
    sideToMove: raw.sideToMove,
    pieces,
    squares,
    files,
    diagonals: buildDiagonals(raw),
    kingZones,
    phase,
    summary,
    raw,
  };
}

export function pieceName(type?: string): string {
  return type && type in PIECE_LABEL ? PIECE_LABEL[type as BoardPiece["type"]] : "piece";
}

