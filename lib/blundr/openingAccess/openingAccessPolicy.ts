import { getStage2OpeningAvailability } from "@/lib/blundr/openings/openingAvailability";
import { isOpeningUnlocked } from "@/lib/blundr/repertoire/repertoireUnlockService";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import type {
  OpeningAccessRequest,
  OpeningAccessSnapshot,
} from "./openingAccessTypes";

export const OPENING_ACCESS_AUTHORITY_VERSION = "repertoire-unlock-v1" as const;

export function evaluateOpeningAccess(
  input: OpeningAccessRequest & {
    repertoire: RepertoireProgress | null;
    activeOpeningIds?: ReadonlySet<string> | null;
    selectionRequired?: boolean;
  },
): OpeningAccessSnapshot {
  const now = input.now ?? new Date().toISOString();
  const availability = getStage2OpeningAvailability(input.openingId);
  const unlocked = Boolean(
    availability &&
      availability.learnerPerspective === input.repertoireSide &&
      input.repertoire &&
      isOpeningUnlocked(input.repertoire, availability.openingId),
  );
  const activeForPlan =
    unlocked &&
    (!input.activeOpeningIds ||
      input.activeOpeningIds.has(availability!.openingId));
  const decision =
    activeForPlan && !input.selectionRequired ? "active" : "gated_pending";
  return {
    openingId: availability?.openingId ?? input.openingId,
    repertoireSide: input.repertoireSide,
    decision,
    checkedAt: now,
    authorityVersion: OPENING_ACCESS_AUTHORITY_VERSION,
    expiresAt: new Date(Date.parse(now) + 5 * 60_000).toISOString(),
  };
}
