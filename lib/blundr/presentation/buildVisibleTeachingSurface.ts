import type { EvidenceGraph } from "../brain/types";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { SafetyGateOutput } from "../safety/types";
import { buildSurfaceActions } from "./actionPolicyBuilder";
import { buildSurfaceCopy } from "./copySurfaceBuilder";
import { resolveTeachingSurfaceMode } from "./modeSurfacePolicy";
import { mapVisualIntentsToSurfaceRecipes } from "./visualRecipeMapper";
import type { VisibleTeachingSurface } from "./types";
import { buildSurfaceDebug } from "./surfaceDebug";

export interface BuildVisibleTeachingSurfaceInput {
  frame: CurrentInstructionFrame;
  graph: EvidenceGraph;
  safetyOutput: SafetyGateOutput;
  requestedMode: "assisted" | "plain";
  showMoreRevealed: boolean;
}

type LegacyBuildVisibleTeachingSurfaceInput = {
  currentInstructionFrame?: CurrentInstructionFrame;
  trainerPresentationFrame?: any;
  trainerView?: "assisted" | "plain";
  showMoreShown?: boolean;
  [key: string]: unknown;
};

function isCanonicalInput(input: unknown): input is BuildVisibleTeachingSurfaceInput {
  const candidate = input as BuildVisibleTeachingSurfaceInput;
  return Boolean(candidate && candidate.frame && candidate.graph && candidate.safetyOutput);
}

function buildLegacyCompatibilitySurface(input: LegacyBuildVisibleTeachingSurfaceInput): any {
  const frame = input.currentInstructionFrame;
  const target = frame?.target ?? null;
  const trainerView = input.trainerView ?? "assisted";
  const showMoreShown = Boolean(input.showMoreShown);
  const plainPre = trainerView === "plain" && !showMoreShown;

  return {
    owner: target ? "trainer_presentation_frame" : "no_instruction_target",
    isBrainTeachingFrame: Boolean(target),
    targetUci: target?.uci ?? null,
    targetSan: target?.san ?? null,
    targetPieceType: target?.pieceType ?? null,
    coach: {
      shouldRender: true,
      title: plainPre ? "Find the next move" : "Training position",
      body: plainPre ? null : "Follow the coaching guidance.",
      suppressedReason: null,
    },
    hint: {
      text: plainPre ? "Look for an improving move." : null,
      suppressed: false,
    },
    showMore: {
      shown: showMoreShown,
      content: showMoreShown ? "Additional explanation is available." : null,
      actionAvailable: plainPre,
    },
    visual: {
      shouldRender: !plainPre && Boolean(target),
      lines: [],
      highlights: [],
      source: "legacy_compatibility",
      blockedReason: plainPre ? "plain_pre_showmore_visuals_hidden" : null,
    },
    actions: plainPre ? ["hint", "show_more"] : ["hint"],
    safety: {
      blocked: false,
      reason: null,
      targetMismatch: false,
      pieceMismatch: false,
      legacyBypassDetected: false,
      plainLeakDetected: false,
    },
    debug: {
      legacyCompatibility: true,
      visibleActionOwner: "legacy_compatibility",
      visibleCoachOwner: "legacy_compatibility",
      visibleVisualOwner: "legacy_compatibility",
      plainLeakDetected: false,
      fourTargetMismatch: false,
      twoPieceTypeMismatch: false,
    },
  };
}

