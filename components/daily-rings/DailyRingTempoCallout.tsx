"use client";

import { BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type DailyRingTempoCalloutProps = {
  message?: string;
  className?: string;
};

export function DailyRingTempoCallout({ message = "Close all three rings to keep your streak alive.", className }: DailyRingTempoCalloutProps) {
  return (
    <div className={classNames("rounded-3xl bg-[#fbfcf7] px-4 py-4 ring-1 ring-green-100", className)}>
      <div className="flex items-start gap-3">
        <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.coach} alt="Tempo coach" variant="tempoAvatar" className="shrink-0" />
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Tempo says</div>
          <p className="mt-1 text-sm leading-6 text-stone-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
