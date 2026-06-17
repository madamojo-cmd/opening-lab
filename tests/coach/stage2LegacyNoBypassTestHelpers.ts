import fs from "node:fs";
import path from "node:path";
import { Chess } from "chess.js";

import { buildStage2FeatureTrace } from "../../lib/blundr/debug/buildStage2FeatureTrace";
import { buildTrainerDebugSnapshot } from "../../lib/blundr/debug/trainerDebugSnapshot";
import { buildTrainerFrameResolution } from "../../lib/blundr/debug/buildTrainerFrameResolution";

export type LegacyAuditEntry = Record<string, unknown>;

export function loadLegacyNoBypassInventory(): LegacyAuditEntry[] {
  const filePath = path.join(process.cwd(), "data/blundr/stage2-legacy-no-bypass-inventory.json");
  if (!fs.existsSync(filePath)) {
    throw new Error("legacy_no_bypass_inventory_missing");
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as LegacyAuditEntry[];
  if (!Array.isArray(parsed)) {
    throw new Error("legacy_no_bypass_inventory_invalid");
  }
  return parsed;
}

export function buildLegacyAuditFrameResolution(overrides: Record<string, unknown> = {}): ReturnType<typeof buildTrainerFrameResolution> {
  return buildTrainerFrameResolution({
    fen: new Chess().fen(),
    trainerFrameId: 941,
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    trainingMode: "restricted",
    isUserTurn: true,
    instructionTargetUci: "e2e4",
    instructionTargetSan: "e4",
    instructionTargetPieceType: "p",
    coachMoveUci: "e2e4",
    coachPieceType: "p",
    acceptedTargetUci: "e2e4",
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: { shouldRender: true, title: "Coach title", body: "Coach body", buttons: [] },
      safety: { blocked: false },
      visual: { lines: [{ id: "line-1" }, { id: "line-2" }] },
      actions: [],
    },
    displayedCoachDecision: {
      title: "Pipeline title",
      body: "Pipeline body",
      buttons: [],
      debug: { coachDecisionSource: "displayedCoachDecision", coachMoveUci: "e2e4", coachPieceType: "p" },
    },
    actualCoachCardTitle: "Coach title",
    actualCoachCardBody: "Coach body",
    actualCoachCardButtons: [],
    actualCoachCardSource: "surfaceCoachCardDecision",
    actualVisualSource: "approved_recipe",
    renderedVisualPrimitiveCount: 2,
    surfaceVisualPrimitiveCount: 2,
    stage2CoachingPacketKind: "approved_packet",
    stage2ApprovedPacketMatched: true,
    stage2ApprovedPacketKind: "approved_packet",
    stage2ApprovedPacketId: "legacy-audit-packet",
    stage2ApprovedPacketSourceBundle: "legacy-audit-bundle",
    stage2ApprovedPacketSourceFile: "legacy-audit.jsonl",
    stage2ApprovedPacketSourceRuntimeMoveUci: "e2e4",
    stage2ApprovedPacketStatus: "approved",
    stage2ApprovedPacketApprovalReadiness: "app_validated",
    stage2ApprovedPacketMissReason: null,
    stage2ApprovedPacketFallbackReason: null,
    stage2ApprovedPacketVisualSource: "approved_recipe",
    stage2CoachingSafetyStatus: "safe",
    stage2CoachingSurface: "assisted",
    stage2CoachingSourceFile: "legacy-audit.jsonl",
    stage2CoachingRuntimeMatched: true,
    coachQuality: {
      qualityScore: 90,
      qualityScoreSource: "final_rendered",
      lowQualityTriggered: false,
      lowQualityThreshold: 80,
      lowQualityBasedOn: "final_rendered",
    },
    visualRecipe: {
      visualRecipeId: "legacy-audit-recipe",
      targetMoveUci: "e2e4",
      moveUci: "e2e4",
      moveSan: "e4",
    },
    visualRecipeMoveUci: "e2e4",
    visualRecipeMoveSan: "e4",
    visualRecipeTargetMatchesInstructionTarget: true,
    presentationFrame: {
      visual: { shouldRender: true, source: "approved_recipe" },
      coach: { owner: "intent_first_coach" },
      legacy: {},
    },
    ...overrides,
  } as any);
}

export function buildLegacyAuditDebugSnapshot(overrides: Record<string, unknown> = {}): ReturnType<typeof buildTrainerDebugSnapshot> {
  const frameResolution = buildLegacyAuditFrameResolution(overrides);
  return buildTrainerDebugSnapshot({
    ...frameResolution,
    fen: overrides.fen ?? new Chess().fen(),
    debugEnabled: true,
    eventLog: [],
  } as any);
}

export function buildLegacyAuditFeatureTrace(overrides: Record<string, unknown> = {}): ReturnType<typeof buildStage2FeatureTrace> {
  const frameResolution = buildLegacyAuditFrameResolution(overrides);
  return buildStage2FeatureTrace({
    ...frameResolution,
    trainerFrameResolution: frameResolution,
    fen: overrides.fen ?? new Chess().fen(),
    debugEnabled: true,
  } as any);
}
