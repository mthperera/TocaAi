"use client";

import Image from "next/image";
import Link from "next/link";
import { artistPictureUrl, categories, categoryArtists, DIFFICULTIES, textOn, type Category } from "@/lib/categories";
import { dayNumber } from "@/lib/daily";
import { MODES } from "@/lib/modes";
import { computeStats, gameKey, useProgress, useToday, type SavedGame } from "@/lib/progress";
import { Sleeve } from "./Sleeve";
import { Countdown, ExplicitBadge, Square, Vinyl, gameTone } from "./ui";

type Info = Record<string, { size: number; explicit: boolean }>;

function bestGame(games: Record<string, SavedGame>, today: string, categoryId: string, modeId: string) {
  const all = DIFFICULTIES.map((d) => games[gameKey(today, categoryId, modeId, d.id)]).filter(Boolean);
  const rank = (g: SavedGame) => (g.status === "playing" ? 1 : gameTone(g) === "good" ? 3 : 2);
  return all.sort((a, b) => rank(b) - rank(a))[0];
}

const shelf = (() => {
  const seen = new Set<string>();
  return categories
    .flatMap((c) => categoryArtists(c.id, 3).map((a) => ({ ...a, color: c.color })))
    .filter((a) => !seen.has(a.name) && seen.add(a.name));
})();

export function HomeClient({ info }: { info: Info }) {
  const today = useToday();
  const progress = useProgress();
  const stats = today ? computeStats(progress, today) : null;
  const day = today ? dayNumber(today) : null;
  const featured = categories[((day ?? 1) * 5) % (categories.length - 1)];
  const dateLabel = today
    ? new Date(`${today}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    : "";

  const tones = (c: Category) =>
    today ? MODES.map((m) => gameTone(bestGame(progress.games, today, c.id, m.id))) : null;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-fg pb-6">
        <div>
          <h1 className="font-mono text-xs text-muted">Toca Aí · jogo de adivinhar música</h1>
          <p className="display mt-3 text-7xl sm:text-8xl">{day ? `Disco nº ${day}` : "Disco do dia"}</p>
          <p className="mt-2 text-muted first-letter:uppercase">{dateLabel}</p>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-xs text-muted">próximo disco em</p>
          <Countdown className="text-3xl" />
          {stats && stats.played > 0 && (
            <p className="mt-1 font-mono text-xs text-muted">
              sequência {stats.streak} · vitórias {stats.wins}/{stats.played}
            </p>
          )}
        </div>
      </section>

      <div className="relative -mx-5 mt-8 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <div className="marquee flex w-max gap-6 px-5">
          {[...shelf, ...shelf].map((a, i) => (
            <div key={`${a.name}-${i}`} className="flex w-24 flex-col items-center gap-2" aria-hidden={i >= shelf.length}>
              <Vinyl color={a.color} spinning slow bigLabel className="w-24">
                <Image src={artistPictureUrl(a.picture, 120)} alt={a.name} fill sizes="56px" className="object-cover" />
              </Vinyl>
              <span className="w-full truncate text-center text-xs text-muted">{a.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div id="categorias" className="mt-10 grid scroll-mt-6 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        <Link
          href={`/categoria/${featured.id}`}
          className="group relative col-span-2 row-span-2 hover:z-20"
        >
          <Sleeve category={featured} artists={categoryArtists(featured.id)} sizes="(min-width: 1024px) 480px, 90vw">
            <Band category={featured} info={info} tones={tones(featured)} featured />
          </Sleeve>
        </Link>
        {categories
          .filter((c) => c.id !== featured.id)
          .map((c) => (
            <Link key={c.id} href={`/categoria/${c.id}`} className="group relative hover:z-20">
              <Sleeve category={c} artists={categoryArtists(c.id)}>
                <Band category={c} info={info} tones={tones(c)} />
              </Sleeve>
              <p className="mt-2.5 line-clamp-1 text-sm text-muted">{c.description}</p>
            </Link>
          ))}
      </div>
    </>
  );
}

function Band({
  category,
  info,
  tones,
  featured = false,
}: {
  category: Category;
  info: Info;
  tones: ReturnType<typeof gameTone>[] | null;
  featured?: boolean;
}) {
  return (
    <>
      {info[category.id].explicit && <ExplicitBadge className="absolute top-2 left-2 z-10 ring-2 ring-white/70" />}
      <div
        className={`absolute inset-x-0 bottom-0 ${featured ? "px-5 pt-4 pb-5" : "px-3 pt-2.5 pb-3"}`}
        style={{ background: category.color, color: textOn(category.color) }}
      >
        {featured && <p className="font-mono text-xs opacity-80">destaque de hoje</p>}
        <p className={`display ${featured ? "mt-1 text-5xl sm:text-6xl" : "text-2xl sm:text-[28px]"}`}>{category.name}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-mono text-[11px] opacity-80">{info[category.id].size} músicas</span>
          {tones && (
            <span className="flex gap-[3px]" title="Modos jogados hoje">
              {tones.map((tone, i) => (
                <Square
                  key={i}
                  tone={tone}
                  className={`size-2 ${tone === "empty" ? "!bg-current opacity-25" : "ring-1 ring-black/20"}`}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
