export function DeepTacticSequence({ moves }: { moves: readonly string[] }) {
  return (
    <p
      role="status"
      className="rounded-[1.25rem] border border-stone-200 bg-white/92 px-3 py-3 text-sm font-bold text-stone-700 shadow-[0_12px_28px_rgba(20,17,12,0.06)]"
    >
      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
        Route progress
      </span>
      <span className="mt-1 block text-stone-900">
        Sequence in progress: {moves.length} committed moves
      </span>
    </p>
  );
}
