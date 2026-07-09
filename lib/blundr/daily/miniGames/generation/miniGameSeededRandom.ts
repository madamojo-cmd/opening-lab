import { hashString, normalizeText } from "../miniGameUtils";

export type SeededRandom = {
  seed: string;
  next: () => number;
  nextInt: (maxExclusive: number) => number;
  range: (minInclusive: number, maxInclusive: number) => number;
  bool: (probability?: number) => boolean;
  pick: <T>(values: readonly T[]) => T | null;
  sample: <T>(values: readonly T[], count: number) => T[];
  shuffle: <T>(values: readonly T[]) => T[];
  weightedPick: <T>(values: readonly { value: T; weight: number }) => T | null;
  fork: (label: string) => SeededRandom;
};

function seedToState(seed: string | number): number {
  const normalized = normalizeText(seed);
  const hashed = hashString(normalized || String(seed));
  let state = 0;
  for (let index = 0; index < hashed.length; index += 1) {
    state = (state * 33 + hashed.charCodeAt(index)) >>> 0;
  }
  return state || 0x6d2b79f5;
}

function mulberry32(initial: number): () => number {
  let state = initial >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRandom(seed: string | number): SeededRandom {
  const normalized = normalizeText(seed) || String(seed);
  const generator = mulberry32(seedToState(normalized));

  const api: SeededRandom = {
    seed: normalized,
    next: () => generator(),
    nextInt: (maxExclusive: number) => {
      if (!Number.isFinite(maxExclusive) || maxExclusive <= 0) return 0;
      return Math.floor(generator() * maxExclusive);
    },
    range: (minInclusive: number, maxInclusive: number) => {
      const min = Math.ceil(Math.min(minInclusive, maxInclusive));
      const max = Math.floor(Math.max(minInclusive, maxInclusive));
      if (max <= min) return min;
      return min + Math.floor(generator() * (max - min + 1));
    },
    bool: (probability = 0.5) => generator() < Math.max(0, Math.min(1, probability)),
    pick: <T>(values: readonly T[]) => {
      if (!values.length) return null;
      return values[api.nextInt(values.length)] ?? null;
    },
    sample: <T>(values: readonly T[], count: number) => {
      if (count <= 0 || !values.length) return [];
      const shuffled = api.shuffle(values);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    },
    shuffle: <T>(values: readonly T[]) => {
      const list = [...values];
      for (let index = list.length - 1; index > 0; index -= 1) {
        const swapIndex = api.nextInt(index + 1);
        [list[index], list[swapIndex]] = [list[swapIndex] as T, list[index] as T];
      }
      return list;
    },
    weightedPick: <T>(values: readonly { value: T; weight: number }) => {
      const positive = values.filter((entry) => Number.isFinite(entry.weight) && entry.weight > 0);
      const total = positive.reduce((sum, entry) => sum + entry.weight, 0);
      if (!positive.length || total <= 0) return null;
      let cursor = generator() * total;
      for (const entry of positive) {
        cursor -= entry.weight;
        if (cursor <= 0) return entry.value;
      }
      return positive[positive.length - 1]?.value ?? null;
    },
    fork: (label: string) => createSeededRandom(`${normalized}:${label}`),
  };

  return api;
}

export function resolveSeedParts(parts: readonly (string | number | null | undefined)[]): string {
  return parts.map((part) => normalizeText(part)).filter(Boolean).join("|");
}
