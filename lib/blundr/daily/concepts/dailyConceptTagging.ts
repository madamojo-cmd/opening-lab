import type { DailyBlundrAttemptOutcome, DailyBlundrCard, DailyBlundrMasteryTarget } from "../dailyBlundrTypes";
import type { DailyMiniGameId, DailyMiniGameSkillId } from "../miniGames/dailyMiniGameTypes";
import type { DailyTrainingTargetId, DailyTrainingTargetSkillId } from "../trainingTargets/dailyTrainingTargetTypes";
import { getDailyConceptById } from "./dailyConceptRegistry";
import type { DailyConceptId } from "./dailyConceptTypes";

const DAILY_CONCEPT_DOMAIN_PATTERN = "(pawn_structures|key_squares|piece_imbalances|tactical_ideas|special_techniques)";
const DAILY_CONCEPT_ID_PATTERN = new RegExp(`^concept:${DAILY_CONCEPT_DOMAIN_PATTERN}:[a-z0-9_-]+$`, "i");
const DAILY_CONCEPT_MASTERY_KEY_PATTERN = new RegExp(`^(concept:${DAILY_CONCEPT_DOMAIN_PATTERN}:[a-z0-9_-]+):mastery$`, "i");

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueConceptIds(values: readonly (string | null | undefined)[]): DailyConceptId[] {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeConceptId(value))
        .filter((value): value is DailyConceptId => Boolean(value)),
    ),
  );
}

function conceptIdFromMasteryKey(value: string): DailyConceptId | "" {
  const normalized = normalizeText(value).toLowerCase();
  const match = normalized.match(DAILY_CONCEPT_MASTERY_KEY_PATTERN);
  if (!match?.[1]) return "";
  const conceptId = normalizeConceptId(match[1]);
  return conceptId;
}

export function normalizeConceptId(input: unknown): DailyConceptId | "" {
  const normalized = normalizeText(input).toLowerCase();
  if (!normalized) return "";
  const masteryKey = conceptIdFromMasteryKey(normalized);
  if (masteryKey) return masteryKey;
  if (!DAILY_CONCEPT_ID_PATTERN.test(normalized)) return "";
  return getDailyConceptById(normalized as DailyConceptId)?.id ?? "";
}

export function makeConceptMasteryKey(conceptId: string): string {
  const normalized = normalizeConceptId(conceptId);
  if (normalized) return `${normalized}:mastery`;
  const text = normalizeText(conceptId).toLowerCase();
  return text.endsWith(":mastery") ? text : text ? `${text}:mastery` : "";
}

export function getConceptIdsForMasteryTargets(masteryTargets: readonly DailyBlundrMasteryTarget[]): DailyConceptId[] {
  return uniqueConceptIds(masteryTargets.map((target) => target?.conceptKey ?? ""));
}

function resolveConceptIdsForMiniGame(miniGameId: DailyMiniGameId, skillIds: readonly DailyMiniGameSkillId[]): DailyConceptId[] {
  const concepts: Array<DailyConceptId | ""> = [];
  switch (miniGameId) {
    case "king_race":
      concepts.push("concept:key_squares:king_entry_square", "concept:key_squares:opposition_square", "concept:special_techniques:opposition");
      break;
    case "knight_gymnasium":
      concepts.push("concept:key_squares:outpost_square", "concept:piece_imbalances:minor_piece_outpost", "concept:special_techniques:piece_rerouting");
      break;
    case "pawn_wars":
      concepts.push("concept:pawn_structures:passed_pawn", "concept:key_squares:promotion_square", "concept:special_techniques:outside_passed_pawn");
      break;
  }

  if (skillIds.includes("king_pathing")) {
    concepts.push("concept:key_squares:king_entry_square", "concept:key_squares:opposition_square");
  }
  if (skillIds.includes("opposition")) {
    concepts.push("concept:special_techniques:opposition");
  }
  if (skillIds.includes("goal_zone")) {
    concepts.push("concept:key_squares:king_entry_square");
  }
  if (skillIds.includes("knight_geometry")) {
    concepts.push("concept:key_squares:outpost_square", "concept:piece_imbalances:minor_piece_outpost");
  }
  if (skillIds.includes("shortest_path")) {
    concepts.push("concept:special_techniques:piece_rerouting");
  }
  if (skillIds.includes("pawn_race")) {
    concepts.push("concept:pawn_structures:passed_pawn");
  }
  if (skillIds.includes("promotion")) {
    concepts.push("concept:key_squares:promotion_square", "concept:special_techniques:outside_passed_pawn");
  }
  if (skillIds.includes("passed_pawn")) {
    concepts.push("concept:pawn_structures:passed_pawn", "concept:special_techniques:outside_passed_pawn");
  }

  return uniqueConceptIds(concepts);
}

