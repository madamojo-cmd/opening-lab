export function MixedTestProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <p role="status" className="mt-2 text-sm font-bold">
      Item {Math.min(current + 1, total)} of {total}
    </p>
  );
}
