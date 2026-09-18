import type { DailyGoalPresetId } from "./onboardingTypes";

export type DailyGoalPreset = {
  id: DailyGoalPresetId;
  label: string;
  summary: string;
  dailyTempoGoal: number;
  dailyBatteryGoal: number;
  dailyBlundrGoal: number;
  dailyBlundrCardGoal: number;
  sortOrder: number;
  isDefault?: boolean;
};

const DAILY_GOAL_PRESETS: readonly DailyGoalPreset[] = [
  {
    id: "light",
    label: "Light",
    summary: "A short, easy daily habit.",
    dailyTempoGoal: 5,
    dailyBatteryGoal: 1,
    dailyBlundrGoal: 1,
    dailyBlundrCardGoal: 10,
    sortOrder: 0,
  },
  {
    id: "standard",
    label: "Standard",
    summary: "The default balanced setup.",
    dailyTempoGoal: 10,
    dailyBatteryGoal: 3,
    dailyBlundrGoal: 1,
    dailyBlundrCardGoal: 10,
    sortOrder: 1,
    isDefault: true,
  },
  {
    id: "serious",
    label: "Serious",
    summary: "A larger daily practice block.",
    dailyTempoGoal: 20,
    dailyBatteryGoal: 5,
    dailyBlundrGoal: 1,
    dailyBlundrCardGoal: 10,
    sortOrder: 2,
  },
] as const;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function getAllDailyGoalPresets(): readonly DailyGoalPreset[] {
  return DAILY_GOAL_PRESETS.slice();
}

export function getDailyGoalPresetById(id: DailyGoalPresetId | null | undefined): DailyGoalPreset | null {
  return DAILY_GOAL_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function getDefaultDailyGoalPreset(): DailyGoalPreset {
  return DAILY_GOAL_PRESETS.find((preset) => preset.isDefault) ?? DAILY_GOAL_PRESETS[1];
}

export function normalizeDailyGoalPreset(input: unknown): DailyGoalPresetId {
  const normalized = normalizeText(input);
  const preset = DAILY_GOAL_PRESETS.find((entry) => entry.id === normalized || entry.label.toLowerCase() === normalized);
  return preset?.id ?? getDefaultDailyGoalPreset().id;
}
