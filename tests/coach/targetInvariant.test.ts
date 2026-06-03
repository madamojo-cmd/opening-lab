import assert from "node:assert/strict";

import type { CompiledCoachFrame } from "../../lib/blundr/coachCompiler/types";
import type { VisibleTeachingSurface } from "../../lib/blundr/presentation/types";
import type { CurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";

function assertTargetAlignment(input: {
  instructionTargetUci: string | null;
  coachMoveUci: string | null;
  visualMoveUci: string | null;
  revealTargetUci: string | null;
  showMoreTargetUci: string | null;
}): void {
  const values = [
    input.instructionTargetUci,
    input.coachMoveUci,
    input.visualMoveUci,
    input.revealTargetUci,
    input.showMoreTargetUci,
  ];
  const first = values[0];
  for (const value of values) {
    assert.equal(value, first, "target alignment invariant violated");
  }
}

export function testTargetInvariant(): void {
  const frame: CurrentInstructionFrame = {
    frameKey: "frame-1",
    kind: "guided_move",
    fenBefore: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    ply: 0,
    sideToMove: "white",
    target: {
      uci: "f1c4",
      san: "Bc4",
      from: "f1",
      to: "c4",
      pieceType: "bishop",
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
      provenance: { source: "opening_tree", reason: "guided", confidence: "locked" },
      isCapture: false,
      isCheck: false,
      isMate: false,
      isCheckmate: false,
      isPromotion: false,
      isCastle: false,
      isEnPassant: false,
    },
    mode: "guided",
    source: "opening_tree",
    debug: { issues: [], targetSignature: "f1c4|bishop|f1->c4", createdAt: new Date().toISOString() },
    frameId: "1",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    normalizedFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    isUserTurn: true,
    targetSource: "guided_move",
    nullReason: null,
    invariantKey: "inv",
    instructionFrameKey: "ifk",
  };

  const compiled: CompiledCoachFrame = {
    frameKey: frame.frameKey,
    targetUci: "f1c4",
    targetSan: "Bc4",
    targetPieceType: "bishop",
    primaryConcept: null,
    secondaryConcepts: [],
    evidenceUsed: ["claim-a"],
    plain: { hint: "Improve development.", showMoreAvailable: true, leakRisk: "low" },
    assisted: { title: "Bc4", body: "Develop the bishop to an active diagonal." },
    showMore: { title: "Bc4 details", body: "This supports pressure near f7." },
    visualIntents: [
      {
        id: "v1",
        frameKey: frame.frameKey,
        targetUci: "f1c4",
        type: "move_arrow",
        from: "f1",
        to: "c4",
        evidenceClaimIds: ["claim-a"],
        displayModes: ["assisted", "plain"],
        leakRisk: "none",
      },
    ],
    revealAction: { kind: "reveal_move", targetUci: "f1c4" },
    safety: { allowed: true, blockedReasons: [], warningReasons: [] },
    provenance: ["opening_tree"],
    debug: { showMoreTargetUci: "f1c4" },
  };

  const surface: VisibleTeachingSurface = {
    frameKey: frame.frameKey,
    owner: "compiled_coach_surface",
    targetUci: "f1c4",
    displayMode: "assisted",
    coachCard: {
      title: "Bc4",
      body: "Develop the bishop.",
      showMore: { title: "More", body: "Controls key squares." },
    },
    plainHint: null,
    revealAction: { kind: "reveal_move", targetUci: "f1c4" },
    visualRecipe: {
      frameKey: frame.frameKey,
      targetUci: "f1c4",
      intents: [{ id: "v1", type: "move_arrow", targetUci: "f1c4", from: "f1", to: "c4", evidenceClaimIds: ["claim-a"] }],
    },
    actionPolicy: {
      showHint: true,
      showMore: true,
      revealMove: true,
      continueFromHere: true,
      disabledReasons: {},
    },
    safety: { allowed: true, criticalIssues: [], blockedReasons: [] },
    debug: {},
  };

  assertTargetAlignment({
    instructionTargetUci: frame.target?.uci ?? null,
    coachMoveUci: compiled.targetUci,
    visualMoveUci: surface.visualRecipe?.targetUci ?? null,
    revealTargetUci: surface.revealAction?.targetUci ?? null,
    showMoreTargetUci: String(compiled.debug.showMoreTargetUci ?? null),
  });

  assert.throws(() => {
    assertTargetAlignment({
      instructionTargetUci: "f1c4",
      coachMoveUci: "f1c4",
      visualMoveUci: "f1c4",
      revealTargetUci: "f1c4",
      showMoreTargetUci: "g1f3",
    });
  });
}

testTargetInvariant();
console.log("targetInvariant ok");
