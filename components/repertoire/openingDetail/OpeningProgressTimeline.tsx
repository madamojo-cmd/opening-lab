import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";
export function OpeningProgressTimeline({
  model,
}: {
  model: MasteryMapReadModel;
}) {
  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
      <h2 className="text-xl font-black">Progress</h2>
      <p className="mt-2 text-sm text-stone-600">
        First-attempt accuracy:{" "}
        {model.firstAttemptUnaidedAccuracy === null
          ? "not enough data"
          : `${Math.round(model.firstAttemptUnaidedAccuracy * 100)}%`}
        . Retention trends appear after enough dated attempts.
      </p>
    </section>
  );
}
