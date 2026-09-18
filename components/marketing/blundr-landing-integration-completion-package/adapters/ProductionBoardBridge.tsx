"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { BlundrBoardSurface } from "@/components/board/BlundrBoardSurface";
import { buildBoardRenderConfig } from "@/lib/blundr/board/boardRenderConfig";
import type { BoardVisualUiModel } from "@/lib/blundr/presentation/uiSurfaceAdapter";

import styles from "./ProductionBoardBridge.module.css";

export type ProductionBoardProps = {
  fen: string;
  orientation: "white" | "black";
  presentation?: "application" | "bare";
  arrows?: readonly unknown[];
  highlightedSquares?: readonly string[];
  highlightColor?: "blue" | "green" | "amber";
  emphasizedSquare?: string | null;
  lastMove?: readonly [string, string] | null;
  interactive?: boolean;
  animationDurationMs?: number;
};

type BoardArrow = { from: string; to: string };
type MotionStyle = CSSProperties & { "--blundr-marketing-move-ms": string };

const SQUARE_PATTERN = /^[a-h][1-8]$/;
const MARKETING_RENDER_CONFIG_UPDATED_AT = "2026-09-17T00:00:00.000Z";

const HIGHLIGHT_STYLES: Record<NonNullable<ProductionBoardProps["highlightColor"]>, CSSProperties> = {
  blue: {
    background: "rgba(70, 126, 255, 0.32)",
    boxShadow: "inset 0 0 0 3px rgba(50, 101, 225, 0.72)",
  },
  green: {
    background: "rgba(34, 197, 94, 0.30)",
    boxShadow: "inset 0 0 0 3px rgba(21, 128, 61, 0.70)",
  },
  amber: {
    background: "rgba(245, 158, 11, 0.32)",
    boxShadow: "inset 0 0 0 3px rgba(217, 119, 6, 0.72)",
  },
};

const LAST_MOVE_STYLE: CSSProperties = {
  background: "rgba(250, 204, 21, 0.28)",
  boxShadow: "inset 0 0 0 2px rgba(202, 138, 4, 0.58)",
};

const EMPHASIS_STYLE: CSSProperties = {
  boxShadow: "inset 0 0 0 4px rgba(37, 99, 235, 0.94), 0 0 0 2px rgba(255,255,255,0.82)",
  zIndex: 1,
};

function normalizeSquare(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const square = value.trim().toLowerCase();
  return SQUARE_PATTERN.test(square) ? square : null;
}

function normalizeArrow(value: unknown): BoardArrow | null {
  if (Array.isArray(value)) {
    const from = normalizeSquare(value[0]);
    const to = normalizeSquare(value[1]);
    return from && to ? { from, to } : null;
  }
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const from = normalizeSquare(candidate.from);
  const to = normalizeSquare(candidate.to);
  return from && to ? { from, to } : null;
}

function mergeSquareStyle(
  stylesBySquare: Record<string, CSSProperties>,
  square: string | null,
  style: CSSProperties,
) {
  if (!square) return;
  stylesBySquare[square] = { ...stylesBySquare[square], ...style };
}

function buildSquareStyles({
  highlightedSquares = [],
  highlightColor = "blue",
  emphasizedSquare,
  lastMove,
}: Pick<
  ProductionBoardProps,
  "highlightedSquares" | "highlightColor" | "emphasizedSquare" | "lastMove"
>): Record<string, CSSProperties> {
  const stylesBySquare: Record<string, CSSProperties> = {};

  if (lastMove) {
    mergeSquareStyle(stylesBySquare, normalizeSquare(lastMove[0]), LAST_MOVE_STYLE);
    mergeSquareStyle(stylesBySquare, normalizeSquare(lastMove[1]), LAST_MOVE_STYLE);
  }
  for (const square of highlightedSquares) {
    mergeSquareStyle(stylesBySquare, normalizeSquare(square), HIGHLIGHT_STYLES[highlightColor]);
  }
  mergeSquareStyle(stylesBySquare, normalizeSquare(emphasizedSquare), EMPHASIS_STYLE);

  return stylesBySquare;
}

function buildBoardVisuals(arrows: readonly unknown[] = []): BoardVisualUiModel | null {
  const normalized = arrows.map(normalizeArrow).filter((arrow): arrow is BoardArrow => arrow !== null);
  if (!normalized.length) return null;
  return {
    visualRecipes: normalized.map((arrow, index) => ({
      id: `marketing-arrow-${index}-${arrow.from}-${arrow.to}`,
      type: "marketing_arrow",
      targetUci: `${arrow.from}${arrow.to}`,
      from: arrow.from,
      to: arrow.to,
      visible: true,
    })),
    debug: {
      source: "VisibleTeachingSurface",
      targetVisualUcis: normalized.map((arrow) => `${arrow.from}${arrow.to}`),
    },
  };
}

export function ProductionChessBoard({
  fen,
  orientation,
  presentation,
  arrows = [],
  highlightedSquares = [],
  highlightColor = "blue",
  emphasizedSquare = null,
  lastMove = null,
  interactive = false,
  animationDurationMs = 0,
}: ProductionBoardProps) {
  const previousFen = useRef(fen);
  const [motionPhase, setMotionPhase] = useState(false);

  useEffect(() => {
    if (previousFen.current !== fen) {
      previousFen.current = fen;
      setMotionPhase((phase) => !phase);
    }
  }, [fen]);

  const squareStyles = useMemo(
    () => buildSquareStyles({ highlightedSquares, highlightColor, emphasizedSquare, lastMove }),
    [emphasizedSquare, highlightColor, highlightedSquares, lastMove],
  );
  const boardVisuals = useMemo(() => buildBoardVisuals(arrows), [arrows]);
  const renderConfig = useMemo(
    () =>
      buildBoardRenderConfig({
        boardThemeId: "default",
        pieceSetId: "unicode",
        showCoordinates: true,
        boardOrientation: orientation,
        openingColor: orientation,
        source: "default",
        updatedAt: MARKETING_RENDER_CONFIG_UPDATED_AT,
      }),
    [orientation],
  );
  const duration = Number.isFinite(animationDurationMs)
    ? Math.max(0, Math.min(2_000, animationDurationMs))
    : 0;
  const motionStyle: MotionStyle = { "--blundr-marketing-move-ms": `${duration}ms` };
  const animationClassName = duration > 0
    ? motionPhase
      ? styles.positionMotionA
      : styles.positionMotionB
    : null;

  return (
    <div className={styles.boardRoot} style={motionStyle}>
      <BlundrBoardSurface
        fen={fen}
        renderConfig={renderConfig}
        presentation={presentation}
        disabled={!interactive}
        boardVisuals={boardVisuals}
        squareStyles={squareStyles}
        animationClassName={animationClassName}
      />
    </div>
  );
}
