import catalogJson from "@/data/catalog.json";
import type { Difficulty } from "./categories";
import { fold, normalize } from "./text";

export type Track = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  rank: number;
  year?: number;
  explicit?: boolean;
  groups: number[];
};

const TIERS: Record<Exclude<Difficulty, "todas">, [number, number]> = {
  facil: [0, 0.3],
  medio: [0.3, 0.65],
  dificil: [0.65, 1],
};

type RawTrack = { i: number; t: string; a: string; c: string; r: number; y?: number; e?: 1; p?: number[] };

const raw = catalogJson as { generatedAt: string; tracks: RawTrack[]; categories: Record<string, number[]> };

export const tracks: Track[] = raw.tracks.map((t) => ({
  id: t.i,
  title: t.t,
  artist: t.a,
  cover: t.c,
  rank: t.r,
  year: t.y,
  explicit: t.e === 1,
  groups: t.p ?? [],
}));

const byId = new Map(tracks.map((t) => [t.id, t]));

const categoryTracks: Record<string, Track[]> = Object.fromEntries(
  Object.entries(raw.categories).map(([id, ids]) => [id, ids.map((i) => byId.get(i)).filter((t) => t !== undefined)]),
);
categoryTracks.mix = tracks;

export function getTrack(id: number): Track | undefined {
  return byId.get(id);
}

export function categorySize(categoryId: string): number {
  return categoryTracks[categoryId]?.length ?? 0;
}

export function hasExplicitContent(categoryId: string): boolean {
  const all = categoryTracks[categoryId] ?? [];
  return all.length > 0 && all.filter((t) => t.explicit).length / all.length >= 0.15;
}

export function getPool(categoryId: string, difficulty: Difficulty): Track[] {
  const all = categoryTracks[categoryId] ?? [];
  if (difficulty === "todas") return all;
  const [from, to] = TIERS[difficulty];
  return all.slice(Math.floor(all.length * from), Math.floor(all.length * to));
}

export function getYearPool(categoryId: string, difficulty: Difficulty): Track[] {
  const tiered = getPool(categoryId, difficulty).filter((t) => t.year);
  if (tiered.length >= 10) return tiered;
  return getPool(categoryId, "todas").filter((t) => t.year);
}

export const MIN_YEAR_POOL = 5;

export function coverUrl(md5: string, size = 500): string {
  return `https://cdn-images.dzcdn.net/images/cover/${md5}/${size}x${size}-000000-80-0-0.jpg`;
}

export function popularity(track: Track): number {
  return Math.round(track.rank / 10000);
}

const searchIndex = tracks.map((t) => ({
  track: t,
  hay: fold(`${t.title} ${t.artist}`),
  title: fold(t.title),
  artist: fold(t.artist),
}));

export function searchTracks(query: string, limit = 8): Track[] {
  const q = fold(query);
  const words = q.split(" ").filter(Boolean);
  if (words.length === 0) return [];
  const scored: { track: Track; score: number }[] = [];
  for (const { track, hay, title, artist } of searchIndex) {
    if (!words.every((w) => hay.includes(w))) continue;
    const tokens = hay.split(" ");
    let score = 0;
    if (title.startsWith(q)) score += 6;
    if (artist.startsWith(q)) score += 4;
    for (const w of words) if (tokens.some((t) => t.startsWith(w))) score += 2;
    scored.push({ track, score });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.track);
}

export function sameArtist(a: Track, b: Track): boolean {
  return normalize(a.artist) === normalize(b.artist);
}

export function sameSong(a: Track, b: Track): boolean {
  return a.id === b.id || (normalize(a.title) === normalize(b.title) && sameArtist(a, b));
}
