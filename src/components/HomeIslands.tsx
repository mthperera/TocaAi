"use client";

import { dayNumber } from "@/lib/daily";
import { MODES } from "@/lib/modes";
import { gameKey, useProgress, useToday, type SavedGame } from "@/lib/progress";
import { Square, gameTone } from "./ui";

export function TodayLabel() {
  const today = useToday();
  const date = today
    ? new Date(`${today}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    : null;
  return (
    <p className="mt-2 text-muted">
      {today && date ? `Nº ${dayNumber(today)} · ${date.charAt(0).toUpperCase()}${date.slice(1)}` : <>&nbsp;</>}
    </p>
  );
}

const LEVELS = ["facil", "medio", "dificil", "todas"];

function bestGame(games: Record<string, SavedGame>, today: string, categoryId: string, modeId: string) {
  const all = LEVELS.map((level) => games[gameKey(today, categoryId, modeId, level)]).filter(Boolean);
  const rank = (g: SavedGame) => (g.status === "playing" ? 1 : gameTone(g) === "good" ? 3 : 2);
  return all.sort((a, b) => rank(b) - rank(a))[0];
}

export function TodayDots({ categoryId }: { categoryId: string }) {
  const today = useToday();
  const progress = useProgress();
  return (
    <span className="flex gap-[3px]" title="Modos jogados hoje">
      {MODES.map((m) => {
        const tone = today ? gameTone(bestGame(progress.games, today, categoryId, m.id)) : "empty";
        return (
          <Square
            key={m.id}
            tone={tone}
            className={`size-2 ${tone === "empty" ? "!bg-current opacity-25" : "ring-1 ring-black/20"}`}
          />
        );
      })}
    </span>
  );
}
