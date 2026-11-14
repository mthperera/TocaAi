"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { coverUrl, searchTracks, type Track } from "@/lib/catalog";
import { buttonPrimary, buttonSecondary } from "../ui";

type Props = {
  onGuess: (track: Track) => void;
  onSkip?: () => void;
  skipLabel: string;
  showCovers?: boolean;
};

export function GuessInput({ onGuess, onSkip, skipLabel, showCovers = true }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Track | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const listId = useId();

  const results = useMemo(() => (selected ? [] : searchTracks(query, 8)), [query, selected]);
  const typed = query.trim().length >= 2 && !selected;
  const showList = open && results.length > 0;
  const showEmpty = open && typed && results.length === 0;

  const choose = (t: Track) => {
    setSelected(t);
    setQuery(`${t.title} — ${t.artist}`);
    setOpen(false);
  };

  const submit = () => {
    if (!selected) return;
    onGuess(selected);
    setSelected(null);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && showList) {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp" && showList) {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showList) choose(results[active]);
      else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder="Digite a música ou o artista"
          aria-label="Seu chute"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-14 w-full rounded-full border-2 border-fg bg-card pr-6 pl-13 text-base outline-none transition placeholder:text-muted focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute bottom-full z-30 mb-2 max-h-80 w-full overflow-auto rounded-2xl border-2 border-fg bg-card p-1.5 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.5)]"
          >
            {results.map((t, i) => (
              <li
                key={t.id}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(t);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 ${i === active ? "bg-fg text-bg" : ""}`}
              >
                {showCovers && (
                  <Image
                    src={coverUrl(t.cover, 56)}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 shrink-0 rounded-md"
                  />
                )}
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{t.title}</span>
                  <span className={`block truncate text-sm ${i === active ? "opacity-70" : "text-muted"}`}>{t.artist}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {showEmpty && (
          <div className="absolute bottom-full z-30 mb-2 w-full rounded-2xl border-2 border-fg bg-card p-4 text-sm">
            <p className="font-semibold">Nenhuma música com “{query.trim()}” no catálogo.</p>
            <p className="mt-1 text-muted">Tente outro jeito de escrever ou busque pelo nome do artista.</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {onSkip && (
          <button onClick={onSkip} className={buttonSecondary}>
            {skipLabel}
          </button>
        )}
        <button onClick={submit} disabled={!selected} className={`${buttonPrimary} flex-1`}>
          {selected || !typed ? "Chutar" : "Escolha na lista"}
        </button>
      </div>
    </div>
  );
}
