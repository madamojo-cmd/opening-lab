import type { ProjectiveTacticVisual } from "./projectiveTacticTypes";

export const DEFAULT_PROJECTIVE_TACTIC_DURATION_MS = 10000;
export const DEFAULT_PROJECTIVE_TACTIC_FADE_MS = 600;
export const PROJECTIVE_TACTIC_MIN_VISIBILITY_BEFORE_REPLY_MS = 1200;
export const PROJECTIVE_TACTIC_NEXT_VISUALS_ALLOWED_AFTER_MS = 7000;

export type ProjectiveTacticSeenState = {
  activeKeys: Set<string>;
};

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

export function shouldSuppressProjectiveTacticsForCheckmate(input: { isCheckmate: boolean }): boolean {
  return input.isCheckmate === true;
}

function sortedTargetKey(visual: ProjectiveTacticVisual): string {
  return [...visual.targetPieces]
    .map((target) => `${target.square}:${target.color}:${target.piece}`)
    .sort()
    .join(",");
}

function pinRelationshipKey(visual: ProjectiveTacticVisual): string {
  const pinned = visual.targetPieces[0];
  const backTarget = visual.targetPieces[1];
  const secondSegment = visual.lineSegments[1];
  return [
    visual.kind,
    visual.owner,
    visual.sourcePiece,
    pinned ? `${pinned.square}:${pinned.color}:${pinned.piece}` : "no-pinned-piece",
    backTarget ? `${backTarget.square}:${backTarget.color}:${backTarget.piece}` : "no-back-target",
    secondSegment ? `${secondSegment.from}>${secondSegment.to}` : "no-ray",
  ].join("|");
}

export function buildProjectiveTacticIdentityKey(visual: ProjectiveTacticVisual): string {
  if (visual.kind === "pin") return pinRelationshipKey(visual);
  return [
    visual.kind,
    visual.owner,
    visual.sourcePiece,
    sortedTargetKey(visual),
  ].join("|");
}

export function filterNewProjectiveTactics(input: {
  visuals: ProjectiveTacticVisual[];
  seenKeys: ReadonlySet<string>;
}): {
  newVisuals: ProjectiveTacticVisual[];
  nextSeenKeys: Set<string>;
} {
  const nextSeenKeys = new Set(input.visuals.map((visual) => buildProjectiveTacticIdentityKey(visual)));
  return {
    newVisuals: input.visuals.filter((visual) => !input.seenKeys.has(buildProjectiveTacticIdentityKey(visual))),
    nextSeenKeys,
  };
}
