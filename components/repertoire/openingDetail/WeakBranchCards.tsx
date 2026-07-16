"use client";

import { useState } from "react";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import type { WeakBranch } from "@/lib/blundr/masteryMap";
export function WeakBranchCards({
  branches,
  openingId,
}: {
  branches: readonly WeakBranch[];
  openingId: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  async function addToToday(branch: WeakBranch) {
    try {
      const result = await authenticatedApiFetch<{
        status: string;
        reason?: string;
      }>("/api/blundr/daily/priorities", {
        method: "POST",
        body: JSON.stringify({ openingId, positionKey: branch.positionKey }),
      });
      setMessage(
        result.status === "queued_tomorrow"
          ? "Queued for tomorrow because today’s deck is already reserved."
          : result.status.replaceAll("_", " "),
      );
    } catch {
      setMessage(
        "This weakness could not be added because the Daily service is unavailable.",
      );
    }
  }
  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
      <h2 className="text-xl font-black">Practice next</h2>
      {branches.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {branches.map((branch) => (
            <article
              key={branch.positionKey}
              className="rounded-2xl bg-stone-50 p-4"
            >
              <p className="font-bold">{branch.sanSequence.join(" ")}</p>
              <p className="mt-2 text-sm text-stone-600">
                {branch.explanation}
              </p>
              <p className="mt-3 text-xs font-black uppercase tracking-wide text-green-700">
                {branch.recommendedActivity.replaceAll("_", " ")}
              </p>
              <button
                type="button"
                onClick={() => void addToToday(branch)}
                className="mt-3 min-h-11 rounded-2xl bg-green-700 px-3 py-2 text-sm font-black text-white"
              >
                Add to today
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-stone-600">
          No sufficiently evidenced weak branches.
        </p>
      )}
      {message ? (
        <p
          role="status"
          className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-900"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
