export type LearningEventType =
  | "position_loaded"
  | "move_attempted"
  | "move_correct"
  | "move_incorrect"
  | "cue_revealed"
  | "trainer_view_changed"
  | "move_quality_checked"
  | "teaching_cue_compiled";

export type LearningEventSource = "train" | "review" | "debug";

export type LearningEvent = {
  id: string;
  type: LearningEventType;
  source: LearningEventSource;
  createdAt: string;

  sessionId: string;
  userId?: string;

  fen?: string;
  openingId?: string;
  openingName?: string;
  patternId?: string;
  concept?: string;

  trainerView?: "assisted" | "plain";
  trainingMode?: "restricted" | "continuation";

  expectedMoveSan?: string;
  expectedMoveUci?: string;
  playedMoveSan?: string;
  playedMoveUci?: string;
  correct?: boolean;

  moveQualityStatus?: string;
  moveQualityUserStatus?: "idle" | "checking" | "verified" | "needs_review" | "not_verified";

  timeToMoveMs?: number;

  metadata?: Record<string, string | number | boolean | null | undefined>;
};

const LOCAL_KEY = "blundr.learningEvents.v1";
const LOCAL_LEARNING_EVENT_LIMIT = 500;

const memoryStore: LearningEvent[] = [];

function randomSegment(size = 8) {
  return Math.random().toString(36).slice(2, 2 + size);
}

function readLocalEvents(): LearningEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LearningEvent[]) : [];
  } catch {
    return [];
  }
}

function writeLocalEvents(events: LearningEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(events.slice(-LOCAL_LEARNING_EVENT_LIMIT)));
  } catch {
    // local storage is optional for this MVP foundation
  }
}

export function createLearningSessionId(): string {
  return `learn-s-${Date.now().toString(36)}-${randomSegment(10)}`;
}

export function createLearningEventId(): string {
  return `learn-e-${Date.now().toString(36)}-${randomSegment(10)}`;
}

export function recordLearningEvent(event: Omit<LearningEvent, "id" | "createdAt">): LearningEvent {
  const full: LearningEvent = {
    ...event,
    id: createLearningEventId(),
    createdAt: new Date().toISOString(),
  };

  memoryStore.push(full);
  if (memoryStore.length > LOCAL_LEARNING_EVENT_LIMIT) {
    memoryStore.splice(0, memoryStore.length - LOCAL_LEARNING_EVENT_LIMIT);
  }

  const merged = [...readLocalEvents(), full].slice(-LOCAL_LEARNING_EVENT_LIMIT);
  writeLocalEvents(merged);

  return full;
}

export function getLocalLearningEvents(): LearningEvent[] {
  const local = readLocalEvents();
  if (local.length) return local;
  return memoryStore.slice();
}

export function clearLocalLearningEvents(): void {
  memoryStore.splice(0, memoryStore.length);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LOCAL_KEY);
  } catch {
    // local storage is optional for this MVP foundation
  }
}
