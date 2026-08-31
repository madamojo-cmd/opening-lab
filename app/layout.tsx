import type { Metadata, Viewport } from "next";
import { BLUNDR_BRAND_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { OnboardingRouteGate } from "@/components/auth/OnboardingRouteGate";
import { AuthenticatedAccountHydrationGate } from "@/components/auth/AuthenticatedAccountHydrationGate";
import { ResponsiveAppShellGate } from "@/components/architecture/ResponsiveAppShellGate";
import "./globals.css";

function resolveMetadataBase() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_BLUNDR_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_BLUNDR_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (!configuredUrl) return new URL("http://localhost:3000");

  try {
    return new URL(configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "Blundr | Learn the opening. Know what to do when it changes.",
  description:
    "Blundr trains the positions behind your repertoire, brings back the moves you miss, and helps you keep playing when your opponent leaves the line.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: BLUNDR_BRAND_ASSETS.favicon, type: "image/png" },
      { url: BLUNDR_BRAND_ASSETS.appIcon, type: "image/png" },
    ],
    apple: [{ url: BLUNDR_BRAND_ASSETS.appleTouchIcon, type: "image/png" }],
  },
  openGraph: {
    title: "Blundr | Learn the opening. Know what to do when it changes.",
    description:
      "Train smarter openings, review the moves you miss, and build a repertoire that holds up in real games.",
    siteName: "Blundr",
    type: "website",
    images: [
      {
        url: "/assets/landing/interactive_chess_training_board.png",
        width: 1254,
        height: 1254,
        alt: "Blundr chess training board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blundr | Learn the opening. Know what to do when it changes.",
    description:
      "Train the positions behind your repertoire and keep playing when your opponent leaves the line.",
    images: ["/assets/landing/interactive_chess_training_board.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ResponsiveAppShellGate>
          <OnboardingRouteGate>
            <AuthenticatedAccountHydrationGate>
              {children}
            </AuthenticatedAccountHydrationGate>
          </OnboardingRouteGate>
        </ResponsiveAppShellGate>
      </body>
    </html>
  );
}
