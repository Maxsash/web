/** Inventory actual route-referenced production assets, without npm dependencies.
 * Run after pnpm build: node tools/measure-routes.mjs --output=tools/.out/creative/assets.json
 * Gzip each unique referenced modern-browser file once per route; omit nomodule.
 * This is a payload inventory,
 * not browser transfer measurement or a Web Vitals/CPU benchmark.
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(".next/server/app");
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith(".html") ? [path] : [];
  });
const size = (data) => ({ raw: data.length, gzip: gzipSync(data).length });
const report = {};
for (const path of walk(root)) {
  const html = readFileSync(path);
  const source = html.toString();
  const assets = { js: new Set(), css: new Set(), fonts: new Set() };
  for (const tag of source.matchAll(/<(?:script|link)\b[^>]*>/g)) {
    if (/\bnomodule\b/i.test(tag[0])) continue;
    const src = tag[0].match(/(?:src|href)="(\/_next\/static\/[^"?]+)/)?.[1];
    if (!src) continue;
    if (tag[0].startsWith("<script") && src.endsWith(".js")) assets.js.add(src);
    if (tag[0].includes('rel="stylesheet"') && src.endsWith(".css")) assets.css.add(src);
    if (tag[0].includes('as="font"')) assets.fonts.add(src);
  }
  const measured = Object.fromEntries(
    Object.entries(assets).map(([kind, urls]) => {
      const files = [...urls].map((url) => ({
        url,
        ...size(readFileSync(`.next/${url.slice(7)}`)),
      }));
      return [
        kind,
        {
          count: files.length,
          raw: files.reduce((sum, file) => sum + file.raw, 0),
          gzip: files.reduce((sum, file) => sum + file.gzip, 0),
          files,
        },
      ];
    }),
  );
  const name = relative(root, path).replace(/\.html$/, "");
  const route = name === "index" ? "/" : `/${name}`;
  report[route] = { html: size(html), ...measured };
}
const output = process.argv.find((arg) => arg.startsWith("--output="))?.slice(9);
if (output) {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}
console.table(
  Object.fromEntries(
    Object.entries(report).map(([route, values]) => [
      route,
      {
        "HTML gzip": values.html.gzip,
        "JS gzip": values.js.gzip,
        "CSS gzip": values.css.gzip,
        "font raw": values.fonts.raw,
      },
    ]),
  ),
);
