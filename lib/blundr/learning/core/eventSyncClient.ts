import type { LearningEventV2 } from "@/lib/blundr/contracts";
import type { LearningEventRepository } from "./eventStore";

export type EventSyncResult = {
  inserted: number;
  duplicates: number;
  rejected: number;
};

export function replayLearningEventOutbox(
  repository: LearningEventRepository,
  outbox: readonly LearningEventV2[],
): EventSyncResult {
  return outbox.reduce<EventSyncResult>(
    (result, event) => {
      const append = repository.append(event);
      if (append.status === "inserted") result.inserted += 1;
      if (append.status === "duplicate") result.duplicates += 1;
      if (append.status === "rejected") result.rejected += 1;
      return result;
    },
    { inserted: 0, duplicates: 0, rejected: 0 },
  );
}
