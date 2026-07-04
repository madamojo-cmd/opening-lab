import { RepertoireProgressPanel } from "@/components/repertoire/RepertoireProgressPanel";

export const dynamic = "force-dynamic";

export default function RepertoirePage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-5 text-stone-950">
      <div className="mx-auto max-w-md">
        <RepertoireProgressPanel homeHref="/" />
      </div>
    </main>
  );
}
