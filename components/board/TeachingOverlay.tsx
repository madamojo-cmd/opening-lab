import type { VisualPrimitive } from "@/lib/blundr/visualRecipe/visualRecipeTypes";
import { primitivesToTeachingOverlay, type TeachingOverlayLine, type TeachingOverlaySquare } from "./visualPrimitiveRenderers";
import type { ReactElement, ReactNode } from "react";

export function TeachingOverlay({
  primitives,
  children,
}: {
  primitives: VisualPrimitive[];
  children: (overlay: { lines: TeachingOverlayLine[]; squares: TeachingOverlaySquare[] }) => ReactNode;
}): ReactElement {
  const overlay = primitivesToTeachingOverlay(primitives);
  return <>{children({ lines: overlay.lines, squares: overlay.squares })}</>;
}
