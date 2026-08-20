"use client";

import { useState } from "react";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import type { WeakBranch } from "@/lib/blundr/masteryMap";
import styles from "./OpeningDetail.module.css";
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
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Practice next</h2>
          <p className={styles.sectionCopy}>
            Weak branches are ranked from the current mastery evidence.
          </p>
        </div>
      </div>
      {branches.length ? (
        <div className={styles.weakGrid}>
          {branches.map((branch) => (
            <article key={branch.positionKey} className={styles.weakCard}>
              <p className={styles.weakName}>{branch.sanSequence.join(" ")}</p>
              <p className={styles.bodyCopy}>{branch.explanation}</p>
              <p className={styles.weakActivity}>
                {branch.recommendedActivity.replaceAll("_", " ")}
              </p>
              <button
                type="button"
                onClick={() => void addToToday(branch)}
                className={styles.dailyButton}
              >
                Add to today
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.bodyCopy}>
          No sufficiently evidenced weak branches.
        </p>
      )}
      {message ? (
        <p role="status" className={styles.statusMessage}>
          {message}
        </p>
      ) : null}
    </section>
  );
}
