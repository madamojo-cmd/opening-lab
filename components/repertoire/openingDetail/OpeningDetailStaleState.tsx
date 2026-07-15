export function OpeningDetailStaleState() {
  return (
    <section
      role="status"
      className="rounded-3xl border border-amber-200 bg-amber-50 p-5"
    >
      <h2 className="font-black">Snapshot is stale</h2>
      <p className="mt-2 text-sm">Some connected-game data needs a refresh.</p>
    </section>
  );
}
