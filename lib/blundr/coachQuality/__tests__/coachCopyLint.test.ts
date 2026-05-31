import assert from "node:assert/strict";
import { lintCoachCopy } from "../coachCopyLint";

export function testCoachCopyLint(): void {
  const issues = lintCoachCopy();
  const banned = issues.filter((issue) => issue.issue.startsWith("banned:"));
  assert.equal(banned.length, 0);
}
