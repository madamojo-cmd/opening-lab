import { readFileSync } from "node:fs";

const source = readFileSync("lib/blundr/contracts/index.ts", "utf8");
const serverSource = readFileSync(
  "lib/blundr/contracts/serverFeatureFlags.ts",
  "utf8",
);
const required = [
  "learning_core_v2_write",
  "learning_core_v2_read",
  "game_data_connections",
  "game_data_chess_com",
  "game_data_lichess",
  "weakness_engine_v2",
  "daily_production_store",
  "daily_candidate_choice",
  "daily_plan_recall",
  "daily_same_position_different_route",
  "daily_continuation_challenge",
  "daily_punish_the_mistake",
  "daily_mixed_test",
  "daily_deep_minigames",
  "daily_adaptive_v2",
  "rewards_v2_enabled",
  "reward_presentations_v2_enabled",
  "repertoire_opening_detail",
];
const requiredEnvironmentFlags = [
  ["daily_adaptive_v2", "BLUNDR_FEATURE_DAILY_ADAPTIVE_V2"],
  ["rewards_v2_enabled", "BLUNDR_REWARDS_V2_ENABLED"],
  [
    "reward_presentations_v2_enabled",
    "NEXT_PUBLIC_BLUNDR_REWARD_PRESENTATIONS_V2_ENABLED",
  ],
];
const errors = required.flatMap((flag) => {
  const declared = source.includes(`"${flag}"`);
  const defaultOff = source.includes(`${flag}: false`);
  return declared && defaultOff
    ? []
    : [`flag not declared/default-off: ${flag}`];
});
for (const [flag, environmentFlag] of requiredEnvironmentFlags) {
  if (!new RegExp(`${flag}:\\s*"${environmentFlag}"`).test(serverSource))
    errors.push(
      `required environment flag is not declared for ${flag}: ${environmentFlag}`,
    );
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Feature-flag audit passed (${required.length} required flags default off).`,
  );
