"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RewardModalBase } from "./RewardModalBase";
import { RewardGrantedPopup } from "./popups/RewardGrantedPopup";
import { MilestonePopup } from "./popups/MilestonePopup";
import { TempoCacheDeckPopup } from "./popups/TempoCacheDeckPopup";
import { OpeningUnlockedPopup } from "./popups/OpeningUnlockedPopup";
import { RewardFailurePopup } from "./popups/RewardFailurePopup";
import { adaptRewardGrantToPresentation, type RewardPresentationModel } from "@/lib/blundr/rewards/rewardPresentationAdapter";
import { enqueueRewardPopup, dismissRewardPopup, useRewardPopupBusSnapshot } from "@/lib/blundr/rewards/rewardPopupBus";
import type { RewardPopupChrome, RewardPopupEvent } from "@/lib/blundr/rewards/rewardPopupTypes";

function fallbackPresentation(event: RewardPopupEvent): RewardPresentationModel {
  const rewardType = event.kind === "reward_popup" ? event.rewardType : "unknown";
  const amount = event.kind === "reward_popup" ? Math.max(1, event.amount) : 1;
  const rarity = event.kind === "reward_popup" ? event.rarity : "common";
  const presentationType = rewardType === "unlock_points" && rarity === "epic" ? "epic_bonus" : rewardType === "unlock_points" ? "repertoire_points" : rewardType === "opening_fragment" || rewardType === "choice_token" ? rewardType : "unknown";
  const displayName = presentationType === "repertoire_points" || presentationType === "epic_bonus" ? "Repertoire Points" : presentationType === "opening_fragment" ? "Opening Fragment" : presentationType === "choice_token" ? "Choice Token" : event.title || "Reward";
  return { eventId: event.id, rewardType: presentationType, rawRewardType: rewardType, amount, displayName, description: event.description || "Added to your account", rarity, sourceLabel: event.sourceLabel, grantedAt: event.createdAt };
}

export function renderRewardPopupEvent(event: RewardPopupEvent, onDismiss: () => void, chrome: RewardPopupChrome): React.ReactNode {
  if (event.kind === "failure") return <RewardFailurePopup event={event} onDismiss={onDismiss} />;
  if (event.kind === "unlock_success") return <OpeningUnlockedPopup event={event} onDismiss={onDismiss} />;
  if (event.kind === "tempo_cache") {
    const reward = event.presentation ?? (event.rewardGrants[0] ? adaptRewardGrantToPresentation(event.rewardGrants[0], event.sourceLabel) : fallbackPresentation(event));
    return <TempoCacheDeckPopup reward={reward} reducedMotion={chrome.reducedMotion} onDismiss={onDismiss} />;
  }
  if (event.kind === "streak") return <MilestonePopup title={event.title} description={event.description} onDismiss={onDismiss} />;
  if (event.kind === "reward_popup") {
    const reward = event.presentation ?? (event.grant ? adaptRewardGrantToPresentation(event.grant, event.sourceLabel) : fallbackPresentation(event));
    return <RewardGrantedPopup reward={reward} title={event.title} onDismiss={onDismiss} />;
  }
  if (event.kind === "opening_unlock") return <RewardModalBase open title={event.title} description={event.description} onClose={onDismiss} primaryLabel="Close preview" onPrimaryAction={onDismiss}><div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200"><strong>{event.card.openingName}</strong><p className="mt-2 text-sm">Preview only. Select an unlock resource on the repertoire page.</p></div></RewardModalBase>;
  return <RewardModalBase open title={event.title} description={event.description} onClose={onDismiss} primaryLabel="Done" onPrimaryAction={onDismiss}><div className="space-y-2 text-sm">{event.kind === "admin_grant" ? <><div>{event.grantType}: {event.amount}</div><div>{event.targetUserId}</div>{event.auditId ? <div>Audit {event.auditId}</div> : null}</> : "Reward event"}</div></RewardModalBase>;
}

export function RewardPopupHost() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { active } = useRewardPopupBusSnapshot();
  useEffect(() => setMounted(true), []);
  useEffect(() => { const media = window.matchMedia?.("(prefers-reduced-motion: reduce)"); if (!media) return; const update = () => setReducedMotion(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  if (!mounted || !active) return null;
  return createPortal(<div className="reward-popup-host" data-reduced-motion={reducedMotion ? "true" : "false"}>{renderRewardPopupEvent(active, () => dismissRewardPopup(active.id), { frame: "desktop", reducedMotion, darkBackdrop: true })}</div>, document.body);
}

export { enqueueRewardPopup, dismissRewardPopup } from "@/lib/blundr/rewards/rewardPopupBus";
