import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const landing = readFileSync(
  resolve(root, "components/marketing/BlundrLandingPage.tsx"),
  "utf8",
);
const page = readFileSync(resolve(root, "app/page.tsx"), "utf8");
const layout = readFileSync(resolve(root, "app/layout.tsx"), "utf8");

const requiredAssets = [
  "interactive_chess_training_board.png",
  "italian_game_tempo_cue_card.png",
  "daily_move_recall_chess_trainer.png",
  "chess_replay_training_dashboard.png",
  "italian_game_mastery_dashboard.png",
  "daily_rings_training_dashboard.png",
  "blundr_common_reward_popup.png",
];

for (const asset of requiredAssets) {
  assert.match(landing, new RegExp(asset.replace(".", "\\.")));
  assert.equal(
    existsSync(resolve(root, "public/assets/landing", asset)),
    true,
    `missing_landing_asset:${asset}`,
  );
}

const orderedHeadlines = [
  "Learn the opening. Know what to do when it changes.",
  "Your opponent won&apos;t follow your study file.",
  "The right positions, every day.",
  "Mistakes become your review.",
  "Build a repertoire you actually understand.",
  "Train a little every day. Improve a lot over time.",
  "Progress should feel rewarding.",
  "Start building a stronger opening game.",
];

for (const headline of orderedHeadlines) {
  assert.match(
    landing,
    new RegExp(headline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
}

for (const sectionId of [
  'id="top"',
  'id="how-it-works"',
  'id="rewards"',
  'id="plans"',
]) {
  assert.match(landing, new RegExp(sectionId));
}

for (const legalPath of [
  "/pricing",
  "/privacy",
  "/terms",
  "/subscription-terms",
  "/cookies",
  "/legal",
]) {
  assert.match(landing, new RegExp(`href="${legalPath}"`));
}

for (const launchCopy of [
  "$0",
  "$9.99/month after trial",
  "$69.99/year after trial",
  "Five Daily Blundr cards per local day",
  "Five Review positions per local day",
]) {
  assert.match(
    landing,
    new RegExp(launchCopy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
}

for (const banned of [
  "canonical",
  "runtime",
  "authoritative",
  "projection",
  "reserved practice",
  "opening_move",
  "49K",
  "116K",
]) {
  assert.doesNotMatch(landing, new RegExp(banned, "i"));
}

assert.match(page, /auth\.status !== "authenticated"/);
assert.match(page, /<BlundrLandingPage \/>/);
assert.match(layout, /Learn the opening\. Know what to do when it changes\./);
