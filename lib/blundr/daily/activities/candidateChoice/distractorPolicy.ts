export function chooseDeterministicDistractors<T extends { id: string }>(
  items: readonly T[],
  seed: string,
): T[] {
  return [...items].sort((a, b) =>
    `${seed}:${a.id}`.localeCompare(`${seed}:${b.id}`),
  );
}
