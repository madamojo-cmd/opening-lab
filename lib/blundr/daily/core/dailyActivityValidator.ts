import {
  hasSolutionBearingFields,
  type DailyPresentationModel,
} from "@/lib/blundr/contracts";
import type { DailyDeck } from "./dailyActivityTypes";

export function validateDailyDeck(deck: DailyDeck): string[] {
  const errors: string[] = [];
  if (deck.cards.length > 5) errors.push("deck_exceeds_five_cards");
  const positions = new Set(deck.cards.map((card) => card.positionKey));
  if (positions.size !== deck.cards.length)
    errors.push("duplicate_canonical_position");
  return errors;
}
export function validateDailyPresentation(
  model: DailyPresentationModel,
): string[] {
  return hasSolutionBearingFields(model) ? ["solution_field_exposed"] : [];
}
