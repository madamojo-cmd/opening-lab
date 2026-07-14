import type { ExtractedFinding } from "./gameDataTypes";

export function dedupeFindings(
  findings: readonly ExtractedFinding[],
): ExtractedFinding[] {
  const map = new Map<string, ExtractedFinding>();
  for (const finding of findings) {
    const previous = map.get(finding.fingerprint);
    if (!previous || finding.confidence > previous.confidence)
      map.set(finding.fingerprint, finding);
  }
  return [...map.values()].sort((a, b) =>
    a.fingerprint.localeCompare(b.fingerprint),
  );
}

export function dedupeGames<
  T extends { providerFingerprint: string | null; fallbackFingerprint: string },
>(games: readonly T[]): T[] {
  const map = new Map<string, T>();
  for (const game of games)
    map.set(game.providerFingerprint ?? game.fallbackFingerprint, game);
  return [...map.values()];
}
