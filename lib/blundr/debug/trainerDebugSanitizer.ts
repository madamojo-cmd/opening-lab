export function sanitizeForDebugJson(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "function") return "[function]";
  if (typeof value === "bigint") return value.toString();
  if (typeof value !== "object") return value;
  if (seen.has(value as object)) return "[cyclic]";
  seen.add(value as object);
  if (Array.isArray(value)) return value.map((entry) => sanitizeForDebugJson(entry, seen));
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    out[key] = sanitizeForDebugJson(entry, seen);
  }
  return out;
}

export function stringifyDebugJson(value: unknown): string {
  return JSON.stringify(sanitizeForDebugJson(value), null, 2);
}
