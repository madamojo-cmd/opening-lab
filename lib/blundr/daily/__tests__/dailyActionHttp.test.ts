import assert from "node:assert/strict";
import test from "node:test";

import { classifyDailyActionHttpFailure } from "../dailyActionHttp.server";

test("stale Daily actions become recoverable conflicts", () => {
  assert.deepEqual(
    classifyDailyActionHttpFailure(new Error("daily_action_id_invalid")),
    {
      code: "daily_session_conflict",
      message:
        "This Daily deck changed before the action was recorded. Reload the reserved deck and try again.",
      status: 409,
    },
  );
});

test("Daily persistence failures stay retryable without leaking database text", () => {
  assert.deepEqual(
    classifyDailyActionHttpFailure(
      new Error("daily_opening_access_unavailable"),
    ),
    {
      code: "daily_action_persistence_unavailable",
      message:
        "Daily could not safely save that action. Your deck is unchanged; try again.",
      status: 503,
    },
  );
});

test("unknown Daily failures return a stable safe rejection", () => {
  assert.equal(
    classifyDailyActionHttpFailure(new Error("sensitive_internal_text")).code,
    "daily_action_rejected",
  );
});
