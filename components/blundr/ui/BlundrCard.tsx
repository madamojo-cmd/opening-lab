import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { classNames } from "./utils";

type BlundrCardTone = "default" | "warm" | "green" | "gold" | "dark" | "danger";
type BlundrCardPadding = "none" | "sm" | "md" | "lg";

type BlundrCardProps<T extends ElementType = "section"> = {
  as?: T;
  tone?: BlundrCardTone;
  padding?: BlundrCardPadding;
  elevated?: boolean;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const toneClasses: Record<BlundrCardTone, string> = {
  default: "border-stone-200 bg-white text-stone-950",
  warm: "border-stone-200 bg-white text-stone-950",
  green: "border-[#cfe6d8] bg-[#ebf5ef] text-green-950",
  gold: "border-[#ead8ad] bg-[#fbf3e0] text-stone-950",
  dark: "border-stone-800 bg-stone-950 text-white",
  danger: "border-red-200 bg-red-50 text-red-950",
};

const paddingClasses: Record<BlundrCardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function BlundrCard<T extends ElementType = "section">({
  as,
  tone = "default",
  padding = "md",
  elevated = true,
  interactive = false,
  className,
  children,
  ...rest
}: BlundrCardProps<T>) {
  const Component = as ?? "section";
  return (
    <Component
      {...rest}
      className={classNames(
        "rounded-[1.25rem] border",
        toneClasses[tone],
        paddingClasses[padding],
        elevated && "shadow-[0_1px_4px_rgba(24,24,15,0.05),0_10px_30px_rgba(24,24,15,0.04)]",
        interactive && "transition active:scale-[0.985] hover:border-green-200 hover:shadow-[0_4px_18px_rgba(24,24,15,0.08)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}
