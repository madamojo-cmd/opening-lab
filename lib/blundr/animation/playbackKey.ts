import type { VisualRecipe } from "../visualRecipe/visualRecipeTypes";
import { normalizeVisualFen } from "../visual/normalizeVisualFen";

export type VisualPlaybackKeyInput = {
  recipe?: Pick<VisualRecipe, "visualRecipeId" | "frameId" | "fen" | "mode" | "patternId" | "beats" | "endState"> | null;
  enabled: boolean;
  reduced: boolean;
  trainerPhase?: string;
  trainerView?: string;
  isUserTurn?: boolean;
  adapterAllowed?: boolean;
  adapterSuppressedReason?: string;
  trainerFrameId: number;
  overlayFrameId?: number;
  boardFen: string;
  overlayFen?: string;
};

export function buildVisualPlaybackKey(input: VisualPlaybackKeyInput): string {
  const primitiveIds = input.recipe?.beats?.flatMap((beat) => beat.primitives.map((primitive) => primitive.id)).join(",") ?? "no_primitives";
  const beatIds = input.recipe?.beats?.map((beat) => beat.id).join(",") ?? "no_beats";
  const persist = input.recipe?.endState?.persistPrimitives?.join(",") ?? "no_persist";
  return [
    input.recipe?.visualRecipeId ?? "no_recipe",
    String(input.recipe?.frameId ?? "na"),
    normalizeVisualFen(input.recipe?.fen) || "na",
    input.recipe?.mode ?? "noop",
    input.recipe?.patternId ?? "na",
    input.enabled ? "enabled" : "disabled",
    input.reduced ? "reduced" : "full",
    input.trainerPhase ?? "unknown_phase",
    input.trainerView ?? "unknown_view",
    input.isUserTurn ? "user_turn" : "not_user_turn",
    input.adapterAllowed ? "adapter_allowed" : "adapter_blocked",
    input.adapterSuppressedReason ?? "no_adapter_reason",
    String(input.trainerFrameId),
    String(input.overlayFrameId ?? "no_overlay_frame"),
    normalizeVisualFen(input.boardFen) || "no_board_fen",
    normalizeVisualFen(input.overlayFen) || "no_overlay_fen",
    primitiveIds,
    beatIds,
    persist,
  ].join("|");
}
