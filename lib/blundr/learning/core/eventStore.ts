import type { EventId, LearningEventV2 } from "@/lib/blundr/contracts";
import { validateLearningEvent } from "./learningEventValidator";

export type EventAppendResult = {
  status: "inserted" | "duplicate" | "rejected";
  event: LearningEventV2 | null;
  errors?: string[];
};
export type LearningEventRepository = {
  append(event: LearningEventV2): EventAppendResult;
  list(userId: string): readonly LearningEventV2[];
  markDeleted(userId: string, eventId: EventId, deletedAt: string): boolean;
};

export class InMemoryLearningEventStore implements LearningEventRepository {
  private readonly events = new Map<string, LearningEventV2>();

  append(event: LearningEventV2): EventAppendResult {
    const validation = validateLearningEvent(event);
    if (validation.valid === false)
      return { status: "rejected", event: null, errors: validation.errors };
    const existing = [...this.events.values()].find(
      (candidate) =>
        candidate.userId === event.userId &&
        candidate.idempotencyKey === event.idempotencyKey,
    );
    if (existing) return { status: "duplicate", event: existing };
    this.events.set(`${event.userId}:${event.eventId}`, event);
    return { status: "inserted", event };
  }

  list(userId: string): readonly LearningEventV2[] {
    return [...this.events.values()]
      .filter((event) => event.userId === userId && event.deletedAt === null)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }

  markDeleted(userId: string, eventId: EventId, deletedAt: string): boolean {
    const key = `${userId}:${eventId}`;
    const event = this.events.get(key);
    if (!event) return false;
    this.events.set(key, { ...event, deletedAt });
    return true;
  }
}
