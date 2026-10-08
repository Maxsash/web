import { delay } from "../lib/browser.mjs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
import { writeFileSync } from "node:fs";

export async function runAssetBudgets(ctx) {
  const { assets, base, evaluate, load, out, publicPaths, send } = ctx;
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  for (const path of publicPaths) {
    await load(path);
    await delay(150);
    const urls = await evaluate(
      "[...new Set(performance.getEntriesByType('resource').map(r=>r.name).filter(u=>u.includes('/_next/static/')&&/\\.(js|css|woff2)(\\?|$)/.test(u)))]",
    );
    const html = await (await fetch(new URL(path, base))).text();
    const files = await Promise.all(
      urls.map(async (url) => {
        const data = Buffer.from(await (await fetch(url)).arrayBuffer());
        const pathname = new URL(url).pathname;
        return {
          url: pathname,
          kind: pathname.split(".").pop(),
          raw: data.length,
          gzip: gzipSync(data).length,
          initial: html.includes(pathname),
        };
      }),
    );
    assets[path] = {
      html: { raw: Buffer.byteLength(html), gzip: gzipSync(html).length },
      files,
    };
  }
  writeFileSync(join(out, "assets.json"), JSON.stringify(assets, null, 2));
}
