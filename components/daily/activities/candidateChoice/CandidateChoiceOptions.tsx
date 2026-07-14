"use client";
export function CandidateChoiceOptions({
  options,
  selectedId,
  onSelect,
  disabled = false,
}: {
  options: readonly { id: string; label: string }[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label="Candidate moves" className="grid gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          data-candidate-id={option.id}
          aria-pressed={selectedId === option.id}
          disabled={disabled}
          onClick={() => onSelect(option.id)}
          className="min-h-11 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-left font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
