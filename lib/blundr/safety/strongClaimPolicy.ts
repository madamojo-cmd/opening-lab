import type { EvidenceGraph } from "../brain/types";
import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
import type { CoachSafetyIssue } from "./types";

const STRONG_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "best", pattern: /\bbest\b/i },
  { name: "strongest", pattern: /\bstrongest\b/i },
  { name: "only move", pattern: /\bonly move\b/i },
  { name: "forced", pattern: /\bforced\b/i },
  { name: "forcing", pattern: /\bforcing\b/i },
  { name: "wins", pattern: /\bwins\b/i },
  { name: "winning", pattern: /\bwinning\b/i },
  { name: "wins material", pattern: /\bwins material\b/i },
  { name: "mate", pattern: /\bmate\b/i },
  { name: "checkmate", pattern: /\bcheckmate\b/i },
  { name: "refutes", pattern: /\brefutes\b/i },
  { name: "trap", pattern: /\btrap\b/i },
  { name: "blunder", pattern: /\bblunder\b/i },
  { name: "decisive", pattern: /\bdecisive\b/i },
  { name: "engine-approved", pattern: /\bengine-approved\b/i },
  { name: "Stockfish says", pattern: /\bstockfish says\b/i },
];

function hasEngineEvidence(graph: EvidenceGraph): boolean {
  return graph.claims.some((claim) => claim.provenance.some((p) => p.source === "stockfish" || p.source === "maia"));
}

function hasVerified(graph: EvidenceGraph, predicate: (claim: EvidenceGraph["claims"][number]) => boolean): boolean {
  return graph.claims.some((claim) => (claim.strength === "verified" || claim.strength === "template_safe") && predicate(claim));
}

export function validateStrongClaims(input: {
  graph: EvidenceGraph;
  compiled: CompiledCoachFrame;
  activatedConcepts?: ActivatedTeachingConcept[];
}): CoachSafetyIssue[] {
  const issues: CoachSafetyIssue[] = [];
  const text = `${input.compiled.plain.title} ${input.compiled.plain.body} ${input.compiled.assisted.title} ${input.compiled.assisted.body} ${input.compiled.showMore.title} ${input.compiled.showMore.body}`;

  for (const entry of STRONG_PATTERNS) {
    if (!entry.pattern.test(text)) continue;

    const needsEngine = ["best", "strongest", "engine-approved", "Stockfish says"].includes(entry.name);
    const needsMateProof = ["mate", "checkmate"].includes(entry.name);
    const needsMaterial = ["wins", "winning", "wins material", "decisive"].includes(entry.name);
    const needsForced = ["only move", "forced", "forcing"].includes(entry.name);

    let supported = hasVerified(input.graph, () => true);

    if (needsEngine) {
      supported = hasEngineEvidence(input.graph);
    }
    if (needsMateProof) {
      supported = input.graph.boardTruth.isCheckmate === true || hasVerified(input.graph, (claim) => claim.type === "checkmate");
    }
    if (needsMaterial) {
      supported = hasVerified(input.graph, (claim) => claim.type === "capture" || claim.machineFacts?.materialGain === true);
    }
    if (needsForced) {
      supported = hasVerified(input.graph, (claim) => claim.machineFacts?.forcedLine === true || claim.type === "candidate_comparison");
    }

    if (!supported) {
      issues.push({
        code: needsEngine ? "claim_without_evidence" : "unsupported_strong_claim",
        severity: "critical",
        message: `Strong claim '${entry.name}' lacks required verified evidence.`,
        surface: "compiled",
      });
    }
  }

  return issues;
}
