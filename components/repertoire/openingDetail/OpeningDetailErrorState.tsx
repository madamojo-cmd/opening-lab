export function OpeningDetailErrorState() {
  return (
    <section
      role="alert"
      className="rounded-3xl border border-red-200 bg-red-50 p-5"
    >
      <h2 className="font-black">Opening detail unavailable</h2>
      <p className="mt-2 text-sm">Try again later.</p>
    </section>
  );
}
