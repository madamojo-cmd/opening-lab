"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, CheckCircle2, Home, Target } from "lucide-react";
import { classNames } from "@/components/blundr/ui";
import { useAppShellNavigation } from "@/components/architecture/AppShell";

type NavItem = {
  id: "home" | "train" | "review" | "progress" | "repertoire";
  label: string;
  href: string;
  icon: typeof Home;
};

const NAV_ITEMS: readonly NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "train", label: "Train", href: "/train", icon: Target },
  { id: "review", label: "Review", href: "/review", icon: CheckCircle2 },
  { id: "progress", label: "Progress", href: "/progress", icon: BarChart3 },
  {
    id: "repertoire",
    label: "Repertoire",
    href: "/repertoire",
    icon: BookOpen,
  },
] as const;

function getActiveTab(pathname: string | null): NavItem["id"] {
  if (!pathname) return "home";
  if (
    pathname === "/" ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/paywall")
  ) {
    return "home";
  }
  if (pathname.startsWith("/train")) return "train";
  if (
    pathname.startsWith("/daily") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/minigames")
  )
    return "review";
  if (pathname.startsWith("/progress")) return "progress";
  if (pathname.startsWith("/repertoire")) return "repertoire";
  return "home";
}

export function BlundrBottomNav({
  className,
  activeTab: activeTabOverride,
}: {
  className?: string;
  activeTab?: NavItem["id"];
}) {
  const pathname = usePathname();
  const shellNavigationActive = useAppShellNavigation();
  const activeTab = activeTabOverride ?? getActiveTab(pathname);

  if (shellNavigationActive) return null;

  return (
    <nav
      className={classNames(
        "fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-1.5 backdrop-blur",
        className,
      )}
      aria-label="Primary"
    >
      <div className="mx-auto grid w-full max-w-[430px] grid-cols-5 gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={classNames(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-semibold leading-none whitespace-nowrap transition",
                active ? "bg-green-50 text-green-700" : "text-stone-500",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
