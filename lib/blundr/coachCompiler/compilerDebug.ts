import type { EvidenceGraph } from "../brain/types";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";

const PLAIN_LEAK_TOKENS = ["{targetsan}", "{targetuci}", "{from}", "{to}"];

export function buildCompilerPrecheck(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  compiledTargetUci: string | null;
  visualTargetUcis: Array<string | null>;
  revealTargetUci: string | null;
}): {
  criticalIssues: string[];
  warnings: string[];
} {
  const criticalIssues: string[] = [];
  const warnings: string[] = [];

  const frameTarget = input.frame.target?.uci ?? null;
  const graphTarget = input.graph.targetUci;

  if (frameTarget !== graphTarget) {
    criticalIssues.push(`frame/graph target mismatch: frame=${frameTarget ?? "null"}, graph=${graphTarget ?? "null"}`);
  }

  if (frameTarget !== input.compiledTargetUci) {
    criticalIssues.push(`frame/compiled target mismatch: frame=${frameTarget ?? "null"}, compiled=${input.compiledTargetUci ?? "null"}`);
  }

  if (input.visualTargetUcis.some((uci) => uci !== frameTarget)) {
    criticalIssues.push("visual target mismatch against frame target");
  }

  if (input.revealTargetUci !== frameTarget && !(input.revealTargetUci === null && frameTarget === null)) {
    criticalIssues.push("reveal target mismatch against frame target");
  }

  if (!frameTarget) {
    if (input.visualTargetUcis.some((uci) => uci !== null)) {
      criticalIssues.push("null-target frame contains target-specific visual intent");
    }
    if (input.revealTargetUci !== null) {
      criticalIssues.push("null-target frame contains target reveal");
    }
  }

  const plainTextBlob = [
    input.frame.target?.san,
    input.frame.target?.uci,
    input.frame.target?.from,
    input.frame.target?.to,
  ]
    .map((v) => String(v ?? "").toLowerCase())
    .filter(Boolean);
  if (plainTextBlob.some((token) => PLAIN_LEAK_TOKENS.includes(token))) {
    warnings.push("plain leak suspected");
  }

  return { criticalIssues, warnings };
}
