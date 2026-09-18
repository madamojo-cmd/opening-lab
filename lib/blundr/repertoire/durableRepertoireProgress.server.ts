// server-only: do not import into client components.

import {
  getAccountPersistenceAdapter,
  readTrainingProfile,
} from "@/lib/blundr/accounts/accountRepository";
import type {
  StarterPackId,
  UserRepertoire,
} from "@/lib/blundr/accounts/accountTypes";
import {
  getDefaultStarterPack,
  getStarterPackById,
  getStarterPackOpeningIds,
} from "@/lib/blundr/onboarding/starterPacks";
import {
  buildLockedOpeningIds,
  getEligibleRepertoireOpeningIds,
  normalizeOpeningPool,
} from "./repertoireOpeningPool";
import {
  getNextUnlockCost,
  getUnlockProgressPct,
} from "./repertoireUnlockCurve";
import { createDefaultRepertoireProgress } from "./repertoireUnlockService";
import {
  getRepertoirePointEventTotal,
  getRepertoireUnlockSpendTotal,
  sortRepertoirePointEvents,
  sortRepertoireUnlockEvents,
} from "./repertoireEvents";
import type { RepertoireProgress } from "./repertoireTypes";
import { loadFreeActiveOpeningPolicy } from "@/lib/blundr/commercial/activeOpenings.server";
import {
  readCommercialBillingEnvironment,
  resolveCommercialAccess,
} from "@/lib/blundr/commercial/commercialAccess.server";

