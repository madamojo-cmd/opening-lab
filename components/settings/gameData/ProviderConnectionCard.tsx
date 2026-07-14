import type { GameDataStatus } from "./ImportStatusSummary";
export function ProviderConnectionCard({ status }: { status: GameDataStatus }) {
  const copy: Record<GameDataStatus, string> = {
    disconnected: "No provider connected.",
    verifying: "Verifying the account fixture.",
    connected: "Account connected; import is ready.",
    syncing: "Import in progress.",
    current: "Game data is current.",
    delayed: "The provider is delayed.",
    partial: "Some games are available.",
    retryable_error: "Temporary provider error; retry is available.",
    permanent_error: "The provider rejected this account.",
    deletion_in_progress: "Deleting imported data.",
    deletion_success: "Imported data deleted.",
    deletion_failure: "Deletion needs another attempt.",
  };
  return (
    <div role="status" className="rounded-2xl bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold">Provider connection</span>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black uppercase tracking-wide">
          {status.replaceAll("_", " ")}
        </span>
      </div>
      <p className="mt-2 text-sm text-stone-600">{copy[status]}</p>
    </div>
  );
}
