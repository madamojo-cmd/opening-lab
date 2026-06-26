import { Chess, type Square } from "chess.js";
import {
  fileRankToSquare,
  isValidSquare,
  squareToFileRank,
} from "./projectiveTacticGeometry";
import {
  DEFAULT_PROJECTIVE_TACTIC_DURATION_MS,
  DEFAULT_PROJECTIVE_TACTIC_FADE_MS,
} from "./projectiveTacticLifecycle";
import {
  getProjectiveTacticLabel,
  isProjectiveTacticEnabledInE,
} from "./projectiveTacticRegistry";
import { filterProjectiveTacticVisualForMaterialGate } from "./projectiveTacticMaterialGate";
import type {
  ProjectiveTacticKind,
  ProjectiveTacticOwner,
  ProjectiveTacticTargetPiece,
  ProjectiveTacticVisual,
} from "./projectiveTacticTypes";

export type DetectProjectiveTacticsInput = {
  fen: string;
  lastMoveUci?: string;
  learnerColor: "w" | "b";
  movedColor: "w" | "b";
};

export type DetectProjectiveTacticsResult = {
  visuals: ProjectiveTacticVisual[];
};

type ChessPiece = {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: "w" | "b";
};

type Direction = readonly [number, number];

const KNIGHT_DELTAS: Direction[] = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

