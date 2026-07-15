import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";
export function OpeningIntelligenceStrip({
  model,
}: {
  model: MasteryMapReadModel;
}) {
  const values = [
    ["Mastered", model.masteredPositions],
    ["Learning", model.learningPositions],
    ["Weak", model.weakPositions],
    ["Unseen", model.unseenPositions],
    ["Imported games", model.importedGameMatchCount],
    [
      "Unaided accuracy",
      model.firstAttemptUnaidedAccuracy === null
        ? "—"
        : `${Math.round(model.firstAttemptUnaidedAccuracy * 100)}%`,
    ],
  ] as const;
  return (
    <section
      aria-label="Opening intelligence"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {values.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl border border-stone-200 bg-white p-4"
        >
          <p className="text-xs font-black uppercase tracking-wide text-stone-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black text-stone-900">{value}</p>
        </div>
      ))}
    </section>
  );
}
