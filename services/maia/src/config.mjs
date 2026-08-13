import { resolve } from "node:path";

import { SKILLS } from "./contracts.mjs";

function integer(value, fallback, min, max, name) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name}_invalid`);
  }
  return parsed;
}

function bool(value, fallback = false) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes"].includes(String(value).trim().toLowerCase());
}

export function readConfig(env = process.env) {
  const token = String(env.MAIA_SERVICE_TOKEN ?? "").trim();
  const allowInsecureToken = bool(env.MAIA_ALLOW_INSECURE_DEV_TOKEN);
  if (!token) throw new Error("MAIA_SERVICE_TOKEN_required");
  if (!allowInsecureToken && Buffer.byteLength(token, "utf8") < 32) {
    throw new Error("MAIA_SERVICE_TOKEN_too_short");
  }

  const maxWarmWorkers = integer(
    env.MAIA_MAX_WARM_WORKERS,
    3,
    1,
    9,
    "MAIA_MAX_WARM_WORKERS",
  );
  const healthProbeSkill = String(
    env.MAIA_HEALTH_PROBE_SKILL ?? "maia-1500",
  ).trim();
  if (!SKILLS.includes(healthProbeSkill)) {
    throw new Error("MAIA_HEALTH_PROBE_SKILL_invalid");
  }
  const prewarmSkills = [
    ...new Set(
      String(env.MAIA_PREWARM_SKILLS ?? "maia-1100,maia-1500,maia-1900")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  ];
  if (
    prewarmSkills.length === 0 ||
    prewarmSkills.length > maxWarmWorkers ||
    !prewarmSkills.includes(healthProbeSkill) ||
    prewarmSkills.some((skill) => !SKILLS.includes(skill))
  ) {
    throw new Error("MAIA_PREWARM_SKILLS_invalid");
  }

  return Object.freeze({
    host: String(env.HOST ?? "0.0.0.0"),
    port: integer(env.PORT, 8080, 1, 65535, "PORT"),
    token,
    lc0Path: resolve(String(env.MAIA_LC0_PATH ?? "/usr/local/bin/lc0")),
    modelDir: resolve(String(env.MAIA_MODEL_DIR ?? "/opt/maia/models")),
    backend: String(env.MAIA_BACKEND ?? "blas").trim() || "blas",
    startupTimeoutMs: integer(
      env.MAIA_STARTUP_TIMEOUT_MS,
      30_000,
      1_000,
      120_000,
      "MAIA_STARTUP_TIMEOUT_MS",
    ),
    requestTimeoutMs: integer(
      env.MAIA_REQUEST_TIMEOUT_MS,
      2_500,
      250,
      5_000,
      "MAIA_REQUEST_TIMEOUT_MS",
    ),
    maxBodyBytes: integer(
      env.MAIA_MAX_BODY_BYTES,
      65_536,
      4_096,
      262_144,
      "MAIA_MAX_BODY_BYTES",
    ),
    queueLimit: integer(env.MAIA_QUEUE_LIMIT, 32, 0, 256, "MAIA_QUEUE_LIMIT"),
    maxWarmWorkers,
    healthProbeSkill,
    prewarmSkills: Object.freeze(prewarmSkills),
    logLevel: String(env.MAIA_LOG_LEVEL ?? "info")
      .trim()
      .toLowerCase(),
  });
}
