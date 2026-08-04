export type OpponentReplyCopyInput = {
  san: string;
  playPct?: number | null;
  variationApplied?: boolean;
  blockedThirdRepeatBranches?: readonly string[];
};

export function formatOpponentReplyPercentage(
  playPct: number | null | undefined,
): string | null {
  if (
    typeof playPct !== "number" ||
    !Number.isFinite(playPct) ||
    playPct < 0 ||
    playPct > 1
  ) {
    return null;
  }
  return `${(playPct * 100).toFixed(1)}%`;
}

export function buildOpponentReplyFeedback(
  input: OpponentReplyCopyInput,
): string {
  const sentences = [`Opponent played ${input.san}.`];
  const percentage = formatOpponentReplyPercentage(input.playPct);
  if (percentage) {
    sentences.push(`Played in ${percentage} of matching Lichess games.`);
  }
  if (
    input.variationApplied &&
    (input.blockedThirdRepeatBranches?.length ?? 0) > 0
  ) {
    sentences.push(
      "Blundr chose a different supported reply to avoid a third consecutive repeat.",
    );
  }
  return sentences.join(" ");
}
