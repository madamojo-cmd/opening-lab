import type {
  OpeningAccessDecision,
  WeaknessProjection,
} from "@/lib/blundr/contracts";

export type OpeningDetailState =
  | "loading"
  | "ready"
  | "empty"
  | "stale"
  | "partial"
  | "error"
  | "locked"
  | "unknown";
export type OpeningDetailFixture = {
  openingId: string;
  openingName: string;
  state: OpeningDetailState;
  access: OpeningAccessDecision;
  masteryPercent: number | null;
  weakBranches: readonly WeaknessProjection[];
  hasRealGameData: boolean;
};

export function OpeningDetailShell({
  fixture,
}: {
  fixture: OpeningDetailFixture;
}) {
  const denied =
    fixture.access !== "active" ||
    fixture.state === "locked" ||
    fixture.state === "unknown";
  const stateCopy: Partial<Record<OpeningDetailState, string>> = {
    loading: "Loading mastery details.",
    empty: "No mastery evidence has been recorded yet.",
    stale: "This snapshot is stale and needs refresh.",
    partial: "Some mastery branches are still being prepared.",
    error: "Mastery details could not be loaded.",
  };
  return (
    <main className="min-h-screen bg-[#f4f0e8] p-4 text-stone-900 sm:p-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="rounded-3xl bg-stone-900 p-6 text-stone-50">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
            Repertoire opening
          </p>
          <h1 className="mt-2 text-3xl font-black">{fixture.openingName}</h1>
          <p className="mt-2 text-sm text-stone-300">
            {denied
              ? "This opening is not available for the current repertoire."
              : "A fixture-driven opening detail foundation."}
          </p>
        </header>
        {denied ? (
          <StateCard
            title="Opening locked"
            body="Unlock this opening in your repertoire to view mastery details."
          />
        ) : fixture.state !== "ready" ? (
          <StateCard
            title={
              fixture.state === "loading"
                ? "Loading opening"
                : "Opening detail status"
            }
            body={
              stateCopy[fixture.state] ?? "This opening detail is not ready."
            }
          />
        ) : (
          <>
            <section
              aria-label="Mastery summary"
              className="rounded-3xl bg-stone-50 p-5 shadow-sm"
            >
              <h2 className="text-lg font-black">Mastery summary</h2>
              <p className="mt-2 text-4xl font-black text-green-700">
                {fixture.masteryPercent === null
                  ? "—"
                  : `${fixture.masteryPercent}%`}
              </p>
            </section>
            <section className="rounded-3xl bg-stone-50 p-5 shadow-sm">
              <h2 className="text-lg font-black">Mastery tree</h2>
              <p className="mt-1 text-sm text-stone-600">
                Expandable branch details will use the frozen read model.
              </p>
              <ul className="mt-4 space-y-2">
                {fixture.weakBranches.map((branch) => (
                  <li
                    key={`${branch.positionKey}:${branch.category}`}
                    className="rounded-2xl border border-stone-200 p-3 text-sm"
                  >
                    <span className="font-bold">
                      {branch.category.replaceAll("_", " ")}
                    </span>
                    <span className="ml-2 text-stone-500">
                      {Math.round(branch.score * 100)}% priority
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            <StateCard
              title="Real-game intelligence"
              body={
                fixture.hasRealGameData
                  ? "Connected fixture data is available."
                  : "No imported games yet. Connect game data in Settings when provider ingestion is enabled."
              }
            />
          </>
        )}
      </div>
    </main>
  );
}

export function StateCard({ title, body }: { title: string; body: string }) {
  return (
    <section
      role="status"
      className="rounded-3xl border border-stone-200 bg-stone-50 p-5 shadow-sm"
    >
      <h2 className="text-lg font-black">{title}</h2>
      <p className="mt-2 text-sm text-stone-600">{body}</p>
    </section>
  );
}
