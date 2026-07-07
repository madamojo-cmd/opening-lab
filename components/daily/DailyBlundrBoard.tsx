"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import type { DailyBlundrBoardProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import { buildBoardRenderConfig } from "@/lib/blundr/board/boardRenderConfig";
import { createDefaultBoardPreferences, readLocalBoardPreferences } from "@/lib/blundr/board/boardPreferenceService";
import { BLUNDR_BOARD_PREFERENCES_CHANGED_EVENT } from "@/lib/blundr/board/boardPreferenceEvents";
import {
  renderBoardPieceGlyph,
  resolveBoardPieceSizeStyle,
  resolveBoardPieceToneClasses,
  resolveBoardPieceTypographyClasses,
} from "@/lib/blundr/board/boardPieceRendering";
import { resolveDailyBoardClick } from "@/lib/blundr/daily/dailyBoardInteraction";

function squareFromCoords(fileIndex: number, rankIndex: number, orientation: "white" | "black"): string {
  const file = orientation === "white" ? fileIndex : 7 - fileIndex;
  const rank = orientation === "white" ? rankIndex : 7 - rankIndex;
  return `${String.fromCharCode(97 + file)}${8 - rank}`;
}

function describeCoordinate(square: string): string {
  return square;
}

export function DailyBlundrBoard({ fen, disabled, onMoveAttempt, onSquareClick, squareClickMode, openingColor }: DailyBlundrBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [boardPreferences, setBoardPreferences] = useState(() => createDefaultBoardPreferences());
  const game = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return null;
    }
  }, [fen]);
  const renderConfig = useMemo(
    () =>
      buildBoardRenderConfig({
        boardThemeId: boardPreferences.boardThemeId,
        pieceSetId: boardPreferences.pieceSetId,
        showCoordinates: boardPreferences.showCoordinates,
        boardOrientation: boardPreferences.boardOrientation,
        openingColor,
        fenTurn: game?.turn() === "b" ? "black" : "white",
        source: boardPreferences.source,
        updatedAt: boardPreferences.updatedAt,
      }),
    [boardPreferences, game, openingColor],
  );
  const orientation = renderConfig.boardOrientation;

  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

  useEffect(() => {
    setBoardPreferences(readLocalBoardPreferences(typeof window !== "undefined" ? window.localStorage : null));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refreshPreferences = () => {
      setBoardPreferences(readLocalBoardPreferences(window.localStorage));
    };
    window.addEventListener(BLUNDR_BOARD_PREFERENCES_CHANGED_EVENT, refreshPreferences);
    window.addEventListener("storage", refreshPreferences);
    return () => {
      window.removeEventListener(BLUNDR_BOARD_PREFERENCES_CHANGED_EVENT, refreshPreferences);
      window.removeEventListener("storage", refreshPreferences);
    };
  }, []);

  const legalTargets = useMemo(() => {
    if (!game || !selectedSquare) return [];
    try {
      return game.moves({ square: selectedSquare as Square, verbose: true }).map((move) => move.to);
    } catch {
      return [];
    }
  }, [game, selectedSquare]);

  if (!game) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
        Tempo could not load this position.
      </div>
    );
  }

  const board = game.board();
  const ranks = orientation === "white" ? [...board] : [...board].reverse();

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="grid grid-cols-8">
        {ranks.map((rank, rankIndex) =>
          (orientation === "white" ? rank : [...rank].reverse()).map((piece, fileIndex) => {
            const square = squareFromCoords(fileIndex, rankIndex, orientation);
            const rowIndex = orientation === "white" ? rankIndex : 7 - rankIndex;
            const colIndex = orientation === "white" ? fileIndex : 7 - fileIndex;
            const isDark = (rowIndex + colIndex) % 2 === 1;
            const isSelected = selectedSquare === square;
            const isTarget = legalTargets.includes(square as Square);
            return (
              <button
                key={square}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  if (squareClickMode) {
                    onSquareClick?.(square, piece);
                    return;
                  }
                  const outcome = resolveDailyBoardClick({
                    fen,
                    selectedSquare,
                    square,
                    piece,
                    turn: game.turn(),
                    squareClickMode,
                  });
                  setSelectedSquare(outcome.nextSelectedSquare);
                  if (outcome.attempt) {
                    onMoveAttempt?.(outcome.attempt);
                  }
                }}
                className={`relative flex aspect-square items-center justify-center text-2xl font-black transition ${isDark ? renderConfig.theme.squareDarkClassName : renderConfig.theme.squareLightClassName} ${isSelected ? "ring-4 ring-inset ring-green-800" : ""} ${isTarget && !squareClickMode ? "after:absolute after:h-3 after:w-3 after:rounded-full after:bg-green-600/75 after:content-['']" : ""} ${squareClickMode ? "cursor-pointer" : ""}`}
                aria-label={describeCoordinate(square)}
              >
                <span
                  aria-hidden
                  className={`pointer-events-none flex h-full w-full items-center justify-center leading-none antialiased ${resolveBoardPieceTypographyClasses(renderConfig.pieceSetId)} ${piece?.color === "w" ? resolveBoardPieceToneClasses("w") : resolveBoardPieceToneClasses("b")}`}
                  style={{ fontSize: resolveBoardPieceSizeStyle(renderConfig.pieceSetId), transform: "translateY(-1px)" }}
                >
                  {piece ? renderBoardPieceGlyph(piece.color as "w" | "b", piece.type, renderConfig.pieceSetId) : ""}
                </span>
              </button>
            );
          }),
        )}
      </div>
      <div className="flex items-center justify-between bg-stone-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-stone-500">
        <span>{orientation === "white" ? "White at bottom" : "Black at bottom"}</span>
        <span>
          {squareClickMode ? "Click the key square" : selectedSquare ? `Selected ${selectedSquare}` : "Tap a piece to move"}
        </span>
      </div>
    </div>
  );
}
