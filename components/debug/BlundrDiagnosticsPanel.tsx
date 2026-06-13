"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { TrainerDebugSnapshot } from "@/lib/blundr/debug/trainerDebugTypes";
import { setBlundrDebugEnabled } from "@/lib/blundr/debug/trainerDebugGuards";
import { stringifyDebugJson } from "@/lib/blundr/debug/trainerDebugSanitizer";
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
      bookExhausted: (snapshot?.continuation as any)?.runtimeBookBookExhausted ?? null,
      fallbackUsed: (snapshot?.continuation as any)?.runtimeBookFallbackUsed ?? null,
      fallbackAuthority: (snapshot?.continuation as any)?.runtimeBookFallbackAuthority ?? null,
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
    },
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
bookExhausted: ${(snapshot.continuation as any)?.runtimeBookBookExhausted ?? false}
fallbackUsed: ${(snapshot.continuation as any)?.runtimeBookFallbackUsed ?? false}
fallbackAuthority: ${(snapshot.continuation as any)?.runtimeBookFallbackAuthority ?? "none"}

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
            <DebugCopyButton label="Copy Coach QA Summary" getText={() => JSON.stringify(coachQaSummary, null, 2)} />
            <button type="button" onClick={onClearEvents} className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black text-stone-900">Clear Events</button>
            <button type="button" onClick={() => { setBlundrDebugEnabled(!enabled); onEnabledChange(!enabled); }} className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black text-stone-900">{enabled ? "Disable" : "Enable"}</button>
          </div>
          <DebugSection title="Health" defaultOpen><DebugJsonViewer value={snapshot.health} /></DebugSection>
          <DebugSection title="Frame"><DebugJsonViewer value={snapshot.frame} /></DebugSection>
          <DebugSection title="Board/FEN"><DebugJsonViewer value={snapshot.board} /></DebugSection>
          <DebugSection title="Visuals"><DebugJsonViewer value={snapshot.visual} /></DebugSection>
          <DebugSection title="Continuation"><DebugJsonViewer value={snapshot.continuation} /></DebugSection>
          <DebugSection title="Maia Opponent"><DebugJsonViewer value={(snapshot as any).maia ?? { summary: "not_available" }} /></DebugSection>
          <DebugSection title="Coach"><DebugJsonViewer value={snapshot.coach} /></DebugSection>
          <DebugSection title="Coach Pipeline"><DebugJsonViewer value={snapshot.coachPipeline} /></DebugSection>
          <DebugSection title="Actions"><DebugJsonViewer value={snapshot.actions} /></DebugSection>
          <DebugSection title="Features"><DebugJsonViewer value={snapshot.features} /></DebugSection>
          <DebugSection title="Plans"><DebugJsonViewer value={snapshot.plans} /></DebugSection>
          <DebugSection title="Opportunities"><DebugJsonViewer value={snapshot.opportunities} /></DebugSection>
          <DebugSection title="Templates"><DebugJsonViewer value={snapshot.explanation} /></DebugSection>
          <DebugSection title="Presentation"><DebugJsonViewer value={snapshot.presentation} /></DebugSection>
          <DebugSection title="Legacy"><DebugJsonViewer value={snapshot.legacy} /></DebugSection>
          <DebugSection title="Cache/Performance"><DebugJsonViewer value={{ cache: snapshot.cache, performance: snapshot.performance }} /></DebugSection>
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
