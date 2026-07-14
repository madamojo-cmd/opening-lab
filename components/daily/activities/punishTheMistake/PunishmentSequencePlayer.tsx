"use client";
export function PunishmentSequencePlayer({
  onMove,
  disabled = false,
}: {
  onMove?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="Play punishment move"
      disabled={disabled}
      onClick={() => onMove?.()}
      className="min-h-11 rounded-2xl bg-green-700 px-4 py-3 font-black text-white"
    >
      Play response
    </button>
  );
}
