import type { EvidenceGraph } from "../brain/types";
import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CoachSafetyIssue } from "./types";

function containsToken(text: string, token: string | null | undefined): boolean {
  const value = String(token ?? "").trim();
  if (!value) return false;
  return text.toLowerCase().includes(value.toLowerCase());
}

export function validateTargetInvariants(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  compiled: CompiledCoachFrame;
}): CoachSafetyIssue[] {
  const issues: CoachSafetyIssue[] = [];
  const frameTarget = input.frame.target;
  const frameTargetUci = frameTarget?.uci ?? null;

  if (frameTargetUci && input.graph.targetUci !== frameTargetUci) {
    issues.push({
      code: "graph_target_mismatch",
      severity: "critical",
      message: "Graph target does not match frame target.",
      surface: "graph",
      expected: frameTargetUci,
      actual: input.graph.targetUci,
    });
  }

  if (frameTargetUci !== input.compiled.targetUci) {
    issues.push({
      code: "compiler_target_mismatch",
      severity: "critical",
      message: "Compiled target does not match frame target.",
      surface: "compiled",
      expected: frameTargetUci,
      actual: input.compiled.targetUci,
    });
  }

  if (frameTarget) {
    if (input.compiled.from !== frameTarget.from || input.compiled.to !== frameTarget.to) {
      issues.push({
        code: "target_mismatch",
        severity: "critical",
        message: "Compiled from/to does not match frame target squares.",
        surface: "compiled",
        expected: `${frameTarget.from}-${frameTarget.to}`,
        actual: `${input.compiled.from}-${input.compiled.to}`,
      });
    }

    const framePiece = String(frameTarget.pieceType ?? "").toLowerCase();
    const compiledPiece = String(input.compiled.pieceType ?? "").toLowerCase();
    if (framePiece !== compiledPiece) {
      issues.push({
        code: "piece_mismatch",
        severity: "critical",
        message: "Compiled piece type does not match frame target piece.",
        surface: "compiled",
        expected: framePiece,
        actual: compiledPiece,
      });
    }

    for (const intent of input.compiled.visualIntents) {
      if (intent.targetUci !== frameTargetUci) {
        issues.push({
          code: "visual_mismatch",
          severity: "critical",
          message: "Visual intent target does not match frame target.",
          surface: "visual",
          expected: frameTargetUci,
          actual: intent.targetUci,
        });
      }
    }

    if (input.compiled.revealAction.kind === "reveal_target" && input.compiled.revealAction.targetUci !== frameTargetUci) {
      issues.push({
        code: "reveal_mismatch",
        severity: "critical",
        message: "Reveal target does not match frame target.",
        surface: "reveal",
        expected: frameTargetUci,
        actual: input.compiled.revealAction.targetUci,
      });
    }

    const assistedText = `${input.compiled.assisted.title} ${input.compiled.assisted.body}`.toLowerCase();
    const showMoreText = `${input.compiled.showMore.title} ${input.compiled.showMore.body}`.toLowerCase();
    const assistedHasTarget = containsToken(assistedText, input.compiled.targetSan) || containsToken(assistedText, input.compiled.targetUci);
    const showMoreHasTarget = containsToken(showMoreText, input.compiled.targetSan) || containsToken(showMoreText, input.compiled.targetUci);

    if (assistedHasTarget !== showMoreHasTarget) {
      issues.push({
        code: "assisted_show_more_mismatch",
        severity: "critical",
        message: "Assisted and Show More target references are not aligned.",
        surface: "show_more",
      });
    }
  } else if (input.compiled.targetUci !== null) {
    issues.push({
      code: "target_mismatch",
      severity: "critical",
      message: "Null-target frame contains compiled target.",
      surface: "compiled",
      expected: null,
      actual: input.compiled.targetUci,
    });
  }

  return issues;
}
