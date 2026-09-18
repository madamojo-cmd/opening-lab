export function KnightGymnasiumFeedback({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-[1.25rem] border border-stone-200 bg-white/92 p-3 text-sm font-semibold text-stone-700 shadow-[0_12px_28px_rgba(20,17,12,0.06)]"
    >
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
        Verified feedback
      </div>
      <p className="mt-2 leading-6">{message}</p>
    </div>
  );
}
