export type OpponentChoiceMemory = {
  openingId?: string;
  lineId?: string;
  trainingMode?: "restricted" | "continuation";
  positionKey: string;
  opponentMoveUci: string;
  opponentMoveSan?: string;
  branchKey: string;
  source?: string;
  playedAt: number;
};

export type OpponentVariationContext = {
  openingId?: string;
  lineId?: string;
  trainingMode?: "restricted" | "continuation";
  positionKey: string;
};

const STORAGE_KEY = "blundr.opponentVariationMemory.v1";
const MAX_MEMORY = 80;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParse(raw: string | null): OpponentChoiceMemory[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.positionKey === "string" && typeof item.opponentMoveUci === "string" && typeof item.branchKey === "string")
      .map((item) => ({
        openingId: typeof item.openingId === "string" ? item.openingId : undefined,
        lineId: typeof item.lineId === "string" ? item.lineId : undefined,
        trainingMode: item.trainingMode === "restricted" || item.trainingMode === "continuation" ? item.trainingMode : undefined,
        positionKey: item.positionKey,
        opponentMoveUci: item.opponentMoveUci,
        opponentMoveSan: typeof item.opponentMoveSan === "string" ? item.opponentMoveSan : undefined,
        branchKey: item.branchKey,
        source: typeof item.source === "string" ? item.source : undefined,
        playedAt: typeof item.playedAt === "number" ? item.playedAt : Date.now(),
      }));
  } catch {
    return [];
  }
}

export function loadOpponentVariationMemory(): OpponentChoiceMemory[] {
  if (!canUseStorage()) return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveOpponentVariationMemory(items: OpponentChoiceMemory[]): void {
  if (!canUseStorage()) return;
  try {
    const next = items.slice(-MAX_MEMORY);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

export function recordOpponentChoice(choice: OpponentChoiceMemory): OpponentChoiceMemory[] {
  const memory = loadOpponentVariationMemory();
  const next = [...memory, choice].slice(-MAX_MEMORY);
  saveOpponentVariationMemory(next);
  return next;
}

export function getRecentOpponentChoices(
  context: OpponentVariationContext,
  options: { limit?: number; fromMemory?: OpponentChoiceMemory[] } = {},
): OpponentChoiceMemory[] {
  const limit = Math.max(1, options.limit ?? 10);
  const memory = options.fromMemory ?? loadOpponentVariationMemory();
  return memory
    .filter((item) => {
      if (item.positionKey !== context.positionKey) return false;
      if (context.openingId && item.openingId && item.openingId !== context.openingId) return false;
      if (context.lineId && item.lineId && item.lineId !== context.lineId) return false;
      if (context.trainingMode && item.trainingMode && item.trainingMode !== context.trainingMode) return false;
      return true;
    })
    .sort((a, b) => b.playedAt - a.playedAt)
    .slice(0, limit);
}
