"use client";

import { useSyncExternalStore } from "react";
import { dateKey, msUntilNextDay } from "./daily";

export type GuessResult = "correct" | "artist" | "wrong" | "skip";

export type LadderGame = {
  kind: "ladder";
  trackId: number;
  guesses: { label: string; result: GuessResult; trackId?: number }[];
  status: "playing" | "won" | "lost";
};

export type RoundsGame = {
  kind: "rounds";
  rounds: { trackId: number; points: number; correct: boolean; answer: string }[];
  total: number;
  status: "playing" | "done";
};

export type SavedGame = LadderGame | RoundsGame;

type Store = { games: Record<string, SavedGame> };

const KEY = "adivinha-musica:v1";
const EMPTY: Store = { games: {} };
let cache: Store | null = null;
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
    cache = parsed && typeof parsed === "object" && parsed.games ? parsed : { games: {} };
  } catch {
    cache = { games: {} };
  }
  return cache!;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function gameKey(day: string, category: string, mode: string, difficulty: string): string {
  return `${day}|${category}|${mode}|${difficulty}`;
}

function persist(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    return;
  }
}

export function saveGame(key: string, game: SavedGame) {
  const s = read();
  cache = { games: { ...s.games, [key]: game } };
  persist(cache);
  for (const l of listeners) l();
}

export function useProgress(): Store {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function isFinished(game: SavedGame | undefined): boolean {
  return !!game && game.status !== "playing";
}

export function isWin(game: SavedGame | undefined): boolean {
  if (!game) return false;
  if (game.kind === "ladder") return game.status === "won";
  return game.status === "done" && game.total > 0;
}

function subscribeDay(listener: () => void) {
  let timer = setTimeout(function tick() {
    listener();
    timer = setTimeout(tick, msUntilNextDay() + 500);
  }, msUntilNextDay() + 500);
  return () => clearTimeout(timer);
}

export function useToday(): string | null {
  return useSyncExternalStore(subscribeDay, () => dateKey(), () => null);
}

const noop = () => () => {};
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
