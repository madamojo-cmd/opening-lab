import assert from "node:assert/strict";

import { POST } from "../../app/api/stage2-approved-content/packet/route";
import { STAGE2_APPROVED_CONTENT_APPROVED_PACKETS } from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated";
import { resolveStage2CoachingPacket } from "../../lib/blundr/stage2Coaching";

function jsonRequest(payload: unknown): Request {
  return new Request("http://localhost/api/stage2-approved-content/packet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function main(): Promise<void> {
  const londonWhitePacket = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find(
    (packet) => packet.openingId === "london-white" && packet.moveUci === "d2d4",
  );
  assert.ok(londonWhitePacket, "london_white_packet_missing");

  const exact = resolveStage2CoachingPacket({
    openingId: "london-white",
    playKeyBefore: "",
    targetUci: "d2d4",
    targetSan: "d4",
    learnerSide: "white",
    sideToMove: "white",
    surface: "assisted",
  });

  // The exact approved packet is now client-safe through the compact generated package.
  assert.equal(exact.kind, "approved_packet");
  if (exact.kind === "approved_packet") {
    assert.notEqual(exact.packet.sourceFile, "stage2://safe-fallback");
    assert.equal(exact.packet.openingId, "london-white");
    assert.equal(exact.packet.moveUci, "d2d4");
  }

  const approvedApi = await POST(jsonRequest({
    openingId: "london-white",
    playKeyBefore: "",
    targetUci: "d2d4",
    targetSan: "d4",
    learnerSide: "white",
    sideToMove: "white",
    surface: "assisted",
  }));
  assert.equal(approvedApi.status, 200);
  const approvedBody = await approvedApi.json();
  assert.equal(approvedBody.kind, "approved_packet");
  assert.equal(approvedBody.packet.status, "approved");
  assert.equal(approvedBody.packet.approvalReadiness, "app_validated");
  assert.equal(approvedBody.packet.openingId, "london-white");
  assert.equal(approvedBody.packet.moveUci, "d2d4");

  const plainHint = await POST(jsonRequest({
    openingId: "london-white",
    playKeyBefore: "",
    targetUci: "d2d4",
    targetSan: "d4",
    learnerSide: "white",
    sideToMove: "white",
    surface: "plain_hint",
  }));
  const plainHintBody = await plainHint.json();

  assert.equal(plainHintBody.kind, "approved_packet");
  if (plainHintBody.kind === "approved_packet") {
    const text = [plainHintBody.packet.title ?? "", plainHintBody.packet.body ?? "", plainHintBody.packet.hint ?? ""]
      .join("\n")
      .toLowerCase();
    assert.equal(text.includes("d2d4"), false);
    assert.equal(text.includes("d4"), false);
  }
}

main()
  .then(() => {
    console.log("stage2CoachingPacketResolverClientSafe ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
