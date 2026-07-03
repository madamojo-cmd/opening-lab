"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import type { DailyBlundrBoardProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

function pieceGlyph(piece: { type: string; color: string } | null): string {
  if (!piece) return "";
  const glyphs: Record<string, { w: string; b: string }> = {
    p: { w: "♙", b: "♟" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    r: { w: "♖", b: "♜" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" },
  };
  return glyphs[piece.type]?.[piece.color === "w" ? "w" : "b"] ?? "";
}

function squareFromCoords(fileIndex: number, rankIndex: number, orientation: "white" | "black"): string {
  const file = orientation === "white" ? fileIndex : 7 - fileIndex;
  const rank = orientation === "white" ? rankIndex : 7 - rankIndex;
  return `${String.fromCharCode(97 + file)}${8 - rank}`;
}

function describeCoordinate(square: string): string {
  return square;
}

export function DailyBlundrBoard({ fen, disabled, onMoveAttempt, onSquareClick, squareClickMode }: DailyBlundrBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const game = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return null;
    }
  }, [fen]);
  const orientation = useMemo<"white" | "black">(() => {
    try {
      return new Chess(fen).turn() === "b" ? "black" : "white";
    } catch {
      return "white";
    }
  }, [fen]);

  useEffect(() => {
    setSelectedSquare(null);
  }, [fen]);

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
                  if (!selectedSquare) {
                    if (piece && piece.color === game.turn()) {
                      setSelectedSquare(square);
                    }
                    return;
                  }
                  if (square === selectedSquare) {
                    setSelectedSquare(null);
                    return;
                  }
                  const from = selectedSquare;
                  const trial = new Chess(fen);
                  const move = trial.move({
                    from: from as never,
                    to: square as never,
                    promotion: "q",
                  });
                  const legal = Boolean(move);
                  const uci = legal && move ? `${move.from}${move.to}${move.promotion ?? ""}` : `${from}${square}`;
                  onMoveAttempt?.({
                    from,
                    to: square,
                    uci,
                    san: legal && move ? move.san : null,
                    legal,
                    promotion: legal && move?.promotion ? move.promotion : null,
                  });
                  setSelectedSquare(null);
                }}
                className={`relative flex aspect-square items-center justify-center text-2xl font-black transition ${isDark ? "bg-[#8a6d4f] text-white" : "bg-[#e8dcc8] text-stone-900"} ${isSelected ? "ring-4 ring-inset ring-green-800" : ""} ${isTarget && !squareClickMode ? "after:absolute after:h-3 after:w-3 after:rounded-full after:bg-green-600/75 after:content-['']" : ""} ${squareClickMode ? "cursor-pointer" : ""}`}
                aria-label={describeCoordinate(square)}
              >
                <span aria-hidden>{pieceGlyph(piece)}</span>
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
