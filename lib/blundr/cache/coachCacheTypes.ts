export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  version: string;
}

export interface CoachCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  invalidate(predicate?: (entry: CacheEntry<T>) => boolean): void;
  stats(): { size: number; hits: number; misses: number; version: string };
}

export function createCoachCache<T>(version: string): CoachCache<T> {
  const store = new Map<string, CacheEntry<T>>();
  let hits = 0;
  let misses = 0;
  return {
    get(key) {
      const entry = store.get(key);
      if (!entry || entry.version !== version) {
        misses += 1;
        return undefined;
      }
      hits += 1;
      return entry.value;
    },
    set(key, value) {
      store.set(key, { key, value, createdAt: Date.now(), version });
    },
    invalidate(predicate) {
      if (!predicate) {
        store.clear();
        return;
      }
      for (const entry of store.values()) {
        if (predicate(entry)) store.delete(entry.key);
      }
    },
    stats() {
      return { size: store.size, hits, misses, version };
    },
  };
}
