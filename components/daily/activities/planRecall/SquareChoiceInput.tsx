"use client";
export function SquareChoiceInput({
  choices,
  selectedId,
  onSelect,
}: {
  choices: readonly { id: string; label: string }[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="group" aria-label="Square choices" className="grid gap-2">
      {choices.map((choice) => (
        <button
          type="button"
          key={choice.id}
          aria-pressed={selectedId === choice.id}
          onClick={() => onSelect(choice.id)}
          className="min-h-11 rounded-2xl border border-stone-300 bg-white p-3 text-left font-bold"
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
