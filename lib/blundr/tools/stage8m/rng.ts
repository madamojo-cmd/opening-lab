import type { SeededRng } from './types';

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function createSeededRng(seed: string): SeededRng {
  let state = hash(seed) || 0x9e3779b9;
  const rng = (() => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as SeededRng;
  rng.int = (max) => Math.floor(rng() * max);
  rng.pick = <T>(values: readonly T[]) => { if (!values.length) throw new Error('Cannot pick from an empty list'); return values[rng.int(values.length)]; };
  rng.shuffle = <T>(values: readonly T[]) => { const out = [...values]; for (let i = out.length - 1; i > 0; i -= 1) { const j = rng.int(i + 1); [out[i], out[j]] = [out[j], out[i]]; } return out; };
  rng.fork = (label) => createSeededRng(`${seed}:${label}`);
  return rng;
}

export function stableId(parts: string[]): string {
  return hash(parts.join('|')).toString(16).padStart(8, '0');
}
