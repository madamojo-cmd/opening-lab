import assert from "node:assert/strict";

import { specificityBand } from "../specificityScorer";

export function testSpecificityScorer(): void {
  assert.equal(specificityBand({ specificityScore: 95 } as any), "move_specific");
  assert.equal(specificityBand({ specificityScore: 75 } as any), "plan_specific");
  assert.equal(specificityBand({ specificityScore: 20 } as any), "generic");
}
