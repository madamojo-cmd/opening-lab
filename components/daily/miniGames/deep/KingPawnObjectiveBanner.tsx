export function KingPawnObjectiveBanner({
  result,
}: {
  result: "win" | "draw" | "hold";
}) {
  return (
    <p
      role="status"
      className="mt-3 rounded-2xl bg-stone-50 p-3 text-sm font-bold"
    >
      Verified objective: {result}
    </p>
  );
}
