"use client";
export function ContinuationBoardControls({
  onMove,
  disabled = false,
}: {
  onMove?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label="Make continuation move"
      onClick={() => onMove?.()}
      className="min-h-11 rounded-2xl bg-green-700 px-4 py-3 font-black text-white"
    >
      Make move
    </button>
  );
}
