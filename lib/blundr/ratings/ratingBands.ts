import type { RatingBandId } from "../accounts/accountTypes";
import type { MaiaSkillLevel } from "../maia/maiaTypes";

export type Stage2RatingBandId =
  | "new"
  | "beginner"
  | "improver"
  | "club"
  | "strong"
  | "advanced"
  | "expert"
  | "all"
  | "account-new-to-openings"
  | "account-u800"
  | "account-800-1200"
  | "account-1600-2000"
  | "account-2000-plus";

export type Stage2RatingBand = {
  id: Stage2RatingBandId;
  label: string;
  value: string;
  target: string;
  minRating: number | null;
  maxRating: number | null;
  engineSkill: number;
  skill: number;
  maiaSkill: MaiaSkillLevel;
  maiaRating: number;
  profileIds: readonly string[];
  description: string;
};

export const DEFAULT_STAGE2_RATING_BAND_ID: Stage2RatingBandId = "club";

export const STAGE2_RATING_BANDS: readonly Stage2RatingBand[] = [
  {
    id: "new",
    label: "New",
    value: "1000",
    target: "<1000",
    minRating: null,
    maxRating: 999,
    engineSkill: 800,
    skill: 800,
    maiaSkill: "maia-1100",
    maiaRating: 1100,
    profileIds: ["beginner_rapid_classical_1000_1400"],
    description:
      "Entry-level human frequency band. Uses the local package and prefers lower-rated human patterns when rating metadata exists.",
  },
  {
    id: "beginner",
    label: "Beginner",
    value: "1000,1200",
    target: "1000–1200",
    minRating: 1000,
    maxRating: 1200,
    engineSkill: 1100,
    skill: 1100,
    maiaSkill: "maia-1100",
    maiaRating: 1100,
    profileIds: ["beginner_rapid_classical_1000_1400"],
    description: "Beginner human frequency band.",
  },
  {
    id: "improver",
    label: "Improver",
    value: "1000,1200,1400",
    target: "1000–1400",
    minRating: 1000,
    maxRating: 1400,
    engineSkill: 1300,
    skill: 1300,
    maiaSkill: "maia-1300",
    maiaRating: 1300,
    profileIds: ["beginner_rapid_classical_1000_1400"],
    description: "Improver human frequency band.",
  },
  {
    id: "club",
    label: "Club",
    value: "1200,1400,1600",
    target: "1200–1600",
    minRating: 1200,
    maxRating: 1600,
    engineSkill: 1500,
    skill: 1500,
    maiaSkill: "maia-1500",
    maiaRating: 1500,
    profileIds: [
      "all_blitz_rapid_classical_1200_plus",
      "beginner_rapid_classical_1000_1400",
      "intermediate_blitz_rapid_classical_1600_2000",
    ],
    description: "Default club training band.",
  },
  {
    id: "strong",
    label: "Strong",
    value: "1600,1800",
    target: "1600–1800",
    minRating: 1600,
    maxRating: 1800,
    engineSkill: 1700,
    skill: 1700,
    maiaSkill: "maia-1700",
    maiaRating: 1700,
    profileIds: ["intermediate_blitz_rapid_classical_1600_2000"],
    description: "Strong club human frequency band.",
  },
  {
    id: "advanced",
    label: "Advanced",
    value: "1800,2000,2200",
    target: "1800–2200",
    minRating: 1800,
    maxRating: 2200,
    engineSkill: 2000,
    skill: 2000,
    maiaSkill: "maia-1900",
    maiaRating: 1900,
    profileIds: [
      "intermediate_blitz_rapid_classical_1600_2000",
      "advanced_rapid_classical_2000_plus",
    ],
    description: "Advanced human frequency band.",
  },
  {
    id: "expert",
    label: "Expert+",
    value: "2200,2500",
    target: "2200+",
    minRating: 2200,
    maxRating: null,
    engineSkill: 2300,
    skill: 2300,
    maiaSkill: "maia-1900",
    maiaRating: 1900,
    profileIds: ["advanced_rapid_classical_2000_plus", "masters_1952_3000"],
    description: "Expert and master human frequency band.",
  },
  {
    id: "all",
    label: "All",
    value: "1000,1200,1400,1600,1800,2000,2200,2500",
    target: "All",
    minRating: null,
    maxRating: null,
    engineSkill: 1600,
    skill: 1600,
    maiaSkill: "maia-1500",
    maiaRating: 1500,
    profileIds: [
      "all_blitz_rapid_classical_1200_plus",
      "beginner_rapid_classical_1000_1400",
      "intermediate_blitz_rapid_classical_1600_2000",
      "advanced_rapid_classical_2000_plus",
      "masters_1952_3000",
    ],
    description: "All local rating profiles.",
  },
  {
    id: "account-new-to-openings",
    label: "New to openings",
    value: "account-new-to-openings",
    target: "New to openings",
    minRating: null,
    maxRating: 999,
    engineSkill: 800,
    skill: 800,
    maiaSkill: "maia-1100",
    maiaRating: 1100,
    profileIds: ["beginner_rapid_classical_1000_1400"],
    description: "Account-authoritative entry-level training band.",
  },
  {
    id: "account-u800",
    label: "Under 800",
    value: "account-u800",
    target: "Under 800",
    minRating: null,
    maxRating: 799,
    engineSkill: 800,
    skill: 800,
    maiaSkill: "maia-1100",
    maiaRating: 1100,
    profileIds: ["beginner_rapid_classical_1000_1400"],
    description: "Account-authoritative under-800 training band.",
  },
  {
    id: "account-800-1200",
    label: "800-1200",
    value: "account-800-1200",
    target: "800-1200",
    minRating: 800,
    maxRating: 1200,
    engineSkill: 1000,
    skill: 1000,
    maiaSkill: "maia-1100",
    maiaRating: 1100,
    profileIds: ["beginner_rapid_classical_1000_1400"],
    description: "Account-authoritative 800-1200 training band.",
  },
  {
    id: "account-1600-2000",
    label: "1600-2000",
    value: "account-1600-2000",
    target: "1600-2000",
    minRating: 1600,
    maxRating: 2000,
    engineSkill: 1800,
    skill: 1800,
    maiaSkill: "maia-1800",
    maiaRating: 1800,
    profileIds: ["intermediate_blitz_rapid_classical_1600_2000"],
    description: "Account-authoritative 1600-2000 training band.",
  },
  {
    id: "account-2000-plus",
    label: "2000+",
    value: "account-2000-plus",
    target: "2000+",
    minRating: 2000,
    maxRating: null,
    engineSkill: 2200,
    skill: 2200,
    maiaSkill: "maia-1900",
    maiaRating: 1900,
    profileIds: ["advanced_rapid_classical_2000_plus", "masters_1952_3000"],
    description: "Account-authoritative 2000-plus training band.",
  },
];

