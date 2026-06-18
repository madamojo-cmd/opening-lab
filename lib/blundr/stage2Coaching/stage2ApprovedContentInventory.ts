import type {
  Stage2ApprovedContentInventoryEntry,
  Stage2ApprovedContentInventoryStatus,
  Stage2ApprovedContentInventorySummary,
} from "./stage2ApprovedContentInventory.types";

const APPROVED_BUNDLE_PATHS = [
  `${process.cwd()}/data/blundr/stage2-approved-content-approved-5openings-v1/approved-packets.jsonl`,
  `${process.cwd()}/data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl`,
];

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

type ApprovedPacketRow = {
  openingId: string;
  lineId?: string;
  playKey?: string;
  moveUci?: string;
  moveSan?: string;
  sourceFile: string;
};

function readApprovedPacketsJsonl(filePath: string): ApprovedPacketRow[] {
  const fs = eval("require")("node:fs") as typeof import("node:fs");
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8");
  const rows: ApprovedPacketRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const packet = JSON.parse(trimmed) as Record<string, unknown>;
    rows.push({
      openingId: String(packet.openingId ?? ""),
      lineId: typeof packet.lineId === "string" ? packet.lineId : undefined,
      playKey: typeof packet.playKey === "string" ? packet.playKey : undefined,
      moveUci: typeof packet.moveUci === "string" ? packet.moveUci : undefined,
      moveSan: typeof packet.moveSan === "string" ? packet.moveSan : undefined,
      sourceFile: filePath,
    });
  }
  return rows;
}

function buildApprovedPacketIndex(): Map<string, ApprovedPacketRow[]> {
  const index = new Map<string, ApprovedPacketRow[]>();
  for (const bundlePath of APPROVED_BUNDLE_PATHS) {
    for (const row of readApprovedPacketsJsonl(bundlePath)) {
      const openingRows = index.get(row.openingId) ?? [];
      openingRows.push(row);
      index.set(row.openingId, openingRows);
    }
  }
  return index;
}

if (typeof window !== "undefined") {
  throw new Error("stage2ApprovedContentInventory.server is server-only");
}

const APPROVED_PACKET_INDEX = buildApprovedPacketIndex();

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
  const approvedRows = APPROVED_PACKET_INDEX.get(openingId) ?? [];
  const sourceFile = approvedRows[0]?.sourceFile ?? APPROVED_BUNDLE_PATHS[0];
  const firstPacket = approvedRows[0] ?? null;
  return {
    openingId,
    lineId: firstPacket?.lineId ?? openingId,
    playKey: firstPacket?.playKey,
    moveUci: firstPacket?.moveUci,
    moveSan: firstPacket?.moveSan,
    status: "approved",
    sourceFile,
    approvedContentAvailable: approvedRows.length > 0,
    plainViewSafe: approvedRows.length > 0,
    runtimeMatched: true,
    targetMatched: approvedRows.length > 0,
    visualRecipeAvailable: approvedRows.length > 0,
    reasonNotApproved: approvedRows.length > 0 ? undefined : buildReasonNotApproved("fallback_only", openingId),
  };
}

export const STAGE2_APPROVED_CONTENT_INVENTORY: Stage2ApprovedContentInventoryEntry[] =
  STAGE2_APPROVED_CONTENT_INVENTORY_OPENING_IDS.map((openingId) => buildInventoryEntry(openingId));

export function getStage2ApprovedContentInventoryEntry(openingId: string): Stage2ApprovedContentInventoryEntry | null {
  return STAGE2_APPROVED_CONTENT_INVENTORY.find((entry) => entry.openingId === openingId) ?? null;
}

export function getStage2ApprovedContentInventorySummary(): Stage2ApprovedContentInventorySummary {
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
