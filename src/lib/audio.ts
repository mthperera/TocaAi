
export type AudioSpec = {
  start?: number | "refrao";
  duration: number;
  hookWindow?: number;
  reverse?: boolean;
  lowpass?: number;
};

export type LoadedTrack = {
  mix: AudioBuffer;
  reversed?: AudioBuffer;
  hooks?: Record<number, number>;
};

let context: AudioContext | null = null;

export function audioContext(): AudioContext {
  if (!context) context = new AudioContext();
  return context;
}

async function decode(url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Não foi possível baixar o áudio (${res.status}).`);
  return audioContext().decodeAudioData(await res.arrayBuffer());
}

export class PreviewError extends Error {
  constructor(readonly unavailable: boolean) {
    super(unavailable ? "Prévia indisponível no Deezer." : "Não foi possível baixar o áudio.");
  }
}

const urlCache = new Map<number, Promise<string>>();

export function previewUrl(id: number): Promise<string> {
  let p = urlCache.get(id);
  if (!p) {
    p = fetch(`/api/preview/${id}`).then(async (res) => {
      const body = await res.json().catch(() => null);
      if (!res.ok || typeof body?.url !== "string") throw new PreviewError(res.status === 404);
      return body.url as string;
    });
    p.catch(() => urlCache.delete(id));
    urlCache.set(id, p);
  }
  return p;
}

export function isPlayable(id: number): Promise<boolean> {
  return previewUrl(id).then(
    () => true,
    (err) => !(err instanceof PreviewError && err.unavailable),
  );
}

async function decodePreview(id: number): Promise<AudioBuffer> {
  try {
    return await decode(await previewUrl(id));
  } catch (err) {
    if (err instanceof PreviewError) throw err;
    urlCache.delete(id);
  }
  try {
    return await decode(await previewUrl(id));
  } catch (err) {
    if (err instanceof PreviewError) throw err;
    return decode(`/api/preview/${id}?stream=1`);
  }
}

const cache = new Map<number, Promise<LoadedTrack>>();

export function loadTrack(id: number): Promise<LoadedTrack> {
  let p = cache.get(id);
  if (!p) {
    p = decodePreview(id).then((mix) => ({ mix }));
    p.catch(() => cache.delete(id));
    cache.set(id, p);
  }
  return p;
}

export function hookStart(track: LoadedTrack, seconds: number): number {
  track.hooks ??= {};
  const cached = track.hooks[seconds];
  if (cached !== undefined) return cached;
  const buf = track.mix;
  const block = Math.floor(buf.sampleRate * 0.25);
  const channels = Array.from({ length: buf.numberOfChannels }, (_, c) => buf.getChannelData(c));
  const energy: number[] = [];
  for (let start = 0; start + block <= buf.length; start += block) {
    let e = 0;
    for (const ch of channels) for (let i = start; i < start + block; i += 4) e += ch[i] * ch[i];
    energy.push(e);
  }
  const win = Math.max(1, Math.round(seconds / 0.25));
  let best = 0;
  let bestSum = -1;
  let sum = 0;
  for (let i = 0; i < energy.length; i++) {
    sum += energy[i];
    if (i >= win) sum -= energy[i - win];
    if (i >= win - 1 && sum > bestSum) {
      bestSum = sum;
      best = i - win + 1;
    }
  }
  const result = win >= energy.length ? 0 : best * 0.25;
  track.hooks[seconds] = result;
  return result;
}

function reversedOf(track: LoadedTrack): AudioBuffer {
  if (!track.reversed) {
    const src = track.mix;
    const out = audioContext().createBuffer(src.numberOfChannels, src.length, src.sampleRate);
    for (let ch = 0; ch < src.numberOfChannels; ch++) {
      const a = src.getChannelData(ch);
      const b = out.getChannelData(ch);
      for (let i = 0, n = a.length; i < n; i++) b[i] = a[n - 1 - i];
    }
    track.reversed = out;
  }
  return track.reversed;
}

function filter(ctx: AudioContext, type: BiquadFilterType, frequency: number, q = 0.707): BiquadFilterNode {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = q;
  return f;
}

function gain(ctx: AudioContext, value: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = value;
  return g;
}

function stopSource(s: AudioBufferSourceNode) {
  try {
    s.stop();
  } catch {
    return;
  }
}

function finite(n: unknown, fallback: number): number {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

export type PlayCallbacks = {
  onProgress?: (elapsed: number, total: number) => void;
  onEnd?: () => void;
};

export class Player {
  private sources: AudioBufferSourceNode[] = [];
  private output: GainNode | null = null;
  private frame = 0;
  private token = 0;

  play(track: LoadedTrack, spec: AudioSpec, cb: PlayCallbacks = {}): number {
    this.stop();
    const token = ++this.token;
    const ctx = audioContext();
    void ctx.resume();

    const base = spec.reverse ? reversedOf(track) : track.mix;
    const wanted = spec.start === "refrao" ? hookStart(track, spec.hookWindow ?? spec.duration) : spec.start;
    const start = finite(Math.max(0, Math.min(finite(wanted, 0), base.duration - 0.5)), 0);
    const duration = finite(Math.max(0.1, Math.min(finite(spec.duration, 10), base.duration - start)), 1);
    const offset = spec.reverse ? base.duration - start - duration : start;

    const t0 = ctx.currentTime + 0.05;
    const fade = Math.min(0.02, duration / 4);
    const out = gain(ctx, 0);
    out.gain.setValueAtTime(0, t0);
    out.gain.linearRampToValueAtTime(0.9, t0 + fade);
    out.gain.setValueAtTime(0.9, t0 + duration - fade);
    out.gain.linearRampToValueAtTime(0, t0 + duration);
    out.connect(ctx.destination);
    this.output = out;

    let dest: AudioNode = out;
    if (spec.lowpass) {
      const a = filter(ctx, "lowpass", spec.lowpass, 1);
      const b = filter(ctx, "lowpass", spec.lowpass, 0.6);
      a.connect(b);
      b.connect(out);
      dest = a;
    }

    const src = ctx.createBufferSource();
    src.buffer = base;
    src.connect(dest);
    this.sources.push(src);

    for (const s of this.sources) s.start(t0, offset, duration);
    this.sources[0].onended = () => {
      if (token !== this.token) return;
      this.stop();
      cb.onProgress?.(duration, duration);
      cb.onEnd?.();
    };

    const tick = () => {
      if (token !== this.token) return;
      cb.onProgress?.(Math.max(0, Math.min(duration, ctx.currentTime - t0)), duration);
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
    return duration;
  }

  stop() {
    this.token++;
    cancelAnimationFrame(this.frame);
    for (const s of this.sources) {
      s.onended = null;
      stopSource(s);
      s.disconnect();
    }
    this.sources = [];
    this.output?.disconnect();
    this.output = null;
  }
}
