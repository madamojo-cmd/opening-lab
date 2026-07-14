export function PlanRecallFeedback({
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
      className="rounded-2xl bg-stone-50 p-4 text-sm"
    >
      {message}
    </div>
  );
}
