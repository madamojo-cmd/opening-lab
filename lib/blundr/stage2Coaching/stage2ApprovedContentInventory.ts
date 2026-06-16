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

const STAGE2_APPROVED_CONTENT_SOURCE_ROOT = "imports/stage2-sample/content-base/docs/content/stage2/openings";

const SAMPLE_OPENINGS = new Set([
  "italian-black",
  "italian-white",
  "ruy-lopez-white",
]);

const STAGE2_APPROVED_CONTENT_INVENTORY_OPENING_IDS = [
  "caro-kann-black",
  "colle-white",
  "english-white",
  "french-black",
  "italian-black",
  "italian-white",
  "kings-indian-black",
  "london-white",
  "nimzo-indian-black",
  "petroff-black",
  "pirc-black",
  "qgd-black",
  "queens-gambit-white",
  "queens-indian-black",
  "reti-white",
  "ruy-lopez-white",
  "scandinavian-black",
  "scotch-white",
  "sicilian-black",
  "slav-black",
  "vienna-white",
] as const;

function buildReasonNotApproved(status: Stage2ApprovedContentInventoryStatus, openingId: string): string {
  switch (status) {
    case "approved":
      return "";
    case "sample":
      return `reconciled_partial_source_not_approved:${openingId}`;
    case "draft":
      return `draft_source_not_approved:${openingId}`;
    case "blocked":
      return `blocked_source_not_approved:${openingId}`;
    case "fallback_only":
      return `fallback_only_source_not_approved:${openingId}`;
  }
}

function buildInventoryEntry(openingId: string): Stage2ApprovedContentInventoryEntry {
  const status: Stage2ApprovedContentInventoryStatus = SAMPLE_OPENINGS.has(openingId) ? "sample" : "draft";
  return {
    openingId,
    lineId: openingId,
    status,
    sourceFile: `${STAGE2_APPROVED_CONTENT_SOURCE_ROOT}/${openingId}.md`,
    approvedContentAvailable: false,
    plainViewSafe: false,
    runtimeMatched: true,
    targetMatched: false,
    visualRecipeAvailable: false,
    reasonNotApproved: buildReasonNotApproved(status, openingId),
  };
}

export const STAGE2_APPROVED_CONTENT_INVENTORY: Stage2ApprovedContentInventoryEntry[] = STAGE2_APPROVED_CONTENT_INVENTORY_OPENING_IDS.map((openingId) => buildInventoryEntry(openingId));

export function getStage2ApprovedContentInventoryEntry(openingId: string): Stage2ApprovedContentInventoryEntry | null {
  return STAGE2_APPROVED_CONTENT_INVENTORY.find((entry) => entry.openingId === openingId) ?? null;
}

export function getStage2ApprovedContentInventorySummary(): {
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
} {
  const approvedContentInventoryCount = STAGE2_APPROVED_CONTENT_INVENTORY.length;
  const approvedContentMatchedCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.approvedContentAvailable).length;
  const sampleCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.status === "sample").length;
  const draftCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.status === "draft").length;
  const blockedCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.status === "blocked").length;
  const fallbackOnlyCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.status === "fallback_only").length;
  const runtimeMatchedCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.runtimeMatched).length;
  const targetMatchedCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.targetMatched).length;
  const plainViewSafeCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.plainViewSafe).length;
  const visualRecipeAvailableCount = STAGE2_APPROVED_CONTENT_INVENTORY.filter((entry) => entry.visualRecipeAvailable).length;

  return {
    approvedContentInventoryCount,
    approvedContentMatchedCount,
    approvedContentAvailableCount: approvedContentMatchedCount,
    sampleCount,
    draftCount,
    blockedCount,
    fallbackOnlyCount,
    runtimeMatchedCount,
    targetMatchedCount,
    plainViewSafeCount,
    visualRecipeAvailableCount,
  };
}
