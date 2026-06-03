import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CoachSafetyIssue } from "./types";

function hasCode(issues: CoachSafetyIssue[], codes: string[]): boolean {
  return issues.some((issue) => codes.includes(issue.code));
}

export function buildSafeFallbackCompiledFrame(input: {
  frame: CurrentInstructionFrame;
  compiled: CompiledCoachFrame;
  issues: CoachSafetyIssue[];
}): CompiledCoachFrame {
  const issueCodes = input.issues.map((issue) => issue.code);
  const targetInvalid = hasCode(input.issues, [
    "target_mismatch",
    "compiler_target_mismatch",
    "graph_target_mismatch",
    "piece_mismatch",
    "null_target_move_coaching",
  ]);
  const nullViolation = hasCode(input.issues, ["null_target_visual", "null_target_reveal", "null_target_move_coaching"]);
  const hasCritical = input.issues.some((issue) => issue.severity === "critical");
  const revealValid = !hasCritical
    && !hasCode(input.issues, ["reveal_mismatch", "null_target_reveal"])
    && input.frame.target
    && input.compiled.revealAction.kind === "reveal_target"
    && input.compiled.revealAction.targetUci === input.frame.target.uci;

  const keepTarget = Boolean(input.frame.target) && !targetInvalid;

  return {
    ...input.compiled,
    targetUci: keepTarget ? input.compiled.targetUci : null,
    targetSan: keepTarget ? input.compiled.targetSan : null,
    pieceType: keepTarget ? input.compiled.pieceType : null,
    from: keepTarget ? input.compiled.from : null,
    to: keepTarget ? input.compiled.to : null,
    plain: {
      title: "Safety Fallback",
      body: "Think about the safest improving move here.",
      bullets: ["Detailed coaching was blocked for safety."],
      evidenceClaimIds: [],
      leakRisk: "none",
    },
    assisted: keepTarget
      ? {
          title: "Safety Blocked",
          body: "A legal teaching move is available, but the detailed explanation was blocked for safety.",
          bullets: [],
          evidenceClaimIds: [],
          leakRisk: "low",
        }
      : {
          title: "Safety Blocked",
          body: "No move-specific coaching is available in this frame.",
          bullets: [],
          evidenceClaimIds: [],
          leakRisk: "none",
        },
    showMore: {
      title: "Safety Blocked",
      body: keepTarget
        ? "Additional explanation was suppressed to protect target and evidence invariants."
        : "No additional move-specific explanation is available.",
      bullets: [],
      evidenceClaimIds: [],
      leakRisk: "none",
    },
    visualIntents: hasCritical || targetInvalid || nullViolation ? [] : input.compiled.visualIntents,
    revealAction: revealValid
      ? input.compiled.revealAction
      : {
          kind: "none",
          label: "No reveal",
          targetUci: null,
          targetSan: null,
        },
    safetyPrecheck: {
      criticalIssues: [...new Set([...input.compiled.safetyPrecheck.criticalIssues, ...issueCodes])],
      warnings: [...new Set(input.compiled.safetyPrecheck.warnings)],
    },
    debug: {
      ...input.compiled.debug,
      suppressedConceptIds: [...new Set([...(input.compiled.debug.suppressedConceptIds ?? []), ...issueCodes])],
      slotKeys: [...new Set(input.compiled.debug.slotKeys ?? [])],
    },
  };
}
