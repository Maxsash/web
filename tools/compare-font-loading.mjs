import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { delay, isLocal, NO_GPU_FLAGS, withBrowser } from "./lib/browser.mjs";

const bases = process.argv.slice(2, 4).map((value) => new URL(value));
assert.equal(bases.length, 2, "Provide baseline and candidate production URLs");
assert.ok(bases.every(isLocal), "Use isolated local production servers");
const rounds = Number(process.argv[4] ?? 5);
assert.ok(Number.isInteger(rounds) && rounds > 0 && rounds <= 10);
const out = "tools/.out/font-loading";
mkdirSync(out, { recursive: true });
const records = [];
await withBrowser({ name: "font-loading", flags: NO_GPU_FLAGS }, async ({ send, evaluate }) => {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 562.5,
    downloadThroughput: 180000,
    uploadThroughput: 84375,
    connectionType: "cellular4g",
  });
  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.__fontLoadLcp = [];
      window.__fontLoadShifts = [];
      new PerformanceObserver(list => window.__fontLoadShifts.push(...list.getEntries().filter(entry => !entry.hadRecentInput).map(entry => entry.value))).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver(list => window.__fontLoadLcp.push(...list.getEntries().map(entry => ({
        start: entry.startTime, text: entry.element?.textContent?.trim()
      })))).observe({ type: "largest-contentful-paint", buffered: true });`,
  });
  for (let round = 0; round < rounds; round++) {
    for (const index of round % 2 ? [1, 0] : [0, 1]) {
      await send("Network.clearBrowserCache");
      await send("Page.navigate", {
        url: new URL("/?seed=f532e107&version=2", bases[index]).href,
      });
      await delay(12000);
      const measurement = await evaluate(`(() => {
        const resources = performance.getEntriesByType("resource");
        const styles = resources.filter(entry => entry.name.endsWith(".css"));
        const fonts = resources.filter(entry => entry.name.endsWith(".woff2"));
        const navigation = performance.getEntriesByType("navigation")[0];
        return {
          lcp: window.__fontLoadLcp.at(-1),
          layoutShiftSum: window.__fontLoadShifts.reduce((sum, value) => sum + value, 0),
          fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime,
          ttfb: navigation.responseStart,
          lastStylesheet: Math.max(...styles.map(entry => entry.responseEnd)),
          fontPreloads: [...document.querySelectorAll('link[rel="preload"][as="font"]')].map(link => link.href),
          fonts: fonts.map(entry => ({ name: entry.name.split("/").at(-1), start: entry.startTime, end: entry.responseEnd, transferred: entry.transferSize })),
          loadedFaces: [...document.fonts].filter(font => font.status === "loaded").map(font => ({ family: font.family, style: font.style })),
          viewport: [innerWidth, innerHeight],
          overflow: document.documentElement.scrollWidth > innerWidth
        };
      })()`);
      assert.ok(measurement.lcp?.start > 0, "LCP must be captured");
      assert.deepEqual(measurement.viewport, [390, 844]);
      assert.equal(measurement.overflow, false);
      records.push({ variant: index ? "candidate" : "baseline", round: round + 1, ...measurement });
      console.log(JSON.stringify(records.at(-1)));
      writeFileSync(`${out}/report.json`, JSON.stringify(records, null, 2));
    }
  }
});
const median = (values) => {
  const sorted = values.toSorted((a, b) => a - b);
  return (sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2;
};
const summary = Object.fromEntries(
  ["baseline", "candidate"].map((variant) => {
    const rows = records.filter((record) => record.variant === variant);
    return [
      variant,
      Object.fromEntries(
        ["lcp", "fcp", "lastStylesheet"].map((key) => [
          key,
          median(rows.map((row) => (key === "lcp" ? row.lcp.start : row[key]))),
        ]),
      ),
    ];
  }),
);
writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary));
