import type { TrainerFrameResolution } from "../debug/trainerFrameResolutionTypes";
import type { Stage2CoachingPacketEntry, CoachingSurface } from "../stage2Coaching/stage2CoachingTypes";

export const STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID = "stage2-approved-content-candidates-5openings-50lines-v1" as const;
export const STAGE2_APPROVED_CONTENT_APPROVED_PACKAGE_ID = "stage2-approved-content-approved-5openings-v1" as const;

export type Stage2ApprovedContentCandidatePackageContentInventoryRow = {
  openingId: string;
  openingName: string;
  lineCount: number;
  packetCount: number;
  status: string;
  notes: string;
};

export type Stage2ApprovedContentCandidatePackageLineInventoryRow = {
  openingId: string;
  lineId: string;
  lineRankWithinOpening: number;
  lineName: string;
  playSequenceUci: string[];
  learnerMoveCountAuthored: number;
  packetCount: number;
  runtimeMatched: boolean;
  legalSequenceValidated: boolean;
  notes: string;
};

export type Stage2ApprovedContentCandidatePacket = Record<string, unknown> & {
  packetId: string;
  openingId: string;
  openingName: string;
  lineId: string;
  lineName: string;
  lineRankWithinOpening: number;
  playKey: string;
  playSequenceUci: string[];
  normalizedPlaySequenceUci?: string[] | null;
  moveUci: string;
  normalizedMoveUci?: string | null;
  sourceRuntimeMoveUci?: string | null;
  uciNormalizationApplied?: boolean | null;
  uciNormalizationReason?: string | null;
  moveSan: string;
  learnerSide: string;
  sideToMove: string;
  ply: number;
  status: string;
  approvalReadiness: string;
  runtimeSource: string;
  runtimePackageId: string;
  runtimeMatched: boolean;
  targetMatched: boolean;
  plainViewSafe: boolean;
  coachCard: {
    title: string;
    body: string;
    why: string;
    principle: string;
  };
  surfaces: {
    assisted?: { title?: string; body?: string };
    plain_hint?: { title?: string; body?: string };
    plain_show_more?: { title?: string; body?: string };
    review?: { title?: string; body?: string };
  };
  conceptIds: string[];
  featureTags: string[];
  openingSpecificThemes: string[];
  visualRecipe: {
    recipeId: string;
    targetMoveUci: string;
    highlightSquares: string[];
    arrows: string[];
    fallbackAllowed: boolean;
    notes: string;
  };
  evidence: string[];
  rejectionReason: string | null;
};

export type Stage2ApprovedContentPromotedPacket = Stage2ApprovedContentCandidatePacket & {
  status: "approved";
  approvalReadiness: "app_validated";
  sourceCandidatePackage: string;
  sourceCandidatePackages?: string[];
  sourceRuntimeMoveUci?: string | null;
  normalizedMoveUci?: string | null;
  normalizedPlaySequenceUci?: string[] | null;
  uciNormalizationApplied?: boolean | null;
  uciNormalizationReason?: string | null;
  safetyStatus: "safe";
  runtimeReconciliation: {
    status: "matched";
    openingId: string;
    playKey?: string;
    lineId?: string;
    moveUci?: string;
  };
};

export type Stage2ApprovedContentCandidatePackageLoadResult = {
  packageId: string;
  zipPath: string;
  contentInventory: Stage2ApprovedContentCandidatePackageContentInventoryRow[];
  lineInventory: Stage2ApprovedContentCandidatePackageLineInventoryRow[];
  packets: Stage2ApprovedContentCandidatePacket[];
};

export type Stage2ApprovedContentCandidatePackageCollectionLoadResult = {
  packageIds: string[];
  packages: Stage2ApprovedContentCandidatePackageLoadResult[];
  contentInventory: Stage2ApprovedContentCandidatePackageContentInventoryRow[];
  lineInventory: Stage2ApprovedContentCandidatePackageLineInventoryRow[];
  packets: Stage2ApprovedContentCandidatePacket[];
};

