import assert from "node:assert/strict";
import { projects } from "../content/projects.ts";
import { delay, localBaseFromArgs, NO_GPU_FLAGS, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const routes = [
  "/",
  ...projects
    .filter((project) => project.visuals.some((visual) => visual.kind === "drawing"))
    .map((project) => `/work/${project.slug}`),
];

await withBrowser({ name: "drawing-labels", flags: NO_GPU_FLAGS }, async ({ send, evaluate }) => {
  await send("Page.enable");
  for (const width of [390, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const route of routes) {
      await send("Page.navigate", { url: new URL(route, base).href });
      await delay(2000);
      const labels = await evaluate(`(async () => {
        await document.fonts.ready;
        return [...document.querySelectorAll('svg[role="img"] g')]
          .filter(group => group.querySelector('rect') && group.querySelector('text'))
          .flatMap(group => {
            const rect = group.querySelector('rect');
            const left = rect.x.baseVal.value;
            const right = left + rect.width.baseVal.value;
            return [...group.querySelectorAll('text')].map(text => {
              const bounds = text.getBBox();
              return { label: text.textContent, width: bounds.width,
                boxWidth: rect.width.baseVal.value,
                fits: bounds.x >= left + 3 && bounds.x + bounds.width <= right - 3 };
            });
          });
      })()`);
      assert.ok(labels.length, `${route} has drawing labels`);
      for (const label of labels)
        assert.ok(label.fits, `${route} at ${width}: ${JSON.stringify(label)}`);
      console.log(`PASS ${route} at ${width}: ${labels.length} labels with 3-unit side clearance`);
    }
  }
});
