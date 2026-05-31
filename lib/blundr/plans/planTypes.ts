import type { FeatureConfidence } from "../features/advancedFeatureTypes";

export interface StrategicPlanPacket {
  fen: string;
  normalizedFen: string;
  plans: RecognizedPlan[];
  blockedPlans: BlockedPlan[];
  timings?: { totalMs: number };
  generatedAt: number;
}

export interface RecognizedPlan {
  id: string;
  type:
    | "castle_and_connect_rooks"
    | "central_break_preparation"
    | "central_break_execution"
    | "minority_attack"
    | "kingside_pawn_storm"
    | "piece_maneuver_to_outpost"
    | "open_file_control"
    | "simplification_liquidation"
    | "prophylaxis"
    | "development_completion"
    | "counterplay_creation"
    | "rook_centralization"
    | "bishop_diagonal_pressure"
    | "improve_worst_piece"
    | "maintain_center_tension"
    | "resolve_center_tension"
    | "prepare_repertoire_break";
  moveUci?: string;
  moveSan?: string;
  conceptId?: string;
  patternId?: string;
  relatedSquares: string[];
  relatedFeatures: string[];
  confidence: FeatureConfidence;
  canMention: boolean;
  canDominate: boolean;
  evidence: string[];
}

export interface BlockedPlan {
  type: string;
  reason: string;
  evidence?: string[];
}

export interface OpeningPlanRegistryEntry {
  openingId: string;
  conceptId: string;
  planType: RecognizedPlan["type"];
  movePatterns: string[];
  requiredFeatureClaimTypes: string[];
  optionalFeatureClaimTypes: string[];
  blockedIfFeatureClaimTypes?: string[];
  requiredVisualConcepts?: string[];
  preferredTemplateCategories: string[];
}
