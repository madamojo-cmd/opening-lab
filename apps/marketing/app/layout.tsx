import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL, SUPPORT_EMAIL } from "../lib/site";
import { MarketingShell } from "../components/MarketingShell";

export const metadata: Metadata = { metadataBase: new URL(SITE_URL), title: "Blundr | Personalized Chess Training From Your Games", icons: { icon: "/icon.svg" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const organization = { "@context":"https://schema.org", "@type":"Organization", name:"Blundr LLC", url:SITE_URL, email:SUPPORT_EMAIL, logo:`${SITE_URL}/icon.svg` }; return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(organization).replace(/</g,"\\u003c")}}/><MarketingShell>{children}</MarketingShell></body></html>; }
