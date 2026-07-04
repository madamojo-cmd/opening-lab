"use client";

import { ChevronRight, Layers3, Scale, Users } from "lucide-react";
import type { ReactNode } from "react";
import { TempoCallout } from "./TempoCallout";

type RealGameDataCardProps = {
  ratingBandLabel: string;
  ratingBandDescription: string;
  exampleReplies: string[];
  tempoCopy: string;
  boardLabel?: string;
  boardBody?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function RealGameDataCard({ ratingBandLabel, ratingBandDescription, exampleReplies, tempoCopy, boardLabel = "Quick data preview", boardBody = "The starter pack and rating band shape the opponent replies you see most often." }: RealGameDataCardProps) {
  const boardSquares: Array<{ dark: boolean; piece?: string; highlight?: boolean }> = [
    { dark: false },
    { dark: true },
    { dark: false, piece: "♟" },
    { dark: true },
    { dark: true },
    { dark: false, highlight: true },
    { dark: true },
    { dark: false, piece: "♞" },
    { dark: true },
    { dark: false, piece: "♙" },
    { dark: true, highlight: true },
    { dark: false },
    { dark: false },
    { dark: true },
    { dark: false, piece: "♘" },
    { dark: true },
  ];

  return (
    <section className="space-y-4 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
            <Users size={14} />
            {ratingBandLabel}
          </div>
          <h3 className="mt-3 text-lg font-black text-stone-950">Built from real game data</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{ratingBandDescription}</p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">Tempo</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-green-100 bg-[linear-gradient(180deg,_rgba(247,247,244,1),_rgba(237,246,229,0.8))] p-3">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">{boardLabel}</div>
          <p className="mt-2 text-sm leading-6 text-stone-700">{boardBody}</p>
          <div className="mt-3 grid grid-cols-4 gap-1 rounded-2xl border border-stone-200 bg-white p-2">
            {boardSquares.map((square, index) => (
              <div
                key={`${index}-${square.piece ?? "empty"}`}
                className={classNames(
                  "flex aspect-square items-center justify-center rounded-lg text-lg",
                  square.dark ? "bg-[#d6c7a2]" : "bg-[#f7f3e8]",
                  square.highlight ? "ring-2 ring-green-400" : "",
                )}
              >
                {square.piece ?? ""}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-700">Common replies</div>
          <div className="mt-3 grid gap-2">
            {exampleReplies.map((reply) => (
              <div key={reply} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm text-stone-700 shadow-sm">
                <span>{reply}</span>
                <ChevronRight size={14} className="text-stone-400" />
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <Scale size={14} />
              Tempo callout
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">{tempoCopy}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

