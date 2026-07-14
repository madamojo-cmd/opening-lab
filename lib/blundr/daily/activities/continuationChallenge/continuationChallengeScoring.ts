export function scoreContinuation(input: {
  objectiveScore: number;
  moveQualityScore: number;
  requiredMoves: number;
}) {
  return {
    objectiveScore: input.objectiveScore / Math.max(1, input.requiredMoves),
    moveQualityScore: input.moveQualityScore / Math.max(1, input.requiredMoves),
  };
}
