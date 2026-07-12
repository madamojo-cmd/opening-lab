"use client";

import { useRouter } from "next/navigation";
import { BlundrBottomNav } from "@/components/navigation/BlundrBottomNav";
import { RepertoireProgressPanel } from "@/components/repertoire/RepertoireProgressPanel";

export const dynamic = "force-dynamic";

export default function RepertoirePage() {
  const router = useRouter();

  return (
    <>
      <main className="blundr-page-bg min-h-screen px-4 py-5 text-stone-950">
        <div className="mx-auto max-w-md pb-28">
          <RepertoireProgressPanel onTrainOpening={(openingId) => router.push(`/train?openingId=${encodeURIComponent(openingId)}`)} />
        </div>
      </main>
      <BlundrBottomNav />
    </>
  );
}
