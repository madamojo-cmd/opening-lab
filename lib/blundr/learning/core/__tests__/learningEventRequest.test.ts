import assert from "node:assert/strict";
import test from "node:test";
import { resolveLearningEventAttemptId } from "../learningEventRequest";

test("learning event requests accept the browser event id without losing idempotency", () => {
  assert.equal(resolveLearningEventAttemptId({ id: "learn-e-1" }), "learn-e-1");
  assert.equal(
    resolveLearningEventAttemptId({ eventId: "canonical-1", id: "legacy-1" }),
    "canonical-1",
  );
  assert.equal(resolveLearningEventAttemptId({ id: "  " }), null);
});
