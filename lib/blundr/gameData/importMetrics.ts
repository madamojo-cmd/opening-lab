import type { ImportMetrics } from "./gameDataTypes";

export function addImportMetrics(
  a: ImportMetrics,
  b: Partial<ImportMetrics>,
): ImportMetrics {
  return {
    fetched: a.fetched + (b.fetched ?? 0),
    accepted: a.accepted + (b.accepted ?? 0),
    duplicate: a.duplicate + (b.duplicate ?? 0),
    excluded: a.excluded + (b.excluded ?? 0),
    matched: a.matched + (b.matched ?? 0),
    gated: a.gated + (b.gated ?? 0),
    analyzed: a.analyzed + (b.analyzed ?? 0),
    findings: a.findings + (b.findings ?? 0),
  };
}
