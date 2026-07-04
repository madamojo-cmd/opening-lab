"use client";

import type { RatingBandId } from "@/lib/blundr/accounts/accountTypes";
import { getAllRatingBands, getRatingBandTrainingDescription } from "@/lib/blundr/onboarding/ratingBand";

type EloBandSelectorProps = {
  selectedBandId: RatingBandId;
  onSelectBand: (bandId: RatingBandId) => void;
  onUnsure: () => void;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function EloBandSelector({ selectedBandId, onSelectBand, onUnsure }: EloBandSelectorProps) {
  const bands = getAllRatingBands();

  return (
    <section className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {bands.map((band) => {
          const active = band.id === selectedBandId;
          return (
            <button
              key={band.id}
              type="button"
              onClick={() => onSelectBand(band.id)}
              className={classNames(
                "rounded-[1.5rem] border p-4 text-left shadow-sm transition",
                active ? "border-green-300 bg-green-50 ring-2 ring-green-200" : "border-stone-200 bg-white hover:border-green-200",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-black text-stone-950">{band.label}</div>
                {band.isDefault ? <span className="rounded-full bg-green-700 px-2 py-1 text-[11px] font-black text-white">Default</span> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">{getRatingBandTrainingDescription(band.id)}</p>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onUnsure}
        className={classNames(
          "w-full rounded-[1.5rem] border px-4 py-3 text-left text-sm font-black shadow-sm",
          selectedBandId === "1200-1600" ? "border-green-300 bg-green-50 text-stone-950" : "border-stone-200 bg-white text-stone-700",
        )}
      >
        I am not sure
        <div className="mt-1 text-sm font-normal leading-6 text-stone-500">Use the default 1200-1600 setup.</div>
      </button>
    </section>
  );
}

