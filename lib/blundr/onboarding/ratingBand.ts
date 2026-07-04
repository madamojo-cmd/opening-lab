import type { RatingBandId } from "../accounts/accountTypes";

export type BlundrOnboardingRatingBand = {
  id: RatingBandId;
  label: string;
  shortLabel: string;
  trainingDescription: string;
  recommendedFor: string[];
  sortOrder: number;
  isDefault?: boolean;
};

const DEFAULT_RATING_BAND_ID: RatingBandId = "1200-1600";

const RATING_BAND_ALIASES: Record<string, RatingBandId> = {
  new: "new_to_openings",
  "new to openings": "new_to_openings",
  "new_to_openings": "new_to_openings",
  u800: "u800",
  "under 800": "u800",
  "800-1200": "800-1200",
  "1200-1600": "1200-1600",
  "1600-2000": "1600-2000",
  "2000+": "2000-plus",
  "2000-plus": "2000-plus",
  "i'm not sure": DEFAULT_RATING_BAND_ID,
  "im not sure": DEFAULT_RATING_BAND_ID,
  "not sure": DEFAULT_RATING_BAND_ID,
};

const RATING_BANDS: readonly BlundrOnboardingRatingBand[] = [
  {
    id: "new_to_openings",
    label: "New to openings",
    shortLabel: "New",
    trainingDescription: "You are learning openings for the first time.",
    recommendedFor: ["Players who want the simplest possible start."],
    sortOrder: 0,
  },
  {
    id: "u800",
    label: "Under 800",
    shortLabel: "U800",
    trainingDescription: "Very beginner tactical and opening awareness.",
    recommendedFor: ["Players who still want very simple early move patterns."],
    sortOrder: 1,
  },
  {
    id: "800-1200",
    label: "800-1200",
    shortLabel: "800-1200",
    trainingDescription: "Common beginner and intermediate replies.",
    recommendedFor: ["Players who know basic opening ideas and want repetition."],
    sortOrder: 2,
  },
  {
    id: "1200-1600",
    label: "1200-1600",
    shortLabel: "1200-1600",
    trainingDescription: "Balanced default if you are unsure.",
    recommendedFor: ["Players who want the default Blundr opening experience."],
    sortOrder: 3,
    isDefault: true,
  },
  {
    id: "1600-2000",
    label: "1600-2000",
    shortLabel: "1600-2000",
    trainingDescription: "Stronger principled replies.",
    recommendedFor: ["Players who want sharper opening accuracy."],
    sortOrder: 4,
  },
  {
    id: "2000-plus",
    label: "2000+",
    shortLabel: "2000+",
    trainingDescription: "High-level opening precision.",
    recommendedFor: ["Players who want the most precise opening study."],
    sortOrder: 5,
  },
] as const;

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ");
}

function getBandByIdInternal(id: RatingBandId): BlundrOnboardingRatingBand {
  return RATING_BANDS.find((band) => band.id === id) ?? RATING_BANDS.find((band) => band.isDefault) ?? RATING_BANDS[0];
}

export function getAllRatingBands(): readonly BlundrOnboardingRatingBand[] {
  return RATING_BANDS.slice();
}

export function getRatingBandById(id: RatingBandId | null | undefined): BlundrOnboardingRatingBand | null {
  const band = RATING_BANDS.find((entry) => entry.id === id);
  return band ?? null;
}

export function getDefaultRatingBand(): BlundrOnboardingRatingBand {
  return getBandByIdInternal(DEFAULT_RATING_BAND_ID);
}

export function normalizeRatingBandInput(input: unknown): RatingBandId {
  const normalized = normalizeText(input);
  if (!normalized) return DEFAULT_RATING_BAND_ID;
  if (normalized in RATING_BAND_ALIASES) return RATING_BAND_ALIASES[normalized];
  const direct = RATING_BANDS.find((band) => normalizeText(band.id) === normalized || normalizeText(band.label) === normalized || normalizeText(band.shortLabel) === normalized);
  return direct?.id ?? DEFAULT_RATING_BAND_ID;
}

export function getRatingBandLabel(id: RatingBandId | null | undefined): string {
  return getBandByIdInternal(normalizeRatingBandInput(id)).label;
}

export function getRatingBandTrainingDescription(id: RatingBandId | null | undefined): string {
  return getBandByIdInternal(normalizeRatingBandInput(id)).trainingDescription;
}

