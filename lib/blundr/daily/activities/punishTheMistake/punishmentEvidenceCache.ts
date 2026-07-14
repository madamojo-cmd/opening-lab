import { createDeterministicIdentity } from "@/lib/blundr/contracts";
export function punishmentEvidenceCacheKey(input: {
  positionKey: string;
  mistakeMove: string;
  engineVersion: string;
  depth: number;
  multiPv: number;
}): string {
  return createDeterministicIdentity("punishment-evidence", [
    input.positionKey,
    input.mistakeMove,
    input.engineVersion,
    input.depth,
    input.multiPv,
  ]);
}
