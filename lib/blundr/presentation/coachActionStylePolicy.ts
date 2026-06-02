import type { CoachDecision } from "@/lib/blundr/coach/coachTypes";
import type { VisibleCoachAction } from "./visibleActionPolicy";

export type CoachActionStyle = "default" | "branch_continue" | "branch_restart";

type BranchTransitionSurfaceInput = {
  title?: string | null;
  coachIntent?: string | null;
  visibleActions: VisibleCoachAction[];
};

const BRANCH_ACTION_IDS: VisibleCoachAction[] = ["continue_from_here", "restart_line"];

export function isBranchTransitionActionSurface(input: BranchTransitionSurfaceInput): boolean {
  const title = String(input.title ?? "").trim();
  const coachIntent = String(input.coachIntent ?? "").trim();
  const visibleActions = input.visibleActions;
  const hasExactBranchActions =
    visibleActions.length === 2 &&
    visibleActions[0] === BRANCH_ACTION_IDS[0] &&
    visibleActions[1] === BRANCH_ACTION_IDS[1];
  return (
    title === "Line complete" ||
    coachIntent === "branch_transition" ||
    coachIntent === "continuation_pause" ||
    hasExactBranchActions
  );
}

export function resolveCoachActionStyle(action: VisibleCoachAction, isBranchTransitionSurface: boolean): CoachActionStyle {
  if (!isBranchTransitionSurface) return "default";
  if (action === "continue_from_here") return "branch_continue";
  if (action === "restart_line") return "branch_restart";
  return "default";
}

export function getBranchTransitionIntent(decision: CoachDecision): string {
  const debug = (decision.debug ?? {}) as Record<string, unknown>;
  const debugIntent = debug.coachIntent;
  return typeof debugIntent === "string" ? debugIntent : "";
}
