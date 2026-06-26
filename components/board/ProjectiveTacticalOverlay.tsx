import type { ReactElement } from "react";

import {
  buildKnightLShapePath,
  isProjectiveTacticEnabledInE,
  squareToBoardPoint,
  type BoardOrientation,
  type ProjectiveTacticVisual,
} from "@/lib/blundr/projectiveTactics";

type ProjectiveTacticalOverlayProps = {
  visuals: ProjectiveTacticVisual[];
  orientation: BoardOrientation;
  fading?: boolean;
};

function pct(value: number): string {
  return `${value}%`;
}

export function ProjectiveTacticalOverlay({
  visuals,
  orientation,
  fading = false,
}: ProjectiveTacticalOverlayProps): ReactElement | null {
  const visible = visuals.filter((visual) => visual.confidence === "high" && isProjectiveTacticEnabledInE(visual.kind));
  if (!visible.length) return null;

  const lineElements: ReactElement[] = [];
  for (const visual of visible) {
    visual.lineSegments.forEach((segment, index) => {
      if (segment.shape === "knight_l") {
        const points = buildKnightLShapePath({ from: segment.from, to: segment.to, orientation });
        if (!points) return;
        lineElements.push(
          <g key={`${visual.id}-knight-${index}`} className="projective-tactic-line projective-tactic-line--knight">
            <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} />
            <line x1={points[1].x} y1={points[1].y} x2={points[2].x} y2={points[2].y} />
          </g>,
        );
        return;
      }
      const from = squareToBoardPoint(segment.from, orientation);
      const to = squareToBoardPoint(segment.to, orientation);
      if (!from || !to) return;
      lineElements.push(
        <line
          key={`${visual.id}-straight-${index}`}
          className="projective-tactic-line projective-tactic-line--straight"
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
        />,
      );
    });
  }

  return (
    <div className={`projective-tactic-overlay${fading ? " projective-tactic-fade" : ""}`} aria-hidden="true">
      <svg className="projective-tactic-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {lineElements}
      </svg>
      {visible.flatMap((visual) =>
        visual.targetSquares.map((square, index) => {
          const point = squareToBoardPoint(square, orientation);
          if (!point) return [];
          return (
            <span
              key={`${visual.id}-target-${square}-${index}`}
              className="projective-tactic-target"
              style={{ left: pct(point.x), top: pct(point.y) }}
            />
          );
        }),
      )}
      {visible.map((visual) => {
        const point = squareToBoardPoint(visual.tagSquare, orientation);
        if (!point) return null;
        return (
          <span
            key={`${visual.id}-tag`}
            className="projective-tactic-tag"
            style={{ left: pct(point.x), top: pct(point.y) }}
          >
            {visual.label}
          </span>
        );
      })}
    </div>
  );
}
