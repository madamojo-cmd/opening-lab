"use client";

import { useEffect, useMemo, useState } from "react";

import { BlundrBoardSurface } from "@/components/board/BlundrBoardSurface";
import { BLUNDR_BOARD_PREFERENCES_CHANGED_EVENT } from "@/lib/blundr/board/boardPreferenceEvents";
import {
  createDefaultBoardPreferences,
  readLocalBoardPreferences,
} from "@/lib/blundr/board/boardPreferenceService";
import { buildBoardRenderConfig } from "@/lib/blundr/board/boardRenderConfig";
import type { DailyBlundrBoardProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

export function DailyBlundrBoard({
  fen,
  disabled,
  onMoveAttempt,
  onSquareClick,
  squareClickMode,
  openingColor,
  forcedOrientation,
  boardVisuals,
  squareStyles,
  animationClassName,
}: DailyBlundrBoardProps) {
  const [boardPreferences, setBoardPreferences] = useState(() =>
    createDefaultBoardPreferences(),
  );
  const renderConfig = useMemo(
    () =>
      buildBoardRenderConfig({
        boardThemeId: boardPreferences.boardThemeId,
        pieceSetId: boardPreferences.pieceSetId,
        showCoordinates: boardPreferences.showCoordinates,
        boardOrientation:
          forcedOrientation ?? boardPreferences.boardOrientation,
        openingColor,
        source: boardPreferences.source,
        updatedAt: boardPreferences.updatedAt,
      }),
    [boardPreferences, forcedOrientation, openingColor],
  );

  useEffect(() => {
    setBoardPreferences(
      readLocalBoardPreferences(
        typeof window !== "undefined" ? window.localStorage : null,
      ),
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refreshPreferences = () => {
      setBoardPreferences(readLocalBoardPreferences(window.localStorage));
    };
    window.addEventListener(
      BLUNDR_BOARD_PREFERENCES_CHANGED_EVENT,
      refreshPreferences,
    );
    window.addEventListener("storage", refreshPreferences);
    return () => {
      window.removeEventListener(
        BLUNDR_BOARD_PREFERENCES_CHANGED_EVENT,
        refreshPreferences,
      );
      window.removeEventListener("storage", refreshPreferences);
    };
  }, []);

  return (
    <BlundrBoardSurface
      fen={fen}
      renderConfig={renderConfig}
      disabled={disabled}
      onMoveAttempt={onMoveAttempt}
      onSquareClick={onSquareClick}
      squareClickMode={squareClickMode}
      boardVisuals={boardVisuals}
      squareStyles={squareStyles}
      animationClassName={animationClassName}
      footer={({ orientation, selectedSquare, squareClickMode: clickMode }) => (
        <div className="flex items-center justify-between gap-3 bg-stone-950 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">
          <span>
            {orientation === "white" ? "White at bottom" : "Black at bottom"}
          </span>
          <span>
            {clickMode
              ? "Click the key square"
              : selectedSquare
                ? `Selected ${selectedSquare}`
                : "Tap a piece to move"}
          </span>
        </div>
      )}
    />
  );
}
