import Link from "next/link";
import { appCta, SUPPORT_EMAIL } from "../lib/site";
import { disclaimer, nav } from "../lib/content";

export function MarketingShell({ children, source = "direct" }: { children: React.ReactNode; source?: string }) {
  return <><header className="site-header"><Link className="wordmark" href="/">Blundr</Link><nav aria-label="Main navigation">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<a href={appCta("/login", source)}>Log in</a><a className="button small" href={appCta("/signup", source)}>Start training free</a></nav></header><main>{children}</main><footer><div><Link className="wordmark" href="/">Blundr</Link><p>Personalized daily training from the chess you actually play.</p><p>Blundr LLC · 418 Broadway Ste N, Albany NY 12207 · <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p></div><nav aria-label="Footer navigation">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link href="/support">Support</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/subscription-terms">Subscription terms</Link><Link href="/acceptable-use">Acceptable use</Link><Link href="/account-deletion">Account deletion</Link></nav><small>{disclaimer}</small></footer></>;
}

export function PageIntro({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) { return <section className="page-intro"><p className="eyebrow">{eyebrow ?? "Blundr"}</p><h1>{title}</h1>{children && <p className="lede">{children}</p>}</section>; }
export function Cta({ source = "direct", children = "Start training free" }: { source?: string; children?: React.ReactNode }) { return <a className="button" href={appCta("/signup", source)}>{children}</a>; }
export function Placeholder({ label }: { label: string }) { return <div className="media-placeholder" role="img" aria-label={`${label} placeholder`}>Labeled media placeholder · {label}</div>; }
