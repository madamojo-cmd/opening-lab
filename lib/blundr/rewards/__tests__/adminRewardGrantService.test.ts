import assert from "node:assert/strict";

import { grantAdminReward } from "../adminRewardGrantService";

void (async () => {
  const adminUser = {
    userId: "admin-user",
    email: "admin@example.com",
    mode: "developer_admin" as const,
    isAuthenticated: true,
    isAdmin: true,
    accessToken: "token",
    provider: "supabase",
  };

  const missingTarget = await grantAdminReward({
    adminUser,
    targetUserId: "",
    grantType: "repertoire_points",
    amount: 10,
    reason: "QA",
  });
  assert.equal(missingTarget.ok, false);
  if (!missingTarget.ok) {
    assert.equal(missingTarget.code, "missing_target");
  }

  const missingReason = await grantAdminReward({
    adminUser,
    targetUserId: "target-user",
    grantType: "opening_fragment",
    amount: 1,
    reason: "",
  });
  assert.equal(missingReason.ok, false);
  if (!missingReason.ok) {
    assert.equal(missingReason.code, "missing_reason");
  }

  const invalidAmount = await grantAdminReward({
    adminUser,
    targetUserId: "target-user",
    grantType: "choice_token",
    amount: 0,
    reason: "QA",
  });
  assert.equal(invalidAmount.ok, false);
  if (!invalidAmount.ok) {
    assert.equal(invalidAmount.code, "invalid_amount");
  }

  console.log("adminRewardGrantService.test.ts passed");
})();
