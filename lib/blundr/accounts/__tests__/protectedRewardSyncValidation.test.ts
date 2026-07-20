import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { validateOwnedProgressEvents } from "@/lib/blundr/repertoire/repertoireSyncValidation";

const point = {
  id: "completion-1",
  userId: "user-a",
  source: "opening_run_completed" as const,
  points: 1,
  openingId: "italian-white",
  createdAt: "2026-07-20T12:00:00.000Z",
};

test("owned progress events validate before persistence", () => {
  const result = validateOwnedProgressEvents("user-a", [point], []);
  assert.equal(result.ok, true);
  assert.equal(result.ok ? result.pointEvents.length : 0, 1);
});

test("mismatched and invalid progress events fail before any write", () => {
  assert.deepEqual(validateOwnedProgressEvents("user-b", [point], []), {
    ok: false,
    code: "user_mismatch",
  });
  assert.deepEqual(
    validateOwnedProgressEvents(
      "user-a",
      [{ source: "opening_run_completed" }],
      [],
    ),
    { ok: false, code: "invalid_progress_event" },
  );
});

test("protected reward sync routes prohibit local fallback", () => {
  for (const path of [
    "app/api/blundr/repertoire/sync/route.ts",
    "app/api/blundr/daily-rings/sync/route.ts",
  ]) {
    const source = readFileSync(resolve(process.cwd(), path), "utf8");
    assert.match(source, /allowLocalFallback:\s*false/);
    assert.doesNotMatch(source, /allowLocalFallback:\s*true/);
  }
});
