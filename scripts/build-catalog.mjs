
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const categoriesPath = path.join(root, "src/data/categories.json");
const outPath = path.join(root, "src/data/catalog.json");
const artistsPath = path.join(root, "src/data/artists.json");

const API = "https://api.deezer.com";
const DELAY_MS = 150;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, attempt = 1) {
  await sleep(DELAY_MS);
  const res = await fetch(url);
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.error) {
    if (attempt < 4) {
      await sleep(1000 * attempt);
      return getJson(url, attempt + 1);
    }
    throw new Error(`Falha em ${url}: ${res.status} ${JSON.stringify(body?.error ?? "")}`);
  }
  return body;
}

async function playlistTracks(playlistId) {
  const tracks = [];
  let url = `${API}/playlist/${playlistId}/tracks?limit=100&index=0`;
  while (url) {
    const page = await getJson(url);
    tracks.push(...page.data);
    url = page.next ?? null;
  }
  return tracks;
}

function normalize(s) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/\s-\s.*$/, " ")
    .replace(/ (feat|ft)[. ].*$/, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const categories = JSON.parse(await readFile(categoriesPath, "utf8"));

const byKey = new Map();
const groupsByKey = new Map();
const playlistIds = [];
const membership = {};
const artistsByCategory = {};

function artistPicture(artist) {
  const m = /\/images\/artist\/([0-9a-f]{32})\//.exec(artist.picture_xl ?? artist.picture_big ?? "");
  return m ? m[1] : null;
}

for (const cat of categories) {
  membership[cat.id] = new Set();
  artistsByCategory[cat.id] = new Map();
  for (const entry of cat.playlists) {
    const { id, year } = typeof entry === "number" ? { id: entry } : entry;
    if (!playlistIds.includes(id)) playlistIds.push(id);
    const group = playlistIds.indexOf(id);
    let tracks;
    try {
      tracks = await playlistTracks(id);
    } catch (err) {
      console.warn(`  ! playlist ${id} ignorada: ${err.message}`);
      continue;
    }
    let kept = 0;
    for (const t of tracks) {
      if (!t.readable || !t.preview || !t.md5_image || t.type !== "track") continue;
      const title = t.title_short || t.title;
      const key = `${normalize(t.artist.name)}|${normalize(title)}`;
      const prev = byKey.get(key);
      if (!prev) {
        byKey.set(key, {
          i: t.id,
          t: title,
          a: t.artist.name,
          c: t.md5_image,
          r: t.rank ?? 0,
          ...(year ? { y: year } : {}),
          ...(t.explicit_lyrics ? { e: 1 } : {}),
        });
      } else {
        if ((t.rank ?? 0) > prev.r) {
          prev.i = t.id;
          prev.r = t.rank;
          prev.c = t.md5_image;
          prev.t = title;
          if (t.explicit_lyrics) prev.e = 1;
          else delete prev.e;
        }
        if (year && (!prev.y || year < prev.y)) prev.y = year;
      }
      membership[cat.id].add(key);
      if (!groupsByKey.has(key)) groupsByKey.set(key, new Set());
      groupsByKey.get(key).add(group);
      const pic = artistPicture(t.artist);
      if (pic) {
        const a = artistsByCategory[cat.id].get(t.artist.name) ?? { n: t.artist.name, p: pic, score: 0 };
        a.score += t.rank ?? 0;
        artistsByCategory[cat.id].set(t.artist.name, a);
      }
      kept++;
    }
    console.log(`  ${cat.id}: playlist ${id} → ${kept} faixas`);
  }
}

for (const [key, t] of byKey) t.p = [...groupsByKey.get(key)];
const tracks = [...byKey.values()].sort((a, b) => b.r - a.r);
const catalog = {
  generatedAt: new Date().toISOString(),
  tracks,
  categories: Object.fromEntries(
    categories.map((cat) => [
      cat.id,
      [...membership[cat.id]].map((k) => byKey.get(k)).sort((a, b) => b.r - a.r).map((t) => t.i),
    ]),
  ),
};

await writeFile(outPath, JSON.stringify(catalog));

const topArtists = (list) =>
  list
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ n, p }) => ({ n, p }));
const allArtists = new Map();
for (const map of Object.values(artistsByCategory))
  for (const a of map.values()) {
    const prev = allArtists.get(a.n);
    allArtists.set(a.n, prev ? { ...prev, score: prev.score + a.score } : { ...a });
  }
const artists = Object.fromEntries(categories.map((cat) => [cat.id, topArtists([...artistsByCategory[cat.id].values()])]));
artists.mix = topArtists([...allArtists.values()]);
await writeFile(artistsPath, JSON.stringify(artists));
console.log(`\n${tracks.length} músicas únicas salvas em src/data/catalog.json`);
for (const cat of categories) console.log(`  ${cat.id.padEnd(12)} ${catalog.categories[cat.id].length}`);
