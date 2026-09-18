import type { EvidenceGraph } from "../brain/types";
import type { ActivatedTeachingConcept } from "../concepts/TeachingConcept";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import { buildCompilerPrecheck } from "./compilerDebug";
import { containsUnsafeStrongClaim, downgradeUnsafeStrongClaim } from "./copyPolicy";
import { buildRevealAction } from "./revealActionBuilder";
import { buildCoachTemplateSlots } from "./slotBuilder";
import { renderTemplate, stripUnsafePlainLeaks } from "./templateRenderer";
import type { CompiledCoachFrame, CompiledCoachTextBlock } from "./types";
import { buildCompiledVisualIntents } from "./visualIntentBuilder";

const COMPILER_VERSION = "v2.8.0-package7-mvp";

function highestConcept(activatedConcepts: ActivatedTeachingConcept[]): ActivatedTeachingConcept | null {
  return activatedConcepts[0] ?? null;
}

function evidenceClaimIdsFromConcepts(activatedConcepts: ActivatedTeachingConcept[]): string[] {
  return [...new Set(activatedConcepts.flatMap((concept) => concept.evidenceClaimIds))];
}

function hasVerifiedSupportForStrongWords(graph: EvidenceGraph, evidenceClaimIds: string[]): boolean {
  const ids = new Set(evidenceClaimIds);
  return graph.claims.some((claim) => ids.has(claim.id) && (claim.strength === "verified" || claim.strength === "template_safe"));
}

function buildPlainBlock(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  activatedConcepts: ActivatedTeachingConcept[];
  evidenceClaimIds: string[];
  slots: ReturnType<typeof buildCoachTemplateSlots>;
}): CompiledCoachTextBlock {
  const topConcept = highestConcept(input.activatedConcepts);

  if (!input.frame.target) {
    if (input.frame.kind === "branch_complete") {
      return {
        title: "Line Complete",
        body: "This line is complete. Continue from here when you are ready.",
        bullets: ["No move is active right now."],
        evidenceClaimIds: [],
        leakRisk: "none",
      };
    }
    if (input.frame.kind === "opponent_replying") {
      return {
        title: "Opponent Move",
        body: "Wait for the opponent reply to finish before selecting your next move.",
        bullets: ["Your move unlocks after the reply finishes."],
        evidenceClaimIds: [],
        leakRisk: "none",
      };
    }
    if (input.frame.kind === "terminal") {
      return {
        title: "Position Complete",
        body: "This position is finished, so there is nothing left to train here.",
        bullets: [],
        evidenceClaimIds: [],
        leakRisk: "none",
      };
    }
    return {
      title: "Safe Fallback",
      body: "No safe hint is available right now. Keep playing or switch lines.",
      bullets: [],
      evidenceClaimIds: [],
      leakRisk: "none",
    };
  }

  const template = topConcept
    ? "Look for a move that supports {conceptLabel} and {moveVerb} without revealing the answer."
    : "Look for the move that improves your position without revealing the answer.";

  const body = stripUnsafePlainLeaks({ text: renderTemplate({ template, slots: input.slots, mode: "plain" }), slots: input.slots });

  return {
    title: "Your Hint",
    body,
    bullets: topConcept ? [`Focus on ${topConcept.concept.family.replace(/_/g, " ")}.`] : ["Use board evidence, not guesswork."],
    evidenceClaimIds: input.evidenceClaimIds,
    leakRisk: "high",
  };
}

function buildAssistedBlock(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  activatedConcepts: ActivatedTeachingConcept[];
  evidenceClaimIds: string[];
  slots: ReturnType<typeof buildCoachTemplateSlots>;
}): CompiledCoachTextBlock {
  if (!input.frame.target) {
    if (String(input.frame.trainingMode) === "continuation") {
      return {
        title: "Finding a continuation",
        body: "Blundr is choosing a training move from this position.",
        bullets: [],
        evidenceClaimIds: [],
        leakRisk: "none",
      };
    }
    if (input.frame.kind === "terminal") {
      return {
        title: "Line complete",
        body: "This continuation ended. Restart the line to train again.",
        bullets: [],
        evidenceClaimIds: [],
        leakRisk: "none",
      };
    }
    return {
      title: "Status",
      body: "A move target is not available for this frame yet.",
      bullets: [],
      evidenceClaimIds: [],
      leakRisk: "none",
    };
  }

  const concept = highestConcept(input.activatedConcepts);
  if (String(input.frame.trainingMode) === "continuation") {
    const san = input.frame.target.san || input.frame.target.uci;
    const piece = String(input.frame.target.pieceType ?? "").toLowerCase();
    const pieceNameByCode: Record<string, string> = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };
    const pieceName = pieceNameByCode[piece] ?? "piece";
    const checkmate = Boolean(input.frame.target.isMate || /#/.test(san));
    const check = !checkmate && Boolean(input.frame.target.isCheck || /\+/.test(san));
    const capture = Boolean(input.frame.target.isCapture || /x/.test(san));
    const suffix = checkmate
      ? " This ends the line with checkmate."
      : check
        ? " This gives check."
        : capture
          ? " This captures material and keeps the position moving."
          : " This develops play and keeps the position moving.";
    return {
      title: `${san} — Continue the position`,
      body: `Play ${san} with the ${pieceName}.${suffix}`,
      bullets: [],
      evidenceClaimIds: input.evidenceClaimIds,
      leakRisk: "low",
    };
  }
  const template = concept
    ? "Play {targetSan} with the {pieceLabel}; it {moveVerb} through {conceptLabel}."
    : "Play {targetSan}; this move {moveVerb}.";

  let body = renderTemplate({ template, slots: input.slots, mode: "assisted" });
  const strongSupported = hasVerifiedSupportForStrongWords(input.graph, input.evidenceClaimIds);
  if (!strongSupported && containsUnsafeStrongClaim(body)) {
    body = downgradeUnsafeStrongClaim(body);
  }

  return {
    title: concept ? concept.concept.label : "Guided Move",
    body,
    bullets: input.graph.claims
      .filter((claim) => input.evidenceClaimIds.includes(claim.id))
      .slice(0, 3)
      .map((claim) => claim.textSafeSummary),
    evidenceClaimIds: input.evidenceClaimIds,
    leakRisk: "low",
  };
}

