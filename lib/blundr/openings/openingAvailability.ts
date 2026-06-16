export type OpeningContentStatus = "none" | "fallback_only" | "sample" | "approved_partial" | "approved";
export type OpeningAvailabilityStage = "hidden" | "dev" | "beta" | "public";
export type OpeningQaStatus = "untested" | "smoke_pass" | "browser_pass" | "blocked";

export type OpeningAvailability = {
  openingId: string;
  displayName: string;
  learnerPerspective: "white" | "black";
  runtimeAvailable: boolean;
  runtimePackageId: string;
  runtimeNodeCount: number;
  runtimeCandidateMoveCount: number;
  userVisible: boolean;
  contentStatus: OpeningContentStatus;
  approvedContentAvailable: boolean;
  stage: OpeningAvailabilityStage;
  qaStatus: OpeningQaStatus;
  reasonHidden?: string;
};

export type OpeningAvailabilitySummary = {
  runtimeDataSource: "local_crawled_package";
  runtimePackageId: string;
  openingCount: number;
  visibleOpeningCount: number;
  runtimeAvailableCount: number;
  approvedContentAvailableCount: number;
  openingAvailabilityStatus: OpeningQaStatus | "blocked";
  liveLichessCalled: false;
};

export const STAGE2_RUNTIME_PACKAGE_ID = "stage2-21-opening-stepdown-runtime-v1" as const;
export const STAGE2_RUNTIME_PACKAGE_ROOT = `data/blundr/${STAGE2_RUNTIME_PACKAGE_ID}` as const;

export const STAGE2_RUNTIME_OPENING_IDS = [
  "caro-kann-black",
  "colle-white",
  "english-white",
  "french-black",
  "italian-black",
  "italian-white",
  "kings-indian-black",
  "london-white",
  "nimzo-indian-black",
  "petroff-black",
  "pirc-black",
  "qgd-black",
  "queens-gambit-white",
  "queens-indian-black",
  "reti-white",
  "ruy-lopez-white",
  "scandinavian-black",
  "scotch-white",
  "sicilian-black",
  "slav-black",
  "vienna-white",
] as const;

const OPENING_LABELS: Record<string, { displayName: string; learnerPerspective: "white" | "black" }> = {
  "caro-kann-black": { displayName: "Caro-Kann Defense", learnerPerspective: "black" },
  "colle-white": { displayName: "Colle System", learnerPerspective: "white" },
  "english-white": { displayName: "English Opening", learnerPerspective: "white" },
  "french-black": { displayName: "French Defense", learnerPerspective: "black" },
  "italian-black": { displayName: "Italian Game as Black", learnerPerspective: "black" },
  "italian-white": { displayName: "Italian Game", learnerPerspective: "white" },
  "kings-indian-black": { displayName: "King's Indian Defense", learnerPerspective: "black" },
  "london-white": { displayName: "London System", learnerPerspective: "white" },
  "nimzo-indian-black": { displayName: "Nimzo-Indian Defense", learnerPerspective: "black" },
  "petroff-black": { displayName: "Petroff Defense", learnerPerspective: "black" },
  "pirc-black": { displayName: "Pirc Defense", learnerPerspective: "black" },
  "qgd-black": { displayName: "Queen's Gambit Declined", learnerPerspective: "black" },
  "queens-gambit-white": { displayName: "Queen's Gambit", learnerPerspective: "white" },
  "queens-indian-black": { displayName: "Queen's Indian Defense", learnerPerspective: "black" },
  "reti-white": { displayName: "Réti Opening", learnerPerspective: "white" },
  "ruy-lopez-white": { displayName: "Ruy Lopez", learnerPerspective: "white" },
  "scandinavian-black": { displayName: "Scandinavian Defense", learnerPerspective: "black" },
  "scotch-white": { displayName: "Scotch Game", learnerPerspective: "white" },
  "sicilian-black": { displayName: "Sicilian Defense", learnerPerspective: "black" },
  "slav-black": { displayName: "Slav Defense", learnerPerspective: "black" },
  "vienna-white": { displayName: "Vienna Game", learnerPerspective: "white" },
};

