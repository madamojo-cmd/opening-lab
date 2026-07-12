"use client";

import { useEffect, useState } from "react";
import { BlundrButton } from "@/components/blundr/ui";

type UnlockConfirmSliderProps = {
  disabled?: boolean;
  busy?: boolean;
  resetKey?: string;
  onConfirm: () => void | Promise<void>;
};

export function UnlockConfirmSlider({ disabled = false, busy = false, resetKey, onConfirm }: UnlockConfirmSliderProps) {
  const [value, setValue] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    setValue(0);
  }, [resetKey]);

  async function handleRelease() {
    if (disabled || busy) return;
    if (value < 96) {
      setValue(0);
      return;
    }
    await onConfirm();
    setValue(0);
  }

  if (reducedMotion) {
    return (
      <BlundrButton fullWidth disabled={disabled || busy} onClick={() => void onConfirm()}>
        {busy ? "Unlocking..." : "Confirm unlock"}
      </BlundrButton>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
        <span>{busy ? "Unlocking..." : value >= 96 ? "Release to confirm" : "Slide to unlock"}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="rounded-full bg-stone-100 p-1 ring-1 ring-stone-200">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          onPointerUp={() => void handleRelease()}
          onTouchEnd={() => void handleRelease()}
          onMouseUp={() => void handleRelease()}
          disabled={disabled || busy}
          aria-label="Slide to unlock"
          className="h-12 w-full appearance-none bg-transparent outline-none accent-[#2e6b4f]"
        />
      </div>
      <p className="text-xs leading-5 text-stone-500">{busy ? "Unlocking..." : "Drag the slider all the way right, then release."}</p>
    </div>
  );
}
