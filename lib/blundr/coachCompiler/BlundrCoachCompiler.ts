/**
 * BlundrCoachCompiler.ts
 * v2.7.42 Deterministic Coach Compiler (Full Implementation)
 *
 * This is the single source that produces all visible coach output.
 * It is strictly bound to CurrentInstructionFrame.target + EvidenceGraph.
 */

import type { EvidenceGraph } from "../brain/buildEvidenceGraph";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import { renderAssistedCoach, renderPlainHint } from "./claimBoundTemplateRenderer";
import { compilePlainHint } from "./plainHintCompiler";
import { compileShowMore } from "./showMoreCompiler";
import { applyCoachSafetyGate } from "../safety/CoachSafetyGate";

export interface CompiledCoachFrame {
  targetUci: string | null;
  targetSan: string | null;
  targetPieceType: string | null;

  assisted: {
    title: string;
    body: string;
  } | null;

  plain: {
    hint: string | null;
  } | null;

  showMore: {
    title: string | null;
    body: string | null;
  } | null;

  visualIntents: any[];
  evidenceUsed: string[];
  isSafe: boolean;
  safetyNotes: string[];
}

export function compileCoachFrame(params: {
  frame: CurrentInstructionFrame;
  evidenceGraph: EvidenceGraph;
  displayMode: "assisted" | "plain";
  showMoreClicked?: boolean;
}): CompiledCoachFrame {

  const { frame, evidenceGraph, displayMode, showMoreClicked = false } = params;
  const target = frame.target;

  if (!target || !evidenceGraph.targetUci) {
    return createSafeNeutralFrame(evidenceGraph);
  }

  // === ASSISTED VIEW (always generated) ===
  const assisted = renderAssistedCoach(
    {
      san: target.san,
      pieceType: target.pieceType,
      uci: target.uci,
    },
    evidenceGraph
  );

  // === PLAIN VIEW ===
  const plainResult = compilePlainHint(evidenceGraph, showMoreClicked);

  // === SHOW MORE (must equal Assisted when clicked) ===
  const showMoreResult = compileShowMore(
    {
      san: target.san,
      pieceType: target.pieceType,
      uci: target.uci,
    },
    evidenceGraph,
    showMoreClicked
  );

  // Apply hard Safety Gate
  const safetyInput = {
    frameKind: (frame as any).kind || "guided",
    instructionTargetUci: target?.uci ?? null,
    instructionTargetPieceType: target?.pieceType ?? null,
    compiledCoach: {
      targetUci: target.uci,
      targetPieceType: target.pieceType,
      coachMoveUci: target.uci,
      coachPieceType: target.pieceType,
      visualMoveUci: target.uci,
      showMoreTargetUci: target.uci,
      assisted: { title: assisted.title, body: assisted.body },
      plain: { hint: plainResult.hint },
      showMore: { title: showMoreResult.title, body: showMoreResult.body },
      visualIntents: [],
    },
    evidenceClaimIds: evidenceGraph.evidenceClaimIds,
    displayMode,
    showMoreClicked,
  };

  const safetyResult = applyCoachSafetyGate(safetyInput as any);

  return {
    targetUci: target.uci,
    targetSan: target.san,
    targetPieceType: target.pieceType,
    assisted: { title: assisted.title, body: assisted.body },
    plain: { hint: plainResult.hint },
    showMore: { title: showMoreResult.title, body: showMoreResult.body },
    visualIntents: [],
    evidenceUsed: evidenceGraph.evidenceClaimIds,
    isSafe: safetyResult.isSafe,
    safetyNotes: safetyResult.blockedReasons,
  };
}

function createSafeNeutralFrame(evidence: EvidenceGraph): CompiledCoachFrame {
  return {
    targetUci: null,
    targetSan: null,
    targetPieceType: null,
    assisted: null,
    plain: { hint: "This position is ready for practice." },
    showMore: null,
    visualIntents: [],
    evidenceUsed: evidence.evidenceClaimIds,
    isSafe: true,
    safetyNotes: ["no_trusted_target"],
  };
}
