import { createSeaEdition } from "@/lib/sea/edition";
import { renderSeaPlate } from "@/lib/sea/plate";
import { resolveApiSea } from "@/lib/sea/request";
import { conditionalResponse } from "../conditional";

export function GET(request: Request) {
  const url = new URL(request.url);
  const sea = resolveApiSea(url);
  if ("error" in sea) {
    return new Response(sea.error, {
      status: 400,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
  return conditionalResponse(
    request,
    `"sea-plate-v${sea.version}-${sea.seed}"`,
    {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Disposition": `${disposition}; filename="sea-${sea.seed}-v${sea.version}.svg"`,
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
    () => renderSeaPlate(createSeaEdition(sea.seed, sea.version)),
  );
}
