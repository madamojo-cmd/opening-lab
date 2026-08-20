import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const host = readFileSync(
  path.join(root, "components/rewards/RewardPresentationHost.tsx"),
  "utf8",
);
const hostStyles = readFileSync(
  path.join(root, "components/rewards/RewardPresentationHost.module.css"),
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
assert.match(host, /Dismiss/);
assert.match(host, /Done/);
assert.doesNotMatch(
  host,
  /applyRewardCompletion|spendInventoryAndUnlock|recordBlundrTaskCompleted/,
);
assert.match(host, /NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED/);
assert.match(host, /BLUNDR_REWARD_PRESENTATION_REFRESH_EVENT/);
assert.match(host, /RewardAnimation/);
assert.match(host, /RewardIcon/);
assert.match(hostStyles, /backdrop-filter: blur\(18px\)/);
assert.match(hostStyles, /width: min\(520px, 100%\)/);
assert.match(hostStyles, /max-height: 86vh/);
assert.match(hostStyles, /grid-template-columns: 190px minmax\(0, 1fr\)/);
assert.match(hostStyles, /gap: 18px/);
assert.match(hostStyles, /padding: 22px/);
assert.match(hostStyles, /border-radius: 26px/);
assert.match(hostStyles, /min-height: 195px/);
assert.match(hostStyles, /width: 150px/);
assert.match(hostStyles, /prefers-reduced-motion: reduce/);
console.log("rewardPresentationHost contract ok");
