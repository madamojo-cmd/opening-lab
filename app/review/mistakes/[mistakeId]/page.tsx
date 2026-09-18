import { ReviewMistakeReplay } from "@/components/review/ReviewMistakeReplay";

export const metadata = {
  title: "Mistake Replay | Blundr",
  description: "Replay a queued Review Queue mistake.",
};

export default async function ReviewMistakePage({
  params,
}: {
  params: Promise<{ mistakeId: string }>;
}) {
  const resolved = await params;
  return (
    <main className="mx-auto flex w-full max-w-[1340px] flex-col text-stone-950">
      <ReviewMistakeReplay mistakeId={resolved.mistakeId} />
    </main>
  );
}

