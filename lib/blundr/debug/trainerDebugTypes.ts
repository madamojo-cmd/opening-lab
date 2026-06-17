import type { Stage2FeatureTrace, Stage2FeatureTraceTimelineEntry } from "./stage2FeatureTraceTypes";
import type { Stage2ProviderWarning, Stage2ProviderWarningSummary } from "../providers/providerWarningPolicy";
import type { TrainerFrameResolution, TrainerFrameVisualResult } from "./trainerFrameResolutionTypes";

export type DebugStatus = "pass" | "warn" | "fail";

export interface DebugEvent {
  id: number;
  ts: number;
  type:
    | "frame_changed"
    | "view_changed"
    | "visual_recipe_changed"
    | "visual_render_blocked"
    | "coach_decision_changed"
    | "opportunity_selected"
    | "template_selected"
    | "template_blocked"
    | "coach_action_clicked"
    | "reveal_state_changed"
    | "continuation_candidate_changed"
    | "continuation_lines_blocked"
    | "legacy_bypass_detected";
  action?: string;
  normalizedAction?: string;
  before?: unknown;
  after?: unknown;
  result?: "handled" | "ignored" | "no_op" | "blocked" | "error";
  reason?: string;
  details?: Record<string, unknown>;
}

export interface TrainerDebugSnapshot {
  generatedAt: number;
  build: {
    version?: string;
    branch?: string;
    commit?: string;
    environment: "development" | "production" | "test";
    debugEnabled: boolean;
  };
  frame: Record<string, unknown>;
  board: Record<string, unknown>;
  visual: Record<string, unknown>;
  continuation: Record<string, unknown>;
  promotion?: Record<string, unknown>;
  runtime: Record<string, unknown>;
  maia?: Record<string, unknown>;
  coach: Record<string, unknown>;
  actions: Record<string, unknown>;
  features: Record<string, unknown>;
  plans: Record<string, unknown>;
  opportunities: Record<string, unknown>;
  featureTrace?: Stage2FeatureTrace | Record<string, unknown>;
  featureTraceTimeline?: Stage2FeatureTraceTimelineEntry[] | Array<Record<string, unknown>>;
  trainerFrameResolution?: TrainerFrameResolution | Record<string, unknown>;
  providerWarnings?: Stage2ProviderWarning[];
  providerWarningSummary?: Stage2ProviderWarningSummary;
  visualResult?: TrainerFrameVisualResult | Record<string, unknown>;
  explanation: Record<string, unknown>;
  presentation: Record<string, unknown>;
  legacy: Record<string, unknown>;
  cache: Record<string, unknown>;
  performance: Record<string, unknown>;
  coachPipeline: {
    selectedTheme: string | null;
    selectedOpportunityId: string | null;
    selectedOpportunityLayer: string | null;
    selectedOpportunityScore: number | null;
    selectedTemplateId: string | null;
    title?: string | null;
    body?: string | null;
    source: string | null;
    usedFallback: boolean;
    fallbackReason: string | null;
    evidenceTags: string[];
    qualityScore: number | null;
    pipelineQualityScore?: number | null;
    renderedQualityScore?: number | null;
    qualityScoreSource?: string | null;
    qualityScoreReasonCodes?: string[];
    provenanceConsistent: boolean;
    provenanceIssues: string[];
  };
  coachTimelineSummary: {
    totalFrames: number;
    instructionalFrames: number;
    fallbackCount: number;
    // v2.7.39.1 per Coach Perfection Gate: split fallbacks for clarity
    instructionalFallbackCount: number;
    opponentStatusFallbackCount: number;
    terminalFallbackCount: number;
    lowQualityCount: number;
    debugLeakCount: number;
    repeatedGenericCount: number;
    pieceMismatchCount: number;
    targetMismatchCount: number;
    averageInstructionalQualityScore: number | null;
    uniqueThemes: string[];
  };
  coachTimeline: Array<Record<string, unknown>>;
  coachCardRenderTimeline?: Array<Record<string, unknown>>;
  surfaceModeTransitionTimeline?: Array<Record<string, unknown>>;
  actionTimeline?: Array<Record<string, unknown>>;
  visualRenderTimeline?: Array<Record<string, unknown>>;
  plainLeakTimeline?: Array<Record<string, unknown>>;
  maiaTimeline?: Array<Record<string, unknown>>;
  debugParity?: Record<string, unknown>;
  health: {
    criticalIssues: string[];
    warnings: string[];
    passFail: Record<string, boolean | "unknown">;
  };
  eventLog: DebugEvent[];
}
