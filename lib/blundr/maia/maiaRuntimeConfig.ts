import { existsSync } from "node:fs";

import type { MaiaSkillLevel } from "./maiaTypes";
import type {
  MaiaRuntimeConfig,
  MaiaRuntimeHealth,
  MaiaRuntimeStatus,
} from "./maiaRuntimeTypes";

const ALLOWED_SKILLS: MaiaSkillLevel[] = [
  "maia-1100",
  "maia-1200",
  "maia-1300",
  "maia-1400",
  "maia-1500",
  "maia-1600",
  "maia-1700",
  "maia-1800",
  "maia-1900",
];

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
}

function parseIntBounded(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number(value ?? "");
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function parseSkill(value: string | undefined): MaiaSkillLevel {
  const candidate = String(value ?? "maia-1500")
    .trim()
    .toLowerCase() as MaiaSkillLevel;
  return ALLOWED_SKILLS.includes(candidate) ? candidate : "maia-1500";
}

export function readMaiaRuntimeConfig(): MaiaRuntimeConfig {
  const enabled = parseBool(process.env.MAIA_ENABLED, false);
  const lc0Path = process.env.MAIA_LC0_PATH?.trim() || null;
  const weightsPath = process.env.MAIA_WEIGHTS_PATH?.trim() || null;
  const skillLevel = parseSkill(process.env.MAIA_SKILL_LEVEL);
  const timeoutMs = parseIntBounded(
    process.env.MAIA_TIMEOUT_MS,
    1500,
    250,
    5000,
  );
  const nodes = parseIntBounded(process.env.MAIA_NODES, 1, 1, 128);
  const maxConcurrentRequests = parseIntBounded(
    process.env.MAIA_MAX_CONCURRENT_REQUESTS,
    2,
    1,
    8,
  );
  const cacheEnabled = parseBool(process.env.MAIA_CACHE_ENABLED, true);
  const backend = process.env.MAIA_BACKEND?.trim() || null;
  const remoteUrl = process.env.MAIA_REMOTE_URL?.trim() || null;
  const remoteHealthUrl = process.env.MAIA_REMOTE_HEALTH_URL?.trim() || null;
  const remoteToken = process.env.MAIA_REMOTE_TOKEN?.trim() || null;
  const transport =
    remoteUrl || process.env.NODE_ENV === "production" ? "remote" : "local";

  return {
    enabled,
    lc0Path,
    weightsPath,
    skillLevel,
    timeoutMs,
    nodes,
    backend,
    maxConcurrentRequests,
    cacheEnabled,
    transport,
    remoteUrl,
    remoteHealthUrl,
    remoteToken,
  };
}

function isSecureRemoteUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function evaluateMaiaRuntimeConfig(config: MaiaRuntimeConfig): {
  status: MaiaRuntimeStatus;
  errorReason: string | null;
} {
  if (!config.enabled) return { status: "disabled", errorReason: "disabled" };
  if (config.transport === "remote") {
    if (!config.remoteUrl)
      return {
        status: "missing_remote_url",
        errorReason: "missing_remote_url",
      };
    if (!isSecureRemoteUrl(config.remoteUrl))
      return {
        status: "insecure_remote_url",
        errorReason: "insecure_remote_url",
      };
    if (!config.remoteToken)
      return {
        status: "missing_remote_token",
        errorReason: "missing_remote_token",
      };
    return { status: "ready", errorReason: null };
  }
  if (!config.lc0Path)
    return { status: "missing_lc0_path", errorReason: "missing_lc0_path" };
  if (!config.weightsPath)
    return {
      status: "missing_weights_path",
      errorReason: "missing_weights_path",
    };
  if (!existsSync(config.lc0Path))
    return { status: "lc0_not_found", errorReason: "lc0_not_found" };
  if (!existsSync(config.weightsPath))
    return { status: "weights_not_found", errorReason: "weights_not_found" };
  return { status: "ready", errorReason: null };
}

export function buildMaiaRuntimeHealth(
  config: MaiaRuntimeConfig,
  input?: { status?: MaiaRuntimeStatus; lastError?: string | null },
): MaiaRuntimeHealth {
  const evaluated = evaluateMaiaRuntimeConfig(config);
  const status = input?.status ?? evaluated.status;
  const remote = config.transport === "remote";
  const lc0Configured = !remote && Boolean(config.lc0Path);
  const weightsConfigured = !remote && Boolean(config.weightsPath);
  const lc0Exists = Boolean(config.lc0Path && existsSync(config.lc0Path));
  const weightsExists = Boolean(
    config.weightsPath && existsSync(config.weightsPath),
  );
  return {
    status,
    ready: status === "ready",
    providerName: remote ? "maia-remote-runtime" : "maia-lc0-runtime",
    providerVersion: "14B",
    enabled: config.enabled,
    configured: remote
      ? Boolean(config.remoteUrl && config.remoteToken)
      : lc0Configured && weightsConfigured,
    lc0Configured,
    weightsConfigured,
    lc0Exists,
    cacheEnabled: config.cacheEnabled,
    maxConcurrentRequests: config.maxConcurrentRequests,
    lc0Path: config.lc0Path,
    weightsPath: config.weightsPath,
    weightsExists,
    timeoutMs: config.timeoutMs,
    nodes: config.nodes,
    transport: remote ? "remote" : "local",
    remoteConfigured: Boolean(config.remoteUrl && config.remoteToken),
    lastError: input?.lastError ?? evaluated.errorReason,
    checkedAt: Date.now(),
  };
}

export function getRedactedMaiaRuntimeSummary(
  config: MaiaRuntimeConfig,
  health: MaiaRuntimeHealth,
): Record<string, unknown> {
  return {
    enabled: config.enabled,
    configured: health.configured,
    status: health.status,
    ready: health.ready,
    providerName: health.providerName,
    providerVersion: health.providerVersion,
    skillLevel: config.skillLevel,
    timeoutMs: config.timeoutMs,
    nodes: config.nodes,
    lc0Configured: health.lc0Configured,
    weightsConfigured: health.weightsConfigured,
    lc0Exists: health.lc0Exists,
    weightsExists: health.weightsExists,
    cacheEnabled: config.cacheEnabled,
    maxConcurrentRequests: config.maxConcurrentRequests,
    transport: health.transport,
    remoteConfigured: health.remoteConfigured,
    lastError: health.lastError,
    checkedAt: health.checkedAt,
  };
}
