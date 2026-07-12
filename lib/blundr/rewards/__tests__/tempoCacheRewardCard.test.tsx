import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TempoCacheRewardCard } from "../../../../components/rewards/popups/TempoCacheRewardCard";
import type { RewardPresentationModel } from "../rewardPresentationAdapter";

const reward: RewardPresentationModel = { eventId: "card-event", rewardType: "choice_token", rawRewardType: "choice_token", amount: 1, displayName: "Choice Token", description: "Choose one locked opening to unlock", rarity: "rare", grantedAt: "2026-07-10T00:00:00.000Z" };
const closed = renderToStaticMarkup(<TempoCacheRewardCard reward={reward} revealed={false} reducedMotion={false} />);
assert.match(closed, /Blundr/); assert.match(closed, /Tempo Cache/); assert.match(closed, /Reward Deck/); assert.match(closed, /aria-hidden="true" data-reward-type="choice_token"/);
const open = renderToStaticMarkup(<TempoCacheRewardCard reward={reward} revealed reducedMotion={false} />);
assert.match(open, /is-revealed/); assert.match(open, /Choice Token/); assert.match(open, /Choose one locked opening to unlock/);
const reduced = renderToStaticMarkup(<TempoCacheRewardCard reward={reward} revealed reducedMotion />);
assert.match(reduced, /is-reduced/);
console.log("tempoCacheRewardCard.test.tsx passed");
