export type DailyActivityTelemetry = {
  event:
    | "activity_built"
    | "activity_rejected"
    | "activity_submitted"
    | "activity_revealed"
    | "activity_retried";
  activityId: string;
  cardFingerprint: string;
  positionKey: string;
  reason?: string;
  createdAt: string;
};

export function createActivityTelemetry(
  input: Omit<DailyActivityTelemetry, "createdAt"> & { createdAt?: string },
): DailyActivityTelemetry {
  return { ...input, createdAt: input.createdAt ?? new Date().toISOString() };
}
