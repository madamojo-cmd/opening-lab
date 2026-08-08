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

function activeNav(pathname: string): AppShellNavKey {
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

export function ResponsiveAppShellGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (
    EXEMPT.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  )
    return <>{children}</>;
  return <AppShell activeNav={activeNav(pathname)}>{children}</AppShell>;
}
