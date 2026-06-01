export function shouldSuppressRepeatedGeneric(input: { body: string; recentBodies: string[] }): boolean {
  const normalized = input.body.toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized) return false;
  return input.recentBodies.slice(-3).map((body) => body.toLowerCase().replace(/\s+/g, " ").trim()).includes(normalized);
}
