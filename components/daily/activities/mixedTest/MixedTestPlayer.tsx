export function MixedTestPlayer({ prompt }: { prompt: string }) {
  return (
    <section
      aria-label="Mixed Test item"
      className="rounded-2xl bg-stone-50 p-4"
    >
      <p className="text-sm font-bold">{prompt}</p>
    </section>
  );
}
