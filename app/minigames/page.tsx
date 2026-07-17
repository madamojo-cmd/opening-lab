import { ReviewHub } from "@/components/review/ReviewHub";

export const metadata = { title: "Minigames | Blundr", description: "Focused practice with the three production minigames." };

/** A route alias around the existing production Review hub, not a new catalog. */
export default function MinigamesPage() {
  return <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5"><ReviewHub homeHref="/" settingsHref="/settings" /></main>;
}
