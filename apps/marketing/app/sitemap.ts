import type { MetadataRoute } from "next";
const routes = ["/","/features","/how-it-works","/pricing","/daily-blundr","/minigames","/support","/privacy","/terms","/subscription-terms","/acceptable-use","/account-deletion"];
export default function sitemap(): MetadataRoute.Sitemap { return routes.map((route) => ({ url: `https://blundr.io${route}`, lastModified: new Date("2026-07-17T00:00:00Z"), changeFrequency: "monthly", priority: route === "/" ? 1 : .7 })); }
