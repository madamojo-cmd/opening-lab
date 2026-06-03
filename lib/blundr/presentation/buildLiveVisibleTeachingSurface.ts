import { buildEvidenceGraph } from "../brain/buildEvidenceGraph";
import { compileCoachFrame } from "../coachCompiler/compileCoachFrame";
import { activateTeachingConcepts } from "../concepts/dynamicConceptActivator";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import { runCoachSafetyGate } from "../safety/coachSafetyGate";
import { buildVisibleTeachingSurface } from "./buildVisibleTeachingSurface";
import type { VisibleTeachingSurface } from "./types";

export function buildLiveVisibleTeachingSurface(input: {
  frame: CurrentInstructionFrame;
  requestedMode: "assisted" | "plain";
  showMoreRevealed: boolean;
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
}): VisibleTeachingSurface {
  const graph = buildEvidenceGraph({
    frame: input.frame,
    moveSequence: input.moveSequence,
    openingKey: input.openingKey,
    openingName: input.openingName,
    lineKey: input.lineKey,
    lineName: input.lineName,
    expectedMoveReason: input.expectedMoveReason,
    themeTags: input.themeTags,
    branchComplete: input.branchComplete,
    endOfBook: input.endOfBook,
    continuationEligible: input.continuationEligible,
  });

  const conceptMode = input.requestedMode === "plain"
    ? (input.showMoreRevealed ? "show_more" : "plain")
    : "assisted";

  const concepts = activateTeachingConcepts({
    graph,
    mode: conceptMode,
    maxConcepts: 20,
  });

  const compiled = compileCoachFrame({
    frame: input.frame,
    graph,
    activatedConcepts: concepts.activated,
    suppressedConceptIds: concepts.suppressed.map((entry) => entry.conceptId),
  });

  const safetyOutput = runCoachSafetyGate({
    frame: input.frame,
    graph,
    compiled,
    activatedConcepts: concepts.activated,
  });

  return buildVisibleTeachingSurface({
    frame: input.frame,
    graph,
    safetyOutput,
    requestedMode: input.requestedMode,
    showMoreRevealed: input.showMoreRevealed,
  });
}
