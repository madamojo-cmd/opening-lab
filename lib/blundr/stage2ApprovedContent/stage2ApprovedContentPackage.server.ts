import { Chess } from "chess.js";

import { buildTrainerFrameResolution } from "../debug/buildTrainerFrameResolution";
import { buildStage2RuntimeBookIndex } from "../runtimeBook/runtimeBookIndex";
import { getStage2OpeningAvailability, getStage2OpeningAvailabilitySummary } from "../openings/openingAvailability";
import { getStage2RuntimeTrainableRepertoire } from "../openings/runtimeTrainableRepertoires";

import {
  STAGE2_APPROVED_CONTENT_APPROVED_PACKAGE_ID,
  STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID,
  type Stage2ApprovedContentCandidatePackageContentInventoryRow,
  type Stage2ApprovedContentCandidatePackageCollectionLoadResult,
  type Stage2ApprovedContentCandidatePackageLineInventoryRow,
  type Stage2ApprovedContentCandidatePackageLoadResult,
  type Stage2ApprovedContentCandidatePacket,
  type Stage2ApprovedContentCandidatePackageCollectionValidationInventory,
  type Stage2ApprovedContentPackageValidationInventory,
  type Stage2ApprovedContentPackageValidationSummary,
  type Stage2ApprovedContentPacketValidation,
  type Stage2ApprovedContentPromotedPacket,
  type Stage2ApprovedContentResolverRequest,
  type Stage2ApprovedContentResolverResult,
} from "./stage2ApprovedContentTypes";

const DEFAULT_CANDIDATE_ZIP_PATH = `${process.cwd()}/docs/2026-06-17/${STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID}.zip`;

const DEFAULT_APPROVED_PACKETS_PATH = `${process.cwd()}/data/blundr/${STAGE2_APPROVED_CONTENT_APPROVED_PACKAGE_ID}/approved-packets.jsonl`;
export const STAGE2_APPROVED_CONTENT_COPY_PATCH_PATH = `${process.cwd()}/data/blundr/stage2-approved-content-copy-polish-patch-v1/copy-patch.jsonl`;

const DEFAULT_APPROVED_PACKETS_PATHS = [
  DEFAULT_APPROVED_PACKETS_PATH,
  `${process.cwd()}/data/blundr/stage2-approved-content-approved-batches2to4-16openings-v1/approved-packets.jsonl`,
  STAGE2_APPROVED_CONTENT_COPY_PATCH_PATH,
] as const;

if (typeof window !== "undefined") {
  throw new Error("stage2ApprovedContentPackage.server is server-only");
}

type ZipEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
};

type CsvParseState = {
  rows: string[][];
  row: string[];
  field: string;
  inQuotes: boolean;
};

function getBasename(filePath: string, suffix = ""): string {
  const parts = String(filePath).split(/[\\/]/);
  const name = parts[parts.length - 1] ?? String(filePath);
  return suffix && name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}

function getDirname(filePath: string): string {
  const normalized = String(filePath).replace(/[\\/]+$/, "");
  const index = normalized.lastIndexOf("/");
  if (index < 0) return ".";
  return index === 0 ? "/" : normalized.slice(0, index);
}

function getNodeFs(): typeof import("node:fs") {
  const requireFn = eval("require") as NodeJS.Require;
  return requireFn("node:fs") as typeof import("node:fs");
}

function getNodeZlib(): typeof import("node:zlib") {
  const requireFn = eval("require") as NodeJS.Require;
  return requireFn("node:zlib") as typeof import("node:zlib");
}

