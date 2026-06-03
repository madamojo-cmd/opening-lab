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

const RECOVERABLE_CODES = new Set([
  "claim_without_evidence",
  "unsupported_strong_claim",
]);

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
  const fatalIssues = criticalIssues.filter((issue) => !RECOVERABLE_CODES.has(issue.code));
  const recoverableIssues = issues.filter((issue) => RECOVERABLE_CODES.has(issue.code));
  const result: CoachSafetyResult = {
    allowed: fatalIssues.length === 0,
    issues,
    criticalIssues: fatalIssues,
    blockedReasons: fatalIssues.map((issue) => issue.code),
    fatalReasons: fatalIssues.map((issue) => issue.code),
    recoverableReasons: recoverableIssues.map((issue) => issue.code),
    warningReasons: [
      ...issues.filter((issue) => issue.severity === "warning").map((issue) => issue.code),
      ...recoverableIssues.map((issue) => issue.code),
    ],
  };

  if (result.allowed && recoverableIssues.length === 0) {
    return {
      result,
      safeFrame: input.compiled,
      originalFrameBlocked: false,
    };
  }

  if (result.allowed && recoverableIssues.length > 0) {
    return {
      result,
      safeFrame: buildSafeFallbackCompiledFrame({
        frame: input.frame,
        compiled: input.compiled,
        issues: recoverableIssues,
      }),
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
