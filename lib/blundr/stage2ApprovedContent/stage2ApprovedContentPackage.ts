import { STAGE2_APPROVED_CONTENT_APPROVED_PACKETS } from "./stage2ApprovedContentPackage.client.generated";
import {
  STAGE2_APPROVED_CONTENT_APPROVED_PACKAGE_ID,
  STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID,
  type Stage2ApprovedContentPromotedPacket,
  type Stage2ApprovedContentResolverRequest,
  type Stage2ApprovedContentResolverResult,
} from "./stage2ApprovedContentPackage.types";

const DEFAULT_CANDIDATE_ZIP_PATH = `${process.cwd()}/docs/2026-06-17/${STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID}.zip`;

const DEFAULT_APPROVED_PACKETS_PATH = `${process.cwd()}/data/blundr/${STAGE2_APPROVED_CONTENT_APPROVED_PACKAGE_ID}/approved-packets.jsonl`;
export const STAGE2_APPROVED_CONTENT_COPY_PATCH_PATH = `${process.cwd()}/data/blundr/stage2-approved-content-copy-polish-patch-v1/copy-patch.jsonl`;

const DEFAULT_APPROVED_PACKETS_PATHS = [
  DEFAULT_APPROVED_PACKETS_PATH,
  `${process.cwd()}/data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl`,
  STAGE2_APPROVED_CONTENT_COPY_PATCH_PATH,
] as const;

const KNOWN_APPROVED_PACKET_PATHS = new Set(DEFAULT_APPROVED_PACKETS_PATHS.map((entry) => normalizeText(entry)));

function isKnownApprovedPacketPath(value: string): boolean {
  const normalized = normalizeText(value);
  return [...KNOWN_APPROVED_PACKET_PATHS].some((knownPath) => normalized === knownPath || knownPath.endsWith(`/${normalized}`));
}

