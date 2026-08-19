import Link from "next/link";
import { BarChart3, BookOpen, Home, ListChecks, Target } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { createContext, useContext } from "react";

import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { BLUNDR_BRAND_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import styles from "./AppShell.module.css";

export type AppShellNavKey =
  | "home"
  | "train"
  | "review"
  | "progress"
  | "repertoire";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export type AppShellNavItem = {
  key: AppShellNavKey;
  label: string;
  href: string;
  icon: Icon;
};

export const APP_SHELL_NAV_ITEMS: readonly AppShellNavItem[] = [
  { key: "home", label: "Home", href: "/", icon: Home },
  { key: "train", label: "Train", href: "/train", icon: Target },
  { key: "review", label: "Review", href: "/review", icon: ListChecks },
  { key: "progress", label: "Progress", href: "/progress", icon: BarChart3 },
  {
    key: "repertoire",
    label: "Repertoire",
    href: "/repertoire",
    icon: BookOpen,
  },
] as const;

/** The production standalone catalog. Daily activities are intentionally not listed here. */
export const PRODUCTION_MINIGAMES = [
  "Deep Tactic Shots",
  "Knight Gymnasium",
  "King & Pawn Lab",
] as const;

export type AppShellProps = {
  children: ReactNode;
  task?: ReactNode;
  context?: ReactNode;
  activeNav?: AppShellNavKey;
  title?: string;
  eyebrow?: string;
  className?: string;
};

const AppShellContext = createContext(false);
export function useAppShellNavigation(): boolean {
  return useContext(AppShellContext);
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getActiveNavItem(activeNav: AppShellNavKey) {
  return APP_SHELL_NAV_ITEMS.find((item) => item.key === activeNav) ?? APP_SHELL_NAV_ITEMS[0];
}

export function AppShell({
  children,
  task,
  context,
  activeNav = "home",
  title,
  eyebrow,
  className,
}: AppShellProps) {
  const activeNavItem = getActiveNavItem(activeNav);
  const hasAside = Boolean(task || context);

  return (
    <AppShellContext.Provider value={true}>
      <div className={joinClasses(styles.shell, className)}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link className={styles.brand} href="/" aria-label="Blundr home">
              <BlundrAssetImage
                asset={BLUNDR_BRAND_ASSETS.logoWordmark}
                alt="Blundr"
                variant="brandWordmark"
                priority
                className={styles.brandWordmark}
              />
            </Link>

            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{eyebrow ?? activeNavItem.label}</p>
              {title ? <h1 className={styles.title}>{title}</h1> : null}
            </div>

            <ProfileSettingsIcon className={styles.accountMenu} />
          </div>
        </header>

        <nav className={styles.navigation} aria-label="Primary">
          <div className={styles.navigationInner}>
            <Link className={styles.railBrand} href="/" aria-label="Blundr home">
              <span className={styles.railTile} aria-hidden="true">
                B
              </span>
            </Link>

            <ul className={styles.navigationList}>
              {APP_SHELL_NAV_ITEMS.map(({ key, label, href, icon: Icon }) => {
                const active = key === activeNav;
                return (
                  <li key={key}>
                    <Link
                      className={joinClasses(
                        styles.navigationLink,
                        active && styles.navigationLinkActive,
                      )}
                      href={href}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        aria-hidden="true"
                        focusable="false"
                        className={styles.navigationIcon}
                      />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <main
          className={joinClasses(
            styles.main,
            hasAside ? styles.mainWithAside : undefined,
          )}
        >
          <div className={styles.mainInner}>
            <div className={styles.contentColumn}>{children}</div>
            {hasAside ? (
              <aside className={styles.asideColumn} aria-label="Supplementary">
                {task ? (
                  <section className={styles.taskColumn} aria-label="Primary task">
                    {task}
                  </section>
                ) : null}
                {context ? (
                  <section className={styles.contextColumn} aria-label="Context">
                    {context}
                  </section>
                ) : null}
              </aside>
            ) : null}
          </div>
        </main>

        <footer className={styles.footer}>
          <span>Blundr</span>
        </footer>
      </div>
    </AppShellContext.Provider>
  );
}