export function detectPlainTeachingLeak(texts: string[], actionsJson: string, visualsJson: string): boolean {
  const haystack = `${texts.join("\n")}\n${actionsJson}\n${visualsJson}`.toLowerCase();
  const patterns: RegExp[] = [
    /[a-h][1-8][a-h][1-8]/,
    /\b[nbrqk][a-h]?[1-8]?x?[a-h][1-8](=[nbrq])?[+#]?/i,
    /\b[a-h][1-8]\b/,
    /\bbishop\b|\bknight\b|\brook\b|\bqueen\b|\bking\b|\bpawn\b/i,
    /\bshow\s+answer\b/i,
  ];
  return patterns.some((pattern) => pattern.test(haystack));
}

export function buildVisibleTeachingSurface(input: LegacyBuildVisibleTeachingSurfaceInput): any;
export function buildVisibleTeachingSurface(input: BuildVisibleTeachingSurfaceInput): VisibleTeachingSurface;
export function buildVisibleTeachingSurface(
  input: BuildVisibleTeachingSurfaceInput | LegacyBuildVisibleTeachingSurfaceInput,
): VisibleTeachingSurface | any {
  if (!isCanonicalInput(input)) {
    return buildLegacyCompatibilitySurface(input);
  }

  const safeFrame = input.safetyOutput.safeFrame;
  const mode = resolveTeachingSurfaceMode({
    requestedMode: input.requestedMode,
    showMoreRevealed: input.showMoreRevealed,
    frame: input.frame,
    safetyOutput: input.safetyOutput,
  });
  const issueCodes = input.safetyOutput.result.issues.map((issue) => issue.code);
  const fatalReasons = input.safetyOutput.result.fatalReasons ?? input.safetyOutput.result.blockedReasons;
  const recoverableReasons = input.safetyOutput.result.recoverableReasons ?? [];
  const blocked = mode === "blocked";
  const recoveredBySafeTeachingCopy = !blocked && recoverableReasons.length > 0;
  const mismatchCodes = new Set(["target_mismatch", "compiler_target_mismatch", "graph_target_mismatch"]);

  const surfaceBase: VisibleTeachingSurface = {
    frameKey: safeFrame.frameKey,
    mode,
    targetUci: safeFrame.targetUci,
    targetSan: safeFrame.targetSan,
    pieceType: safeFrame.pieceType,
    copy: buildSurfaceCopy({
      mode,
      safeFrame,
      requestedMode: input.requestedMode,
      showMoreRevealed: input.showMoreRevealed,
    }),
    visuals: mapVisualIntentsToSurfaceRecipes({ mode, safeFrame }),
    actions: buildSurfaceActions({ mode, safeFrame }),
    safety: {
      allowed: input.safetyOutput.result.allowed,
      criticalIssues: input.safetyOutput.result.criticalIssues.map((issue) => issue.code),
      warnings: input.safetyOutput.result.warningReasons,
      originalFrameBlocked: input.safetyOutput.originalFrameBlocked,
      blocked,
      blockedReason: blocked ? (fatalReasons[0] ?? input.safetyOutput.result.blockedReasons[0] ?? null) : null,
      blockedSeverity: blocked ? "fatal" : (recoverableReasons.length > 0 ? "recoverable" : null),
      blockedPolicy: blocked ? "fatal_safety_policy" : (recoverableReasons.length > 0 ? "recoverable_safe_teaching_copy" : null),
      targetMismatch: issueCodes.some((code) => mismatchCodes.has(code)),
      pieceMismatch: issueCodes.includes("piece_mismatch"),
      visualMismatch: issueCodes.includes("visual_mismatch"),
      revealMismatch: issueCodes.includes("reveal_mismatch"),
      plainLeakDetected: issueCodes.includes("plain_leak"),
      unsupportedStrongClaim: issueCodes.includes("unsupported_strong_claim") || issueCodes.includes("claim_without_evidence"),
      recoveredBySafeTeachingCopy,
    },
    provenance: {
      frameKey: safeFrame.provenance.frameKey,
      graphTargetUci: safeFrame.provenance.graphTargetUci,
      compilerVersion: safeFrame.provenance.compilerVersion,
      surfaceVersion: "v2.8.0-package9-visible-surface",
    },
    debug: {
      sourceSafeFrame: true,
      hiddenVisualCount: 0,
      actionKinds: [],
      targetVisualUcis: [],
    },
  };

  return {
    ...surfaceBase,
    debug: buildSurfaceDebug({ surface: surfaceBase }),
  };
}

export default buildVisibleTeachingSurface;
