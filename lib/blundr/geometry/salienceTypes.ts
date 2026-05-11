export type Color = "w" | "b";
export type PieceSymbol = "p" | "n" | "b" | "r" | "q" | "k";

export type AttackRef = {
  square: string;
  piece: PieceSymbol;
  color: Color;
  value: number;
};

export type OccupantRef = {
  color: Color;
  piece: PieceSymbol;
  value: number;
};

export type SquareInfluence = {
  square: string;
  occupiedBy?: OccupantRef;

  whiteAttackers: AttackRef[];
  blackAttackers: AttackRef[];

  whiteAttackWeight: number;
  blackAttackWeight: number;

  whiteDefenders: AttackRef[];
  blackDefenders: AttackRef[];

  whiteDefenseWeight: number;
  blackDefenseWeight: number;

  contested: boolean;
  weakForWhite: boolean;
  weakForBlack: boolean;
  hangingWhitePiece: boolean;
  hangingBlackPiece: boolean;

  kingProximityWhite: number;
  kingProximityBlack: number;
};

export type InfluenceMap = {
  fen: string;
  squares: Record<string, SquareInfluence>;
  whiteKingSquare?: string;
  blackKingSquare?: string;
};

export type ChangedSquare = {
  square: string;
  attackGain: number;
  defenseGain: number;
  netControlChange: number;
  vulnerabilityScore: number;
  kingProximityScore: number;
  occupiedTargetValue: number;
  totalSalience: number;
};

export type ChangedLine = {
  from: string;
  to: string;
  lineSquares: string[];
  role:
    | "move"
    | "pressure"
    | "defense"
    | "open_file"
    | "diagonal"
    | "rank"
    | "file"
    | "pin"
    | "threat";
  salience: number;
};

export type MoveDelta = {
  move: string;
  from: string;
  to: string;
  promotion?: string;
  piece: PieceSymbol;
  color: Color;
  san?: string;
  beforeFen: string;
  afterFen: string;
  moveArrow: { from: string; to: string; role: "move"; intensity: number };
  changedSquares: ChangedSquare[];
  changedLines: ChangedLine[];
};

export type MobilityDelta = {
  move: string;
  from: string;
  to: string;
  piece: PieceSymbol;
  color: Color;
  movedPieceBefore: number;
  movedPieceAfter: number;
  movedPieceGain: number;
  friendlyTotalBefore: number;
  friendlyTotalAfter: number;
  friendlyTotalGain: number;
  enemyTotalBefore: number;
  enemyTotalAfter: number;
  enemyTotalLoss: number;
};

export const PIECE_VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 2,
} as const;
