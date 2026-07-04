"use client";

import type { StarterPackId } from "@/lib/blundr/accounts/accountTypes";
import { getAllStarterPacks } from "@/lib/blundr/onboarding/starterPacks";
import { Layers3 } from "lucide-react";

type StarterPackSelectorProps = {
  selectedStarterPackId: StarterPackId;
  onSelectStarterPack: (starterPackId: StarterPackId) => void;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function StarterPackSelector({ selectedStarterPackId, onSelectStarterPack }: StarterPackSelectorProps) {
  const starterPacks = getAllStarterPacks();

  return (
    <section className="grid gap-3">
      {starterPacks.map((pack) => {
        const active = pack.id === selectedStarterPackId;
        return (
          <button
            key={pack.id}
            type="button"
            onClick={() => onSelectStarterPack(pack.id)}
            className={classNames(
              "rounded-[1.75rem] border p-4 text-left shadow-sm transition",
              active ? "border-green-300 bg-green-50 ring-2 ring-green-200" : "border-stone-200 bg-white hover:border-green-200",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                  <Layers3 size={14} />
                  {pack.shortName}
                </div>
                <div className="mt-2 text-lg font-black text-stone-950">{pack.displayName}</div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{pack.styleSummary}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{pack.promise}</p>
              </div>
              <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{active ? "Selected" : "Pick"}</div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(236,246,226,0.8))] p-3">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">White</div>
                <div className="mt-1 text-sm font-black text-stone-950">{pack.whiteOpeningName}</div>
              </div>
              <div className="rounded-2xl bg-stone-50 p-3">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-700">Black</div>
                <div className="mt-1 text-sm font-black text-stone-950">{pack.blackOpeningName}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {pack.styleTags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-black text-stone-600 ring-1 ring-stone-200">
                  {tag}
                </span>
              ))}
            </div>
            {pack.relatedOpeningIds && pack.relatedOpeningIds.length > 0 ? (
              <div className="mt-3 text-xs font-semibold text-stone-500">
                Related white opening: <span className="font-black text-stone-700">{pack.relatedOpeningIds.join(", ")}</span>
              </div>
            ) : null}
          </button>
        );
      })}
    </section>
  );
}

