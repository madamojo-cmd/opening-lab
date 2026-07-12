"use client";

import { useSyncExternalStore } from "react";

import type { RewardPopupEvent } from "./rewardPopupTypes";

type RewardPopupBusSnapshot = Readonly<{
  active: RewardPopupEvent | null;
  queue: readonly RewardPopupEvent[];
  queuedIds: readonly string[];
  consumedIds: readonly string[];
  version: number;
}>;

type Listener = () => void;

const listeners = new Set<Listener>();
let queue: RewardPopupEvent[] = [];
const consumedIds = new Set<string>();
let version = 0;

const EMPTY_SNAPSHOT: RewardPopupBusSnapshot = Object.freeze({
  active: null,
  queue: Object.freeze([] as RewardPopupEvent[]),
  queuedIds: Object.freeze([] as string[]),
  consumedIds: Object.freeze([] as string[]),
  version: 0,
});

let cachedSnapshot: RewardPopupBusSnapshot = EMPTY_SNAPSHOT;

function eventPriority(event: RewardPopupEvent): number {
  if (event.priority !== undefined) return event.priority;
  if (event.kind === "failure") return 1;
  if (event.kind === "unlock_success") return 2;
  if (event.kind === "tempo_cache") return 3;
  if (event.kind === "streak") return 5;
  if (event.kind === "reward_popup") {
    return event.rewardType === "unlock_points" && event.rarity === "common" ? 7 : 6;
  }
  return 8;
}

function normalizeId(value: unknown): string {
  return String(value ?? "").trim();
}

function buildSnapshot(): RewardPopupBusSnapshot {
  const nextQueue = Object.freeze(queue.slice());
  const nextQueuedIds = Object.freeze(nextQueue.map((event) => event.id));
  const nextConsumedIds = Object.freeze(Array.from(consumedIds));
  return Object.freeze({
    active: nextQueue[0] ?? null,
    queue: nextQueue,
    queuedIds: nextQueuedIds,
    consumedIds: nextConsumedIds,
    version,
  });
}

function commitQueueChange(nextQueue: RewardPopupEvent[]): void {
  queue = nextQueue;
  version += 1;
  cachedSnapshot = buildSnapshot();
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function updateQueue(nextQueue: RewardPopupEvent[]): void {
  commitQueueChange(nextQueue);
  emit();
}

export function getRewardPopupBusSnapshot(): RewardPopupBusSnapshot {
  return cachedSnapshot;
}

export function getRewardPopupBusServerSnapshot(): RewardPopupBusSnapshot {
  return EMPTY_SNAPSHOT;
}

export function subscribeRewardPopupBus(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRewardPopupBusSnapshot(): RewardPopupBusSnapshot {
  return useSyncExternalStore(subscribeRewardPopupBus, getRewardPopupBusSnapshot, getRewardPopupBusServerSnapshot);
}

export function enqueueRewardPopup(event: RewardPopupEvent): boolean {
  const id = normalizeId(event.id);
  if (!id) return false;
  if (consumedIds.has(id)) return false;
  if (queue.some((entry) => entry.id === id)) return false;

  let nextQueue = queue;
  if (event.kind === "failure" && event.transactionId) {
    nextQueue = nextQueue.filter((entry) => entry.transactionId !== event.transactionId || entry.kind === "failure");
  }
  const normalizedEvent = { ...event, id };
  const active = nextQueue[0];
  const waiting = nextQueue.slice(active ? 1 : 0);
  const insertionIndex = waiting.findIndex((entry) => eventPriority(normalizedEvent) < eventPriority(entry));
  const orderedWaiting = insertionIndex < 0
    ? [...waiting, normalizedEvent]
    : [...waiting.slice(0, insertionIndex), normalizedEvent, ...waiting.slice(insertionIndex)];
  nextQueue = active ? [active, ...orderedWaiting] : orderedWaiting;
  updateQueue(nextQueue);
  return true;
}

export function dismissRewardPopup(id?: string | null): boolean {
  const normalizedId = normalizeId(id);

  if (!normalizedId) {
    if (queue.length === 0) return false;
    const nextQueue = queue.slice(1);
    const removed = queue[0];
    if (removed) consumedIds.add(removed.id);
    updateQueue(nextQueue);
    return true;
  }

  const index = queue.findIndex((entry) => entry.id === normalizedId);
  if (index < 0) {
    return false;
  }

  const nextQueue = [...queue.slice(0, index), ...queue.slice(index + 1)];
  const removed = queue[index];
  if (removed) consumedIds.add(removed.id);
  updateQueue(nextQueue);
  return true;
}

export function clearRewardPopupQueue(): boolean {
  if (queue.length === 0) return false;
  for (const event of queue) {
    consumedIds.add(event.id);
  }
  updateQueue([]);
  return true;
}

export function resetRewardPopupBusForTests(): void {
  queue = [];
  consumedIds.clear();
  version = 0;
  cachedSnapshot = EMPTY_SNAPSHOT;
  emit();
}

export function getConsumedRewardPopupIds(): readonly string[] {
  return Object.freeze(Array.from(consumedIds));
}
