"use client";

import { useState, type ReactNode } from "react";
import { adaptRewardGrantToPresentation, type RewardPresentationModel } from "@/lib/blundr/rewards/rewardPresentationAdapter";
import type { RewardPopupEvent } from "@/lib/blundr/rewards/rewardPopupTypes";
import { clearRewardPopupQueue, dismissRewardPopup, enqueueRewardPopup, getRewardPopupBusSnapshot, useRewardPopupBusSnapshot } from "@/lib/blundr/rewards/rewardPopupBus";
import type { RewardGrantRecord } from "@/lib/blundr/rewards/rewardTypes";
import type { RewardsDebugSnapshot, RewardsEventLogEntry, RewardsPreviewKind } from "./rewardsDebugTypes";
import type { PreviewMutationResult } from "./rewardsValidationModel";
import { BlundrButton, BlundrCard } from "@/components/blundr/ui";
import { TempoCacheDeckPopup } from "@/components/rewards/popups/TempoCacheDeckPopup";

type Props = {
  mode: string;
  snapshot: RewardsDebugSnapshot;
  eventLog: readonly RewardsEventLogEntry[];
  selectedOpeningId: string | null;
  lockedOpeningIds: readonly string[];
  onSelectOpening: (id: string) => void;
  onPreview: (preview: RewardsPreviewKind) => PreviewMutationResult | void;
  onExecuteVariableReward?: (input: {
    rewardType: VariableType;
    amount: number;
    displayName: string;
    description: string;
    rarity: RewardGrantRecord["rarity"];
    eventId: string;
  }) => RewardPresentationModel | null | Promise<RewardPresentationModel | null>;
  onTrigger: (triggerId: string, options?: { points?: number }) => void;
  onRefresh: () => void;
  stateExtras?: ReactNode;
  transactionExtras?: ReactNode;
  dailyExtras?: ReactNode;
};

type VariableType = "unlock_points" | "opening_fragment" | "choice_token" | "future_reward";

function button(label: string, onClick: () => void, tone: "primary" | "secondary" | "premium" | "ghost" = "secondary") {
  return <BlundrButton key={label} variant={tone} size="sm" onClick={onClick}>{label}</BlundrButton>;
}

function section(title: string, subtitle: string, children: ReactNode) {
  return <section aria-labelledby={`validation-${title}`} className="space-y-3"><div><div className="text-[11px] font-black uppercase tracking-[.18em] text-green-700">{title}</div><h2 id={`validation-${title}`} className="mt-1 text-xl font-black tracking-tight text-stone-950">{subtitle}</h2></div>{children}</section>;
}

function syntheticGrant(type: VariableType, amount: number, displayName: string, description: string, rarity: RewardGrantRecord["rarity"], eventId: string): RewardPresentationModel {
  return adaptRewardGrantToPresentation({ id: eventId, rewardId: eventId, rewardRollId: eventId, trigger: "weekly_cache", triggerEventId: eventId, rarity, rewardType: type, amount, displayName, description, pointsApplied: type === "unlock_points" ? amount : 0, applied: true, pendingChoice: type === "choice_token", grantMode: "guaranteed_cache", createdAt: new Date().toISOString() });
}

function isVariableType(value: string): value is VariableType {
  return value === "unlock_points" || value === "opening_fragment" || value === "choice_token" || value === "future_reward";
}

function isRewardRarity(value: string): value is RewardGrantRecord["rarity"] {
  return value === "common" || value === "uncommon" || value === "rare" || value === "epic";
}

function previewReward(type: VariableType, amount: number, eventId: string): RewardsPreviewKind {
  const names: Record<VariableType, string> = { unlock_points: "Repertoire Points", opening_fragment: "Opening Fragment", choice_token: "Choice Token", future_reward: "Future Reward" };
  const descriptions: Record<VariableType, string> = { unlock_points: "Added to your balance", opening_fragment: "Saved to your opening inventory", choice_token: "Choose one locked opening to unlock", future_reward: "Added to your account" };
  const rarities: Record<VariableType, RewardGrantRecord["rarity"]> = { unlock_points: "common", opening_fragment: "uncommon", choice_token: "rare", future_reward: "common" };
  return { kind: "reward", title: names[type], rarity: rarities[type], rewardType: type, amount, description: descriptions[type] };
}

