import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { SKILLS } from "./contracts.mjs";

export const manifestUrl = new URL("../model-manifest.json", import.meta.url);

export async function loadManifest() {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  if (manifest.schemaVersion !== 1) throw new Error("manifest_schema_invalid");
  if (manifest.contractVersion !== "blundr-maia-service.v1") {
    throw new Error("manifest_contract_invalid");
  }
  if (
    !Array.isArray(manifest.models) ||
    manifest.models.length !== SKILLS.length
  ) {
    throw new Error("manifest_models_invalid");
  }
  const seen = new Set();
  for (const model of manifest.models) {
    if (!SKILLS.includes(model.skillLevel) || seen.has(model.skillLevel)) {
      throw new Error("manifest_skills_invalid");
    }
    seen.add(model.skillLevel);
    if (!/^[a-f0-9]{64}$/.test(model.sha256)) {
      throw new Error("manifest_hash_invalid");
    }
    if (!Number.isSafeInteger(model.bytes) || model.bytes <= 0) {
      throw new Error("manifest_size_invalid");
    }
  }
  return Object.freeze({
    ...manifest,
    models: Object.freeze(manifest.models.map((model) => Object.freeze(model))),
  });
}

async function hashFile(path) {
  const contents = await readFile(path);
  return {
    bytes: contents.byteLength,
    sha256: createHash("sha256").update(contents).digest("hex"),
  };
}

export async function verifyModelFiles(manifest, modelDir) {
  const bySkill = new Map();
  for (const model of manifest.models) {
    const path = join(modelDir, model.file);
    const actual = await hashFile(path).catch(() => null);
    if (
      !actual ||
      actual.bytes !== model.bytes ||
      actual.sha256 !== model.sha256
    ) {
      throw new Error(`model_integrity_failed:${model.skillLevel}`);
    }
    bySkill.set(model.skillLevel, Object.freeze({ ...model, path }));
  }
  return bySkill;
}
