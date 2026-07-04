function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function getLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function normalizeLocalDateKey(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

export function addLocalDays(dateKey: string, days: number): string | null {
  const normalized = normalizeLocalDateKey(dateKey);
  if (!normalized || !Number.isFinite(days)) return null;
  const [year, month, day] = normalized.split("-").map((part) => Number(part));
  const next = new Date(year, month - 1, day + days);
  return getLocalDateKey(next);
}

export function isConsecutiveLocalDate(previousDateKey: string | null | undefined, currentDateKey: string): boolean {
  const previous = normalizeLocalDateKey(previousDateKey);
  const current = normalizeLocalDateKey(currentDateKey);
  if (!previous || !current) return false;
  return addLocalDays(previous, 1) === current;
}