export function RewardsValidationConsole({ mode, snapshot, eventLog, selectedOpeningId, lockedOpeningIds, onSelectOpening, onPreview, onExecuteVariableReward, onTrigger, onRefresh, stateExtras, transactionExtras, dailyExtras }: Props) {
  const [previewAudit, setPreviewAudit] = useState("No mutation detected");
  const [variableType, setVariableType] = useState<VariableType>("unlock_points");
  const [variableAmount, setVariableAmount] = useState("12");
  const [variableName, setVariableName] = useState("Repertoire Points");
  const [variableDescription, setVariableDescription] = useState("Added to your balance");
  const [variableRarity, setVariableRarity] = useState<RewardGrantRecord["rarity"]>("common");
  const [variableEventId, setVariableEventId] = useState("dev-variable-cache-1");
  const [pointsAmount, setPointsAmount] = useState("12");
  const [viewport, setViewport] = useState<375 | 390 | 414>(390);
  const [cardReward, setCardReward] = useState<RewardPresentationModel | null>(null);
  const [queueStats, setQueueStats] = useState({ before: 0, after: 0, accepted: 0, deduplicated: 0 });
  const queue = useRewardPopupBusSnapshot();
  const lastLog = eventLog[eventLog.length - 1];

  function preview(previewState: RewardsPreviewKind) {
    const result = onPreview(previewState);
    setPreviewAudit(result && typeof result === "object" && "message" in result ? result.message : "No mutation detected");
  }

  function enqueueInspectable(event: RewardPopupEvent) {
    const before = getRewardPopupBusSnapshot().queue.length;
    const accepted = enqueueRewardPopup(event);
    const after = getRewardPopupBusSnapshot().queue.length;
    setQueueStats((current) => ({ before, after, accepted: current.accepted + (accepted ? 1 : 0), deduplicated: current.deduplicated + (accepted ? 0 : 1) }));
  }

  function queueReward(id: string, rewardType: string): RewardPopupEvent {
    return { id, kind: "reward_popup", preview: true, title: rewardType, description: "Queue preview only.", createdAt: new Date().toISOString(), variant: "A", rewardType, amount: 1, rarity: "common" };
  }

  const variableReward = syntheticGrant(variableType, Math.max(1, Number(variableAmount) || 1), variableName || "Reward", variableDescription || "Added to your account", variableRarity, variableEventId || "dev-variable-cache");
  async function executeVariableReward() {
    if (!onExecuteVariableReward) return;
    const persistedReward = await onExecuteVariableReward({ rewardType: variableType, amount: Math.max(1, Number(variableAmount) || 1), displayName: variableName || "Reward", description: variableDescription || "Added to your account", rarity: variableRarity, eventId: variableEventId || "dev-variable-cache" });
    if (persistedReward) setCardReward(persistedReward);
  }
  const previewButtons: Array<[string, RewardsPreviewKind]> = [
    ["Repertoire Points", previewReward("unlock_points", 12, "preview-points")],
    ["Opening Fragment", previewReward("opening_fragment", 1, "preview-fragment")],
    ["Choice Token", previewReward("choice_token", 1, "preview-token")],
    ["Epic Bonus", { kind: "reward", title: "Epic Bonus", rarity: "epic", rewardType: "unlock_points", amount: 50, description: "Epic bonus added to your balance" }],
    ["Unknown future reward fallback", previewReward("future_reward", 3, "preview-future")],
  ];
  const ringPreviews: Array<[string, RewardsPreviewKind]> = [
    ["Daily Tempo complete", { kind: "streak", title: "Daily Tempo complete", variant: "A", description: "Tempo ring preview." }],
    ["Daily Battery complete", { kind: "streak", title: "Daily Battery complete", variant: "A", description: "Battery ring preview." }],
    ["Daily Blundr complete", { kind: "streak", title: "Daily Blundr complete", variant: "A", description: "Daily Blundr ring preview." }],
    ["All rings complete", { kind: "streak", title: "All rings complete", variant: "B", description: "All three daily rings preview." }],
    ["Streak milestone", { kind: "streak", title: "Streak milestone", variant: "B", description: "Streak milestone preview." }],
    ["Opening unlocked", { kind: "unlock_success", title: "Opening unlocked", openingId: selectedOpeningId ?? "preview-opening", openingName: selectedOpeningId ?? "Preview opening", methodLabel: "Repertoire Points", before: { points: 50, fragments: 3, tokens: 1 }, after: { points: 25, fragments: 3, tokens: 1 }, description: "Preview only." }],
    ["Authentication failure", { kind: "failure", title: "Authentication required", code: "auth_required", message: "Sign in before running a real transaction." }],
    ["Shared synchronization failure", { kind: "failure", title: "Shared synchronization failed", code: "shared_sync_failed", message: "No local success is shown." }],
    ["Generic persistence failure", { kind: "failure", title: "Reward persistence failed", code: "persistence_failed", message: "Retry is safe when persistence is unavailable." }],
  ];

  return <div className="space-y-8" data-validation-console="rewards">
    {section("1. Current Reward State", "Current authenticated reward state", <BlundrCard className="grid gap-3 text-sm sm:grid-cols-2"><div>Storage mode: <strong>{snapshot.profile ? "active" : "loading"}</strong></div><div>Mode: <strong>{mode === "local_demo" ? "local demo" : "authenticated shared"}</strong></div><div>Authenticated user: <code>{snapshot.userId.slice(0, 10)}{snapshot.userId.length > 10 ? "…" : ""}</code></div><div>Repertoire Points: <strong>{snapshot.repertoire.availablePoints}</strong></div><div>Opening Fragments: <strong>{snapshot.rewardInventory.openingFragments}</strong></div><div>Choice Tokens: <strong>{snapshot.rewardInventory.choiceTokens}</strong></div><div>Daily Tempo: <strong>{snapshot.daily.tempo.current}/{snapshot.daily.tempo.target}</strong></div><div>Daily Battery: <strong>{snapshot.daily.battery.current}/{snapshot.daily.battery.target}</strong></div><div>Daily Blundr: <strong>{snapshot.daily.blundr.current}/{snapshot.daily.blundr.target}</strong></div><div>Tempo Cache: <strong>{snapshot.tempoCacheState}</strong></div><div>Streak: <strong>{snapshot.streak?.currentStreak ?? 0}</strong></div><div>Last event: <code>{lastLog?.id ?? "none"}</code></div><div>Last transaction: <strong>{lastLog?.success ? "success" : lastLog ? "failure" : "none"}</strong></div><div>Last sync: <strong>{lastLog?.storageUpdated ?? "none"}</strong></div><div>Recent history: <strong>{snapshot.rewardHistory.appliedRewardIds.length}</strong></div><div>Popup queue: <strong>{queue.queue.length}</strong> · active <code>{queue.active?.id ?? "none"}</code> · type <strong>{queue.active?.kind ?? "none"}</strong></div><div className="sm:col-span-2"><BlundrButton size="sm" variant="secondary" onClick={onRefresh}>Refresh current state</BlundrButton></div>{stateExtras}</BlundrCard>)}

    {section("2. Presentation-Only Previews", "Presentation preview only — no reward granted", <BlundrCard className="space-y-3"><div className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">Presentation preview only — no reward granted</div><div className="flex flex-wrap gap-2">{previewButtons.map(([label, value]) => button(label, () => preview(value)))}{ringPreviews.map(([label, value]) => button(label, () => preview(value)))}</div><div className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-900" data-preview-audit={previewAudit}>{previewAudit}</div></BlundrCard>)}

    {section("3. Real Authenticated Transactions", "Canonical authenticated transaction services", <BlundrCard className="space-y-3"><label className="grid max-w-xs gap-1 text-sm font-semibold">Repertoire Points amount<input value={pointsAmount} onChange={(event) => setPointsAmount(event.target.value)} inputMode="numeric" className="min-h-11 rounded-xl border border-stone-200 px-2" /></label><div className="grid gap-2 sm:grid-cols-2">{button(`Grant ${pointsAmount || "configured"} Repertoire Points`, () => onTrigger("grant_small_points", { points: Number(pointsAmount) }), "primary")}{button("Grant Opening Fragment", () => onTrigger("grant_opening_fragment"))}{button("Grant Choice Token", () => onTrigger("grant_choice_token"))}{button(`Grant ${pointsAmount || "configured"} Epic Bonus`, () => onTrigger("grant_epic_bonus", { points: Number(pointsAmount) }), "premium")}{button("Trigger eligible Tempo Cache", () => onTrigger("all_rings_celebration"), "primary")}{button("Complete all three rings", () => onTrigger("all_rings_celebration"), "primary")}{button("Replay most recent event ID", () => onTrigger("replay_last_event"))}{button("Submit same event ID twice", () => onTrigger("duplicate_event_test"))}{button("Submit two event IDs rapidly", () => onTrigger("rapid_reward_test"))}{button("Reload shared inventory", onRefresh)}{button("Reload reward history", onRefresh)}</div><div className="rounded-xl bg-stone-50 p-3 text-xs text-stone-700">Results are recorded with event ID, trigger, auth resolution, applied/duplicate state, persistence, history, popup publication, and error details in the event log.</div>{transactionExtras}</BlundrCard>)}

    {section("4. Variable Tempo Cache Tests", "Preview and execute variable reward records", <BlundrCard className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-sm font-semibold">Reward type<select value={variableType} onChange={(event) => { if (isVariableType(event.target.value)) setVariableType(event.target.value); }} className="min-h-11 rounded-xl border border-stone-200 bg-white px-2"><option value="unlock_points">Repertoire Points</option><option value="opening_fragment">Opening Fragment</option><option value="choice_token">Choice Token</option><option value="future_reward">Unknown future reward</option></select></label><label className="grid gap-1 text-sm font-semibold">Amount<input value={variableAmount} onChange={(event) => setVariableAmount(event.target.value)} inputMode="numeric" className="min-h-11 rounded-xl border border-stone-200 px-2" /></label><label className="grid gap-1 text-sm font-semibold">Display name<input value={variableName} onChange={(event) => setVariableName(event.target.value)} className="min-h-11 rounded-xl border border-stone-200 px-2" /></label><label className="grid gap-1 text-sm font-semibold">Description<input value={variableDescription} onChange={(event) => setVariableDescription(event.target.value)} className="min-h-11 rounded-xl border border-stone-200 px-2" /></label><label className="grid gap-1 text-sm font-semibold">Rarity<select value={variableRarity} onChange={(event) => { if (isRewardRarity(event.target.value)) setVariableRarity(event.target.value); }} className="min-h-11 rounded-xl border border-stone-200 bg-white px-2"><option>common</option><option>uncommon</option><option>rare</option><option>epic</option></select></label><label className="grid gap-1 text-sm font-semibold">Event ID<input value={variableEventId} onChange={(event) => setVariableEventId(event.target.value)} className="min-h-11 rounded-xl border border-stone-200 px-2 font-mono text-xs" /></label></div><div className="flex flex-wrap gap-2">{button("Preview card", () => setCardReward(variableReward), "secondary")}{button("Execute eligible transaction", () => void executeVariableReward(), "primary")} {([375, 390, 414] as const).map((size) => <BlundrButton key={size} size="sm" variant={viewport === size ? "premium" : "ghost"} onClick={() => setViewport(size)}>{size}px</BlundrButton>)}</div>{cardReward ? <div className="mx-auto overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 p-2" style={{ width: viewport }}><div className="mx-auto max-w-full"><TempoCacheDeckPopup reward={cardReward} reducedMotion={false} onDismiss={() => setCardReward(null)} /></div></div> : null}</BlundrCard>)}

    {section("5. Queue and Idempotency", "Inspect deterministic queue behavior", <BlundrCard className="space-y-3"><div className="flex flex-wrap gap-2">{button("Enqueue three previews rapidly", () => { enqueueInspectable(queueReward("queue-points", "Repertoire Points")); enqueueInspectable(queueReward("queue-fragment", "Opening Fragment")); enqueueInspectable(queueReward("queue-token", "Choice Token")); })}{button("Points → fragment → token", () => { enqueueInspectable(queueReward("ordered-points", "Repertoire Points")); enqueueInspectable(queueReward("ordered-fragment", "Opening Fragment")); enqueueInspectable(queueReward("ordered-token", "Choice Token")); })}{button("Enqueue failure before success", () => enqueueInspectable({ id: "queue-failure", kind: "failure", preview: true, title: "Queue failure", code: "shared_sync_failed", message: "Failure priority test.", createdAt: new Date().toISOString() }))}{button("Duplicate event ID", () => { enqueueInspectable(queueReward("duplicate-event", "Repertoire Points")); enqueueInspectable(queueReward("duplicate-event", "Repertoire Points")); })}{button("Identical content, different IDs", () => { enqueueInspectable(queueReward("same-content-a", "Repertoire Points")); enqueueInspectable(queueReward("same-content-b", "Repertoire Points")); })}{button("Dismiss current popup", () => dismissRewardPopup())}{button("Dismiss every queued preview", () => { while (getRewardPopupBusSnapshot().active) dismissRewardPopup(); })}{button("Clear preview-only events", () => clearRewardPopupQueue(), "ghost")}</div><div className="grid gap-2 text-xs sm:grid-cols-2"><pre className="overflow-auto rounded-xl bg-stone-950 p-3 text-white">Queue: {queue.queue.map((event) => event.id).join(" → ") || "empty"}{`\n`}Before {queueStats.before} · after {queueStats.after}{`\n`}Accepted {queueStats.accepted} · deduplicated {queueStats.deduplicated}</pre><pre className="overflow-auto rounded-xl bg-stone-950 p-3 text-white">Consumed: {queue.consumedIds.join(", ") || "none"}{`\n`}Active: {queue.active?.id ?? "none"}{`\n`}Priority: {queue.queue.map((event) => event.priority ?? event.kind).join(" → ") || "empty"}</pre></div></BlundrCard>)}

    {section("6. Failure Simulation", "Development-only failure adapters", <BlundrCard className="space-y-3"><div className="flex flex-wrap gap-2">{["auth_required", "shared_sync_failed", "network_failure", "persistence_failure", "malformed_reward", "missing_metadata", "duplicate_transaction", "invalid_opening_selection", "insufficient_points", "insufficient_fragments", "missing_choice_token", "history_write_failure", "popup_render_fallback"].map((code) => button(code, () => preview({ kind: "failure", title: "Failure simulation", code, message: "Simulation is presentation-only; no reward state was changed." }), "secondary"))}</div><div className="rounded-xl bg-red-50 p-3 text-sm text-red-900">State mutated: no · success history: no · success popup: no · failure popup: yes · retry: where supported by the transaction service.</div></BlundrCard>)}

    {section("7. Opening Unlock Validation", "Selected-opening resource validation", <BlundrCard className="space-y-3"><label className="grid gap-1 text-sm font-semibold">Selected opening<select value={selectedOpeningId ?? ""} onChange={(event) => onSelectOpening(event.target.value)} className="min-h-11 rounded-xl border border-stone-200 bg-white px-2"><option value="">No opening selected</option>{lockedOpeningIds.map((id) => <option key={id} value={id}>{id}</option>)}</select></label><div className="flex flex-wrap gap-2">{button("Unlock with Repertoire Points", () => onTrigger("unlock_next_opening_with_points"), "primary")}{button("Unlock with 3 Opening Fragments", () => onTrigger("spend_3_fragments"), "primary")}{button("Unlock with 1 Choice Token", () => onTrigger("spend_choice_token"), "primary")}{button("Insufficient points", () => onTrigger("unlock_next_opening_with_points"))}{button("Attempt without selection", () => onSelectOpening(""))}{button("Already-unlocked opening", () => onTrigger("spend_choice_token"))}</div><div className="text-xs text-stone-600">Selected opening ID, method, before/after resources, exact deduction, sync, and popup publication are recorded in the event log. Automatic selection/unlock is not used.</div></BlundrCard>)}

    {section("8. Daily Rings and Tempo Cache", "Daily completion and one-cache-per-date validation", <BlundrCard className="space-y-3"><div className="flex flex-wrap gap-2">{button("Complete Daily Tempo", () => onTrigger("tempo_complete"), "primary")}{button("Complete Daily Battery", () => onTrigger("battery_complete"), "primary")}{button("Complete Daily Blundr", () => onTrigger("blundr_complete"), "primary")}{button("Complete all three", () => onTrigger("all_rings_celebration"), "premium")}{button("Replay ring event", () => onTrigger("replay_last_event"))}{button("Replay all-rings same date", () => onTrigger("all_rings_celebration"))}{button("Refresh daily-ring state", onRefresh)}{button("Refresh Tempo Cache state", onRefresh)}</div><div className="grid gap-2 text-sm sm:grid-cols-2"><div>Local date: <code>{snapshot.daily.localDate}</code></div><div>All rings complete: <strong>{snapshot.daily.allComplete ? "yes" : "no"}</strong></div><div>Cache state: <strong>{snapshot.tempoCacheState}</strong></div><div>Cache grants in history: <strong>{snapshot.rewardHistory.appliedRewardIds.length}</strong></div></div>{dailyExtras}</BlundrCard>)}
  </div>;
}
