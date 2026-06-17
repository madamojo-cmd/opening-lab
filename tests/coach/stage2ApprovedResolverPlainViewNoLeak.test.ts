import assert from "node:assert/strict";

import { applyStage2CoachCopyEnrichment } from "../../lib/blundr/stage2Coaching";
import { getStage2ApprovedContentApprovedPacketsDefaultPath, resolveStage2ApprovedContentPacket } from "../../lib/blundr/stage2ApprovedContent";

async function main(): Promise<void> {
  const approvedPath = getStage2ApprovedContentApprovedPacketsDefaultPath();
  const exact = resolveStage2ApprovedContentPacket({
    openingId: "london-white",
    playKey: "d2d4,g8f6,c1f4,e7e6,e2e3,c7c5,c2c3,b8c6,b1d2,d7d5,g1f3,f8d6",
    targetUci: "d2d4",
    surface: "plain_hint",
    approvedPacketsPath: approvedPath,
  });

  assert.equal(exact.kind, "approved_packet");
  if (exact.kind !== "approved_packet") return;

  const plainText = [
    exact.packet.surfaces.plain_hint?.title ?? "",
    exact.packet.surfaces.plain_hint?.body ?? "",
  ].join("\n").toLowerCase();

  assert.equal(plainText.includes("d2d4"), false);
  assert.equal(plainText.includes("d4"), false);

  const enriched = applyStage2CoachCopyEnrichment({
    currentMode: "plain_before_show_more",
    targetUci: "d2d4",
    targetSan: "d4",
    baseCopy: { title: "Base title", body: "Base body" },
    resolution: exact,
  });

  assert.equal(enriched.applied, true);
  assert.equal(enriched.copy.title?.toLowerCase().includes("d2d4"), false);
  assert.equal(enriched.copy.body?.toLowerCase().includes("d2d4"), false);
  assert.equal(enriched.copy.body?.toLowerCase().includes("d4"), false);
}

main()
  .then(() => {
    console.log("stage2ApprovedResolverPlainViewNoLeak ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
