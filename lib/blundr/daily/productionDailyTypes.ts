import type { DailySessionState } from "./core/dailyActivityTypes";
import type { CardFingerprint } from "@/lib/blundr/contracts";

export type DailyReservationIdentity = {
  composerVersion: string;
  runtimePackageId: string;
  profileVersion: string;
};

export type ProductionDailyTeachingPayload = {
  sourceFen: string;
  moveUci: string;
  moveSan: string;
  resultFen: string;
  from: string;
  to: string;
  promotion: string | null;
  note?: string;
};

export type ProductionDailyPublicOption = {
  id: string;
  label: string;
  moveUci?: string;
};

export type ProductionDailyPublicStep = {
  stepIndex: number;
  positionFen: string;
  prompt: string;
  side: "white" | "black";
  options?: readonly ProductionDailyPublicOption[];
};

export type ProductionDailyPrivateStep = ProductionDailyPublicStep & {
  acceptedMoves: readonly string[];
  acceptedAnswers?: readonly string[];
  explanation: string;
};

export type ProductionDailyPublicCard = {
  cardFingerprint: CardFingerprint;
  positionKey: string;
  activityId: string;
  title: string;
  prompt: string;
  positionFen: string;
  openingId: string;
  playKey: string;
  side: "white" | "black";
  why: string;
  interaction: "move" | "choice";
  options?: readonly ProductionDailyPublicOption[];
  steps?: readonly ProductionDailyPublicStep[];
  teaching?: ProductionDailyTeachingPayload;
};

export type ProductionDailyPrivateCard = ProductionDailyPublicCard & {
  acceptedMoves: readonly string[];
  acceptedAnswers?: readonly string[];
  explanation: string;
  privateSteps?: readonly ProductionDailyPrivateStep[];
};

export type ProductionDailySession = {
  sessionId: string;
  deckId: string;
  userId: string;
  dateKey: string;
  state: DailySessionState;
  publicCards: readonly ProductionDailyPublicCard[];
  privateCards: readonly ProductionDailyPrivateCard[];
  reservationIdentity: DailyReservationIdentity;
  version: number;
  completedAt: string | null;
  updatedAt?: string;
};

export type ProductionDailyPublicSession = Omit<
  ProductionDailySession,
  "userId" | "privateCards" | "state" | "publicCards"
> & {
  publicCards: readonly (ProductionDailyPublicCard & { actionId: string })[];
  state: {
    currentIndex: number;
    completedCardIds: readonly string[];
    revealedCardIds: readonly string[];
    activityProgress?: DailySessionState["activityProgress"];
  };
};
