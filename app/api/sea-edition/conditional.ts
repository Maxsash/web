export function conditionalResponse(
  request: Request,
  etag: string,
  headers: Record<string, string>,
  body: () => BodyInit,
) {
  const cacheHeaders = { ...headers, ETag: etag };
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: cacheHeaders });
  }
  return new Response(body(), { headers: cacheHeaders });
}
