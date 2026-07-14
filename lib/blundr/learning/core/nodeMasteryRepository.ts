import type { OpeningAccessSnapshot } from "@/lib/blundr/contracts";
import type { LearningEventV2 } from "@/lib/blundr/contracts";
import { reduceNodeMastery } from "./nodeMasteryReducer";
import type { NodeMasteryState } from "./nodeMasteryTypes";

export class InMemoryNodeMasteryRepository {
  private readonly records = new Map<string, NodeMasteryState>();

  apply(
    event: LearningEventV2,
    access: OpeningAccessSnapshot | null,
  ): NodeMasteryState | null {
    if (!event.position) return null;
    const key = `${event.userId}:${event.position.positionKey}`;
    const result = reduceNodeMastery(
      this.records.get(key) ?? null,
      event,
      access,
    );
    if (result.changed) this.records.set(key, result.state);
    return this.records.get(key) ?? null;
  }

  get(userId: string, positionKey: string): NodeMasteryState | null {
    return this.records.get(`${userId}:${positionKey}`) ?? null;
  }
  list(userId: string): readonly NodeMasteryState[] {
    return [...this.records.values()].filter(
      (record) => record.userId === userId,
    );
  }
  rebuild(
    userId: string,
    events: readonly LearningEventV2[],
    accessByPosition: ReadonlyMap<string, OpeningAccessSnapshot>,
  ): void {
    for (const key of [...this.records.keys()])
      if (key.startsWith(`${userId}:`)) this.records.delete(key);
    for (const event of events.filter(
      (candidate) =>
        candidate.userId === userId && candidate.deletedAt === null,
    ))
      this.apply(
        event,
        event.position
          ? (accessByPosition.get(event.position.positionKey) ?? null)
          : null,
      );
  }
}
