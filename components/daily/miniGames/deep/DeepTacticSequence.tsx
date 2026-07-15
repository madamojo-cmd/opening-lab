export function DeepTacticSequence({ moves }: { moves: readonly string[] }) {
  return (
    <p role="status" className="mt-3 text-sm font-bold">
      Sequence in progress: {moves.length} committed moves
    </p>
  );
}
