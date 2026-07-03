type RepertoireDebugPanelProps = {
  userId: string;
  repertoire: unknown;
  grantAction?: string;
  revokeAction?: string;
};

export function RepertoireDebugPanel({ userId, repertoire, grantAction = "/api/blundr/dev/grant-opening", revokeAction = "/api/blundr/dev/revoke-opening" }: RepertoireDebugPanelProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Repertoire</div>
      <h2 className="mt-2 text-lg font-black text-stone-950">Opening unlock state</h2>
      <pre className="mt-3 overflow-auto rounded-2xl bg-stone-50 p-3 text-xs leading-5 text-stone-700">{JSON.stringify(repertoire, null, 2)}</pre>

      <div className="mt-4 grid gap-3">
        <form action={grantAction} method="post" className="grid gap-2 rounded-2xl bg-stone-50 p-3">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Grant opening</div>
          <input type="hidden" name="userId" value={userId} />
          <input name="openingId" placeholder="opening_id" className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm" />
          <input name="pointsEarned" type="number" min="0" defaultValue={1} className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm" />
          <button type="submit" className="rounded-2xl bg-green-700 px-4 py-2 text-sm font-black text-white">
            Grant
          </button>
        </form>

        <form action={revokeAction} method="post" className="grid gap-2 rounded-2xl bg-stone-50 p-3">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Revoke opening</div>
          <input type="hidden" name="userId" value={userId} />
          <input name="openingId" placeholder="opening_id" className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm" />
          <input name="pointsEarned" type="number" min="0" defaultValue={1} className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm" />
          <button type="submit" className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white">
            Revoke
          </button>
        </form>
      </div>
    </section>
  );
}
