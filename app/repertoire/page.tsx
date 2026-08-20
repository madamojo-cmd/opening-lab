import { RepertoireProgressPanel } from "@/components/repertoire/RepertoireProgressPanel";

export const dynamic = "force-dynamic";

export default function RepertoirePage() {
  return (
    <main className="w-full px-4 py-5 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1340px]">
        <RepertoireProgressPanel homeHref="/" />
      </div>
    </main>
  );
}
