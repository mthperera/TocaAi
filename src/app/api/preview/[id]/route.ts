import { getTrack } from "@/lib/catalog";

const UNAVAILABLE = "Prévia indisponível";

function secondsUntilExpiry(url: string): number {
  const exp = Number(/exp=(\d+)/.exec(url)?.[1]);
  if (!Number.isFinite(exp)) return 300;
  return Math.max(0, Math.min(1200, exp - Math.floor(Date.now() / 1000) - 120));
}

export async function GET(req: Request, ctx: RouteContext<"/api/preview/[id]">) {
  const { id } = await ctx.params;
  const trackId = Number(id);
  if (!Number.isInteger(trackId) || !getTrack(trackId)) {
    return Response.json({ error: "Música fora do catálogo" }, { status: 404 });
  }

  const meta = await fetch(`https://api.deezer.com/track/${trackId}`)
    .then((r) => r.json())
    .catch(() => null);
  if (!meta) return Response.json({ error: "Deezer fora do ar" }, { status: 502 });
  if (meta.error?.code === 4) {
    return Response.json({ error: "Deezer ocupado" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const url: unknown = meta.readable === false ? null : meta.preview;
  if (typeof url !== "string" || !URL.canParse(url) || !new URL(url).hostname.endsWith(".dzcdn.net")) {
    return Response.json({ error: UNAVAILABLE }, { status: 404, headers: { "Cache-Control": "public, s-maxage=600" } });
  }

  if (new URL(req.url).searchParams.has("stream")) {
    const audio = await fetch(url).catch(() => null);
    if (!audio?.ok || !audio.body) return Response.json({ error: UNAVAILABLE }, { status: 502 });
    return new Response(audio.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  }

  const ttl = secondsUntilExpiry(url);
  return Response.json({ url }, { headers: { "Cache-Control": `public, max-age=${ttl}, s-maxage=${ttl}` } });
}
