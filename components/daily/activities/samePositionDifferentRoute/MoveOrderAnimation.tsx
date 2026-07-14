export function MoveOrderAnimation({ moves }: { moves: readonly string[] }) {
  return (
    <ol aria-label="Alternate route" className="flex flex-wrap gap-2 text-sm">
      {moves.map((move, index) => (
        <li
          key={`${move}-${index}`}
          className="rounded-xl bg-stone-100 px-2 py-1"
        >
          {move}
        </li>
      ))}
    </ol>
  );
}
