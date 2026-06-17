import assert from "node:assert/strict";

import { loadApprovedPackets } from "./stage2ApprovedContentTestHelpers";

function plainHintText(packet: Record<string, any>): string {
  return [packet.surfaces?.plain_hint?.title ?? "", packet.surfaces?.plain_hint?.body ?? ""].join("\n").toLowerCase();
}

export function testStage2ApprovedCoachCardPlainHintNoLeakAfterPolish(): void {
  const packets = loadApprovedPackets();
  for (const packet of packets) {
    const text = plainHintText(packet);
    const moveUci = String(packet.moveUci ?? "").toLowerCase();
    const moveSan = String(packet.moveSan ?? "").toLowerCase();
    assert.equal(moveUci ? text.includes(moveUci) : false, false, `plain_hint_uci_leak:${packet.packetId}`);
    assert.equal(moveSan ? text.includes(moveSan) : false, false, `plain_hint_san_leak:${packet.packetId}`);
  }
}

testStage2ApprovedCoachCardPlainHintNoLeakAfterPolish();
console.log("stage2ApprovedCoachCardPlainHintNoLeakAfterPolish ok");