export type Stage2ApprovedContentPacketValidation = {
  packetId: string;
  openingId: string;
  lineId: string;
  lineRankWithinOpening: number;
  playKey: string;
  playKeyBefore: string;
  moveUci: string;
  moveSan: string;
  packetStatus: string;
  approvalReadiness: string;
  runtimeSource: string;
  runtimePackageId: string;
  openingRuntimeAvailable: boolean;
  openingTrainableFromLocalRuntimePackage: boolean;
  runtimeDataSource: "local_crawled_package";
  liveLichessCalled: false;
  playSequenceLegal: boolean;
  moveLegal: boolean;
  sanMatches: boolean;
  runtimeNodeMatched: boolean;
  runtimeMoveMatched: boolean;
  trainerFrameResolutionTargetMatched: boolean;
  plainHintSafe: boolean;
  visualRecipeTargetMatched: boolean;
  noForbiddenGenericLabels: boolean;
  noPlaceholderText: boolean;
  noUnsupportedClaims: boolean;
  exactRuntimeLineMatched: boolean;
  reasons: string[];
  approved: boolean;
};

export type Stage2ApprovedContentPackageValidationSummary = {
  packageId: string;
  zipPath: string;
  openingCount: number;
  lineCount: number;
  packetCount: number;
  uniquePacketIdCount: number;
  approvedPacketCount: number;
  rejectedPacketCount: number;
  openings: string[];
  runtimeDataSource: "local_crawled_package";
  liveLichessCalled: false;
  runtimePackageId: string;
  runtimeAvailableCount: number;
  trainableOpeningCount: number;
  approvedContentAvailableCount: number;
  runtimeAvailable: boolean;
  trainableFromLocalRuntimePackage: boolean;
};

export type Stage2ApprovedContentPackageValidationInventory = {
  summary: Stage2ApprovedContentPackageValidationSummary;
  contentInventory: Stage2ApprovedContentCandidatePackageContentInventoryRow[];
  lineInventory: Stage2ApprovedContentCandidatePackageLineInventoryRow[];
  packetValidation: Stage2ApprovedContentPacketValidation[];
  approvedPackets: Stage2ApprovedContentPromotedPacket[];
  rejectedPackets: Array<Stage2ApprovedContentPacketValidation & { packet: Stage2ApprovedContentCandidatePacket }>;
};

export type Stage2ApprovedContentPackageValidationResult = Stage2ApprovedContentPackageValidationInventory;

export type Stage2ApprovedContentCandidatePackageValidationInventory = Stage2ApprovedContentPackageValidationInventory & {
  packageId: string;
};

export type Stage2ApprovedContentCandidatePackageCollectionValidationInventory = {
  summary: {
    packageCount: number;
    packageIds: string[];
    openingCount: number;
    lineCount: number;
    packetCount: number;
    uniquePacketIdCount: number;
    approvedPacketCount: number;
    rejectedPacketCount: number;
    runtimeDataSource: "local_crawled_package";
    liveLichessCalled: false;
    runtimeAvailableCount: number;
    trainableOpeningCount: number;
    approvedContentAvailableCount: number;
    runtimeAvailable: boolean;
    trainableFromLocalRuntimePackage: boolean;
  };
  packageSummaries: Array<Stage2ApprovedContentPackageValidationSummary & { openingIds: string[] }>;
  contentInventory: Stage2ApprovedContentCandidatePackageContentInventoryRow[];
  lineInventory: Stage2ApprovedContentCandidatePackageLineInventoryRow[];
  packetValidation: Stage2ApprovedContentPacketValidation[];
  approvedPackets: Stage2ApprovedContentPromotedPacket[];
  rejectedPackets: Array<Stage2ApprovedContentPacketValidation & { packet: Stage2ApprovedContentCandidatePacket }>;
};

export type Stage2ApprovedContentResolverSurface = CoachingSurface;

export type Stage2ApprovedContentResolverRequest = {
  openingId: string;
  playKeyBefore?: string | null;
  playKey?: string | null;
  targetUci: string;
  surface: Stage2ApprovedContentResolverSurface;
  approvedPacketsPath?: string;
};

export type Stage2ApprovedContentResolverResult =
  | { kind: "approved_packet"; packet: Stage2ApprovedContentPromotedPacket }
  | { kind: "none"; reason: string };

export type Stage2ApprovedContentTrainerResolution = TrainerFrameResolution;
