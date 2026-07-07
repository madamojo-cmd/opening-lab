"use client";
import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { DailyBlundrSupportControls } from "@/components/daily/DailyBlundrSupportControls";
import type { DailyBlundrCardPlayerProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import { getDailyConceptById } from "@/lib/blundr/daily/concepts/dailyConceptRegistry";
import { getStage2OpeningAvailability } from "@/lib/blundr/openings/openingAvailability";

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
  const conceptLabels = (card.conceptIds ?? []).slice(0, 4).map((conceptId) => getDailyConceptById(conceptId)?.shortName || conceptId.split(":").pop() || conceptId);
  const openingColor = getStage2OpeningAvailability(card.repertoireId ?? null)?.learnerPerspective ?? null;

  return (
    <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-green-700">
            {isMiniGame ? "Mini-game" : isTrainingTarget ? "Training target" : "Recall card"}
          </div>
          <h2 className="mt-1 text-lg font-black text-stone-950">{card.openingName || "Daily Blundr"}</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">{card.summary}</p>
          {conceptLabels.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {conceptLabels.map((label) => (
                <span key={label} className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600">
                  {label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{card.deckRank}</div>
      </div>

      <DailyBlundrBoard
        fen={boardFen}
        disabled={locked || Boolean(isMiniGame && activeMiniGameState?.completed) || Boolean(isTrainingTarget && activeTrainingTargetState?.completed) || (!isMiniGame && !isTrainingTarget && mode === "reveal_only")}
        onMoveAttempt={onBoardMoveAttempt}
        squareClickMode={isTrainingTarget && trainingInteractionKind === "square_click"}
        openingColor={openingColor}
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
            <div className="space-y-3 rounded-3xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-600">
              <div className="rounded-2xl bg-stone-50 px-3 py-3 text-sm leading-6 text-stone-600">
                Tap the move on the board. Tempo will grade the selected piece and destination directly.
              </div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">
                {trainingExpectedLabel ? `Expected move: ${trainingExpectedLabel}` : "Board move recall"}
              </div>
            </div>
          )}

          {trainingInteractionKind !== "square_click" ? (
            <DailyBlundrSupportControls
              usedReveal={support.usedReveal}
              answerShown={support.answerShown}
              revealedAt={support.revealedAt}
              disabled={locked}
              onReveal={onReveal}
              onContinue={onMarkReviewed}
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
            <div className="space-y-3 rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Board move recall</div>
                <p className="mt-2 font-semibold text-stone-800">Select the move directly on the board. Tempo grades the piece-to-square path you tap.</p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-3 text-xs font-semibold text-stone-500">
                If you get stuck, tap Reveal to see the answer, then Continue when you are ready to move on.
              </div>
            </div>
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
            onContinue={onMarkReviewed}
          />
        </>
      )}
    </section>
  );
}
