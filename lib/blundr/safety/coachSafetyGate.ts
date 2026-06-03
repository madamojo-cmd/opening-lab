import type { EvidenceGraph } from "../brain/types";
import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import { buildSafeFallbackCompiledFrame } from "./safeFallbackFrame";
import { detectPlainLeaks } from "./plainLeakPolicy";
import { validateProviderAuthority } from "./providerAuthorityPolicy";
import { validateStrongClaims } from "./strongClaimPolicy";
import { validateTargetInvariants } from "./targetInvariantPolicy";
import { validateNullTargetFrame } from "./nullTargetPolicy";
import type { CoachSafetyResult, SafetyGateOutput } from "./types";

export function runCoachSafetyGate(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  compiled: CompiledCoachFrame;
  activatedConcepts?: ActivatedTeachingConcept[];
}): SafetyGateOutput {
  const issues = [
    ...validateTargetInvariants({ frame: input.frame, graph: input.graph, compiled: input.compiled }),
    ...detectPlainLeaks({ frame: input.frame, compiled: input.compiled }),
    ...validateStrongClaims({ graph: input.graph, compiled: input.compiled, activatedConcepts: input.activatedConcepts }),
    ...validateNullTargetFrame({ frame: input.frame, compiled: input.compiled }),
    ...validateProviderAuthority({ frame: input.frame, graph: input.graph, compiled: input.compiled }),
  ];

  const criticalIssues = issues.filter((issue) => issue.severity === "critical");
  const result: CoachSafetyResult = {
    allowed: criticalIssues.length === 0,
    issues,
    criticalIssues,
    blockedReasons: criticalIssues.map((issue) => issue.code),
    warningReasons: issues.filter((issue) => issue.severity === "warning").map((issue) => issue.code),
  };

  if (result.allowed) {
    return {
      result,
      safeFrame: input.compiled,
      originalFrameBlocked: false,
    };
  }

  return {
    result,
    safeFrame: buildSafeFallbackCompiledFrame({
      frame: input.frame,
      compiled: input.compiled,
      issues,
    }),
    originalFrameBlocked: true,
  };
}
