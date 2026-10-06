import { createSeaEdition, DEFAULT_SEA_SEED, normaliseSeaSeed, parseSeaVersion } from "@/lib/sea-edition";

/** Authored deterministic data only; this endpoint never fetches an upstream feed. */
export function GET(request: Request) {
  const url = new URL(request.url);
  const seeds = url.searchParams.getAll("seed");
  const seed = normaliseSeaSeed(seeds[0] ?? DEFAULT_SEA_SEED);
  if (seed === null || seeds.length > 1) {
    return Response.json({ error: "Provide one seed containing exactly eight hexadecimal characters." }, {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }
  // An unversioned request is always version 1, so old links keep their meaning.
  const requested = url.searchParams.get("version");
  const version = requested === null ? "1" : parseSeaVersion(requested);
  if (version === null) {
    return Response.json({ error: "This endpoint supports sea model versions 1 and 2." }, { status: 400 });
  }

  const etag = `"sea-v${version}-${seed}"`;
  const headers = {
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
  };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }
  return Response.json(createSeaEdition(seed, version), { headers });
}
