"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DIFFICULTIES, isDifficulty, textOn, type Category, type Difficulty } from "@/lib/categories";
import { dayNumber, formatDay, keyFromDayNumber, randomSeed } from "@/lib/daily";
import { ladderStages, MODES, type ModeId } from "@/lib/modes";
import { gameKey, useProgress, useToday, type SavedGame } from "@/lib/progress";
import { Countdown, GameStatus, ModeIcon, Vinyl, gameTone } from "./ui";

type Pools = Record<Difficulty, { size: number; yearMode: boolean }>;

const LOCKED_PREVIEW = 3;

const DISC_LABEL = {
  good: "var(--good)",
  bad: "var(--bad)",
  mid: "var(--mid)",
  skip: "var(--line)",
  empty: "var(--soft)",
} as const;

export function CategoryClient({ category, pools }: { category: Category; pools: Pools }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const today = useToday();
  const progress = useProgress();
  const nivelParam = params.get("nivel");
  const difficulty: Difficulty = isDifficulty(nivelParam) ? nivelParam : "facil";
  const modoParam = params.get("modo");
  const [archiveMode, setArchiveMode] = useState<ModeId>(() =>
    MODES.some((m) => m.id === modoParam) ? (modoParam as ModeId) : "classico",
  );

  const modes = MODES.filter((m) => m.id !== "ano" || pools[difficulty].yearMode);
  const playHref = (mode: ModeId, day?: string) =>
    `/jogar/${category.id}/${mode}?nivel=${difficulty}${day && day !== today ? `&dia=${day}` : ""}`;
  const game = (day: string, mode: ModeId): SavedGame | undefined =>
    progress.games[gameKey(day, category.id, mode, difficulty)];
  const todayNumber = today ? dayNumber(today) : 0;
  const level = DIFFICULTIES.find((d) => d.id === difficulty)!;
  const onColor = textOn(category.color);

  return (
    <div>
      <section className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="inline-flex rounded-full border-2 border-fg p-1" role="radiogroup" aria-label="Nível">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              role="radio"
              aria-checked={difficulty === d.id}
              onClick={() => router.replace(`${pathname}?nivel=${d.id}`, { scroll: false })}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                difficulty === d.id ? "bg-fg text-bg" : "hover:bg-soft"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          {level.hint} · {pools[difficulty].size} músicas
        </p>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="display text-4xl">
            Hoje <span className="text-muted">nº {todayNumber || ""}</span>
          </h2>
          <span className="font-mono text-xs text-muted">
            próximos em <Countdown className="text-fg" />
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((m) => (
            <div
              key={m.id}
              className="group relative flex flex-col rounded-xl border-2 border-fg bg-card p-4 transition hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="grid size-11 place-items-center rounded-full"
                  style={{ background: category.color, color: onColor }}
                >
                  <ModeIcon mode={m.id} />
                </span>
                {today && <GameStatus game={game(today, m.id)} attempts={ladderStages(m.id).length} />}
              </div>
              <Link href={playHref(m.id)} className="mt-4 after:absolute after:inset-0">
                <span className="display block text-3xl">{m.name}</span>
              </Link>
              <p className="mt-1 flex-1 text-sm text-muted">{m.tagline}</p>
              <button
                onClick={() => router.push(`/jogar/${category.id}/${m.id}?nivel=${difficulty}&treino=${randomSeed()}`)}
                className="relative z-10 mt-3 self-start font-mono text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
                title="Músicas aleatórias, sem contar no desafio do dia"
              >
                treino livre
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="arquivo" className="mt-14 scroll-mt-6">
        <h2 className="display text-4xl">Arquivo</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setArchiveMode(m.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-medium transition ${
                archiveMode === m.id ? "border-fg bg-fg text-bg" : "border-line hover:border-fg"
              }`}
            >
              <ModeIcon mode={m.id} className="size-4" />
              {m.name}
            </button>
          ))}
        </div>
        {today && (
          <div className="mt-6 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 lg:grid-cols-10">
            {Array.from({ length: LOCKED_PREVIEW }, (_, i) => LOCKED_PREVIEW - i).map((k) => (
              <div key={`locked-${k}`} className="text-center opacity-35" title={`Libera em ${formatDay(keyFromDayNumber(todayNumber + k))}`}>
                <Vinyl color="var(--line)" className="w-full" />
                <p className="mt-1.5 font-mono text-xs">{todayNumber + k}</p>
                <p className="text-[11px] text-muted">{k === 1 ? "amanhã" : `em ${k} dias`}</p>
              </div>
            ))}
            {Array.from({ length: todayNumber }, (_, i) => todayNumber - i).map((n) => {
              const day = keyFromDayNumber(n);
              const tone = gameTone(game(day, archiveMode));
              return (
                <Link key={n} href={playHref(archiveMode, day)} className="group text-center">
                  <Vinyl
                    color={tone === "empty" ? category.color : DISC_LABEL[tone]}
                    slow
                    className="w-full transition group-hover:scale-105 group-hover:[animation-play-state:running]"
                  />
                  <p className="mt-1.5 font-mono text-xs font-medium">{n}</p>
                  <p className="text-[11px] text-muted">{n === todayNumber ? "hoje" : formatDay(day)}</p>
                </Link>
              );
            })}
          </div>
        )}
        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-good" /> acertou
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-bad" /> errou
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-mid" /> em andamento
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: category.color }} /> não jogado
          </span>
        </p>
      </section>
    </div>
  );
}
