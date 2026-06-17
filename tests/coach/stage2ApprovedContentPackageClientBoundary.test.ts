import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { STAGE2_APPROVED_CONTENT_APPROVED_PACKETS } from "../../lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.generated";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

async function main(): Promise<void> {
  const packageSource = fs.readFileSync(
    path.join(REPO_ROOT, "lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.ts"),
    "utf8",
  );
  const indexSource = fs.readFileSync(path.join(REPO_ROOT, "lib/blundr/stage2ApprovedContent/index.ts"), "utf8");
  const appPageSource = fs.readFileSync(path.join(REPO_ROOT, "app/page.tsx"), "utf8");
  const coachingResolverSource = fs.readFileSync(
    path.join(REPO_ROOT, "lib/blundr/stage2Coaching/resolveStage2CoachingPacket.ts"),
    "utf8",
  );

  assert.equal(packageSource.includes("node:fs"), false);
  assert.equal(packageSource.includes("node:zlib"), false);
  assert.equal(packageSource.includes("eval(\"require\")"), false);
  assert.equal(packageSource.includes("readFileSync"), false);
  assert.equal(packageSource.includes("writeFileSync"), false);

  assert.equal(indexSource.includes("stage2ApprovedContentPackage.server"), false);
  assert.equal(indexSource.includes("node:fs"), false);

  assert.equal(appPageSource.includes("stage2ApprovedContentPackage.server"), false);
  assert.equal(appPageSource.includes("node:fs"), false);

  assert.equal(coachingResolverSource.includes("stage2ApprovedContentPackage.server"), false);
  assert.equal(coachingResolverSource.includes("node:fs"), false);

  const approvedContent = await import("../../lib/blundr/stage2ApprovedContent");
  const londonWhitePacket = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find(
    (packet) => packet.openingId === "london-white" && packet.moveUci === "d2d4",
  );
  assert.ok(londonWhitePacket, "london_white_packet_missing");
  const approved = approvedContent.resolveStage2ApprovedContentPacket({
    openingId: "london-white",
    playKeyBefore: "",
    targetUci: "d2d4",
    targetSan: "d4",
    surface: "assisted",
    approvedPacketsPath: approvedContent.getStage2ApprovedContentApprovedPacketsDefaultPath(),
  });

  assert.equal(approved.kind, "approved_packet");
}

main()
  .then(() => {
    console.log("stage2ApprovedContentPackageClientBoundary ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
