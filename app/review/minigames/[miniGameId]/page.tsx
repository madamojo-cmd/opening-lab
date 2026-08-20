import { MiniGamePracticeRunner } from "@/components/review/MiniGamePracticeRunner";

export const metadata = {
  title: "Minigame Practice | Blundr",
  description: "Standalone minigame practice for Blundr review.",
};

export default async function MiniGamePracticePage({ params }: { params: Promise<{ miniGameId: string }> }) {
  const resolvedParams = await params;
  return (
    <main className="mx-auto flex w-full max-w-[1340px] flex-col text-stone-950">
      <MiniGamePracticeRunner miniGameId={resolvedParams.miniGameId} homeHref="/" reviewHref="/review" settingsHref="/settings" />
    </main>
  );
}
