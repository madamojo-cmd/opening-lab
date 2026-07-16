import type { DailySessionState } from "./core/dailyActivityTypes";
import type { CardFingerprint } from "@/lib/blundr/contracts";

export type ProductionDailyPublicCard = {
  cardFingerprint: CardFingerprint;
  positionKey: string;
  activityId: string;
  title: string;
  prompt: string;
  positionFen: string;
  openingId: string;
  side: "white" | "black";
  why: string;
};

export type ProductionDailyPrivateCard = ProductionDailyPublicCard & {
  acceptedMoves: readonly string[];
  explanation: string;
};

export type ProductionDailySession = {
  sessionId: string;
  deckId: string;
  userId: string;
  dateKey: string;
  state: DailySessionState;
  publicCards: readonly ProductionDailyPublicCard[];
  privateCards: readonly ProductionDailyPrivateCard[];
  version: number;
  completedAt: string | null;
};

export type ProductionDailyPublicSession = Omit<
  ProductionDailySession,
  "userId" | "privateCards" | "state"
> & {
  state: {
    currentIndex: number;
    completedCardIds: readonly string[];
    revealedCardIds: readonly string[];
  };
};
