import type { CompiledCoachVisualIntent, CompiledCoachFrame } from "../coachCompiler/types";
import type { SurfaceVisualRecipe, TeachingSurfaceMode } from "./types";

function toSurfaceRecipe(intent: CompiledCoachVisualIntent): SurfaceVisualRecipe {
  return {
    id: intent.id,
    type: intent.type,
    targetUci: intent.targetUci,
    from: intent.from ?? null,
    to: intent.to ?? null,
    squares: intent.squares,
    evidenceClaimIds: intent.evidenceClaimIds,
    visible: true,
    leakRisk: intent.leakRisk,
  };
}

function isTargetAligned(intent: CompiledCoachVisualIntent, safeFrame: CompiledCoachFrame): boolean {
  if (!safeFrame.targetUci) {
    return intent.targetUci === null;
  }

  return intent.targetUci === safeFrame.targetUci;
}

export function mapVisualIntentsToSurfaceRecipes(input: {
  mode: TeachingSurfaceMode;
  safeFrame: CompiledCoachFrame;
}): SurfaceVisualRecipe[] {
  const { mode, safeFrame } = input;

  if (mode !== "assisted" && mode !== "plain_after_show_more") {
    return [];
  }

  const allowedDisplayMode = mode === "assisted" ? "assisted" : "show_more";

  return safeFrame.visualIntents
    .filter((intent) => intent.displayModes.includes(allowedDisplayMode) || (mode === "plain_after_show_more" && intent.displayModes.includes("assisted")))
    .filter((intent) => isTargetAligned(intent, safeFrame))
    .map(toSurfaceRecipe);
}
