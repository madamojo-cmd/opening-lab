import type { VisualRecipe } from "../visualRecipe/visualRecipeTypes";

export type VisualPlaybackKeyInput = {
  recipe?: Pick<VisualRecipe, "visualRecipeId" | "frameId" | "fen" | "mode" | "patternId"> | null;
  enabled: boolean;
  reduced: boolean;
  trainerFrameId: number;
  boardFen: string;
};

export function buildVisualPlaybackKey(input: VisualPlaybackKeyInput): string {
  return [
    input.recipe?.visualRecipeId ?? "no_recipe",
    String(input.recipe?.frameId ?? "na"),
    input.recipe?.fen ?? "na",
    input.recipe?.mode ?? "noop",
    input.recipe?.patternId ?? "na",
    input.enabled ? "enabled" : "disabled",
    input.reduced ? "reduced" : "full",
    String(input.trainerFrameId),
    input.boardFen,
  ].join("|");
}
