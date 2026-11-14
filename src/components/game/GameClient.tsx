"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getPool, getTrack, getYearPool, MIN_YEAR_POOL, type Track } from "@/lib/catalog";
import {
  DIFFICULTIES,
  getCategory,
  isDifficulty,
  type Difficulty,
} from "@/lib/categories";
import { dailyTracks, dayNumber, formatDay, isDateKey, randomSeed } from "@/lib/daily";
import { getMode, type Mode } from "@/lib/modes";
import { gameKey, useProgress, useToday } from "@/lib/progress";
import { Countdown, buttonSecondary } from "../ui";
import { Breadcrumbs } from "../Breadcrumbs";
import { BlitzGame } from "./BlitzGame";
import { DayPicker } from "./DayPicker";
import { LadderGame } from "./LadderGame";
import { Playable } from "./Playable";
import { YearGame } from "./YearGame";

const footerLink = "font-semibold underline-offset-4 transition hover:text-accent hover:underline";

function useGameParams(categoryId: string, modeId: string) {
  const params = useSearchParams();
  const today = useToday();
  const category = getCategory(categoryId)!;
  const mode = getMode(modeId)!;
  const nivel = params.get("nivel");
  const difficulty: Difficulty = isDifficulty(nivel) ? nivel : "facil";
  const practice = params.get("treino");
  const diaParam = params.get("dia");
  const base = `/jogar/${category.id}/${mode.id}?nivel=${difficulty}`;
  const categoryHref = `/categoria/${category.id}?nivel=${difficulty}`;
  const difficultyName = DIFFICULTIES.find((d) => d.id === difficulty)!.name;
  const day = today ? (isDateKey(diaParam) ? diaParam : today) : null;
  const n = day ? dayNumber(day) : 0;
  const todayN = today ? dayNumber(today) : 0;
  return { category, mode, difficulty, practice, base, categoryHref, difficultyName, today, day, n, todayN };
}

export function GameNav({ categoryId, modeId }: { categoryId: string; modeId: string }) {
  const { category, mode, difficulty, practice, base, categoryHref, difficultyName, today, n, todayN } = useGameParams(
    categoryId,
    modeId,
  );
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <Breadcrumbs
        back={{ href: categoryHref, label: `Voltar para ${category.name}` }}
        items={[
          { label: "Início", href: "/" },
          { label: `${category.name} · ${difficultyName}`, href: categoryHref },
          { label: mode.name },
        ]}
      />
      {practice ? (
        <span className="font-mono text-xs text-muted">treino livre</span>
      ) : (
        today && (
          <DayPicker
            base={base}
            categoryId={category.id}
            categoryColor={category.color}
            modeId={mode.id}
            difficulty={difficulty}
            title={`${mode.name} · ${category.name} · ${difficultyName}`}
            current={n}
            today={todayN}
          />
        )
      )}
    </div>
  );
}

export function GameClient({ categoryId, modeId }: { categoryId: string; modeId: string }) {
  const router = useRouter();
  const progress = useProgress();
  const { category, mode, difficulty, practice, base, categoryHref, today, day, n, todayN } = useGameParams(
    categoryId,
    modeId,
  );

  if (!today || !day) return null;

  if (!practice && (n > todayN || n < 1)) {
    return (
      <>
        <div className="rounded-xl border-2 border-dashed border-line py-14 text-center">
          <p className="display text-4xl">{n < 1 ? "Antes do nº 1" : "Ainda trancado"}</p>
          {n > todayN && (
            <p className="mt-3 text-muted">
              Libera em {formatDay(day)}
              {n === todayN + 1 && (
                <>
                  , daqui a <Countdown className="text-fg" />
                </>
              )}
              .
            </p>
          )}
          <Link href={base} className={`${buttonSecondary} mt-6`}>
            Jogar o de hoje
          </Link>
        </div>
      </>
    );
  }

  const seed = practice ? `treino|${practice}` : `${category.id}|${difficulty}|${mode.id}`;
  const dayIndex = practice ? 1 : n;
  const storageKey = practice ? null : gameKey(day, category.id, mode.id, difficulty);
  const saved = storageKey ? progress.games[storageKey] : undefined;
  const caption = practice ? "treino" : `nº ${n}`;

  const footer = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      {!practice && (
        <span className="text-muted">
          Próximo em <Countdown className="text-fg" />
        </span>
      )}
      <button onClick={() => router.push(`${base}&treino=${randomSeed()}`)} className={footerLink}>
        {practice ? "Outra rodada de treino" : "Treinar com músicas aleatórias"}
      </button>
      <Link href={categoryHref} className={footerLink}>
        Outros modos de {category.name}
      </Link>
    </div>
  );

  const key = storageKey ?? seed;

  return renderMode(mode);

  function renderMode(m: Mode) {
    const rounds = m.kind === "ladder" ? 1 : (m.rounds ?? 5);
    const pool = m.id === "ano" ? getYearPool(category.id, difficulty) : getPool(category.id, difficulty);
    if (m.id === "ano" && pool.length < MIN_YEAR_POOL) {
      return <Empty reason="Essa categoria não tem músicas com ano conhecido suficientes. Tente uma das décadas." />;
    }
    const candidates = unique([
      ...dailyTracks(pool, seed, dayIndex, rounds),
      ...dailyTracks(pool, `${seed}|reserva`, dayIndex, rounds + 5),
    ]);
    if (candidates.length === 0) return <Empty />;

    if (m.kind === "ladder") {
      const savedLadder = saved?.kind === "ladder" ? saved : undefined;
      const fixed = savedLadder && getTrack(savedLadder.trackId) ? [savedLadder.trackId] : [];
      return (
        <Playable key={key} fixed={fixed} candidates={candidates} needed={1}>
          {([track]) => (
            <LadderGame
              track={track}
              mode={m}
              color={category.color}
              caption={caption}
              storageKey={storageKey}
              saved={savedLadder}
              footer={footer}
            />
          )}
        </Playable>
      );
    }

    const savedRounds = saved?.kind === "rounds" ? saved : undefined;
    const fixed = (savedRounds?.rounds ?? []).map((r) => r.trackId).filter((id) => getTrack(id));
    return (
      <Playable key={key} fixed={fixed} candidates={candidates} needed={rounds}>
        {(tracks) =>
          m.id === "ano" ? (
            <YearGame
              tracks={tracks}
              color={category.color}
              storageKey={storageKey}
              saved={savedRounds}
              footer={footer}
            />
          ) : (
            <BlitzGame
              tracks={tracks}
              optionPool={optionPoolFor(category.id, tracks)}
              seed={`${seed}|${dayIndex}`}
              color={category.color}
              caption={caption}
              storageKey={storageKey}
              saved={savedRounds}
              footer={footer}
            />
          )
        }
      </Playable>
    );
  }
}

function unique(tracks: Track[]): number[] {
  return [...new Set(tracks.map((t) => t.id))];
}

function optionPoolFor(categoryId: string, fallback: Track[]): Track[] {
  const all = getPool(categoryId, "todas");
  return all.length >= 4 ? all : fallback;
}

function Empty({ reason }: { reason?: string }) {
  return (
    <p className="rounded-xl border-2 border-dashed border-line py-12 text-center text-muted">
      {reason ?? "Não há músicas suficientes nesse nível. Tente outro nível."}
    </p>
  );
}
