"use client";
import { useEffect, useState } from "react";
import { MARKETING_ROUTES, NAV_ITEMS } from "../shared/marketing-content";
import { MarketingButton } from "../shared/MarketingButton";
import styles from "./BlundrMarketingHeader.module.css";

export function BlundrMarketingHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey); }, []);
  const links = NAV_ITEMS.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>);
  return <header className={styles.header}><div className={styles.inner}><a className={styles.logo} href="#why-blundr" aria-label="Blundr home"><span className={styles.mark}>B</span><span>Blundr</span></a><nav className={styles.desktop} aria-label="Primary navigation">{links}</nav><div className={styles.actions}><a className={styles.login} href={MARKETING_ROUTES.login}>Log in</a><MarketingButton href={MARKETING_ROUTES.signup}>Start training free</MarketingButton></div><button className={styles.menu} type="button" aria-expanded={open} aria-controls="blundr-mobile-nav" onClick={() => setOpen(value => !value)}>{open ? "Close" : "Menu"}</button></div>{open && <nav id="blundr-mobile-nav" className={styles.mobile} aria-label="Mobile navigation">{links}<a href={MARKETING_ROUTES.login} onClick={() => setOpen(false)}>Log in</a><MarketingButton href={MARKETING_ROUTES.signup}>Start training free</MarketingButton></nav>}</header>;
}
