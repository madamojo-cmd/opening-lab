export const DEFAULT_PROJECTIVE_TACTIC_DURATION_MS = 5000;
export const DEFAULT_PROJECTIVE_TACTIC_FADE_MS = 600;
export const PROJECTIVE_TACTIC_MIN_VISIBILITY_BEFORE_REPLY_MS = 1200;

export function shouldClearProjectiveTacticsOnViewMode(viewMode: string): boolean {
  return viewMode !== "assisted";
}

export function nextProjectiveTacticToken(current: number): number {
  return Number.isFinite(current) ? current + 1 : 1;
}

export function isStaleProjectiveTacticToken(active: number, token: number): boolean {
  return active !== token;
}

export function shouldClearProjectiveTacticsForBoardReset(reason: string): boolean {
  return [
    "reset",
    "restart",
    "opening_switch",
    "rating_band_switch",
    "view_mode_switch",
    "plain_view",
    "continuation_enter",
    "continuation_leave",
    "unmount",
    "feature_disabled",
  ].includes(reason);
}
