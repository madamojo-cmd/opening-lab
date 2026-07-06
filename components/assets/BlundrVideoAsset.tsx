"use client";

import { useEffect, useState } from "react";
import { BLUNDR_VIDEO_ASSET_VARIANT_FRAME_CLASSES, type BlundrVideoAssetVariant } from "./blundrAssetVariants";

type BlundrVideoAssetProps = {
  src: string;
  fallbackSrc: string;
  ariaLabel: string;
  variant?: BlundrVideoAssetVariant;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function BlundrVideoAsset({ src, fallbackSrc, ariaLabel, variant = "rewardAnimation", className }: BlundrVideoAssetProps) {
  const [videoErrored, setVideoErrored] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(media.matches);
    handleChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const frameClassName = BLUNDR_VIDEO_ASSET_VARIANT_FRAME_CLASSES[variant];
  const showVideo = Boolean(src && !videoErrored && !reducedMotion);

  return (
    <div className={classNames("relative inline-flex shrink-0 items-center justify-center overflow-hidden", frameClassName, className)}>
      {showVideo ? (
        <video
          className="h-full w-full rounded-[inherit] object-contain object-center"
          autoPlay
          muted
          playsInline
          preload="metadata"
          loop={false}
          aria-label={ariaLabel}
          onError={() => setVideoErrored(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <img src={fallbackSrc} alt={ariaLabel} className="h-full w-full rounded-[inherit] object-contain object-center" loading="lazy" decoding="async" />
      )}
    </div>
  );
}

export type { BlundrVideoAssetVariant };
