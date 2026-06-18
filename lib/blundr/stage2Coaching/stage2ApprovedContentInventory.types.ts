export type Stage2ApprovedContentInventoryStatus = "approved" | "sample" | "draft" | "blocked" | "fallback_only";

export type Stage2ApprovedContentInventoryEntry = {
  openingId: string;
  lineId?: string;
  playKey?: string;
  moveUci?: string;
  moveSan?: string;
  status: Stage2ApprovedContentInventoryStatus;
  sourceFile: string;
  approvedContentAvailable: boolean;
  plainViewSafe: boolean;
  runtimeMatched: boolean;
  targetMatched: boolean;
  visualRecipeAvailable: boolean;
  reasonNotApproved?: string;
};

export type Stage2ApprovedContentInventorySummary = {
  approvedContentInventoryCount: number;
  approvedContentMatchedCount: number;
  approvedContentAvailableCount: number;
  sampleCount: number;
  draftCount: number;
  blockedCount: number;
  fallbackOnlyCount: number;
  runtimeMatchedCount: number;
  targetMatchedCount: number;
  plainViewSafeCount: number;
  visualRecipeAvailableCount: number;
};
