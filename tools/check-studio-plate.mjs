import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { delay, localBaseFromArgs, NO_GPU_FLAGS, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/studio-plate";
mkdirSync(out, { recursive: true });
const records = [];
await withBrowser(
  { name: "studio-plate", flags: NO_GPU_FLAGS },
  async ({ send, evaluate, pressKey }) => {
    await send("Page.enable");
    await send("Runtime.enable");
    for (const width of [390, 1440]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width < 760,
      });
      await send("Emulation.setScriptExecutionDisabled", { value: true });
      await send("Page.navigate", { url: new URL("/sea?seed=f532e107&version=2", base).href });
      await delay(1200);
      await evaluate(
        "document.querySelector('#sea-studio figure').scrollIntoView({behavior:'instant'})",
      );
      for (let attempt = 0; attempt < 100; attempt++) {
        if (
          await evaluate("Boolean(document.querySelector('#sea-studio figure img')?.naturalWidth)")
        )
          break;
        await delay(50);
      }
      for (const theme of ["day", "night"]) {
        const image = await evaluate(`(() => {
        document.documentElement.dataset.studioTheme = ${JSON.stringify(theme)};
        const frame = document.querySelector('#sea-studio figure [role="img"]');
        const image = frame.querySelector("img");
        return { src: image.getAttribute("src"), loading: image.loading,
          dimensions: [image.naturalWidth, image.naturalHeight], fit: getComputedStyle(image).objectFit,
          label: frame.getAttribute("aria-label"), svg: Boolean(frame.querySelector("svg")),
          overflow: document.documentElement.scrollWidth > innerWidth };
      })()`);
        assert.equal(image.src, "/api/sea-edition/print?seed=f532e107&version=2");
        assert.equal(image.loading, "lazy");
        assert.deepEqual(image.dimensions, [1280, 960]);
        assert.equal(image.fit, "contain");
        assert.ok(image.label.includes("f532e107"));
        assert.equal(image.svg, false);
        assert.equal(image.overflow, false);
        records.push({ name: "no-script-vector-image", width, theme, ...image });
        const shot = await send("Page.captureScreenshot", { format: "png" });
        writeFileSync(`${out}/no-script-${width}-${theme}.png`, Buffer.from(shot.data, "base64"));
      }
      await send("Emulation.setScriptExecutionDisabled", { value: false });
      await send("Page.navigate", { url: new URL("/sea?seed=f532e107&version=2", base).href });
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate("Boolean(document.querySelector('#sea-studio figure svg'))")) break;
        await delay(50);
      }
      const checkDrawing = async () => {
        const result = await evaluate(`(async () => {
        const figure = document.querySelector('#sea-studio figure');
        const seed = figure.querySelector('code').textContent.trim();
        const svg = figure.querySelector('svg');
        const response = await fetch('/api/sea-edition/print?seed=' + seed + '&version=2');
        const printed = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        const points = root => [...root.querySelectorAll('polyline')].map(line => line.getAttribute('points'));
        return { seed, image: Boolean(figure.querySelector('img')), status: response.status,
          sameDrawing: JSON.stringify(points(svg)) === JSON.stringify(points(printed)),
          lines: points(svg).length };
      })()`);
        assert.equal(result.image, false);
        assert.equal(result.status, 200);
        assert.equal(result.sameDrawing, true);
        assert.equal(result.lines, 103);
        records.push({ name: "live-drawing-matches-print", width, ...result });
        return result.seed;
      };
      const before = await checkDrawing();
      await evaluate("document.querySelector('#sea-studio input[type=range]').focus()");
      await pressKey("ArrowRight");
      await delay(150);
      const after = await checkDrawing();
      assert.notEqual(after, before, "Editing must update the same printable drawing");
    }
  },
);
writeFileSync(`${out}/report.json`, JSON.stringify(records, null, 2));
console.log(`Passed ${records.length} no-script and hydrated studio drawing cases.`);
