"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadTrack } from "@/lib/audio";
import { coverUrl, sameSong, type Track } from "@/lib/catalog";
import { distractors, shuffled } from "@/lib/daily";
import { BLITZ_SECONDS, blitzPoints } from "@/lib/modes";
import { saveGame, type RoundsGame } from "@/lib/progress";
import { Equalizer, PlayIcon, Square, buttonPrimary } from "../ui";
import { Turntable } from "./Turntable";
import { useClipPlayer } from "./useClipPlayer";

type Props = {
  tracks: Track[];
  optionPool: Track[];
  seed: string;
  color: string;
  caption: string;
  storageKey: string | null;
  saved?: RoundsGame;
  footer: React.ReactNode;
};

const LETTERS = ["A", "B", "C", "D"];
const NEXT_DELAY_MS = 2200;
const CLIP = { start: "refrao" as const, duration: BLITZ_SECONDS };

export function BlitzGame({ tracks, optionPool, seed, color, caption, storageKey, saved, footer }: Props) {
  const initial: RoundsGame = saved ?? { kind: "rounds", rounds: [], total: 0, status: "playing" };
  const [game, setGame] = useState<RoundsGame>(initial);
  const gameRef = useRef(initial);
  const [phase, setPhase] = useState<"idle" | "playing" | "answered">("idle");
  const [choice, setChoice] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(initial.status === "done");
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audio = useClipPlayer();

  const round = phase === "answered" ? game.rounds.length - 1 : game.rounds.length;
  const answer = tracks[Math.min(round, tracks.length - 1)];

  const [firstId] = useState(() => tracks[Math.min(initial.rounds.length, tracks.length - 1)].id);

  useEffect(() => {
    void loadTrack(firstId).catch(() => null);
  }, [firstId]);

  useEffect(
    () => () => {
      if (nextTimer.current) clearTimeout(nextTimer.current);
    },
    [],
  );

  const options = useMemo(
    () => shuffled([answer, ...distractors(answer, optionPool, `${seed}|opcoes|${round}`)], `${seed}|ordem|${round}`),
    [answer, optionPool, seed, round],
  );

  const playRound = (i: number) => {
    setChoice(null);
    setPhase("playing");
    void audio.play(tracks[i].id, CLIP, () => finish(i, null));
    const upcoming = tracks[i + 1];
    if (upcoming) void loadTrack(upcoming.id).catch(() => {});
  };

  function finish(i: number, picked: Track | null) {
    const current = gameRef.current;
    if (current.rounds.length !== i) return;
    audio.stop();
    const target = tracks[i];
    const correct = !!picked && sameSong(picked, target);
    const points = correct ? blitzPoints(picked ? audio.elapsedRef.current : BLITZ_SECONDS) : 0;
    const rounds = [...current.rounds, { trackId: target.id, points, correct, answer: picked ? picked.title : "—" }];
    const next: RoundsGame = {
      kind: "rounds",
      rounds,
      total: rounds.reduce((s, r) => s + r.points, 0),
      status: rounds.length >= tracks.length ? "done" : "playing",
    };
    gameRef.current = next;
    setGame(next);
    setChoice(picked?.id ?? null);
    setPhase("answered");
    if (storageKey) saveGame(storageKey, next);
    nextTimer.current = setTimeout(() => {
      if (next.status === "done") setShowSummary(true);
      else playRound(i + 1);
    }, NEXT_DELAY_MS);
  }

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      const idx = "1234".includes(k) ? Number(k) - 1 : LETTERS.indexOf(k);
      if (idx >= 0 && options[idx]) finish(round, options[idx]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (showSummary) return <BlitzSummary game={game} tracks={tracks} footer={footer} />;

  const last = game.rounds[game.rounds.length - 1];
  const left = phase === "playing" ? 1 - audio.elapsed / BLITZ_SECONDS : phase === "idle" ? 1 : 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
      <div className="mx-auto w-full max-w-[280px] lg:max-w-none">
        <Turntable
          color={color}
          spinning={audio.playing}
          cover={phase === "answered" ? answer.cover : null}
          caption={caption}
        />
      </div>

      <div className="min-w-0 space-y-5">
        <div className="flex items-end justify-between">
          <p className="display text-4xl">
            {round + 1}
            <span className="text-muted">/{tracks.length}</span>
          </p>
          <p className="display text-4xl tabular-nums">
            {game.total} <span className="text-xl text-muted">pts</span>
          </p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent" style={{ width: `${left * 100}%` }} />
        </div>

        {phase === "idle" ? (
          <button
            onClick={() => playRound(round)}
            disabled={audio.loading}
            className={`${buttonPrimary} h-16 w-full text-lg`}
          >
            {audio.loading ? (
              <Equalizer />
            ) : (
              <>
                <PlayIcon /> {round === 0 ? "Começar" : "Continuar"}
              </>
            )}
          </button>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {options.map((t, i) => {
              const isAnswer = sameSong(t, answer);
              const style =
                phase === "answered"
                  ? isAnswer
                    ? "border-good bg-good text-white"
                    : choice === t.id
                      ? "border-bad bg-bad text-white"
                      : "border-line opacity-40"
                  : "border-fg bg-card hover:bg-fg hover:text-bg";
              return (
                <button
                  key={t.id}
                  disabled={phase !== "playing" || audio.loading}
                  onClick={() => finish(round, t)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-2.5 text-left transition ${style}`}
                >
                  <span className="relative shrink-0">
                    <Image
                      src={coverUrl(t.cover, 120)}
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="size-14 rounded-lg"
                    />
                    <span className="display absolute -top-1.5 -left-1.5 grid size-6 place-items-center rounded-full bg-fg text-xs text-bg">
                      {LETTERS[i]}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{t.title}</span>
                    <span className="block truncate text-sm opacity-70">{t.artist}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {phase === "answered" && last && (
          <div className="flex items-center justify-between gap-3">
            <p className="display text-3xl">
              {last.correct ? `+${last.points}` : choice === null ? "Acabou o tempo" : "Errou"}
            </p>
            <p className="text-sm text-muted">
              {game.status === "done" ? "Calculando resultado…" : "Próxima música já vai tocar…"}
            </p>
          </div>
        )}
        {phase === "idle" && round > 0 && (
          <p className="text-sm text-muted">Você parou na música {round + 1}. Continue de onde parou.</p>
        )}
        {audio.error && (
          <p className="text-sm text-bad">
            {audio.error}
            <button onClick={() => playRound(round)} className="ml-2 font-semibold text-fg underline underline-offset-4 hover:text-accent">
            Tentar de novo
          </button>
          </p>
        )}
      </div>
    </div>
  );
}

function BlitzSummary({
  game,
  tracks,
  footer,
}: {
  game: RoundsGame;
  tracks: Track[];
  footer: React.ReactNode;
}) {
  const hits = game.rounds.filter((r) => r.correct).length;
  const tone = (p: number, ok: boolean): "good" | "mid" | "bad" => (!ok ? "bad" : p >= 700 ? "good" : "mid");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="display text-8xl tabular-nums">{game.total}</p>
        <p className="mt-2 text-muted">
          pontos · acertou {hits} de {tracks.length}
        </p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2">
        {game.rounds.map((r, i) => {
          const t = tracks[i];
          return (
            <li key={i} className="flex items-center gap-3 rounded-xl border-2 border-line p-2">
              {t && (
                <Image src={coverUrl(t.cover, 120)} alt="" width={44} height={44} unoptimized className="size-11 rounded-md" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{t?.title}</span>
                <span className="block truncate text-xs text-muted">{t?.artist}</span>
              </span>
              <Square tone={tone(r.points, r.correct)} className="size-3" />
              <span className="w-9 text-right font-mono text-xs tabular-nums">{r.points}</span>
            </li>
          );
        })}
      </ol>
      <div className="border-t-2 border-line pt-5">{footer}</div>
    </div>
  );
}
