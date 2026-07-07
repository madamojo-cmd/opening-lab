import { ReviewHub } from "@/components/review/ReviewHub";

export const metadata = {
  title: "Review | Blundr",
  description: "Review mistakes and practice minigames.",
};

export default function ReviewPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5">
      <ReviewHub homeHref="/" settingsHref="/settings" />
    </main>
  );
}
