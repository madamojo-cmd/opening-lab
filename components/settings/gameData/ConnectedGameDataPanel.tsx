"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AuthenticatedApiError,
  authenticatedApiFetch,
} from "@/lib/blundr/api/authenticatedApiClient";
import { DisconnectGameDataDialog } from "./DisconnectGameDataDialog";
import { ProviderConnectionCard } from "./ProviderConnectionCard";
import { ProviderUsernameForm } from "./ProviderUsernameForm";

type Provider = "chesscom" | "lichess";
type ProviderState =
  | "disconnected"
  | "verifying"
  | "connected"
  | "queued"
  | "syncing"
  | "current"
  | "delayed"
  | "retryable_error"
  | "permanent_error"
  | "deleting"
  | "deleted";
type Account = {
  provider: Provider;
  username: string;
  verification_state: string;
  last_successful_sync_at: string | null;
  sanitized_error_code: string | null;
};
type Job = {
  provider: Provider;
  status: string;
  fetched_count: number;
  accepted_count: number;
  matched_count: number;
  gated_count: number;
  finding_count: number;
  error_code: string | null;
  updated_at: string;
};
type StatusResponse = {
  accounts: Account[];
  jobs: Job[];
  gamesMatched: number;
  findings: number;
};

const PROVIDERS: readonly { id: Provider; label: string }[] = [
  { id: "chesscom", label: "Chess.com" },
  { id: "lichess", label: "Lichess" },
];

function stateFor(
  account: Account | undefined,
  job: Job | undefined,
): ProviderState {
  if (!account) return "disconnected";
  if (job?.status === "queued") return "queued";
  if (job?.status === "leased" || job?.status === "running") return "syncing";
  if (job?.status === "retryable_error") return "retryable_error";
  if (job?.status === "permanent_error") return "permanent_error";
  if (job?.status === "partially_completed") return "delayed";
  return job?.status === "completed" ? "current" : "connected";
}

export function ConnectedGameDataPanel() {
  const [status, setStatus] = useState<StatusResponse>({
    accounts: [],
    jobs: [],
    gamesMatched: 0,
    findings: 0,
  });
  const [busy, setBusy] = useState<Provider | null>(null);
  const [dialog, setDialog] = useState<{
    provider: Provider;
    deleteSource: boolean;
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await authenticatedApiFetch<StatusResponse>(
        "/api/blundr/game-data/status",
        { cache: "no-store" },
      );
      setStatus(next);
    } catch (error) {
      if (
        error instanceof AuthenticatedApiError &&
        error.code === "authentication_required"
      )
        setMessage("Sign in to connect public game data.");
      else if (
        error instanceof AuthenticatedApiError &&
        error.code === "feature_disabled"
      )
        setMessage(
          "Connected game data is not enabled for this staging environment yet.",
        );
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  useEffect(() => {
    if (
      !status.jobs.some((job) =>
        ["queued", "leased", "running"].includes(job.status),
      )
    )
      return;
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh, status.jobs]);

  async function connect(provider: Provider, username: string) {
    setBusy(provider);
    setMessage(null);
    try {
      await authenticatedApiFetch("/api/blundr/game-data/connections", {
        method: "POST",
        body: JSON.stringify({ provider, username }),
      });
      setMessage(
        `${provider === "chesscom" ? "Chess.com" : "Lichess"} connected. Import queued.`,
      );
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof AuthenticatedApiError
          ? error.message
          : "The connection could not be completed.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function sync(provider: Provider) {
    setBusy(provider);
    try {
      await authenticatedApiFetch("/api/blundr/game-data/sync", {
        method: "POST",
        body: JSON.stringify({ provider }),
      });
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof AuthenticatedApiError
          ? error.message
          : "Sync could not be started.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(provider: Provider, deleteSource: boolean) {
    setBusy(provider);
    try {
      await authenticatedApiFetch(
        `/api/blundr/game-data/connections/${provider}?delete=${deleteSource}`,
        { method: "DELETE" },
      );
      setMessage(
        deleteSource
          ? "Imported data deleted and projections rebuilt."
          : "Provider disconnected.",
      );
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof AuthenticatedApiError
          ? error.message
          : "The provider could not be disconnected.",
      );
    } finally {
      setBusy(null);
      setDialog(null);
    }
  }

  return (
    <section
      aria-labelledby="connected-game-data-title"
      className="space-y-4 rounded-3xl border border-stone-200 bg-stone-50 p-5 text-stone-900 shadow-sm"
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">
          Connected game data
        </p>
        <h2 id="connected-game-data-title" className="mt-1 text-xl font-black">
          Chess.com and Lichess
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Use public usernames only. Blundr never requests provider passwords.
        </p>
        <Link
          href="/privacy"
          className="mt-2 inline-flex text-sm font-black text-green-700 underline underline-offset-4"
        >
          Read the privacy policy
        </Link>
      </div>
      {message ? (
        <p
          role="status"
          className="rounded-xl bg-green-50 p-3 text-sm text-green-900"
        >
          {message}
        </p>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {PROVIDERS.map(({ id, label }) => {
          const account = status.accounts.find((item) => item.provider === id);
          const job = status.jobs.find((item) => item.provider === id);
          const state = stateFor(account, job);
          return (
            <article
              key={id}
              className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-black">{label}</h3>
                <span className="text-xs font-black uppercase tracking-wider text-stone-500">
                  {state.replaceAll("_", " ")}
                </span>
              </div>
              <ProviderConnectionCard status={state as never} />
              {account ? (
                <p className="text-sm font-bold">
                  {account.username}
                  <span className="ml-2 text-stone-500">
                    {account.last_successful_sync_at
                      ? `Last sync ${new Date(account.last_successful_sync_at).toLocaleString()}`
                      : "Awaiting first sync"}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-stone-600">
                  Not connected. Sign in first, then enter a public username.
                </p>
              )}
              {job ? (
                <p className="text-xs text-stone-500">
                  Scanned {job.fetched_count} · accepted {job.accepted_count} ·
                  matched {job.matched_count} · gated {job.gated_count} ·
                  findings {job.finding_count}
                </p>
              ) : null}
              {!account ? (
                <ProviderUsernameForm
                  onSubmit={(username) => void connect(id, username)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy === id}
                    onClick={() => void sync(id)}
                    className="min-h-11 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold"
                  >
                    Sync now
                  </button>
                  <button
                    type="button"
                    disabled={busy === id}
                    onClick={() =>
                      setDialog({ provider: id, deleteSource: false })
                    }
                    className="min-h-11 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold"
                  >
                    Disconnect
                  </button>
                  <button
                    type="button"
                    disabled={busy === id}
                    onClick={() =>
                      setDialog({ provider: id, deleteSource: true })
                    }
                    className="min-h-11 rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-700"
                  >
                    Disconnect and delete
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {dialog ? (
        <DisconnectGameDataDialog
          open
          deleteMode={dialog.deleteSource}
          onCancel={() => setDialog(null)}
          onConfirm={() =>
            void disconnect(dialog.provider, dialog.deleteSource)
          }
        />
      ) : null}
    </section>
  );
}
