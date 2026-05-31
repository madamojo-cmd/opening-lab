import assert from "node:assert/strict";

import { sanitizeForDebugJson, stringifyDebugJson } from "../trainerDebugSanitizer";

export function testTrainerDebugSanitizer(): void {
  const cyclic: any = { ok: true, fn: () => null, missing: undefined };
  cyclic.self = cyclic;
  const sanitized = sanitizeForDebugJson(cyclic) as any;
  assert.equal(sanitized.ok, true);
  assert.equal(sanitized.fn, "[function]");
  assert.equal(sanitized.missing, null);
  assert.equal(sanitized.self, "[cyclic]");
  assert.equal(typeof stringifyDebugJson(cyclic), "string");
}
