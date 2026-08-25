import type { RatingBandId, UserTrainingProfile } from "./accountTypes";

const RATING_BANDS = new Set<RatingBandId>([
  "new_to_openings",
  "u800",
  "800-1200",
  "1200-1600",
  "1600-2000",
  "2000-plus",
]);

export type TrainingPreferencesPatch = Partial<
  Pick<
    UserTrainingProfile,
    | "ratingBandId"
    | "preferredTrainingMode"
    | "dailyTempoGoal"
    | "dailyBatteryGoal"
    | "dailyBlundrGoal"
    | "dailyBlundrCardGoal"
    | "timeZone"
  >
>;

export type TrainingPreferencesValidation =
  | { ok: true; patch: TrainingPreferencesPatch }
  | { ok: false; code: string; message: string };

function hasOwn(input: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function validGoal(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 100;
}

function validCardGoal(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 99;
}

export function normalizeIanaTimeZone(value: unknown): string | null {
  const timeZone = String(value ?? "").trim();
  if (!timeZone || timeZone.length > 80) return null;
  if (
    timeZone !== "UTC" &&
    !/^[A-Za-z][A-Za-z0-9_+.-]*(\/[A-Za-z0-9_+.-]+)+$/.test(timeZone)
  )
    return null;
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone }).resolvedOptions()
      .timeZone;
  } catch {
    return null;
  }
}

export function validateTrainingPreferencesPatch(
  value: unknown,
): TrainingPreferencesValidation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      ok: false,
      code: "invalid_training_preferences",
      message: "Training preferences must be an object.",
    };
  const input = value as Record<string, unknown>;
  const allowed = new Set([
    "ratingBandId",
    "preferredTrainingMode",
    "dailyTempoGoal",
    "dailyBatteryGoal",
    "dailyBlundrGoal",
    "dailyBlundrCardGoal",
    "timeZone",
  ]);
  if (Object.keys(input).some((key) => !allowed.has(key)))
    return {
      ok: false,
      code: "unsupported_training_preference",
      message: "That training preference cannot be changed here.",
    };

  const patch: TrainingPreferencesPatch = {};
  if (hasOwn(input, "ratingBandId")) {
    if (!RATING_BANDS.has(input.ratingBandId as RatingBandId))
      return {
        ok: false,
        code: "invalid_rating_band",
        message: "Choose one of the supported rating bands.",
      };
    patch.ratingBandId = input.ratingBandId as RatingBandId;
  }
  if (hasOwn(input, "preferredTrainingMode")) {
    if (
      input.preferredTrainingMode !== "assisted" &&
      input.preferredTrainingMode !== "plain"
    )
      return {
        ok: false,
        code: "invalid_training_mode",
        message: "Choose Assisted or Plain training.",
      };
    patch.preferredTrainingMode = input.preferredTrainingMode;
  }
  for (const key of [
    "dailyTempoGoal",
    "dailyBatteryGoal",
    "dailyBlundrGoal",
  ] as const) {
    if (!hasOwn(input, key)) continue;
    if (!validGoal(input[key]))
      return {
        ok: false,
        code: "invalid_daily_goal",
        message: "Daily goals must be whole numbers from 1 to 100.",
      };
    patch[key] = Number(input[key]);
  }
  if (hasOwn(input, "dailyBlundrCardGoal")) {
    if (!validCardGoal(input.dailyBlundrCardGoal))
      return {
        ok: false,
        code: "invalid_daily_card_goal",
        message: "Daily card goals must be whole numbers from 1 to 99.",
      };
    patch.dailyBlundrCardGoal = Number(input.dailyBlundrCardGoal);
  }
  if (hasOwn(input, "timeZone")) {
    const timeZone = normalizeIanaTimeZone(input.timeZone);
    if (!timeZone)
      return {
        ok: false,
        code: "invalid_time_zone",
        message: "A valid IANA timezone is required.",
      };
    patch.timeZone = timeZone;
  }
  if (!Object.keys(patch).length)
    return {
      ok: false,
      code: "empty_training_preferences",
      message: "Choose a training preference to update.",
    };
  return { ok: true, patch };
}
