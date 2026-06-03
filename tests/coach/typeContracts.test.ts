import assert from "node:assert/strict";

import type { CompiledCoachFrame } from "../../lib/blundr/coachCompiler/types";
import { createMockStockfishTop10GateResult } from "../../lib/blundr/engine/mockEngineProvider";
import { createMockMaiaContinuationContext } from "../../lib/blundr/maia/mockMaiaProvider";
import type { OpeningKnowledgeContext } from "../../lib/blundr/knowledge/openingKnowledgeTypes";
import type { VisibleTeachingSurface } from "../../lib/blundr/presentation/types";
import { assertLockedInstructionTarget, type CurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";

export function testTypeContracts(): void {
  const guidedFrame: CurrentInstructionFrame = {
    frameKey: "frame-guided",
    kind: "guided_move",
    fenBefore: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fenAfterTarget: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    ply: 0,
    sideToMove: "white",
    mode: "guided",
    source: "opening_tree",
    target: {
      uci: "e2e4",
      san: "e4",
      from: "e2",
      to: "e4",
      pieceType: "pawn",
      color: "w",
      blundrColor: "white",
      flags: {
        isCapture: false,
        isCheck: false,
        isCheckmate: false,
        isCastle: false,
        isPromotion: false,
        isEnPassant: false,
      },
      provenance: { source: "opening_tree", reason: "book line", confidence: "locked" },
      isCapture: false,
      isCheck: false,
      isMate: false,
      isCheckmate: false,
      isPromotion: false,
      isCastle: false,
      isEnPassant: false,
    },
    debug: { issues: [], targetSignature: "e2e4|pawn|e2->e4", createdAt: new Date().toISOString() },
    frameId: "1",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    normalizedFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    isUserTurn: true,
    targetSource: "guided_move",
    nullReason: null,
    invariantKey: "inv-guided",
    instructionFrameKey: "ifk-guided",
  };

  assert.equal(guidedFrame.target?.uci, "e2e4");
  assert.equal(assertLockedInstructionTarget(guidedFrame).uci, "e2e4");

  const terminalFrame: CurrentInstructionFrame = {
    ...guidedFrame,
    frameKey: "frame-terminal",
    kind: "terminal",
    mode: "terminal",
    source: "terminal",
    target: null,
    nullReason: "phase_terminal",
  };
  assert.equal(terminalFrame.target, null);

  const opponentFrame: CurrentInstructionFrame = {
    ...guidedFrame,
    frameKey: "frame-opponent",
    kind: "opponent_replying",
    mode: "blocked",
    source: "none",
    target: null,
    isUserTurn: false,
    nullReason: "opponent_turn",
  };
  assert.equal(opponentFrame.target, null);

  assert.throws(() => assertLockedInstructionTarget(opponentFrame));

  const top1 = createMockStockfishTop10GateResult({
    fen: guidedFrame.fenBefore,
    targetUci: "e2e4",
    agreement: "target_top1",
  });
  assert.equal(top1.claimPermissions.maySayBest, true);
  assert.equal(top1.claimPermissions.maySayStrong, true);
  assert.equal(top1.claimPermissions.maySayEngineBacked, true);

  const top3 = createMockStockfishTop10GateResult({
    fen: guidedFrame.fenBefore,
    targetUci: "e2e4",
    agreement: "target_top3",
  });
  assert.equal(top3.claimPermissions.maySayBest, false);
  assert.equal(top3.claimPermissions.maySayStrong, true);
  assert.equal(top3.claimPermissions.maySayEngineBacked, true);

  const top10 = createMockStockfishTop10GateResult({
    fen: guidedFrame.fenBefore,
    targetUci: "e2e4",
    agreement: "target_top10",
  });
  assert.equal(top10.claimPermissions.maySayBest, false);
  assert.equal(top10.claimPermissions.maySayStrong, false);
  assert.equal(top10.claimPermissions.maySayEngineBacked, true);

  const notTop10 = createMockStockfishTop10GateResult({
    fen: guidedFrame.fenBefore,
    targetUci: "e2e4",
    agreement: "target_not_top10",
  });
  assert.equal(notTop10.claimPermissions.maySayBest, false);
  assert.equal(notTop10.claimPermissions.maySayStrong, false);
  assert.equal(notTop10.claimPermissions.maySayEngineBacked, false);

  const unavailable = createMockStockfishTop10GateResult({
    fen: guidedFrame.fenBefore,
    targetUci: "e2e4",
    agreement: "engine_unavailable",
  });
  assert.equal(unavailable.claimPermissions.maySayEngineBacked, false);

  const timeout = createMockStockfishTop10GateResult({
    fen: guidedFrame.fenBefore,
    targetUci: "e2e4",
    agreement: "engine_timeout",
  });
  assert.equal(timeout.claimPermissions.maySayEngineBacked, false);

  const maiaDefault = createMockMaiaContinuationContext({
    fen: guidedFrame.fenBefore,
  });
  assert.equal(maiaDefault.status, "not_applicable");

  const openingNotFound: OpeningKnowledgeContext = {
    provider: "opening_knowledge",
    status: "not_found",
    items: [],
    matchedBy: [],
    warnings: [],
  };
  assert.equal(openingNotFound.status, "not_found");

  const safeFallbackSurface: VisibleTeachingSurface = {
    frameKey: guidedFrame.frameKey,
    mode: "blocked",
    targetUci: null,
    targetSan: null,
    pieceType: null,
    copy: {
      title: "Safety fallback",
      body: "No safe teaching claim available.",
      bullets: [],
      leakRisk: "none",
      source: "fallback",
    },
    visuals: [],
    actions: [],
    safety: {
      allowed: false,
      criticalIssues: ["type_claim_without_evidence"],
      warnings: [],
      originalFrameBlocked: true,
    },
    provenance: {
      frameKey: guidedFrame.frameKey,
      graphTargetUci: null,
      compilerVersion: "v2.8.0-package7-mvp",
      surfaceVersion: "v2.8.0-package9-visible-surface",
    },
    debug: {
      sourceSafeFrame: true,
      hiddenVisualCount: 0,
      actionKinds: [],
      targetVisualUcis: [],
    },
  };
  assert.equal(safeFallbackSurface.targetUci, null);

  const compiledFrame: CompiledCoachFrame = {
    frameKey: guidedFrame.frameKey,
    targetUci: "e2e4",
    targetSan: "e4",
    pieceType: "pawn",
    from: "e2",
    to: "e4",
    plain: {
      title: "Your Hint",
      body: "Look for a move that improves central control.",
      bullets: ["Focus on development."],
      evidenceClaimIds: ["claim_1"],
      leakRisk: "high",
    },
    assisted: {
      title: "Center Control",
      body: "Play e4; this move improves central control.",
      bullets: ["Move influences key central squares."],
      evidenceClaimIds: ["claim_1"],
      leakRisk: "low",
    },
    showMore: {
      title: "Why This Matters",
      body: "e4 supports development and central influence.",
      bullets: ["Board truth confirms legality."],
      evidenceClaimIds: ["claim_1"],
      leakRisk: "low",
    },
    activatedConceptIds: ["occupy_center"],
    evidenceClaimIds: ["claim_1"],
    visualIntents: [
      {
        id: "intent_1",
        targetUci: "e2e4",
        type: "move_arrow",
        from: "e2",
        to: "e4",
        evidenceClaimIds: ["claim_1"],
        displayModes: ["assisted", "show_more"],
        leakRisk: "none",
      },
    ],
    revealAction: {
      kind: "reveal_target",
      targetUci: "e2e4",
      targetSan: "e4",
      label: "Reveal move",
    },
    safetyPrecheck: {
      criticalIssues: [],
      warnings: [],
    },
    provenance: {
      frameKey: guidedFrame.frameKey,
      graphTargetUci: "e2e4",
      compilerVersion: "v2.8.0-package7-mvp",
    },
    debug: {
      suppressedConceptIds: [],
      slotKeys: ["targetUci", "targetSan", "pieceType", "from", "to"],
    },
  };
  assert.equal(compiledFrame.targetSan, "e4");
  assert.equal(compiledFrame.visualIntents.length, 1);
}

testTypeContracts();
console.log("typeContracts ok");
