import assert from "node:assert/strict";

import { createDefaultDailyRetentionProgress, createDefaultRewardHistory, createDefaultStreakRecord, createDefaultTrainingProfile, createDefaultUserRepertoire } from "../accountDefaults";
import {
  appendLocalDeveloperAuditLog,
  getLocalAccountCurrentUserId,
  getLocalDailyRetentionProgress,
  getLocalRewardHistory,
  getLocalStreakRecord,
  getLocalTrainingProfile,
  getLocalUserRepertoire,
  readLocalAccountBundle,
  resetLocalAccountState,
  saveLocalValidationSnapshot,
  setLocalAccountCurrentUserId,
  upsertLocalDailyRetentionProgress,
  upsertLocalRewardHistory,
  upsertLocalStreakRecord,
  upsertLocalTrainingProfile,
  upsertLocalUserRepertoire,
} from "../localAccountStorage";

resetLocalAccountState("user-1");
setLocalAccountCurrentUserId("user-1");

const now = "2026-07-03T12:00:00.000Z";
const profile = upsertLocalTrainingProfile(createDefaultTrainingProfile("user-1", now));
const repertoire = upsertLocalUserRepertoire(createDefaultUserRepertoire("user-1", now));
const progress = upsertLocalDailyRetentionProgress(createDefaultDailyRetentionProgress("user-1", "2026-07-03", undefined, now));
const streak = upsertLocalStreakRecord(createDefaultStreakRecord("user-1", now));
const rewardHistory = upsertLocalRewardHistory(createDefaultRewardHistory("user-1", now));

assert.equal(getLocalAccountCurrentUserId(), "user-1");
assert.equal(getLocalTrainingProfile("user-1")?.userId, profile.userId);
assert.equal(getLocalUserRepertoire("user-1")?.userId, repertoire.userId);
assert.equal(getLocalDailyRetentionProgress("user-1", "2026-07-03")?.localDate, progress.localDate);
assert.equal(getLocalStreakRecord("user-1")?.userId, streak.userId);
assert.equal(getLocalRewardHistory("user-1")?.userId, rewardHistory.userId);

const snapshot = saveLocalValidationSnapshot({
  id: "snapshot-1",
  userId: "user-1",
  generatedAt: now,
  valid: true,
  issueCount: 0,
  errorCount: 0,
  warningCount: 0,
  reportJson: { valid: true },
});
assert.equal(snapshot.id, "snapshot-1");

const audit = appendLocalDeveloperAuditLog({
  id: "audit-1",
  actorUserId: "user-1",
  targetUserId: "user-1",
  action: "test_action",
  payload: { ok: true },
  createdAt: now,
});
assert.equal(audit.action, "test_action");
assert.ok(readLocalAccountBundle().developerAuditLogById["audit-1"]);

resetLocalAccountState("user-1");
assert.equal(getLocalTrainingProfile("user-1"), null);

console.log("localAccountStorage.test.ts passed");
