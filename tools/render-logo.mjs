/*
 * Render the generated proof and 900px monochrome silhouette comparisons in
 * a real browser. No npm package needed: Node 22's WebSocket speaks CDP.
 *
 *   node tools/build-logo.mjs
 *   node tools/preview-logo.mjs
 *   node tools/render-logo.mjs
 *   python3 tools/scan.py tools/.out/candidate.png 900 900 tools/.out/original.png 900 900
 *
 * Add --assets after settling the geometry to regenerate the favicon, Apple
 * tile and both social card PNGs. This requires ImageMagick on PATH.
 * Set CHROME_BIN when Chrome is not in its usual macOS or Linux location.
 * Add --pixels to include the expanded 8× nearest-neighbor small-size proof.
 * Add --site=http://localhost:3000 to inspect the mark in the running homepage
 * at desktop/mobile sizes on both grounds, with motion paused for comparison.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = (p) => new URL(p, import.meta.url);
const path = (p) => fileURLToPath(here(p));
mkdirSync(here(".out"), { recursive: true });
const chrome = process.env.CHROME_BIN || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].find(existsSync);
if (!chrome) throw new Error("Chrome not found. Set CHROME_BIN to its executable.");

// Capture HEAD only once so iterations cannot accidentally overwrite the
// comparison with a candidate. The pre-refinement source is versioned in docs.
if (!existsSync(here(".out/baseline.svg"))) {
  writeFileSync(here(".out/baseline.svg"), execFileSync("git", ["show", "HEAD:public/mark.svg"], { cwd: path("..") }));
}
execFileSync(process.execPath, [path("preview-logo.mjs")], { stdio: "inherit" });
const profile = mkdtempSync(join(tmpdir(), "maxsash-mark-chrome-"));
const browser = spawn(chrome, [
  "--headless", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--disable-background-networking", "--disable-extensions", "--disable-sync",
  "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
let browserLog = "";
browser.stderr.on("data", (chunk) => { browserLog = (browserLog + chunk.toString()).slice(-3000); });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;

try {
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; !existsSync(portFile); i++) {
    if (browser.exitCode !== null || browser.signalCode || i > 200) {
      throw new Error(`Chrome failed to start. ${browserLog}`);
    }
    await delay(50);
  }
  const port = readFileSync(portFile, "utf8").split("\n")[0];
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(pages.find((page) => page.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    clearTimeout(waiter.timeout);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome timed out: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await call("Page.enable");
  const render = async (input, output, width, height, { fullPage = false, transparent = false } = {}) => {
    await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    await call("Emulation.setDefaultBackgroundColorOverride", { color: { r: 255, g: 255, b: 255, a: transparent ? 0 : 1 } });
    const url = /^https?:\/\//.test(input) ? input : pathToFileURL(input).href;
    const navigation = await call("Page.navigate", { url });
    if (navigation.errorText) throw new Error(navigation.errorText);
    for (let i = 0; i < 400; i++) {
      if (await evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`)) break;
      if (i === 399) throw new Error(`Page did not load: ${input}`);
      await delay(50);
    }
    await evaluate("document.fonts.ready.then(() => true)");
    if (input === path(".out/cover.html")) {
      const fonts = await evaluate("Array.from(document.fonts, font => ({ family: font.family.replaceAll('\"', ''), status: font.status }))");
      for (const family of ["Fraunces", "JetBrains Mono"]) {
        if (!fonts.some((font) => font.family === family && font.status === "loaded")) {
          throw new Error(`Social card font did not load: ${family}. Refusing to save a fallback-font cover.`);
        }
      }
      console.log("verified cover fonts: Fraunces and JetBrains Mono loaded");
    }
    await evaluate("Promise.resolve(window.markProofReady).then(() => true)");
    if (process.argv.includes("--pixels")) {
      await evaluate("document.querySelectorAll('.pixel-proof').forEach(proof => { proof.open = true; })");
    }
    if (fullPage) {
      height = Math.ceil(await evaluate("document.documentElement.scrollHeight"));
      await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
    }
    await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
    const shot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
    writeFileSync(output, Buffer.from(shot.data, "base64"));
    console.log(`rendered ${output.replace(path("../"), "")} (${width}×${height})`);
  };
  const svgPage = (source, name, monochrome = true) => {
    let svg = readFileSync(source, "utf8").replace(/<!--[\s\S]*?-->/g, "");
    if (monochrome) svg = svg.replace(/<rect\b[^>]*\/>/g, "").replace(/fill="#[^"]*"/g, 'fill="#000"');
    const output = path(`.out/${name}-render.html`);
    writeFileSync(output, `<!doctype html><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;color:#000}svg{display:block;width:100%;height:100%}</style>${svg}`);
    return output;
  };

  await render(svgPage(path("../docs/mark-original.svg"), "original"), path(".out/original.png"), 900, 900);
  await render(svgPage(path(".out/baseline.svg"), "baseline"), path(".out/baseline.png"), 900, 900);
  await render(svgPage(path("../public/mark.svg"), "candidate"), path(".out/candidate.png"), 900, 900);
  await render(path(".out/preview.html"), path(".out/preview.png"), 1140, 900, { fullPage: true });

  if (process.argv.includes("--assets")) {
    execFileSync(process.execPath, [path("build-cover.mjs")], { stdio: "inherit" });
    const faviconPage = svgPage(path("../app/icon.svg"), "favicon", false);
    const faviconRenders = [];
    // Render each native size so ICO sampling matches the SVG pixel proof;
    // resizing a large raster would introduce a different antialiasing pass.
    for (const size of [64, 48, 32, 16]) {
      const output = path(`.out/favicon-${size}.png`);
      await render(faviconPage, output, size, size, { transparent: true });
      faviconRenders.push(output);
    }
    execFileSync("magick", [...faviconRenders, path("../app/favicon.ico")]);
    await render(svgPage(path(".out/apple-icon.svg"), "apple", false), path("../app/apple-icon.png"), 180, 180);
    await render(path(".out/cover.html"), path("../public/images/cover.png"), 1200, 630);
    execFileSync("magick", [path("../public/images/cover.png"), "-strip", "-define", "png:compression-level=9", path("../public/images/cover-compressed.png")]);
    console.log("regenerated favicon.ico, apple-icon.png, cover.png and cover-compressed.png");
  }

  const site = process.argv.find((arg) => arg.startsWith("--site="))?.slice(7);
  if (site) {
    const url = new URL(site);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new Error("--site must point at a local development or production server.");
    }
    for (const theme of ["light", "dark"]) {
      await call("Emulation.setEmulatedMedia", { features: [
        { name: "prefers-color-scheme", value: theme },
        { name: "prefers-reduced-motion", value: "reduce" },
      ] });
      await render(url.href, path(`.out/site-${theme}-desktop.png`), 1440, 1000);
      await render(url.href, path(`.out/site-${theme}-mobile.png`), 390, 844);
    }
  }
} finally {
  socket?.close();
  browser.kill("SIGTERM");
  for (let i = 0; i < 40 && browser.exitCode === null && !browser.signalCode; i++) await delay(50);
  if (browser.exitCode === null && !browser.signalCode) browser.kill("SIGKILL");
  rmSync(profile, { recursive: true, force: true });
}
