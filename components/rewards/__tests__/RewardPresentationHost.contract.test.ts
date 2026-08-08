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

assert.match(hydration, /<RewardPresentationHost \/>/);
assert.match(host, /sessionStorage/);
assert.match(host, /x-blundr-presentation-client/);
assert.match(host, /presentations\/claim/);
assert.match(host, /action: "rendered"/);
assert.match(host, /action: "acknowledged"/);
assert.match(host, /finish\("dismissed"\)/);
assert.doesNotMatch(
  host,
  /applyRewardCompletion|spendInventoryAndUnlock|recordBlundrTaskCompleted/,
);
assert.match(host, /NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED/);
console.log("rewardPresentationHost contract ok");
