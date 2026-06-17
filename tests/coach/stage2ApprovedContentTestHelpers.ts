import fs from "node:fs";
import path from "node:path";

type ApprovedPacket = Record<string, any>;

export const APPROVED_BUNDLE_PATHS = [
  path.join(process.cwd(), "data", "blundr", "stage2-approved-content-approved-5openings-v1", "approved-packets.jsonl"),
  path.join(process.cwd(), "data", "blundr", "stage2-approved-content-approved-batches2to4-16openings-v1", "approved-packets.jsonl"),
];

export function loadApprovedPackets(): ApprovedPacket[] {
  return APPROVED_BUNDLE_PATHS.flatMap((bundlePath) => {
    if (!fs.existsSync(bundlePath)) return [];
    const text = fs.readFileSync(bundlePath, "utf8");
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ApprovedPacket);
  });
}

export function findApprovedPacket(predicate: (packet: ApprovedPacket) => boolean): ApprovedPacket {
  const packet = loadApprovedPackets().find(predicate);
  if (!packet) {
    throw new Error("approved_packet_not_found");
  }
  return packet;
}

export function packetPlayKeyBefore(packet: ApprovedPacket): string {
  const sequence = Array.isArray(packet.normalizedPlaySequenceUci) && packet.normalizedPlaySequenceUci.length > 0
    ? packet.normalizedPlaySequenceUci
    : Array.isArray(packet.playSequenceUci)
      ? packet.playSequenceUci
      : [];
  const ply = Number(packet.ply ?? sequence.length);
  const endIndex = Number.isFinite(ply) && ply > 0 ? Math.max(0, ply - 1) : Math.max(0, sequence.length - 1);
  return sequence.slice(0, endIndex).join(",");
}

export function packetPlayKeyAtTarget(packet: ApprovedPacket): string {
  const sequence = Array.isArray(packet.normalizedPlaySequenceUci) && packet.normalizedPlaySequenceUci.length > 0
    ? packet.normalizedPlaySequenceUci
    : Array.isArray(packet.playSequenceUci)
      ? packet.playSequenceUci
      : [];
  const ply = Number(packet.ply ?? sequence.length);
  const endIndex = Number.isFinite(ply) && ply > 0 ? Math.max(0, ply) : sequence.length;
  return sequence.slice(0, endIndex).join(",");
}
