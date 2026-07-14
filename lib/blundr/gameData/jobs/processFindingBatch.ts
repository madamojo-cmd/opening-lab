import "server-only";
import type { ExtractedFinding } from "../gameDataTypes";

export type FindingBatchResult = {
  accepted: number;
  gated: number;
  deduplicated: number;
};

export function processFindingBatch(
  findings: readonly ExtractedFinding[],
): FindingBatchResult {
  const seen = new Set<string>();
  let gated = 0;
  let accepted = 0;
  for (const finding of findings) {
    if (seen.has(finding.fingerprint)) continue;
    seen.add(finding.fingerprint);
    if (finding.status === "active") accepted += 1;
    else gated += 1;
  }
  return { accepted, gated, deduplicated: findings.length - seen.size };
}
