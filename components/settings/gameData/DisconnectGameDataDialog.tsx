export function DisconnectGameDataDialog({
  open,
  onCancel,
  onConfirm,
  deleteMode = false,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  deleteMode?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-title"
      className="fixed inset-0 z-50 grid place-items-center bg-stone-950/40 p-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-stone-50 p-6 shadow-xl">
        <h2 id="disconnect-title" className="text-lg font-black">
          {deleteMode ? "Delete imported game data?" : "Disconnect game data?"}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {deleteMode
            ? "Imported games, findings, and derived insights will be removed. Your local training history is not removed."
            : "Your connection will stop syncing. Imported data remains available until you choose delete."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-xl bg-red-700 px-4 py-2 text-sm font-black text-white"
            onClick={onConfirm}
          >
            {deleteMode ? "Disconnect and delete" : "Disconnect"}
          </button>
        </div>
      </div>
    </div>
  );
}
