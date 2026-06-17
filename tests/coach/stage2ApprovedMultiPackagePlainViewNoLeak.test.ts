import assert from "node:assert/strict";

import { applyStage2CoachCopyEnrichment } from "../../lib/blundr/stage2Coaching";
import { resolveStage2ApprovedContentPacket } from "../../lib/blundr/stage2ApprovedContent";

async function main(): Promise<void> {
  const approvedPath = "data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl";
  const exact = resolveStage2ApprovedContentPacket({
    openingId: "ruy-lopez-white",
    playKeyBefore: "e2e4,e7e5,g1f3,b8c6,f1b5,a7a6,b5a4,g8f6",
    targetUci: "e1g1",
    surface: "plain_hint",
    approvedPacketsPath: approvedPath,
  });

  assert.equal(exact.kind, "approved_packet");
  if (exact.kind !== "approved_packet") return;

  const plainText = [
    exact.packet.surfaces.plain_hint?.title ?? "",
    exact.packet.surfaces.plain_hint?.body ?? "",
  ].join("\n").toLowerCase();
  assert.equal(plainText.includes("e1g1"), false);
  assert.equal(plainText.includes("e1h1"), false);
  assert.equal(plainText.includes("o-o"), false);

  const enriched = applyStage2CoachCopyEnrichment({
    currentMode: "plain_before_show_more",
    targetUci: "e1g1",
    targetSan: "O-O",
    baseCopy: { title: "Base title", body: "Base body" },
    resolution: exact,
  });
  assert.equal(enriched.applied, true);
  assert.equal(enriched.copy.title?.toLowerCase().includes("e1g1"), false);
  assert.equal(enriched.copy.body?.toLowerCase().includes("e1g1"), false);
  assert.equal(enriched.copy.body?.toLowerCase().includes("o-o"), false);
}

main()
  .then(() => {
    console.log("stage2ApprovedMultiPackagePlainViewNoLeak ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
