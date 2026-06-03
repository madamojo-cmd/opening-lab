import type { EvidenceGraph } from "../brain/types";
import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CoachSafetyIssue } from "./types";

const PROVIDER_SOURCES = new Set(["stockfish", "maia", "opening_knowledge"]);

export function validateProviderAuthority(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  compiled: CompiledCoachFrame;
}): CoachSafetyIssue[] {
  const issues: CoachSafetyIssue[] = [];
  const frameTarget = input.frame.target?.uci ?? null;

  for (const claim of input.graph.claims) {
    const providerTagged = claim.provenance.some((prov) => PROVIDER_SOURCES.has(prov.source));
    if (!providerTagged) continue;

    if (frameTarget && claim.targetUci && claim.targetUci !== frameTarget) {
      issues.push({
        code: "provider_authority_violation",
        severity: "critical",
        message: "Provider evidence implies a different target than frame authority.",
        surface: "provider",
        expected: frameTarget,
        actual: claim.targetUci,
      });
    }
  }

  const provenanceText = `${input.compiled.provenance.compilerVersion} ${input.compiled.provenance.frameKey}`.toLowerCase();
  if (/provider_target|stockfish_target|maia_target|opening_target/.test(provenanceText)) {
    issues.push({
      code: "provider_authority_violation",
      severity: "critical",
      message: "Compiled provenance indicates provider target ownership.",
      surface: "provider",
    });
  }

  return issues;
}
