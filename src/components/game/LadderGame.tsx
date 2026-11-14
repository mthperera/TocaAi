"use client";

import { useState } from "react";
import Image from "next/image";
import { coverUrl, getTrack, sameArtist, sameSong, type Track } from "@/lib/catalog";
import { ladderStages, type LadderStage, type Mode } from "@/lib/modes";
import { saveGame, type GuessResult, type LadderGame as LadderState } from "@/lib/progress";
import { Equalizer, PlayIcon, RESULT_TONE, Square, StopIcon } from "../ui";
import { GuessInput } from "./GuessInput";
import { PixelCover } from "./PixelCover";
import { TrackCard } from "./TrackReveal";
import { Turntable } from "./Turntable";
import { usePlayer } from "./usePlayer";

type Props = {
  track: Track;
  mode: Mode;
  color: string;
  caption: string;
  storageKey: string | null;
  saved?: LadderState;
  footer: React.ReactNode;
};

const ROW: Record<GuessResult, string> = {
  correct: "border-good bg-good text-white",
  artist: "border-mid bg-mid text-[#141210]",
  wrong: "border-bad bg-bad text-white",
  skip: "border-line bg-soft text-muted",
};

const RESULT_TEXT: Record<GuessResult, string> = { correct: "certo", artist: "artista certo", wrong: "", skip: "" };

