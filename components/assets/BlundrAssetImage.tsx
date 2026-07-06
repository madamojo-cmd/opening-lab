"use client";

import { useEffect, useState } from "react";
import { BLUNDR_ASSET_IMAGE_VARIANT_FRAME_CLASSES, type BlundrAssetImageVariant } from "./blundrAssetVariants";

type BlundrAssetImageProps = {
  asset: string;
  alt: string;
  variant: BlundrAssetImageVariant;
  className?: string;
  fallbackAsset?: string;
  fallbackLabel?: string;
  priority?: boolean;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

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

  const frameClassName = BLUNDR_ASSET_IMAGE_VARIANT_FRAME_CLASSES[variant];
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

export type { BlundrAssetImageVariant };
