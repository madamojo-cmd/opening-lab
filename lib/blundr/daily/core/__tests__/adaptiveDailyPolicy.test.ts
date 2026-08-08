import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveAdaptiveDailyCardCap,
  resolveServerDailyTaskCount,
} from "../adaptiveDailyPolicy";

test("adaptive Daily accepts only the explicit product card caps", () => {
  assert.equal(resolveAdaptiveDailyCardCap(3), 3);
  assert.equal(resolveAdaptiveDailyCardCap(4), 4);
  assert.equal(resolveAdaptiveDailyCardCap(5), 5);
  assert.equal(resolveAdaptiveDailyCardCap(12), 12);
  assert.equal(resolveAdaptiveDailyCardCap(null), null);
  assert.equal(resolveAdaptiveDailyCardCap(6), null);
});

test("server policy uses the launch default and accepts only reviewed entitlement sizes", () => {
  assert.equal(resolveServerDailyTaskCount({}), 5);
  assert.equal(resolveServerDailyTaskCount({ entitlementCap: null }), 5);
  assert.equal(resolveServerDailyTaskCount({ entitlementCap: 3 }), 3);
  assert.equal(resolveServerDailyTaskCount({ entitlementCap: 4 }), 4);
  assert.equal(resolveServerDailyTaskCount({ entitlementCap: 5 }), 5);
  assert.equal(resolveServerDailyTaskCount({ entitlementCap: 12 }), 12);
  assert.equal(resolveServerDailyTaskCount({ entitlementCap: 6 }), 5);
});
