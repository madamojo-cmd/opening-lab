"use client";

import { Keyboard } from "lucide-react";
import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { DailyBlundrSupportControls } from "@/components/daily/DailyBlundrSupportControls";
import type { DailyBlundrCardPlayerProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

function resolveExpectedMoveLabel(expectedMoveUci: string | null | undefined, expectedMoveSan: string | null | undefined): string {
  return expectedMoveUci || expectedMoveSan || "the saved move";
}

function resolveTrainingTargetExpectedLabel(card: DailyBlundrCardPlayerProps["card"], state: NonNullable<DailyBlundrCardPlayerProps["trainingTargetState"]>): string {
  if (state.interactionKind === "sequence") {
    const sequenceIndex = Math.min(state.plyCount, Math.max(0, (state.expectedSequenceUci?.length ?? 1) - 1));
    return state.expectedSequenceUci?.[sequenceIndex] || state.expectedSequenceUci?.[0] || state.expectedMoveUci || "the next move";
  }
  return state.expectedMoveUci || state.expectedMoveSan || card.expectedMoveUci || card.expectedMoveSan || "the saved move";
}

export function DailyBlundrCardPlayer({
  card,
  mode,
  moveInput,
  support,
  locked,
  miniGameState,
  trainingTargetState,
  onMoveInputChange,
  onSubmitMove,
  onBoardMoveAttempt,
  onSquareClick,
  onChoiceSelect,
  onReveal,
  onShowAnswer,
  onMarkReviewed,
}: DailyBlundrCardPlayerProps) {
  const isMiniGame = card.kind === "mini_game";
  const isTrainingTarget = card.kind === "training_target";
  const activeMiniGameState = isMiniGame ? miniGameState ?? card.miniGame ?? null : null;
  const activeTrainingTargetState = isTrainingTarget ? trainingTargetState ?? card.trainingTarget ?? null : null;
  const trainingInteractionKind = activeTrainingTargetState?.interactionKind ?? card.trainingTarget?.interactionKind ?? "move_input";
  const boardFen = isMiniGame
    ? activeMiniGameState?.currentFen ?? card.miniGame?.currentFen ?? card.fen
    : isTrainingTarget
      ? activeTrainingTargetState?.currentFen ?? card.trainingTarget?.currentFen ?? card.fen
      : card.fen;
  const answerVisible = support.answerShown || support.usedReveal;
  const expectedMove = resolveExpectedMoveLabel(card.expectedMoveUci, card.expectedMoveSan);
  const movesRemaining = isMiniGame && activeMiniGameState ? Math.max(0, activeMiniGameState.moveLimit - activeMiniGameState.plyCount) : null;
  const trainingStepLabel =
    isTrainingTarget && activeTrainingTargetState?.interactionKind === "sequence"
      ? `Step ${Math.min((activeTrainingTargetState.plyCount ?? 0) + 1, Math.max(1, activeTrainingTargetState.expectedSequenceUci?.length ?? 1))} of ${Math.max(1, activeTrainingTargetState.expectedSequenceUci?.length ?? 1)}`
      : null;
  const trainingExpectedLabel = isTrainingTarget && activeTrainingTargetState ? resolveTrainingTargetExpectedLabel(card, activeTrainingTargetState) : null;
  const trainingChoices = isTrainingTarget ? activeTrainingTargetState?.candidateMoves ?? card.trainingTarget?.candidateMoves ?? [] : [];
  const trainingSquareTargets = isTrainingTarget ? activeTrainingTargetState?.correctSquareKeys ?? activeTrainingTargetState?.targetSquares ?? card.trainingTarget?.correctSquareKeys ?? card.trainingTarget?.targetSquares ?? [] : [];

  return (
    <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-green-700">
            {isMiniGame ? "Mini-game" : isTrainingTarget ? "Training target" : "Recall card"}
          </div>
          <h2 className="mt-1 text-lg font-black text-stone-950">{card.openingName || "Daily BLUNDR"}</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">{card.summary}</p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{card.deckRank}</div>
      </div>

      <DailyBlundrBoard
        fen={boardFen}
        disabled={locked || Boolean(isMiniGame && activeMiniGameState?.completed) || Boolean(isTrainingTarget && activeTrainingTargetState?.completed) || (!isMiniGame && !isTrainingTarget && mode === "reveal_only")}
        onMoveAttempt={onBoardMoveAttempt}
        squareClickMode={isTrainingTarget && trainingInteractionKind === "square_click"}
        onSquareClick={
          isTrainingTarget && trainingInteractionKind === "square_click"
            ? (square) => onSquareClick?.(square)
            : undefined
        }
      />

      {isMiniGame ? (
        <div className="space-y-3 rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Objective</div>
            <p className="mt-2 font-semibold text-stone-800">{card.prompt}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-wide text-stone-600">
            <div className="rounded-2xl bg-white px-3 py-3">
              Moves left
              <div className="mt-1 text-lg font-black text-stone-900">{movesRemaining ?? card.miniGame?.moveLimit ?? 0}</div>
            </div>
            <div className="rounded-2xl bg-white px-3 py-3">
              Best route
              <div className="mt-1 text-lg font-black text-stone-900">{card.miniGame?.bestKnownScore ?? "?"}</div>
            </div>
          </div>
          <div className="rounded-2xl bg-white px-3 py-3 text-xs font-semibold text-stone-500">
            {card.miniGame?.goalSquares?.length ? `Goal: ${card.miniGame.goalSquares.join(", ")}` : "Goal: solve the route."}
            {card.miniGame?.targetSquares?.length ? ` Targets: ${card.miniGame.targetSquares.join(", ")}` : ""}
          </div>
        </div>
      ) : isTrainingTarget ? (
        <div className="space-y-3 rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Objective</div>
            <p className="mt-2 font-semibold text-stone-800">{activeTrainingTargetState?.prompt ?? card.prompt}</p>
            {trainingStepLabel ? <div className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-stone-500">{trainingStepLabel}</div> : null}
          </div>

          {trainingInteractionKind === "multiple_choice" ? (
            <div className="grid grid-cols-1 gap-2">
              {trainingChoices.map((candidate) => (
                <button
                  key={candidate.uci}
                  type="button"
                  disabled={locked}
                  onClick={() => onChoiceSelect?.(candidate.uci)}
                  className={`rounded-2xl border px-4 py-3 text-left font-black transition ${
                    candidate.isCorrect
                      ? "border-green-200 bg-white text-stone-900"
                      : "border-stone-200 bg-white text-stone-700"
                  } ${locked ? "opacity-60" : "hover:border-green-700"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{candidate.label || candidate.san || candidate.uci}</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-stone-400">{candidate.isCorrect ? "Expected" : "Choice"}</span>
                  </div>
                  {candidate.explanation ? <div className="mt-1 text-xs font-semibold text-stone-500">{candidate.explanation}</div> : null}
                </button>
              ))}
            </div>
          ) : trainingInteractionKind === "square_click" ? (
            <div className="rounded-2xl bg-white px-3 py-3 text-xs font-semibold text-stone-500">
              {trainingSquareTargets.length ? `Click: ${trainingSquareTargets.join(", ")}` : "Click the key square Tempo marked."}
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitMove(moveInput);
              }}
              className="space-y-3"
            >
              <div className="rounded-2xl bg-white p-3 text-sm leading-6 text-stone-600">
                Enter the move in UCI, or SAN if that is the move you remember. UCI is preferred for grading.
              </div>
              <div>
                <label htmlFor={`daily-blundr-training-target-${card.cardKey}`} className="text-xs font-black uppercase tracking-wide text-stone-500">
                  Your move
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id={`daily-blundr-training-target-${card.cardKey}`}
                    value={moveInput}
                    onChange={(event) => onMoveInputChange(event.target.value)}
                    placeholder={trainingExpectedLabel ?? "e2e4"}
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
                  onClick={() => onMoveInputChange(trainingExpectedLabel ?? "")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 font-black text-stone-700"
                >
                  <Keyboard size={15} />
                  Fill answer
                </button>
              </div>
            </form>
          )}

          {trainingInteractionKind !== "square_click" ? (
            <DailyBlundrSupportControls
              usedReveal={support.usedReveal}
              answerShown={support.answerShown}
              revealedAt={support.revealedAt}
              disabled={locked}
              onReveal={onReveal}
              onShowAnswer={onShowAnswer}
              onMarkReviewed={onMarkReviewed}
            />
          ) : null}

          {answerVisible && trainingInteractionKind !== "square_click" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-900">
              Tempo was looking for {trainingExpectedLabel}.
            </div>
          ) : null}
        </div>
      ) : (
        <>
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
        </>
      )}
    </section>
  );
}
