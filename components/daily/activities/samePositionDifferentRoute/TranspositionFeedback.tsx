export function TranspositionFeedback({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl bg-stone-50 p-4 text-sm"
    >
      {message}
    </div>
  );
}
