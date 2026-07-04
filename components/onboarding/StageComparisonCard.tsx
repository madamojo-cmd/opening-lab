"use client";

type StageComparisonCardProps = {
  openingStageCopy: string;
  continuationStageCopy: string;
};

export function StageComparisonCard({ openingStageCopy, continuationStageCopy }: StageComparisonCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-[linear-gradient(180deg,_rgba(34,197,94,0.14),_rgba(255,255,255,0.95))] p-4">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Opening Stage</div>
          <p className="mt-2 text-sm leading-6 text-stone-700">{openingStageCopy}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-4">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-700">Continuation Stage</div>
          <p className="mt-2 text-sm leading-6 text-stone-700">{continuationStageCopy}</p>
        </div>
      </div>
    </section>
  );
}

