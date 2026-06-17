import { Chess } from "chess.js";
import { buildStage2FeatureTrace } from "../../lib/blundr/debug/buildStage2FeatureTrace";
import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { findApprovedPacket, packetPlayKeyAtTarget, packetPlayKeyBefore } from "./stage2ApprovedContentTestHelpers";

export type TracePacket = Record<string, any>;

function inferPieceType(packet: TracePacket): string {
  const san = String(packet.moveSan ?? "").trim();
  const uci = String(packet.moveUci ?? "").trim().toLowerCase();
  if (/^o-o(-o)?$/i.test(san) || (uci.startsWith("e1") && (uci.endsWith("g1") || uci.endsWith("c1"))) || (uci.startsWith("e8") && (uci.endsWith("g8") || uci.endsWith("c8")))) {
    return "k";
  }
  const sanLead = san.slice(0, 1).toUpperCase();
  if (sanLead === "N") return "n";
  if (sanLead === "B") return "b";
  if (sanLead === "R") return "r";
  if (sanLead === "Q") return "q";
  if (sanLead === "K") return "k";
  return "p";
}

function deriveFen(packet: TracePacket): string | null {
  if (typeof packet.fen === "string" && packet.fen.trim().length > 0) return packet.fen.trim();
  const sequence = Array.isArray(packet.normalizedPlaySequenceUci) && packet.normalizedPlaySequenceUci.length > 0
    ? packet.normalizedPlaySequenceUci
    : Array.isArray(packet.playSequenceUci)
      ? packet.playSequenceUci
      : [];
  if (!sequence.length) return null;
  const chess = new Chess();
  for (const moveValue of sequence) {
    const uci = String(moveValue ?? "").trim().toLowerCase();
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(uci)) return null;
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.length > 4 ? uci.slice(4, 5) : "q" });
    if (!move) return null;
  }
  return chess.fen();
}

export function loadApprovedTracePacket(predicate: (packet: TracePacket) => boolean): TracePacket {
  return findApprovedPacket((packet) => Boolean(predicate(packet as TracePacket))) as TracePacket;
}

