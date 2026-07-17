import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const preview = process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development";
  return preview
    ? { rules: [{ userAgent: "*", disallow: "/" }] }
    : { rules: [{ userAgent: "*", allow: "/" }], sitemap: "https://blundr.io/sitemap.xml" };
}
