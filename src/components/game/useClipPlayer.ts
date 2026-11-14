"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadTrack, Player, type AudioSpec } from "@/lib/audio";

export function useClipPlayer() {
  const playerRef = useRef<Player | null>(null);
  const elapsedRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => playerRef.current?.stop(), []);

  const play = useCallback(async (trackId: number, spec: AudioSpec, onEnd?: () => void) => {
    playerRef.current?.stop();
    setLoading(true);
    setError(null);
    try {
      const track = await loadTrack(trackId);
      playerRef.current ??= new Player();
      elapsedRef.current = 0;
      setElapsed(0);
      setLoading(false);
      setPlaying(true);
      playerRef.current.play(track, spec, {
        onProgress: (e) => {
          elapsedRef.current = e;
          setElapsed(e);
        },
        onEnd: () => {
          setPlaying(false);
          onEnd?.();
        },
      });
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Não foi possível tocar a música.");
    }
  }, []);

  const stop = useCallback(() => {
    playerRef.current?.stop();
    setPlaying(false);
  }, []);

  return { play, stop, playing, loading, elapsed, elapsedRef, error };
}
