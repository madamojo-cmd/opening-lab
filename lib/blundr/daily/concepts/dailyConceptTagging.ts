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
    case "tactic_shots":
      concepts.push(
        "concept:tactical_ideas:fork",
        "concept:tactical_ideas:pin",
        "concept:tactical_ideas:skewer",
        "concept:tactical_ideas:discovered_attack",
        "concept:tactical_ideas:back_rank_motif",
        "concept:tactical_ideas:overloaded_piece",
      );
      break;
    case "key_square_conquest":
      concepts.push(
        "concept:key_squares:weak_square",
        "concept:key_squares:outpost_square",
        "concept:key_squares:invasion_square",
        "concept:key_squares:king_entry_square",
        "concept:key_squares:blockade_square",
      );
      break;
    case "structure_builder":
      concepts.push(
        "concept:pawn_structures:pawn_chain",
        "concept:pawn_structures:isolated_queen_pawn",
        "concept:pawn_structures:backward_pawn",
        "concept:pawn_structures:open_center",
        "concept:pawn_structures:minority_attack_structure",
      );
      break;
    case "imbalance_arena":
      concepts.push(
        "concept:piece_imbalances:knight_vs_bishop_closed_center",
        "concept:piece_imbalances:rook_on_open_file",
        "concept:piece_imbalances:exchange_sacrifice_compensation",
        "concept:piece_imbalances:material_vs_initiative",
        "concept:piece_imbalances:good_bishop_vs_bad_bishop",
      );
      break;
    case "technique_lab":
      concepts.push(
        "concept:special_techniques:opposition",
        "concept:special_techniques:triangulation",
        "concept:special_techniques:zugzwang",
        "concept:special_techniques:outside_passed_pawn",
        "concept:special_techniques:corresponding_squares",
        "concept:special_techniques:fortress_building",
      );
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
  if (skillIds.includes("forks")) {
    concepts.push("concept:tactical_ideas:fork", "concept:tactical_ideas:double_attack");
  }
  if (skillIds.includes("pins")) {
    concepts.push("concept:tactical_ideas:pin");
  }
  if (skillIds.includes("skewers")) {
    concepts.push("concept:tactical_ideas:skewer");
  }
  if (skillIds.includes("discovered_attack")) {
    concepts.push("concept:tactical_ideas:discovered_attack");
  }
  if (skillIds.includes("back_rank")) {
    concepts.push("concept:tactical_ideas:back_rank_motif");
  }
  if (skillIds.includes("overloaded_piece")) {
    concepts.push("concept:tactical_ideas:overloaded_piece");
  }
  if (skillIds.includes("key_square_control")) {
    concepts.push("concept:key_squares:weak_square", "concept:key_squares:outpost_square");
  }
  if (skillIds.includes("outpost")) {
    concepts.push("concept:key_squares:outpost_square");
  }
  if (skillIds.includes("invasion_square")) {
    concepts.push("concept:key_squares:invasion_square");
  }
  if (skillIds.includes("king_entry")) {
    concepts.push("concept:key_squares:king_entry_square");
  }
  if (skillIds.includes("blockade")) {
    concepts.push("concept:key_squares:blockade_square");
  }
  if (skillIds.includes("pawn_structure")) {
    concepts.push("concept:pawn_structures:pawn_chain", "concept:pawn_structures:open_center");
  }
  if (skillIds.includes("pawn_break")) {
    concepts.push("concept:tactical_ideas:pawn_break", "concept:special_techniques:breakthrough");
  }
  if (skillIds.includes("isolated_pawn")) {
    concepts.push("concept:pawn_structures:isolated_queen_pawn");
  }
  if (skillIds.includes("backward_pawn")) {
    concepts.push("concept:pawn_structures:backward_pawn");
  }
  if (skillIds.includes("pawn_chain")) {
    concepts.push("concept:pawn_structures:pawn_chain");
  }
  if (skillIds.includes("bishop_vs_knight")) {
    concepts.push("concept:piece_imbalances:knight_vs_bishop_closed_center", "concept:piece_imbalances:minor_piece_outpost");
  }
  if (skillIds.includes("rook_activity")) {
    concepts.push("concept:piece_imbalances:rook_on_open_file", "concept:piece_imbalances:rook_seventh_rank");
  }
  if (skillIds.includes("exchange_value")) {
    concepts.push("concept:piece_imbalances:material_vs_initiative", "concept:piece_imbalances:exchange_sacrifice_compensation");
  }
  if (skillIds.includes("material_imbalance")) {
    concepts.push("concept:piece_imbalances:material_vs_initiative");
  }
  if (skillIds.includes("color_complex")) {
    concepts.push("concept:piece_imbalances:good_bishop_vs_bad_bishop", "concept:piece_imbalances:bishop_pair");
  }
  if (skillIds.includes("conversion")) {
    concepts.push("concept:special_techniques:tempo_gain", "concept:special_techniques:outside_passed_pawn");
  }
  if (skillIds.includes("zugzwang")) {
    concepts.push("concept:special_techniques:zugzwang");
  }
  if (skillIds.includes("triangulation")) {
    concepts.push("concept:special_techniques:triangulation");
  }
  if (skillIds.includes("rook_endgame")) {
    concepts.push("concept:special_techniques:opposition", "concept:special_techniques:shouldering", "concept:special_techniques:corresponding_squares");
  }
  if (skillIds.includes("mating_net")) {
    concepts.push("concept:tactical_ideas:back_rank_motif", "concept:tactical_ideas:overloaded_piece");
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
