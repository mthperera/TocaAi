import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { MODES } from "@/lib/modes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...categories.map((c) => ({
      url: `${SITE_URL}/categoria/${c.id}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...categories.flatMap((c) =>
      MODES.map((m) => ({
        url: `${SITE_URL}/jogar/${c.id}/${m.id}`,
        changeFrequency: "daily" as const,
        priority: 0.6,
      })),
    ),
  ];
}
