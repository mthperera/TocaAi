export const SITE_NAME = "Toca Aí";

export const SITE_TITLE = `${SITE_NAME} · Jogo de adivinhar música online e grátis`;

export const SITE_DESCRIPTION =
  "Jogo de adivinhar música online e grátis: ouça um trecho e descubra qual é a música. Desafio novo todo dia com funk, sertanejo, pop, rock, anos 80, 90 e TikTok.";

export const SITE_KEYWORDS = [
  "jogo de adivinhar música",
  "adivinhe a música",
  "adivinhar música pelo trecho",
  "quiz de música",
  "quiz musical",
  "qual é a música",
  "jogo de música online",
  "jogo de música grátis",
  "heardle em português",
  "heardle brasileiro",
];

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
