export type BookSupportInput = {
  source?: string;
  totalGames?: number;
  moveGames?: number;
  moveShare?: number;
};

export type BookSupportResult = {
  hasBookSupport: boolean;
  confidence: number;
  source: string;
  totalGames: number;
  moveGames: number;
  moveShare: number;
  reason: string;
  userLabel: string;
  limitations: string[];
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function evaluateBookSupport(input: BookSupportInput): BookSupportResult {
  const totalGames = Math.max(0, Number(input.totalGames ?? 0));
  const moveGames = Math.max(0, Number(input.moveGames ?? 0));
  const moveShareRaw = Number.isFinite(input.moveShare as number)
    ? Number(input.moveShare)
    : totalGames > 0
      ? moveGames / totalGames
      : 0;
  const moveShare = clamp01(moveShareRaw);

  const hasVolume = totalGames >= 500;
  const hasMoveSample = moveGames >= 100;
  const hasShare = moveShare >= 0.08;

  const volumeFactor = clamp01(totalGames / 3000);
  const moveFactor = clamp01(moveGames / 600);
  const shareFactor = clamp01(moveShare / 0.25);
  const confidence = clamp01(0.3 * volumeFactor + 0.3 * moveFactor + 0.4 * shareFactor);

  let userLabel = "Limited book support";
  if (confidence >= 0.9) userLabel = "Very strong book support";
  else if (confidence >= 0.7) userLabel = "Solid book support";
  else if (confidence >= 0.5) userLabel = "Notable book support";

  const hasBookSupport = hasVolume && hasMoveSample && hasShare && confidence >= 0.5;
  const limitations: string[] = [];
  if (!hasVolume) limitations.push("Low total game volume for this position.");
  if (!hasMoveSample) limitations.push("Move sample is too small for strong confidence.");
  if (!hasShare) limitations.push("Move share is low in observed games.");

  const reason = hasBookSupport
    ? confidence >= 0.9
      ? "Move is heavily represented with strong volume and share."
      : confidence >= 0.7
        ? "Move has solid practical support in opening data."
        : "Move has notable opening support but not elite certainty."
    : "Book support is not strong enough to trust this as a primary recommendation.";

  return {
    hasBookSupport,
    confidence,
    source: input.source ?? "book_data",
    totalGames,
    moveGames,
    moveShare,
    reason,
    userLabel,
    limitations,
  };
}
