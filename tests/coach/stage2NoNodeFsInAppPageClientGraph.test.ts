import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

async function main(): Promise<void> {
  const appPageSource = fs.readFileSync(path.join(REPO_ROOT, "app/page.tsx"), "utf8");
  const stage2CoachingIndexSource = fs.readFileSync(path.join(REPO_ROOT, "lib/blundr/stage2Coaching/index.ts"), "utf8");
  const stage2PackageIndexSource = fs.readFileSync(path.join(REPO_ROOT, "lib/blundr/stage2ApprovedContent/index.ts"), "utf8");
  const stage2PackageSource = fs.readFileSync(path.join(REPO_ROOT, "lib/blundr/stage2ApprovedContent/stage2ApprovedContentPackage.ts"), "utf8");

  assert.equal(appPageSource.includes("node:fs"), false);
  assert.equal(appPageSource.includes("node:child_process"), false);
  assert.equal(appPageSource.includes("MAIA_LC0_PATH"), false);
  assert.equal(appPageSource.includes("MAIA_WEIGHTS_PATH"), false);
  assert.equal(appPageSource.includes("maiaRuntimeConfig"), false);
  assert.equal(appPageSource.includes("maiaLc0RuntimeAdapter"), false);
  assert.equal(appPageSource.includes("stage2ApprovedContentPackage.server"), false);

  assert.equal(stage2CoachingIndexSource.includes("stage2ApprovedContentPackage.server"), false);

  assert.equal(stage2PackageIndexSource.includes("stage2ApprovedContentPackage.server"), false);
  assert.equal(stage2PackageIndexSource.includes("node:fs"), false);

  assert.equal(stage2PackageSource.includes("node:fs"), false);
  assert.equal(stage2PackageSource.includes("node:zlib"), false);
  assert.equal(stage2PackageSource.includes("eval(\"require\")"), false);
}

main()
  .then(() => {
    console.log("stage2NoNodeFsInAppPageClientGraph ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
