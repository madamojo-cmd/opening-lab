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
  item: Pick<ReviewQueueItem, "positionKey">,
): string | null {
  if (!item.positionKey) return null;
  return `/review/mistakes/${encodeURIComponent(item.positionKey)}`;
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
