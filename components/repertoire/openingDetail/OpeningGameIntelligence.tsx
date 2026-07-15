export function OpeningGameIntelligence({
  matchedGameCount,
  freshness,
}: {
  matchedGameCount: number;
  freshness: string;
}) {
  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
      <h2 className="text-xl font-black">Real-game intelligence</h2>
      <p className="mt-2 text-sm text-stone-600">
        {matchedGameCount
          ? `${matchedGameCount} matched game segments. Freshness: ${freshness}.`
          : "No imported games match this opening yet."}
      </p>
    </section>
  );
}
