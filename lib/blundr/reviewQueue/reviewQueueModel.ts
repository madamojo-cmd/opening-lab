import type { ReviewQueueItem } from "./reviewQueueTypes";

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export type ReviewQueueQuery = {
  page: number;
  limit: number;
  includeResolved: boolean;
};

export function parseReviewQueueQuery(params: URLSearchParams): ReviewQueueQuery {
  const rawPage = Number(params.get("page") ?? "0");
  const rawLimit = Number(params.get("limit") ?? "25");
  const includeResolved = params.get("includeResolved") === "1";
  return {
    page: clampInt(Number.isFinite(rawPage) ? rawPage : 0, 0, 200),
    limit: clampInt(Number.isFinite(rawLimit) ? rawLimit : 25, 1, 50),
    includeResolved,
  };
}

export function buildReviewQueuePracticeActionHref(
  item: Pick<ReviewQueueItem, "openingId" | "playKey" | "positionKey">,
  extraParams?: Record<string, string | null | undefined>,
): string | null {
  if (!item.openingId || !item.playKey || !item.positionKey) return null;
  const url = new URL("https://local.invalid/train");
  url.searchParams.set("openingId", item.openingId);
  url.searchParams.set("playKey", item.playKey);
  url.searchParams.set("positionKey", item.positionKey);
  url.searchParams.set("from", "review_queue");
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  return `/train?${url.searchParams.toString()}`;
}

export function formatLifecycleLabel(state: string): string {
  switch (state) {
    case "active":
      return "Active";
    case "remediating":
      return "Remediating";
    case "resolved":
      return "Resolved";
    default:
      return "Unclassified";
  }
}
