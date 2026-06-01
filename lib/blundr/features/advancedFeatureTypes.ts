import type { Color, Square } from "../geometry/boardTypes";

export type FeatureConfidence = "high" | "medium" | "low";
export type FeatureRisk = "safe_to_mention" | "debug_only" | "blocked";

export interface FeatureClaim {
  id: string;
  type: string;
  color?: Color;
  square?: Square;
  squares?: Square[];
  file?: string;
  files?: string[];
  piece?: string;
  pieces?: string[];
  moveUci?: string;
  moveSan?: string;
  conceptId?: string;
  planId?: string;
  confidence: FeatureConfidence;
  risk: FeatureRisk;
  evidence: string[];
  canMention: boolean;
  canDominate: boolean;
  userFacingSafe: boolean;
}

export interface BlockedFeatureClaim {
  type: string;
  reason: string;
  evidence?: string[];
}

export interface PawnStructureFeatures {
  isolatedPawns: Square[];
  doubledPawnFiles: string[];
  backwardPawns: Square[];
  passedPawns: Square[];
  candidatePassedPawns: Square[];
  pawnChains: Array<{ color: Color; base: Square; head: Square; squares: Square[] }>;
  pawnLevers: Array<{ color: Color; move?: string; target: Square; supportsBreak?: string }>;
  centerType: "fixed" | "mobile" | "open" | "semi_open" | "contested" | "unknown";
  weakSquares: Square[];
  pawnIslands: Record<Color, string[][]>;
  majorities: Array<{ color: Color; wing: "kingside" | "queenside"; files: string[] }>;
}

export interface KingSafetyFeatures {
  kingSquares: Partial<Record<Color, Square>>;
  uncastledKings: Color[];
  castledKingside: Color[];
  castledQueenside: Color[];
  castlingRights: Record<Color, { kingside: boolean; queenside: boolean }>;
  urgentKingSafety: Color[];
  pawnShieldGaps: Array<{ color: Color; squares: Square[] }>;
  openFilesNearKing: Array<{ color: Color; files: string[] }>;
  attackerCounts: Record<Color, number>;
  defenderCounts: Record<Color, number>;
  escapeSquareCounts: Record<Color, number>;
  backRankVulnerable: Color[];
}

export interface PieceQualityFeatures {
  undevelopedPieces: Array<{ color: Color; piece: string; square: Square }>;
  badBishops: Array<{ color: Color; square: Square; confidence: FeatureConfidence }>;
  activeBishops: Array<{ color: Color; square: Square; targets: Square[] }>;
  knightOutposts: Array<{ color: Color; square: Square; protectedByPawn: boolean }>;
  rooksOnOpenFiles: Array<{ color: Color; square: Square; file: string }>;
  rooksOnSemiOpenFiles: Array<{ color: Color; square: Square; file: string }>;
  connectedRooks: Color[];
  loosePieces: Array<{ color: Color; square: Square; piece: string }>;
  worstPieces: Array<{ color: Color; square: Square; piece: string; reason: string }>;
}

export interface ImbalanceFeatures {
  materialBalance: number;
  bishopPair: Color[];
  developmentLead: Color | "none";
  spaceAdvantage: Color | "none";
  centralControl: Record<Color, Square[]>;
  kingSafetyImbalance: Color | "none";
  pieceActivityImbalance: Color | "none";
  pawnStructureImbalance: Color | "none";
  initiative: "debug_only" | "none";
}

export interface TacticalMotifFeatures {
  verifiedPins: string[];
  verifiedForks: string[];
  verifiedSkewers: string[];
  candidateMotifs: string[];
  blockedMotifs: BlockedFeatureClaim[];
}

export interface AdvancedFeaturePacket {
  fen: string;
  normalizedFen: string;
  sideToMove: Color;
  pawnStructure: PawnStructureFeatures;
  kingSafety: KingSafetyFeatures;
  pieceQuality: PieceQualityFeatures;
  imbalances: ImbalanceFeatures;
  tacticalMotifs: TacticalMotifFeatures;
  featureClaims: FeatureClaim[];
  blockedFeatureClaims: BlockedFeatureClaim[];
  timings?: {
    geometryMs: number;
    pawnStructureMs: number;
    kingSafetyMs: number;
    pieceQualityMs: number;
    imbalanceMs: number;
    tacticalMotifMs: number;
    totalMs: number;
  };
  confidence: FeatureConfidence;
  generatedAt: number;
}
