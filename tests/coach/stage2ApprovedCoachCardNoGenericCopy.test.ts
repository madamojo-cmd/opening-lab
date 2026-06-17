import assert from "node:assert/strict";

import { loadApprovedPackets } from "./stage2ApprovedContentTestHelpers";

const BANNED_PHRASES = [
  "This is a good move.",
  "Continue the position.",
  "Develop a piece.",
  "Improve your position.",
  "This follows opening principles.",
  "Active Piece Development.",
  "Avoid Blocking Center Pawn.",
  "Keep playing normally.",
  "Make a useful move.",
  "This is standard.",
  "This is theory.",
  "Good developing move.",
  "Natural move.",
  "Play the move.",
];

function collectFinalLearnerText(packet: Record<string, any>): string {
  return JSON.stringify({
    coachCard: packet.coachCard,
    surfaces: {
      assisted: packet.surfaces?.assisted,
      plain_hint: packet.surfaces?.plain_hint,
      plain_show_more: packet.surfaces?.plain_show_more,
      review: packet.surfaces?.review,
    },
  }).toLowerCase();
}

export function testStage2ApprovedCoachCardNoGenericCopy(): void {
  const packets = loadApprovedPackets();
  assert.equal(packets.length, 2515, "approved_packet_total_changed");
  const hits: string[] = [];
  for (const phrase of BANNED_PHRASES) {
    const matched = packets.filter((packet) => collectFinalLearnerText(packet).includes(phrase.toLowerCase())).map((packet) => packet.packetId ?? `${packet.openingId}:${packet.lineId}:${packet.playKey}`);
    assert.equal(matched.length, 0, `banned_phrase_hit:${phrase}`);
    hits.push(phrase);
  }
  assert.equal(hits.length, BANNED_PHRASES.length);
}

testStage2ApprovedCoachCardNoGenericCopy();
console.log("stage2ApprovedCoachCardNoGenericCopy ok");
