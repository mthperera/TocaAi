"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isPlayable } from "@/lib/audio";
import { getTrack, type Track } from "@/lib/catalog";
import { Equalizer } from "../ui";

function usePlayable(fixed: number[], candidates: number[], needed: number): Track[] | null {
  const key = JSON.stringify({ fixed, candidates, needed });
  const [state, setState] = useState<{ key: string; tracks: Track[] } | null>(null);

  useEffect(() => {
    let alive = true;
    const req = JSON.parse(key) as { fixed: number[]; candidates: number[]; needed: number };
    (async () => {
      const out = [...req.fixed];
      const rest = req.candidates.filter((id) => !out.includes(id));
      let i = 0;
      while (out.length < req.needed && i < rest.length) {
        const batch = rest.slice(i, i + (req.needed - out.length));
        i += batch.length;
        const ok = await Promise.all(batch.map(isPlayable));
        batch.forEach((id, j) => {
          if (ok[j] && out.length < req.needed) out.push(id);
        });
      }
      if (alive) setState({ key, tracks: out.map((id) => getTrack(id)).filter((t) => t !== undefined) });
    })();
    return () => {
      alive = false;
    };
  }, [key]);

  return state?.key === key ? state.tracks : null;
}

export function Playable({
  fixed = [],
  candidates,
  needed,
  children,
}: {
  fixed?: number[];
  candidates: number[];
  needed: number;
  children: (tracks: Track[]) => ReactNode;
}) {
  const [req] = useState(() => ({ fixed, candidates, needed }));
  const tracks = usePlayable(req.fixed, req.candidates, req.needed);
  if (!tracks) {
    return (
      <p className="flex min-h-screen items-start justify-center gap-3 py-16 text-muted">
        <Equalizer /> Preparando o disco…
      </p>
    );
  }
  if (tracks.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed border-line py-12 text-center text-muted">
        As prévias dessas músicas estão indisponíveis no Deezer agora. Tente outro nível ou volte mais tarde.
      </p>
    );
  }
  return <>{children(tracks)}</>;
}
