import { MiniGamePracticeRunner } from "@/components/review/MiniGamePracticeRunner";

export const metadata = {
  title: "Minigame Practice | Blundr",
  description: "Standalone minigame practice for Blundr review.",
};

export default async function MiniGamePracticePage({ params }: { params: Promise<{ miniGameId: string }> }) {
  const resolvedParams = await params;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5">
      <MiniGamePracticeRunner miniGameId={resolvedParams.miniGameId} homeHref="/" reviewHref="/review" settingsHref="/settings" />
    </main>
  );
}
