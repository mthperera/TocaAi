import type { Track } from "./catalog";

export const LAUNCH_DATE = "2026-11-01";

const DAY_MS = 24 * 60 * 60 * 1000;

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isDateKey(key: string | null | undefined): key is string {
  return !!key && /^\d{4}-\d{2}-\d{2}$/.test(key) && dateKey(parseKey(key)) === key;
}

export function dayNumber(key: string): number {
  return Math.round((parseKey(key).getTime() - parseKey(LAUNCH_DATE).getTime()) / DAY_MS) + 1;
}

export function keyFromDayNumber(n: number): string {
  const d = parseKey(LAUNCH_DATE);
  d.setDate(d.getDate() + n - 1);
  return dateKey(d);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export function formatDay(key: string): string {
  return parseKey(key).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function msUntilNextDay(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

function hashString(s: string): number {
  let h1 = 0xdeadbeef ^ s.length;
  let h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return h1 >>> 0;
}

export function rng(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function shuffled<T>(items: T[], seed: string): T[] {
  const out = [...items];
  const rand = rng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function dailyTracks(pool: Track[], seed: string, day: number, count: number): Track[] {
  if (pool.length === 0) return [];
  const sorted = [...pool].sort((a, b) => a.id - b.id);
  const cycles = new Map<number, Track[]>();
  const at = (idx: number) => {
    const cycle = Math.floor(idx / sorted.length);
    if (!cycles.has(cycle)) cycles.set(cycle, shuffled(sorted, `${seed}#${cycle}`));
    return cycles.get(cycle)![idx % sorted.length];
  };
  const out: Track[] = [];
  const want = Math.min(count, sorted.length);
  for (let idx = Math.max(0, day - 1) * count; out.length < want; idx++) {
    const t = at(idx);
    if (!out.some((o) => o.id === t.id)) out.push(t);
  }
  return out;
}

export function distractors(answer: Track, pool: Track[], seed: string, count = 3): Track[] {
  const others = pool.filter((t) => t.id !== answer.id);
  const sameStyle = answer.groups
    .map((g) => others.filter((t) => t.groups.includes(g)))
    .filter((list) => list.length >= count)
    .sort((a, b) => a.length - b.length)[0];
  const candidates = shuffled(sameStyle ?? others, seed);
  const out: Track[] = [];
  for (const t of candidates) {
    if (out.length >= count) break;
    if (t.artist !== answer.artist && !out.some((o) => o.artist === t.artist)) out.push(t);
  }
  for (const t of candidates) {
    if (out.length >= count) break;
    if (!out.includes(t)) out.push(t);
  }
  return out;
}
