import { Chess, type Square } from "chess.js";
import type {
  ProjectiveTacticLineSegment,
  ProjectiveTacticTargetPiece,
  ProjectiveTacticVisual,
} from "./projectiveTacticTypes";

export type MaterialGateReason =
  | "material_win"
  | "forcing_check_material_win"
  | "not_profitable"
  | "target_protected_bad_trade"
  | "insufficient_material_gain"
  | "unknown";

export type MaterialGateDecision = {
  allowed: boolean;
  reason: MaterialGateReason;
  netGain?: number;
};

type ChessPiece = {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: "w" | "b";
};

type AttackerRef = {
  square: Square;
  piece: ChessPiece["type"];
  color: "w" | "b";
};

const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
} as const;

const MATERIAL_TARGET_TYPES = new Set(["n", "b", "r", "q"]);

function isPieceType(piece: string): piece is ChessPiece["type"] {
  return Object.prototype.hasOwnProperty.call(PIECE_VALUES, piece);
}

function opponentColor(color: "w" | "b"): "w" | "b" {
  return color === "w" ? "b" : "w";
}

function getPieceAt(chess: Chess, square: Square): ChessPiece | null {
  return (chess.get(square) as ChessPiece | null) ?? null;
}

export function getPieceValue(piece: string | { type?: string; piece?: string } | null | undefined): number {
  const type = typeof piece === "string" ? piece : piece?.type ?? piece?.piece ?? "";
  return isPieceType(type) ? PIECE_VALUES[type] : 0;
}

export function getAttackersToSquare(chess: Chess, square: Square, color: "w" | "b"): AttackerRef[] {
  return chess.attackers(square, color).flatMap((attackerSquare) => {
    const piece = getPieceAt(chess, attackerSquare as Square);
    return piece ? [{ square: attackerSquare as Square, piece: piece.type, color: piece.color }] : [];
  });
}

export function isSquareDefendedBy(chess: Chess, square: Square, color: "w" | "b"): boolean {
  return getAttackersToSquare(chess, square, color).length > 0;
}

function cloneAfterCapture(input: {
  fen: string;
  sourceSquare: Square;
  targetSquare: Square;
  movedColor: "w" | "b";
  sourcePiece: ChessPiece;
}): Chess | null {
  try {
    const next = new Chess(input.fen);
    next.remove(input.targetSquare);
    next.remove(input.sourceSquare);
    const placed = next.put({ type: input.sourcePiece.type, color: input.movedColor }, input.targetSquare);
    return placed ? next : null;
  } catch {
    return null;
  }
}

export function evaluateCaptureProfitability(input: {
  fen: string;
  sourceSquare: Square;
  target: ProjectiveTacticTargetPiece;
  movedColor: "w" | "b";
}): MaterialGateDecision {
  if (input.target.piece === "k") return { allowed: false, reason: "not_profitable" };
  let chess: Chess;
  try {
    chess = new Chess(input.fen);
  } catch {
    return { allowed: false, reason: "unknown" };
  }
  const sourcePiece = getPieceAt(chess, input.sourceSquare);
  const targetPiece = getPieceAt(chess, input.target.square);
  if (!sourcePiece || sourcePiece.color !== input.movedColor) return { allowed: false, reason: "unknown" };
  if (!targetPiece || targetPiece.color !== opponentColor(input.movedColor)) return { allowed: false, reason: "unknown" };
  if (targetPiece.type !== input.target.piece) return { allowed: false, reason: "unknown" };

  const capturedValue = getPieceValue(targetPiece.type);
  const attackerValue = getPieceValue(sourcePiece.type);
  if (capturedValue <= 0 || attackerValue <= 0) return { allowed: false, reason: "unknown" };

  const afterCapture = cloneAfterCapture({
    fen: input.fen,
    sourceSquare: input.sourceSquare,
    targetSquare: input.target.square,
    movedColor: input.movedColor,
    sourcePiece,
  });
  if (!afterCapture) return { allowed: false, reason: "unknown" };

  const defenders = getAttackersToSquare(afterCapture, input.target.square, targetPiece.color);
  const netGain = capturedValue - (defenders.length > 0 ? attackerValue : 0);
  if (netGain > 0) return { allowed: true, reason: "material_win", netGain };
  if (defenders.length > 0 && attackerValue > capturedValue) {
    return { allowed: false, reason: "target_protected_bad_trade", netGain };
  }
  return { allowed: false, reason: "insufficient_material_gain", netGain };
}

function rebuildForkLineSegments(visual: ProjectiveTacticVisual, targets: ProjectiveTacticTargetPiece[]): ProjectiveTacticLineSegment[] {
  const shape = visual.kind === "knight_fork" ? "knight_l" : "straight";
  return targets.map((target, index) => ({
    from: visual.sourceSquare,
    to: target.square,
    shape,
    bendPreference: shape === "knight_l"
      ? (index % 2 === 0 ? "vertical_first" : "horizontal_first")
      : undefined,
  }));
}

