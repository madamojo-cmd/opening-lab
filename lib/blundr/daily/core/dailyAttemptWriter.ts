import type { DailyAttempt } from "./dailyActivityTypes";

export class InMemoryDailyAttemptWriter {
  private readonly attempts = new Map<string, DailyAttempt>();
  write(attempt: DailyAttempt): { inserted: boolean; attempt: DailyAttempt } {
    const existing = this.attempts.get(attempt.attemptId);
    if (existing) return { inserted: false, attempt: existing };
    this.attempts.set(attempt.attemptId, attempt);
    return { inserted: true, attempt };
  }
  list(): readonly DailyAttempt[] {
    return [...this.attempts.values()];
  }
}
