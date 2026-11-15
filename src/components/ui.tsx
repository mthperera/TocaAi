"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { msUntilNextDay } from "@/lib/daily";
import type { ModeId } from "@/lib/modes";
import { isWin, type GuessResult, type SavedGame } from "@/lib/progress";

function subscribeSecond(listener: () => void) {
  const t = setInterval(listener, 1000);
  return () => clearInterval(t);
}

export function Countdown({ className = "" }: { className?: string }) {
  const second = useSyncExternalStore(
    subscribeSecond,
    () => Math.floor(Date.now() / 1000),
    () => null,
  );
  if (second === null) return <span className={`font-mono ${className}`}>--:--:--</span>;
  const total = Math.floor(msUntilNextDay(new Date(second * 1000)) / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return <span className={`font-mono tabular-nums ${className}`}>{`${h}:${m}:${s}`}</span>;
}

export type SquareTone = "good" | "mid" | "bad" | "skip" | "empty";

const SQUARE: Record<SquareTone, string> = {
  good: "bg-good",
  mid: "bg-mid",
  bad: "bg-bad",
  skip: "bg-muted/60",
  empty: "bg-line",
};

export const TONE_BG = SQUARE;

export function Square({ tone, className = "" }: { tone: SquareTone; className?: string }) {
  return <span aria-hidden className={`inline-block size-2.5 shrink-0 rounded-[2px] ${SQUARE[tone]} ${className}`} />;
}

export const RESULT_TONE: Record<GuessResult, SquareTone> = {
  correct: "good",
  artist: "mid",
  wrong: "bad",
  skip: "skip",
};

export function gameTone(game: SavedGame | undefined): SquareTone {
  if (!game) return "empty";
  if (game.status === "playing") return "mid";
  return isWin(game) ? "good" : "bad";
}

export function GameStatus({ game, attempts }: { game: SavedGame | undefined; attempts: number }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";
  if (!game) return <span className={`${base} bg-fg text-bg`}>Jogar</span>;
  if (game.status === "playing") return <span className={`${base} bg-mid text-[#141210]`}>Em andamento</span>;
  if (game.kind === "rounds") return <span className={`${base} bg-good font-mono text-white`}>{game.total} pts</span>;
  return game.status === "won" ? (
    <span className={`${base} bg-good font-mono text-white`}>
      ✓ {game.guesses.length}/{attempts}
    </span>
  ) : (
    <span className={`${base} bg-bad text-white`}>Errou</span>
  );
}

export function Equalizer({ className = "" }: { className?: string }) {
  return (
    <span aria-label="Carregando" className={`eq inline-flex h-3.5 items-end gap-[2px] ${className}`}>
      <span />
      <span />
      <span />
    </span>
  );
}

export function PlayIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />
    </svg>
  );
}

export function StopIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" fill="currentColor" />
    </svg>
  );
}

const MODE_PATHS: Record<ModeId, ReactNode> = {
  classico: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 13.5V9.5M10 2.5h4M12 2.5v3.5M18.5 6.5l1.5-1.5" />
    </>
  ),
  reverso: <path d="M11 6.5 4 12l7 5.5zM20 6.5 13 12l7 5.5z" />,
  abafado: <path d="M3 8.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />,
  capa: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" />
    </>
  ),
  relampago: <path d="M13.5 2.5 5 13.5h6.5L10.5 21.5 19 10.5h-6.5z" />,
  ano: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 2.5v4M16 2.5v4" />
    </>
  ),
};

export function ModeIcon({ mode, className = "size-6" }: { mode: ModeId; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {MODE_PATHS[mode]}
    </svg>
  );
}

export const buttonPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-white transition hover:brightness-110 active:translate-y-px disabled:opacity-35";
export const buttonSecondary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-fg px-5 font-semibold transition hover:bg-fg hover:text-bg disabled:opacity-40";
