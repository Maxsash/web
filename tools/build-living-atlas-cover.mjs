/** Capture the actual daytime homepage renderer as a 1200 × 630 social card.
 * Run against a local production server: node tools/build-living-atlas-cover.mjs
 * Requires Chrome and ImageMagick. Capture-only styles never change the public page. No AI-generated substitute.
 */
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3010");
assert.ok(["localhost", "127.0.0.1"].includes(base.hostname));
const chrome =
  process.env.CHROME_BIN ||
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find(existsSync);
assert.ok(chrome, "Chrome required");
const profile = mkdtempSync(join(tmpdir(), "maxsash-cover-"));
const child = spawn(
  chrome,
  [
    "--headless",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-extensions",
    "--disable-sync",
    "--enable-unsafe-swiftshader",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
let socket,
  log = "";
child.stderr.on("data", (data) => {
  log = (log + data.toString()).slice(-2000);
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; !existsSync(portFile); i++) {
    if (i > 200 || child.exitCode !== null) throw new Error(`Chrome startup: ${log}`);
    await delay(50);
  }
  const port = readFileSync(portFile, "utf8").split("\n")[0];
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(pages.find((page) => page.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data),
      waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    clearTimeout(waiter.timer);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  });
  const call = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const key = ++id,
        timer = setTimeout(() => {
          pending.delete(key);
          reject(new Error(`${method} timeout`));
        }, 30000);
      pending.set(key, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: key, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await call("Page.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1200,
    height: 630,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await call("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-color-scheme", value: "light" },
      { name: "prefers-reduced-motion", value: "no-preference" },
    ],
  });
  await call("Page.addScriptToEvaluateOnNewDocument", {
    source: "localStorage.setItem('studio-theme','day');",
  });
  await call("Page.navigate", { url: base.href });
  for (let i = 0; i < 400; i++) {
    if (
      await evaluate(
        "document.readyState==='complete' && document.querySelector('canvas[data-ocean]')?.dataset.renderer==='webgl2'",
      )
    )
      break;
    if (i === 399) throw new Error("Actual ocean renderer did not initialize");
    await delay(50);
  }
  await evaluate("document.fonts.ready.then(()=>true)");
  await delay(1800);
  await evaluate("document.querySelector('[data-observatory] button[class*=pause]').click()");
  await evaluate(`(() => {
    const story = document.querySelector('[data-observatory]');
    const header = story.querySelector('header');
    header.dataset.coverHeader = '';
    story.querySelector('h1').parentElement.dataset.coverIntro = '';
    const footer = document.createElement('span');
    footer.textContent = 'maxsash.com'; footer.dataset.coverDomain = ''; story.append(footer);
    const style = document.createElement('style');
    style.textContent = \`
      [data-observatory] * { transition:none !important; }
      [data-cover-header] { left:54px !important; right:54px !important; top:32px !important; }
      [data-cover-header] > nav, [data-cover-header] > div { display:none !important; }
      [data-cover-header] > a { font-size:22px !important; gap:12px !important; }
      [data-cover-header] svg { width:32px !important; height:32px !important; }
      [data-cover-intro] { top:126px !important; left:54px !important; }
      [data-cover-intro] > p:first-child { font-size:10px !important; letter-spacing:.15em !important; }
      [data-cover-intro] h1 { font-size:112px !important; margin:24px 0 24px !important; }
      [data-cover-intro] > p:last-child { font-size:18px !important; max-width:350px !important; }
      [data-observatory] [class*="sceneMeta"], [data-observatory] [class*="chapterRail"],
      [data-observatory] button, [data-stage-controls] { display:none !important; }
      [data-cover-domain] { position:absolute; top:574px; right:54px; z-index:9; color:#f5f0df; font:14px var(--font-mono); letter-spacing:.08em; }
    \`;
    document.head.append(style);
  })()`);
  await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
  const info = await evaluate(`(() => {
    const canvas=document.querySelector('canvas[data-ocean]');
    return {theme:document.documentElement.dataset.studioTheme,renderer:canvas.dataset.renderer,quality:canvas.dataset.quality,width:innerWidth,height:innerHeight,title:document.querySelector('h1').textContent,reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches};
  })()`);
  assert.equal(info.theme, "day");
  assert.equal(info.renderer, "webgl2");
  const shot = await call("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  mkdirSync("public/images", { recursive: true });
  mkdirSync("tools/.out/seo", { recursive: true });
  writeFileSync("tools/.out/seo/living-atlas-day.png", Buffer.from(shot.data, "base64"));
  execFileSync("magick", [
    "tools/.out/seo/living-atlas-day.png",
    "-strip",
    "-quality",
    "90",
    "public/images/living-atlas-day-v1.jpg",
  ]);
  writeFileSync("tools/.out/seo/cover-report.json", JSON.stringify(info, null, 2));
  console.log(info);
} finally {
  socket?.close();
  child.kill();
  await new Promise((resolve) => {
    if (child.exitCode !== null) resolve();
    else child.once("exit", resolve);
  });
  rmSync(profile, { recursive: true, force: true });
}
