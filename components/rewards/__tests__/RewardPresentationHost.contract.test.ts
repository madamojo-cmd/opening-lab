import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const host = readFileSync(
  path.join(root, "components/rewards/RewardPresentationHost.tsx"),
  "utf8",
);
const hydration = readFileSync(
  path.join(root, "components/auth/AuthenticatedAccountHydrationGate.tsx"),
  "utf8",
);
const rewardAuthority = readFileSync(
  path.join(root, "lib/blundr/rewards/rewardAuthority.ts"),
  "utf8",
);
const dailyTargetMigration = readFileSync(
  path.join(
    root,
    "supabase/migrations/20260826130803_blundr_daily_card_target_reward_authority.sql",
  ),
  "utf8",
);

assert.match(hydration, /<RewardPresentationHost \/>/);
assert.match(host, /sessionStorage/);
assert.match(host, /x-blundr-presentation-client/);
assert.match(host, /presentations\/claim/);
assert.match(host, /HOME_PRESENTATION_DELAY_MS = 2_000/);
assert.match(host, /pathname === "\/"/);
assert.match(host, /action: "rendered"/);
assert.match(host, /action: "acknowledged"/);
assert.doesNotMatch(host, />Dismiss</);
assert.doesNotMatch(host, /finish\("dismissed"\)/);
assert.match(host, />\s*Collect\s*</);
assert.doesNotMatch(
  host,
  /applyRewardCompletion|spendInventoryAndUnlock|recordBlundrTaskCompleted/,
);
assert.match(host, /NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED/);
assert.match(host, /BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT/);
assert.match(
  rewardAuthority,
  /input\.source === "daily_blundr_deck_completed"[\s\S]*blundr_prepare_daily_blundr_reward_target_v1/,
);
assert.match(
  dailyTargetMigration,
  /create or replace function public\.blundr_prepare_daily_blundr_reward_target_v1/,
);
assert.match(dailyTargetMigration, /daily_blundr_goal\s*=\s*1/);
assert.doesNotMatch(
  dailyTargetMigration,
  /alter function public\.blundr_apply_reward_transaction_v2_core[\s\S]*rename/i,
);
console.log("rewardPresentationHost contract ok");
