import {
  parseVersionedContract,
  serializeContract,
  type DailyResumableStateEnvelope,
  type SessionId,
} from "@/lib/blundr/contracts";
import type { DailySessionState } from "./dailyActivityTypes";

export interface DailySessionPersistence {
  load(
    userId: string,
    dateKey: string,
  ): DailyResumableStateEnvelope<DailySessionState> | null;
  save(
    userId: string,
    envelope: DailyResumableStateEnvelope<DailySessionState>,
  ): void;
}
const memory = new Map<string, string>();
function storage(): Storage | null {
  return typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : null;
}
function key(userId: string, dateKey: string): string {
  return `blundr.daily.v2:${userId}:${dateKey}`;
}
export class LocalDailySessionPersistence implements DailySessionPersistence {
  load(
    userId: string,
    dateKey: string,
  ): DailyResumableStateEnvelope<DailySessionState> | null {
    const raw =
      storage()?.getItem(key(userId, dateKey)) ??
      memory.get(key(userId, dateKey));
    if (!raw) return null;
    try {
      return parseVersionedContract<
        DailyResumableStateEnvelope<DailySessionState>
      >(raw);
    } catch {
      return null;
    }
  }
  save(
    userId: string,
    envelope: DailyResumableStateEnvelope<DailySessionState>,
  ): void {
    const raw = serializeContract(envelope);
    memory.set(key(userId, envelope.dateKey), raw);
    storage()?.setItem(key(userId, envelope.dateKey), raw);
  }
}
export function createDailyStateEnvelope(
  sessionId: SessionId,
  dateKey: string,
  state: DailySessionState,
  stateFingerprint: string,
  updatedAt: string,
): DailyResumableStateEnvelope<DailySessionState> {
  return {
    schemaVersion: "2026-07-13.v1",
    sessionId,
    dateKey,
    state,
    stateFingerprint,
    updatedAt,
  };
}
