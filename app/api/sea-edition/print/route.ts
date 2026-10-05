import { createSeaEdition, DEFAULT_SEA_SEED, normaliseSeaSeed, renderSeaPlate } from "@/lib/sea-edition";

/** A vector plate generated from the very same edition coefficients as the scene. */
export function GET(request: Request) {
  const url = new URL(request.url);
  const seeds = url.searchParams.getAll("seed");
  const seed = normaliseSeaSeed(seeds[0] ?? DEFAULT_SEA_SEED);
  if (seed === null || seeds.length > 1) {
    return new Response("Provide one seed containing exactly eight hexadecimal characters.", {
      status: 400,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const version = url.searchParams.get("version");
  if (version !== null && version !== "1") {
    return new Response("This endpoint supports sea model version 1.", { status: 400 });
  }

  const etag = `"sea-plate-v1-${seed}"`;
  const headers = {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
    "Content-Disposition": `inline; filename="sea-${seed}-v1.svg"`,
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    "X-Content-Type-Options": "nosniff",
    ETag: etag,
  };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(renderSeaPlate(createSeaEdition(seed)), { headers });
}
