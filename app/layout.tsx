import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blundr",
  description: "Controlled chess opening training with an intelligent board.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Blundr",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
