import Link from "next/link";
import { BarChart3, BookOpen, Home, ListChecks, Target } from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { createContext, useContext } from "react";
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

export function AppShell({
  children,
  task,
  context,
  activeNav = "home",
  title,
  eyebrow,
  className,
}: AppShellProps) {
  return (
    <AppShellContext.Provider value={true}>
      <div className={joinClasses(styles.shell, className)}>
        <header className={styles.header}>
          <Link className={styles.wordmark} href="/" aria-label="Blundr home">
            Blundr
          </Link>
          <div className={styles.headerCopy}>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            {title ? <h1 className={styles.title}>{title}</h1> : null}
          </div>
          <ProfileSettingsIcon className={styles.accountMenu} />
        </header>

        <nav className={styles.navigation} aria-label="Primary">
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
        </nav>

        <div className={styles.main}>
          <div className={styles.contentColumn}>{children}</div>
          {task ? (
            <section className={styles.taskColumn} aria-label="Primary task">
              {task}
            </section>
          ) : null}
          {context ? (
            <aside className={styles.contextColumn} aria-label="Context">
              {context}
            </aside>
          ) : null}
        </div>

        <footer className={styles.footer}>
          <span>Blundr</span>
        </footer>
      </div>
    </AppShellContext.Provider>
  );
}
