import {
  getStage2ApprovedContentInventoryEntry,
  getStage2ApprovedContentInventorySummary,
} from "../stage2Coaching/stage2ApprovedContentInventory.generated";
import { resolveStage2CanonicalOpeningId, STAGE2_RUNTIME_OPENING_IDS } from "./openingIdentity";
import { TRAINING_RUNTIME_PACKAGE_ID, TRAINING_RUNTIME_PACKAGE_ROOT } from "../trainingRuntime/trainingRuntimeSchema";
export { STAGE2_RUNTIME_OPENING_IDS } from "./openingIdentity";

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
  publicReady: boolean;
  betaReady: boolean;
  needsBrowserQA: boolean;
  leadingMvpCandidate: boolean;
  reasonHidden: string | null;
  notes: string[];
};

export type OpeningAvailabilitySummary = {
  runtimeDataSource: "local_crawled_package";
  runtimePackageId: string;
  openingCount: number;
  visibleOpeningCount: number;
  publicOpeningCount: number;
  betaOpeningCount: number;
  devOpeningCount: number;
  hiddenOpeningCount: number;
  runtimeAvailableCount: number;
  approvedContentInventoryCount: number;
  approvedContentMatchedCount: number;
  approvedContentAvailableCount: number;
  openingAvailabilityStatus: OpeningQaStatus | "blocked";
  liveLichessCalled: false;
};

export const STAGE2_RUNTIME_PACKAGE_ID = TRAINING_RUNTIME_PACKAGE_ID;
export const STAGE2_RUNTIME_PACKAGE_ROOT = TRAINING_RUNTIME_PACKAGE_ROOT;

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
  "caro-kann-black": { runtimeNodeCount: 101, runtimeCandidateMoveCount: 100 },
  "colle-white": { runtimeNodeCount: 1059, runtimeCandidateMoveCount: 1058 },
  "english-white": { runtimeNodeCount: 75, runtimeCandidateMoveCount: 74 },
  "french-black": { runtimeNodeCount: 130, runtimeCandidateMoveCount: 129 },
  "italian-black": { runtimeNodeCount: 1013, runtimeCandidateMoveCount: 1012 },
  "italian-white": { runtimeNodeCount: 1161, runtimeCandidateMoveCount: 1160 },
  "kings-indian-black": { runtimeNodeCount: 150, runtimeCandidateMoveCount: 149 },
  "london-white": { runtimeNodeCount: 1412, runtimeCandidateMoveCount: 1411 },
  "nimzo-indian-black": { runtimeNodeCount: 227, runtimeCandidateMoveCount: 226 },
  "petroff-black": { runtimeNodeCount: 126, runtimeCandidateMoveCount: 125 },
  "pirc-black": { runtimeNodeCount: 145, runtimeCandidateMoveCount: 144 },
  "qgd-black": { runtimeNodeCount: 156, runtimeCandidateMoveCount: 155 },
  "queens-gambit-white": { runtimeNodeCount: 139, runtimeCandidateMoveCount: 138 },
  "queens-indian-black": { runtimeNodeCount: 200, runtimeCandidateMoveCount: 199 },
  "reti-white": { runtimeNodeCount: 165, runtimeCandidateMoveCount: 164 },
  "ruy-lopez-white": { runtimeNodeCount: 755, runtimeCandidateMoveCount: 754 },
  "scandinavian-black": { runtimeNodeCount: 79, runtimeCandidateMoveCount: 78 },
  "scotch-white": { runtimeNodeCount: 136, runtimeCandidateMoveCount: 135 },
  "sicilian-black": { runtimeNodeCount: 94, runtimeCandidateMoveCount: 93 },
  "slav-black": { runtimeNodeCount: 154, runtimeCandidateMoveCount: 153 },
  "vienna-white": { runtimeNodeCount: 117, runtimeCandidateMoveCount: 116 },
};

export const STAGE2_OPENING_AVAILABILITY_MATRIX: OpeningAvailability[] = STAGE2_RUNTIME_OPENING_IDS.map((openingId) => {
  const label = OPENING_LABELS[openingId];
  const counts = OPENING_RUNTIME_COUNTS[openingId];
  const approvedContentInventoryEntry = getStage2ApprovedContentInventoryEntry(openingId);
  const leadingMvpCandidate = openingId === "italian-white";
  const contentStatus: OpeningContentStatus =
    approvedContentInventoryEntry?.status === "sample"
      ? "sample"
      : approvedContentInventoryEntry?.status === "approved"
        ? "approved"
        : approvedContentInventoryEntry?.status === "fallback_only"
          ? "fallback_only"
          : "fallback_only";
  const stage: OpeningAvailabilityStage = leadingMvpCandidate ? "beta" : "dev";
  const reasonHidden = leadingMvpCandidate ? "beta_selector_only_until_browser_qa" : "dev_selector_only_until_browser_qa";
  return {
    openingId,
    displayName: label.displayName,
    learnerPerspective: label.learnerPerspective,
    runtimeAvailable: true,
    runtimePackageId: STAGE2_RUNTIME_PACKAGE_ID,
    runtimeNodeCount: counts.runtimeNodeCount,
    runtimeCandidateMoveCount: counts.runtimeCandidateMoveCount,
    userVisible: true,
    contentStatus,
    approvedContentAvailable: Boolean(approvedContentInventoryEntry?.approvedContentAvailable),
    stage,
    qaStatus: "smoke_pass",
    publicReady: false,
    betaReady: leadingMvpCandidate,
    needsBrowserQA: true,
    leadingMvpCandidate,
    reasonHidden,
    notes: [
      "runtime_available",
      "approved_content_available",
      "trainer_selector_visible",
      leadingMvpCandidate ? "leading_mvp_candidate" : "not_public_release_ready",
      "browser_qa_pending",
    ],
  };
});

export function getStage2OpeningAvailability(openingId: string): OpeningAvailability | null {
  const canonicalOpeningId = resolveStage2CanonicalOpeningId(openingId);
  if (!canonicalOpeningId) return null;
  return STAGE2_OPENING_AVAILABILITY_MATRIX.find((entry) => entry.openingId === canonicalOpeningId) ?? null;
}

export function getStage2OpeningAvailabilitySummary(): OpeningAvailabilitySummary {
  const approvedContentInventorySummary = getStage2ApprovedContentInventorySummary();
  const runtimeAvailableCount = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.runtimeAvailable).length;
  const approvedContentAvailableCount = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.approvedContentAvailable).length;
  const publicOpeningCount = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.publicReady).length;
  const betaOpeningCount = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.betaReady).length;
  const devOpeningCount = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.stage === "dev").length;
  const hiddenOpeningCount = STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.stage === "hidden").length;
  return {
    runtimeDataSource: "local_crawled_package",
    runtimePackageId: STAGE2_RUNTIME_PACKAGE_ID,
    openingCount: approvedContentInventorySummary.approvedContentInventoryCount,
    visibleOpeningCount: STAGE2_OPENING_AVAILABILITY_MATRIX.filter((entry) => entry.userVisible).length,
    publicOpeningCount,
    betaOpeningCount,
    devOpeningCount,
    hiddenOpeningCount,
    runtimeAvailableCount,
    approvedContentInventoryCount: approvedContentInventorySummary.approvedContentInventoryCount,
    approvedContentMatchedCount: approvedContentInventorySummary.approvedContentMatchedCount,
    approvedContentAvailableCount,
    openingAvailabilityStatus: "smoke_pass",
    liveLichessCalled: false,
  };
}
