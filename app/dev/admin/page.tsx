import { AdminGate } from "@/components/dev/AdminGate";
import { DailyStateDebugPanel } from "@/components/dev/DailyStateDebugPanel";
import { RepertoireDebugPanel } from "@/components/dev/RepertoireDebugPanel";
import { UserDebugPanel } from "@/components/dev/UserDebugPanel";
import { ValidationDebugPanel } from "@/components/dev/ValidationDebugPanel";
import { resolveBlundrDeveloperAccess } from "@/lib/blundr/backend/devAccess";
import { bootstrapBlundrAccount } from "@/lib/blundr/accounts/accountService";
import { readLocalDailyBlundrStateSnapshot } from "@/lib/blundr/accounts/accountSync";
import { runDailyBlundrValidation } from "@/lib/blundr/daily/validation/dailyValidationRunner";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const access = await resolveBlundrDeveloperAccess(null);
  const bootstrap = access.allowed ? await bootstrapBlundrAccount({ user: access.user, allowLocalFallback: true }) : null;
  const dailyState = readLocalDailyBlundrStateSnapshot();
  const report = runDailyBlundrValidation();

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 text-stone-950">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-green-700">Developer tools</div>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Blundr admin</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Server-gated debug view for accounts, Daily Blundr state, repertoire operations, and validation snapshots.</p>
        </header>

        <AdminGate allowed={access.allowed} reason={access.reason}>
          <div className="grid gap-4">
            <UserDebugPanel
              mode={access.user?.mode ?? "local_demo"}
              userId={access.user?.userId ?? "unknown"}
              email={access.user?.email ?? null}
              profile={bootstrap?.ok ? bootstrap.data.profile : null}
            />
            <DailyStateDebugPanel dailyState={dailyState} />
            <RepertoireDebugPanel
              userId={access.user?.userId ?? "unknown"}
              repertoire={bootstrap?.ok ? bootstrap.data.repertoire : null}
            />
            <ValidationDebugPanel report={report} />
          </div>
        </AdminGate>
      </div>
    </main>
  );
}
