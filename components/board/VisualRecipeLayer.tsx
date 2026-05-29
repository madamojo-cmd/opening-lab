import type { VisualPrimitive } from "@/lib/blundr/visualRecipe/visualRecipeTypes";
import { primitivesToTeachingOverlay, type TeachingOverlayLine, type TeachingOverlaySquare } from "./visualPrimitiveRenderers";
import type { ReactElement } from "react";

type Point = { x: number; y: number };

export function VisualRecipeLayer({
  primitives,
  centerFor,
}: {
  primitives: VisualPrimitive[];
  centerFor: (square: string) => Point;
}): ReactElement | null {
  const overlay = primitivesToTeachingOverlay(primitives);
  if (!overlay.lines.length && !overlay.squares.length) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {overlay.lines.map((line, index) => {
        const from = centerFor(line.from);
        const to = centerFor(line.to);
        return (
          <g key={`${line.from}-${line.to}-${index}`}>
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(94,126,255,.95)" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        );
      })}
      {overlay.squares.map((square, index) => {
        const center = centerFor(square.square);
        return <circle key={`${square.square}-${index}`} cx={center.x} cy={center.y} r="4.8" fill="rgba(255,210,70,.22)" />;
      })}
    </svg>
  );
}

export type { TeachingOverlayLine, TeachingOverlaySquare };
