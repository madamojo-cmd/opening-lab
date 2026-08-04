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
  moveOrderKey?: string;
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
  moveQualityUserStatus?:
    | "idle"
    | "checking"
    | "verified"
    | "needs_review"
    | "not_verified";

  timeToMoveMs?: number;

  metadata?: Record<string, string | number | boolean | null | undefined>;
};

const LOCAL_KEY = "blundr.learningEvents.v1";
const LOCAL_LEARNING_EVENT_LIMIT = 500;

const memoryStore: LearningEvent[] = [];

function randomSegment(size = 8) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + size);
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
    window.localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify(events.slice(-LOCAL_LEARNING_EVENT_LIMIT)),
    );
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

export function buildRemoteLearningEventPayload(
  event: LearningEvent,
): LearningEvent & {
  eventId: string;
} {
  return { ...event, eventId: event.id };
}

export function shouldPersistRemoteLearningEvent(
  event: Pick<LearningEvent, "type">,
): boolean {
  return (
    event.type === "move_correct" ||
    event.type === "move_incorrect" ||
    event.type === "cue_revealed"
  );
}

export function recordLearningEvent(
  event: Omit<LearningEvent, "id" | "createdAt">,
): LearningEvent {
  const full: LearningEvent = {
    ...event,
    id: createLearningEventId(),
    createdAt: new Date().toISOString(),
  };

  memoryStore.push(full);
  if (memoryStore.length > LOCAL_LEARNING_EVENT_LIMIT) {
    memoryStore.splice(0, memoryStore.length - LOCAL_LEARNING_EVENT_LIMIT);
  }

  const merged = [...readLocalEvents(), full].slice(
    -LOCAL_LEARNING_EVENT_LIMIT,
  );
  writeLocalEvents(merged);

  return full;
}

export async function persistLearningEventRemotely(
  event: LearningEvent,
): Promise<"persisted" | "not_required" | "signed_out"> {
  if (!shouldPersistRemoteLearningEvent(event)) return "not_required";
  if (typeof window === "undefined") return "not_required";
  const [{ getOnboardingAuthSession }, { authenticatedApiFetch }] =
    await Promise.all([
      import("../onboarding/onboardingAuth"),
      import("../api/authenticatedApiClient"),
    ]);
  const session = await getOnboardingAuthSession();
  if (!session?.accessToken) return "signed_out";
  await authenticatedApiFetch("/api/blundr/learning/events", {
    method: "POST",
    body: JSON.stringify(buildRemoteLearningEventPayload(event)),
  });
  return "persisted";
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
