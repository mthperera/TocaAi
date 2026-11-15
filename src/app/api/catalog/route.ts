import catalogJson from "@/data/catalog.json";

export function GET() {
  return Response.json(catalogJson, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
