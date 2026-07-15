export function MixedTestSummary({
  score,
  total,
}: {
  score: number;
  total: number;
}) {
  return (
    <div
      role="status"
      className="mt-3 rounded-2xl bg-green-50 p-4 text-sm font-bold"
    >
      Score {score} / {total}
    </div>
  );
}
