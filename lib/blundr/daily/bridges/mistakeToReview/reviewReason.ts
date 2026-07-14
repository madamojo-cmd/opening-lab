export type ReviewReason =
  | "first_attempt_miss"
  | "repeated_miss"
  | "continuation_mistake"
  | "daily_retry";
export const REVIEW_REASON_LABELS: Readonly<Record<ReviewReason, string>> = {
  first_attempt_miss: "First-attempt miss",
  repeated_miss: "Repeated miss",
  continuation_mistake: "Continuation mistake",
  daily_retry: "Retry practice",
};
