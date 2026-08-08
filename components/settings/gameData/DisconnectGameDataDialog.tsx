"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    cancelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [onCancel, open]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disconnect-title"
      className="fixed inset-0 z-50 grid place-items-center bg-stone-950/40 p-4"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-3xl bg-stone-50 p-6 shadow-xl"
      >
        <h2 id="disconnect-title" className="text-lg font-black">
          {deleteMode ? "Delete imported game data?" : "Disconnect game data?"}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {deleteMode
            ? "Imported games, findings, and derived insights will be removed. Your local training history is not removed."
            : "Your connection will stop syncing. Imported data remains available until you choose delete."}
        </p>
        <Link
          href="/privacy"
          className="mt-3 inline-flex text-sm font-bold text-green-700 underline underline-offset-4"
        >
          Review data and deletion details
        </Link>
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
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
