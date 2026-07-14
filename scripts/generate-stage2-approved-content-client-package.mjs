import fs from "node:fs";

const sourcePath = "lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated.ts";
const outputPath = "lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.client.generated.ts";
const source = fs.readFileSync(sourcePath, "utf8");
const arrayStart = source.indexOf("[", source.indexOf("`"));
const arrayEnd = source.lastIndexOf("]\n`") + 1;
const packets = JSON.parse(source.slice(arrayStart, arrayEnd));
const clientPackets = packets.map((packet) => ({
  packetId: packet.packetId,
  openingId: packet.openingId,
  lineId: packet.lineId,
  playKey: packet.playKey,
  playSequenceUci: packet.playSequenceUci,
  normalizedPlaySequenceUci: packet.normalizedPlaySequenceUci ?? null,
  moveUci: packet.moveUci,
  normalizedMoveUci: packet.normalizedMoveUci ?? null,
  sourceRuntimeMoveUci: packet.sourceRuntimeMoveUci ?? null,
  uciNormalizationApplied: packet.uciNormalizationApplied ?? false,
  uciNormalizationReason: packet.uciNormalizationReason ?? null,
  moveSan: packet.moveSan,
  learnerSide: packet.learnerSide,
  sideToMove: packet.sideToMove,
  ply: packet.ply,
  status: packet.status,
  approvalReadiness: packet.approvalReadiness,
  coachCard: { title: packet.coachCard.title, body: packet.coachCard.body },
  surfaces: Object.fromEntries(Object.entries(packet.surfaces ?? {}).map(([key, value]) => [key, { title: value.title, body: value.body }])),
  visualRecipe: {
    recipeId: packet.visualRecipe.recipeId,
    targetMoveUci: packet.visualRecipe.targetMoveUci,
    highlightSquares: packet.visualRecipe.highlightSquares,
    arrows: packet.visualRecipe.arrows,
  },
  evidence: { claimTypes: packet.evidence?.claimTypes ?? [] },
  runtimeReconciliation: {
    status: packet.runtimeReconciliation?.status,
    openingId: packet.runtimeReconciliation?.openingId,
    playKey: packet.runtimeReconciliation?.playKey,
    lineId: packet.runtimeReconciliation?.lineId,
    moveUci: packet.runtimeReconciliation?.moveUci,
  },
  safetyStatus: packet.safetyStatus,
  sourceCandidatePackage: packet.sourceCandidatePackage,
}));
fs.writeFileSync(
  outputPath,
  `import type { Stage2ApprovedContentPromotedPacket } from "./stage2ApprovedContentTypes";\n\nexport const STAGE2_APPROVED_CONTENT_APPROVED_PACKETS = JSON.parse(${JSON.stringify(JSON.stringify(clientPackets))}) as Stage2ApprovedContentPromotedPacket[];\n`,
);
console.log(`generated ${outputPath}: ${clientPackets.length} packets`);
