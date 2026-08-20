import { ReviewHub } from "@/components/review/ReviewHub";

export const metadata = { title: "Minigames | Blundr", description: "Focused practice with the three production minigames." };

/** A route alias around the existing production Review hub, not a new catalog. */
export default function MinigamesPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1340px] flex-col text-stone-950">
      <ReviewHub homeHref="/" settingsHref="/settings" />
    </main>
  );
}
