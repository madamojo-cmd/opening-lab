export type GameDataStatus =
  | "disconnected"
  | "verifying"
  | "queued"
  | "connected"
  | "syncing"
  | "current"
  | "delayed"
  | "partial"
  | "retryable_error"
  | "permanent_error"
  | "deletion_in_progress"
  | "deletion_success"
  | "deletion_failure";
export function ImportStatusSummary({ status }: { status: GameDataStatus }) {
  const actionable =
    status === "retryable_error" ||
    status === "delayed" ||
    status === "partial";
  return (
    <div className="rounded-2xl border border-stone-200 p-4">
      <h3 className="text-sm font-black">Import status</h3>
      <p className="mt-1 text-sm text-stone-600">
        {status === "current"
          ? "No new games are waiting."
          : status === "syncing"
            ? "The fixture import is running."
            : actionable
              ? "The fixture needs attention before it is considered current."
              : "No live import has been started."}
      </p>
    </div>
  );
}
