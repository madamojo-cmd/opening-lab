"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import type { TrainerDebugSnapshot } from "@/lib/blundr/debug/trainerDebugTypes";
import { setBlundrDebugEnabled } from "@/lib/blundr/debug/trainerDebugGuards";
import { sanitizeForDebugJson, stringifyDebugJson } from "@/lib/blundr/debug/trainerDebugSanitizer";
import { DebugBadge } from "./DebugBadge";
import { DebugCopyButton } from "./DebugCopyButton";
import { DebugEventTimeline } from "./DebugEventTimeline";
import { DebugJsonViewer } from "./DebugJsonViewer";
import { DebugSection } from "./DebugSection";

type Props = {
  snapshot: TrainerDebugSnapshot | null;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onClearEvents: () => void;
};

const MAX_DEBUG_SNAPSHOTS = 250;
const GENERIC_TITLE_MARKERS = [
  "active piece development",
  "avoid blocking center pawn",
  "improve your position",
  "continue the position",
  "status",
  "opening pattern",
  "opening idea",
];

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function asFrameId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function looksGenericTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return GENERIC_TITLE_MARKERS.some((marker) => lower.includes(marker));
}

function getFrameId(snapshot: unknown): number | null {
  const frame = (snapshot as any)?.frame;
  return asFrameId(frame?.trainerFrameId ?? frame?.frameId ?? frame?.id);
}

function getSnapshotKey(snapshot: TrainerDebugSnapshot): string {
  const frame = snapshot?.frame as any;
  const trainerFrameId = frame?.trainerFrameId ?? frame?.frameId ?? null;
  const instructionFrameKey = frame?.instructionFrameKey ?? null;
  const instructionTargetUci = frame?.instructionTargetUci ?? null;
  const trainerPhase = frame?.trainerPhase ?? null;
  const trainingMode = frame?.trainingMode ?? null;
  return [
    String(trainerFrameId ?? ""),
    String(instructionFrameKey ?? ""),
    String(instructionTargetUci ?? ""),
    String(trainerPhase ?? ""),
    String(trainingMode ?? ""),
  ].join("|");
}

function sanitizeSnapshotForHistory(snapshot: TrainerDebugSnapshot | null | undefined): Record<string, unknown> | null {
  if (!snapshot) return null;
  return sanitizeForDebugJson({
    generatedAt: snapshot.generatedAt ?? null,
    build: snapshot.build ?? null,
    health: snapshot.health ?? null,
    frame: snapshot.frame ?? null,
    board: snapshot.board ?? null,
    visual: snapshot.visual ?? null,
    visualResult: snapshot.visualResult ?? null,
    continuation: snapshot.continuation ?? null,
    runtime: (snapshot as any).runtime ?? null,
    maia: (snapshot as any).maia ?? null,
    coach: snapshot.coach ?? null,
    coachPipeline: snapshot.coachPipeline ?? null,
    actions: snapshot.actions ?? null,
    features: snapshot.features ?? null,
    plans: snapshot.plans ?? null,
    opportunities: snapshot.opportunities ?? null,
    templates: snapshot.explanation ?? null,
    presentation: snapshot.presentation ?? null,
    legacy: snapshot.legacy ?? null,
    cachePerformance: {
      cache: snapshot.cache ?? null,
      performance: snapshot.performance ?? null,
    },
    raw: snapshot,
  }) as Record<string, unknown>;
}

function includesNeedle(value: unknown, needle: string): boolean {
  return JSON.stringify(sanitizeForDebugJson(value)).toLowerCase().includes(needle);
}

function getMoveSan(snapshot: unknown): string | null {
  const frame = (snapshot as any)?.frame;
  const coach = (snapshot as any)?.coach;
  const continuation = (snapshot as any)?.continuation;
  return asText(frame?.expectedMoveSan ?? coach?.selectedOpportunityMoveSan ?? continuation?.selectedCandidateSan);
}

function getMoveUci(snapshot: unknown): string | null {
  const frame = (snapshot as any)?.frame;
  const continuation = (snapshot as any)?.continuation;
  const coach = (snapshot as any)?.coach;
  return asText(frame?.expectedMoveUci ?? continuation?.selectedCandidateUci ?? coach?.selectedOpportunityMoveUci);
}

function matchesFrameContext(left: any, right: any): boolean {
  const fields: Array<[unknown, unknown]> = [
    [left?.frameId ?? left?.trainerFrameId, right?.frameId ?? right?.trainerFrameId],
    [left?.instructionTargetUci, right?.instructionTargetUci],
    [left?.instructionTargetSan, right?.instructionTargetSan],
    [left?.instructionTargetPieceType, right?.instructionTargetPieceType],
    [left?.trainingMode, right?.trainingMode],
    [left?.trainerPhase, right?.trainerPhase],
  ];
  return fields.every(([a, b]) => (a == null && b == null) || String(a ?? "") === String(b ?? ""));
}

