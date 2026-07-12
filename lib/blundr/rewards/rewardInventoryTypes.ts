export type RewardInventoryEventKind =
  | "opening_fragment_grant"
  | "opening_fragment_spend"
  | "choice_token_grant"
  | "choice_token_spend"
  | "inventory_reset";

export type RewardInventoryEventResult = "applied" | "duplicate" | "rejected" | "noop";

export type RewardInventoryCounts = {
  openingFragments: number;
  choiceTokens: number;
};

export type RewardInventoryEvent = {
  id: string;
  kind: RewardInventoryEventKind;
  userId: string;
  sourceEventId?: string;
  openingId?: string;
  quantity: number;
  before: RewardInventoryCounts;
  after: RewardInventoryCounts;
  result: RewardInventoryEventResult;
  message?: string;
  createdAt: string;
};

export type RewardInventorySnapshot = {
  userId: string;
  openingFragments: number;
  choiceTokens: number;
  appliedEventIds: string[];
  events: RewardInventoryEvent[];
  updatedAt: string;
};

export type RewardInventoryView = RewardInventorySnapshot & {
  availableFragmentUnlockCredits: number;
};

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((entry) => normalizeText(entry)).filter(Boolean)));
}

function normalizeCounts(raw: unknown): RewardInventoryCounts {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { openingFragments: 0, choiceTokens: 0 };
  }
  const input = raw as Record<string, unknown>;
  return {
    openingFragments: Math.max(0, Math.floor(Number(input.openingFragments) || 0)),
    choiceTokens: Math.max(0, Math.floor(Number(input.choiceTokens) || 0)),
  };
}

export function createDefaultRewardInventory(userId: string, now = nowIso()): RewardInventorySnapshot {
  return {
    userId: normalizeText(userId),
    openingFragments: 0,
    choiceTokens: 0,
    appliedEventIds: [],
    events: [],
    updatedAt: now,
  };
}

export function normalizeRewardInventoryEvent(raw: unknown): RewardInventoryEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Partial<RewardInventoryEvent> & Record<string, unknown>;
  const id = normalizeText(input.id);
  const kind =
    input.kind === "opening_fragment_grant" ||
    input.kind === "opening_fragment_spend" ||
    input.kind === "choice_token_grant" ||
    input.kind === "choice_token_spend" ||
    input.kind === "inventory_reset"
      ? input.kind
      : null;
  const userId = normalizeText(input.userId);
  if (!id || !kind || !userId) return null;
  const before = normalizeCounts(input.before);
  const after = normalizeCounts(input.after);
  return {
    id,
    kind,
    userId,
    sourceEventId: normalizeText(input.sourceEventId) || undefined,
    openingId: normalizeText(input.openingId) || undefined,
    quantity: Math.max(0, Math.floor(Number(input.quantity) || 0)),
    before,
    after,
    result:
      input.result === "applied" || input.result === "duplicate" || input.result === "rejected" || input.result === "noop"
        ? input.result
        : "applied",
    message: normalizeText(input.message) || undefined,
    createdAt: normalizeText(input.createdAt) || nowIso(),
  };
}

export function normalizeRewardInventory(raw: unknown): RewardInventorySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Partial<RewardInventorySnapshot> & Record<string, unknown>;
  const userId = normalizeText(input.userId);
  if (!userId) return null;
  const base = createDefaultRewardInventory(userId, normalizeText(input.updatedAt) || nowIso());
  const events = Array.isArray(input.events)
    ? input.events
        .map((entry) => normalizeRewardInventoryEvent(entry))
        .filter((entry): entry is RewardInventoryEvent => Boolean(entry))
        .sort((a, b) => {
          const aTime = Date.parse(a.createdAt);
          const bTime = Date.parse(b.createdAt);
          if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return aTime - bTime;
          if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt);
          return a.id.localeCompare(b.id);
        })
    : [];
  return {
    ...base,
    openingFragments: Math.max(0, Math.floor(Number(input.openingFragments) || 0)),
    choiceTokens: Math.max(0, Math.floor(Number(input.choiceTokens) || 0)),
    appliedEventIds: uniqueStrings(Array.isArray(input.appliedEventIds) ? input.appliedEventIds : []),
    events,
    updatedAt: normalizeText(input.updatedAt) || base.updatedAt,
  };
}

export function withRewardInventoryEvent(
  inventory: RewardInventorySnapshot,
  event: RewardInventoryEvent,
): RewardInventorySnapshot {
  const normalizedEvent = normalizeRewardInventoryEvent(event);
  if (!normalizedEvent) return inventory;
  const normalized = {
    ...createDefaultRewardInventory(inventory.userId, inventory.updatedAt),
    ...inventory,
    appliedEventIds: uniqueStrings(inventory.appliedEventIds ?? []),
  };
  const nextEvents = [...(normalized.events ?? []).filter((entry) => entry.id !== normalizedEvent.id), normalizedEvent];
  return {
    ...normalized,
    appliedEventIds: uniqueStrings([...normalized.appliedEventIds, normalizedEvent.id]),
    events: nextEvents,
    openingFragments: Math.max(0, Math.floor(normalizedEvent.after.openingFragments)),
    choiceTokens: Math.max(0, Math.floor(normalizedEvent.after.choiceTokens)),
    updatedAt: normalizedEvent.createdAt,
  };
}

export function trimRewardInventoryEvents(events: readonly RewardInventoryEvent[], limit = 100): RewardInventoryEvent[] {
  return [...events]
    .sort((a, b) => {
      const aTime = Date.parse(a.createdAt);
      const bTime = Date.parse(b.createdAt);
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return aTime - bTime;
      if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt);
      return a.id.localeCompare(b.id);
    })
    .slice(-Math.max(1, Math.floor(limit) || 100));
}

export function buildRewardInventoryView(snapshot: RewardInventorySnapshot): RewardInventoryView {
  return {
    ...snapshot,
    availableFragmentUnlockCredits: Math.floor(Math.max(0, Number(snapshot.openingFragments) || 0) / 3),
  };
}
