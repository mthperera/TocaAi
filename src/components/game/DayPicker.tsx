"use client";

import Link from "next/link";
import { useRef } from "react";
import { formatDay, keyFromDayNumber } from "@/lib/daily";
import { gameKey, useProgress } from "@/lib/progress";
import { gameTone } from "../ui";
import { Vinyl } from "../Vinyl";

const LABEL = {
  good: "var(--good)",
  bad: "var(--bad)",
  mid: "var(--mid)",
  skip: "var(--line)",
  empty: "",
} as const;

type Props = {
  base: string;
  categoryId: string;
  categoryColor: string;
  modeId: string;
  difficulty: string;
  title: string;
  current: number;
  today: number;
};

export function DayPicker({ base, categoryId, categoryColor, modeId, difficulty, title, current, today }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const progress = useProgress();
  const close = () => dialogRef.current?.close();
  const days = Array.from({ length: today }, (_, i) => today - i);
  const label = (n: number) => (n === today ? "hoje" : formatDay(keyFromDayNumber(n)));

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex items-center gap-3 rounded-full border-2 border-fg py-1.5 pr-2 pl-4 text-sm transition hover:bg-fg hover:text-bg"
      >
        <span className="font-semibold">
          Desafio nº {current} · {label(current)}
        </span>
        <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold text-fg">Trocar dia</span>
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(640px,calc(100vw-32px))] rounded-2xl border-2 border-fg bg-bg p-0 text-fg backdrop:bg-black/50"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="display text-4xl">Escolha o dia</h2>
              <p className="mt-1 text-sm text-muted">{title}</p>
            </div>
            <button
              onClick={close}
              aria-label="Fechar"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-soft transition hover:bg-fg hover:text-bg"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="-mx-2 mt-4 grid max-h-[60vh] grid-cols-4 gap-x-3 gap-y-5 overflow-y-auto px-2 pt-2 pb-1 sm:grid-cols-6">
            <div className="text-center" title="Libera à meia-noite">
              <Vinyl color="var(--line)" className="w-full opacity-35" />
              <p className="mt-1.5 font-mono text-xs">nº {today + 1}</p>
              <p className="text-[11px] text-muted">amanhã</p>
            </div>
            {days.map((n) => {
              const tone = gameTone(progress.games[gameKey(keyFromDayNumber(n), categoryId, modeId, difficulty)]);
              const selected = n === current;
              return (
                <Link
                  key={n}
                  href={n === today ? base : `${base}&dia=${keyFromDayNumber(n)}`}
                  onClick={close}
                  aria-current={selected ? "date" : undefined}
                  className="group text-center"
                >
                  <Vinyl
                    color={LABEL[tone] || categoryColor}
                    slow
                    className={`w-full transition group-hover:scale-105 group-hover:[animation-play-state:running] ${
                      selected ? "ring-4 ring-accent ring-offset-2 ring-offset-bg" : ""
                    }`}
                  />
                  <p className={`mt-1.5 font-mono text-xs ${selected ? "font-semibold" : ""}`}>nº {n}</p>
                  <p className="text-[11px] text-muted">{label(n)}</p>
                </Link>
              );
            })}
          </div>

          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-good" /> Acertou
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-bad" /> Errou
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-mid" /> Em andamento
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: categoryColor }} /> Não jogado
            </span>
          </p>
        </div>
      </dialog>
    </>
  );
}
