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

export type RemoteLearningEventReceipt = {
  status: "persisted" | "duplicate" | "not_required" | "signed_out";
  response?: { status?: string; eventId?: string };
};

export type AuthoritativeLearningEventGateResult = {
  status: "accepted" | "in_flight" | "failed" | "already_accepted";
  event: LearningEvent;
  receipt?: RemoteLearningEventReceipt;
};

type PendingAuthoritativeLearningEvent = {
  event: LearningEvent;
  inFlight: Promise<AuthoritativeLearningEventGateResult> | null;
  accepted: boolean;
  receipt?: RemoteLearningEventReceipt;
};

// Trainer actions must not advance their local frame until the authenticated
// event service accepts the exact event identity. This tiny bounded cache also
// lets a retry reuse the original idempotency key after a transport failure.
export class AuthoritativeLearningEventGate {
  private readonly entries = new Map<
    string,
    PendingAuthoritativeLearningEvent
  >();

  constructor(private readonly limit = 64) {}

  async persist(
    key: string,
    createEvent: () => LearningEvent,
    submit: (event: LearningEvent) => Promise<RemoteLearningEventReceipt>,
  ): Promise<AuthoritativeLearningEventGateResult> {
    let entry = this.entries.get(key);
    if (!entry) {
      entry = { event: createEvent(), inFlight: null, accepted: false };
      this.entries.set(key, entry);
      while (this.entries.size > this.limit) {
        const oldest = this.entries.keys().next().value;
        if (!oldest) break;
        this.entries.delete(oldest);
      }
    }
    if (entry.accepted)
      return {
        status: "already_accepted",
        event: entry.event,
        receipt: entry.receipt,
      };
    if (entry.inFlight) return { status: "in_flight", event: entry.event };

    entry.inFlight = (async () => {
      try {
        const receipt = await submit(entry!.event);
        entry!.receipt = receipt;
        if (receipt.status === "persisted" || receipt.status === "duplicate") {
          entry!.accepted = true;
          return { status: "accepted", event: entry!.event, receipt };
        }
        return { status: "failed", event: entry!.event, receipt };
      } catch {
        return { status: "failed", event: entry!.event };
      } finally {
        entry!.inFlight = null;
      }
    })();
    return entry.inFlight;
  }
}

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
): Promise<RemoteLearningEventReceipt> {
  if (!shouldPersistRemoteLearningEvent(event))
    return { status: "not_required" };
  if (typeof window === "undefined") return { status: "not_required" };
  const [{ getOnboardingAuthSession }, { authenticatedApiFetch }] =
    await Promise.all([
      import("../onboarding/onboardingAuth"),
      import("../api/authenticatedApiClient"),
    ]);
  const session = await getOnboardingAuthSession();
  if (!session?.accessToken) return { status: "signed_out" };
  const response = await authenticatedApiFetch<{
    status?: string;
    eventId?: string;
  }>("/api/blundr/learning/events", {
    method: "POST",
    body: JSON.stringify(buildRemoteLearningEventPayload(event)),
  });
  return {
    status: response?.status === "duplicate" ? "duplicate" : "persisted",
    response,
  };
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