type Stage2ApprovedContentSurfaceCopy = {
  title: string;
  body: string;
  hint?: string;
  showMore?: string;
  commonMistake?: string;
  remediation?: string;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeLower(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function normalizeSequenceInput(sequence: string[] | null | undefined, fallback: string[]): string[] {
  return Array.isArray(sequence) && sequence.length > 0 ? sequence.map((entry) => normalizeText(entry)) : fallback;
}

function buildPlayKeyBefore(sequence: string[]): string {
  if (sequence.length <= 1) return "";
  return sequence.slice(0, -1).join(",");
}

function stripMoveUci(uci: string): string {
  return normalizeText(uci).toLowerCase();
}

function collectTextFields(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectTextFields(entry, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      collectTextFields(entry, out);
    }
  }
  return out;
}

function normalizeSideToMove(value: unknown): string {
  const text = normalizeLower(value);
  if (text === "w" || text === "white") return "white";
  if (text === "b" || text === "black") return "black";
  return text;
}

function packetTextHasTargetLeak(surfaceCopy: Record<string, unknown> | null | undefined, targetUci: string, targetSan: string): boolean {
  const haystack = collectTextFields(surfaceCopy ?? {}).join("\n").toLowerCase();
  return Boolean((targetUci && haystack.includes(targetUci.toLowerCase())) || (targetSan && haystack.includes(targetSan.toLowerCase())));
}

function buildApprovedPacketMatchSequence(
  packet: Stage2ApprovedContentPromotedPacket,
  useNormalizedSequence: boolean,
): string[] {
  return normalizeSequenceInput(useNormalizedSequence ? packet.normalizedPlaySequenceUci : null, packet.playSequenceUci);
}

function packetMatchesExactApprovedContext(
  packet: Stage2ApprovedContentPromotedPacket,
  request: Stage2ApprovedContentResolverRequest,
): boolean {
  const openingId = normalizeText(request.openingId);
  const targetUci = normalizeLower(request.targetUci);
  const targetSan = normalizeText(request.targetSan ?? "");
  const playKeyBefore = normalizeText(request.playKeyBefore ?? "");
  const playKey = normalizeText(request.playKey ?? "");
  if (!openingId || !targetUci) return false;
  if (normalizeText(packet.openingId) !== openingId) return false;
  if (normalizeLower(packet.normalizedMoveUci ?? packet.moveUci) !== targetUci) return false;
  if (normalizeText(packet.status) !== "approved") return false;
  if (normalizeText(packet.approvalReadiness) !== "app_validated") return false;
  if (normalizeText(packet.safetyStatus) !== "safe") return false;
  if (normalizeText((packet.runtimeReconciliation as { status?: string } | undefined)?.status) !== "matched") return false;
  if (normalizeText((packet.runtimeReconciliation as { openingId?: string } | undefined)?.openingId) !== openingId) return false;
  if (request.learnerSide && normalizeSideToMove(packet.learnerSide) !== normalizeSideToMove(request.learnerSide)) return false;
  if (request.sideToMove && normalizeSideToMove(packet.sideToMove) !== normalizeSideToMove(request.sideToMove)) return false;
  if (normalizeText(packet.visualRecipe?.targetMoveUci ?? "") && normalizeLower(packet.visualRecipe.targetMoveUci) !== targetUci) return false;

  const normalizedSequence = buildApprovedPacketMatchSequence(packet, true);
  const rawSequence = buildApprovedPacketMatchSequence(packet, false);
  const moveIndex = Math.max(0, Math.min(normalizedSequence.length - 1, Number(packet.ply) - 1));
  const normalizedPlayKeyBefore = normalizedSequence.slice(0, moveIndex).join(",");
  const normalizedPlayKeyAtTarget = normalizedSequence.slice(0, moveIndex + 1).join(",");
  const rawPlayKeyBefore = rawSequence.slice(0, moveIndex).join(",");
  const rawPlayKeyAtTarget = rawSequence.slice(0, moveIndex + 1).join(",");
  const expectedPlayKeyAtTarget = playKey || (playKeyBefore && targetUci ? `${playKeyBefore},${targetUci}` : targetUci);

  if (playKeyBefore) {
    const playKeyBeforeMatches = playKeyBefore === normalizedPlayKeyBefore || playKeyBefore === rawPlayKeyBefore;
    if (!playKeyBeforeMatches) return false;
  }
  if (expectedPlayKeyAtTarget) {
    const playKeyMatches = expectedPlayKeyAtTarget === normalizedPlayKeyAtTarget || expectedPlayKeyAtTarget === rawPlayKeyAtTarget;
    if (!playKeyMatches) return false;
  }
  if (targetSan) {
    const packetSan = normalizeText(packet.moveSan);
    if (!packetSan || packetSan.toLowerCase() !== targetSan.toLowerCase()) return false;
  }

  if (request.surface === "plain_hint") {
    const plainSurface = packet.surfaces?.[request.surface] ?? null;
    if (!plainSurface) return false;
    if (packetTextHasTargetLeak(plainSurface as Record<string, unknown>, targetUci, targetSan)) return false;
  }

  return true;
}

function surfaceCopyFromPacket(
  packet: Stage2ApprovedContentPromotedPacket,
  surface: Stage2ApprovedContentResolverRequest["surface"],
): Stage2ApprovedContentSurfaceCopy {
  const surfaceCopy = packet.surfaces?.[surface] ?? null;
  const plainHint = packet.surfaces?.plain_hint ?? null;
  const plainShowMore = packet.surfaces?.plain_show_more ?? null;
  return {
    title:
      surfaceCopy?.title ??
      (surface === "plain_hint" ? plainHint?.title : null) ??
      packet.coachCard.title,
    body:
      surfaceCopy?.body ??
      (surface === "plain_hint" ? plainHint?.body : null) ??
      (surface === "plain_show_more" ? plainShowMore?.body : null) ??
      packet.coachCard.body,
    ...(surface === "plain_hint" && plainHint?.body ? { hint: plainHint.body } : {}),
    ...(surface === "plain_show_more" && plainShowMore?.body ? { showMore: plainShowMore.body } : {}),
  };
}

function materializeApprovedPacketSurface(
  packet: Stage2ApprovedContentPromotedPacket,
  surface: Stage2ApprovedContentResolverRequest["surface"],
): Stage2ApprovedContentPromotedPacket & {
  surface: Stage2ApprovedContentResolverRequest["surface"];
  title: string;
  body: string;
  hint?: string;
  showMore?: string;
  commonMistake?: string;
  remediation?: string;
  visualRecipeRefs: string[];
  evidenceIds: string[];
  sourceFile: string;
  sourceSection: string;
} {
  const copy = surfaceCopyFromPacket(packet, surface);
  return {
    ...packet,
    surface,
    ...copy,
    visualRecipeRefs: [packet.visualRecipe.recipeId],
    evidenceIds: Array.isArray((packet.evidence as any)?.claimTypes)
      ? [...(packet.evidence as any).claimTypes.map((entry: unknown) => String(entry))]
      : [],
    sourceFile: `${STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID}/packets/${packet.openingId}.approved-candidates.jsonl`,
    sourceSection: packet.lineId,
    runtimeReconciliation: {
      status: "matched",
      openingId: packet.openingId,
      playKey: packet.playKey,
      lineId: packet.lineId,
      moveUci: packet.moveUci,
    },
    safetyStatus: "safe",
  };
}

function getApprovedPacketsForRequestedPaths(approvedPacketsPaths: string[] = [...DEFAULT_APPROVED_PACKETS_PATHS]): Stage2ApprovedContentPromotedPacket[] {
  const normalizedPaths = approvedPacketsPaths.map((entry) => normalizeText(entry)).filter(Boolean);
  if (normalizedPaths.length === 0) return [];
  const knownPathRequested = normalizedPaths.some((entry) => isKnownApprovedPacketPath(entry));
  return knownPathRequested ? STAGE2_APPROVED_CONTENT_APPROVED_PACKETS : [];
}

export function resolveStage2ApprovedContentPacket(
  request: Stage2ApprovedContentResolverRequest,
  approvedPacketsPath: string = DEFAULT_APPROVED_PACKETS_PATH,
): Stage2ApprovedContentResolverResult {
  const resolvedApprovedPacketsPath = normalizeText(request.approvedPacketsPath ?? approvedPacketsPath) || DEFAULT_APPROVED_PACKETS_PATH;
  if (!isKnownApprovedPacketPath(resolvedApprovedPacketsPath)) {
    return { kind: "none", reason: "approved_bundle_missing" };
  }
  const surface = normalizeText(request.surface) as Stage2ApprovedContentResolverRequest["surface"];
  const match = STAGE2_APPROVED_CONTENT_APPROVED_PACKETS.find((packet) => {
    if (surface && !packet.surfaces?.[surface]) return false;
    return packetMatchesExactApprovedContext(packet, request);
  });

  if (!match) {
    return { kind: "none", reason: "approved_packet_exact_match_not_found" };
  }

  return { kind: "approved_packet", packet: materializeApprovedPacketSurface(match, surface) };
}

export function resolveStage2ApprovedContentPacketCollection(
  request: Stage2ApprovedContentResolverRequest,
  approvedPacketsPaths: string[] = [...DEFAULT_APPROVED_PACKETS_PATHS],
): Stage2ApprovedContentResolverResult {
  const packets = getApprovedPacketsForRequestedPaths(approvedPacketsPaths);
  if (packets.length === 0) {
    return { kind: "none", reason: "approved_bundle_missing" };
  }
  const surface = normalizeText(request.surface) as Stage2ApprovedContentResolverRequest["surface"];
  const match = packets.find((packet) => {
    if (surface && !packet.surfaces?.[surface]) return false;
    return packetMatchesExactApprovedContext(packet, request);
  });
  if (!match) {
    return { kind: "none", reason: "approved_packet_exact_match_not_found" };
  }
  return { kind: "approved_packet", packet: materializeApprovedPacketSurface(match, surface) };
}

export function getStage2ApprovedContentCandidatePackageDefaultPath(): string {
  return DEFAULT_CANDIDATE_ZIP_PATH;
}

export function getStage2ApprovedContentApprovedPacketsDefaultPath(): string {
  return DEFAULT_APPROVED_PACKETS_PATH;
}
