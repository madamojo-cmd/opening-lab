"use client";

import type { DailyGoalPresetId } from "@/lib/blundr/onboarding/onboardingTypes";
import { getAllDailyGoalPresets } from "@/lib/blundr/onboarding/dailyGoalPresets";

type DailyGoalSelectorProps = {
  selectedPresetId: DailyGoalPresetId;
  onSelectPreset: (presetId: DailyGoalPresetId) => void;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function DailyGoalSelector({ selectedPresetId, onSelectPreset }: DailyGoalSelectorProps) {
  const presets = getAllDailyGoalPresets();

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {presets.map((preset) => {
        const active = preset.id === selectedPresetId;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.id)}
            className={classNames(
              "rounded-[1.5rem] border p-4 text-left shadow-sm transition",
              active ? "border-green-300 bg-green-50 ring-2 ring-green-200" : "border-stone-200 bg-white hover:border-green-200",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-black text-stone-950">{preset.label}</div>
              {preset.isDefault ? <span className="rounded-full bg-green-700 px-2 py-1 text-[11px] font-black text-white">Default</span> : null}
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-stone-950">{preset.dailyTempoGoal}</div>
            <div className="mt-1 text-sm text-stone-500">Tempo</div>
            <div className="mt-3 text-sm leading-6 text-stone-600">
              Battery {preset.dailyBatteryGoal} and Daily Blundr {preset.dailyBlundrGoal}
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">{preset.summary}</p>
          </button>
        );
      })}
    </section>
  );
}
