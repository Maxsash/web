import {
  createSeaEdition,
  DEFAULT_SEA_SEED,
  normaliseSeaSeed,
  parseSeaVersion,
  renderSeaPlate,
} from "@/lib/sea-edition";

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
  const requested = url.searchParams.get("version");
  const version = requested === null ? "1" : parseSeaVersion(requested);
  if (version === null) {
    return new Response("This endpoint supports sea model versions 1 and 2.", { status: 400 });
  }

  const etag = `"sea-plate-v${version}-${seed}"`;
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
  const headers = {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, s-maxage=86400",
    "Content-Disposition": `${disposition}; filename="sea-${seed}-v${version}.svg"`,
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    "X-Content-Type-Options": "nosniff",
    ETag: etag,
  };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(renderSeaPlate(createSeaEdition(seed, version)), { headers });
}
