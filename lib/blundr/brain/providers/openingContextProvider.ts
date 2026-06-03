import type { CurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
import type { OpeningContext } from "../types";

export function buildOpeningContext(input: {
  frame: CurrentInstructionFrame;
  moveSequence?: string[];
  openingKey?: string;
  openingName?: string;
  lineKey?: string;
  lineName?: string;
  expectedMoveReason?: string;
  themeTags?: string[];
  branchComplete?: boolean;
  endOfBook?: boolean;
  continuationEligible?: boolean;
}): OpeningContext {
  return {
    openingKey: input.openingKey ?? null,
    openingName: input.openingName ?? null,
    lineKey: input.lineKey ?? null,
    lineName: input.lineName ?? null,
    moveNumber: Math.max(1, Math.floor(input.frame.ply / 2) + 1),
    expectedMoveReason: input.expectedMoveReason ?? null,
    themeTags: [...(input.themeTags ?? [])],
    previousConcepts: [],
    branchComplete: Boolean(input.branchComplete),
    endOfBook: Boolean(input.endOfBook),
    continuationEligible: Boolean(input.continuationEligible),
    moveSequence: [...(input.moveSequence ?? [])],
  };
}
