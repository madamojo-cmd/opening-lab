import assert from "node:assert/strict";
import { getBranchTransitionIntent, isBranchTransitionActionSurface, resolveCoachActionStyle } from "../coachActionStylePolicy";
import type { VisibleCoachAction } from "../visibleActionPolicy";

export function testCoachActionStylePolicy(): void {
  const branchActions: VisibleCoachAction[] = ["continue_from_here", "restart_line"];

  const startTrainingSurface = isBranchTransitionActionSurface({
    title: "Pick a line",
    coachIntent: "",
    visibleActions: ["hint"],
  });
  assert.equal(startTrainingSurface, false, "start/opening actions must not be treated as branch transition");
  assert.equal(resolveCoachActionStyle("hint", startTrainingSurface), "default");

  const branchByTitle = isBranchTransitionActionSurface({
    title: "Line complete",
    coachIntent: "",
    visibleActions: branchActions,
  });
  assert.equal(branchByTitle, true, "Line complete title must enable branch transition style");
  assert.equal(resolveCoachActionStyle("continue_from_here", branchByTitle), "branch_continue");
  assert.equal(resolveCoachActionStyle("restart_line", branchByTitle), "branch_restart");

  const branchByIntent = isBranchTransitionActionSurface({
    title: "Position context",
    coachIntent: "continuation_pause",
    visibleActions: branchActions,
  });
  assert.equal(branchByIntent, true, "continuation_pause intent must enable branch transition style");

  const normalTeachingSurface = isBranchTransitionActionSurface({
    title: "Position context",
    coachIntent: "",
    visibleActions: ["hint", "show_more"],
  });
  assert.equal(normalTeachingSurface, false, "normal teaching actions must not use branch transition styling");
  assert.equal(resolveCoachActionStyle("show_more", normalTeachingSurface), "default");

  const debugIntent = getBranchTransitionIntent({
    mode: "supported_continuation",
    action: "show_reinforcement",
    title: "Line complete",
    body: "",
    buttons: ["continue_from_here", "restart_line"],
    shouldShowCoachCard: true,
    shouldMarkReviewWorthy: false,
    revealRisk: "none",
    givesAnswer: false,
    claimTypes: [],
    debug: { coachIntent: "branch_transition" },
  });
  assert.equal(debugIntent, "branch_transition");
}
