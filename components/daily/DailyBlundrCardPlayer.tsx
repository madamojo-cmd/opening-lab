"use client";

import { Keyboard } from "lucide-react";
import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { DailyBlundrSupportControls } from "@/components/daily/DailyBlundrSupportControls";
import type { DailyBlundrCardPlayerProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

function resolveExpectedMoveLabel(expectedMoveUci: string | null | undefined, expectedMoveSan: string | null | undefined): string {
  return expectedMoveUci || expectedMoveSan || "the saved move";
}

export function DailyBlundrCardPlayer({
  card,
  mode,
  moveInput,
  support,
  locked,
  onMoveInputChange,
  onSubmitMove,
  onBoardMoveAttempt,
  onReveal,
  onShowAnswer,
  onMarkReviewed,
}: DailyBlundrCardPlayerProps) {
  const answerVisible = support.answerShown || support.usedReveal;
  const expectedMove = resolveExpectedMoveLabel(card.expectedMoveUci, card.expectedMoveSan);

  return (
    <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-green-700">Recall card</div>
          <h2 className="mt-1 text-lg font-black text-stone-950">{card.openingName || "Daily BLUNDR"}</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">{card.summary}</p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">
          {card.deckRank}
        </div>
      </div>

      <DailyBlundrBoard fen={card.fen} disabled={locked || mode === "reveal_only"} onMoveAttempt={onBoardMoveAttempt} />

      {answerVisible ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">Answer</div>
          <p className="mt-2 font-semibold">Tempo was looking for {expectedMove}.</p>
        </div>
      ) : null}

      {mode === "uci_graded" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmitMove(moveInput);
          }}
          className="space-y-3"
        >
          <div className="rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600">
            Enter the move in UCI, or SAN if that is the move you remember. UCI is preferred for grading.
          </div>
          <div>
            <label htmlFor={`daily-blundr-move-${card.cardKey}`} className="text-xs font-black uppercase tracking-wide text-stone-500">
              Your move
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id={`daily-blundr-move-${card.cardKey}`}
                value={moveInput}
                onChange={(event) => onMoveInputChange(event.target.value)}
                placeholder={card.expectedMoveUci ?? card.expectedMoveSan ?? "e2e4"}
                className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base font-semibold outline-none ring-0 focus:border-green-700"
              />
              <button type="submit" className="rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm">
                Check
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onMoveInputChange(card.expectedMoveUci ?? card.expectedMoveSan ?? "")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 font-black text-stone-700"
            >
              <Keyboard size={15} />
              Fill answer
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600">
          Tempo can reveal this review, then mark it as reviewed without forcing a move entry.
        </div>
      )}

      <DailyBlundrSupportControls
        usedReveal={support.usedReveal}
        answerShown={support.answerShown}
        revealedAt={support.revealedAt}
        disabled={locked}
        onReveal={onReveal}
        onShowAnswer={onShowAnswer}
        onMarkReviewed={onMarkReviewed}
      />
    </section>
  );
}
