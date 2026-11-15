import artistsJson from "@/data/artists.json";
import categoriesJson from "@/data/categories.json";

export type Category = {
  id: string;
  name: string;
  description: string;
  color: string;
};

export type Artist = { name: string; picture: string };

export type Difficulty = "facil" | "medio" | "dificil" | "todas";

export const DIFFICULTIES: { id: Difficulty; name: string; hint: string }[] = [
  { id: "facil", name: "Fácil", hint: "As 30% mais tocadas da categoria" },
  { id: "medio", name: "Médio", hint: "O meio do ranking de popularidade" },
  { id: "dificil", name: "Difícil", hint: "As menos tocadas da categoria" },
  { id: "todas", name: "Todas", hint: "Qualquer música da categoria" },
];

export function isDifficulty(v: string | null | undefined): v is Difficulty {
  return DIFFICULTIES.some((d) => d.id === v);
}

export const MIX_CATEGORY: Category = {
  id: "mix",
  name: "Mix de tudo",
  description: "Um pouco de tudo",
  color: "#141210",
};

export const categories: Category[] = [
  ...categoriesJson.map(({ id, name, description, color }) => ({ id, name, description, color })),
  MIX_CATEGORY,
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

const artists = artistsJson as Record<string, { n: string; p: string }[]>;

export function categoryArtists(id: string, count = 4): Artist[] {
  return (artists[id] ?? []).slice(0, count).map((a) => ({ name: a.n, picture: a.p }));
}

export function artistPictureUrl(md5: string, size = 250): string {
  return `https://cdn-images.dzcdn.net/images/artist/${md5}/${size}x${size}-000000-80-0-0.jpg`;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const INK = "#141210";

export function textOn(hex: string): "#ffffff" | "#141210" {
  const l = luminance(hex);
  const onWhite = 1.05 / (l + 0.05);
  const onInk = (l + 0.05) / (luminance(INK) + 0.05);
  return onWhite >= onInk ? "#ffffff" : INK;
}