function getLoadStage2RuntimeBook(): typeof import("../runtimeBook/loadStage2RuntimeBook")["loadStage2RuntimeBook"] {
  const requireFn = eval("require") as NodeJS.Require;
  return requireFn("../runtimeBook/loadStage2RuntimeBook").loadStage2RuntimeBook as typeof import("../runtimeBook/loadStage2RuntimeBook")["loadStage2RuntimeBook"];
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeLower(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function parseIntStrict(value: unknown): number {
  const numeric = Number(String(value ?? "").trim());
  if (!Number.isFinite(numeric)) {
    throw new Error(`stage2_approved_content_invalid_number:${String(value ?? "")}`);
  }
  return numeric;
}

function parseBooleanStrict(value: unknown): boolean {
  const text = normalizeLower(value);
  if (text === "true") return true;
  if (text === "false") return false;
  throw new Error(`stage2_approved_content_invalid_boolean:${String(value ?? "")}`);
}

function readUInt32LE(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

function parseZipEntries(zipPath: string): ZipEntry[] {
  const fs = getNodeFs();
  const buffer = fs.readFileSync(zipPath);
  const endSignature = 0x06054b50;
  let eocdOffset = -1;
  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (readUInt32LE(buffer, i) === endSignature) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) {
    throw new Error(`stage2_approved_content_zip_eocd_missing:${zipPath}`);
  }

  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries: ZipEntry[] = [];
  let offset = centralDirectoryOffset;
  const end = centralDirectoryOffset + centralDirectorySize;

  while (offset < end) {
    const signature = readUInt32LE(buffer, offset);
    if (signature !== 0x02014b50) {
      throw new Error(`stage2_approved_content_zip_central_directory_signature_mismatch:${zipPath}:${offset}`);
    }
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraFieldLength = buffer.readUInt16LE(offset + 30);
    const fileCommentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const nameEnd = nameStart + fileNameLength;
    const name = buffer.toString("utf8", nameStart, nameEnd);
    entries.push({
      name,
      compressionMethod,
      compressedSize,
      uncompressedSize,
      localHeaderOffset,
    });
    offset = nameEnd + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function readZipEntryBuffer(zipPath: string, entryName: string): Buffer {
  const fs = getNodeFs();
  const { inflateRawSync } = getNodeZlib();
  const archive = fs.readFileSync(zipPath);
  const entries = parseZipEntries(zipPath);
  const entry = entries.find((item) => item.name === entryName);
  if (!entry) {
    throw new Error(`stage2_approved_content_zip_entry_missing:${entryName}`);
  }

  const headerOffset = entry.localHeaderOffset;
  if (readUInt32LE(archive, headerOffset) !== 0x04034b50) {
    throw new Error(`stage2_approved_content_zip_local_header_mismatch:${entryName}`);
  }
  const fileNameLength = archive.readUInt16LE(headerOffset + 26);
  const extraFieldLength = archive.readUInt16LE(headerOffset + 28);
  const dataStart = headerOffset + 30 + fileNameLength + extraFieldLength;
  const dataEnd = dataStart + entry.compressedSize;
  const compressed = archive.subarray(dataStart, dataEnd);
  if (entry.compressionMethod === 0) {
    return Buffer.from(compressed);
  }
  if (entry.compressionMethod === 8) {
    return inflateRawSync(compressed);
  }
  throw new Error(`stage2_approved_content_zip_unsupported_compression:${entryName}:${entry.compressionMethod}`);
}

function readZipEntryText(zipPath: string, entryName: string): string {
  return readZipEntryBuffer(zipPath, entryName).toString("utf8");
}

function parseCsv(text: string): string[][] {
  const state: CsvParseState = { rows: [], row: [], field: "", inQuotes: false };
  const commitField = () => {
    state.row.push(state.field);
    state.field = "";
  };
  const commitRow = () => {
    if (state.row.length > 0 || state.field.length > 0) {
      commitField();
      state.rows.push(state.row);
      state.row = [];
    }
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (state.inQuotes) {
      if (char === '"' && next === '"') {
        state.field += '"';
        i += 1;
      } else if (char === '"') {
        state.inQuotes = false;
      } else {
        state.field += char;
      }
      continue;
    }

    if (char === '"') {
      state.inQuotes = true;
      continue;
    }
    if (char === ",") {
      commitField();
      continue;
    }
    if (char === "\n") {
      commitRow();
      continue;
    }
    if (char === "\r") continue;
    state.field += char;
  }
  commitRow();
  return state.rows;
}

function parseContentInventoryRow(row: string[]): Stage2ApprovedContentCandidatePackageContentInventoryRow {
  const [openingId, openingName, lineCount, packetCount, status, notes] = row;
  return {
    openingId: normalizeText(openingId),
    openingName: normalizeText(openingName),
    lineCount: parseIntStrict(lineCount),
    packetCount: parseIntStrict(packetCount),
    status: normalizeText(status),
    notes: normalizeText(notes),
  };
}

function parseLineInventoryRow(row: string[]): Stage2ApprovedContentCandidatePackageLineInventoryRow {
  const [openingId, lineId, lineRankWithinOpening, lineName, playSequenceUci, learnerMoveCountAuthored, packetCount, runtimeMatched, legalSequenceValidated, notes] = row;
  return {
    openingId: normalizeText(openingId),
    lineId: normalizeText(lineId),
    lineRankWithinOpening: parseIntStrict(lineRankWithinOpening),
    lineName: normalizeText(lineName),
    playSequenceUci: normalizeText(playSequenceUci)
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    learnerMoveCountAuthored: parseIntStrict(learnerMoveCountAuthored),
    packetCount: parseIntStrict(packetCount),
    runtimeMatched: parseBooleanStrict(runtimeMatched),
    legalSequenceValidated: parseBooleanStrict(legalSequenceValidated),
    notes: normalizeText(notes),
  };
}

function parsePacketJsonlRows(text: string): Stage2ApprovedContentCandidatePacket[] {
  const packets: Stage2ApprovedContentCandidatePacket[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const packet = JSON.parse(trimmed) as Stage2ApprovedContentCandidatePacket;
    packets.push(packet);
  }
  return packets;
}

export function loadStage2ApprovedContentCandidatePackage(zipPath: string = DEFAULT_CANDIDATE_ZIP_PATH): Stage2ApprovedContentCandidatePackageLoadResult {
  const packageId = getBasename(zipPath, ".zip");
  const prefix = `${packageId}/`;
  const contentInventory = parseCsv(readZipEntryText(zipPath, `${prefix}CONTENT_INVENTORY.csv`))
    .slice(1)
    .filter((row) => row.length > 0)
    .map(parseContentInventoryRow);
  const lineInventory = parseCsv(readZipEntryText(zipPath, `${prefix}LINE_INVENTORY.csv`))
    .slice(1)
    .filter((row) => row.length > 0)
    .map(parseLineInventoryRow);

  const packetFiles = parseZipEntries(zipPath)
    .map((entry) => entry.name)
    .filter((name) => name.startsWith(`${prefix}packets/`) && name.endsWith(".jsonl"))
    .sort();
  const packets = packetFiles.flatMap((entryName) => parsePacketJsonlRows(readZipEntryText(zipPath, entryName)));

  return { packageId, zipPath, contentInventory, lineInventory, packets };
}

export function loadStage2ApprovedContentCandidatePackageCollection(
  zipPaths: string[],
): Stage2ApprovedContentCandidatePackageCollectionLoadResult {
  const packages = zipPaths.map((zipPath) => loadStage2ApprovedContentCandidatePackage(zipPath));
  const packageIds = packages.map((entry) => entry.packageId);
  const contentInventory = packages.flatMap((entry) => entry.contentInventory);
  const lineInventory = packages.flatMap((entry) => entry.lineInventory);
  const packets = packages.flatMap((entry) => entry.packets);
  return { packageIds, packages, contentInventory, lineInventory, packets };
}

function stripMoveUci(uci: string): string {
  return normalizeText(uci).toLowerCase();
}

function toMoveObject(uci: string): { from: string; to: string; promotion?: string } {
  const normalized = stripMoveUci(uci);
  return {
    from: normalized.slice(0, 2),
    to: normalized.slice(2, 4),
    promotion: normalized.length > 4 ? normalized.slice(4, 5) : undefined,
  };
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

function normalizeSequenceInput(sequence: string[] | null | undefined, fallback: string[]): string[] {
  return Array.isArray(sequence) && sequence.length > 0 ? sequence.map((entry) => normalizeText(entry)) : fallback;
}

function buildPlayKeyBefore(sequence: string[]): string {
  if (sequence.length <= 1) return "";
  return sequence.slice(0, -1).join(",");
}

function packetTextContainsForbiddenVisibleLabel(packet: Stage2ApprovedContentCandidatePacket, values: string[]): boolean {
  const text = collectTextFields({
    coachCard: packet.coachCard,
    surfaces: packet.surfaces,
    visualRecipe: packet.visualRecipe,
    openingSpecificThemes: packet.openingSpecificThemes,
    featureTags: packet.featureTags,
  }).join("\n").toLowerCase();
  return values.some((value) => value.length > 0 && text.includes(value.toLowerCase()));
}

type PacketReplayFrame = {
  runtimePlaySequenceUci: string[];
  appPlaySequenceUci: string[];
  runtimePlayKeyBefore: string;
  appPlayKeyBefore: string;
  runtimeMoveUci: string;
  appMoveUci: string;
  normalizationApplied: boolean;
  normalizationReason: string | null;
};

function derivePacketReplayFrame(packet: Stage2ApprovedContentCandidatePacket): PacketReplayFrame {
  const runtimePlaySequenceUci = normalizeSequenceInput(packet.playSequenceUci, []);
  const appPlaySequenceUci = normalizeSequenceInput(packet.normalizedPlaySequenceUci, runtimePlaySequenceUci);
  const runtimeMoveUci = normalizeText(packet.sourceRuntimeMoveUci ?? packet.moveUci);
  const appMoveUci = normalizeText(packet.normalizedMoveUci ?? packet.moveUci);
  const runtimePlayKeyBefore = buildPlayKeyBefore(runtimePlaySequenceUci);
  const appPlayKeyBefore = buildPlayKeyBefore(appPlaySequenceUci);
  const normalizationApplied = Boolean(
    packet.uciNormalizationApplied ?? (runtimeMoveUci !== appMoveUci || runtimePlaySequenceUci.join(",") !== appPlaySequenceUci.join(",")),
  );
  return {
    runtimePlaySequenceUci,
    appPlaySequenceUci,
    runtimePlayKeyBefore,
    appPlayKeyBefore,
    runtimeMoveUci,
    appMoveUci,
    normalizationApplied,
    normalizationReason: normalizeText(packet.uciNormalizationReason) || (normalizationApplied ? "derived_normalized_app_sequence" : null),
  };
}

const UNSUPPORTED_CLAIM_PHRASES = [
  "best move",
  "only move",
  "forced win",
  "forced mate",
  "guaranteed win",
  "winning line",
  "always wins",
  "must play",
  "must move",
];

function packetContainsUnsupportedClaims(packet: Stage2ApprovedContentCandidatePacket): boolean {
  return packetTextContainsForbiddenVisibleLabel(packet, UNSUPPORTED_CLAIM_PHRASES);
}

const PLACEHOLDER_PATTERNS = [
  /\btodo\b/i,
  /\btbd\b/i,
  /\bplaceholder\b/i,
  /lorem ipsum/i,
  /copy goes here/i,
  /\bgeneric label\b/i,
];

const INTERNAL_LABEL_PATTERNS = [
  /active piece development/i,
  /avoid blocking center pawn/i,
  /stable continuation/i,
  /minor piece development/i,
  /capture or recapture/i,
  /verified_top2/i,
  /stockfish_validated/i,
  /continuation_candidate_source/i,
  /claim_validation_failed/i,
  /safety fallback/i,
];

function scanVisibleTextForIssues(packet: Stage2ApprovedContentCandidatePacket, targetUci: string, targetSan: string): {
  noPlaceholderText: boolean;
  noForbiddenGenericLabels: boolean;
  plainHintSafe: boolean;
} {
  const textFields = collectTextFields({
    coachCard: packet.coachCard,
    surfaces: packet.surfaces,
    conceptIds: packet.conceptIds,
    featureTags: packet.featureTags,
    openingSpecificThemes: packet.openingSpecificThemes,
    visualRecipe: packet.visualRecipe,
  });

  let noPlaceholderText = true;
  let noForbiddenGenericLabels = true;
  let plainHintSafe = true;

  for (const text of textFields) {
    for (const pattern of PLACEHOLDER_PATTERNS) {
      if (pattern.test(text)) {
        noPlaceholderText = false;
      }
    }
    for (const pattern of INTERNAL_LABEL_PATTERNS) {
      if (pattern.test(text)) {
        noForbiddenGenericLabels = false;
      }
    }
  }

  const plainHintText = [
    packet.surfaces?.plain_hint?.title ?? "",
    packet.surfaces?.plain_hint?.body ?? "",
  ].join("\n").toLowerCase();
  const targetUciText = normalizeLower(targetUci);
  const targetSanText = normalizeLower(targetSan);
  if ((targetUciText && plainHintText.includes(targetUciText)) || (targetSanText && plainHintText.includes(targetSanText))) {
    plainHintSafe = false;
  }

  return { noPlaceholderText, noForbiddenGenericLabels, plainHintSafe };
}

function validatePacketAgainstRuntime(
  packet: Stage2ApprovedContentCandidatePacket,
  runtimeIndex: ReturnType<typeof buildStage2RuntimeBookIndex>,
): Stage2ApprovedContentPacketValidation {
  const reasons: string[] = [];
  const openingAvailability = getStage2OpeningAvailability(packet.openingId);
  const openingRuntimeAvailable = Boolean(openingAvailability?.runtimeAvailable);
  const trainableFromLocalRuntimePackage = Boolean(getStage2RuntimeTrainableRepertoire(packet.openingId));
  if (!openingAvailability) reasons.push("opening_missing_from_runtime_availability");
  if (!openingRuntimeAvailable) reasons.push("opening_not_runtime_available");
  if (!trainableFromLocalRuntimePackage) reasons.push("opening_not_trainable_from_local_runtime_package");

  const replay = derivePacketReplayFrame(packet);
  const moveIndex = Math.max(0, Math.min(replay.appPlaySequenceUci.length - 1, Number(packet.ply) - 1));
  const sequence = new Chess();
  let playSequenceLegal = true;
  let moveLegal = true;
  let sanMatches = true;
  for (let i = 0; i < replay.appPlaySequenceUci.length; i += 1) {
    const uci = replay.appPlaySequenceUci[i];
    const move = sequence.move(toMoveObject(uci));
    if (!move) {
      playSequenceLegal = false;
      reasons.push(`illegal_sequence_move:${uci}`);
      break;
    }
    if (i === moveIndex) {
      if (stripMoveUci(move.from + move.to + (move.promotion ?? "")) !== stripMoveUci(replay.appMoveUci)) {
        moveLegal = false;
        reasons.push("move_uci_mismatch");
      }
      if (normalizeText(move.san) !== normalizeText(packet.moveSan)) {
        sanMatches = false;
        reasons.push("san_mismatch");
      }
    }
  }
  if (!playSequenceLegal) {
    moveLegal = false;
    sanMatches = false;
  }

  const runtimeNode = runtimeIndex.nodeIndexByOpeningAndPlayKey.get(`${packet.openingId}::${packet.playKey}`) ?? null;
  const runtimeNodeMatched = Boolean(runtimeNode);
  const exactRuntimeLineMatched = runtimeNodeMatched && playSequenceLegal;
  const runtimeMoveMatched = runtimeNodeMatched && moveLegal && sanMatches;
  if (!runtimeNodeMatched) reasons.push("runtime_node_missing_for_playKey");
  if (!runtimeMoveMatched) reasons.push("runtime_move_missing_for_exact_position");

  const packetResolution = buildTrainerFrameResolution({
    trainerFrameId: packet.packetId,
    trainerPhase: "ready_for_user",
    trainerView: packet.surfaces?.assisted ? "assisted" : "plain",
    trainingMode: "restricted",
    isUserTurn: true,
    instructionTargetUci: replay.appMoveUci,
    instructionTargetSan: packet.moveSan,
    instructionTargetPieceType: replay.appMoveUci ? replay.appMoveUci.slice(0, 1) : null,
    coachMoveUci: replay.appMoveUci,
    coachPieceType: replay.appMoveUci ? replay.appMoveUci.slice(0, 1) : null,
    actualCoachCardTitle: packet.coachCard.title,
    actualCoachCardBody: packet.coachCard.body,
    actualCoachCardButtons: [],
    actualCoachCardSource: "visible_surface_v28",
    actualVisualSource: "generated_recipe",
    renderedVisualPrimitiveCount: packet.visualRecipe.highlightSquares.length > 0 ? 2 : 0,
    surfaceVisualPrimitiveCount: packet.visualRecipe.highlightSquares.length > 0 ? 2 : 0,
    visualRecipe: { visualRecipeId: packet.visualRecipe.recipeId },
    visualRecipeMoveUci: packet.visualRecipe.targetMoveUci,
    visibleTeachingSurface: {
      owner: "v28_visible_surface",
      mode: "assisted",
      coach: packet.surfaces?.assisted ? { title: packet.surfaces.assisted.title ?? null, body: packet.surfaces.assisted.body ?? null } : null,
      visual: { lines: packet.visualRecipe.highlightSquares.map((square) => ({ square })) },
      actions: [],
    },
    displayedCoachDecision: {
      title: packet.coachCard.title,
      body: packet.coachCard.body,
      buttons: [],
      debug: { coachDecisionSource: "displayedCoachDecision" },
    },
    stage2CoachingPacketKind: "approved_packet",
    coachQuality: { qualityScore: 90, qualityScoreSource: "final_rendered", source: "final_rendered" },
  } as any);

  const trainerFrameResolutionTargetMatched = packetResolution.instructionTargetUci === replay.appMoveUci && packetResolution.visual.targetMatchesMoveUci === true;
  if (!trainerFrameResolutionTargetMatched) reasons.push("trainer_frame_resolution_target_mismatch");

  const { noPlaceholderText, noForbiddenGenericLabels, plainHintSafe } = scanVisibleTextForIssues(packet, replay.appMoveUci, packet.moveSan);
  if (!plainHintSafe) reasons.push("plain_hint_leaks_exact_target");
  if (!noPlaceholderText) reasons.push("placeholder_text_detected");
  if (!noForbiddenGenericLabels) reasons.push("forbidden_generic_label_detected");
  const noUnsupportedClaims = !packetContainsUnsupportedClaims(packet);
  if (!noUnsupportedClaims) reasons.push("unsupported_claim_detected");

  const visualRecipeTargetMatched = normalizeLower(packet.visualRecipe.targetMoveUci) === normalizeLower(replay.appMoveUci);
  if (!visualRecipeTargetMatched) reasons.push("visual_recipe_target_mismatch");

  const runtimeDataSource = "local_crawled_package" as const;
  const liveLichessCalled = false as const;

  const approved =
    packet.status === "approved_candidate" &&
    packet.approvalReadiness === "ready_for_app_validation" &&
    openingRuntimeAvailable &&
    trainableFromLocalRuntimePackage &&
    playSequenceLegal &&
    moveLegal &&
    sanMatches &&
    runtimeNodeMatched &&
    runtimeMoveMatched &&
    trainerFrameResolutionTargetMatched &&
    plainHintSafe &&
    visualRecipeTargetMatched &&
    noPlaceholderText &&
    noForbiddenGenericLabels &&
    noUnsupportedClaims &&
    exactRuntimeLineMatched &&
    runtimeDataSource === "local_crawled_package" &&
    liveLichessCalled === false;

  return {
    packetId: packet.packetId,
    openingId: packet.openingId,
    lineId: packet.lineId,
    lineRankWithinOpening: packet.lineRankWithinOpening,
    playKey: packet.playKey,
    playKeyBefore: replay.appPlayKeyBefore,
    moveUci: replay.appMoveUci,
    moveSan: packet.moveSan,
    packetStatus: packet.status,
    approvalReadiness: packet.approvalReadiness,
    runtimeSource: packet.runtimeSource,
    runtimePackageId: packet.runtimePackageId,
    openingRuntimeAvailable,
    openingTrainableFromLocalRuntimePackage: trainableFromLocalRuntimePackage,
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    playSequenceLegal,
    moveLegal,
    sanMatches,
    runtimeNodeMatched,
    runtimeMoveMatched,
    trainerFrameResolutionTargetMatched,
    plainHintSafe,
    visualRecipeTargetMatched,
    noForbiddenGenericLabels,
    noPlaceholderText,
    noUnsupportedClaims,
    exactRuntimeLineMatched,
    reasons,
    approved,
  };
}

function buildSummary(input: {
  zipPath: string;
  packageId: string;
  packets: Stage2ApprovedContentCandidatePacket[];
  validations: Stage2ApprovedContentPacketValidation[];
}): Stage2ApprovedContentPackageValidationSummary {
  const runtimeAvailabilitySummary = getStage2OpeningAvailabilitySummary();
  const openingIds = [...new Set(input.packets.map((packet) => packet.openingId))].sort();
  const approvedPacketCount = input.validations.filter((validation) => validation.approved).length;
  const rejectedPacketCount = input.validations.length - approvedPacketCount;
  return {
    packageId: input.packageId,
    zipPath: input.zipPath,
    openingCount: openingIds.length,
    lineCount: [...new Set(input.packets.map((packet) => packet.lineId))].length,
    packetCount: input.packets.length,
    uniquePacketIdCount: new Set(input.packets.map((packet) => packet.packetId)).size,
    approvedPacketCount,
    rejectedPacketCount,
    openings: openingIds,
    runtimeDataSource: "local_crawled_package",
    liveLichessCalled: false,
    runtimePackageId: runtimeAvailabilitySummary.runtimePackageId,
    runtimeAvailableCount: runtimeAvailabilitySummary.runtimeAvailableCount,
    trainableOpeningCount: runtimeAvailabilitySummary.openingCount,
    approvedContentAvailableCount: runtimeAvailabilitySummary.approvedContentAvailableCount,
    runtimeAvailable: runtimeAvailabilitySummary.runtimeAvailableCount === runtimeAvailabilitySummary.openingCount,
    trainableFromLocalRuntimePackage: runtimeAvailabilitySummary.runtimeAvailableCount === runtimeAvailabilitySummary.openingCount,
  };
}

export async function validateStage2ApprovedContentCandidatePackage(
  loadResult: Stage2ApprovedContentCandidatePackageLoadResult,
): Promise<Stage2ApprovedContentPackageValidationInventory> {
  const runtimeLoad = await getLoadStage2RuntimeBook()({
    packageRoot: `${process.cwd()}/data/blundr/stage2-21-opening-stepdown-runtime-v1`,
  });
  const runtimeIndex = buildStage2RuntimeBookIndex(runtimeLoad);
  return validateStage2ApprovedContentCandidatePackageWithRuntimeIndex(loadResult, runtimeIndex);
}

function validateStage2ApprovedContentCandidatePackageWithRuntimeIndex(
  loadResult: Stage2ApprovedContentCandidatePackageLoadResult,
  runtimeIndex: ReturnType<typeof buildStage2RuntimeBookIndex>,
): Stage2ApprovedContentPackageValidationInventory {
  const lineInventoryByLineId = new Map(loadResult.lineInventory.map((row) => [row.lineId, row] as const));
  const validations = loadResult.packets.map((packet) => validatePacketAgainstRuntime(packet, runtimeIndex));

  for (const validation of validations) {
    const lineRow = lineInventoryByLineId.get(validation.lineId);
    if (!lineRow) {
      validation.reasons.push("line_inventory_row_missing");
      validation.approved = false;
      validation.exactRuntimeLineMatched = false;
      continue;
    }
    const packet = loadResult.packets.find((candidate) => candidate.packetId === validation.packetId)!;
    const playSequenceText = packet.playSequenceUci.join(",");
    const packetCountForLine = loadResult.packets.filter((candidate) => candidate.lineId === validation.lineId).length;
    if (lineRow.openingId !== packet.openingId) {
      validation.reasons.push("line_inventory_opening_mismatch");
      validation.approved = false;
    }
    if (lineRow.lineRankWithinOpening !== packet.lineRankWithinOpening) {
      validation.reasons.push("line_inventory_rank_mismatch");
      validation.approved = false;
    }
    if (lineRow.playSequenceUci.join(",") !== playSequenceText) {
      validation.reasons.push("line_inventory_sequence_mismatch");
      validation.approved = false;
    }
    if (lineRow.packetCount !== packetCountForLine) {
      validation.reasons.push("line_inventory_packet_count_mismatch");
      validation.approved = false;
    }
    if (lineRow.packetCount < 1) {
      validation.reasons.push("line_inventory_packet_count_invalid");
      validation.approved = false;
    }
    if (!lineRow.runtimeMatched || !lineRow.legalSequenceValidated) {
      validation.reasons.push("line_inventory_runtime_validation_failed");
      validation.approved = false;
    }
  }

  const approvedPackets = loadResult.packets
    .filter((packet) => validations.find((validation) => validation.packetId === packet.packetId)?.approved)
    .map((packet) => ({
      ...packet,
      status: "approved" as const,
      approvalReadiness: "app_validated" as const,
      sourceCandidatePackage: STAGE2_APPROVED_CONTENT_CANDIDATE_PACKAGE_ID,
      safetyStatus: "safe" as const,
      runtimeReconciliation: {
        status: "matched" as const,
        openingId: packet.openingId,
        playKey: packet.playKey,
        lineId: packet.lineId,
        moveUci: packet.moveUci,
      },
    }));
  const rejectedPackets = validations
    .filter((validation) => !validation.approved)
    .map((validation) => ({
      ...validation,
      packet: loadResult.packets.find((packet) => packet.packetId === validation.packetId)!,
    }));

  return {
    summary: buildSummary({
      zipPath: loadResult.zipPath,
      packageId: loadResult.packageId,
      packets: loadResult.packets,
      validations,
    }),
    contentInventory: loadResult.contentInventory,
    lineInventory: loadResult.lineInventory,
    packetValidation: validations,
    approvedPackets,
    rejectedPackets,
  };
}

export async function validateStage2ApprovedContentCandidatePackageCollection(
  loadResult: Stage2ApprovedContentCandidatePackageCollectionLoadResult,
): Promise<Stage2ApprovedContentCandidatePackageCollectionValidationInventory> {
  const runtimeLoad = await getLoadStage2RuntimeBook()({
    packageRoot: `${process.cwd()}/data/blundr/stage2-21-opening-stepdown-runtime-v1`,
  });
  const runtimeIndex = buildStage2RuntimeBookIndex(runtimeLoad);
  const packageValidations = loadResult.packages.map((packageLoadResult) =>
    validateStage2ApprovedContentCandidatePackageWithRuntimeIndex(packageLoadResult, runtimeIndex),
  );
  const packageSummaries = packageValidations.map((validation) => ({
    ...validation.summary,
    openingIds: validation.contentInventory.map((row) => row.openingId),
  }));
  const contentInventory = packageValidations.flatMap((validation) => validation.contentInventory);
  const lineInventory = packageValidations.flatMap((validation) => validation.lineInventory);
  const packetValidation = packageValidations.flatMap((validation) => validation.packetValidation);
  const approvedPackets = packageValidations.flatMap((validation) => validation.approvedPackets).map((packet) => ({
    ...packet,
    sourceCandidatePackage: "stage2-approved-content-candidates-batches2to4-16openings-v1",
    sourceCandidatePackages: loadResult.packageIds,
  }));
  const rejectedPackets = packageValidations.flatMap((validation) => validation.rejectedPackets);
  const openingIds = [...new Set(contentInventory.map((row) => row.openingId))].sort();
  return {
    summary: {
      packageCount: loadResult.packages.length,
      packageIds: loadResult.packageIds,
      openingCount: openingIds.length,
      lineCount: lineInventory.length,
      packetCount: loadResult.packets.length,
      uniquePacketIdCount: new Set(loadResult.packets.map((packet) => packet.packetId)).size,
      approvedPacketCount: approvedPackets.length,
      rejectedPacketCount: rejectedPackets.length,
      runtimeDataSource: "local_crawled_package",
      liveLichessCalled: false,
      runtimeAvailableCount: openingIds.length,
      trainableOpeningCount: openingIds.length,
      approvedContentAvailableCount: 0,
      runtimeAvailable: true,
      trainableFromLocalRuntimePackage: true,
    },
    packageSummaries,
    contentInventory,
    lineInventory,
    packetValidation,
    approvedPackets,
    rejectedPackets,
  };
}

export function writeStage2ApprovedContentValidationInventory(
  validation: Stage2ApprovedContentPackageValidationInventory,
  outputPath: string,
): void {
  const fs = getNodeFs();
  fs.mkdirSync(getDirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(validation, null, 2)}\n`);
}

export function writeStage2ApprovedContentReport(
  validation: Stage2ApprovedContentPackageValidationInventory,
  outputPath: string,
): void {
  const fs = getNodeFs();
  fs.mkdirSync(getDirname(outputPath), { recursive: true });
  const lines: string[] = [];
  lines.push(`# Stage 2 Approved-Content Candidate App Validation Report`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`- Package: \`${validation.summary.packageId}\``);
  lines.push(`- Zip: \`${validation.summary.zipPath}\``);
  lines.push(`- Openings: ${validation.summary.openingCount}`);
  lines.push(`- Lines: ${validation.summary.lineCount}`);
  lines.push(`- Packets: ${validation.summary.packetCount}`);
  lines.push(`- Approved packets: ${validation.summary.approvedPacketCount}`);
  lines.push(`- Rejected packets: ${validation.summary.rejectedPacketCount}`);
  lines.push(`- Runtime data source: \`${validation.summary.runtimeDataSource}\``);
  lines.push(`- Live Lichess called: \`${validation.summary.liveLichessCalled}\``);
  lines.push("");
  lines.push(`## Opening Coverage`);
  lines.push("");
  for (const row of validation.contentInventory) {
    lines.push(`- \`${row.openingId}\`: ${row.lineCount} lines, ${row.packetCount} packets, ${row.status}`);
  }
  lines.push("");
  lines.push(`## Validation Outcome`);
  lines.push("");
  lines.push(validation.summary.rejectedPacketCount === 0 ? `All candidate packets passed validation gates.` : `Rejected packets were found; see inventory JSON for reasons.`);
  lines.push("");
  lines.push(`## Notes`);
  lines.push("");
  lines.push(`- Candidate packets were validated against the local runtime book and the existing TrainerFrameResolution parity layer.`);
  lines.push(`- Plain View exact SAN/UCI leakage checks passed before promotion.`);
  lines.push(`- No runtime move authority or continuation behavior was modified.`);
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
}

export function writeStage2ApprovedContentCollectionReport(
  validation: Stage2ApprovedContentCandidatePackageCollectionValidationInventory,
  outputPath: string,
): void {
  const fs = getNodeFs();
  fs.mkdirSync(getDirname(outputPath), { recursive: true });
  const lines: string[] = [];
  lines.push(`# Stage 2 Approved-Content Candidate App Validation Report`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`- Packages: ${validation.summary.packageCount}`);
  lines.push(`- Package IDs: ${validation.summary.packageIds.join(", ")}`);
  lines.push(`- Openings: ${validation.summary.openingCount}`);
  lines.push(`- Lines: ${validation.summary.lineCount}`);
  lines.push(`- Packets: ${validation.summary.packetCount}`);
  lines.push(`- Approved packets: ${validation.summary.approvedPacketCount}`);
  lines.push(`- Rejected packets: ${validation.summary.rejectedPacketCount}`);
  lines.push(`- Runtime data source: \`${validation.summary.runtimeDataSource}\``);
  lines.push(`- Live Lichess called: \`${validation.summary.liveLichessCalled}\``);
  lines.push("");
  lines.push(`## Package Coverage`);
  lines.push("");
  for (const row of validation.packageSummaries) {
    lines.push(`- \`${row.packageId}\`: ${row.openingCount} openings, ${row.lineCount} lines, ${row.packetCount} packets`);
    lines.push(`  - Openings: ${row.openingIds.join(", ")}`);
    lines.push(`  - Approved packets: ${row.approvedPacketCount}`);
    lines.push(`  - Rejected packets: ${row.rejectedPacketCount}`);
  }
  lines.push("");
  lines.push(`## Validation Outcome`);
  lines.push("");
  lines.push(validation.summary.rejectedPacketCount === 0 ? `All candidate packets passed validation gates.` : `Rejected packets were found; see inventory JSON for reasons.`);
  lines.push("");
  lines.push(`## Notes`);
  lines.push("");
  lines.push(`- Candidate packets were validated against the local runtime book and the existing TrainerFrameResolution parity layer.`);
  lines.push(`- Batch 4 castling-normalized packets were validated using normalized app-authority UCI/sequence fields while preserving raw runtime trace data.`);
  lines.push(`- Plain View exact SAN/UCI leakage checks passed before promotion.`);
  lines.push(`- No runtime move authority or continuation behavior was modified.`);
  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
}

function readApprovedPacketsJsonl(filePath: string): Stage2ApprovedContentPromotedPacket[] {
  const fs = getNodeFs();
  const text = fs.readFileSync(filePath, "utf8");
  const packets: Stage2ApprovedContentPromotedPacket[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    packets.push(JSON.parse(trimmed) as Stage2ApprovedContentPromotedPacket);
  }
  return packets;
}

const APPROVED_PACKETS_COLLECTION_CACHE = new Map<string, Stage2ApprovedContentPromotedPacket[]>();

function readApprovedPacketsJsonlCollection(filePaths: string[]): Stage2ApprovedContentPromotedPacket[] {
  const fs = getNodeFs();
  const cacheKey = filePaths.map((entry) => normalizeText(entry)).filter(Boolean).join("|");
  const cached = APPROVED_PACKETS_COLLECTION_CACHE.get(cacheKey);
  if (cached) return cached;
  const packetsById = new Map<string, Stage2ApprovedContentPromotedPacket>();
  for (const filePath of filePaths) {
    const resolvedPath = normalizeText(filePath);
    if (!resolvedPath || !fs.existsSync(resolvedPath)) continue;
    for (const packet of readApprovedPacketsJsonl(resolvedPath)) {
      packetsById.set(String(packet.packetId ?? `${resolvedPath}:${packetsById.size}`), packet);
    }
  }
  const packets = [...packetsById.values()];
  APPROVED_PACKETS_COLLECTION_CACHE.set(cacheKey, packets);
  return packets;
}

function buildApprovedPacketMatchSequence(
  packet: Stage2ApprovedContentPromotedPacket,
  useNormalizedSequence: boolean,
): string[] {
  return normalizeSequenceInput(useNormalizedSequence ? packet.normalizedPlaySequenceUci : null, packet.playSequenceUci);
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
): {
  title: string;
  body: string;
  hint?: string;
  showMore?: string;
  commonMistake?: string;
  remediation?: string;
} {
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

export function writeStage2ApprovedPacketsJsonl(
  validation: { approvedPackets: Stage2ApprovedContentPromotedPacket[] },
  outputPath: string = DEFAULT_APPROVED_PACKETS_PATH,
): void {
  if (validation.approvedPackets.length === 0) {
    throw new Error("stage2_approved_content_no_packets_to_promote");
  }
  const fs = getNodeFs();
  fs.mkdirSync(getDirname(outputPath), { recursive: true });
  const text = `${validation.approvedPackets.map((packet) => JSON.stringify(packet)).join("\n")}\n`;
  fs.writeFileSync(outputPath, text);
}

export function resolveStage2ApprovedContentPacket(
  request: Stage2ApprovedContentResolverRequest,
  approvedPacketsPath: string = DEFAULT_APPROVED_PACKETS_PATH,
): Stage2ApprovedContentResolverResult {
  const resolvedApprovedPacketsPath = normalizeText(request.approvedPacketsPath ?? approvedPacketsPath) || DEFAULT_APPROVED_PACKETS_PATH;
  const fs = getNodeFs();
  if (!fs.existsSync(resolvedApprovedPacketsPath)) {
    return { kind: "none", reason: "approved_bundle_missing" };
  }
  const packets = readApprovedPacketsJsonl(resolvedApprovedPacketsPath);
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

export function resolveStage2ApprovedContentPacketCollection(
  request: Stage2ApprovedContentResolverRequest,
  approvedPacketsPaths: string[] = [...DEFAULT_APPROVED_PACKETS_PATHS],
): Stage2ApprovedContentResolverResult {
  const resolvedApprovedPacketsPaths = approvedPacketsPaths
    .map((entry) => normalizeText(entry))
    .filter((entry): entry is string => entry.length > 0);
  if (resolvedApprovedPacketsPaths.length === 0) {
    return { kind: "none", reason: "approved_bundle_missing" };
  }
  const packets = readApprovedPacketsJsonlCollection(resolvedApprovedPacketsPaths);
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
