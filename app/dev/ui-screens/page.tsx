import { AdminGate } from "@/components/dev/AdminGate";
import { UIStudio } from "@/components/dev/UIStudio";
import { resolveBlundrDeveloperAccess } from "@/lib/blundr/backend/devAccess";

export const dynamic = "force-dynamic";

export default async function UIScreensPage() {
  const access = await resolveBlundrDeveloperAccess(null);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 text-stone-950">
      <div className="mx-auto max-w-[1800px]">
        <AdminGate allowed={access.allowed} reason={access.reason}>
          <UIStudio />
        </AdminGate>
      </div>
    </main>
  );
}
