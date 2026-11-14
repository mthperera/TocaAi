"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadTrack, Player, type AudioSpec, type LoadedTrack } from "@/lib/audio";

type LoadState = { key: string; track: LoadedTrack } | { key: string; error: string };

export function usePlayer(trackId: number | null) {
  const playerRef = useRef<Player | null>(null);
  const [load, setLoad] = useState<LoadState | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [total, setTotal] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const loadKey = `${trackId}:${attempt}`;

  useEffect(() => {
    if (trackId === null) return;
    let alive = true;
    const key = `${trackId}:${attempt}`;
    loadTrack(trackId).then(
      (track) => alive && setLoad({ key, track }),
      (err: Error) => alive && setLoad({ key, error: err.message }),
    );
    return () => {
      alive = false;
    };
  }, [trackId, attempt]);

  useEffect(() => () => playerRef.current?.stop(), []);

  const current = load && load.key === loadKey ? load : null;
  const loaded = current && "track" in current ? current.track : null;
  const error = current && "error" in current ? current.error : null;

  const play = useCallback(
    (spec: AudioSpec, onEnd?: () => void) => {
      if (!loaded) return;
      playerRef.current ??= new Player();
      setPlaying(true);
      setElapsed(0);
      const duration = playerRef.current.play(loaded, spec, {
        onProgress: (e) => setElapsed(e),
        onEnd: () => {
          setPlaying(false);
          onEnd?.();
        },
      });
      setTotal(duration);
    },
    [loaded],
  );

  const stop = useCallback(() => {
    playerRef.current?.stop();
    setPlaying(false);
    setElapsed(0);
  }, []);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { ready: !!loaded, error, loaded, play, stop, retry, playing, elapsed, total };
}
