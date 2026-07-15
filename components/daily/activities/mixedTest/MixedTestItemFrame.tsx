export function MixedTestItemFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 p-3">{children}</div>
  );
}
