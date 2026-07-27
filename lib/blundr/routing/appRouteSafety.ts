const SOURCES = new Set(["homepage", "features", "how-it-works", "pricing", "daily-blundr", "minigames", "affiliate", "direct"]);

export function normalizeMarketingSource(value: unknown): string {
  const source = String(value ?? "").trim();
  return SOURCES.has(source) ? source : "direct";
}

export function normalizeAppNext(value: unknown, fallback = "/onboarding/welcome"): string {
  const path = String(value ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || /[\r\n]/.test(path)) return fallback;
  return path;
}

export function resolveAppAuthNextTarget(
  mode: "login" | "signup",
  value: unknown,
): string {
  return normalizeAppNext(
    value,
    mode === "signup" ? "/onboarding/welcome" : "/",
  );
}