export function getStage2RatingBand(value?: string | null): Stage2RatingBand {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return (
    STAGE2_RATING_BANDS.find((band) => band.id === normalized) ??
    STAGE2_RATING_BANDS.find((band) => band.value === normalized) ??
    STAGE2_RATING_BANDS.find(
      (band) => band.id === DEFAULT_STAGE2_RATING_BAND_ID,
    )!
  );
}

export function getStage2RatingBandByFilterValue(
  value?: string | null,
): Stage2RatingBand {
  return getStage2RatingBand(value);
}

const ACCOUNT_RATING_BAND_TO_STAGE2: Readonly<
  Record<RatingBandId, Stage2RatingBandId>
> = {
  new_to_openings: "account-new-to-openings",
  u800: "account-u800",
  "800-1200": "account-800-1200",
  "1200-1600": "club",
  "1600-2000": "account-1600-2000",
  "2000-plus": "account-2000-plus",
};

export function getStage2RatingBandForAccountRatingBand(
  value: RatingBandId | null | undefined,
): Stage2RatingBand {
  return getStage2RatingBand(
    ACCOUNT_RATING_BAND_TO_STAGE2[value ?? "1200-1600"] ?? "club",
  );
}

export function resolveMaiaSkillForRatingBand(
  value?: string | null,
): MaiaSkillLevel {
  return getStage2RatingBand(value).maiaSkill;
}

export function buildStage2RatingAwareSeed(
  seed: string | null | undefined,
  bandId: string | null | undefined,
): string {
  const band = getStage2RatingBand(bandId);
  return `${String(seed ?? "stage2-rating-aware-selection")}:rating-band:${band.id}`;
}

function profileTokens(value: unknown): string[] {
  return String(value ?? "")
    .split(/[|,\s]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function stage2RatingBandMatchesLocalMetadata(input: {
  bandId?: string | null;
  profileId?: string | null;
  profile?: string | null;
  profiles?: string | null;
  averageRating?: number | string | null;
}): boolean {
  const band = getStage2RatingBand(input.bandId);
  if (band.id === "all") return true;

  const tokens = [
    ...profileTokens(input.profileId),
    ...profileTokens(input.profile),
    ...profileTokens(input.profiles),
  ];

  if (tokens.length > 0) {
    return tokens.some((token) => band.profileIds.includes(token));
  }

  const hasAverageRating =
    input.averageRating !== null &&
    input.averageRating !== undefined &&
    String(input.averageRating).trim() !== "";

  const averageRating = hasAverageRating
    ? Number(input.averageRating)
    : Number.NaN;

  if (Number.isFinite(averageRating)) {
    if (band.minRating !== null && averageRating < band.minRating) return false;
    if (band.maxRating !== null && averageRating > band.maxRating) return false;
    return true;
  }

  // Missing local rating metadata must never hide playable local-package lines.
  return true;
}
