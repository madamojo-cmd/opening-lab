export type LegacyOverlayLine = {
  from: string;
  to: string;
  kind: "attack" | "defense" | "plan" | "opponent";
  label?: string;
};

export const ENABLE_TACTICAL_VISUALS_V28 = false;

const LEGACY_TACTICAL_LINE_TOKENS = ["queen", "diagonal", "file", "ray", "fork", "pin", "skewer", "mate", "danger", "tactic", "attack"];

export function isLegacyUnsupportedTacticalLine(line: Pick<LegacyOverlayLine, "kind" | "label">): boolean {
  if (ENABLE_TACTICAL_VISUALS_V28) return false;
  if (line.kind === "defense") return true;
  const label = (line.label ?? "").toLowerCase();
  if (line.kind === "attack" && LEGACY_TACTICAL_LINE_TOKENS.some((token) => label.includes(token))) return true;
  return false;
}

export function filterLegacyMainUiLines<T extends LegacyOverlayLine>(lines: T[]): T[] {
  if (ENABLE_TACTICAL_VISUALS_V28) return lines;
  return lines.filter((line) => !isLegacyUnsupportedTacticalLine(line));
}