const OPENING_RUNTIME_COUNTS: Record<string, { runtimeNodeCount: number; runtimeCandidateMoveCount: number }> = {
  "caro-kann-black": { runtimeNodeCount: 613, runtimeCandidateMoveCount: 1493 },
  "colle-white": { runtimeNodeCount: 11083, runtimeCandidateMoveCount: 26899 },
  "english-white": { runtimeNodeCount: 10324, runtimeCandidateMoveCount: 23154 },
  "french-black": { runtimeNodeCount: 577, runtimeCandidateMoveCount: 1326 },
  "italian-black": { runtimeNodeCount: 322, runtimeCandidateMoveCount: 874 },
  "italian-white": { runtimeNodeCount: 322, runtimeCandidateMoveCount: 874 },
  "kings-indian-black": { runtimeNodeCount: 175, runtimeCandidateMoveCount: 421 },
  "london-white": { runtimeNodeCount: 11083, runtimeCandidateMoveCount: 26899 },
  "nimzo-indian-black": { runtimeNodeCount: 116, runtimeCandidateMoveCount: 300 },
  "petroff-black": { runtimeNodeCount: 668, runtimeCandidateMoveCount: 1740 },
  "pirc-black": { runtimeNodeCount: 326, runtimeCandidateMoveCount: 757 },
  "qgd-black": { runtimeNodeCount: 441, runtimeCandidateMoveCount: 1027 },
  "queens-gambit-white": { runtimeNodeCount: 2532, runtimeCandidateMoveCount: 5996 },
  "queens-indian-black": { runtimeNodeCount: 90, runtimeCandidateMoveCount: 180 },
  "reti-white": { runtimeNodeCount: 1676, runtimeCandidateMoveCount: 3420 },
  "ruy-lopez-white": { runtimeNodeCount: 315, runtimeCandidateMoveCount: 739 },
  "scandinavian-black": { runtimeNodeCount: 2959, runtimeCandidateMoveCount: 6693 },
  "scotch-white": { runtimeNodeCount: 101, runtimeCandidateMoveCount: 248 },
  "sicilian-black": { runtimeNodeCount: 3282, runtimeCandidateMoveCount: 7972 },
  "slav-black": { runtimeNodeCount: 679, runtimeCandidateMoveCount: 1705 },
  "vienna-white": { runtimeNodeCount: 1548, runtimeCandidateMoveCount: 3791 },
};

export const STAGE2_OPENING_AVAILABILITY_MATRIX: OpeningAvailability[] = STAGE2_RUNTIME_OPENING_IDS.map((openingId) => {
  const label = OPENING_LABELS[openingId];
  const counts = OPENING_RUNTIME_COUNTS[openingId];
  return {
    openingId,
    displayName: label.displayName,
    learnerPerspective: label.learnerPerspective,
    runtimeAvailable: true,
    runtimePackageId: STAGE2_RUNTIME_PACKAGE_ID,
    runtimeNodeCount: counts.runtimeNodeCount,
    runtimeCandidateMoveCount: counts.runtimeCandidateMoveCount,
    userVisible: true,
    contentStatus: "fallback_only",
    approvedContentAvailable: false,
    stage: "dev",
    qaStatus: "smoke_pass",
  };
});

export function getStage2OpeningAvailability(openingId: string): OpeningAvailability | null {
  return STAGE2_OPENING_AVAILABILITY_MATRIX.find((entry) => entry.openingId === openingId) ?? null;
}

export function getStage2OpeningAvailabilitySummary(): OpeningAvailabilitySummary {
  const runtimeAvailableCount = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.runtimeAvailable).length;
  const approvedContentAvailableCount = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.approvedContentAvailable).length;
  return {
    runtimeDataSource: "local_crawled_package",
    runtimePackageId: STAGE2_RUNTIME_PACKAGE_ID,
    openingCount: STAGE2_OPENING_AVAILABILITY_MATRIX.length,
    visibleOpeningCount: STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.userVisible).length,
    runtimeAvailableCount,
    approvedContentAvailableCount,
    openingAvailabilityStatus: "smoke_pass",
    liveLichessCalled: false,
  };
}
