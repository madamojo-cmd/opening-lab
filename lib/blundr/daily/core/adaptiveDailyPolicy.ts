export const ADAPTIVE_DAILY_CARD_CAPS = [3, 4, 5, 12] as const;
export type AdaptiveDailyCardCap = (typeof ADAPTIVE_DAILY_CARD_CAPS)[number];

export function resolveAdaptiveDailyCardCap(
  requested: number | null | undefined,
): AdaptiveDailyCardCap | null {
  if (requested == null) return null;
  return (ADAPTIVE_DAILY_CARD_CAPS as readonly number[]).includes(requested)
    ? (requested as AdaptiveDailyCardCap)
    : null;
}