export function buildApprovedFrameInput(packet: TracePacket, overrides: Record<string, any> = {}): Record<string, any> {
  const moveUci = overrides.moveUci ?? packet.moveUci;
  const moveSan = overrides.moveSan ?? packet.moveSan;
  const openingId = overrides.openingId ?? packet.openingId;
  const lineId = overrides.lineId ?? packet.lineId;
  const trainerPhase = overrides.trainerPhase ?? "ready_for_user";
  const trainerView = overrides.trainerView ?? "assisted";
  const trainingMode = overrides.trainingMode ?? "restricted";
  const isUserTurn = overrides.isUserTurn ?? true;
  const playKeyBefore = overrides.playKeyBefore ?? packetPlayKeyBefore(packet);
  const playKey = overrides.playKey ?? packetPlayKeyAtTarget(packet);
  const fen = overrides.fen ?? deriveFen(packet);
  const trainerFrameResolution = overrides.trainerFrameResolution ?? buildTrainerFrameResolution({
    trainerFrameId: overrides.trainerFrameId ?? 900,
    trainerPhase,
    trainerView,
    trainingMode,
    isUserTurn,
    instructionTargetUci: moveUci,
    instructionTargetSan: moveSan,
    instructionTargetPieceType: overrides.instructionTargetPieceType ?? inferPieceType({ ...packet, moveUci, moveSan }),
    coachMoveUci: moveUci,
    coachPieceType: inferPieceType(packet),
    acceptedTargetUci: moveUci,
    visibleTeachingSurface: overrides.visibleTeachingSurface ?? {
      owner: "v28_visible_surface",
      mode: overrides.visibleSurfaceMode ?? "assisted",
      coach: { shouldRender: true, title: packet.coachCard?.title ?? packet.title ?? "approved title", body: packet.coachCard?.body ?? packet.body ?? "approved body", buttons: [] },
      safety: { blocked: false },
    },
    displayedCoachDecision: overrides.displayedCoachDecision ?? {
      title: packet.coachCard?.title ?? packet.title ?? "approved title",
      body: packet.coachCard?.body ?? packet.body ?? "approved body",
      buttons: [],
      debug: { coachDecisionSource: "displayedCoachDecision", coachMoveUci: moveUci, coachPieceType: "p" },
    },
    actualCoachCardTitle: overrides.actualCoachCardTitle ?? packet.coachCard?.title ?? packet.title ?? "approved title",
    actualCoachCardBody: overrides.actualCoachCardBody ?? packet.coachCard?.body ?? packet.body ?? "approved body",
    actualCoachCardButtons: overrides.actualCoachCardButtons ?? [],
    actualCoachCardSource: overrides.actualCoachCardSource ?? "surfaceCoachCardDecision",
    actualVisualSource: overrides.actualVisualSource ?? "approved_recipe",
    renderedVisualPrimitiveCount: overrides.renderedVisualPrimitiveCount ?? 2,
    surfaceVisualPrimitiveCount: overrides.surfaceVisualPrimitiveCount ?? 2,
    stage2ApprovedPacketMatched: overrides.stage2ApprovedPacketMatched ?? true,
    stage2ApprovedPacketKind: overrides.stage2ApprovedPacketKind ?? "approved_packet",
    stage2ApprovedPacketId: overrides.stage2ApprovedPacketId ?? packet.packetId ?? null,
    stage2ApprovedPacketSourceBundle: overrides.stage2ApprovedPacketSourceBundle ?? packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null,
    stage2ApprovedPacketSourceFile: overrides.stage2ApprovedPacketSourceFile ?? packet.sourceFile ?? null,
    stage2ApprovedPacketSourceRuntimeMoveUci: overrides.stage2ApprovedPacketSourceRuntimeMoveUci ?? packet.sourceRuntimeMoveUci ?? null,
    stage2ApprovedPacketStatus: overrides.stage2ApprovedPacketStatus ?? packet.status ?? "approved",
    stage2ApprovedPacketApprovalReadiness: overrides.stage2ApprovedPacketApprovalReadiness ?? packet.approvalReadiness ?? "app_validated",
    stage2ApprovedPacketMissReason: overrides.stage2ApprovedPacketMissReason ?? null,
    stage2ApprovedPacketFallbackReason: overrides.stage2ApprovedPacketFallbackReason ?? null,
    stage2ApprovedPacketVisualSource: overrides.stage2ApprovedPacketVisualSource ?? "approved_recipe",
    stage2CoachingPacketKind: overrides.stage2CoachingPacketKind ?? "approved_packet",
    stage2CoachingSafetyStatus: overrides.stage2CoachingSafetyStatus ?? packet.safetyStatus ?? "safe",
    stage2CoachingSurface: overrides.stage2CoachingSurface ?? "assisted",
    stage2CoachingSourceFile: overrides.stage2CoachingSourceFile ?? packet.sourceFile ?? null,
    stage2CoachingRuntimeMatched: overrides.stage2CoachingRuntimeMatched ?? true,
    coachQuality: overrides.coachQuality ?? { qualityScore: 90, qualityScoreSource: "final_rendered", lowQualityTriggered: false, lowQualityThreshold: 80, lowQualityBasedOn: "final_rendered" },
    visualRecipe: overrides.visualRecipe ?? packet.visualRecipe ?? null,
    visualRecipeMoveUci: overrides.visualRecipeMoveUci ?? moveUci ?? null,
    visualRecipeMoveSan: overrides.visualRecipeMoveSan ?? moveSan ?? null,
    visualRecipeTargetMatchesInstructionTarget: overrides.visualRecipeTargetMatchesInstructionTarget ?? true,
    presentationFrame: overrides.presentationFrame ?? { visual: { shouldRender: true, source: "approved_recipe" }, coach: { owner: "intent_first_coach" }, legacy: {} },
    fen,
    playKeyBefore,
    playKey,
    currentInstructionFrame: overrides.currentInstructionFrame ?? {
      kind: "guided_move",
      targetSource: "opening_tree",
    },
    currentInstructionFrameKind: overrides.currentInstructionFrameKind ?? "guided_move",
    instructionTargetSource: overrides.instructionTargetSource ?? "opening_tree",
    showMoreShown: Boolean(overrides.showMoreShown),
    runtimeBookQueried: overrides.runtimeBookQueried ?? true,
    runtimeBookOpeningId: overrides.runtimeBookOpeningId ?? openingId ?? null,
    runtimeBookPlayKeyBefore: overrides.runtimeBookPlayKeyBefore ?? playKeyBefore,
    runtimeBookStatus: overrides.runtimeBookStatus ?? "ready",
    runtimeBookCandidateCount: overrides.runtimeBookCandidateCount ?? 1,
    runtimeBookTopCandidateUci: overrides.runtimeBookTopCandidateUci ?? moveUci ?? null,
    runtimeBookTopCandidateSan: overrides.runtimeBookTopCandidateSan ?? moveSan ?? null,
    runtimeBookTopCandidateRank: overrides.runtimeBookTopCandidateRank ?? 1,
    runtimeBookTopCandidateGames: overrides.runtimeBookTopCandidateGames ?? 1000,
    runtimeBookBookExhausted: overrides.runtimeBookBookExhausted ?? false,
    runtimeBookFallbackUsed: overrides.runtimeBookFallbackUsed ?? false,
    runtimeBookFallbackAuthority: overrides.runtimeBookFallbackAuthority ?? null,
    stage2CoachingResolverEnabled: overrides.stage2CoachingResolverEnabled ?? true,
    stage2ApprovedContentEnabled: overrides.stage2ApprovedContentEnabled ?? true,
    stage2SafeFallbackEnabled: overrides.stage2SafeFallbackEnabled ?? true,
    approvedContent: overrides.approvedContent ?? {
      matched: true,
      packetKind: "approved_packet",
      packetId: packet.packetId ?? null,
      sourceBundle: packet.sourceCandidatePackages?.[0] ?? packet.sourceCandidatePackage ?? null,
      sourceFile: packet.sourceFile ?? null,
      packetStatus: "approved",
      approvalReadiness: "app_validated",
      missReason: null,
      fallbackReason: null,
      visualSource: "approved_recipe",
    },
  } as any);

  return {
    ...overrides,
    trainerFrameResolution,
    fen,
    trainerPhase,
    trainerView,
    trainingMode,
    isUserTurn,
    instructionTargetUci: moveUci,
    instructionTargetSan: moveSan,
    instructionTargetPieceType: overrides.instructionTargetPieceType ?? inferPieceType({ ...packet, moveUci, moveSan }),
    coachMoveUci: moveUci,
    coachPieceType: inferPieceType({ ...packet, moveUci, moveSan }),
    acceptedTargetUci: moveUci,
    playKeyBefore,
    playKey,
    moveUci,
    moveSan,
    openingId,
    lineId,
    currentInstructionFrame: overrides.currentInstructionFrame ?? { kind: "guided_move", targetSource: "opening_tree" },
    currentInstructionFrameKind: overrides.currentInstructionFrameKind ?? "guided_move",
    instructionTargetSource: overrides.instructionTargetSource ?? "opening_tree",
  };
}

export function buildApprovedFeatureTrace(packet: TracePacket, overrides: Record<string, any> = {}) {
  const input = buildApprovedFrameInput(packet, overrides);
  const trainerFrameResolution = input.trainerFrameResolution ?? buildTrainerFrameResolution(input as any);
  return buildStage2FeatureTrace({ ...input, trainerFrameResolution } as any);
}

export function buildApprovedDebugSnapshot(packet: TracePacket, overrides: Record<string, any> = {}) {
  const input = buildApprovedFrameInput(packet, overrides);
  const trainerFrameResolution = input.trainerFrameResolution ?? buildTrainerFrameResolution(input as any);
  return buildTrainerDebugSnapshot({ ...input, trainerFrameResolution } as any);
}
