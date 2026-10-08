import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [baselineUrl, candidateUrl, only] = process.argv.slice(2);
if (!baselineUrl || !candidateUrl) {
  console.error("node tools/compare-builds.mjs <baseline url> <candidate url> [page name filter]");
  process.exit(2);
}

const pages = [
  ["blog index", "/blog", null],
  ["essay waves", "/blog/three-waves-one-sea", null],
  ["essay mark", "/blog/an-integral-under-sail", null],
  ["plate", "/plate?seed=f532e107&version=2", null],
  ["home work", "/?seed=70806d5e&version=2", "#work"],
  ["home sea studio", "/?seed=70806d5e&version=2", "#sea-studio"],
  ["home notebook", "/?seed=70806d5e&version=2", "#notebook"],
  ["home elsewhere", "/?seed=70806d5e&version=2", "#elsewhere"],
];
const viewports = [
  { name: "desktop", width: 1280, height: 900, mobile: false },
  { name: "phone", width: 390, height: 844, mobile: true },
];
const themes = ["light", "dark"];
const toleratedShare = 0.0005;
const toleratedChannel = 40;

const chromePath =
  process.env.CHROME_BIN ||
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find(existsSync);
if (!chromePath) throw new Error("Chrome not found");

const profile = mkdtempSync(join(tmpdir(), "maxsash-compare-"));
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--no-first-run",
    "--enable-unsafe-swiftshader",
    "--use-angle=swiftshader",
    "--hide-scrollbars",
    `--user-data-dir=${profile}`,
    "--remote-debugging-port=0",
    "about:blank",
  ],
  { stdio: "ignore" },
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  const portFile = join(profile, "DevToolsActivePort");
  while (!existsSync(portFile)) await delay(50);
  const port = readFileSync(portFile, "utf8").split("\n")[0];
  const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(
    (entry) => entry.type === "page",
  );
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++nextId;
      pending.set(id, resolve);
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result
      ?.result?.value;

  const capture = async (base, path, selector, viewport, theme) => {
    await send("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1 });
    await send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "prefers-color-scheme", value: theme },
      ],
    });
    await send("Page.navigate", { url: base + path });
    await delay(3000);
    const clip = await evaluate(`(() => {
      const element = ${JSON.stringify(selector)} && document.querySelector(${JSON.stringify(selector)});
      if (element) element.scrollIntoView();
      const box = element ? element.getBoundingClientRect() : { top: -scrollY, height: document.documentElement.scrollHeight };
      return { x: 0, y: box.top + scrollY, width: innerWidth, height: Math.min(box.height, 2600), scale: 1 };
    })()`);
    await evaluate(`Promise.all([...document.images].map((image) =>
      image.complete && image.naturalWidth
        ? 1
        : new Promise((resolve) => {
            image.addEventListener("load", resolve);
            image.addEventListener("error", resolve);
            setTimeout(resolve, 4000);
          })))`);
    await delay(400);
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip,
    });
    return shot.result.data;
  };

  const compare = (first, second) =>
    evaluate(`(async () => {
      const load = (data) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = "data:image/png;base64," + data;
      });
      const [a, b] = await Promise.all([load(${JSON.stringify(first)}), load(${JSON.stringify(second)})]);
      if (a.width !== b.width || a.height !== b.height) return { sizes: [a.width, a.height, b.width, b.height] };
      const canvas = document.createElement("canvas");
      canvas.width = a.width;
      canvas.height = a.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(a, 0, 0);
      const pixelsA = context.getImageData(0, 0, canvas.width, canvas.height).data;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(b, 0, 0);
      const pixelsB = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let different = 0, largest = 0, left = Infinity, top = Infinity, right = -1, bottom = -1;
      for (let i = 0; i < pixelsA.length; i += 4) {
        const step = Math.max(Math.abs(pixelsA[i] - pixelsB[i]), Math.abs(pixelsA[i + 1] - pixelsB[i + 1]), Math.abs(pixelsA[i + 2] - pixelsB[i + 2]));
        if (step > 2) {
          different++;
          const x = (i / 4) % canvas.width, y = Math.floor(i / 4 / canvas.width);
          left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
        }
        largest = Math.max(largest, step);
      }
      return { pixels: pixelsA.length / 4, different, largest, box: different ? [left, top, right, bottom] : null };
    })()`);

  await send("Page.enable");
  let compared = 0;
  let mismatched = 0;
  for (const viewport of viewports) {
    for (const theme of themes) {
      for (const [name, path, selector] of pages) {
        if (only && !name.includes(only)) continue;
        const baseline = await capture(baselineUrl, path, selector, viewport, theme);
        const candidate = await capture(candidateUrl, path, selector, viewport, theme);
        const result = await compare(baseline, candidate);
        const matches =
          !result.sizes &&
          (result.different === 0 ||
            (result.different / result.pixels < toleratedShare &&
              result.largest < toleratedChannel));
        compared++;
        if (!matches) mismatched++;
        console.log(
          matches ? "same " : "DIFF ",
          `${viewport.name}/${theme}`.padEnd(14),
          name.padEnd(16),
          JSON.stringify(result),
        );
      }
    }
  }
  console.log(`\n${compared - mismatched}/${compared} views match`);
  socket.close();
  process.exitCode = mismatched ? 1 : 0;
} finally {
  chrome.kill();
  await new Promise((resolve) => chrome.once("exit", resolve));
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
