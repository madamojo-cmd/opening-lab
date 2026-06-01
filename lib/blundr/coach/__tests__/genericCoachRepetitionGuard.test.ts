import assert from "node:assert/strict";

import { shouldSuppressRepeatedGeneric } from "../genericCoachRepetitionGuard";

export function testGenericCoachRepetitionGuard(): void {
  assert.equal(shouldSuppressRepeatedGeneric({ body: "Improve development.", recentBodies: ["Improve development."] }), true);
  assert.equal(shouldSuppressRepeatedGeneric({ body: "Castle now.", recentBodies: ["Improve development."] }), false);
}
