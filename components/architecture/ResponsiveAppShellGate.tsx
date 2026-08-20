"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell, type AppShellNavKey } from "./AppShell";

const EXEMPT = [
  "/signup",
  "/login",
  "/forgot-password",
  "/auth",
  "/confirm",
  "/reset-password",
  "/onboarding",
  "/privacy",
  "/terms",
  "/acceptable-use",
  "/subscription-terms",
  "/account-deletion",
];

function activeNav(pathname: string): AppShellNavKey | null {
  if (pathname.startsWith("/train")) return "train";
  if (
    pathname.startsWith("/daily") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/minigames")
  )
    return "review";
  if (pathname.startsWith("/progress")) return "progress";
  if (pathname.startsWith("/repertoire")) return "repertoire";
  if (pathname.startsWith("/settings") || pathname.startsWith("/profile"))
    return null;
  return "home";
}

function routeEyebrow(pathname: string): string | undefined {
  if (pathname.startsWith("/daily")) return "Review · Daily Blundr";
  if (pathname.startsWith("/review/minigames")) return "Review · Minigame";
  if (pathname.startsWith("/repertoire/")) return "Repertoire · Opening";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/profile")) return "Profile";
  return undefined;
}

export function ResponsiveAppShellGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (
    EXEMPT.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  )
    return <>{children}</>;
  return (
    <AppShell activeNav={activeNav(pathname)} eyebrow={routeEyebrow(pathname)}>
      {children}
    </AppShell>
  );
}
