import { applyStage2CoachCopyEnrichment, type Stage2CoachCopyEnrichmentResult } from "./applyStage2CoachCopyEnrichment";
import { buildStage2CoachContext } from "./buildStage2CoachContext";
import { resolveStage2CoachingPacket } from "./resolveStage2CoachingPacket";
import { mapVisibleSurfaceModeToStage2CoachingSurface } from "./applyStage2CoachCopyEnrichment";
import { selectRenderedCoachCardCopyAuthority, type CoachCopyAuthorityDecision, type CoachCopyCandidate } from "../presentation/renderedCoachCopyAuthority";
import type { Stage2CoachContext, Stage2CoachingPacketResolution } from "./stage2CoachingTypes";

export type Stage2CoachRenderStateInput = {
  openingId?: string | null;
  playKeyBefore?: string | null;
  playKey?: string | null;
  learnerSide?: string | null;
  sideToMove?: string | null;
  targetUci?: string | null;
  targetSan?: string | null;
  targetPieceType?: string | null;
  visibleSurfaceMode?: string | null;
  runtimeBookStatus?: string | null;
  runtimeBookCandidateCount?: number | null;
  runtimeBookTopCandidateUci?: string | null;
  runtimeBookTopCandidateSan?: string | null;
  runtimeBookTopCandidateRank?: number | null;
  runtimeBookTopCandidateTotalGames?: number | null;
  runtimeBookBookExhausted?: boolean | null;
  plainRevealState?: Stage2CoachContext["plainRevealState"] | null;
  trainerPhase: string;
  isUserTurn: boolean;
  surfaceSafetyBlocked: boolean;
  surfaceCopy: CoachCopyCandidate;
  pipelineCopy: CoachCopyCandidate;
  pipelineTargetAligned: boolean | null | undefined;
  pipelinePieceAligned: boolean | null | undefined;
  pipelineContainsDebugLeak: boolean;
  pipelinePassedSafety: boolean;
};

export type Stage2CoachRenderState = {
  stage2CoachContext: Stage2CoachContext;
  stage2CoachingPacketResolution: Stage2CoachingPacketResolution;
  pipelineCopyAuthorityDecision: CoachCopyAuthorityDecision;
  stage2CoachCopyEnrichment: Stage2CoachCopyEnrichmentResult;
};

export function resolveStage2CoachRenderState(input: Stage2CoachRenderStateInput): Stage2CoachRenderState {
  const stage2CoachContext = buildStage2CoachContext({
    openingId: input.openingId ?? undefined,
    playKeyBefore: input.playKeyBefore ?? undefined,
    playKey: input.playKey ?? undefined,
    learnerSide: input.learnerSide ?? undefined,
    sideToMove: input.sideToMove ?? undefined,
    targetUci: input.targetUci ?? undefined,
    targetSan: input.targetSan ?? undefined,
    targetPieceType: input.targetPieceType ?? undefined,
    surface: mapVisibleSurfaceModeToStage2CoachingSurface(input.visibleSurfaceMode ?? null),
    runtimeBook: {
      status: input.runtimeBookStatus ?? undefined,
      candidateCount: input.runtimeBookCandidateCount ?? undefined,
      topCandidateUci: input.runtimeBookTopCandidateUci ?? undefined,
      topCandidateSan: input.runtimeBookTopCandidateSan ?? undefined,
      topCandidateRank: input.runtimeBookTopCandidateRank ?? undefined,
      topCandidateTotalGames: input.runtimeBookTopCandidateTotalGames ?? undefined,
      bookExhausted: Boolean(input.runtimeBookBookExhausted),
    },
    plainRevealState: input.plainRevealState ?? undefined,
  });

  const stage2CoachingPacketResolution = resolveStage2CoachingPacket(stage2CoachContext);
  const pipelineCopyAuthorityDecision = selectRenderedCoachCardCopyAuthority({
    trainerPhase: input.trainerPhase,
    isUserTurn: input.isUserTurn,
    visibleSurfaceMode: input.visibleSurfaceMode ?? null,
    instructionTargetUci: input.targetUci ?? null,
    surfaceSafetyBlocked: input.surfaceSafetyBlocked,
    surfaceCopy: input.surfaceCopy,
    pipelineCopy: input.pipelineCopy,
    pipelineTargetAligned: input.pipelineTargetAligned,
    pipelinePieceAligned: input.pipelinePieceAligned,
    pipelineContainsDebugLeak: input.pipelineContainsDebugLeak,
    pipelinePassedSafety: input.pipelinePassedSafety,
  });
  const stage2CoachCopyEnrichment = applyStage2CoachCopyEnrichment({
    currentMode: input.visibleSurfaceMode ?? null,
    targetUci: input.targetUci ?? null,
    targetSan: input.targetSan ?? null,
    baseCopy: pipelineCopyAuthorityDecision.copy,
    resolution: stage2CoachingPacketResolution,
  });

  return {
    stage2CoachContext,
    stage2CoachingPacketResolution,
    pipelineCopyAuthorityDecision,
    stage2CoachCopyEnrichment,
  };
}
