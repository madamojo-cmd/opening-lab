"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import {
  AuthenticatedApiError,
  authenticatedApiFetch,
} from "@/lib/blundr/api/authenticatedApiClient";
import type {
  ReviewAttemptResponse,
  ReviewQueueItem,
  ReviewQueueResponse,
  ReviewRating,
} from "@/lib/blundr/review/reviewContracts";
import type { DailyBlundrBoardMoveAttempt } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

type QueueStatus = "loading" | "ready" | "signed_out" | "unavailable" | "error";

const RATING_LABELS: Record<ReviewRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

function ratingIdempotencyId(attemptId: string, rating: ReviewRating): string {
  // This is intentionally derived, rather than generated, so a retry or refresh
  // repeats the same server-authorized rating request without owning scheduling.
  return `review-rating:${attemptId}:${rating}`;
}

function errorStatus(error: unknown): QueueStatus {
  if (error instanceof AuthenticatedApiError) {
    if (error.code === "authentication_required") return "signed_out";
    if (error.status === 503 || error.code === "persistence_unavailable")
      return "unavailable";
  }
  return "error";
}

export function AuthoritativeReviewQueue() {
  const [items, setItems] = useState<readonly ReviewQueueItem[]>([]);
  const [status, setStatus] = useState<QueueStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await authenticatedApiFetch<ReviewQueueResponse>(
        "/api/blundr/review/queue",
        { cache: "no-store" },
      );
      setItems(response.items);
      setStatus("ready");
    } catch (error) {
      setStatus(errorStatus(error));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const current = items[0] ?? null;
  const awaitingRating = current?.attempt.state === "awaiting_rating";
  const allowedRatings = useMemo(
    () => (awaitingRating ? current?.allowedRatings ?? [] : []),
    [awaitingRating, current?.allowedRatings],
  );

  const reloadAfterConflict = useCallback(async () => {
    setMessage("This review changed in another tab. Reloading your queue.");
    await load();
  }, [load]);

  const submitAttempt = useCallback(
    async (body: { playedMoveUci: string } | { reveal: true }) => {
      if (!current || pending || awaitingRating) return;
      setPending(true);
      setMessage(null);
      try {
        const result = await authenticatedApiFetch<ReviewAttemptResponse>(
          "/api/blundr/review/attempt",
          {
            method: "POST",
            body: JSON.stringify({
              itemId: current.reviewItemId,
              attemptId: current.attempt.attemptId,
              ...body,
            }),
          },
        );
        if (result.state === "awaiting_rating") {
          setItems((queue) =>
            queue.map((item, index) =>
              index === 0
                ? {
                    ...item,
                    attempt: { ...item.attempt, state: "awaiting_rating" },
                    allowedRatings: result.allowedRatings ?? [],
                  }
                : item,
            ),
          );
          setMessage("Correct. Choose a rating to finish this review.");
        } else {
          setMessage("Recorded as Again. Loading the next review.");
          await load();
        }
      } catch (error) {
        if (error instanceof AuthenticatedApiError && error.status === 409) {
          await reloadAfterConflict();
        } else {
          setMessage("Your answer was not recorded. Retry the same review.");
        }
      } finally {
        setPending(false);
      }
    },
    [awaitingRating, current, load, pending, reloadAfterConflict],
  );

  const submitRating = useCallback(
    async (rating: ReviewRating) => {
      if (!current || pending || !allowedRatings.includes(rating)) return;
      setPending(true);
      setMessage(null);
      try {
        await authenticatedApiFetch("/api/blundr/review/rating", {
          method: "POST",
          body: JSON.stringify({
            itemId: current.reviewItemId,
            attemptId: current.attempt.attemptId,
            rating,
            idempotencyId: ratingIdempotencyId(current.attempt.attemptId, rating),
          }),
        });
        setMessage("Rating saved. Loading the next review.");
        await load();
      } catch (error) {
        if (error instanceof AuthenticatedApiError && error.status === 409) {
          await reloadAfterConflict();
        } else {
          setMessage("Your rating was not recorded. Retry the same rating.");
        }
      } finally {
        setPending(false);
      }
    },
    [allowedRatings, current, load, pending, reloadAfterConflict],
  );

  if (status === "loading")
    return <QueueCard><p role="status">Loading your server-owned review queue…</p></QueueCard>;
  if (status === "signed_out")
    return <QueueCard><p role="status">Sign in to review your saved positions.</p><Link href="/login" className="queueAction">Sign in</Link></QueueCard>;
  if (status === "unavailable")
    return <QueueCard><p role="status">Review is temporarily unavailable.</p><button type="button" onClick={() => void load()} className="queueAction">Retry</button></QueueCard>;
  if (status === "error")
    return <QueueCard><p role="status">Your review queue could not load right now.</p><button type="button" onClick={() => void load()} className="queueAction">Retry</button></QueueCard>;
  if (!current)
    return <QueueCard><h2 className="text-lg font-black text-stone-950">Nothing due right now</h2><p className="mt-2 text-sm leading-6 text-stone-600">Train a line to create your next review.</p><Link href="/train" className="queueAction">Train</Link></QueueCard>;

  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm" aria-label="Review queue">
      <div className="mb-4">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Authoritative Review</div>
        <h2 className="mt-1 text-lg font-black tracking-tight text-stone-950">Play the move you remember</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">Your rating options appear only after the server verifies this attempt.</p>
      </div>
      <DailyBlundrBoard fen={current.fen} disabled={pending || awaitingRating} onMoveAttempt={(attempt: DailyBlundrBoardMoveAttempt) => void submitAttempt({ playedMoveUci: attempt.uci })} openingColor={null} forcedOrientation={null} boardVisuals={null} squareStyles={{}} animationClassName={null} />
      {message ? <p role="status" className="mt-3 text-sm font-semibold text-stone-700">{message}</p> : null}
      {awaitingRating ? (
        <div className="mt-4 grid grid-cols-2 gap-2" aria-label="Review ratings">
          {allowedRatings.map((rating) => <button key={rating} type="button" disabled={pending} onClick={() => void submitRating(rating)} className="min-h-11 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white disabled:opacity-60">{RATING_LABELS[rating]}</button>)}
        </div>
      ) : (
        <button type="button" disabled={pending} onClick={() => void submitAttempt({ reveal: true })} className="mt-4 min-h-11 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-stone-800 disabled:opacity-60">Reveal answer</button>
      )}
    </section>
  );
}

function QueueCard({ children }: { children: ReactNode }) {
  return <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5 text-sm leading-6 text-stone-600 shadow-sm">{children}</section>;
}
