/** Browser bars match the page. Safari 26+ tints them from a stuck `[data-bar-tint]` element
 * (`--bar-top`, `--bar-bottom`), else the body; other browsers read theme-color, which must
 * follow the same rule. Both must match the rendered top (and hero bottom) row.
 * node tools/check-browser-bars.mjs [http://localhost:3000]
 */
import { HOME_WATER } from "../lib/sea/presets.ts";
import { seedFromSettings } from "../lib/sea/seed.ts";
import { NO_GPU_FLAGS, delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
// The sea's bottom row varies with each visit's sea; Home water is the most common start.
const HOME = `/?seed=${seedFromSettings(HOME_WATER)}&version=2`;
const TOLERANCE = 8;
const GAUGE_PX = 24;
const failures = [];
const check = (name, pass, info = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${info ? "  " + info : ""}`);
  if (!pass) failures.push(name);
};

const rgb = (color) =>
  color.startsWith("#")
    ? [1, 3, 5].map((at) => parseInt(color.slice(at, at + 2), 16))
    : color.match(/\d+/g).slice(0, 3).map(Number);
const near = (a, b, tolerance = TOLERANCE) =>
  rgb(a).every((value, channel) => Math.abs(value - rgb(b)[channel]) <= tolerance);

const STATE = `(() => {
  const tint = document.querySelector('[data-bar-tint]'), box = tint?.getBoundingClientRect();
  const style = tint && getComputedStyle(tint), body = getComputedStyle(document.body).backgroundColor;
  const stuck = Boolean(box) && ['sticky', 'fixed'].includes(style.position) &&
    Math.abs(box.top) < 1 && box.height <= innerHeight + 1;
  return {
    stuck,
    safariTop: stuck ? style.getPropertyValue('--bar-top').trim() : body,
    safariBottom: stuck ? style.getPropertyValue('--bar-bottom').trim() || null : body,
    meta: document.querySelector('meta[name="theme-color"]').content,
    body,
    theme: document.documentElement.dataset.studioTheme,
    rendering: document.querySelector('[data-observatory]')?.dataset.rendering,
    night: Number(document.querySelector('canvas[data-ocean]')?.dataset.nightBlend),
  };
})()`;

async function edgeRows({ send, evaluate }) {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  return evaluate(`(async () => {
    const bytes = Uint8Array.from(atob('${data}'), (character) => character.charCodeAt(0));
    const image = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    const context = new OffscreenCanvas(image.width, image.height).getContext('2d');
    context.drawImage(image, 0, 0);
    const mean = (y) => {
      const width = image.width - ${GAUGE_PX};
      const row = context.getImageData(0, y, width, 1).data, sum = [0, 0, 0];
      for (let at = 0; at < row.length; at += 4) for (let c = 0; c < 3; c++) sum[c] += row[at + c];
      return 'rgb(' + sum.map((value) => Math.round(value / width)).join(', ') + ')';
    };
    return { top: mean(0), bottom: mean(image.height - 1) };
  })()`);
}

async function waitFor(evaluate, expression, label) {
  for (let attempt = 0; attempt < 200; attempt++) {
    if (await evaluate(expression)) return;
    await delay(50);
  }
  throw new Error(`Timed out: ${label}`);
}

async function expectBars(page, name, { top = true, bottom = false } = {}) {
  const state = await page.evaluate(STATE);
  const rows = await edgeRows(page);
  check(
    `${name}: theme-color follows Safari's rule`,
    near(state.meta, state.safariTop, 0),
    state.meta,
  );
  if (top) check(`${name}: top bar matches the page`, near(state.safariTop, rows.top), rows.top);
  if (bottom)
    check(
      `${name}: bottom bar matches the page`,
      near(state.safariBottom, rows.bottom),
      rows.bottom,
    );
  return state;
}

// Records whether the theme was set before the body was parsed (an inline <head> script).
const WATCH_THEME = `new MutationObserver((records, observer) => {
  window.themeBeforeBody = !document.body;
  observer.disconnect();
}).observe(document, { subtree: true, attributeFilter: ['data-studio-theme'] });`;

async function phone(send, { dark = false } = {}) {
  await send("Page.enable");
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  if (dark)
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: "dark" }],
    });
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `try { localStorage.setItem('studio-wave-sound', 'off');
      ${dark ? "" : "localStorage.setItem('studio-theme', 'day');"} } catch {}
      ${WATCH_THEME}`,
  });
}

async function load({ send, evaluate }, path) {
  await send("Page.navigate", { url: new URL(path, base).href });
  await waitFor(evaluate, "document.readyState === 'complete'", path);
  await delay(1500);
}

await withBrowser({ name: "bars" }, async (page) => {
  const { send, evaluate } = page;
  await phone(send);
  await load(page, HOME);
  await waitFor(evaluate, `${STATE}.rendering === 'webgl2'`, "hero rendering");
  await delay(1000);
  check(
    "hero day: stage is stuck at the top",
    (await expectBars(page, "hero day", { bottom: true })).stuck,
  );

  await evaluate("document.querySelector('[data-sky-theme]').click()");
  await waitFor(evaluate, `${STATE}.night === 1`, "night blend");
  await delay(300);
  check(
    "hero night: stage is stuck at the top",
    (await expectBars(page, "hero night", { bottom: true })).stuck,
  );

  await evaluate("document.querySelector('[data-stage-next]').click()");
  await delay(2500);
  await expectBars(page, "drawing");

  await evaluate("document.querySelector('[data-stage-next]').click()");
  await delay(1500);
  const below = await expectBars(page, "below the hero", { top: false });
  check(
    "below the hero: bars fall back to the body",
    !below.stuck && near(below.safariTop, below.body, 0),
  );

  await evaluate("document.querySelector('a[href=\"/blog\"]').click()");
  await waitFor(evaluate, "location.pathname === '/blog'", "client navigation to the Notebook");
  await delay(800);
  const notebook = await expectBars(page, "notebook after night");
  check("notebook after night: the night theme outlived navigation", notebook.theme === "night");

  for (const path of ["/missing-page", "/blog/missing-note", "/plate?seed=zz"]) {
    await load(page, path);
    await expectBars(page, path);
  }
});

await withBrowser({ name: "bars-night-load" }, async (page) => {
  await phone(page.send, { dark: true });
  await load(page, HOME);
  await waitFor(page.evaluate, `${STATE}.rendering === 'webgl2'`, "night hero rendering");
  await delay(1000);
  const state = await page.evaluate(STATE);
  check("night load: OS dark gives the night sea", state.theme === "night" && state.night === 1);
  check("night load: theme set before the body", await page.evaluate("window.themeBeforeBody"));
  await expectBars(page, "night load", { bottom: true });
  await load(page, `/plate?${new URL(HOME, base).searchParams}`);
  await expectBars(page, "plate at night");
});

await withBrowser({ name: "bars-fallback", flags: NO_GPU_FLAGS }, async (page) => {
  await phone(page.send);
  await load(page, "/");
  const state = await page.evaluate(STATE);
  check("fallback: hero shows the static plate", state.rendering === "fallback");
  check(
    "fallback: theme-color follows Safari's rule",
    near(state.meta, state.safariTop, 0),
    state.meta,
  );
});

console.log(failures.length ? `\n${failures.length} failed.` : "\nBrowser bars match the page.");
process.exitCode = failures.length ? 1 : 0;
