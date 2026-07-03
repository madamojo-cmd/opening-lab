type DailyStateDebugPanelProps = {
  dailyState: unknown;
};

export function DailyStateDebugPanel({ dailyState }: DailyStateDebugPanelProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Daily state</div>
      <h2 className="mt-2 text-lg font-black text-stone-950">Local Daily BLUNDR snapshot</h2>
      <pre className="mt-3 overflow-auto rounded-2xl bg-stone-50 p-3 text-xs leading-5 text-stone-700">{JSON.stringify(dailyState, null, 2)}</pre>
    </section>
  );
}
