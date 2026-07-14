export function hasDistinctCandidateContrast(
  labels: readonly string[],
): boolean {
  return (
    new Set(labels.map((label) => label.trim().toLowerCase())).size ===
      labels.length && labels.length >= 3
  );
}
