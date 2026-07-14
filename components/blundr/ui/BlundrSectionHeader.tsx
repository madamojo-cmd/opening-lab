import type { ReactNode } from "react";
import { classNames } from "./utils";

type BlundrSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: ReactNode;
  className?: string;
};

export function BlundrSectionHeader({ eyebrow, title, copy, action, className }: BlundrSectionHeaderProps) {
  return (
    <div className={classNames("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2e6b4f]">{eyebrow}</div> : null}
        <h2 className="mt-1 text-base font-bold text-stone-950">{title}</h2>
        {copy ? <p className="mt-0.5 max-w-2xl text-xs leading-5 text-stone-500">{copy}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
