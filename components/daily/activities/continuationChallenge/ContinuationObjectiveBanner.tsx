export function ContinuationObjectiveBanner({
  objective,
}: {
  objective: string;
}) {
  return (
    <p role="status" className="rounded-2xl bg-stone-50 p-3 text-sm font-bold">
      Objective: {objective}
    </p>
  );
}
