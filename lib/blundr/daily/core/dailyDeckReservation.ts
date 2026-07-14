import type { SessionId } from "@/lib/blundr/contracts";
import type { DailyDeck } from "./dailyActivityTypes";

export type DailyDeckReservation = {
  reservationId: string;
  userId: string;
  dateKey: string;
  sessionId: SessionId;
  deck: DailyDeck;
  reservedAt: string;
};
export class InMemoryDailyDeckReservation {
  private readonly reservations = new Map<string, DailyDeckReservation>();
  reserve(input: {
    userId: string;
    dateKey: string;
    deck: DailyDeck;
    now: string;
  }): { created: boolean; reservation: DailyDeckReservation } {
    const key = `${input.userId}:${input.dateKey}`;
    const existing = this.reservations.get(key);
    if (existing) return { created: false, reservation: existing };
    const reservation = {
      reservationId: `reservation-${input.userId}-${input.dateKey}`,
      userId: input.userId,
      dateKey: input.dateKey,
      sessionId: input.deck.sessionId,
      deck: input.deck,
      reservedAt: input.now,
    };
    this.reservations.set(key, reservation);
    return { created: true, reservation };
  }
}
