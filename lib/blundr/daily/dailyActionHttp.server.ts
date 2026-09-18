export type DailyActionHttpFailure = {
  code: string;
  message: string;
  status: number;
};

const CONFLICT_CODES = new Set([
  "daily_session_conflict",
  "daily_action_id_invalid",
  "daily_activity_step_not_found",
]);

const NOT_FOUND_CODES = new Set([
  "daily_session_not_found",
  "daily_card_not_found",
]);

export function classifyDailyActionHttpFailure(
  error: unknown,
): DailyActionHttpFailure {
  const code = error instanceof Error ? error.message : "daily_action_failed";
  if (CONFLICT_CODES.has(code))
    return {
      code: "daily_session_conflict",
      message:
        "Daily changed before your move was recorded. Reload your deck and try again.",
      status: 409,
    };
  if (NOT_FOUND_CODES.has(code))
    return {
      code: "daily_session_unavailable",
      message: "Today's Daily deck is no longer available.",
      status: 404,
    };
  if (code === "opening_locked")
    return {
      code,
      message:
        "This opening is no longer active in your repertoire. Reload Daily to receive an eligible card.",
      status: 403,
    };
  if (code === "daily_card_limit_reached")
    return {
      code,
      message:
        "Free plans can complete up to 5 Daily cards per day. Reload Daily after upgrading or come back tomorrow.",
      status: 409,
    };
  if (
    code.includes("persistence") ||
    code.includes("projection") ||
    code.endsWith("_unavailable")
  )
    return {
      code: "daily_action_persistence_unavailable",
      message:
        "Daily couldn't save that action. Your deck is unchanged. Try again.",
      status: 503,
    };
  return {
    code: "daily_action_rejected",
    message:
      "Daily rejected that action because it did not match the current card.",
    status: 422,
  };
}
