/**
 * BlundrOneNet v0 Concept Definitions
 *
 * This module defines the fixed, bounded set of chess concepts.
 * Models must select from this list only. No free-form concept names allowed.
 */

export const BLUNDR_CONCEPTS = [
  "quiet_development",
  "development_with_f7_pressure",
  "development_with_f2_pressure",
  "knight_center_pressure",
  "castle_for_safety",
  "prepare_center_break",
  "occupy_center",
  "defend_center",
  "pin_pressure",
  "open_file_pressure",
  "queen_activity_warning",
  "continuation_plan",
] as const;

export type BlundrConcept = typeof BLUNDR_CONCEPTS[number];

/**
 * Type guard: check if a value is a supported concept.
 * Use this before trusting model-provided concept names.
 */
export function isSupportedConcept(value: string): value is BlundrConcept {
  return (BLUNDR_CONCEPTS as readonly string[]).includes(value);
}
