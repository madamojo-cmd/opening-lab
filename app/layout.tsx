import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opening Lab",
  description: "A mobile-first chess opening trainer with Lichess historical move weighting.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Opening Lab",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#166534",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
