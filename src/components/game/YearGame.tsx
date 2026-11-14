"use client";

import { useEffect, useState } from "react";
import { loadTrack } from "@/lib/audio";
import type { Track } from "@/lib/catalog";
import { yearPoints } from "@/lib/modes";
import { saveGame, type RoundsGame } from "@/lib/progress";
import { Equalizer, PlayIcon, Square, StopIcon, buttonPrimary, buttonSecondary } from "../ui";
import { TrackCard } from "./TrackReveal";
import { Turntable } from "./Turntable";
import { useClipPlayer } from "./useClipPlayer";

const CLIP = { start: "refrao" as const, duration: 15 };
const MIN_YEAR = 1975;
const MAX_YEAR = 2026;

type Props = {
  tracks: Track[];
  color: string;
  storageKey: string | null;
  saved?: RoundsGame;
  footer: React.ReactNode;
};

const tone = (p: number): "good" | "mid" | "bad" => (p >= 50 ? "good" : p > 0 ? "mid" : "bad");

function Digits({ value }: { value: string }) {
  return (
    <span className="flex gap-1.5">
      {value.split("").map((d, i) => (
        <span
          key={i}
          className="display relative grid h-24 w-16 place-items-center overflow-hidden rounded-lg bg-fg text-7xl text-bg sm:h-28 sm:w-20 sm:text-8xl"
        >
          {d}
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-bg/40" />
        </span>
      ))}
    </span>
  );
}

export function YearGame({ tracks, color, storageKey, saved, footer }: Props) {
  const [game, setGame] = useState<RoundsGame>(() => saved ?? { kind: "rounds", rounds: [], total: 0, status: "playing" });
  const [answered, setAnswered] = useState(false);
  const [guess, setGuess] = useState(2000);

  const round = answered ? game.rounds.length - 1 : game.rounds.length;
  const track = tracks[Math.min(round, tracks.length - 1)];
  const audio = useClipPlayer();

  useEffect(() => {
    for (const t of tracks.slice(round, round + 2)) void loadTrack(t.id).catch(() => {});
  }, [tracks, round]);

  if (game.status === "done" && !answered) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="display text-8xl tabular-nums">
            {game.total}
            <span className="text-4xl text-muted">/{tracks.length * 100}</span>
          </p>
          <p className="mt-2 text-muted">pontos</p>
        </div>
        <ol className="space-y-1.5 text-sm">
          {game.rounds.map((r, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border-2 border-line px-3 py-2">
              <Square tone={tone(r.points)} className="size-3" />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{tracks[i]?.title}</span> <span className="text-muted">— {tracks[i]?.artist}</span>
              </span>
              <span className="font-mono text-xs">
                {r.answer} → {tracks[i]?.year}
              </span>
            </li>
          ))}
        </ol>
        <div className="border-t-2 border-line pt-5">{footer}</div>
      </div>
    );
  }

  const confirm = () => {
    audio.stop();
    const points = yearPoints(guess - (track.year ?? guess));
    const rounds = [...game.rounds, { trackId: track.id, points, correct: points > 0, answer: String(guess) }];
    const next: RoundsGame = {
      kind: "rounds",
      rounds,
      total: rounds.reduce((s, r) => s + r.points, 0),
      status: rounds.length >= tracks.length ? "done" : "playing",
    };
    setGame(next);
    setAnswered(true);
    if (storageKey) saveGame(storageKey, next);
  };

  const last = game.rounds[game.rounds.length - 1];

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16">
      <div className="mx-auto w-full max-w-[300px] lg:max-w-none">
        <Turntable color={color} spinning={audio.playing} cover={track.cover} />
      </div>

      <div className="min-w-0 space-y-6">
        <div className="flex items-end justify-between">
          <p className="display text-4xl">
            {round + 1}
            <span className="text-muted">/{tracks.length}</span>
          </p>
          <p className="display text-4xl tabular-nums">
            {game.total} <span className="text-xl text-muted">pts</span>
          </p>
        </div>

        <TrackCard track={track} showYear={answered} showCover={false}>
          <button
            onClick={() => (audio.playing ? audio.stop() : audio.play(track.id, CLIP))}
            disabled={audio.loading}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-fg px-4 text-sm font-semibold text-bg transition hover:opacity-85 disabled:opacity-40"
          >
            {audio.loading ? <Equalizer /> : audio.playing ? <StopIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
            {audio.playing ? "Parar" : "Ouvir o refrão"}
          </button>
          {audio.error && <p className="mt-2 text-sm text-bad">{audio.error} Toque em ouvir de novo.</p>}
        </TrackCard>

        {!answered ? (
          <div className="space-y-5 rounded-xl border-2 border-fg bg-card p-5">
            <p className="text-sm text-muted">Em que ano essa música estava nas paradas?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setGuess((g) => Math.max(MIN_YEAR, g - 1))}
                aria-label="Um ano antes"
                className={`${buttonSecondary} w-12 px-0 text-xl`}
              >
                −
              </button>
              <Digits value={String(guess)} />
              <button
                onClick={() => setGuess((g) => Math.min(MAX_YEAR, g + 1))}
                aria-label="Um ano depois"
                className={`${buttonSecondary} w-12 px-0 text-xl`}
              >
                +
              </button>
            </div>
            <input
              type="range"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={guess}
              onChange={(e) => setGuess(Number(e.target.value))}
              aria-label="Ano"
              className="w-full"
            />
            <button onClick={confirm} className={`${buttonPrimary} w-full`}>
              Confirmar {guess}
            </button>
          </div>
        ) : (
          last && (
            <div className="space-y-4 rounded-xl border-2 border-fg bg-card p-5">
              <p className="display text-3xl">
                {last.points === 100 ? "Na mosca!" : last.points > 0 ? `Perto: +${last.points}` : "Longe: 0 pontos"}
              </p>
              <div className="flex items-center gap-4">
                <Digits value={String(track.year)} />
              </div>
              <p className="text-sm text-muted">
                Você chutou <span className="font-mono text-fg">{last.answer}</span>.
              </p>
              <button
                onClick={() => {
                  setAnswered(false);
                  if (game.status === "done") audio.stop();
                  else void audio.play(tracks[game.rounds.length].id, CLIP);
                }}
                className={`${buttonSecondary} w-full`}
              >
                {game.status === "done" ? "Ver resultado" : "Próxima música"}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
