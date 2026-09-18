import "./landing-tokens.css";
export function MarketingButton({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return <a className={secondary ? "marketing-secondary" : "marketing-primary"} href={href}>{children}</a>;
}
