import type { OpeningAccessSnapshot } from "@/lib/blundr/contracts";
import { isFailClosedAccess } from "@/lib/blundr/contracts";

export type DailyEligibilityContext = {
  userId: string;
  dateKey: string;
  access: ReadonlyMap<string, OpeningAccessSnapshot>;
};
export function isDailyPositionEligible(
  context: DailyEligibilityContext,
  openingId: string,
  now = Date.now(),
): boolean {
  const access = context.access.get(openingId);
  return !isFailClosedAccess(access, now);
}
