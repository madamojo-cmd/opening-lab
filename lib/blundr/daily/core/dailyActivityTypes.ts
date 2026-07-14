import type {
  DailyActivityDefinition,
  DailyCardIdentity,
  DailyPresentationModel,
  DailyReducerResult,
  DailyResumableStateEnvelope,
  DeckFingerprint,
  SessionId,
} from "@/lib/blundr/contracts";

export type DailyActivityContext = {
  userId: string;
  dateKey: string;
  now: string;
  access: (openingId: string, side: "white" | "black") => boolean;
};
export type DailyDeckCard = DailyCardIdentity & {
  title: string;
  prompt: string;
  positionFen: string;
  openingId: string | null;
  side: "white" | "black" | "unknown";
};
export type DailyDeck = {
  sessionId: SessionId;
  dateKey: string;
  cards: DailyDeckCard[];
  deckFingerprint: DeckFingerprint;
};
export type DailyAttempt = {
  attemptId: string;
  card: DailyCardIdentity;
  submittedAt: string;
  outcome: "correct" | "incorrect" | "reveal" | "retry";
  scored: boolean;
  feedback: string | null;
};
export type DailySessionState = {
  deck: DailyDeck;
  attempts: DailyAttempt[];
  currentIndex: number;
  revealedCardIds: string[];
  firstAttemptIds: string[];
  status: "in_progress" | "completed";
};
export type DailyReducerOutput = {
  result: DailyReducerResult;
  state: DailySessionState;
  presentation: DailyPresentationModel;
};
export type DailyRegistry = ReadonlyMap<string, DailyActivityDefinition>;
export type DailyStateEnvelope = DailyResumableStateEnvelope<DailySessionState>;