const BISHOP_DIRECTIONS: Direction[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const ROOK_DIRECTIONS: Direction[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const QUEEN_DIRECTIONS: Direction[] = [...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS];

const KING_DELTAS: Direction[] = QUEEN_DIRECTIONS;

const MEANINGFUL_TARGETS = new Set(["k", "q", "r", "b", "n"]);
const BACK_PIN_TARGETS = new Set(["k", "q"]);

function opponentColor(color: "w" | "b"): "w" | "b" {
  return color === "w" ? "b" : "w";
}

function ownerFor(input: DetectProjectiveTacticsInput): ProjectiveTacticOwner {
  return input.movedColor === input.learnerColor ? "learner" : "opponent";
}

function movedToSquare(lastMoveUci?: string): Square | null {
  const target = String(lastMoveUci ?? "").slice(2, 4);
  return isValidSquare(target) ? target : null;
}

function getPiece(game: Chess, square: Square): ChessPiece | null {
  return (game.get(square) as ChessPiece | null) ?? null;
}

function squareAtOffset(square: Square, fileDelta: number, rankDelta: number): Square | null {
  const source = squareToFileRank(square);
  if (!source) return null;
  return fileRankToSquare(source.file + fileDelta, source.rank + rankDelta);
}

function rayAttackTargets(game: Chess, source: Square, color: "w" | "b", directions: Direction[]): ProjectiveTacticTargetPiece[] {
  const sourceFileRank = squareToFileRank(source);
  if (!sourceFileRank) return [];
  const targets: ProjectiveTacticTargetPiece[] = [];
  for (const [fileStep, rankStep] of directions) {
    let file = sourceFileRank.file + fileStep;
    let rank = sourceFileRank.rank + rankStep;
    while (file >= 0 && file <= 7 && rank >= 0 && rank <= 7) {
      const square = fileRankToSquare(file, rank);
      if (!square) break;
      const piece = getPiece(game, square);
      if (piece) {
        if (piece.color !== color) {
          targets.push({ square, piece: piece.type, color: piece.color });
        }
        break;
      }
      file += fileStep;
      rank += rankStep;
    }
  }
  return targets;
}

function attackTargetsFrom(game: Chess, source: Square, piece: ChessPiece): ProjectiveTacticTargetPiece[] {
  const enemy = opponentColor(piece.color);
  if (piece.type === "n") {
    return KNIGHT_DELTAS.flatMap(([fileDelta, rankDelta]) => {
      const square = squareAtOffset(source, fileDelta, rankDelta);
      if (!square) return [];
      const target = getPiece(game, square);
      return target && target.color === enemy ? [{ square, piece: target.type, color: target.color }] : [];
    });
  }
  if (piece.type === "b") return rayAttackTargets(game, source, piece.color, BISHOP_DIRECTIONS);
  if (piece.type === "r") return rayAttackTargets(game, source, piece.color, ROOK_DIRECTIONS);
  if (piece.type === "q") return rayAttackTargets(game, source, piece.color, QUEEN_DIRECTIONS);
  if (piece.type === "k") {
    return KING_DELTAS.flatMap(([fileDelta, rankDelta]) => {
      const square = squareAtOffset(source, fileDelta, rankDelta);
      if (!square) return [];
      const target = getPiece(game, square);
      return target && target.color === enemy ? [{ square, piece: target.type, color: target.color }] : [];
    });
  }
  const pawnRankDelta = piece.color === "w" ? 1 : -1;
  return [-1, 1].flatMap((fileDelta) => {
    const square = squareAtOffset(source, fileDelta, pawnRankDelta);
    if (!square) return [];
    const target = getPiece(game, square);
    return target && target.color === enemy ? [{ square, piece: target.type, color: target.color }] : [];
  });
}

function meaningfulForkTargets(targets: ProjectiveTacticTargetPiece[]): ProjectiveTacticTargetPiece[] {
  const meaningful = targets.filter((target) => MEANINGFUL_TARGETS.has(target.piece));
  if (meaningful.length >= 2) return meaningful;
  const hasHighValueTarget = targets.some((target) => ["k", "q", "r"].includes(target.piece));
  if (hasHighValueTarget && targets.length >= 2) return targets;
  return [];
}

function buildVisual(input: {
  kind: ProjectiveTacticKind;
  source: Square;
  sourcePiece: ChessPiece;
  targets: ProjectiveTacticTargetPiece[];
  owner: ProjectiveTacticOwner;
  fen: string;
  lastMoveUci?: string;
  lineShape: "straight" | "knight_l";
  segments?: ProjectiveTacticVisual["lineSegments"];
}): ProjectiveTacticVisual | null {
  if (!isProjectiveTacticEnabledInE(input.kind)) return null;
  const lineSegments = input.segments ?? input.targets.map((target, index) => ({
    from: input.source,
    to: target.square,
    shape: input.lineShape,
    bendPreference: input.lineShape === "knight_l"
      ? (index % 2 === 0 ? "vertical_first" : "horizontal_first")
      : undefined,
  }));
  const visual: ProjectiveTacticVisual = {
    id: [
      "projective",
      input.kind,
      input.source,
      input.targets.map((target) => target.square).join("-"),
      input.lastMoveUci ?? "post-move",
    ].join(":"),
    kind: input.kind,
    label: getProjectiveTacticLabel(input.kind),
    owner: input.owner,
    sourceSquare: input.source,
    sourcePiece: input.sourcePiece.type,
    targetSquares: input.targets.map((target) => target.square),
    targetPieces: input.targets,
    lineSegments,
    tagSquare: input.source,
    createdByMoveUci: input.lastMoveUci,
    createdAfterFen: input.fen,
    durationMs: DEFAULT_PROJECTIVE_TACTIC_DURATION_MS,
    fadeMs: DEFAULT_PROJECTIVE_TACTIC_FADE_MS,
    revealRisk: "low",
    confidence: "high",
  };
  return filterProjectiveTacticVisualForMaterialGate({
    fen: input.fen,
    visual,
    movedColor: input.sourcePiece.color,
  }).visual;
}

function detectFork(input: {
  game: Chess;
  source: Square;
  sourcePiece: ChessPiece;
  owner: ProjectiveTacticOwner;
  fen: string;
  lastMoveUci?: string;
}): ProjectiveTacticVisual | null {
  const targets = meaningfulForkTargets(attackTargetsFrom(input.game, input.source, input.sourcePiece));
  if (targets.length < 2) return null;
  const isKnight = input.sourcePiece.type === "n";
  return buildVisual({
    kind: isKnight ? "knight_fork" : "fork",
    source: input.source,
    sourcePiece: input.sourcePiece,
    targets,
    owner: input.owner,
    fen: input.fen,
    lastMoveUci: input.lastMoveUci,
    lineShape: isKnight ? "knight_l" : "straight",
  });
}

function sliderDirections(piece: ChessPiece): Direction[] {
  if (piece.type === "b") return BISHOP_DIRECTIONS;
  if (piece.type === "r") return ROOK_DIRECTIONS;
  if (piece.type === "q") return QUEEN_DIRECTIONS;
  return [];
}

function detectPin(input: {
  game: Chess;
  source: Square;
  sourcePiece: ChessPiece;
  owner: ProjectiveTacticOwner;
  fen: string;
  lastMoveUci?: string;
}): ProjectiveTacticVisual | null {
  const directions = sliderDirections(input.sourcePiece);
  if (!directions.length) return null;
  const sourceFileRank = squareToFileRank(input.source);
  if (!sourceFileRank) return null;
  for (const [fileStep, rankStep] of directions) {
    let file = sourceFileRank.file + fileStep;
    let rank = sourceFileRank.rank + rankStep;
    let pinned: ProjectiveTacticTargetPiece | null = null;
    while (file >= 0 && file <= 7 && rank >= 0 && rank <= 7) {
      const square = fileRankToSquare(file, rank);
      if (!square) break;
      const piece = getPiece(input.game, square);
      if (piece) {
        if (piece.color === input.sourcePiece.color) break;
        if (!pinned) {
          pinned = { square, piece: piece.type, color: piece.color };
        } else if (piece.color !== input.sourcePiece.color && BACK_PIN_TARGETS.has(piece.type)) {
          const backTarget = { square, piece: piece.type, color: piece.color };
          return buildVisual({
            kind: "pin",
            source: input.source,
            sourcePiece: input.sourcePiece,
            targets: [pinned, backTarget],
            owner: input.owner,
            fen: input.fen,
            lastMoveUci: input.lastMoveUci,
            lineShape: "straight",
            segments: [
              { from: input.source, to: pinned.square, shape: "straight" },
              { from: pinned.square, to: backTarget.square, shape: "straight" },
            ],
          });
        } else {
          break;
        }
      }
      file += fileStep;
      rank += rankStep;
    }
  }
  return null;
}

export function detectProjectiveTactics(input: DetectProjectiveTacticsInput): DetectProjectiveTacticsResult {
  const source = movedToSquare(input.lastMoveUci);
  if (!source) return { visuals: [] };
  let game: Chess;
  try {
    game = new Chess(input.fen);
  } catch {
    return { visuals: [] };
  }
  const sourcePiece = getPiece(game, source);
  if (!sourcePiece || sourcePiece.color !== input.movedColor) return { visuals: [] };
  const owner = ownerFor(input);
  const base = {
    game,
    source,
    sourcePiece,
    owner,
    fen: input.fen,
    lastMoveUci: input.lastMoveUci,
  };
  const fork = detectFork(base);
  if (fork) return { visuals: [fork] };
  const pin = detectPin(base);
  if (pin) return { visuals: [pin] };
  return { visuals: [] };
}
