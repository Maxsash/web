import { createSeaEdition } from "@/lib/sea/edition";
import { resolveApiSea } from "@/lib/sea/request";
import { conditionalResponse } from "./conditional";

export function GET(request: Request) {
  const sea = resolveApiSea(new URL(request.url));
  if ("error" in sea) {
    return Response.json(
      { error: sea.error },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  return conditionalResponse(
    request,
    `"sea-v${sea.version}-${sea.seed}"`,
    {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
    },
    () => JSON.stringify(createSeaEdition(sea.seed, sea.version)),
  );
}
