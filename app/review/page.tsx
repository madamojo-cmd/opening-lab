import { ReviewHub } from "@/components/review/ReviewHub";

export const metadata = {
  title: "Review | Blundr",
  description: "Review mistakes and practice minigames.",
};

export default function ReviewPage() {
  return <ReviewHub homeHref="/" settingsHref="/settings" />;
}
