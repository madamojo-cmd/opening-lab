import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Gamepad2,
  Home,
  ListChecks,
  Settings,
  Target,
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import styles from "./AppShell.module.css";

export type AppShellNavKey =
  | "home"
  | "train"
  | "daily"
  | "review"
  | "repertoire"
  | "minigames"
  | "settings";

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
  { key: "daily", label: "Daily", href: "/daily-blundr", icon: CalendarDays },
  { key: "review", label: "Review", href: "/review", icon: ListChecks },
  {
    key: "repertoire",
    label: "Repertoire",
    href: "/repertoire",
    icon: BookOpen,
  },
  { key: "minigames", label: "Minigames", href: "/minigames", icon: Gamepad2 },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
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

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AppShell({
  children,
  task,
  context,
  activeNav = "home",
  title = "Blundr",
  eyebrow,
  className,
}: AppShellProps) {
  return (
    <div className={joinClasses(styles.shell, className)}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/" aria-label="Blundr home">
          Blundr
        </Link>
        <div className={styles.headerCopy}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
        </div>
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

      <main className={styles.main}>
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
      </main>

      <footer className={styles.footer}>
        <span>Blundr</span>
      </footer>
    </div>
  );
}
