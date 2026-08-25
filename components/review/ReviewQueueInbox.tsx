"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, RefreshCcw, Timer } from "lucide-react";

import type { ReviewQueueItem } from "@/lib/blundr/reviewQueue/reviewQueueTypes";
import {
  buildReviewQueuePracticeActionHref,
  formatLifecycleLabel,
} from "@/lib/blundr/reviewQueue/reviewQueueModel";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; data: InboxPayload }
  | { kind: "error"; code: string };

type InboxPayload = {
  syncState: string;
  generatedAt: string;
  lastSyncAt: string | null;
  page: number;
  limit: number;
  nextPage: number | null;
  items: ReviewQueueItem[];
  warnings: string[];
};

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

export function ReviewQueueInbox() {
  const [page, setPage] = useState(0);
  const [limit] = useState(25);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const requestId = useRef(0);

  const query = useMemo(
    () =>
      new URLSearchParams({
        page: String(page),
        limit: String(limit),
        includeResolved: includeResolved ? "1" : "0",
      }).toString(),
    [includeResolved, limit, page],
  );

  const load = () => {
    const currentRequest = (requestId.current += 1);
    setState({ kind: "loading" });
    void fetch(`/api/blundr/review-queue?${query}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as
          | { ok: true; data: InboxPayload }
          | { ok: false; error: string };
        if (currentRequest !== requestId.current) return;
        if (!response.ok || !payload.ok)
          throw new Error(
            !payload || typeof payload !== "object"
              ? "unknown_error"
              : (payload as { ok: false; error: string }).error ??
                  "unknown_error",
          );
        setState({ kind: "ready", data: payload.data });
      })
      .catch((error: unknown) => {
        if (currentRequest !== requestId.current) return;
        setState({
          kind: "error",
          code: String((error as { message?: unknown })?.message ?? error),
        });
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (state.kind === "loading") {
    return (
      <div className="mt-4 space-y-3">
        <div className="h-10 animate-pulse rounded-[14px] bg-stone-100" />
        <div className="h-10 animate-pulse rounded-[14px] bg-stone-100" />
        <div className="h-10 animate-pulse rounded-[14px] bg-stone-100" />
      </div>
    );
  }

  if (state.kind === "error") {
    const unauth = state.code === "authentication_required";
    return (
      <div className="mt-4 rounded-[16px] border border-stone-200 bg-[#f8f8f5] p-4 text-sm text-stone-800">
        <div className="flex items-center gap-2 font-black text-stone-950">
          <AlertTriangle size={16} />
          {unauth ? "Sign in required" : "Review queue unavailable"}
        </div>
        <p className="mt-2 text-[12px] leading-[1.5] text-stone-600">
          {unauth
            ? "This inbox requires an authenticated account."
            : "The server did not return a usable review queue payload."}
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
    );
  }

  const payload = state.data;
  const items = payload.items ?? [];
  const isUnavailable = payload.syncState === "unavailable";
  const isEmpty = !isUnavailable && items.length === 0;
  const isStale = payload.syncState === "stale";
  const isPartial = payload.syncState === "partial";

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-stone-700">
            {items.length} items
          </span>
          {isStale || isPartial ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-900">
              <Timer size={12} />
              {isStale ? "Stale" : "Partial"}
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 text-[11px] font-black text-stone-700">
            <input
              type="checkbox"
              checked={includeResolved}
              onChange={(event) => setIncludeResolved(event.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-green-800"
            />
            Include resolved
          </label>
          <button
            type="button"
            onClick={load}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-stone-200 bg-white text-stone-900 shadow-sm transition hover:-translate-y-0.5"
            aria-label="Refresh review queue"
            title="Refresh"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {payload.lastSyncAt ? (
        <div className="text-[11px] text-stone-500">
          Last sync: {formatTimestamp(payload.lastSyncAt)}
        </div>
      ) : null}

      {isUnavailable ? (
        <div className="rounded-[16px] border border-stone-200 bg-[#f8f8f5] p-4 text-sm text-stone-800">
          <div className="flex items-center gap-2 font-black text-stone-950">
            <AlertTriangle size={16} />
            Review queue unavailable
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-stone-600">
            This environment does not have the durable learning reader enabled.
          </p>
        </div>
      ) : isEmpty ? (
        <div className="rounded-[16px] border border-stone-200 bg-[#f8f8f5] p-4 text-sm text-stone-800">
          <div className="flex items-center gap-2 font-black text-stone-950">
            <ArrowRight size={16} />
            No queued mistakes
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-stone-600">
            When genuine weakness projections exist, they appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((item) => {
            const href = buildReviewQueuePracticeActionHref(item);
            return (
              <div
                key={`${item.positionKey}:${item.category}`}
                className="rounded-[14px] border border-stone-200 bg-[#f8f8f5] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${badgeClass(item.lifecycleState)}`}
                    >
                      {formatLifecycleLabel(item.lifecycleState)}
                    </span>
                    <span className="text-[11px] font-black text-stone-900">
                      {item.openingId ?? "Unknown opening"}
                    </span>
                  </div>
                  {href ? (
                    <Link
                      href={href}
                      className="inline-flex min-h-9 items-center gap-2 rounded-[12px] bg-green-800 px-3 text-[12px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-900"
                      aria-label="Practice this position"
                    >
                      Practice
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-[12px] border border-stone-200 bg-white px-3 py-2 text-[11px] font-black text-stone-700">
                      <AlertTriangle size={14} />
                      Not eligible
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[12px] leading-[1.5] text-stone-600">
                  {item.explanation || "No explanation available."}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                  <span>Score {Math.round((item.score ?? 0) * 100)}%</span>
                  <span>
                    Confidence {Math.round((item.confidence ?? 0) * 100)}%
                  </span>
                  <span>Updated {formatTimestamp(item.updatedAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page <= 0}
          className="inline-flex min-h-10 items-center rounded-[12px] border border-stone-200 bg-white px-3 text-[12px] font-black text-stone-900 shadow-sm disabled:opacity-40"
        >
          Previous
        </button>
        <div className="text-[11px] text-stone-500">Page {page + 1}</div>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={payload.nextPage === null}
          className="inline-flex min-h-10 items-center rounded-[12px] border border-stone-200 bg-white px-3 text-[12px] font-black text-stone-900 shadow-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

