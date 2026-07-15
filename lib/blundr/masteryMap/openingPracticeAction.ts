export type OpeningPracticeAction = {
  openingId: string;
  positionKey: string;
  activityId: string;
  reason: string;
};

export function buildOpeningPracticeAction(
  input: OpeningPracticeAction,
): OpeningPracticeAction {
  return { ...input };
}
