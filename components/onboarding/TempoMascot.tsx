"use client";

import { BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";

type TempoMascotProps = {
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function TempoMascot({ className }: TempoMascotProps) {
  return (
    <div
      className={classNames(
        "relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.22),_rgba(247,247,244,1)_70%)] ring-1 ring-green-200 shadow-sm",
        className,
      )}
      aria-hidden="true"
    >
      <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.avatar} alt="Tempo" variant="tempoAvatar" className="!h-12 !w-12 !rounded-[1.1rem] !p-0.5" />
    </div>
  );
}
