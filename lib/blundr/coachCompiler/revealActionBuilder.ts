import type { EvidenceGraph } from "../brain/types";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CompiledRevealAction } from "./types";

export function buildRevealAction(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
}): CompiledRevealAction {
  const frame = input.frame;

  if (frame.target) {
    return {
      kind: "reveal_target",
      label: "Reveal move",
      targetUci: frame.target.uci,
      targetSan: frame.target.san ?? null,
    };
  }

  if (frame.kind === "branch_complete" && frame.branchComplete?.continueFromHereAvailable) {
    return {
      kind: "continue_from_here",
      label: "Continue from here",
      targetUci: null,
      targetSan: null,
    };
  }

  return {
    kind: "none",
    label: "No reveal",
    targetUci: null,
    targetSan: null,
  };
}
