export const BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT =
  "blundr-reward-presentation-refresh";

export function notifyRewardPresentationRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT));
}
