import { version } from "@/package.json";
import { telemetryCatalog } from "@/lib/telemetry/catalog";
import { telemetryConfig } from "@/lib/telemetry/config";
import { posthogBatch } from "@/lib/telemetry/posthog";
import { sanitiseBatch } from "@/lib/telemetry/schema";
import { siteOrigin } from "@/lib/seo";

const reply = (status: number) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const config = telemetryConfig();
  if (!config.enabled || !config.token) return reply(204);
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url);
  requestOrigin.host = request.headers.get("host") ?? requestOrigin.host;
  if (origin !== requestOrigin.origin || request.headers.get("sec-fetch-site") === "cross-site")
    return reply(403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415);
  if (Number(request.headers.get("content-length")) > 16000) return reply(413);
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 16000) {
        await reader.cancel();
        return reply(413);
      }
      chunks.push(value);
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
    const batch = sanitiseBatch(JSON.parse(new TextDecoder().decode(body)), telemetryCatalog());
    if (!batch) return reply(400);
    const response = await fetch(`${config.host}/batch/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(posthogBatch(batch, config.token, version, siteOrigin)),
      signal: AbortSignal.timeout(3000),
      redirect: "error",
    });
    return reply(response.ok ? 204 : 503);
  } catch (error) {
    return reply(error instanceof SyntaxError ? 400 : 503);
  }
}
