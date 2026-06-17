import assert from "node:assert/strict";

import { resolveStage2ApprovedContentPacket, getStage2ApprovedContentApprovedPacketsDefaultPath } from "../../lib/blundr/stage2ApprovedContent";

async function main(): Promise<void> {
  const approvedPath = getStage2ApprovedContentApprovedPacketsDefaultPath();
  const exact = resolveStage2ApprovedContentPacket({
    openingId: "london-white",
    playKey: "d2d4,g8f6,c1f4,e7e6,e2e3,c7c5,c2c3,b8c6,b1d2,d7d5,g1f3,f8d6",
    targetUci: "d2d4",
    surface: "assisted",
    approvedPacketsPath: approvedPath,
  });
  assert.equal(exact.kind, "approved_packet");
  if (exact.kind === "approved_packet") {
    assert.equal(exact.packet.status, "approved");
    assert.equal(exact.packet.approvalReadiness, "app_validated");
    assert.equal(exact.packet.openingId, "london-white");
    assert.equal(exact.packet.moveUci, "d2d4");
    assert.equal(Boolean(exact.packet.surfaces.assisted?.title), true);
  }

  const mismatch = resolveStage2ApprovedContentPacket({
    openingId: "london-white",
    playKey: "d2d4,g8f6,c1f4,e7e6,e2e3,c7c5,c2c3,b8c6,b1d2,d7d5,g1f3,f8d6",
    targetUci: "c2c4",
    surface: "assisted",
    approvedPacketsPath: approvedPath,
  });
  assert.equal(mismatch.kind, "none");
}

main()
  .then(() => {
    console.log("stage2ApprovedResolverExactMatch ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
