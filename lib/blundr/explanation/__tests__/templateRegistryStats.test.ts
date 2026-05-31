import assert from "node:assert/strict";

import { getTemplateRegistryStats } from "../templateRegistryStats";

export function testTemplateRegistryStats(): void {
  const stats = getTemplateRegistryStats() as any;
  assert.equal(stats.totalTemplates >= 150, true);
  assert.equal(stats.byRatingBucket.intermediate >= 150, true);
}
