import { ReviewHub } from "@/components/review/ReviewHub";

export const metadata = {
  title: "Review | Blundr",
  description: "Review mistakes and practice minigames.",
};

export default function ReviewPage() {
  return (
    <main className="w-full">
      <ReviewHub homeHref="/" settingsHref="/settings" />
    </main>
  );
}
