import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const landingRoot = resolve(
  root,
  "components/marketing/blundr-landing-integration-completion-package",
);
const landing = [
  readFileSync(
    resolve(root, "components/marketing/BlundrLandingPage.tsx"),
    "utf8",
  ),
  ...readdirSync(landingRoot, { recursive: true })
    .filter((file) => typeof file === "string" && /\.(tsx?|css)$/.test(file))
    .map((file) => readFileSync(resolve(landingRoot, file), "utf8")),
].join("\n");
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
  assert.equal(
    existsSync(resolve(root, "public/assets/landing", asset)),
    true,
    `missing_landing_asset:${asset}`,
  );
}

for (const sectionId of [
  'id="hero-title"',
  'id="why-blundr"',
  'id="concept"',
  'id="pricing"',
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
  assert.match(
    landing,
    new RegExp(legalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
}

for (const launchCopy of [
  "Learn the opening.",
  "Blundr trains the positions behind your repertoire",
  "$0",
  "$9.99 / month",
  "$69.99/year",
  "20 Tempo runs per day",
  "Unlimited Tempo training",
  "Compare plans →",
]) {
  assert.match(
    landing,
    new RegExp(launchCopy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
}

assert.match(page, /auth\.status !== "authenticated"/);
assert.match(page, /<BlundrLandingPage \/>/);
assert.match(layout, /Learn the opening\. Know what to do when it changes\./);
