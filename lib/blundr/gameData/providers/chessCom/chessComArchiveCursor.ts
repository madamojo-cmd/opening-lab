export type ChessComArchiveCursor = {
  months: readonly string[];
  index: number;
  etag: string | null;
  lastModified: string | null;
};

export function boundedArchiveMonths(
  from: Date,
  to: Date,
  maxMonths = 13,
): string[] {
  const result: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1),
  );
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));
  while (cursor <= end && result.length < maxMonths) {
    result.push(
      `${cursor.getUTCFullYear()}/${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`,
    );
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return result;
}

export function nextArchiveCursor(
  cursor: ChessComArchiveCursor,
): ChessComArchiveCursor {
  return { ...cursor, index: Math.min(cursor.months.length, cursor.index + 1) };
}
