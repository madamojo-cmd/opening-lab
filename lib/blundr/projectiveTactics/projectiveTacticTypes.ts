import type { Square } from "chess.js";

export type BoardOrientation = "white" | "black";

export type BoardPoint = {
  x: number;
  y: number;
};

export type ProjectiveTacticKind =
  | "fork"
  | "knight_fork"
  | "pin"
  | "skewer"
  | "discovered_attack"
  | "discovered_check"
  | "double_attack"
  | "xray_attack"
  | "battery"
  | "overloaded_defender"
  | "hanging_piece"
  | "trapped_piece"
  | "back_rank_weakness"
  | "mate_threat"
  | "removal_of_defender"
  | "deflection"
  | "decoy"
  | "clearance"
  | "interference";

export type ProjectiveTacticOwner = "learner" | "opponent";

export type ProjectiveTacticRevealRisk = "none" | "low" | "answer_revealing";

export type ProjectiveTacticConfidence = "high" | "medium" | "experimental";

export type ProjectiveTacticLineShape = "straight" | "knight_l";

export type ProjectiveTacticTargetPiece = {
  square: Square;
  piece: string;
  color: "w" | "b";
};

export type ProjectiveTacticLineSegment = {
  from: Square;
  to: Square;
  shape: ProjectiveTacticLineShape;
};

export type ProjectiveTacticVisual = {
  id: string;
  kind: ProjectiveTacticKind;
  label: string;
  owner: ProjectiveTacticOwner;
  sourceSquare: Square;
  sourcePiece: string;
  targetSquares: Square[];
  targetPieces: ProjectiveTacticTargetPiece[];
  lineSegments: ProjectiveTacticLineSegment[];
  tagSquare: Square;
  createdByMoveUci?: string;
  createdAfterFen?: string;
  durationMs: number;
  fadeMs: number;
  revealRisk: ProjectiveTacticRevealRisk;
  confidence: ProjectiveTacticConfidence;
};
