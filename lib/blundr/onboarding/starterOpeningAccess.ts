import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import { RepertoireOpeningAccessRepository } from "@/lib/blundr/openingAccess/openingAccessRepository";
import { getStage2OpeningAvailability } from "@/lib/blundr/openings/openingAvailability";
import { getOpeningSide } from "@/lib/blundr/repertoire/repertoireOpeningPool";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";

/** Uses the same opening-access policy as the product detail route. */
export function hasVerifiedStarterOpeningAccess(
  user: CurrentBlundrUser,
  repertoire: RepertoireProgress,
  openingIds: readonly string[],
): boolean {
  const access = new RepertoireOpeningAccessRepository((userId) =>
    userId === user.userId ? repertoire : null,
  );
  return openingIds.every((openingId) => {
    const side = getOpeningSide(openingId);
    const availability = getStage2OpeningAvailability(openingId);
    if (!availability) return false;
    return (
      access.get({
        userId: user.userId,
        openingId,
        repertoireSide:
          side === "unknown" ? availability.learnerPerspective : side,
      }).decision === "active"
    );
  });
}
