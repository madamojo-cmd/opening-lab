import type { VisualPrimitive } from "@/lib/blundr/visualRecipe/visualRecipeTypes";
import { primitivesToTeachingOverlay, type TeachingOverlayLine, type TeachingOverlaySquare } from "./visualPrimitiveRenderers";
import type { ReactElement, ReactNode } from "react";
import type { BoardVisualUiModel } from "@/lib/blundr/presentation/uiSurfaceAdapter";

export function TeachingOverlay({
  primitives,
  surfaceVisuals,
  children,
}: {
  primitives: VisualPrimitive[];
  surfaceVisuals?: BoardVisualUiModel | null;
  children: (overlay: { lines: TeachingOverlayLine[]; squares: TeachingOverlaySquare[] }) => ReactNode;
}): ReactElement {
  if (surfaceVisuals) {
    const lines: TeachingOverlayLine[] = surfaceVisuals.visualRecipes
      .filter((visual) => visual.visible && visual.from && visual.to)
      .map((visual) => ({
        from: visual.from as string,
        to: visual.to as string,
        kind: "plan",
      }));
    const squares: TeachingOverlaySquare[] = surfaceVisuals.visualRecipes
      .flatMap((visual) => (visual.squares ?? []).map((square) => ({ square, kind: "target" as const })));
    return <>{children({ lines, squares })}</>;
  }

  const overlay = primitivesToTeachingOverlay(primitives);
  return <>{children({ lines: overlay.lines, squares: overlay.squares })}</>;
}
