import assert from "node:assert/strict";

import { getCoachTemplates } from "../coachTemplateLibrary";
import { getTemplateRegistryStats } from "../templateRegistryStats";

export function testCoachTemplateLibrary(): void {
  const templates = getCoachTemplates();
  assert.equal(templates.length >= 150, true);
  const stats = getTemplateRegistryStats() as any;
  assert.equal(stats.byCategory.castling >= 20, true);
  assert.equal(stats.unsafeBlockedCount, 0);
}
