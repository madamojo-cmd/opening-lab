"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Eye, RefreshCcw } from "lucide-react";
import { Chess } from "chess.js";

import { DailyBlundrBoard } from "@/components/daily/DailyBlundrBoard";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import type { DailyBlundrBoardMoveAttempt } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import { formatLifecycleLabel } from "@/lib/blundr/reviewQueue/reviewQueueModel";

type Snapshot = {
  mistakeId: string;
  openingId: string | null;
  playKey: string | null;
  repertoireSide: "white" | "black" | "unknown";
  canonicalFen: string;
  category: string;
  lifecycleState: string;
  missCount: number;
  lastMissedAt: string | null;
  updatedAt: string;
};

type AttemptResult = {
  correct: boolean;
  resolved: boolean;
  lifecycleState: string | null;
  reviewRating: string | null;
  dueAt: string | null;
};

type RevealResult = {
  expectedMoveUci: string;
  expectedMoveSan: string | null;
};

type InboxPayload = {
  items: Array<{ mistakeId: string; positionKey: string }>;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; data: Snapshot }
  | { kind: "error"; code: string };

function formatTimestamp(value: string | null): string {
  if (!value) return "unknown";
  const parsed = new Date(value);
  return Number.isFinite(parsed.valueOf())
    ? `${parsed.toISOString().replace("T", " ").slice(0, 16)} UTC`
    : "unknown";
}

