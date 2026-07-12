import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { classNames } from "./utils";

type BlundrButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "premium";
type BlundrButtonSize = "sm" | "md" | "lg";

type SharedProps = {
  children: ReactNode;
  variant?: BlundrButtonVariant;
  size?: BlundrButtonSize;
  fullWidth?: boolean;
  iconLeading?: ReactNode;
  iconTrailing?: ReactNode;
  isLoading?: boolean;
  className?: string;
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    disabled?: boolean;
  };

const variantClasses: Record<BlundrButtonVariant, string> = {
  primary: "bg-[#2e6b4f] text-white shadow-[0_4px_20px_rgba(46,107,79,0.26)] hover:bg-[#24583f] focus-visible:outline-[#2e6b4f]",
  secondary: "bg-white text-stone-800 ring-1 ring-stone-200 hover:bg-[#f9f7f3] focus-visible:outline-stone-500",
  ghost: "bg-transparent text-stone-700 hover:bg-[#ede8df] focus-visible:outline-stone-500",
  destructive: "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50 focus-visible:outline-red-600",
  premium: "bg-[#b8923a] text-white shadow-[0_4px_20px_rgba(184,146,58,0.22)] hover:bg-[#9c792e] focus-visible:outline-[#b8923a]",
};

const sizeClasses: Record<BlundrButtonSize, string> = {
  sm: "min-h-9 rounded-xl px-3 py-2 text-xs",
  md: "min-h-12 rounded-2xl px-4 py-3 text-sm",
  lg: "min-h-14 rounded-2xl px-5 py-4 text-base",
};

function buttonClassName(props: SharedProps & { disabled?: boolean }): string {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  return classNames(
    "inline-flex items-center justify-center gap-2 font-semibold transition active:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-55",
    props.fullWidth && "w-full",
    sizeClasses[size],
    variantClasses[variant],
    props.className,
  );
}

function content({ children, iconLeading, iconTrailing, isLoading }: SharedProps) {
  return (
    <>
      {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : iconLeading}
      <span>{children}</span>
      {iconTrailing}
    </>
  );
}

export function BlundrButton(props: ButtonProps | LinkProps) {
  const { children, variant, size, fullWidth, iconLeading, iconTrailing, isLoading, className, disabled, ...rest } = props;
  const shared = { children, variant, size, fullWidth, iconLeading, iconTrailing, isLoading, className };

  if ("href" in props && props.href) {
    return (
      <Link
        {...(rest as Omit<LinkProps, keyof SharedProps | "href" | "disabled">)}
        href={props.href}
        aria-disabled={disabled || isLoading ? true : undefined}
        className={buttonClassName({ ...shared, disabled })}
        tabIndex={disabled || isLoading ? -1 : rest.tabIndex}
      >
        {content(shared)}
      </Link>
    );
  }

  return (
    <button
      {...(rest as Omit<ButtonProps, keyof SharedProps>)}
      type={(rest as ButtonHTMLAttributes<HTMLButtonElement>).type ?? "button"}
      disabled={disabled || isLoading}
      className={buttonClassName({ ...shared, disabled })}
    >
      {content(shared)}
    </button>
  );
}
