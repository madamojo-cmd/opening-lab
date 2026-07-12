import type { ReactNode } from "react";
import { classNames } from "./utils";

type BlundrChipTone = "green" | "stone" | "gold" | "red" | "blue";

type BlundrChipProps = {
  children: ReactNode;
  tone?: BlundrChipTone;
  icon?: ReactNode;
  subtle?: boolean;
  className?: string;
};

const toneClasses: Record<BlundrChipTone, { solid: string; subtle: string }> = {
  green: {
    solid: "bg-[#2e6b4f] text-white",
    subtle: "bg-[#ebf5ef] text-[#2e6b4f] ring-1 ring-[#cfe6d8]",
  },
  stone: {
    solid: "bg-stone-800 text-white",
    subtle: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  },
  gold: {
    solid: "bg-[#b8923a] text-white",
    subtle: "bg-[#fbf3e0] text-[#8a6820] ring-1 ring-[#ead8ad]",
  },
  red: {
    solid: "bg-red-700 text-white",
    subtle: "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
  blue: {
    solid: "bg-sky-700 text-white",
    subtle: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  },
};

export function BlundrChip({ children, tone = "stone", icon, subtle = true, className }: BlundrChipProps) {
  return (
    <span
      className={classNames(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        subtle ? toneClasses[tone].subtle : toneClasses[tone].solid,
        className,
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}
