import { useState } from "react";
export function ProviderUsernameForm({
  onSubmit,
  submitLabel = "Verify account",
}: {
  onSubmit: (provider: "chesscom" | "lichess", username: string) => void;
  submitLabel?: string;
}) {
  const [provider, setProvider] = useState<"chesscom" | "lichess">("lichess");
  const [username, setUsername] = useState("");
  return (
    <form
      className="grid gap-3 rounded-2xl bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const value = username.trim();
        if (value) onSubmit(provider, value);
      }}
    >
      <label className="grid gap-1 text-sm font-bold">
        Provider
        <select
          className="rounded-xl border border-stone-300 p-2"
          value={provider}
          onChange={(event) =>
            setProvider(event.target.value as "chesscom" | "lichess")
          }
        >
          <option value="lichess">Lichess</option>
          <option value="chesscom">Chess.com</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold">
        Username
        <input
          className="rounded-xl border border-stone-300 p-2"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="off"
        />
      </label>
      <button
        className="rounded-xl bg-green-700 px-4 py-2 text-sm font-black text-white"
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
