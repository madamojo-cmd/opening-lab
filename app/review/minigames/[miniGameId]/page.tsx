import { MiniGamePracticeRunner } from "@/components/review/MiniGamePracticeRunner";

export const metadata = {
  title: "Minigame Practice | Blundr",
  description: "Standalone minigame practice for Blundr review.",
};

export default function MiniGamePracticePage({ params }: { params: { miniGameId: string } }) {
  return <MiniGamePracticeRunner miniGameId={params.miniGameId} homeHref="/" reviewHref="/review" settingsHref="/settings" />;
}
