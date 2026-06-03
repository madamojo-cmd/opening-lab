import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { SafetyGateOutput } from "../safety/types";
import type { TeachingSurfaceMode } from "./types";

export function resolveTeachingSurfaceMode(input: {
  requestedMode: "assisted" | "plain";
  showMoreRevealed: boolean;
  frame: CurrentInstructionFrame;
  safetyOutput: SafetyGateOutput;
}): TeachingSurfaceMode {
  if (!input.safetyOutput.result.allowed || input.safetyOutput.originalFrameBlocked) {
    return "blocked";
  }

  if (input.frame.kind === "branch_complete") {
    return "branch_complete";
  }

  if (input.frame.kind === "opponent_replying" || input.frame.kind === "transitioning") {
    return "opponent_replying";
  }

  if (input.frame.kind === "terminal") {
    return "terminal";
  }

  if (input.requestedMode === "assisted") {
    return "assisted";
  }

  return input.showMoreRevealed ? "plain_after_show_more" : "plain_before_show_more";
}

export function surfaceModeAllowsTargetReveal(mode: TeachingSurfaceMode): boolean {
  return mode === "assisted" || mode === "plain_after_show_more";
}

export function surfaceModeAllowsTargetVisuals(mode: TeachingSurfaceMode): boolean {
  return mode === "assisted" || mode === "plain_after_show_more";
}