function buildDerivedAudit(
  sessionSnapshots: Record<string, unknown>[],
  coachTimeline: unknown[],
  plainLeakTimeline: unknown[],
  coachCardRenderTimeline: unknown[],
  coachPipelineTimeline: unknown[],
): Record<string, unknown> {
  const qualityScoreDistribution: Record<string, number> = {};
  const pipelineQualityScoreDistribution: Record<string, number> = {};
  const renderedQualityScoreDistribution: Record<string, number> = {};
  const titleFrames = new Map<string, number[]>();
  const bodyFrames = new Map<string, number[]>();
  const templateUsageMap = new Map<string, { templateId: string | null; count: number; frames: number[] }>();
  const stage2UsageMap = new Map<string, { kind: string | null; safetyStatus: string | null; sourceFile: string | null; count: number; frames: number[] }>();
  const genericTitleHits: Array<{ title: string; frames: number[] }> = [];
  const fallbackFrames: Array<{ frameId: number | null; moveSan: string | null; moveUci: string | null; source: string | null; reason: string | null }> = [];
  const claimValidationFailedFrames: Array<{ frameId: number | null; moveSan: string | null; moveUci: string | null; title: string | null; body: string | null }> = [];
  const featureExposureGaps: Array<{
    frameId: number | null;
    featurePacketExists: boolean | null;
    tacticalMotifSummary: string | null;
    whyVisualRecipeOpportunityLost: string | null;
    whyContinuationCandidateOpportunityLost: string | null;
  }> = [];
  const targetMismatchFrames = new Set<number>();
  const pieceMismatchFrames = new Set<number>();
  const visualMismatchFrames = new Set<number>();
  const revealMismatchFrames = new Set<number>();
  const plainLeakFrames = new Set<number>();
  const criticalIssueFrames: Array<{ frameId: number | null; issues: string[] }> = [];
  const warningFrames: Array<{ frameId: number | null; warnings: string[] }> = [];
  const restrictedLineExhaustedFrames: Array<{ frameId: number | null; reason: string | null; pendingOpponentRequest: boolean; branchCompleteRecovered: boolean }> = [];
  const pendingOpponentRequestStallFrames: Array<{ frameId: number | null; ageMs: number | null; trainerPhase: string | null; trainingMode: string | null }> = [];
  const renderedVsPipelineCopyMismatches: Array<{
    frameId: number | null;
    moveSan: string | null;
    moveUci: string | null;
    renderedTitle: string | null;
    renderedBody: string | null;
    pipelineTitle: string | null;
    pipelineBody: string | null;
    renderedSource: string | null;
    pipelineSource: string | null;
    severity: "info" | "warn" | "blocker";
    reason: string;
  }> = [];
  let renderedRawConceptLabelCount = 0;
  let renderedGenericContinuationCount = 0;
  let approvedPacketFrameCount = 0;
  let safeFallbackPacketFrameCount = 0;
  let approvedContentEnabledFrameCount = 0;
  const renderedQualityScores: number[] = [];
  const bumpDistribution = (distribution: Record<string, number>, value: unknown) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    const key = String(numeric);
    distribution[key] = (distribution[key] ?? 0) + 1;
  };

  for (const snapshot of sessionSnapshots) {
    const frameId = getFrameId(snapshot);
    const coach = (snapshot as any)?.coach ?? {};
    const coachPipeline = (snapshot as any)?.coachPipeline ?? {};
    const continuation = (snapshot as any)?.continuation ?? {};
    const frame = (snapshot as any)?.frame ?? {};
    const features = (snapshot as any)?.features ?? {};
    const visual = (snapshot as any)?.visual ?? {};
    const actions = (snapshot as any)?.actions ?? {};
    const health = (snapshot as any)?.health ?? {};
    const title = asText(coach?.visibleTitle);
    const body = asText(coach?.visibleBody);

    const qualityScoreRaw = coachPipeline?.qualityScore ?? coach?.qualityScore;
    const qualityScore = Number(qualityScoreRaw);
    if (Number.isFinite(qualityScore)) {
      const key = String(qualityScore);
      qualityScoreDistribution[key] = (qualityScoreDistribution[key] ?? 0) + 1;
      renderedQualityScores.push(qualityScore);
    }
    bumpDistribution(pipelineQualityScoreDistribution, coachPipeline?.pipelineQualityScore ?? coachPipeline?.qualityScore);
    bumpDistribution(renderedQualityScoreDistribution, coachPipeline?.renderedQualityScore ?? coachPipeline?.qualityScore ?? coach?.qualityScore);

    if (title && frameId != null) {
      const frames = titleFrames.get(title) ?? [];
      frames.push(frameId);
      titleFrames.set(title, frames);
    }
    if (body && frameId != null) {
      const frames = bodyFrames.get(body) ?? [];
      frames.push(frameId);
      bodyFrames.set(body, frames);
    }

    if (title && frameId != null) {
      const lowered = title.toLowerCase();
      if (GENERIC_TITLE_MARKERS.some((marker) => lowered.includes(marker))) {
        const existing = genericTitleHits.find((entry) => entry.title === title);
        if (existing) existing.frames.push(frameId);
        else genericTitleHits.push({ title, frames: [frameId] });
      }
    }

    const fallbackUsed =
      includesNeedle(coach?.coachDecisionSource, "fallback")
      || continuation?.runtimeSafeFallbackUsed === true
      || continuation?.genericFallbackUsed === true
      || continuation?.stage2CoachingPacketKind === "safe_fallback";
    if (fallbackUsed) {
      fallbackFrames.push({
        frameId,
        moveSan: getMoveSan(snapshot),
        moveUci: getMoveUci(snapshot),
        source: asText(coach?.coachDecisionSource),
        reason: asText(continuation?.runtimeSafeFallbackReason ?? coachPipeline?.fallbackReason),
      });
    }

    if (
      continuation?.runtimeSafeFallbackReason === "claim_validation_failed"
      || includesNeedle(snapshot, "claim_validation_failed")
    ) {
      claimValidationFailedFrames.push({
        frameId,
        moveSan: getMoveSan(snapshot),
        moveUci: getMoveUci(snapshot),
        title,
        body,
      });
    }

    const templateId = asText(coachPipeline?.selectedTemplateId ?? coach?.selectedTemplateId);
    if (templateId) {
      const existing = templateUsageMap.get(templateId) ?? { templateId, count: 0, frames: [] };
      existing.count += 1;
      if (frameId != null) existing.frames.push(frameId);
      templateUsageMap.set(templateId, existing);
    }

    const packetKind = asText(continuation?.stage2CoachingPacketKind) ?? null;
    const safetyStatus = asText(continuation?.stage2CoachingSafetyStatus) ?? null;
    const sourceFile = asText(continuation?.stage2CoachingSourceFile) ?? null;
    const packetKey = [packetKind, safetyStatus, sourceFile].join("|");
    const packetUsage = stage2UsageMap.get(packetKey) ?? { kind: packetKind, safetyStatus, sourceFile, count: 0, frames: [] };
    packetUsage.count += 1;
    if (frameId != null) packetUsage.frames.push(frameId);
    stage2UsageMap.set(packetKey, packetUsage);
    if (packetKind === "approved_packet") approvedPacketFrameCount += 1;
    if (packetKind === "safe_fallback") safeFallbackPacketFrameCount += 1;
    if (continuation?.stage2ApprovedContentEnabled === true) approvedContentEnabledFrameCount += 1;

    const featurePacketExists =
      features?.featurePacketExists == null
        ? (features?.featurePacket != null || features?.moduleFeaturePacket != null || null)
        : Boolean(features.featurePacketExists);
    const tacticalMotifSummary = asText(features?.tacticalMotifSummary);
    const whyVisualRecipeOpportunityLost = asText(features?.whyVisualRecipeOpportunityLost);
    const whyContinuationCandidateOpportunityLost = asText(features?.whyContinuationCandidateOpportunityLost);
    if (
      featurePacketExists === true
      && (
        tacticalMotifSummary === "blocked_debug_only"
        || whyVisualRecipeOpportunityLost === "not_exposed_from_module"
        || whyContinuationCandidateOpportunityLost === "not_exposed_from_module"
      )
    ) {
      featureExposureGaps.push({
        frameId,
        featurePacketExists,
        tacticalMotifSummary,
        whyVisualRecipeOpportunityLost,
        whyContinuationCandidateOpportunityLost,
      });
    }

    if (coach?.targetAligned === false) {
      if (frameId != null) targetMismatchFrames.add(frameId);
    }
    if (coach?.pieceAligned === false) {
      if (frameId != null) pieceMismatchFrames.add(frameId);
    }
    if (visual?.visualTargetMatchesInstructionTarget === false || visual?.visualRecipeTargetMatchesInstructionTarget === false) {
      if (frameId != null) visualMismatchFrames.add(frameId);
    }
    if (actions?.revealTargetMatchesInstructionTarget === false || actions?.revealTargetMismatchDetected === true) {
      if (frameId != null) revealMismatchFrames.add(frameId);
    }
    if (features?.plainLeakDetected === true) {
      if (frameId != null) plainLeakFrames.add(frameId);
    }

    const issues = asArray(health?.criticalIssues).map((issue) => String(issue));
    if (issues.length) criticalIssueFrames.push({ frameId, issues });
    const warnings = asArray(health?.warnings).map((warning) => String(warning));
    if (warnings.length) warningFrames.push({ frameId, warnings });
    if (continuation?.restrictedLineExhaustedOnOpponentTurn === true || continuation?.branchCompleteRecoveredFromOpponentTurn === true) {
      restrictedLineExhaustedFrames.push({
        frameId,
        reason: asText(frame?.branchTransitionReason ?? continuation?.restrictedLineExhaustedReason) ?? "restricted_book_exhausted_on_opponent_turn_after_user_move",
        pendingOpponentRequest: Boolean(continuation?.pendingOpponentRequest ?? frame?.pendingOpponentRequest),
        branchCompleteRecovered: Boolean(continuation?.branchCompleteRecoveredFromOpponentTurn),
      });
    }
    const pending = continuation?.pendingOpponentRequest ?? frame?.pendingOpponentRequest;
    const pendingAgeMs = pending?.startedAt ? Date.now() - Number(pending.startedAt) : null;
    if (pending && (Number(pendingAgeMs ?? 0) > 5000 || String(frame?.trainerPhase ?? "") === "opponent_replying")) {
      pendingOpponentRequestStallFrames.push({
        frameId,
        ageMs: Number.isFinite(Number(pendingAgeMs)) ? Number(pendingAgeMs) : null,
        trainerPhase: asText(frame?.trainerPhase),
        trainingMode: asText(frame?.trainingMode),
      });
    }
  }

  for (const entry of asArray(coachCardRenderTimeline)) {
    if (String((entry as any)?.trainerPhase ?? "") !== "ready_for_user") continue;
    if ((entry as any)?.isUserTurn !== true) continue;
    const renderedTitle = asText((entry as any)?.actualCoachCardTitle ?? (entry as any)?.visibleTitle);
    const renderedBody = asText((entry as any)?.actualCoachCardBody ?? (entry as any)?.visibleBody);
    const renderedSource = asText((entry as any)?.actualCoachCardSource);
    const pipelineTitle = asText((entry as any)?.pipelineCoachCardTitle);
    const pipelineBody = asText((entry as any)?.pipelineCoachCardBody);
    const pipelineSource = asText((entry as any)?.pipelineCoachCardSource ?? (entry as any)?.coachDecisionSource);
    const rawLabel = renderedTitle ? looksGenericTitle(renderedTitle) : false;
    const genericContinuation = renderedTitle ? renderedTitle.toLowerCase().includes("continue the position") : false;
    if (rawLabel) renderedRawConceptLabelCount += 1;
    if (genericContinuation || (renderedBody ? renderedBody.toLowerCase().includes("keeps the position moving") : false)) renderedGenericContinuationCount += 1;
    bumpDistribution(pipelineQualityScoreDistribution, (entry as any)?.pipelineQualityScore);
    bumpDistribution(renderedQualityScoreDistribution, (entry as any)?.renderedQualityScore);

    const pipelineEntry = asArray(coachPipelineTimeline).find((candidate: any) => matchesFrameContext(entry, candidate)) as any;
    const timelinePipelineTitle = asText(pipelineEntry?.visibleTitle);
    const timelinePipelineBody = asText(pipelineEntry?.visibleBody);
    const effectivePipelineTitle = pipelineTitle ?? timelinePipelineTitle;
    const effectivePipelineBody = pipelineBody ?? timelinePipelineBody;
    const mismatch = effectivePipelineTitle && effectivePipelineBody && (effectivePipelineTitle !== renderedTitle || effectivePipelineBody !== renderedBody);
    if (!mismatch) continue;
    const pipelineMoveSpecific = Boolean((entry as any)?.instructionTargetSan && effectivePipelineTitle.toLowerCase().includes(String((entry as any).instructionTargetSan).toLowerCase()));
    const renderedGeneric = Boolean(rawLabel || (renderedBody && renderedBody.toLowerCase().includes("improve your position")));
    let severity: "info" | "warn" | "blocker" = "info";
    let reason = "rendered_copy_differs_from_pipeline";
    if (renderedGeneric && pipelineMoveSpecific) {
      severity = "blocker";
      reason = "raw_or_generic_rendered_copy_overrode_move_specific_pipeline_copy";
    } else if (renderedGeneric) {
      severity = "warn";
      reason = "generic_rendered_copy_overrode_pipeline_copy";
    }
    renderedVsPipelineCopyMismatches.push({
      frameId: asFrameId((entry as any)?.frameId),
      moveSan: asText((entry as any)?.instructionTargetSan ?? (entry as any)?.expectedMoveSan),
      moveUci: asText((entry as any)?.instructionTargetUci ?? (entry as any)?.expectedMoveUci),
      renderedTitle,
      renderedBody,
      pipelineTitle: effectivePipelineTitle,
      pipelineBody: effectivePipelineBody,
      renderedSource,
      pipelineSource,
      severity,
      reason,
    });
  }

  for (const entry of asArray(plainLeakTimeline)) {
    if ((entry as any)?.preShowMoreLeak || (entry as any)?.plainLeakDetected) {
      const frameId = asFrameId((entry as any)?.frameId);
      if (frameId != null) plainLeakFrames.add(frameId);
    }
  }

  const repeatedTitles = Array.from(titleFrames.entries())
    .filter(([, frames]) => frames.length > 1)
    .map(([title, frames]) => ({ title, count: frames.length, frames }));
  const repeatedBodies = Array.from(bodyFrames.entries())
    .filter(([, frames]) => frames.length > 1)
    .map(([body, frames]) => ({ body, count: frames.length, frames }));
  const repeatedBodyStems = Array.from(
    sessionSnapshots.reduce((map, snapshot) => {
      const body = asText((snapshot as any)?.coach?.visibleBody);
      const frameId = getFrameId(snapshot);
      if (!body || frameId == null) return map;
      const stem = body
        .toLowerCase()
        .replace(/\b[a-h][1-8][a-h][1-8][qrbn]?\b/g, "{move}")
        .replace(/\b[a-h][1-8]\b/g, "{square}")
        .replace(/\b(pawn|knight|bishop|rook|queen|king)\b/g, "{piece}")
        .replace(/\s+/g, " ")
        .trim();
      const item = map.get(stem) ?? { stem, count: 0, frames: [] as number[] };
      item.count += 1;
      item.frames.push(frameId);
      map.set(stem, item);
      return map;
    }, new Map<string, { stem: string; count: number; frames: number[] }>())
      .values(),
  ).filter((entry) => entry.count > 1);
  const uniqueRenderedScores = Array.from(new Set(renderedQualityScores.map((score) => Number(score.toFixed(2)))));
  const identicalRenderedQualityDetected = renderedQualityScores.length >= 3 && uniqueRenderedScores.length === 1;
  const approvedContentInactiveReason =
    approvedPacketFrameCount > 0
      ? null
      : approvedContentEnabledFrameCount === 0
        ? "approvedContentEnabled false and safe_fallback active"
        : safeFallbackPacketFrameCount > 0
          ? "no approved packet source wired; safe fallback packets used"
          : "no approved packet source wired";

  return {
    frameCount: sessionSnapshots.length,
    instructionalFrameCount: asArray(coachTimeline).filter((entry: any) => entry?.entryKind === "instructional").length,
    qualityScoreDistribution,
    pipelineQualityScoreDistribution,
    renderedQualityScoreDistribution,
    repeatedTitles,
    repeatedBodies,
    repeatedBodyStems,
    genericTitleHits,
    fallbackFrames,
    claimValidationFailedFrames,
    templateUsage: Array.from(templateUsageMap.values()),
    stage2PacketUsage: Array.from(stage2UsageMap.values()),
    approvedPacketFrameCount,
    safeFallbackPacketFrameCount,
    approvedContentInactiveReason,
    featureExposureGaps,
    renderedVsPipelineCopyMismatches,
    renderedVsPipelineMismatchCount: renderedVsPipelineCopyMismatches.length,
    renderedRawConceptLabelCount,
    renderedGenericContinuationCount,
    targetMismatchFrames: Array.from(targetMismatchFrames.values()).sort((a, b) => a - b),
    pieceMismatchFrames: Array.from(pieceMismatchFrames.values()).sort((a, b) => a - b),
    visualMismatchFrames: Array.from(visualMismatchFrames.values()).sort((a, b) => a - b),
    revealMismatchFrames: Array.from(revealMismatchFrames.values()).sort((a, b) => a - b),
    plainLeakFrames: Array.from(plainLeakFrames.values()).sort((a, b) => a - b),
    criticalIssueFrames,
    restrictedLineExhaustedFrames,
    pendingOpponentRequestStallFrames,
    warningFrames: identicalRenderedQualityDetected
      ? [...warningFrames, { frameId: null, warnings: ["identical_rendered_quality_scores_detected"] }]
      : warningFrames,
  };
}

