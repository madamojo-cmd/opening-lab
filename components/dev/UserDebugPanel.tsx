type UserDebugPanelProps = {
  mode: string;
  userId: string;
  email?: string | null;
  profile: unknown;
  resetAction?: string;
  localDemoResetAction?: string;
};

export function UserDebugPanel({ mode, userId, email, profile, resetAction = "/api/blundr/dev/reset-user", localDemoResetAction = "/api/blundr/dev/reset-user" }: UserDebugPanelProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">User</div>
      <h2 className="mt-2 text-lg font-black text-stone-950">Current account</h2>
      <dl className="mt-3 grid gap-2 text-sm text-stone-700">
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-stone-500">Mode</dt>
          <dd className="font-mono text-xs text-stone-900">{mode}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-stone-500">User ID</dt>
          <dd className="font-mono text-xs text-stone-900">{userId}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-stone-500">Email</dt>
          <dd className="font-mono text-xs text-stone-900">{email || "n/a"}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-2xl bg-stone-50 p-3">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Profile JSON</div>
        <pre className="mt-2 overflow-auto text-xs leading-5 text-stone-700">{JSON.stringify(profile, null, 2)}</pre>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={resetAction} method="post">
          <input type="hidden" name="scope" value="onboarding" />
          <input type="hidden" name="userId" value={userId} />
          <button type="submit" className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white">
            Reset onboarding
          </button>
        </form>
        <form action={localDemoResetAction} method="post">
          <input type="hidden" name="scope" value="full" />
          <input type="hidden" name="userId" value={userId} />
          <button type="submit" className="rounded-2xl bg-green-700 px-4 py-2 text-sm font-black text-white">
            Reset local demo
          </button>
        </form>
      </div>
    </section>
  );
}
