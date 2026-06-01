import type { CoachUtteranceMemoryEntry } from "./coachTypes";

export const COACH_UTTERANCE_MEMORY_KEY = "blundr.coachUtteranceMemory.v1";
export const COACH_UTTERANCE_MEMORY_META_KEY = "blundr.coachUtteranceMemory.meta.v2";
const MAX_ENTRIES = 100;

export interface CoachUtteranceMemoryMeta {
  migratedOrCleared: boolean;
  clearedLegacyCount: number;
  legacyDetected: boolean;
}

export function buildCoachUtteranceRecordKey(input: {
  frameId?: string | number;
  normalizedFen?: string;
  viewMode?: string;
  coachMode?: string;
  coachAction?: string;
  utteranceId?: string;
}): string {
  return [
    String(input.frameId ?? ""),
    input.normalizedFen ?? "",
    input.viewMode ?? "",
    input.coachMode ?? "",
    input.coachAction ?? "",
    input.utteranceId ?? "",
  ].join("|");
}

export function parseCoachUtteranceMemory(raw: string | null | undefined): CoachUtteranceMemoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): CoachUtteranceMemoryEntry | null => {
        if (!item || typeof item !== "object") return null;
        const candidate = item as Partial<CoachUtteranceMemoryEntry>;
        if (!candidate.patternId || !candidate.utteranceId || !candidate.coachMode || !candidate.coachAction) return null;
        return {
          patternId: String(candidate.patternId),
          conceptId: String(candidate.conceptId ?? ""),
          visualRecipeId: String(candidate.visualRecipeId ?? ""),
          coachMode: candidate.coachMode,
          coachAction: candidate.coachAction,
          utteranceId: String(candidate.utteranceId),
          utteranceFamily: String(candidate.utteranceFamily ?? ""),
          text: String(candidate.text ?? ""),
          shownAt: Number(candidate.shownAt ?? 0) || 0,
        };
      })
      .filter((entry): entry is CoachUtteranceMemoryEntry => Boolean(entry))
      .slice(-MAX_ENTRIES);
  } catch {
    return [];
  }
}

function classifyLegacyRecordCount(raw: string | null | undefined): number {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter((item) => typeof item === "string").length;
  } catch {
    return 0;
  }
}

function writeMemoryMeta(storage: Storage | undefined, meta: CoachUtteranceMemoryMeta): void {
  if (!storage) return;
  try {
    storage.setItem(COACH_UTTERANCE_MEMORY_META_KEY, JSON.stringify(meta));
  } catch {
    // ignore storage failures
  }
}

export function readCoachUtteranceMemoryMeta(storage?: Storage): CoachUtteranceMemoryMeta {
  if (!storage) return { migratedOrCleared: false, clearedLegacyCount: 0, legacyDetected: false };
  try {
    const raw = storage.getItem(COACH_UTTERANCE_MEMORY_META_KEY);
    if (!raw) return { migratedOrCleared: false, clearedLegacyCount: 0, legacyDetected: false };
    const parsed = JSON.parse(raw) as Partial<CoachUtteranceMemoryMeta>;
    return {
      migratedOrCleared: Boolean(parsed.migratedOrCleared),
      clearedLegacyCount: Number(parsed.clearedLegacyCount ?? 0) || 0,
      legacyDetected: Boolean(parsed.legacyDetected),
    };
  } catch {
    return { migratedOrCleared: false, clearedLegacyCount: 0, legacyDetected: false };
  }
}

export function loadCoachUtteranceMemory(storage?: Storage): CoachUtteranceMemoryEntry[] {
  if (!storage) return [];
  const raw = storage.getItem(COACH_UTTERANCE_MEMORY_KEY);
  const parsed = parseCoachUtteranceMemory(raw);
  const legacyCount = classifyLegacyRecordCount(raw);
  if (legacyCount > 0) {
    // Quarantine unsafe legacy string records; only structured entries are allowed.
    writeCoachUtteranceMemory(parsed, storage);
    writeMemoryMeta(storage, {
      migratedOrCleared: true,
      clearedLegacyCount: legacyCount,
      legacyDetected: true,
    });
    return parsed;
  }
  if (parsed.length === 0 && raw) {
    writeMemoryMeta(storage, {
      migratedOrCleared: true,
      clearedLegacyCount: 0,
      legacyDetected: true,
    });
  } else {
    writeMemoryMeta(storage, {
      migratedOrCleared: false,
      clearedLegacyCount: 0,
      legacyDetected: false,
    });
  }
  return parsed;
}

export function writeCoachUtteranceMemory(entries: CoachUtteranceMemoryEntry[], storage?: Storage): void {
  if (!storage) return;
  try {
    storage.setItem(COACH_UTTERANCE_MEMORY_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // ignore storage failures
  }
}

export function recordCoachUtterance(entry: CoachUtteranceMemoryEntry, storage?: Storage): CoachUtteranceMemoryEntry[] {
  const existing = loadCoachUtteranceMemory(storage);
  const next = [...existing, entry].slice(-MAX_ENTRIES);
  writeCoachUtteranceMemory(next, storage);
  return next;
}