export function buildFullSessionDebugPayload(args: {
  currentSnapshot: TrainerDebugSnapshot | null | undefined;
  historySnapshots: Array<Record<string, unknown> | null | undefined>;
  coachTimeline?: unknown[];
  coachPipelineTimeline?: unknown[];
  coachCardRenderTimeline?: unknown[];
  surfaceModeTransitionTimeline?: unknown[];
  surfaceTimeline?: unknown[];
  actionTimeline?: unknown[];
  visualTimeline?: unknown[];
  plainLeakTimeline?: unknown[];
  maiaTimeline?: unknown[];
  eventLog?: unknown[];
}): Record<string, unknown> {
  const current = sanitizeSnapshotForHistory(args.currentSnapshot);
  const snapshots = args.historySnapshots
    .map((entry) => sanitizeForDebugJson(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"));
  const coachTimeline = asArray(args.coachTimeline);
  const coachPipelineTimeline = asArray(args.coachPipelineTimeline);
  const coachCardRenderTimeline = asArray(args.coachCardRenderTimeline);
  const surfaceModeTransitionTimeline = asArray(args.surfaceModeTransitionTimeline ?? args.surfaceTimeline);
  const actionTimeline = asArray(args.actionTimeline);
  const visualTimeline = asArray(args.visualTimeline);
  const plainLeakTimeline = asArray(args.plainLeakTimeline);
  const maiaTimeline = asArray(args.maiaTimeline);
  const eventLog = asArray(args.eventLog);
  const latest = snapshots.at(-1) ?? current ?? null;
  return {
    generatedAt: (args.currentSnapshot?.generatedAt ?? (latest as any)?.generatedAt ?? null) as number | string | null,
    debugBuild: sanitizeForDebugJson(args.currentSnapshot?.build ?? (latest as any)?.build ?? null),
    current,
    history: {
      snapshots,
      coachTimeline,
      coachPipelineTimeline,
      coachCardRenderTimeline,
      surfaceModeTransitionTimeline,
      surfaceTimeline: surfaceModeTransitionTimeline,
      actionTimeline,
      visualTimeline,
      plainLeakTimeline,
      maiaTimeline,
      eventLog,
    },
    derivedAudit: buildDerivedAudit(snapshots, coachTimeline, plainLeakTimeline, coachCardRenderTimeline, coachPipelineTimeline),
  };
}

export function buildDebugCopyEverythingPayload(snapshot: TrainerDebugSnapshot | null | undefined): Record<string, unknown> {
  return {
    generatedAt: snapshot?.generatedAt ?? null,
    frame: snapshot?.frame ?? null,
    coachCard: {
      title: snapshot?.coach?.visibleTitle ?? null,
      body: snapshot?.coach?.visibleBody ?? null,
      buttons: snapshot?.coach?.visibleButtons ?? [],
      owner: snapshot?.coach?.visibleCoachOwner ?? null,
      intent: snapshot?.coach?.coachIntent ?? null,
      source: snapshot?.coach?.coachDecisionSource ?? null,
      mode: (snapshot?.presentation as any)?.visibleSurfaceMode ?? null,
    },
    runtimeBook: {
      queried: (snapshot?.continuation as any)?.runtimeBookQueried ?? false,
      openingId: (snapshot?.continuation as any)?.runtimeBookOpeningId ?? null,
      playKeyBefore: (snapshot?.continuation as any)?.runtimeBookPlayKeyBefore ?? null,
      status: (snapshot?.continuation as any)?.runtimeBookStatus ?? null,
      candidateCount: (snapshot?.continuation as any)?.runtimeBookCandidateCount ?? null,
      topCandidateUci: (snapshot?.continuation as any)?.runtimeBookTopCandidateUci ?? null,
      topCandidateSan: (snapshot?.continuation as any)?.runtimeBookTopCandidateSan ?? null,
      topCandidateRank: (snapshot?.continuation as any)?.runtimeBookTopCandidateRank ?? null,
      topCandidateGames: (snapshot?.continuation as any)?.runtimeBookTopCandidateGames ?? null,
      topCandidatePlayPct: (snapshot?.continuation as any)?.runtimeBookTopCandidatePlayPct ?? null,
      opponentReplyAuthoritySource: (snapshot?.continuation as any)?.opponentReplyAuthoritySource ?? null,
      opponentReplyAuthorityCandidateUci: (snapshot?.continuation as any)?.opponentReplyAuthorityCandidateUci ?? null,
      opponentReplyAuthorityCandidateSan: (snapshot?.continuation as any)?.opponentReplyAuthorityCandidateSan ?? null,
      opponentReplyAuthorityCandidateGames: (snapshot?.continuation as any)?.opponentReplyAuthorityCandidateGames ?? null,
      opponentReplyAuthorityCandidatePlayPct: (snapshot?.continuation as any)?.opponentReplyAuthorityCandidatePlayPct ?? null,
      opponentReplyAuthorityRejectedReason: (snapshot?.continuation as any)?.opponentReplyAuthorityRejectedReason ?? null,
      bookExhausted: (snapshot?.continuation as any)?.runtimeBookBookExhausted ?? null,
      fallbackUsed: (snapshot?.continuation as any)?.runtimeBookFallbackUsed ?? null,
      fallbackAuthority: (snapshot?.continuation as any)?.runtimeBookFallbackAuthority ?? null,
    },
    runtime: {
      runtimeDataSource: (snapshot as any)?.runtime?.runtimeDataSource ?? null,
      runtimePackageId: (snapshot as any)?.runtime?.runtimePackageId ?? null,
      openingCount: (snapshot as any)?.runtime?.openingCount ?? null,
      visibleOpeningCount: (snapshot as any)?.runtime?.visibleOpeningCount ?? null,
      openingSelectionMode: (snapshot as any)?.runtime?.openingSelectionMode ?? null,
      openingSelectionSource: (snapshot as any)?.runtime?.openingSelectionSource ?? null,
      openingSelectionEligibleCount: (snapshot as any)?.runtime?.openingSelectionEligibleCount ?? null,
      openingSelectionEligibleOpeningIds: (snapshot as any)?.runtime?.openingSelectionEligibleOpeningIds ?? [],
      openingSelectionWeighted: (snapshot as any)?.runtime?.openingSelectionWeighted ?? null,
      openingSelectionContentGated: (snapshot as any)?.runtime?.openingSelectionContentGated ?? null,
      openingSelectionStageGated: (snapshot as any)?.runtime?.openingSelectionStageGated ?? null,
      openingSelectionVisibilityGated: (snapshot as any)?.runtime?.openingSelectionVisibilityGated ?? null,
      openingSelectionWeightsSummary: (snapshot as any)?.runtime?.openingSelectionWeightsSummary ?? [],
      openingSelectionStickyReason: (snapshot as any)?.runtime?.openingSelectionStickyReason ?? null,
      openingSelectionSeed: (snapshot as any)?.runtime?.openingSelectionSeed ?? null,
      openingSelectionWasPersisted: (snapshot as any)?.runtime?.openingSelectionWasPersisted ?? null,
      lineSelectionMode: (snapshot as any)?.runtime?.lineSelectionMode ?? null,
      publicOpeningCount: (snapshot as any)?.runtime?.publicOpeningCount ?? null,
      betaOpeningCount: (snapshot as any)?.runtime?.betaOpeningCount ?? null,
      devOpeningCount: (snapshot as any)?.runtime?.devOpeningCount ?? null,
      hiddenOpeningCount: (snapshot as any)?.runtime?.hiddenOpeningCount ?? null,
      runtimeAvailableCount: (snapshot as any)?.runtime?.runtimeAvailableCount ?? null,
      approvedContentInventoryCount: (snapshot as any)?.runtime?.approvedContentInventoryCount ?? null,
      approvedContentMatchedCount: (snapshot as any)?.runtime?.approvedContentMatchedCount ?? null,
      approvedContentAvailableCount: (snapshot as any)?.runtime?.approvedContentAvailableCount ?? null,
      selectedOpeningId: (snapshot as any)?.runtime?.selectedOpeningId ?? null,
      canonicalSelectedOpeningId: (snapshot as any)?.runtime?.canonicalSelectedOpeningId ?? null,
      resolvedSelectedOpeningId: (snapshot as any)?.runtime?.resolvedSelectedOpeningId ?? null,
      selectedOpeningRuntimeAvailable: (snapshot as any)?.runtime?.selectedOpeningRuntimeAvailable ?? null,
      selectedOpeningContentStatus: (snapshot as any)?.runtime?.selectedOpeningContentStatus ?? null,
      selectedOpeningApprovedContentAvailable: (snapshot as any)?.runtime?.selectedOpeningApprovedContentAvailable ?? null,
      selectedOpeningDisplayName: (snapshot as any)?.runtime?.selectedOpeningDisplayName ?? null,
      selectedOpeningPerspective: (snapshot as any)?.runtime?.selectedOpeningPerspective ?? null,
      selectedOpeningUserVisible: (snapshot as any)?.runtime?.selectedOpeningUserVisible ?? null,
      selectedOpeningStage: (snapshot as any)?.runtime?.selectedOpeningStage ?? null,
      selectedOpeningQaStatus: (snapshot as any)?.runtime?.selectedOpeningQaStatus ?? null,
      selectedOpeningPublicReady: (snapshot as any)?.runtime?.selectedOpeningPublicReady ?? null,
      selectedOpeningBetaReady: (snapshot as any)?.runtime?.selectedOpeningBetaReady ?? null,
      selectedOpeningNeedsBrowserQA: (snapshot as any)?.runtime?.selectedOpeningNeedsBrowserQA ?? null,
      selectedOpeningLeadingMvpCandidate: (snapshot as any)?.runtime?.selectedOpeningLeadingMvpCandidate ?? null,
      selectedOpeningReasonHidden: (snapshot as any)?.runtime?.selectedOpeningReasonHidden ?? null,
      lineSelectionSource: (snapshot as any)?.runtime?.lineSelectionSource ?? null,
      lineSelectionWeighted: (snapshot as any)?.runtime?.lineSelectionWeighted ?? null,
      lineSelectionContentGated: (snapshot as any)?.runtime?.lineSelectionContentGated ?? null,
      lineSelectionRuntimeBacked: (snapshot as any)?.runtime?.lineSelectionRuntimeBacked ?? null,
      lineSelectionEligibleCount: (snapshot as any)?.runtime?.lineSelectionEligibleCount ?? null,
      lineSelectionEligibleLineIds: (snapshot as any)?.runtime?.lineSelectionEligibleLineIds ?? [],
      lineSelectionEligibleLineKeys: (snapshot as any)?.runtime?.lineSelectionEligibleLineKeys ?? [],
      lineSelectionRecentLineKeys: (snapshot as any)?.runtime?.lineSelectionRecentLineKeys ?? [],
      lineSelectionBlockedRecentLineKeys: (snapshot as any)?.runtime?.lineSelectionBlockedRecentLineKeys ?? [],
      lineSelectionVariationReason: (snapshot as any)?.runtime?.lineSelectionVariationReason ?? null,
      lineSelectionSeed: (snapshot as any)?.runtime?.lineSelectionSeed ?? null,
      selectedRuntimeLineId: (snapshot as any)?.runtime?.selectedRuntimeLineId ?? null,
      selectedRuntimeLineKey: (snapshot as any)?.runtime?.selectedRuntimeLineKey ?? null,
      selectedRuntimeLineIndex: (snapshot as any)?.runtime?.selectedRuntimeLineIndex ?? null,
      selectedRuntimeLinePlayKey: (snapshot as any)?.runtime?.selectedRuntimeLinePlayKey ?? null,
      selectedRuntimeLinePlaySequenceUci: (snapshot as any)?.runtime?.selectedRuntimeLinePlaySequenceUci ?? [],
      openingIdentityMatched: (snapshot as any)?.runtime?.openingIdentityMatched ?? null,
      openingIdentityMismatchReason: (snapshot as any)?.runtime?.openingIdentityMismatchReason ?? null,
      candidateSource: (snapshot as any)?.runtime?.candidateSource ?? null,
      liveLichessCalled: (snapshot as any)?.runtime?.liveLichessCalled ?? null,
      openingAvailabilityStatus: (snapshot as any)?.runtime?.openingAvailabilityStatus ?? null,
    },
    promotion: {
      pendingPromotion: (snapshot as any)?.promotion?.pendingPromotion ?? null,
      promotionPickerRendered: (snapshot as any)?.promotion?.promotionPickerRendered ?? false,
      promotionOptions: (snapshot as any)?.promotion?.promotionOptions ?? [],
      selectedPromotionPiece: (snapshot as any)?.promotion?.selectedPromotionPiece ?? null,
      attemptedPromotionUci: (snapshot as any)?.promotion?.attemptedPromotionUci ?? null,
      acceptedPromotionUci: (snapshot as any)?.promotion?.acceptedPromotionUci ?? null,
      acceptedTargetUci: (snapshot as any)?.promotion?.acceptedTargetUci ?? null,
      promotionAuthorityMatched: (snapshot as any)?.promotion?.promotionAuthorityMatched ?? null,
      promotionAuthorityMismatchReason: (snapshot as any)?.promotion?.promotionAuthorityMismatchReason ?? null,
      promotionAuthorityTargetUci: (snapshot as any)?.promotion?.promotionAuthorityTargetUci ?? null,
    },
    stage2Coaching: {
      resolverEnabled: (snapshot?.continuation as any)?.stage2CoachingResolverEnabled ?? false,
      approvedContentEnabled: (snapshot?.continuation as any)?.stage2ApprovedContentEnabled ?? false,
      safeFallbackEnabled: (snapshot?.continuation as any)?.stage2SafeFallbackEnabled ?? false,
      packetKind: (snapshot?.continuation as any)?.stage2CoachingPacketKind ?? "none",
      safetyStatus: (snapshot?.continuation as any)?.stage2CoachingSafetyStatus ?? null,
      surface: (snapshot?.continuation as any)?.stage2CoachingSurface ?? null,
      sourceFile: (snapshot?.continuation as any)?.stage2CoachingSourceFile ?? null,
      runtimeMatched: (snapshot?.continuation as any)?.stage2CoachingRuntimeMatched ?? null,
      targetMatched: (snapshot?.continuation as any)?.stage2CoachingTargetMatched ?? null,
      plainViewSafe: (snapshot?.continuation as any)?.stage2CoachingPlainViewSafe ?? null,
      reasonRejected: (snapshot?.continuation as any)?.stage2CoachingReasonRejected ?? null,
    },
    featureTrace: snapshot?.featureTrace ?? null,
    featureTraceTimeline: snapshot?.featureTraceTimeline ?? [],
    trainerFrameResolution: snapshot?.trainerFrameResolution ?? null,
    providerWarnings: (snapshot as any)?.providerWarnings ?? (snapshot?.trainerFrameResolution as any)?.providerWarnings ?? [],
    providerWarningSummary: (snapshot as any)?.providerWarningSummary ?? (snapshot?.trainerFrameResolution as any)?.providerWarningSummary ?? null,
    visualResult: (snapshot as any)?.visualResult ?? (snapshot?.trainerFrameResolution as any)?.visualResult ?? (snapshot?.featureTrace as any)?.visualResult ?? null,
    coachCardRenderTimeline: Array.isArray(snapshot?.coachCardRenderTimeline) ? snapshot.coachCardRenderTimeline : [],
    coachPipelineTimeline: Array.isArray(snapshot?.coachTimeline) ? snapshot.coachTimeline : [],
    visualTimeline: Array.isArray(snapshot?.visualRenderTimeline) ? snapshot.visualRenderTimeline : [],
    actionTimeline: Array.isArray(snapshot?.actionTimeline) ? snapshot.actionTimeline : [],
    surfaceModeTransitionTimeline: Array.isArray(snapshot?.surfaceModeTransitionTimeline) ? snapshot.surfaceModeTransitionTimeline : [],
    plainLeakTimeline: Array.isArray(snapshot?.plainLeakTimeline) ? snapshot.plainLeakTimeline : [],
    maiaTimeline: Array.isArray((snapshot as any)?.maiaTimeline) ? (snapshot as any).maiaTimeline : [],
    health: snapshot?.health ?? null,
    criticalIssues: snapshot?.health?.criticalIssues ?? [],
    warnings: snapshot?.health?.warnings ?? [],
  };
}

function status(hasFail: boolean, hasWarn: boolean) {
  return hasFail ? "fail" : hasWarn ? "warn" : "pass";
}

function issueReport(snapshot: TrainerDebugSnapshot): string {
  return `BLUNDR DEBUG ISSUE REPORT
timestamp: ${new Date(snapshot.generatedAt).toISOString()}
frame: ${snapshot.frame.trainerFrameId}
fen4: ${snapshot.board.boardFen4}
view: ${snapshot.frame.trainerView}
phase: ${snapshot.frame.trainerPhase}
mode: ${snapshot.frame.trainingMode}
expectedMoveSan: ${snapshot.frame.expectedMoveSan ?? "none"}
expectedMoveUci: ${snapshot.frame.expectedMoveUci ?? "none"}

visual:
source: ${snapshot.visual.visualLayerSource}
shouldRender: ${snapshot.visual.shouldRenderVisualRecipeLayer}
blockedReason: ${snapshot.visual.visualLayerBlockedReason ?? "none"}
recipeId: ${snapshot.visual.visualRecipeId ?? "none"}
primitiveIds: ${JSON.stringify(snapshot.visual.visualRecipePrimitiveIds ?? [])}
lineCountPassedToBoard: ${snapshot.visual.activeLineCountPassedToBoard}

continuation:
candidate: ${snapshot.continuation.selectedCandidateSan ?? snapshot.continuation.selectedCandidateUci ?? "none"}
exactMoveAllowed: ${snapshot.continuation.exactMoveAllowed}
linesPassedToBoard: ${snapshot.continuation.continuationLinesPassedToBoard}
blockedReason: ${snapshot.continuation.continuationVisualBlockedReason ?? "none"}

maia:
providerStatus: ${(snapshot as any).maia?.maiaProviderStatus ?? "none"}
allowedThisFrame: ${(snapshot as any).maia?.maiaAllowedThisFrame ?? false}
blockedReason: ${(snapshot as any).maia?.maiaBlockedReason ?? "none"}
fallbackUsed: ${(snapshot as any).maia?.maiaFallbackUsed ?? false}
fallbackReason: ${(snapshot as any).maia?.maiaFallbackReason ?? "none"}

runtimeBook:
queried: ${(snapshot.continuation as any)?.runtimeBookQueried ?? false}
openingId: ${(snapshot.continuation as any)?.runtimeBookOpeningId ?? "none"}
playKeyBefore: ${(snapshot.continuation as any)?.runtimeBookPlayKeyBefore ?? "none"}
status: ${(snapshot.continuation as any)?.runtimeBookStatus ?? "none"}
candidateCount: ${(snapshot.continuation as any)?.runtimeBookCandidateCount ?? 0}
topCandidateUci: ${(snapshot.continuation as any)?.runtimeBookTopCandidateUci ?? "none"}
opponentReplyAuthoritySource: ${(snapshot.continuation as any)?.opponentReplyAuthoritySource ?? "none"}
opponentReplyAuthorityCandidateUci: ${(snapshot.continuation as any)?.opponentReplyAuthorityCandidateUci ?? "none"}
opponentReplyAuthorityRejectedReason: ${(snapshot.continuation as any)?.opponentReplyAuthorityRejectedReason ?? "none"}
bookExhausted: ${(snapshot.continuation as any)?.runtimeBookBookExhausted ?? false}
fallbackUsed: ${(snapshot.continuation as any)?.runtimeBookFallbackUsed ?? false}
fallbackAuthority: ${(snapshot.continuation as any)?.runtimeBookFallbackAuthority ?? "none"}

promotion:
pendingPromotion: ${JSON.stringify((snapshot as any)?.promotion?.pendingPromotion ?? null)}
promotionPickerRendered: ${(snapshot as any)?.promotion?.promotionPickerRendered ?? false}
promotionOptions: ${JSON.stringify((snapshot as any)?.promotion?.promotionOptions ?? [])}
selectedPromotionPiece: ${(snapshot as any)?.promotion?.selectedPromotionPiece ?? "none"}
attemptedPromotionUci: ${(snapshot as any)?.promotion?.attemptedPromotionUci ?? "none"}
acceptedPromotionUci: ${(snapshot as any)?.promotion?.acceptedPromotionUci ?? "none"}
promotionAuthorityMatched: ${(snapshot as any)?.promotion?.promotionAuthorityMatched ?? "unknown"}
promotionAuthorityMismatchReason: ${(snapshot as any)?.promotion?.promotionAuthorityMismatchReason ?? "none"}
promotionAuthorityTargetUci: ${(snapshot as any)?.promotion?.promotionAuthorityTargetUci ?? "none"}

stage2Coaching:
resolverEnabled: ${(snapshot.continuation as any)?.stage2CoachingResolverEnabled ?? false}
approvedContentEnabled: ${(snapshot.continuation as any)?.stage2ApprovedContentEnabled ?? false}
safeFallbackEnabled: ${(snapshot.continuation as any)?.stage2SafeFallbackEnabled ?? false}
packetKind: ${(snapshot.continuation as any)?.stage2CoachingPacketKind ?? "none"}
safetyStatus: ${(snapshot.continuation as any)?.stage2CoachingSafetyStatus ?? "none"}
surface: ${(snapshot.continuation as any)?.stage2CoachingSurface ?? "none"}
sourceFile: ${(snapshot.continuation as any)?.stage2CoachingSourceFile ?? "none"}
runtimeMatched: ${(snapshot.continuation as any)?.stage2CoachingRuntimeMatched ?? "unknown"}

coach:
owner: ${snapshot.coach.visibleCoachOwner}
intent: ${snapshot.coach.coachIntent ?? "none"}
title: ${snapshot.coach.visibleTitle ?? "none"}
body: ${snapshot.coach.visibleBody ?? "none"}
selectedOpportunity: ${snapshot.coach.selectedOpportunityId ?? "none"}
selectedTemplate: ${snapshot.coach.selectedTemplateId ?? "none"}
failureKind: ${snapshot.coach.coachFailureKind}

actions:
lastClicked: ${snapshot.actions.lastClickedAction ?? "none"}
result: ${snapshot.actions.actionResult ?? "none"}
stateChanged: ${snapshot.actions.stateChanged ?? "unknown"}

health:
criticalIssues: ${JSON.stringify(snapshot.health.criticalIssues)}
warnings: ${JSON.stringify(snapshot.health.warnings)}
`;
}

export function BlundrDiagnosticsPanel({ snapshot, enabled, onEnabledChange, onClearEvents }: Props): ReactElement | null {
  const [collapsed, setCollapsed] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [timelineFilter, setTimelineFilter] = useState<"all" | "instructional" | "status" | "fallback" | "low_quality" | "debug_leak" | "mismatch" | "critical">("all");
  const sessionHistoryRef = useRef<Array<{ key: string; snapshot: Record<string, unknown> }>>([]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!enabled) return;
      if (event.shiftKey && event.key.toLowerCase() === "d") {
        setCollapsed((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  const statuses = useMemo(() => {
    const critical = (snapshot?.health.criticalIssues.length ?? 0) > 0;
    const warnings = (snapshot?.health.warnings.length ?? 0) > 0;
    const visualFailureKind = String(snapshot?.visual.visualFailureKind ?? "none");
    const visualFail = visualFailureKind !== "none" && visualFailureKind !== "not_applicable";
    const continuationIssues = (snapshot?.health.criticalIssues ?? []).some((issue) => String(issue).toLowerCase().includes("continuation"));
    const continuationWarn = Boolean(snapshot?.continuation.isContinuationMode && snapshot?.continuation.continuationLinesPassedToBoard === 0 && !snapshot?.continuation.selectedCandidateUci);
    const maiaIssues = (snapshot?.health.criticalIssues ?? []).some((issue) => String(issue).toLowerCase().includes("maia_"));
    const maiaWarn = (snapshot?.health.warnings ?? []).some((issue) => String(issue).toLowerCase().includes("maia_"));
    const cacheClassification = String((snapshot?.cache as any)?.cacheClassification ?? "");
    return {
      visual: status(visualFail, false),
      coach: status(snapshot?.coach.coachFailureKind !== "none", false),
      actions: status(Boolean(snapshot?.health.criticalIssues.some((issue) => issue.includes("Action"))), false),
      continuation: status(continuationIssues, continuationWarn),
      maia: status(maiaIssues, maiaWarn),
      legacy: status(Boolean(snapshot?.legacy.legacyBypassDetected), false),
      cache: cacheClassification === "warn" ? "warn" : cacheClassification === "fail" ? "fail" : status(false, warnings && !critical && cacheClassification !== "not_applicable"),
    };
  }, [snapshot]);
  const coachTimeline = useMemo(() => (Array.isArray(snapshot?.coachTimeline) ? snapshot.coachTimeline : []), [snapshot]);
  const filteredCoachTimeline = useMemo(() => {
    return coachTimeline.filter((entry: any) => {
      if (timelineFilter === "all") return true;
      if (timelineFilter === "instructional") return entry?.entryKind === "instructional";
      if (timelineFilter === "status") return entry?.entryKind === "opponent_status" || entry?.entryKind === "terminal" || entry?.entryKind === "line_complete";
      if (timelineFilter === "fallback") return Boolean(entry?.runtimeSafeFallbackUsed);
      if (timelineFilter === "low_quality") return Number(entry?.qualityScore ?? 0) > 0 && Number(entry?.qualityScore ?? 0) < 80;
      if (timelineFilter === "debug_leak") return Boolean(entry?.containsDebugLeak);
      if (timelineFilter === "mismatch") return entry?.targetAligned === false || entry?.pieceAligned === false;
      if (timelineFilter === "critical") return Array.isArray(entry?.criticalIssuesAtFrame) && entry.criticalIssuesAtFrame.length > 0;
      return true;
    });
  }, [coachTimeline, timelineFilter]);
  const coachQaSummary = useMemo(() => {
    const instructional = coachTimeline.filter((entry: any) => entry?.entryKind === "instructional");
    const instructionalScores = instructional.map((entry: any) => Number(entry?.qualityScore)).filter((score) => Number.isFinite(score));
    const averageInstructionalQualityScore = instructionalScores.length ? Number((instructionalScores.reduce((sum, score) => sum + score, 0) / instructionalScores.length).toFixed(1)) : null;
    return {
      totalCoachFrames: coachTimeline.length,
      instructionalFrameCount: instructional.length,
      opponentStatusFrameCount: coachTimeline.filter((entry: any) => entry?.entryKind === "opponent_status").length,
      terminalOrLineCompleteFrameCount: coachTimeline.filter((entry: any) => entry?.entryKind === "terminal" || entry?.entryKind === "line_complete").length,
      fallbackCount: coachTimeline.filter((entry: any) => Boolean(entry?.runtimeSafeFallbackUsed)).length,
      lowQualityCount: coachTimeline.filter((entry: any) => Number(entry?.qualityScore ?? 0) > 0 && Number(entry?.qualityScore ?? 0) < 80).length,
      debugLeakCount: coachTimeline.filter((entry: any) => Boolean(entry?.containsDebugLeak)).length,
      repeatedGenericCount: coachTimeline.filter((entry: any) => Boolean(entry?.repeatedGeneric)).length,
      pieceMismatchCount: coachTimeline.filter((entry: any) => entry?.pieceAligned === false).length,
      targetMismatchCount: coachTimeline.filter((entry: any) => entry?.targetAligned === false).length,
      averageInstructionalQualityScore,
      uniqueSelectedThemes: Array.from(new Set(coachTimeline.map((entry: any) => String(entry?.selectedTheme ?? "").trim()).filter(Boolean))),
      visibleBodiesInOrder: coachTimeline.map((entry: any) => entry?.visibleBody).filter(Boolean),
      framesWithCriticalIssues: coachTimeline.filter((entry: any) => Array.isArray(entry?.criticalIssuesAtFrame) && entry.criticalIssuesAtFrame.length > 0).map((entry: any) => ({
        frame: entry?.trainerFrameId,
        issues: entry?.criticalIssuesAtFrame,
      })),
    };
  }, [coachTimeline]);
  const coachCardRenderTimeline = useMemo(() => (Array.isArray(snapshot?.coachCardRenderTimeline) ? snapshot.coachCardRenderTimeline : []), [snapshot]);
  const surfaceModeTransitionTimeline = useMemo(() => (Array.isArray(snapshot?.surfaceModeTransitionTimeline) ? snapshot.surfaceModeTransitionTimeline : []), [snapshot]);
  const actionTimeline = useMemo(() => (Array.isArray(snapshot?.actionTimeline) ? snapshot.actionTimeline : []), [snapshot]);
  const visualRenderTimeline = useMemo(() => (Array.isArray(snapshot?.visualRenderTimeline) ? snapshot.visualRenderTimeline : []), [snapshot]);
  const plainLeakTimeline = useMemo(() => (Array.isArray(snapshot?.plainLeakTimeline) ? snapshot.plainLeakTimeline : []), [snapshot]);
  const maiaTimeline = useMemo(() => (Array.isArray((snapshot as any)?.maiaTimeline) ? (snapshot as any).maiaTimeline : []), [snapshot]);
  const eventLog = useMemo(() => (Array.isArray(snapshot?.eventLog) ? snapshot.eventLog : []), [snapshot]);
  const currentCoachCard = useMemo(() => ({
    title: snapshot?.coach?.visibleTitle ?? null,
    body: snapshot?.coach?.visibleBody ?? null,
    buttons: snapshot?.coach?.visibleButtons ?? [],
    owner: snapshot?.coach?.visibleCoachOwner ?? null,
    intent: snapshot?.coach?.coachIntent ?? null,
    source: snapshot?.coach?.coachDecisionSource ?? null,
    mode: snapshot ? (snapshot.presentation as any)?.visibleSurfaceMode ?? null : null,
  }), [snapshot]);
  const fullDebugSession = useMemo(() => buildDebugCopyEverythingPayload(snapshot), [snapshot]);
  useEffect(() => {
    if (!snapshot) return;
    const key = getSnapshotKey(snapshot);
    const current = sessionHistoryRef.current;
    if (current.some((entry) => entry.key === key)) return;
    const sanitized = sanitizeSnapshotForHistory(snapshot);
    if (!sanitized) return;
    const next = [...current, { key, snapshot: sanitized }];
    sessionHistoryRef.current = next.length > MAX_DEBUG_SNAPSHOTS ? next.slice(next.length - MAX_DEBUG_SNAPSHOTS) : next;
  }, [snapshot]);
  const fullSessionDebug = useMemo(
    () =>
      buildFullSessionDebugPayload({
        currentSnapshot: snapshot,
        historySnapshots: sessionHistoryRef.current.map((entry) => entry.snapshot),
        coachTimeline,
        coachPipelineTimeline: coachTimeline,
        coachCardRenderTimeline,
        surfaceModeTransitionTimeline,
        actionTimeline,
        visualTimeline: visualRenderTimeline,
        plainLeakTimeline,
        maiaTimeline,
        eventLog,
      }),
    [
      snapshot,
      coachTimeline,
      coachCardRenderTimeline,
      surfaceModeTransitionTimeline,
      actionTimeline,
      visualRenderTimeline,
      plainLeakTimeline,
      maiaTimeline,
      eventLog,
    ],
  );
  const providerWarnings = useMemo(
    () => (Array.isArray((fullDebugSession as any)?.providerWarnings) ? (fullDebugSession as any).providerWarnings : []),
    [fullDebugSession],
  );
  const providerWarningSummary = useMemo(
    () => (fullDebugSession as any)?.providerWarningSummary ?? null,
    [fullDebugSession],
  );

  if (!enabled && !snapshot?.build.debugEnabled) return null;
  if (!snapshot) return null;

  if (collapsed) {
    return (
      <button type="button" onClick={() => setCollapsed(false)} className="fixed bottom-20 right-3 z-[90] rounded-full bg-stone-950 px-4 py-3 text-xs font-black text-white shadow-2xl">
        Blundr Diagnostics {snapshot.health.criticalIssues.length ? `(${snapshot.health.criticalIssues.length})` : ""}
      </button>
    );
  }

  return (
    <aside className={`fixed ${pinned ? "inset-y-3 right-3" : "bottom-3 right-3 max-h-[82vh]"} z-[90] w-[min(92vw,430px)] overflow-hidden rounded-3xl border border-stone-700 bg-stone-950 text-white shadow-2xl`}>
      <div className="flex items-start justify-between gap-3 border-b border-stone-800 p-3">
        <div>
          <div className="text-sm font-black">Blundr Diagnostics</div>
          <div className="text-[11px] text-stone-400">debug0 • frame {String(snapshot.frame.trainerFrameId)}</div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setExpanded((value) => !value)} className="rounded-full bg-stone-800 px-2 py-1 text-[10px] font-black">{expanded ? "Collapse" : "Expand"}</button>
          <button type="button" onClick={() => setPinned((value) => !value)} className="rounded-full bg-stone-800 px-2 py-1 text-[10px] font-black">{pinned ? "Unpin" : "Pin"}</button>
          <button type="button" onClick={() => setCollapsed(true)} className="rounded-full bg-stone-800 px-2 py-1 text-[10px] font-black">Hide</button>
        </div>
      </div>
      {expanded && (
        <div className="max-h-[calc(82vh-64px)] space-y-3 overflow-auto p-3">
          <div className="flex flex-wrap gap-2">
            <DebugBadge label="Visual" status={statuses.visual as any} />
            <DebugBadge label="Coach" status={statuses.coach as any} />
            <DebugBadge label="Actions" status={statuses.actions as any} />
            <DebugBadge label="Continuation" status={statuses.continuation as any} />
            <DebugBadge label="Maia" status={statuses.maia as any} />
            <DebugBadge label="Legacy" status={statuses.legacy as any} />
            <DebugBadge label="Cache" status={statuses.cache as any} />
          </div>
          <div className="flex flex-wrap gap-2">
            <DebugCopyButton label="Copy JSON" getText={() => stringifyDebugJson(snapshot)} />
            <DebugCopyButton label="Copy Issue Report" getText={() => issueReport(snapshot)} />
            <DebugCopyButton label="Copy FEN/Opp" getText={() => JSON.stringify({ fen4: snapshot.board.boardFen4, expectedMoveSan: snapshot.frame.expectedMoveSan, expectedMoveUci: snapshot.frame.expectedMoveUci, selectedOpportunity: snapshot.coach.selectedOpportunityId }, null, 2)} />
            <DebugCopyButton label="Copy Current CoachCard JSON" getText={() => JSON.stringify(currentCoachCard, null, 2)} />
            <DebugCopyButton label="Copy Coach Timeline JSON" getText={() => JSON.stringify(coachTimeline, null, 2)} />
            <DebugCopyButton label="Copy CoachCard Render Timeline JSON" getText={() => JSON.stringify(coachCardRenderTimeline, null, 2)} />
            <DebugCopyButton label="Copy Surface Timeline JSON" getText={() => JSON.stringify(surfaceModeTransitionTimeline, null, 2)} />
            <DebugCopyButton label="Copy Action Timeline JSON" getText={() => JSON.stringify(actionTimeline, null, 2)} />
            <DebugCopyButton label="Copy Visual Timeline JSON" getText={() => JSON.stringify(visualRenderTimeline, null, 2)} />
            <DebugCopyButton label="Copy Plain Leak Timeline JSON" getText={() => JSON.stringify(plainLeakTimeline, null, 2)} />
            <DebugCopyButton label="Copy Maia Timeline JSON" getText={() => JSON.stringify(maiaTimeline, null, 2)} />
            <DebugCopyButton label="Copy Maia Runtime Health JSON" getText={() => JSON.stringify((snapshot as any).maia ?? {}, null, 2)} />
            <DebugCopyButton label="Copy Everything" getText={() => JSON.stringify(fullDebugSession, null, 2)} />
            <DebugCopyButton label="Copy ALL Session Debug" getText={() => JSON.stringify(fullSessionDebug, null, 2)} />
            <DebugCopyButton label="Copy Coach QA Summary" getText={() => JSON.stringify(coachQaSummary, null, 2)} />
            <button type="button" onClick={onClearEvents} className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black text-stone-900">Clear Events</button>
            <button type="button" onClick={() => { setBlundrDebugEnabled(!enabled); onEnabledChange(!enabled); }} className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black text-stone-900">{enabled ? "Disable" : "Enable"}</button>
          </div>
          <DebugSection title="Health" defaultOpen><DebugJsonViewer value={snapshot.health} /></DebugSection>
          <DebugSection title="Frame"><DebugJsonViewer value={snapshot.frame} /></DebugSection>
          <DebugSection title="Board/FEN"><DebugJsonViewer value={snapshot.board} /></DebugSection>
          <DebugSection title="Visuals"><DebugJsonViewer value={snapshot.visual} /></DebugSection>
          <DebugSection title="Continuation"><DebugJsonViewer value={snapshot.continuation} /></DebugSection>
          <DebugSection title="Promotion"><DebugJsonViewer value={(snapshot as any).promotion ?? { pendingPromotion: null, promotionPickerRendered: false, promotionOptions: [] }} /></DebugSection>
          <DebugSection title="Maia Opponent"><DebugJsonViewer value={(snapshot as any).maia ?? { summary: "not_available" }} /></DebugSection>
          <DebugSection title="Coach"><DebugJsonViewer value={snapshot.coach} /></DebugSection>
          <DebugSection title="Coach Pipeline"><DebugJsonViewer value={snapshot.coachPipeline} /></DebugSection>
          <DebugSection title="Actions"><DebugJsonViewer value={snapshot.actions} /></DebugSection>
          <DebugSection title="Features"><DebugJsonViewer value={snapshot.features} /></DebugSection>
          <DebugSection title="Plans"><DebugJsonViewer value={snapshot.plans} /></DebugSection>
          <DebugSection title="Opportunities"><DebugJsonViewer value={snapshot.opportunities} /></DebugSection>
          <DebugSection title="Feature Trace"><DebugJsonViewer value={snapshot.featureTrace} /></DebugSection>
          <DebugSection title="Feature Trace Timeline"><DebugJsonViewer value={snapshot.featureTraceTimeline ?? []} /></DebugSection>
          <DebugSection title="Templates"><DebugJsonViewer value={snapshot.explanation} /></DebugSection>
          <DebugSection title="Presentation"><DebugJsonViewer value={snapshot.presentation} /></DebugSection>
          <DebugSection title="Legacy"><DebugJsonViewer value={snapshot.legacy} /></DebugSection>
          <DebugSection title="Cache/Performance"><DebugJsonViewer value={{ cache: snapshot.cache, performance: snapshot.performance }} /></DebugSection>
          <DebugSection title="Provider Warnings">
            <DebugJsonViewer value={{ summary: providerWarningSummary, warnings: providerWarnings }} />
          </DebugSection>
          <DebugSection title="Coach Timeline" defaultOpen>
            <div className="mb-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => setTimelineFilter("all")} className={`rounded-full px-2 py-1 text-[10px] font-black ${timelineFilter === "all" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-200"}`}>All</button>
              <button type="button" onClick={() => setTimelineFilter("instructional")} className={`rounded-full px-2 py-1 text-[10px] font-black ${timelineFilter === "instructional" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-200"}`}>Instructional only</button>
              <button type="button" onClick={() => setTimelineFilter("status")} className={`rounded-full px-2 py-1 text-[10px] font-black ${timelineFilter === "status" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-200"}`}>Opponent/status only</button>
              <button type="button" onClick={() => setTimelineFilter("fallback")} className={`rounded-full px-2 py-1 text-[10px] font-black ${timelineFilter === "fallback" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-200"}`}>Fallbacks only</button>
              <button type="button" onClick={() => setTimelineFilter("low_quality")} className={`rounded-full px-2 py-1 text-[10px] font-black ${timelineFilter === "low_quality" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-200"}`}>Low quality only</button>
              <button type="button" onClick={() => setTimelineFilter("debug_leak")} className={`rounded-full px-2 py-1 text-[10px] font-black ${timelineFilter === "debug_leak" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-200"}`}>Debug leaks only</button>
              <button type="button" onClick={() => setTimelineFilter("mismatch")} className={`rounded-full px-2 py-1 text-[10px] font-black ${timelineFilter === "mismatch" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-200"}`}>Mismatches only</button>
              <button type="button" onClick={() => setTimelineFilter("critical")} className={`rounded-full px-2 py-1 text-[10px] font-black ${timelineFilter === "critical" ? "bg-white text-stone-900" : "bg-stone-800 text-stone-200"}`}>Critical issues only</button>
            </div>
            <div className="space-y-1">
              {filteredCoachTimeline.map((entry: any) => (
                <div key={String(entry?.id ?? `${entry?.trainerFrameId}:${entry?.ts}`)} className="rounded-xl bg-stone-900/60 p-2 text-[11px] text-stone-200">
                  {`Frame ${entry?.trainerFrameId} | ${entry?.entryKind} | ${entry?.instructionTargetSan ?? entry?.instructionTargetUci ?? "—"} | ${entry?.visibleTitle ?? "—"} | score ${entry?.qualityScore ?? "n/a"} | ${entry?.coachDecisionSource ?? "n/a"}`}
                </div>
              ))}
              {filteredCoachTimeline.length === 0 && <div className="text-[11px] text-stone-400">No entries for this filter.</div>}
            </div>
            <div className="mt-2"><DebugJsonViewer value={snapshot.coachTimelineSummary} /></div>
          </DebugSection>
          <DebugSection title="CoachCard Render Timeline"><DebugJsonViewer value={coachCardRenderTimeline} /></DebugSection>
          <DebugSection title="Surface Mode Timeline"><DebugJsonViewer value={surfaceModeTransitionTimeline} /></DebugSection>
          <DebugSection title="Action Timeline"><DebugJsonViewer value={actionTimeline} /></DebugSection>
          <DebugSection title="Visual Timeline"><DebugJsonViewer value={visualRenderTimeline} /></DebugSection>
          <DebugSection title="Plain Leak Timeline"><DebugJsonViewer value={plainLeakTimeline} /></DebugSection>
          <DebugSection title="Maia Timeline"><DebugJsonViewer value={maiaTimeline} /></DebugSection>
          <DebugSection title="Event Log"><DebugEventTimeline events={snapshot.eventLog} /></DebugSection>
          <DebugSection title="Raw JSON"><DebugJsonViewer value={snapshot} /></DebugSection>
        </div>
      )}
    </aside>
  );
}
