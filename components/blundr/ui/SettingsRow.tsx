"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { classNames } from "./utils";

type SettingsRowProps = {
  label: string;
  value?: string;
  helper?: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  active?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  className?: string;
};

export function SettingsRow({
  label,
  value,
  helper,
  icon,
  onClick,
  href,
  danger = false,
  active = false,
  disabled = false,
  trailing,
  className,
}: SettingsRowProps) {
  const interactive = Boolean(onClick || href);
  const content = (
    <>
      {icon ? <div className="shrink-0 text-green-700">{icon}</div> : null}
      <div className="min-w-0 flex-1">
        <div className={classNames("text-sm font-medium", danger ? "text-red-800" : "text-stone-950")}>{label}</div>
        {helper ? <p className="mt-1 text-xs leading-5 text-stone-500">{helper}</p> : null}
      </div>
      {value ? <div className="max-w-[42%] truncate text-right text-xs font-medium text-stone-500">{value}</div> : null}
      {trailing ?? (interactive ? <ChevronRight size={16} className="text-stone-400" /> : null)}
    </>
  );

  const rowClassName = classNames(
    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition",
    active ? "bg-[#ebf5ef] ring-[#cfe6d8]" : "bg-white ring-stone-200",
    danger && "ring-red-200",
    interactive && !disabled && "hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700",
    disabled && "cursor-not-allowed opacity-55",
    className,
  );

  if (href && !disabled) {
    return (
      <a href={href} className={rowClassName}>
        {content}
      </a>
    );
  }

  if (interactive) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={rowClassName}>
        {content}
      </button>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}