export function LadderGame({ track, mode, color, caption, storageKey, saved, footer }: Props) {
  const stages = ladderStages(mode.id);
  const [game, setGame] = useState<LadderState>(
    () => saved ?? { kind: "ladder", trackId: track.id, guesses: [], status: "playing" },
  );
  const audio = usePlayer(track.id);

  const finished = game.status !== "playing";
  const stageIndex = Math.min(game.guesses.length, stages.length - 1);
  const stage = stages[stageIndex];
  const isCover = mode.id === "capa";

  const record = (result: GuessResult, label: string, trackId?: number) => {
    audio.stop();
    const guesses = [...game.guesses, { label, result, ...(trackId ? { trackId } : {}) }];
    const status = result === "correct" ? "won" : guesses.length >= stages.length ? "lost" : "playing";
    const next: LadderState = { ...game, guesses, status };
    setGame(next);
    if (storageKey) saveGame(storageKey, next);
    const opened = stages[guesses.length]?.audio;
    if (status === "playing" && opened) audio.play(opened);
    else if (status !== "playing") audio.play({ duration: 30 });
  };

  const skip = () => record("skip", `Pulou ${stage.label}`);

  const nextLabel = stages[stageIndex + 1]?.label;

  return (
    <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16">
      <div className="mx-auto w-full max-w-[300px] lg:max-w-none">
        {isCover && !finished ? (
          <PixelCover md5={track.cover} pixels={stage.pixels ?? null} />
        ) : (
          <Turntable color={color} spinning={audio.playing} cover={finished ? track.cover : null} caption={caption} />
        )}
        {!finished && !isCover && (
          <Controls
            stage={stage}
            stages={stages}
            audio={audio}
            onSkip={skip}
            skipLabel={nextLabel ? `Próxima: ${nextLabel}` : "Desistir"}
          />
        )}
      </div>

      <div className="min-w-0 space-y-6">
        {finished && (
          <div className="space-y-5">
            <p className="display text-5xl">
              {game.status === "won"
                ? game.guesses.length === 1
                  ? "De primeira!"
                  : `Acertou na ${game.guesses.length}ª`
                : "Não foi dessa vez"}
            </p>
            <TrackCard track={track}>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => (audio.playing ? audio.stop() : audio.play({ duration: 30 }))}
                  disabled={!audio.ready}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-fg px-4 text-sm font-semibold text-bg transition hover:opacity-85 disabled:opacity-40"
                >
                  {audio.playing ? <StopIcon className="size-3.5" /> : <PlayIcon className="size-3.5" />}
                  {audio.playing ? "Parar" : "Ouvir a prévia"}
                </button>
                <a
                  href={`https://www.deezer.com/track/${track.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center px-2 text-sm font-semibold text-muted underline-offset-4 hover:text-fg hover:underline"
                >
                  Abrir no Deezer ↗
                </a>
              </div>
            </TrackCard>
            {isCover && (
              <div className="max-w-[200px]">
                <PixelCover md5={track.cover} pixels={null} />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex gap-1">
                {stages.map((_, i) => (
                  <Square key={i} tone={game.guesses[i] ? RESULT_TONE[game.guesses[i].result] : "empty"} className="size-3.5" />
                ))}
              </span>
            </div>
          </div>
        )}

        <ol className="space-y-1.5">
          {stages.map((s, i) => {
            const g = game.guesses[i];
            const current = i === stageIndex && !finished;
            const guessed = g?.trackId ? getTrack(g.trackId) : undefined;
            return (
              <li
                key={i}
                className={`flex items-center gap-3 rounded-lg border-2 px-3.5 py-2.5 text-sm ${
                  g ? ROW[g.result] : current ? "border-fg bg-card" : "border-line text-muted"
                }`}
              >
                {guessed ? (
                  <Image
                    src={coverUrl(guessed.cover, 56)}
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                    className="-my-1 size-7 shrink-0 rounded"
                  />
                ) : (
                  <span className="w-4 font-mono text-xs opacity-70">{i + 1}</span>
                )}
                <span className="min-w-0 flex-1 truncate font-medium">{g ? g.label : s.label}</span>
                {g && RESULT_TEXT[g.result] && <span className="text-xs opacity-80">{RESULT_TEXT[g.result]}</span>}
              </li>
            );
          })}
        </ol>

        {!finished && (
          <GuessInput
            onGuess={(t) =>
              record(
                sameSong(t, track) ? "correct" : sameArtist(t, track) ? "artist" : "wrong",
                `${t.title} — ${t.artist}`,
                t.id,
              )
            }
            showCovers={!isCover}
            onSkip={isCover ? skip : undefined}
            skipLabel={nextLabel ? `Próxima: ${nextLabel}` : "Desistir"}
          />
        )}

        {finished && <div className="border-t-2 border-line pt-5">{footer}</div>}
      </div>
    </div>
  );
}

function Controls({
  stage,
  stages,
  audio,
  onSkip,
  skipLabel,
}: {
  onSkip: () => void;
  skipLabel: string;
  stage: LadderStage;
  stages: LadderStage[];
  audio: ReturnType<typeof usePlayer>;
}) {
  const spec = stage.audio!;
  const max = Math.max(...stages.map((s) => s.audio?.duration ?? 0));
  const elapsed = audio.playing ? audio.elapsed : 0;

  const meta = spec.lowpass
    ? `filtro em ${spec.lowpass} Hz`
    : spec.reverse
      ? `${spec.duration}s ao contrário`
      : `${spec.duration}s liberados`;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => (audio.playing ? audio.stop() : audio.play(spec))}
          disabled={!audio.ready}
          aria-label={audio.playing ? "Parar" : `Tocar trecho: ${stage.label}`}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-white shadow-[0_8px_20px_-8px_var(--accent)] transition hover:brightness-110 active:scale-95 disabled:opacity-40"
        >
          {audio.error ? "!" : !audio.ready ? <Equalizer /> : audio.playing ? <StopIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={onSkip}
          disabled={!audio.ready}
          className="inline-flex h-14 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-fg pr-2 pl-5 text-sm font-semibold text-bg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
        >
          <span className="truncate">{skipLabel}</span>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg/15" aria-hidden>
            <svg viewBox="0 0 16 16" className="size-4">
              <path d="M2.5 3v10l7-5zM9.5 3v10l5-5z" fill="currentColor" />
            </svg>
          </span>
        </button>
      </div>
      <div className="mt-4 flex h-2.5 items-center gap-[3px]" aria-hidden>
        {Array.from({ length: Math.ceil(max) }, (_, i) => (
          <span
            key={i}
            className={`relative h-full flex-1 overflow-hidden rounded-[2px] ${i < spec.duration ? "bg-fg/30" : "bg-line"}`}
          >
            <span
              className="absolute inset-y-0 left-0 bg-accent"
              style={{ width: `${Math.max(0, Math.min(1, elapsed - i)) * 100}%` }}
            />
          </span>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-muted">
        <span>{meta}</span>
        <span className="tabular-nums">
          {elapsed.toFixed(1)} / {spec.duration}s
        </span>
      </div>

      {audio.error && (
        <p className="mt-3 text-sm text-bad">
          {audio.error}
          <button onClick={audio.retry} className="ml-2 font-semibold text-fg underline underline-offset-4 hover:text-accent">
            Tentar de novo
          </button>
        </p>
      )}
    </div>
  );
}
