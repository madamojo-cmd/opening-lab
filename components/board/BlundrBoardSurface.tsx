"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Chess, type Square } from "chess.js";

import { VisualRecipeLayer } from "@/components/board/VisualRecipeLayer";
import {
  renderBoardPieceGlyph,
  resolveBoardPieceSizeStyle,
  resolveBoardPieceToneClasses,
  resolveBoardPieceTypographyClasses,
} from "@/lib/blundr/board/boardPieceRendering";
import type { BlundrBoardRenderConfig } from "@/lib/blundr/board/boardRenderConfig";
import { resolveDailyBoardClick } from "@/lib/blundr/daily/dailyBoardInteraction";
import type { DailyBlundrBoardMoveAttempt } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import type { BoardVisualUiModel } from "@/lib/blundr/presentation/uiSurfaceAdapter";

export type BlundrBoardSurfaceFooterContext = {
  orientation: "white" | "black";
  selectedSquare: string | null;
  squareClickMode: boolean;
};

export type BlundrBoardSurfaceProps = {
  fen: string;
  renderConfig: BlundrBoardRenderConfig;
  presentation?: "application" | "bare";
  disabled?: boolean;
  onMoveAttempt?: (attempt: DailyBlundrBoardMoveAttempt) => void;
  onSquareClick?: (
    square: string,
    piece: { type: string; color: string } | null,
  ) => void;
  squareClickMode?: boolean;
  boardVisuals?: BoardVisualUiModel | null;
  squareStyles?: Record<string, CSSProperties>;
  animationClassName?: string | null;
  footer?: (context: BlundrBoardSurfaceFooterContext) => ReactNode;
};

function squareToBoardPoint(
  square: string,
  orientation: "white" | "black",
): { x: number; y: number } | null {
  const text = String(square ?? "")
    .trim()
    .toLowerCase();
  if (!/^[a-h][1-8]$/.test(text)) return null;
  const fileIndex = text.charCodeAt(0) - 97;
  const rankNumber = Number(text[1]);
  if (orientation === "white") {
    return { x: fileIndex * 12.5 + 6.25, y: (8 - rankNumber) * 12.5 + 6.25 };
  }
  return {
    x: (7 - fileIndex) * 12.5 + 6.25,
    y: (rankNumber - 1) * 12.5 + 6.25,
  };
}

function squareFromCoords(
  fileIndex: number,
  rankIndex: number,
  orientation: "white" | "black",
): string {
  const file = orientation === "white" ? fileIndex : 7 - fileIndex;
  const rank = orientation === "white" ? rankIndex : 7 - rankIndex;
  return `${String.fromCharCode(97 + file)}${8 - rank}`;
}

export function BlundrBoardSurface({
  fen,
  renderConfig,
  presentation = "application",
  disabled,
  onMoveAttempt,
  onSquareClick,
  squareClickMode = false,
  boardVisuals,
  squareStyles,
  animationClassName,
  footer,
}: BlundrBoardSurfaceProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const game = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return null;
    }
  }, [fen]);
  const orientation =
    renderConfig.boardOrientation === "black" ? "black" : "white";

  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

  const legalMoves = useMemo(() => {
    if (!game || !selectedSquare) return [];
    try {
      return game.moves({
        square: selectedSquare as Square,
        verbose: true,
      }) as Array<{ to: string; captured?: string | null }>;
    } catch {
      return [];
    }
  }, [game, selectedSquare]);

  if (!game) {
    return (
      <div className="rounded-[1.5rem] border border-stone-200 bg-white/90 p-4 text-sm text-stone-500 shadow-[0_12px_30px_rgba(20,17,12,0.06)]">
        Blundr could not load this position.
      </div>
    );
  }

  const board = game.board();
  const ranks = orientation === "white" ? [...board] : [...board].reverse();
  const boardAnimationClass = String(animationClassName ?? "").trim();

  const boardBody = (
    <div className="relative aspect-square w-full">
      <VisualRecipeLayer
        primitives={[]}
        surfaceVisuals={boardVisuals}
        centerFor={(square) =>
          squareToBoardPoint(square, orientation) ?? { x: 0, y: 0 }
        }
      />
      <div className="relative z-10 grid h-full w-full grid-cols-8">
        {ranks.map((rank, rankIndex) =>
          (orientation === "white" ? rank : [...rank].reverse()).map(
            (piece, fileIndex) => {
              const square = squareFromCoords(
                fileIndex,
                rankIndex,
                orientation,
              );
              const rowIndex =
                orientation === "white" ? rankIndex : 7 - rankIndex;
              const colIndex =
                orientation === "white" ? fileIndex : 7 - fileIndex;
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const isSelected = selectedSquare === square;
              const legalMove = legalMoves.find((move) => move.to === square);
              const legalTargetStyle = legalMove
                ? {
                    background: `radial-gradient(circle, ${legalMove.captured ? "rgba(239,68,68,.38)" : "rgba(22,163,74,.46)"} 0%, ${legalMove.captured ? "rgba(239,68,68,.38)" : "rgba(22,163,74,.46)"} 18%, transparent 23%)`,
                    boxShadow: legalMove.captured
                      ? "inset 0 0 0 3px rgba(239,68,68,.58)"
                      : "inset 0 0 0 2px rgba(22,163,74,.30)",
                  }
                : undefined;
              return (
                <button
                  key={square}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    onSquareClick?.(square, piece);
                    if (squareClickMode) return;
                    const outcome = resolveDailyBoardClick({
                      fen,
                      selectedSquare,
                      square,
                      piece,
                      turn: game.turn(),
                      squareClickMode,
                    });
                    setSelectedSquare(outcome.nextSelectedSquare);
                    if (outcome.attempt) onMoveAttempt?.(outcome.attempt);
                  }}
                  className={`relative flex aspect-square items-center justify-center text-2xl font-black transition ${isDark ? renderConfig.theme.squareDarkClassName : renderConfig.theme.squareLightClassName} ${isSelected ? "ring-4 ring-inset ring-green-800" : ""} ${squareClickMode ? "cursor-pointer" : ""}`}
                  aria-label={square}
                  style={{
                    ...(squareStyles?.[square] ?? {}),
                    ...(legalTargetStyle ?? {}),
                  }}
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none flex h-full w-full items-center justify-center leading-none antialiased ${resolveBoardPieceTypographyClasses(renderConfig.pieceSetId)} ${piece?.color === "w" ? resolveBoardPieceToneClasses("w") : resolveBoardPieceToneClasses("b")}`}
                    style={{
                      fontSize: resolveBoardPieceSizeStyle(
                        renderConfig.pieceSetId,
                      ),
                      transform: "translateY(-1px)",
                    }}
                  >
                    {piece
                      ? renderBoardPieceGlyph(
                          piece.color as "w" | "b",
                          piece.type,
                          renderConfig.pieceSetId,
                        )
                      : ""}
                  </span>
                </button>
              );
            },
          ),
        )}
      </div>
    </div>
  );

  if (presentation === "bare") {
    return (
      <div
        className={boardAnimationClass}
        data-board-theme={renderConfig.boardThemeId}
        data-piece-set={renderConfig.pieceSetId}
      >
        {boardBody}
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-[1.45rem] border border-stone-200 bg-white shadow-[0_18px_42px_rgba(20,17,12,0.10)] ${boardAnimationClass}`.trim()}
      data-board-theme={renderConfig.boardThemeId}
      data-piece-set={renderConfig.pieceSetId}
    >
      {boardBody}
      {footer?.({ orientation, selectedSquare, squareClickMode })}
    </div>
  );
}
