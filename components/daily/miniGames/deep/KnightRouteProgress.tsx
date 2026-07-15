export function KnightRouteProgress({
  moves,
  total,
}: {
  moves: number;
  total: number;
}) {
  return (
    <p role="status" className="mt-3 text-sm font-bold">
      Targets: {moves} / {total}
    </p>
  );
}
