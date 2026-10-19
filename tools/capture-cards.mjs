import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { delay, withBrowser } from "./lib/browser.mjs";

// usage: node tools/capture-cards.mjs <local base> blog/<slug> work/<slug> ...
// Notes use their cover, case studies their first plate; screenshot-backed case studies are
// cropped from their screenshot by hand (docs/seo-and-sharing.md).
const [base, ...pages] = process.argv.slice(2);
const sources = { blog: "figure[class*=articleCover]", work: "figure[class*=plate]" };
const boxes = { blog: "1104x560", work: "1104x590" };
const scratch = mkdtempSync(join(tmpdir(), "maxsash-cards-"));

try {
  await withBrowser({ name: "cards" }, async ({ send, evaluate }) => {
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1200,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "prefers-color-scheme", value: "light" },
      ],
    });
    for (const page of pages) {
      const [section, slug] = page.split("/");
      const selector = JSON.stringify(sources[section]);
      await send("Page.navigate", { url: new URL(`/${page}`, base).href });
      await delay(3000);
      await evaluate(
        `document.fonts.ready.then(() => document.querySelector(${selector}).scrollIntoView({block: "center"}))`,
      );
      await delay(2500);
      const clip = await evaluate(`(() => {
        const { x, y, width, height } = document.querySelector(${selector}).getBoundingClientRect();
        return { x: x + scrollX, y: y + scrollY, width, height, scale: 1 };
      })()`);
      const { data } = await send("Page.captureScreenshot", {
        format: "png",
        clip,
        captureBeyondViewport: true,
      });
      const capture = join(scratch, `${slug}.png`);
      writeFileSync(capture, Buffer.from(data, "base64"));
      const edge = execFileSync("magick", [
        capture,
        "-format",
        `%[pixel:p{10,${Math.round(clip.height)}}]`,
        "info:",
      ]).toString();
      const card = `public/images/cards/${slug}.jpg`;
      execFileSync("magick", [
        capture,
        ...["-filter", "Lanczos", "-resize", boxes[section], "-background", edge],
        ...["-gravity", "center", "-extent", "1200x630", "-strip"],
        ...["-sampling-factor", "4:4:4", "-quality", "90", card],
      ]);
      console.log(`${card} from ${page}`);
    }
  });
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
