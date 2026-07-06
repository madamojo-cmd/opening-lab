import type { Metadata, Viewport } from "next";
import { BLUNDR_BRAND_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blundr",
  description: "Controlled chess opening training with a GPT-powered intelligent board.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: BLUNDR_BRAND_ASSETS.favicon, type: "image/png" },
      { url: BLUNDR_BRAND_ASSETS.appIcon, type: "image/png" },
    ],
    apple: [{ url: BLUNDR_BRAND_ASSETS.appleTouchIcon, type: "image/png" }],
  },
};

export const viewport: Viewport = { themeColor: "#166534", width: "device-width", initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
