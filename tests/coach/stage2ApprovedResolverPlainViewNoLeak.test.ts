import assert from "node:assert/strict";

import { STAGE2_APPROVED_CONTENT_APPROVED_PACKETS } from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated";
import { applyStage2CoachCopyEnrichment } from "../../lib/blundr/stage2Coaching";
import { getStage2ApprovedContentApprovedPacketsDefaultPath, resolveStage2ApprovedContentPacket } from "../../lib/blundr/stage2ApprovedContent";

async function main(): Promise<void> {
  const approvedPath = getStage2ApprovedContentApprovedPacketsDefaultPath();
  const londonWhitePacket = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find(
    (packet) => packet.openingId === "london-white" && packet.moveUci === "d2d4",
  );
  assert.ok(londonWhitePacket, "london_white_packet_missing");
  const playKeyBefore = londonWhitePacket ? londonWhitePacket.playSequenceUci.slice(0, Math.max(0, Number(londonWhitePacket.ply ?? 1) - 1)).join(",") : "";

  const exact = resolveStage2ApprovedContentPacket({
    openingId: "london-white",
    playKeyBefore,
    targetUci: "d2d4",
    targetSan: "d4",
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
