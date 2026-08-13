import { createHash } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { loadManifest } from "../src/manifest.mjs";

async function download(url, timeoutMs = 60_000) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "user-agent": "blundr-maia-service-model-fetch/1.0" },
  });
  if (!response.ok) throw new Error(`download_failed:${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const outputDir = resolve(
  process.argv[2] ?? process.env.MAIA_MODEL_DIR ?? "models",
);
const licenseDir = resolve(process.argv[3] ?? `${outputDir}/../licenses`);
const manifest = await loadManifest();
await mkdir(outputDir, { recursive: true, mode: 0o755 });
await mkdir(licenseDir, { recursive: true, mode: 0o755 });

for (const model of manifest.models) {
  const contents = await download(model.url);
  const sha256 = createHash("sha256").update(contents).digest("hex");
  if (contents.byteLength !== model.bytes || sha256 !== model.sha256) {
    throw new Error(`model_integrity_failed:${model.skillLevel}`);
  }
  const destination = resolve(outputDir, model.file);
  if (basename(destination) !== model.file)
    throw new Error("model_path_invalid");
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, contents, { mode: 0o444 });
  await rename(temporary, destination).catch(async (error) => {
    await rm(temporary, { force: true });
    throw error;
  });
  console.log(`${model.skillLevel} ${model.sha256}`);
}

const license = await download(manifest.source.licenseUrl);
await writeFile(resolve(licenseDir, "maia-chess-LICENSE"), license, {
  mode: 0o444,
});