function resolveConceptIdsForTrainingTarget(trainingTargetId: DailyTrainingTargetId, skillIds: readonly DailyTrainingTargetSkillId[]): DailyConceptId[] {
  const concepts: Array<DailyConceptId | ""> = [];
  switch (trainingTargetId) {
    case "reply_radar":
      concepts.push("concept:tactical_ideas:zwischenzug", "concept:piece_imbalances:development_lead");
      break;
    case "opening_branch_builder":
      concepts.push("concept:special_techniques:tempo_gain", "concept:tactical_ideas:clearance");
      break;
    case "opponent_reply_trainer":
      concepts.push("concept:tactical_ideas:double_attack", "concept:piece_imbalances:development_lead");
      break;
    case "break_timing_drill":
      concepts.push("concept:tactical_ideas:pawn_break", "concept:pawn_structures:open_center", "concept:special_techniques:breakthrough");
      break;
    case "key_square_click":
      concepts.push("concept:key_squares:weak_square", "concept:key_squares:critical_pawn_endgame_square", "concept:key_squares:outpost_square");
      break;
  }

  if (skillIds.includes("candidate_move_recognition")) {
    concepts.push("concept:tactical_ideas:zwischenzug");
  }
  if (skillIds.includes("opponent_reply_recognition")) {
    concepts.push("concept:tactical_ideas:double_attack");
  }
  if (skillIds.includes("branch_memory")) {
    concepts.push("concept:special_techniques:tempo_gain");
  }
  if (skillIds.includes("move_order_precision")) {
    concepts.push("concept:tactical_ideas:clearance");
  }
  if (skillIds.includes("common_reply")) {
    concepts.push("concept:piece_imbalances:development_lead");
  }
  if (skillIds.includes("break_timing")) {
    concepts.push("concept:tactical_ideas:pawn_break");
  }
  if (skillIds.includes("pawn_break")) {
    concepts.push("concept:special_techniques:breakthrough");
  }
  if (skillIds.includes("key_square_awareness")) {
    concepts.push("concept:key_squares:weak_square", "concept:key_squares:critical_pawn_endgame_square");
  }
  if (skillIds.includes("square_control")) {
    concepts.push("concept:key_squares:outpost_square");
  }

  return uniqueConceptIds(concepts);
}

export function inferConceptTagsForMiniGame(miniGameId: DailyMiniGameId, skillIds: readonly DailyMiniGameSkillId[]): DailyConceptId[] {
  return resolveConceptIdsForMiniGame(miniGameId, skillIds);
}

export function inferConceptTagsForTrainingTarget(trainingTargetId: DailyTrainingTargetId, skillIds: readonly DailyTrainingTargetSkillId[]): DailyConceptId[] {
  return resolveConceptIdsForTrainingTarget(trainingTargetId, skillIds);
}

export function inferConceptTagsForFailureType(_failureType: DailyBlundrAttemptOutcome | string | null | undefined): DailyConceptId[] {
  return [];
}

export function attachConceptTagsToDailyCard<T extends DailyBlundrCard>(
  card: T,
  conceptIds: readonly (string | null | undefined)[],
): T & {
  conceptIds: DailyConceptId[];
  primaryConceptId: DailyConceptId | null;
  conceptMasteryKeys: string[];
} {
  const merged = uniqueConceptIds([
    ...conceptIds,
    ...(card.conceptIds ?? []),
    card.primaryConceptId ?? "",
    ...(card.conceptMasteryKeys ?? []).map((key) => conceptIdFromMasteryKey(key)),
  ]);
  const primaryConceptId = merged[0] ?? null;
  return {
    ...card,
    conceptIds: merged,
    primaryConceptId,
    conceptMasteryKeys: merged.map((conceptId) => makeConceptMasteryKey(conceptId)),
  };
}
