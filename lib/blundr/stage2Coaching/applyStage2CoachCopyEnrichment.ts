import type { Stage2CoachingPacketResolution, CoachingSurface } from "./stage2CoachingTypes";

type Stage2VisibleSurfaceMode =
  | "assisted"
  | "plain_before_show_more"
  | "plain_after_show_more"
  | "branch_complete"
  | "continuation_analyzing"
  | "opponent_replying"
  | "terminal"
  | "blocked";

export type Stage2CoachCopy = {
  title: string;
  body: string;
  bullets: string[];
};

type Stage2CoachCopyEnrichmentInput = {
  currentMode: string | null | undefined;
  targetUci?: string | null;
  targetSan?: string | null;
  baseCopy: Stage2CoachCopy;
  resolution: Stage2CoachingPacketResolution;
};

export type Stage2CoachCopyEnrichmentResult = {
  copy: Stage2CoachCopy;
  applied: boolean;
  reason: string;
  resolvedSurface: CoachingSurface;
};

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function mapModeToSurface(mode: string | null | undefined): CoachingSurface {
  const value = normalize(mode) as Stage2VisibleSurfaceMode;
  if (value === "assisted") return "assisted";
  if (value === "plain_after_show_more") return "plain_show_more";
  if (value === "plain_before_show_more") return "plain_hint";
  return "debug_only";
}

function hasPlainPreShowMoreLeak(packetText: string, targetUci?: string | null, targetSan?: string | null): boolean {
  const haystack = normalize(packetText);
  const uci = normalize(targetUci);
  const san = normalize(targetSan);
  if (uci && haystack.includes(uci)) return true;
  if (san && haystack.includes(san)) return true;
  return false;
}

export function applyStage2CoachCopyEnrichment(input: Stage2CoachCopyEnrichmentInput): Stage2CoachCopyEnrichmentResult {
  const resolvedSurface = mapModeToSurface(input.currentMode);
  const base = input.baseCopy;

  if (input.resolution.kind !== "approved_packet") {
    return { copy: base, applied: false, reason: `resolution_kind_${input.resolution.kind}`, resolvedSurface };
  }

  const packet = input.resolution.packet;
  if (packet.status !== "approved") {
    return { copy: base, applied: false, reason: `packet_status_${packet.status}`, resolvedSurface };
  }
  if (packet.safetyStatus !== "safe") {
    return { copy: base, applied: false, reason: `packet_safety_${packet.safetyStatus}`, resolvedSurface };
  }
  if (packet.runtimeReconciliation.status !== "matched") {
    return { copy: base, applied: false, reason: "packet_runtime_unmatched", resolvedSurface };
  }
  if (packet.surface !== resolvedSurface) {
    return { copy: base, applied: false, reason: `packet_surface_${packet.surface}_mismatch_${resolvedSurface}`, resolvedSurface };
  }

  if (resolvedSurface === "plain_hint") {
    const packetText = [
      packet.title,
      packet.body,
      packet.hint ?? "",
      packet.showMore ?? "",
      packet.commonMistake ?? "",
      packet.remediation ?? "",
    ].join("\n");
    if (hasPlainPreShowMoreLeak(packetText, input.targetUci, input.targetSan)) {
      return { copy: base, applied: false, reason: "plain_pre_show_more_target_leak", resolvedSurface };
    }
  }

  const nextTitle = packet.title || base.title;
  const nextBody =
    resolvedSurface === "plain_show_more"
      ? (packet.showMore || packet.body || base.body)
      : resolvedSurface === "plain_hint"
        ? (packet.hint || packet.body || base.body)
        : (packet.body || base.body);

  return {
    copy: {
      title: nextTitle,
      body: nextBody,
      bullets: base.bullets,
    },
    applied: true,
    reason: "approved_packet_applied",
    resolvedSurface,
  };
}

export function mapVisibleSurfaceModeToStage2CoachingSurface(mode: string | null | undefined): CoachingSurface {
  return mapModeToSurface(mode);
}
