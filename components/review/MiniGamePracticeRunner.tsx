"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Home, RefreshCw, Settings, Sparkles } from "lucide-react";

import { BLUNDR_EMPTY_STATE_ASSETS, BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { DailyBlundrPlayer } from "@/components/daily/DailyBlundrPlayer";
import { getDailyBlundrDateKey, reconcileDailyBlundrSession } from "@/lib/blundr/daily/dailyBlundrStorage";
import { getDailyMiniGameDefinition } from "@/lib/blundr/daily/miniGames/dailyMiniGameRegistry";
import type { DailyBlundrMasteryState } from "@/lib/blundr/daily/dailyBlundrTypes";
import type { DailyBlundrReviewAttempt, DailyBlundrReviewCard } from "@/lib/blundr/daily/dailyBlundrReviewTypes";
import type { DailyBlundrPlayerAttemptCommit } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import type { DailyBlundrMiniGameCard, DailyMiniGameId } from "@/lib/blundr/daily/miniGames/dailyMiniGameTypes";
import { recordLearningEvent, createLearningSessionId } from "@/lib/blundr/learning/learningEvents";

type PracticeBundle = {
  card: DailyBlundrMiniGameCard;
  session: ReturnType<typeof reconcileDailyBlundrSession>;
  sessionDateKey: string;
};

type MiniGamePracticeRunnerProps = {
  miniGameId: DailyMiniGameId | string;
  homeHref?: string;
  reviewHref?: string;
  settingsHref?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function buildPracticeBundle(miniGameId: string, nonce: number): PracticeBundle | null {
  const definition = getDailyMiniGameDefinition(miniGameId as DailyMiniGameId);
  if (!definition) return null;
  const now = new Date().toISOString();
  const dateKey = `${getDailyBlundrDateKey()}:${definition.id}:${nonce}`;
  const card = definition.generate({
    dateKey,
    now,
    mastery: null,
    difficulty: definition.recommendedFor[0] ?? "beginner",
    currentMastery: 0.25,
    confidence: 0.25,
    dueReviewCount: 0,
    selectedReviewCount: 0,
    recentMiniGameIds: [],
    recentFenKeys: [],
    sessionMiniGameIds: [],
  });
  if (!card || card.kind !== "mini_game") return null;
  const session = reconcileDailyBlundrSession({
    dateKey,
    deck: [card],
    existing: null,
  });
  return {
    card,
    session,
    sessionDateKey: dateKey,
  };
}

export function MiniGamePracticeRunner({ miniGameId, homeHref = "/", reviewHref = "/review", settingsHref = "/settings" }: MiniGamePracticeRunnerProps) {
  const [practiceNonce, setPracticeNonce] = useState(0);
  const practiceBundle = useMemo(() => buildPracticeBundle(miniGameId, practiceNonce), [miniGameId, practiceNonce]);
  const definition = useMemo(() => getDailyMiniGameDefinition(miniGameId as DailyMiniGameId), [miniGameId]);

  const [session, setSession] = useState<PracticeBundle["session"] | null>(practiceBundle?.session ?? null);
  const [cards, setCards] = useState<PracticeBundle["card"][]>(practiceBundle ? [practiceBundle.card] : []);
  const [reviewCards, setReviewCards] = useState<DailyBlundrReviewCard[]>([]);
  const [reviewAttempts, setReviewAttempts] = useState<DailyBlundrReviewAttempt[]>([]);
  const [mastery, setMastery] = useState<DailyBlundrMasteryState | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setSession(practiceBundle?.session ?? null);
    setCards(practiceBundle ? [practiceBundle.card] : []);
    setReviewCards([]);
    setReviewAttempts([]);
    setMastery(null);
    setStatusMessage(null);
  }, [practiceBundle]);

  function advanceScenario() {
    setPracticeNonce((value) => value + 1);
  }

  function handleAttemptComplete(commit: DailyBlundrPlayerAttemptCommit) {
    setSession(commit.session);
    setReviewCards([...commit.reviewCards]);
    setReviewAttempts([...commit.reviewAttempts]);
    setMastery(commit.mastery);
    setStatusMessage(commit.feedback);

    const currentDefinition = definition ?? getDailyMiniGameDefinition(commit.card.miniGame?.miniGameId ?? miniGameId as DailyMiniGameId);
    if (!currentDefinition) return;

    recordLearningEvent({
      type: commit.scoring.correct ? "move_correct" : "move_incorrect",
      source: "review",
      sessionId: commit.session.dateKey || createLearningSessionId(),
      userId: getLocalAccountCurrentUserId(),
      fen: normalizeText(commit.card.miniGame?.currentFen ?? commit.card.fen),
      openingName: currentDefinition.displayName ?? currentDefinition.title,
      patternId: `mini:${currentDefinition.id}`,
      concept: commit.card.concept ?? null,
      expectedMoveUci: commit.scoring.expectedMoveUci ?? null,
      expectedMoveSan: commit.scoring.expectedMoveSan ?? null,
      playedMoveUci: commit.scoring.attemptedMoveUci ?? null,
      playedMoveSan: commit.scoring.attemptedMoveSan ?? null,
      correct: commit.scoring.correct,
      timeToMoveMs: commit.attempt.responseTimeMs ?? undefined,
      metadata: {
        practiceMode: "mini_game",
        miniGameId: currentDefinition.id,
        scenarioId: commit.card.miniGame?.scenarioId ?? null,
        completed: commit.sessionComplete,
      },
    });
  }

  if (!definition) {
    return (
      <section className="space-y-4">
        <header className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                <Sparkles size={14} />
                Minigames
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">Unknown minigame</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Tempo could not find a playable minigame for this route. Return to Review and pick one from the registry.
              </p>
            </div>
            <Link href={settingsHref} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm" aria-label="Open settings">
              <Settings size={18} />
            </Link>
          </div>
        </header>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <BlundrAssetImage asset={BLUNDR_EMPTY_STATE_ASSETS.errorSafeFallback} alt="Safe fallback" variant="emptyState" className="mx-auto sm:mx-0 sm:shrink-0" />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Safe fallback</div>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                This practice route is intentionally calm. No progress is lost when a minigame id does not resolve.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href={reviewHref} className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm">
              <ArrowLeft size={16} />
              Back to Review
            </Link>
            <Link href={homeHref} className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-stone-700 shadow-sm">
              <Home size={16} />
              Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <Sparkles size={14} />
              Practice hub
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">{definition.displayName ?? definition.title}</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">{definition.shortDescription ?? definition.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={settingsHref} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm" aria-label="Open settings">
              <Settings size={18} />
            </Link>
            <Link href={reviewHref} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm" aria-label="Back to Review">
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.pointing} alt="Tempo pointing" variant="tempoCard" className="mx-auto w-full max-w-[9rem] sm:mx-0 sm:w-32" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-green-700">
                {definition.canAppearInDailyBlundr === false ? "Practice only" : "Daily Blundr"}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                {definition.canAppearInStandalonePractice === false ? "Queue only" : "Standalone"}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                {definition.estimatedSeconds ? `${definition.estimatedSeconds}s` : "Quick"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Skills: <span className="font-black text-stone-900">{definition.skillIds.join(", ")}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Tempo uses the same board theme, move grading, and Daily Blundr controls here. Practice does not mark the Daily Blundr deck complete.
            </p>
          </div>
        </div>
      </section>

      {statusMessage ? (
        <div className="rounded-[1.5rem] border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900 shadow-sm">{statusMessage}</div>
      ) : null}

      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <DailyBlundrPlayer
          cards={cards}
          session={session}
          reviewCards={reviewCards}
          reviewAttempts={reviewAttempts}
          mastery={mastery}
          onAttemptComplete={handleAttemptComplete}
          onSessionComplete={handleAttemptComplete}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={advanceScenario}
          className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm"
        >
          <RefreshCw size={16} />
          Try another scenario
        </button>
        <Link href={reviewHref} className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] bg-stone-100 px-4 py-3 text-sm font-black text-stone-700 shadow-sm">
          <Home size={16} />
          Back to Review
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Scenario</div>
          <div className="mt-2 text-lg font-black tracking-tight text-stone-950">{definition.displayName ?? definition.title}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">{definition.instructions ?? "Solve the position using the board and move controls."}</p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Practice state</div>
          <div className="mt-2 text-lg font-black tracking-tight text-stone-950">{session?.status ?? "not started"}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {session?.completedAt ? "Tempo logged a clean finish for this scenario." : "Keep going until the route is complete."}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Session id</div>
          <div className="mt-2 text-lg font-black tracking-tight text-stone-950">{session?.dateKey ?? "n/a"}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">A fresh scenario seed appears each time you tap Try another scenario.</p>
        </div>
      </section>
    </section>
  );
}
