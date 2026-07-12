import { RewardsAccessShell } from "@/components/dev/RewardsAccessShell";

export const dynamic = "force-dynamic";

export default async function DevRewardsPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-6 text-stone-950">
      <div className="mx-auto w-full max-w-[1100px]">
        <RewardsAccessShell />
      </div>
    </main>
  );
}
