import Link from "next/link";
import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";

export function OpeningHeroCard({ model }: { model: MasteryMapReadModel }) {
  const mastery = model.nodes.length
    ? Math.round((model.masteredPositions / model.nodes.length) * 100)
    : null;
  return (
    <header className="rounded-[1.75rem] bg-stone-900 p-6 text-stone-50 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
        Unlocked repertoire opening
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{model.openingName}</h1>
          <p className="mt-1 text-sm text-stone-300">
            {model.side} · Active access
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-green-300">
            {mastery === null ? "—" : `${mastery}%`}
          </p>
          <p className="text-xs text-stone-300">mastery</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/train?openingId=${encodeURIComponent(model.openingId)}`}
          className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white"
        >
          Train opening
        </Link>
        <Link
          href="/daily"
          className="rounded-2xl border border-stone-600 px-4 py-3 text-sm font-black"
        >
          Practice today&apos;s weaknesses
        </Link>
      </div>
    </header>
  );
}
