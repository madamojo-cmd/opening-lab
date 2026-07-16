import assert from "node:assert/strict";
import test from "node:test";
import { validateBlundrUsername } from "../profileTypes";

test("Blundr usernames normalize and accept the documented shape", () => {
  assert.deepEqual(validateBlundrUsername("Mara_7"), {
    ok: true,
    username: "Mara_7",
    normalizedUsername: "mara_7",
  });
});

test("Blundr usernames reject invalid, reserved, and identity-like values", () => {
  assert.equal(validateBlundrUsername("ab").ok, false);
  assert.equal(validateBlundrUsername("admin").ok, false);
  assert.equal(validateBlundrUsername("user@example.com").ok, false);
  assert.equal(validateBlundrUsername("https://example.com").ok, false);
});
