import type { EvidenceGraph } from "../brain/types";
import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CompiledCoachVisualIntent } from "./types";

function intent(
  id: string,
  type: CompiledCoachVisualIntent["type"],
  input: {
    frame: CurrentInstructionFrame;
    evidenceClaimIds: string[];
    leakRisk?: CompiledCoachVisualIntent["leakRisk"];
    squares?: string[];
  },
): CompiledCoachVisualIntent {
  return {
    id,
    type,
    targetUci: input.frame.target?.uci ?? null,
    from: input.frame.target?.from ?? null,
    to: input.frame.target?.to ?? null,
    squares: input.squares,
    evidenceClaimIds: input.evidenceClaimIds,
    displayModes: ["assisted", "show_more"],
    leakRisk: input.leakRisk ?? "low",
  };
}

export function buildCompiledVisualIntents(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  activatedConcepts: ActivatedTeachingConcept[];
}): CompiledCoachVisualIntent[] {
  if (!input.frame.target) return [];

  const claims = input.graph.claims.filter((claim) => claim.targetUci === input.frame.target?.uci);
  const claimIds = claims.map((claim) => claim.id);
  const intents: CompiledCoachVisualIntent[] = [
    intent("visual:move_arrow", "move_arrow", { frame: input.frame, evidenceClaimIds: claimIds, leakRisk: "none" }),
    intent("visual:source_highlight", "source_highlight", { frame: input.frame, evidenceClaimIds: claimIds, leakRisk: "none", squares: [input.frame.target.from] }),
    intent("visual:destination_highlight", "destination_highlight", { frame: input.frame, evidenceClaimIds: claimIds, leakRisk: "none", squares: [input.frame.target.to] }),
  ];

  const pressureIds = claims.filter((claim) => claim.type === "pressure" || claim.machineFacts?.centerPressure === true || claim.machineFacts?.diagonal === true).map((claim) => claim.id);
  if (pressureIds.length > 0) {
    intents.push(intent("visual:pressure_arrow", "pressure_arrow", { frame: input.frame, evidenceClaimIds: pressureIds, leakRisk: "low" }));
  }

  const kingSafetyIds = claims.filter((claim) => claim.type === "castling" || claim.type === "king_safety").map((claim) => claim.id);
  if (kingSafetyIds.length > 0) {
    intents.push(intent("visual:king_safety_aura", "king_safety_aura", { frame: input.frame, evidenceClaimIds: kingSafetyIds, leakRisk: "low" }));
  }

  const pawnBreakIds = claims.filter((claim) => claim.type === "pawn_break").map((claim) => claim.id);
  if (pawnBreakIds.length > 0) {
    intents.push(intent("visual:pawn_break_marker", "pawn_break_marker", { frame: input.frame, evidenceClaimIds: pawnBreakIds, leakRisk: "low" }));
  }

  const conceptIds = input.activatedConcepts.flatMap((concept) => concept.evidenceClaimIds);
  if (conceptIds.length > 0) {
    intents.push(intent("visual:concept_square_highlight", "concept_square_highlight", {
      frame: input.frame,
      evidenceClaimIds: conceptIds,
      squares: [input.frame.target.from, input.frame.target.to],
      leakRisk: "medium",
    }));
  }

  return intents;
}
