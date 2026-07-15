export function KingPawnLabFeedback({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-3 rounded-2xl bg-stone-50 p-3 text-sm"
    >
      {message}
    </div>
  );
}
