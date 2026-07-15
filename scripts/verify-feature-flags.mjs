import { readFileSync } from "node:fs";

const source = readFileSync("lib/blundr/contracts/index.ts", "utf8");
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
  "repertoire_opening_detail",
];
const errors = required.flatMap((flag) => {
  const declared = source.includes(`"${flag}"`);
  const defaultOff = source.includes(`${flag}: false`);
  return declared && defaultOff
    ? []
    : [`flag not declared/default-off: ${flag}`];
});
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Feature-flag audit passed (${required.length} required flags default off).`,
  );
