export type DeepMiniGameTelemetry = {
  event:
    | "deep_started"
    | "deep_progressed"
    | "deep_completed"
    | "deep_rejected";
  activityId: string;
  scenarioId: string;
};
export function deepTelemetry(
  event: DeepMiniGameTelemetry["event"],
  activityId: string,
  scenarioId: string,
): DeepMiniGameTelemetry {
  return { event, activityId, scenarioId };
}
