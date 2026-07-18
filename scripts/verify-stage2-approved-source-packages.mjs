import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const manifestPath =
  "docs/2026-06-17/stage2-approved-content-source-package-checksums.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.packages)) {
  throw new Error(`Invalid Stage 2 source-package manifest: ${manifestPath}`);
}

for (const packageEntry of manifest.packages) {
  const packagePath = path.resolve(packageEntry.path);
  const [fileStats, bytes] = await Promise.all([
    stat(packagePath),
    readFile(packagePath),
  ]);
  const sha256 = createHash("sha256").update(bytes).digest("hex");

  if (fileStats.size !== packageEntry.bytes) {
    throw new Error(
      `${packageEntry.path}: expected ${packageEntry.bytes} bytes, received ${fileStats.size}`,
    );
  }
  if (sha256 !== packageEntry.sha256) {
    throw new Error(`${packageEntry.path}: SHA-256 mismatch`);
  }

  console.log(`${packageEntry.packageId}: verified ${fileStats.size} bytes`);
}
