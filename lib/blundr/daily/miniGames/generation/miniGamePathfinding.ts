import type { Square } from "@/lib/blundr/geometry/boardTypes";
import { ALL_SQUARES, coordsToSquare, squareToCoords } from "@/lib/blundr/geometry/lineGeometry";
import { createSeededRandom } from "./miniGameSeededRandom";
import { knightTargets, kingTargets } from "./miniGameBoardGeometry";

function normalizeSquareSet(values: readonly Square[] | undefined): Set<Square> {
  return new Set((values ?? []).map((value) => String(value ?? "").trim().toLowerCase()).filter(Boolean) as Square[]);
}

export function knightDistance(start: Square, target: Square): number {
  if (start === target) return 0;
  const queue: Array<{ square: Square; distance: number }> = [{ square: start, distance: 0 }];
  const seen = new Set<Square>([start]);
  while (queue.length) {
    const current = queue.shift()!;
    for (const next of knightTargets(current.square)) {
      if (seen.has(next)) continue;
      if (next === target) return current.distance + 1;
      seen.add(next);
      queue.push({ square: next, distance: current.distance + 1 });
    }
  }
  return Infinity;
}

export function shortestKnightRoute(start: Square, target: Square, blocked: readonly Square[] = []): Square[] {
  const blockedSet = normalizeSquareSet(blocked);
  const queue: Square[] = [start];
  const parents = new Map<Square, Square | null>([[start, null]]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current === target) break;
    for (const next of knightTargets(current)) {
      if (blockedSet.has(next) && next !== target) continue;
      if (parents.has(next)) continue;
      parents.set(next, current);
      queue.push(next);
    }
  }
  if (!parents.has(target)) return [];
  const route: Square[] = [];
  let cursor: Square | null | undefined = target;
  while (cursor) {
    route.unshift(cursor);
    cursor = parents.get(cursor) ?? null;
  }
  return route;
}

export function kingRoute(start: Square, target: Square, blocked: readonly Square[] = []): Square[] {
  const blockedSet = normalizeSquareSet(blocked);
  const queue: Square[] = [start];
  const parents = new Map<Square, Square | null>([[start, null]]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current === target) break;
    for (const next of kingTargets(current)) {
      if (blockedSet.has(next) && next !== target) continue;
      if (parents.has(next)) continue;
      parents.set(next, current);
      queue.push(next);
    }
  }
  if (!parents.has(target)) return [];
  const route: Square[] = [];
  let cursor: Square | null | undefined = target;
  while (cursor) {
    route.unshift(cursor);
    cursor = parents.get(cursor) ?? null;
  }
  return route;
}

export function chooseKnightRouteTarget(seed: string | number, start: Square, blocked: readonly Square[] = []): Square {
  const rng = createSeededRandom(seed);
  const candidates = ALL_SQUARES.filter((square) => !blocked.includes(square as Square) && square !== start && knightDistance(start, square) <= 3);
  return rng.pick(candidates as Square[]) ?? "e4";
}

export function chooseKingRouteTarget(seed: string | number, start: Square, blocked: readonly Square[] = []): Square {
  const rng = createSeededRandom(seed);
  const candidates = ALL_SQUARES.filter((square) => !blocked.includes(square as Square) && square !== start && kingRoute(start, square, blocked).length > 0 && kingRoute(start, square, blocked).length <= 5);
  return rng.pick(candidates as Square[]) ?? "e4";
}

export function routeImprovement(before: Square, after: Square, target: Square): number {
  return Math.max(0, knightDistance(before, target) - knightDistance(after, target));
}

export function squaresToRoute(scoreSquares: readonly Square[]): Square[] {
  return [...scoreSquares];
}

export function routeLength(route: readonly Square[]): number {
  return Math.max(0, route.length - 1);
}

export function routeFromParents(parents: Map<Square, Square | null>, target: Square): Square[] {
  const route: Square[] = [];
  let cursor: Square | null | undefined = target;
  while (cursor) {
    route.unshift(cursor);
    cursor = parents.get(cursor) ?? null;
  }
  return route;
}