function badgeClass(state: string): string {
  switch (state) {
    case "active":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "remediating":
      return "bg-blue-50 text-blue-900 border-blue-200";
    case "resolved":
      return "bg-emerald-50 text-emerald-900 border-emerald-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}

export function ReviewMistakeReplay({ mistakeId }: { mistakeId: string }) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [attempt, setAttempt] = useState<AttemptResult | null>(null);
  const [reveal, setReveal] = useState<RevealResult | null>(null);
  const [confirmedMoveUci, setConfirmedMoveUci] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);
  const attemptCount = useRef(0);

  const load = () => {
    setState({ kind: "loading" });
    void authenticatedApiFetch<
      | { ok: true; data: Snapshot }
      | { ok: false; error: string }
    >(`/api/blundr/review-mistakes/${encodeURIComponent(mistakeId)}`, {
      cache: "no-store",
    })
      .then((payload) => {
        if (payload.ok === false)
          throw new Error(payload.error || "unknown_error");
        setState({ kind: "ready", data: payload.data });
      })
      .catch((error: unknown) => {
        setState({
          kind: "error",
          code: String((error as { message?: unknown })?.message ?? error),
        });
      });
  };

  useEffect(() => {
    attemptCount.current = 0;
    setAttempt(null);
    setReveal(null);
    setConfirmedMoveUci(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mistakeId]);

  const readySnapshot = state.kind === "ready" ? state.data : null;

  const orientation =
    readySnapshot?.repertoireSide === "black" ? "black" : "white";

  const title =
    readySnapshot
      ? `${readySnapshot.openingId ?? "Unknown opening"} · ${readySnapshot.repertoireSide === "unknown" ? "Unknown side" : readySnapshot.repertoireSide === "white" ? "White" : "Black"}`
      : "Mistake replay";

  const demonstratedMoveUci = reveal?.expectedMoveUci ?? confirmedMoveUci;

  const demonstratedFen = useMemo(() => {
    if (!readySnapshot) return "";
    if (!demonstratedMoveUci) return readySnapshot.canonicalFen;
    try {
      const chess = new Chess(readySnapshot.canonicalFen);
      const move = chess.move({
        from: demonstratedMoveUci.slice(0, 2),
        to: demonstratedMoveUci.slice(2, 4),
        promotion:
          demonstratedMoveUci.length > 4
            ? demonstratedMoveUci.slice(4, 5)
            : undefined,
      });
      return move ? chess.fen() : readySnapshot.canonicalFen;
    } catch {
      return readySnapshot.canonicalFen;
    }
  }, [demonstratedMoveUci, readySnapshot]);

  const demonstratedSquareStyles = useMemo(() => {
    if (!demonstratedMoveUci) return {};
    const from = demonstratedMoveUci.slice(0, 2);
    const to = demonstratedMoveUci.slice(2, 4);
    if (!/^[a-h][1-8]$/.test(from) || !/^[a-h][1-8]$/.test(to)) return {};
    return {
      [from]: {
        boxShadow: "inset 0 0 0 4px rgba(245, 158, 11, 0.92)",
        backgroundColor: "rgba(253, 230, 138, 0.72)",
      },
      [to]: {
        boxShadow: "inset 0 0 0 4px rgba(22, 163, 74, 0.92)",
        backgroundColor: "rgba(187, 247, 208, 0.78)",
      },
    };
  }, [demonstratedMoveUci]);

  if (state.kind === "loading") {
    return (
      <section className="mx-auto w-full max-w-[1120px] space-y-4 py-8">
        <div className="h-10 animate-pulse rounded-[14px] bg-stone-100" />
        <div className="h-[440px] animate-pulse rounded-[22px] bg-stone-100" />
      </section>
    );
  }

  if (state.kind === "error") {
    const unauth = state.code === "authentication_required";
    const notFound = state.code === "not_found";
    return (
      <section className="mx-auto w-full max-w-[1120px] space-y-4 py-8">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/review"
            className="inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-stone-200 bg-white px-3 text-[12px] font-black text-stone-900 shadow-sm"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>
        <div className="rounded-[16px] border border-stone-200 bg-[#f8f8f5] p-4 text-sm text-stone-800">
          <div className="flex items-center gap-2 font-black text-stone-950">
            <AlertTriangle size={16} />
            {unauth
              ? "Sign in required"
              : notFound
                ? "Mistake not found"
                : "Mistake replay unavailable"}
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-stone-600">
            {unauth
              ? "This replay requires an authenticated account."
              : notFound
                ? "This queued mistake no longer exists for your account."
                : "The server did not return a usable replay payload."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-stone-200 bg-white px-3 text-[12px] font-black text-stone-900 shadow-sm transition hover:-translate-y-0.5"
            >
              <RefreshCcw size={14} />
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  const snapshot = state.data;

  const submitAttempt = async (uci: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const payload = await authenticatedApiFetch<
        | { ok: true; data: AttemptResult }
        | { ok: false; error: string }
      >(
        `/api/blundr/review-mistakes/${encodeURIComponent(snapshot.mistakeId)}/attempt`,
        {
          method: "POST",
          body: JSON.stringify({
            uci,
            retry: attemptCount.current > 0,
          }),
        },
      );
      if (payload.ok === false)
        throw new Error(payload.error || "unknown_error");
      attemptCount.current += 1;
      if (payload.data.correct) {
        setConfirmedMoveUci(uci);
      }
      setAttempt(payload.data);
    } catch (error: unknown) {
      setAttempt({
        correct: false,
        resolved: false,
        lifecycleState: null,
        reviewRating: null,
        dueAt: null,
      });
    } finally {
      setBusy(false);
    }
  };

  const onRetry = () => {
    attemptCount.current += 1;
    setAttempt(null);
    setReveal(null);
    setConfirmedMoveUci(null);
    setReplayNonce((value) => value + 1);
  };

  const onContinue = async () => {
    if (busy || !attempt?.correct) return;
    setBusy(true);
    try {
      const payload = await authenticatedApiFetch<
        | { ok: true; data: InboxPayload }
        | { ok: false; error: string }
      >("/api/blundr/review-queue?limit=2&page=0", { cache: "no-store" });
      if (payload.ok === false)
        throw new Error(payload.error || "unknown_error");
      const next = payload.data.items.find(
        (item) => item.mistakeId !== snapshot.mistakeId,
      );
      router.replace(
        next
          ? `/review/mistakes/${encodeURIComponent(next.mistakeId)}`
          : "/review",
      );
    } catch {
      router.replace("/review");
    } finally {
      setBusy(false);
    }
  };

  const onBoardAttempt = (move: DailyBlundrBoardMoveAttempt) => {
    if (!move.legal) return;
    void submitAttempt(move.uci);
  };

  const onReveal = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const payload = await authenticatedApiFetch<
        | { ok: true; data: RevealResult }
        | { ok: false; error: string }
      >(
        `/api/blundr/review-mistakes/${encodeURIComponent(snapshot.mistakeId)}/reveal`,
        { method: "POST" },
      );
      if (payload.ok === false)
        throw new Error(payload.error || "unknown_error");
      setReveal(payload.data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1120px] space-y-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/review"
          className="inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-stone-200 bg-white px-3 text-[12px] font-black text-stone-900 shadow-sm"
        >
          <ArrowLeft size={14} />
          Back
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${badgeClass(snapshot.lifecycleState)}`}
          >
            {formatLifecycleLabel(snapshot.lifecycleState)}
          </span>
          <span className="text-[12px] font-black text-stone-900">{title}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.64fr)]">
        <DailyBlundrBoard
          key={`${snapshot.mistakeId}:${replayNonce}`}
          fen={demonstratedFen}
          forcedOrientation={orientation}
          openingColor={orientation}
          disabled={busy || Boolean(attempt?.correct)}
          onMoveAttempt={onBoardAttempt}
          squareStyles={demonstratedSquareStyles}
        />

        <div className="space-y-3">
          <div className="rounded-[18px] border border-stone-200 bg-[#f8f8f5] p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-green-800">
              Replay
            </div>
            <div className="mt-2 text-sm font-black text-stone-950">
              Find the move you missed.
            </div>
            <div className="mt-2 text-[12px] leading-[1.55] text-stone-600">
              {snapshot.category ? `Category: ${snapshot.category}. ` : null}
              Misses: {Math.max(0, snapshot.missCount ?? 0)}. Last missed:{" "}
              {formatTimestamp(snapshot.lastMissedAt)}.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRetry}
                disabled={busy}
                className="inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-stone-200 bg-white px-3 text-[12px] font-black text-stone-900 shadow-sm disabled:opacity-40"
              >
                <RefreshCcw size={14} />
                Retry
              </button>
              <button
                type="button"
                onClick={onReveal}
                disabled={busy || Boolean(reveal)}
                className="inline-flex min-h-10 items-center gap-2 rounded-[12px] bg-green-800 px-3 text-[12px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-900 disabled:opacity-40"
              >
                <Eye size={14} />
                Reveal
              </button>
              {attempt?.correct ? (
                <button
                  type="button"
                  onClick={() => void onContinue()}
                  disabled={busy}
                  className="inline-flex min-h-10 items-center gap-2 rounded-[12px] bg-stone-950 px-3 text-[12px] font-black text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-40"
                >
                  Continue
                </button>
              ) : null}
            </div>
          </div>

          {attempt ? (
            <div
              className={`rounded-[18px] border p-4 text-sm ${
                attempt.correct
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                  : "border-amber-200 bg-amber-50 text-amber-950"
              }`}
            >
              <div className="font-black">
                {attempt.correct ? "Correct." : "Not quite."}
              </div>
              <div className="mt-2 text-[12px] leading-[1.55] opacity-90">
                {attempt.correct
                  ? "Recorded. Continue to the next queued mistake."
                  : "Try again, or Reveal after a couple attempts."}
              </div>
            </div>
          ) : null}

          {reveal ? (
            <div className="rounded-[18px] border border-stone-200 bg-white p-4 text-sm text-stone-900 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-green-800">
                Answer
              </div>
              <div className="mt-2 text-[12px] leading-[1.55] text-stone-700">
                Expected move:{" "}
                <span className="font-black text-stone-950">
                  {reveal.expectedMoveSan
                    ? `${reveal.expectedMoveSan} (${reveal.expectedMoveUci})`
                    : reveal.expectedMoveUci}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-stone-500">
                Reveal does not resolve the inbox item.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