function visualWithTargets(visual: ProjectiveTacticVisual, targets: ProjectiveTacticTargetPiece[], lineSegments: ProjectiveTacticLineSegment[]): ProjectiveTacticVisual {
  return {
    ...visual,
    id: [
      "projective",
      visual.kind,
      visual.sourceSquare,
      targets.map((target) => target.square).join("-"),
      visual.createdByMoveUci ?? "post-move",
    ].join(":"),
    targetSquares: targets.map((target) => target.square),
    targetPieces: targets,
    lineSegments,
    confidence: "high",
  };
}

function bestNetGain(decisions: MaterialGateDecision[]): number | undefined {
  const gains = decisions
    .map((decision) => decision.netGain)
    .filter((gain): gain is number => typeof gain === "number")
    .sort((a, b) => b - a);
  return gains[0];
}

function evaluateFork(input: {
  fen: string;
  visual: ProjectiveTacticVisual;
  movedColor: "w" | "b";
}): { visual: ProjectiveTacticVisual | null; decision: MaterialGateDecision } {
  const kingTargets = input.visual.targetPieces.filter((target) => target.piece === "k");
  const materialTargets = input.visual.targetPieces.filter((target) => MATERIAL_TARGET_TYPES.has(target.piece));
  const profitable = materialTargets
    .map((target) => ({
      target,
      decision: evaluateCaptureProfitability({
        fen: input.fen,
        sourceSquare: input.visual.sourceSquare,
        target,
        movedColor: input.movedColor,
      }),
    }))
    .filter((entry) => entry.decision.allowed);

  if (kingTargets.length > 0) {
    if (profitable.length < 1) {
      return {
        visual: null,
        decision: { allowed: false, reason: "insufficient_material_gain", netGain: bestNetGain(profitable.map((entry) => entry.decision)) },
      };
    }
    const targets = [...kingTargets, ...profitable.map((entry) => entry.target)];
    return {
      visual: visualWithTargets(input.visual, targets, rebuildForkLineSegments(input.visual, targets)),
      decision: {
        allowed: true,
        reason: "forcing_check_material_win",
        netGain: bestNetGain(profitable.map((entry) => entry.decision)),
      },
    };
  }

  if (profitable.length < 2) {
    return {
      visual: null,
      decision: { allowed: false, reason: "insufficient_material_gain", netGain: bestNetGain(profitable.map((entry) => entry.decision)) },
    };
  }
  const targets = profitable.map((entry) => entry.target);
  const sortedGains = profitable
    .map((entry) => entry.decision.netGain ?? 0)
    .sort((a, b) => b - a);
  const secondBestGain = sortedGains[1];
  if (secondBestGain <= 0) {
    return { visual: null, decision: { allowed: false, reason: "not_profitable", netGain: secondBestGain } };
  }
  return {
    visual: visualWithTargets(input.visual, targets, rebuildForkLineSegments(input.visual, targets)),
    decision: { allowed: true, reason: "material_win", netGain: secondBestGain },
  };
}

function evaluatePin(input: {
  fen: string;
  visual: ProjectiveTacticVisual;
  movedColor: "w" | "b";
}): { visual: ProjectiveTacticVisual | null; decision: MaterialGateDecision } {
  const pinned = input.visual.targetPieces[0];
  const backTarget = input.visual.targetPieces[1];
  if (!pinned || !backTarget || !MATERIAL_TARGET_TYPES.has(pinned.piece)) {
    return { visual: null, decision: { allowed: false, reason: "insufficient_material_gain" } };
  }
  const capture = evaluateCaptureProfitability({
    fen: input.fen,
    sourceSquare: input.visual.sourceSquare,
    target: pinned,
    movedColor: input.movedColor,
  });
  if (capture.reason === "target_protected_bad_trade" || capture.reason === "unknown") {
    return { visual: null, decision: capture };
  }
  const netGain = capture.netGain ?? getPieceValue(pinned.piece);
  if (netGain < 0) return { visual: null, decision: { allowed: false, reason: "target_protected_bad_trade", netGain } };
  const targets = [pinned, backTarget];
  return {
    visual: visualWithTargets(input.visual, targets, input.visual.lineSegments),
    decision: { allowed: true, reason: "material_win", netGain },
  };
}

export function filterProjectiveTacticVisualForMaterialGate(input: {
  fen: string;
  visual: ProjectiveTacticVisual;
  movedColor: "w" | "b";
}): { visual: ProjectiveTacticVisual | null; decision: MaterialGateDecision } {
  if (input.visual.kind === "fork" || input.visual.kind === "knight_fork") return evaluateFork(input);
  if (input.visual.kind === "pin") return evaluatePin(input);
  return { visual: null, decision: { allowed: false, reason: "unknown" } };
}

export function evaluateProjectiveTacticMaterialGate(input: {
  fen: string;
  visual: ProjectiveTacticVisual;
  movedColor: "w" | "b";
}): MaterialGateDecision {
  return filterProjectiveTacticVisualForMaterialGate(input).decision;
}
