"use client";

import { useEffect, useState } from "react";

type BlundrAssetVariant =
  | "tempoAvatar"
  | "tempoInline"
  | "tempoCard"
  | "tempoHero"
  | "rewardIcon"
  | "rewardCard"
  | "rewardHero"
  | "rewardAnimation"
  | "onboardingIllustration"
  | "starterPackArt"
  | "emptyState"
  | "brandWordmark"
  | "appIcon";

type BlundrAssetImageProps = {
  asset: string;
  alt: string;
  variant: BlundrAssetVariant;
  className?: string;
  fallbackAsset?: string;
  fallbackLabel?: string;
  priority?: boolean;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const VARIANT_FRAME_CLASSES: Record<BlundrAssetVariant, string> = {
  tempoAvatar: "h-[clamp(2.75rem,6vw,4rem)] w-[clamp(2.75rem,6vw,4rem)] rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),rgba(251,252,247,1)_72%)] p-1.5 ring-1 ring-green-200",
  tempoInline: "h-[clamp(4rem,8vw,5.25rem)] w-[clamp(4rem,8vw,5.25rem)] rounded-[1.5rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  tempoCard: "w-full max-w-[clamp(8rem,26vw,11rem)] aspect-[4/5] rounded-[1.75rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  tempoHero: "w-full max-w-[clamp(11rem,34vw,16rem)] aspect-[4/5] rounded-[2rem] bg-[#fbfcf7] p-3 ring-1 ring-stone-200",
  rewardIcon: "h-[clamp(2.5rem,5vw,3.5rem)] w-[clamp(2.5rem,5vw,3.5rem)] rounded-[1.1rem] bg-[#fbfcf7] p-1.5 ring-1 ring-stone-200",
  rewardCard: "w-full max-w-[clamp(7rem,24vw,10rem)] aspect-square rounded-[1.75rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  rewardHero: "w-full max-w-[clamp(10rem,32vw,15rem)] aspect-square rounded-[2rem] bg-[#fbfcf7] p-3 ring-1 ring-stone-200",
  rewardAnimation: "w-full max-w-[clamp(16rem,82vw,28rem)] aspect-[16/11] rounded-[2rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  onboardingIllustration: "w-full max-w-[clamp(14rem,36vw,18rem)] aspect-[4/3] rounded-[2rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  starterPackArt: "w-full max-w-[clamp(7rem,22vw,10rem)] aspect-square rounded-[1.5rem] bg-[#fbfcf7] p-2 ring-1 ring-stone-200",
  emptyState: "w-full max-w-[clamp(11rem,34vw,16rem)] aspect-[4/3] rounded-[2rem] bg-[#fbfcf7] p-3 ring-1 ring-stone-200",
  brandWordmark: "w-full max-w-[clamp(8rem,28vw,14rem)] rounded-none bg-transparent p-0",
  appIcon: "h-[clamp(2.75rem,6vw,4rem)] w-[clamp(2.75rem,6vw,4rem)] rounded-[1.25rem] bg-[#fbfcf7] p-1.5 ring-1 ring-stone-200",
};

function deriveFallbackLabel(alt: string, fallbackLabel?: string): string {
  const text = String(fallbackLabel ?? alt ?? "").trim();
  if (text) return text;
  return "Tempo";
}

export function BlundrAssetImage({
  asset,
  alt,
  variant,
  className,
  fallbackAsset,
  fallbackLabel,
  priority = false,
}: BlundrAssetImageProps) {
  const [source, setSource] = useState(asset);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    setSource(asset);
    setShowPlaceholder(false);
  }, [asset, fallbackAsset]);

  const frameClassName = VARIANT_FRAME_CLASSES[variant];
  const label = deriveFallbackLabel(alt, fallbackLabel);

  function handleError() {
    if (fallbackAsset && source !== fallbackAsset) {
      setSource(fallbackAsset);
      return;
    }
    setShowPlaceholder(true);
  }

  if (showPlaceholder || !source) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={classNames(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden text-center",
          frameClassName,
          className,
        )}
      >
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] bg-[linear-gradient(135deg,rgba(250,250,247,1),rgba(236,252,245,0.88))] text-[0.68rem] font-black uppercase tracking-[0.24em] text-green-700">
          <span className="max-w-full px-2">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames("relative inline-flex shrink-0 items-center justify-center overflow-hidden", frameClassName, className)}>
      <img
        src={source}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={handleError}
        className={classNames(
          "h-full w-full rounded-[inherit] object-contain object-center",
          variant === "brandWordmark" ? "h-auto w-full object-contain" : "",
        )}
      />
    </div>
  );
}

export type { BlundrAssetVariant };
