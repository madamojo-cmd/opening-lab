export type DailyConceptDomain =
  | "pawn_structures"
  | "key_squares"
  | "piece_imbalances"
  | "tactical_ideas"
  | "special_techniques";

export type DailyConceptDifficulty = "intro" | "beginner" | "intermediate" | "advanced" | "expert";

export type DailyConceptTrainingSurface = "recall" | "mini_game" | "training_target" | "future_content_bank";

export type DailyConceptId = `concept:${DailyConceptDomain}:${string}`;

export type DailyConceptExample = {
  label: string;
  fen?: string;
  moveUci?: string;
  note: string;
};

export type DailyConceptDefinition = {
  id: DailyConceptId;
  slug: string;
  domain: DailyConceptDomain;
  displayName: string;
  shortName: string;
  summary: string;
  whyItMatters: string;
  commonMistakes: string[];
  trainedBy: DailyConceptTrainingSurface[];
  relatedConceptIds: DailyConceptId[];
  prerequisiteConceptIds: DailyConceptId[];
  recommendedDifficulty: DailyConceptDifficulty[];
  masteryKey: string;
  tags: string[];
  examples?: readonly DailyConceptExample[];
};

export type DailyConceptDefinitionInput = {
  slug: string;
  displayName: string;
  shortName: string;
  summary: string;
  whyItMatters: string;
  commonMistakes: readonly string[];
  trainedBy?: readonly DailyConceptTrainingSurface[];
  relatedConceptIds?: readonly DailyConceptId[];
  prerequisiteConceptIds?: readonly DailyConceptId[];
  recommendedDifficulty?: readonly DailyConceptDifficulty[];
  tags?: readonly string[];
  examples?: readonly DailyConceptExample[];
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

export function makeDailyConceptId(domain: DailyConceptDomain, slug: string): DailyConceptId {
  return `concept:${domain}:${normalizeText(slug).toLowerCase()}` as DailyConceptId;
}

export function createDailyConceptDefinition(domain: DailyConceptDomain, input: DailyConceptDefinitionInput): DailyConceptDefinition {
  const id = makeDailyConceptId(domain, input.slug);
  const trainedBy = uniqueStrings((input.trainedBy?.length ? input.trainedBy : ["recall", "mini_game", "training_target"]) as readonly string[]) as DailyConceptTrainingSurface[];
  const recommendedDifficulty = uniqueStrings(
    (input.recommendedDifficulty?.length ? input.recommendedDifficulty : ["beginner"]) as readonly string[],
  ) as DailyConceptDifficulty[];

  return {
    id,
    slug: normalizeText(input.slug).toLowerCase(),
    domain,
    displayName: normalizeText(input.displayName),
    shortName: normalizeText(input.shortName),
    summary: normalizeText(input.summary),
    whyItMatters: normalizeText(input.whyItMatters),
    commonMistakes: uniqueStrings(input.commonMistakes),
    trainedBy,
    relatedConceptIds: uniqueStrings((input.relatedConceptIds ?? []) as readonly string[]) as DailyConceptId[],
    prerequisiteConceptIds: uniqueStrings((input.prerequisiteConceptIds ?? []) as readonly string[]) as DailyConceptId[],
    recommendedDifficulty,
    masteryKey: `${id}:mastery`,
    tags: uniqueStrings((input.tags ?? []) as readonly string[]),
    examples: input.examples?.length
      ? input.examples.map((example) => ({
          label: normalizeText(example.label),
          fen: normalizeText(example.fen) || undefined,
          moveUci: normalizeText(example.moveUci) || undefined,
          note: normalizeText(example.note),
        }))
      : undefined,
  };
}

export function buildDailyConceptDefinitions(domain: DailyConceptDomain, entries: readonly DailyConceptDefinitionInput[]): DailyConceptDefinition[] {
  return entries.map((entry, index) => {
    const previous = index > 0 ? makeDailyConceptId(domain, entries[index - 1]?.slug ?? "") : null;
    const next = index + 1 < entries.length ? makeDailyConceptId(domain, entries[index + 1]?.slug ?? "") : null;
    const relatedConceptIds = uniqueStrings([
      ...(entry.relatedConceptIds ?? []),
      ...(previous ? [previous] : []),
      ...(next ? [next] : []),
    ]) as DailyConceptId[];
    const prerequisiteConceptIds = uniqueStrings([
      ...(entry.prerequisiteConceptIds ?? []),
      ...(previous ? [previous] : []),
    ]) as DailyConceptId[];
    return createDailyConceptDefinition(domain, {
      ...entry,
      relatedConceptIds,
      prerequisiteConceptIds,
    });
  });
}
