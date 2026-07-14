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
          Fixture-driven connection states for provider setup. Networking is
          intentionally disabled in this foundation.
        </p>
      </div>
      <ProviderConnectionCard status={status} />
      <ImportStatusSummary status={status} />
      {status === "disconnected" || status === "verifying" ? (
        <ProviderUsernameForm
          onSubmit={(provider, username) => {
            setStatus("verifying");
            onConnect?.(provider, username);
          }}
        />
      ) : null}
      {status !== "disconnected" ? (
        <button
          type="button"
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold"
          onClick={() => setDisconnecting(true)}
        >
          Disconnect game data
        </button>
      ) : null}
      <DisconnectGameDataDialog
        open={disconnecting}
        onCancel={() => setDisconnecting(false)}
        onConfirm={() => {
          setDisconnecting(false);
          setStatus("disconnected");
          onDisconnect?.();
        }}
      />
    </section>
  );
}
