import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { delay, localBaseFromArgs, NO_GPU_FLAGS, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const records = [];
await withBrowser({ name: "heading-contrast", flags: NO_GPU_FLAGS }, async ({ send, evaluate }) => {
  await send("Page.enable");
  await send("Runtime.enable");
  for (const width of [390, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Page.navigate", { url: base.href });
    await delay(1000);
    await evaluate("document.fonts.ready.then(() => true)");
    for (const reducedMotion of [false, true]) {
      await send("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" },
        ],
      });
      for (const theme of ["day", "night"]) {
        for (const arrived of [false, true]) {
          const headings = await evaluate(`(() => {
            document.documentElement.dataset.studioTheme = ${JSON.stringify(theme)};
            document.documentElement.dataset.feedback = "";
            for (const kicker of document.querySelectorAll("[data-arrive]")) {
              if (${arrived}) kicker.dataset.arrived = "";
              else delete kicker.dataset.arrived;
            }
            const rgb = (value) => {
              const channels = value.match(/[\\d.]+/g).map(Number);
              return [...channels.slice(0, 3), channels[3] ?? 1];
            };
            const luminance = (channels) => channels.slice(0, 3).map((channel) => {
              const value = channel / 255;
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
            return [...document.querySelectorAll("#work-heading, #work h3, #about-heading, #contact-heading")].map((heading) => {
              heading.style.transition = "none";
              const style = getComputedStyle(heading);
              let opacity = 1;
              let background;
              for (let node = heading; node; node = node.parentElement) {
                const ancestor = getComputedStyle(node);
                opacity *= Number(ancestor.opacity);
                const color = rgb(ancestor.backgroundColor);
                if (!background && color[3] === 1) background = color;
              }
              const foreground = rgb(style.color);
              const alpha = foreground[3] * opacity;
              const composite = foreground.slice(0, 3).map((value, index) => value * alpha + background[index] * (1 - alpha));
              const levels = [luminance(composite), luminance(background)].sort((a, b) => a - b);
              const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.667 && Number(style.fontWeight) >= 700);
              return { text: heading.textContent.trim(), opacity, ratio: (levels[1] + 0.05) / (levels[0] + 0.05), minimum: large ? 3 : 4.5 };
            });
          })()`);
          assert.ok(headings.length >= 6, "All reported headings must be checked");
          records.push(
            ...headings.map((heading) => ({ width, theme, reducedMotion, arrived, ...heading })),
          );
        }
      }
    }
  }
});
mkdirSync("tools/.out/heading-contrast", { recursive: true });
writeFileSync("tools/.out/heading-contrast/report.json", JSON.stringify(records, null, 2));
const failures = records.filter(({ ratio, minimum }) => ratio < minimum);
assert.deepEqual(failures, [], "Headings must retain readable contrast before and after arrival");
console.log(
  `Passed ${records.length} heading contrast checks; lowest ratio ${Math.min(...records.map(({ ratio }) => ratio)).toFixed(2)}:1.`,
);