type DurableRepertoireProgressInput = {
  userId: string;
  accessToken?: string | null;
  now?: string;
  allOpeningIds?: readonly string[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function maxIso(values: readonly (string | null | undefined)[]): string {
  let latest = "";
  let latestTime = Number.NEGATIVE_INFINITY;
  for (const value of values) {
    const text = normalizeText(value);
    if (!text) continue;
    const time = Date.parse(text);
    if (!Number.isFinite(time)) continue;
    if (time >= latestTime) {
      latestTime = time;
      latest = new Date(time).toISOString();
    }
  }
  return latest || nowIso();
}

function getAllOpeningIds(allOpeningIds?: readonly string[]): string[] {
  const eligible =
    allOpeningIds && allOpeningIds.length > 0
      ? allOpeningIds
      : getEligibleRepertoireOpeningIds();
  return normalizeOpeningPool(eligible);
}

function getStarterPackOpeningIdsForProgress(
  starterPackId: StarterPackId,
): string[] {
  const pack = getStarterPackById(starterPackId) ?? getDefaultStarterPack();
  const packOpenings = getStarterPackOpeningIds(pack.id);
  return normalizeOpeningPool([
    packOpenings.whiteOpeningId,
    packOpenings.blackOpeningId,
  ]);
}

function buildRepertoireProgressFromDurableState(input: {
  userId: string;
  repertoire: UserRepertoire | null;
  pointEvents: readonly {
    id: string;
    userId: string;
    source: string;
    points: number;
    openingId?: string;
    dailySessionId?: string;
    createdAt: string;
  }[];
  unlockEvents: readonly {
    id: string;
    userId: string;
    openingId: string;
    pointsSpent: number;
    unlockIndex: number;
    createdAt: string;
  }[];
  allOpeningIds?: readonly string[];
  starterPackId?: string | null;
  now?: string;
}): RepertoireProgress {
  const allOpeningIds = getAllOpeningIds(input.allOpeningIds);
  const profileStarterPackId = (normalizeText(input.starterPackId) ||
    getDefaultStarterPack().id) as StarterPackId;
  const defaultProgress = createDefaultRepertoireProgress({
    userId: input.userId,
    starterPackId: profileStarterPackId,
    allOpeningIds,
    now: input.now,
  });
  const base = (
    input.repertoire
      ? {
          ...defaultProgress,
          ...input.repertoire,
          availablePoints: Math.max(
            0,
            Number(input.repertoire.openingUnlockPoints) ||
              defaultProgress.availablePoints,
          ),
          lifetimePoints: Math.max(
            0,
            Number(input.repertoire.openingUnlockPoints) ||
              defaultProgress.lifetimePoints,
          ),
        }
      : defaultProgress
  ) as RepertoireProgress;
  const starterPackOpenings = getStarterPackOpeningIdsForProgress(
    base.selectedStarterPackId ?? profileStarterPackId,
  );
  const pointEvents = sortRepertoirePointEvents(input.pointEvents as never);
  const unlockEvents = sortRepertoireUnlockEvents(input.unlockEvents as never);
  const unlockedOpeningIds = normalizeOpeningPool([
    ...starterPackOpenings,
    ...base.unlockedOpeningIds,
    ...unlockEvents.map((event) => event.openingId),
  ]);
  const lockedOpeningIds = buildLockedOpeningIds(
    allOpeningIds,
    unlockedOpeningIds,
  );
  const availableFromCache = Math.max(
    0,
    Number(input.repertoire?.openingUnlockPoints ?? base.availablePoints) || 0,
  );
  const earnedFromEvents = getRepertoirePointEventTotal(pointEvents);
  const spentFromEvents = getRepertoireUnlockSpendTotal(unlockEvents);
  const availablePoints = Math.max(
    0,
    Math.max(availableFromCache, earnedFromEvents - spentFromEvents),
  );
  const lifetimePoints = Math.max(
    availablePoints + spentFromEvents,
    earnedFromEvents,
  );
  const nextUnlockCost = getNextUnlockCost({
    selectedStarterPackId: base.selectedStarterPackId as StarterPackId,
    unlockedOpeningIds,
    lockedOpeningIds,
    availablePoints,
  });
  return {
    ...base,
    selectedStarterPackId: base.selectedStarterPackId,
    unlockedOpeningIds,
    lockedOpeningIds,
    availablePoints,
    lifetimePoints,
    spentPoints: spentFromEvents,
    nextUnlockCost,
    nextUnlockProgressPct: getUnlockProgressPct({
      selectedStarterPackId: base.selectedStarterPackId as StarterPackId,
      unlockedOpeningIds,
      lockedOpeningIds,
      availablePoints,
    }),
    pointEvents,
    unlockEvents,
    updatedAt: maxIso([
      input.repertoire?.updatedAt,
      pointEvents.at(-1)?.createdAt,
      unlockEvents.at(-1)?.createdAt,
      input.now,
    ]),
  };
}

export async function loadDurableRepertoireProgress(
  input: DurableRepertoireProgressInput,
): Promise<RepertoireProgress> {
  const adapter = getAccountPersistenceAdapter({
    accessToken: input.accessToken ?? null,
    allowLocalFallback: false,
  });
  const [
    profileResult,
    repertoireResult,
    pointEventsResult,
    unlockEventsResult,
  ] = await Promise.all([
    readTrainingProfile(input.userId, {
      accessToken: input.accessToken ?? null,
      allowLocalFallback: false,
    }),
    adapter.getUserRepertoire(input.userId),
    adapter.getRepertoirePointEvents(input.userId),
    adapter.getRepertoireUnlockEvents(input.userId),
  ]);
  for (const [result, label] of [
    [profileResult, "training_profile"],
    [repertoireResult, "repertoire"],
    [pointEventsResult, "point_events"],
    [unlockEventsResult, "unlock_events"],
  ] as const) {
    if (!result.ok) {
      throw new Error(`repertoire_${label}_unavailable`);
    }
  }
  const profileData = profileResult.ok ? profileResult.data : null;
  const repertoireData = repertoireResult.ok ? repertoireResult.data : null;
  const pointEventsData = pointEventsResult.ok ? pointEventsResult.data : [];
  const unlockEventsData = unlockEventsResult.ok ? unlockEventsResult.data : [];
  const starterPackId = (normalizeText(repertoireData?.selectedStarterPackId) ||
    normalizeText(profileData?.selectedStarterPackId) ||
    getDefaultStarterPack().id) as StarterPackId;
  const progress = buildRepertoireProgressFromDurableState({
    userId: input.userId,
    repertoire: repertoireData,
    pointEvents: pointEventsData,
    unlockEvents: unlockEventsData,
    allOpeningIds: input.allOpeningIds,
    starterPackId,
    now: input.now,
  });
  const commercialAccess = await resolveCommercialAccess({
    userId: input.userId,
    now: input.now,
  });
  const openingPolicy = await loadFreeActiveOpeningPolicy({
    userId: input.userId,
    environment: readCommercialBillingEnvironment(),
    unlockedOpeningIds: progress.unlockedOpeningIds,
    access: commercialAccess,
  });
  return {
    ...progress,
    commercialPlan: commercialAccess.plan,
    activeOpeningIds: openingPolicy.activeOpeningIds
      ? Array.from(openingPolicy.activeOpeningIds)
      : progress.unlockedOpeningIds,
    activeOpeningSelectionRequired: openingPolicy.selectionRequired,
  };
}
