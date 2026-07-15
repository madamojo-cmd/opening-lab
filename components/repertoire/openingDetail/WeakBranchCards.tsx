import type { WeakBranch } from "@/lib/blundr/masteryMap";
export function WeakBranchCards({
  branches,
}: {
  branches: readonly WeakBranch[];
}) {
  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
      <h2 className="text-xl font-black">Practice next</h2>
      {branches.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {branches.map((branch) => (
            <article
              key={branch.positionKey}
              className="rounded-2xl bg-stone-50 p-4"
            >
              <p className="font-bold">{branch.sanSequence.join(" ")}</p>
              <p className="mt-2 text-sm text-stone-600">
                {branch.explanation}
              </p>
              <p className="mt-3 text-xs font-black uppercase tracking-wide text-green-700">
                {branch.recommendedActivity.replaceAll("_", " ")}
              </p>
              <button
                type="button"
                className="mt-3 min-h-11 rounded-2xl bg-green-700 px-3 py-2 text-sm font-black text-white"
              >
                Add to today
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-stone-600">
          No sufficiently evidenced weak branches.
        </p>
      )}
    </section>
  );
}