function buildShowMoreBlock(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  activatedConcepts: ActivatedTeachingConcept[];
  evidenceClaimIds: string[];
  slots: ReturnType<typeof buildCoachTemplateSlots>;
}): CompiledCoachTextBlock {
  if (!input.frame.target) {
    return {
      title: "Details",
      body: "No target-specific detail is available for this frame.",
      bullets: [],
      evidenceClaimIds: [],
      leakRisk: "none",
    };
  }

  const concept = highestConcept(input.activatedConcepts);
  let body = renderTemplate(
    {
      template: concept
        ? "{targetSan} is aligned with {conceptLabel} and supported by board evidence."
        : "{targetSan} is supported by board evidence in this position.",
      slots: input.slots,
      mode: "show_more",
    },
  );

  if (containsUnsafeStrongClaim(body) && !hasVerifiedSupportForStrongWords(input.graph, input.evidenceClaimIds)) {
    body = downgradeUnsafeStrongClaim(body);
  }

  const bullets = input.graph.claims
    .filter((claim) => input.evidenceClaimIds.includes(claim.id))
    .slice(0, 4)
    .map((claim) => claim.textSafeSummary);

  return {
    title: "Show More",
    body,
    bullets,
    evidenceClaimIds: input.evidenceClaimIds,
    leakRisk: "low",
  };
}

export function compileCoachFrame(input: {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  activatedConcepts: ActivatedTeachingConcept[];
  suppressedConceptIds?: string[];
}): CompiledCoachFrame {
  const slots = buildCoachTemplateSlots({
    frame: input.frame,
    graph: input.graph,
    activatedConcepts: input.activatedConcepts,
  });

  const evidenceClaimIds = evidenceClaimIdsFromConcepts(input.activatedConcepts);
  const visualIntents = buildCompiledVisualIntents({
    frame: input.frame,
    graph: input.graph,
    activatedConcepts: input.activatedConcepts,
  });
  const revealAction = buildRevealAction({ frame: input.frame, graph: input.graph });

  const plain = buildPlainBlock({
    frame: input.frame,
    graph: input.graph,
    activatedConcepts: input.activatedConcepts,
    evidenceClaimIds,
    slots,
  });
  const assisted = buildAssistedBlock({
    frame: input.frame,
    graph: input.graph,
    activatedConcepts: input.activatedConcepts,
    evidenceClaimIds,
    slots,
  });
  const showMore = buildShowMoreBlock({
    frame: input.frame,
    graph: input.graph,
    activatedConcepts: input.activatedConcepts,
    evidenceClaimIds,
    slots,
  });

  const precheck = buildCompilerPrecheck({
    frame: input.frame,
    graph: input.graph,
    compiledTargetUci: slots.targetUci,
    visualTargetUcis: visualIntents.map((intent) => intent.targetUci),
    revealTargetUci: revealAction.targetUci,
  });

  return {
    frameKey: input.frame.frameKey,
    targetUci: slots.targetUci,
    targetSan: slots.targetSan,
    pieceType: slots.pieceType,
    from: slots.from,
    to: slots.to,
    plain,
    assisted,
    showMore,
    activatedConceptIds: input.activatedConcepts.map((concept) => concept.conceptId),
    evidenceClaimIds,
    visualIntents,
    revealAction,
    safetyPrecheck: precheck,
    provenance: {
      frameKey: input.frame.frameKey,
      graphTargetUci: input.graph.targetUci,
      compilerVersion: COMPILER_VERSION,
    },
    debug: {
      nullTargetReason: input.frame.target ? undefined : input.frame.kind,
      suppressedConceptIds: input.suppressedConceptIds ?? [],
      slotKeys: Object.keys(slots),
    },
  };
}
