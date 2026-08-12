import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import { FEATURE_FLAGS, type FeatureFlagName } from "../../contracts";
import {
  isProductionDailyAvailable,
  PRODUCTION_DAILY_REQUIRED_FLAGS,
} from "../productionDailyCapability";

const enabled = {
  ...FEATURE_FLAGS,
  ...Object.fromEntries(
    PRODUCTION_DAILY_REQUIRED_FLAGS.map((flag) => [flag, true]),
  ),
  daily_adaptive_v2: false,
} as Record<FeatureFlagName, boolean>;

test("production Daily uses its current authority flags, not the obsolete adaptive flag", () => {
  assert.equal(isProductionDailyAvailable(enabled), true);
  assert.equal(
    isProductionDailyAvailable({ ...enabled, daily_adaptive_v2: true }),
    true,
  );
});

test("production Daily fails closed when any required authority is disabled", () => {
  for (const flag of PRODUCTION_DAILY_REQUIRED_FLAGS) {
    assert.equal(
      isProductionDailyAvailable({ ...enabled, [flag]: false }),
      false,
      flag,
    );
  }
});

test("all production Daily routes share the production capability predicate", () => {
  const root = resolve(import.meta.dirname, "../../../..");
  for (const path of [
    "app/api/blundr/daily/today/route.ts",
    "app/api/blundr/daily/priorities/route.ts",
    "app/api/blundr/daily/sessions/[sessionId]/attempts/route.ts",
    "app/api/blundr/daily/sessions/[sessionId]/retry/route.ts",
    "app/api/blundr/daily/sessions/[sessionId]/reveal/route.ts",
  ]) {
    const source = readFileSync(resolve(root, path), "utf8");
    assert.match(
      source,
      /isProductionDailyAvailable\(getServerFeatureFlags\(\)\)/,
    );
    assert.doesNotMatch(source, /daily_adaptive_v2/);
  }
});
