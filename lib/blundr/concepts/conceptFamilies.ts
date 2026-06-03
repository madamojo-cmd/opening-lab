import type { ConceptFamily } from "./TeachingConcept";

export const CONCEPT_FAMILIES: readonly ConceptFamily[] = [
  "opening_principle",
  "development",
  "center",
  "king_safety",
  "tactics",
  "piece_activity",
  "pawn_structure",
  "space",
  "initiative",
  "defense",
  "endgame",
  "opening_specific",
  "mistake_pattern",
  "continuation",
  "visual_pattern",
  "safety_fallback",
] as const;

export const CORE_OPENING_FAMILIES: readonly ConceptFamily[] = [
  "opening_principle",
  "development",
  "center",
  "king_safety",
  "opening_specific",
] as const;

export const TACTICAL_FAMILIES: readonly ConceptFamily[] = [
  "tactics",
  "piece_activity",
  "initiative",
  "defense",
] as const;

export const POSITIONAL_FAMILIES: readonly ConceptFamily[] = [
  "center",
  "pawn_structure",
  "space",
  "piece_activity",
  "endgame",
] as const;

export const CONTINUATION_AND_SAFETY_FAMILIES: readonly ConceptFamily[] = [
  "continuation",
  "mistake_pattern",
  "visual_pattern",
  "safety_fallback",
] as const;
