export function KnightRouteProgress({
  moves,
  total,
}: {
  moves: number;
  total: number;
}) {
  return (
    <p
      role="status"
      className="mt-3 rounded-[1.25rem] border border-stone-200 bg-stone-50/90 px-3 py-3 text-sm font-bold text-stone-700 shadow-[0_12px_28px_rgba(20,17,12,0.06)]"
    >
      <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
        Targets
      </span>
      <span className="mt-1 block text-stone-900">
        Targets: {moves} / {total}
      </span>
    </p>
  );
}
