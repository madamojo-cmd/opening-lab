"use client";
import { useState } from "react";
import { ProviderConnectionCard } from "./ProviderConnectionCard";
import { DisconnectGameDataDialog } from "./DisconnectGameDataDialog";
import {
  ImportStatusSummary,
  type GameDataStatus,
} from "./ImportStatusSummary";
import { ProviderUsernameForm } from "./ProviderUsernameForm";

export type ConnectedGameDataPanelProps = {
  initialStatus?: GameDataStatus;
  onConnect?: (provider: "chesscom" | "lichess", username: string) => void;
  onDisconnect?: () => void;
};
export function ConnectedGameDataPanel({
  initialStatus = "disconnected",
  onConnect,
  onDisconnect,
}: ConnectedGameDataPanelProps) {
  const [status, setStatus] = useState<GameDataStatus>(initialStatus);
  const [disconnecting, setDisconnecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [provider, setProvider] = useState<"chesscom" | "lichess" | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function connect(
    nextProvider: "chesscom" | "lichess",
    nextUsername: string,
  ) {
    setProvider(nextProvider);
    setUsername(nextUsername);
    setStatus("verifying");
    setMessage(null);
    try {
      const response = await fetch("/api/blundr/game-data/connections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: nextProvider,
          username: nextUsername,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus(
          payload.error === "account_not_found"
            ? "permanent_error"
            : "retryable_error",
        );
        setMessage(
          "We could not verify that public account. No provider password is required or requested.",
        );
        return;
      }
      setStatus("connected");
      setMessage(
        "Connected. Blundr reads completed public games and never requests your provider password.",
      );
    } catch {
      setStatus("retryable_error");
      setMessage("The connection could not be reached. Try again later.");
    }
    onConnect?.(nextProvider, nextUsername);
  }

  async function sync() {
    if (!provider) return;
    setStatus("syncing");
    const response = await fetch("/api/blundr/game-data/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    setStatus(response.ok ? "syncing" : "retryable_error");
  }

  async function disconnect(deleteSource: boolean) {
    if (!provider) return;
    setStatus("deletion_in_progress");
    const response = await fetch(
      `/api/blundr/game-data/connections/${provider}?delete=${deleteSource}`,
      { method: "DELETE" },
    );
    if (response.ok) {
      setStatus(deleteSource ? "deletion_success" : "disconnected");
      if (deleteSource) setUsername(null);
      onDisconnect?.();
    } else setStatus("deletion_failure");
  }
  return (
    <section
      aria-labelledby="connected-game-data-title"
      className="space-y-4 rounded-3xl border border-stone-200 bg-stone-50 p-5 text-stone-900 shadow-sm"
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-green-700">
          Game data
        </p>
        <h2 id="connected-game-data-title" className="mt-1 text-xl font-black">
          Connected games
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Blundr reads completed public games and never requests your provider
          password.
        </p>
      </div>
      {provider && username ? (
        <p className="text-sm font-bold">
          {provider} · {username}
        </p>
      ) : null}
      {message ? (
        <p
          role="status"
          className="rounded-xl bg-green-50 p-3 text-sm text-green-900"
        >
          {message}
        </p>
      ) : null}
      <ProviderConnectionCard status={status} />
      <ImportStatusSummary status={status} />
      {status === "disconnected" || status === "verifying" ? (
        <ProviderUsernameForm onSubmit={connect} />
      ) : null}
      {status !== "disconnected" ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold"
            onClick={sync}
            disabled={!provider}
          >
            Sync now
          </button>
          <button
            type="button"
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold"
            onClick={() => setDisconnecting(true)}
          >
            Disconnect
          </button>
          <button
            type="button"
            className="rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-700"
            onClick={() => setDeleting(true)}
          >
            Disconnect and delete
          </button>
        </div>
      ) : null}
      <DisconnectGameDataDialog
        open={disconnecting}
        onCancel={() => setDisconnecting(false)}
        onConfirm={() => {
          setDisconnecting(false);
          void disconnect(false);
        }}
      />
      <DisconnectGameDataDialog
        open={deleting}
        deleteMode
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          setDeleting(false);
          void disconnect(true);
        }}
      />
    </section>
  );
}
