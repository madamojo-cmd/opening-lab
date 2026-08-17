import { createHash } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadManifest } from "../src/manifest.mjs";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_ATTEMPTS = 5;
const MAX_RETRY_DELAY_MS = 15_000;
const RETRYABLE_HTTP_STATUSES = new Set([408, 425, 429]);

function defaultSleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function isRetryableStatus(status) {
  return (
    RETRYABLE_HTTP_STATUSES.has(status) || (status >= 500 && status <= 599)
  );
}

function parseRetryAfterMs(response, nowMs) {
  const value = response.headers.get("retry-after")?.trim();
  if (!value) return null;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(Math.ceil(seconds * 1_000), MAX_RETRY_DELAY_MS);
  }

  const retryAtMs = Date.parse(value);
  if (!Number.isFinite(retryAtMs)) return null;

  return Math.min(Math.max(0, retryAtMs - nowMs), MAX_RETRY_DELAY_MS);
}

function exponentialRetryDelayMs(attempt) {
  return Math.min(1_000 * 2 ** Math.max(0, attempt - 1), MAX_RETRY_DELAY_MS);
}

export async function downloadModelAsset(
  url,
  {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    fetchImpl = fetch,
    sleep = defaultSleep,
    now = Date.now,
  } = {},
) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error("download_attempts_invalid");
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response;

    try {
      response = await fetchImpl(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent": "blundr-maia-service-model-fetch/1.0" },
      });
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw new Error("download_failed:network", { cause: error });
      }

      const delayMs = exponentialRetryDelayMs(attempt);
      console.warn(
        `model_download_retry status=network attempt=${attempt}/${maxAttempts} delayMs=${delayMs}`,
      );
      await sleep(delayMs);
      continue;
    }

    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }

    if (!isRetryableStatus(response.status) || attempt >= maxAttempts) {
      throw new Error(`download_failed:${response.status}`);
    }

    const retryAfterMs = parseRetryAfterMs(response, now());
    const delayMs = retryAfterMs ?? exponentialRetryDelayMs(attempt);
    console.warn(
      `model_download_retry status=${response.status} attempt=${attempt}/${maxAttempts} delayMs=${delayMs}`,
    );
    await sleep(delayMs);
  }

  throw new Error("download_failed:exhausted");
}

async function main() {
  const outputDir = resolve(
    process.argv[2] ?? process.env.MAIA_MODEL_DIR ?? "models",
  );
  const licenseDir = resolve(process.argv[3] ?? `${outputDir}/../licenses`);
  const manifest = await loadManifest();

  await mkdir(outputDir, { recursive: true, mode: 0o755 });
  await mkdir(licenseDir, { recursive: true, mode: 0o755 });

  for (const model of manifest.models) {
    const contents = await downloadModelAsset(model.url);
    const sha256 = createHash("sha256").update(contents).digest("hex");
    if (contents.byteLength !== model.bytes || sha256 !== model.sha256) {
      throw new Error(`model_integrity_failed:${model.skillLevel}`);
    }

    const destination = resolve(outputDir, model.file);
    if (basename(destination) !== model.file) {
      throw new Error("model_path_invalid");
    }

    const temporary = `${destination}.tmp`;
    await writeFile(temporary, contents, { mode: 0o444 });
    await rename(temporary, destination).catch(async (error) => {
      await rm(temporary, { force: true });
      throw error;
    });
    console.log(`${model.skillLevel} ${model.sha256}`);
  }

  const license = await downloadModelAsset(manifest.source.licenseUrl);
  await writeFile(resolve(licenseDir, "maia-chess-LICENSE"), license, {
    mode: 0o444,
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
