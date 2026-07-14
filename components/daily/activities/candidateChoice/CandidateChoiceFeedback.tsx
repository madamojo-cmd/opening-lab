export function CandidateChoiceFeedback({
  message,
  kind,
}: {
  message: string;
  kind: "correct" | "incorrect" | "revealed";
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-feedback-kind={kind}
      className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-800"
    >
      {message}
    </div>
  );
}
