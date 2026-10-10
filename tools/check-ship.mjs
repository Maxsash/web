import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildShipMesh } from "../components/observatory/ship-mesh.ts";
import { localBaseFromArgs, withBrowser, delay } from "./lib/browser.mjs";
import { createPageHelpers } from "./e2e/page-helpers.mjs";

const base = localBaseFromArgs(),
  out = "tools/.out/ship";
const model = buildShipMesh(),
  results = [],
  errors = [];
mkdirSync(out, { recursive: true });
const spy = () => {
  const prototype = WebGL2RenderingContext.prototype;
  const locations = new WeakMap(),
    programs = new WeakMap();
  const get = prototype.getUniformLocation;
  prototype.getUniformLocation = function (program, name) {
    const location = get.call(this, program, name);
    if (location) locations.set(location, { program, name });
    if (name === "uModel") programs.set(program, {});
    return location;
  };
  for (const method of ["uniformMatrix4fv", "uniform1f"]) {
    const original = prototype[method];
    prototype[method] = function (location, ...args) {
      const uniform = locations.get(location),
        state = uniform && programs.get(uniform.program);
      if (state)
        state[uniform.name] = method === "uniformMatrix4fv" ? Array.from(args[1]) : args[0];
      return original.call(this, location, ...args);
    };
  }
  const use = prototype.useProgram,
    draw = prototype.drawArrays;
  let current;
  prototype.useProgram = function (program) {
    current = program;
    return use.call(this, program);
  };
  prototype.drawArrays = function (...args) {
    const state = programs.get(current);
    if (state?.uModel) window.__ship = { ...state, draws: (window.__ship?.draws ?? 0) + 1 };
    return draw.apply(this, args);
  };
};
const collect = () => {
  const stage = document.querySelector("[data-gull-sky]");
  const canvas = stage.querySelector("canvas[data-ocean]");
  const origin = stage.getBoundingClientRect(),
    copy = [];
  const visible = (node) => {
    for (let element = node.parentElement; element; element = element.parentElement) {
      const style = getComputedStyle(element);
      if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) < 0.2)
        return false;
      if (element === stage) return true;
    }
    return false;
  };
  for (const root of [
    stage.querySelector("h1")?.parentElement,
    stage.querySelector("h2")?.parentElement,
    ...stage.querySelectorAll("header,a,button"),
  ].filter(Boolean)) {
    const nodes = document.createTreeWalker(root, NodeFilter.SHOW_TEXT),
      range = document.createRange();
    while (nodes.nextNode()) {
      if (!nodes.currentNode.textContent.trim() || !visible(nodes.currentNode)) continue;
      range.selectNodeContents(nodes.currentNode);
      for (const rect of range.getClientRects())
        if (rect.width && rect.height)
          copy.push({
            left: rect.left - origin.left,
            right: rect.right - origin.left,
            top: rect.top - origin.top,
            bottom: rect.bottom - origin.top,
            text: nodes.currentNode.textContent.trim(),
          });
    }
  }
  return {
    ship: window.__ship,
    copy,
    width: origin.width,
    height: origin.height,
    renderer: canvas.dataset.renderer,
  };
};
function projected(state, width, height) {
  const transform = (matrix, point) =>
    [0, 1, 2, 3].map((row) => point.reduce((sum, v, i) => sum + matrix[i * 4 + row] * v, 0));
  const points = [];
  for (let i = 0; i < model.vertices.length; i += 12) {
    const f = model.flex.slice(i / 4, i / 4 + 3);
    const breath = Math.sin(state.uTime * 1.35 + f[1]) + 0.28 * Math.sin(state.uTime * 2.1 - f[1]);
    const local = [
      model.vertices[i] + f[0] * breath,
      model.vertices[i + 1] + f[2] * Math.sin(state.uTime * 2.6 + f[1]),
      model.vertices[i + 2],
      1,
    ];
    const clip = transform(state.uVP, transform(state.uModel, local));
    points.push([((clip[0] / clip[3] + 1) * width) / 2, ((1 - clip[1] / clip[3]) * height) / 2]);
  }
  return points;
}
function hits(triangle, rect) {
  const corners = [
    [rect.left, rect.top],
    [rect.right, rect.top],
    [rect.right, rect.bottom],
    [rect.left, rect.bottom],
  ];
  const axes = [
    [1, 0],
    [0, 1],
    ...triangle.map((point, i) => {
      const next = triangle[(i + 1) % 3];
      return [point[1] - next[1], next[0] - point[0]];
    }),
  ];
  return axes.every(([x, y]) => {
    const a = triangle.map(([px, py]) => px * x + py * y),
      b = corners.map(([px, py]) => px * x + py * y);
    return Math.max(...a) > Math.min(...b) + 0.25 && Math.max(...b) > Math.min(...a) + 0.25;
  });
}
await withBrowser(
  { name: "ship", flags: ["--use-angle=swiftshader"] },
  async ({ send, evaluate, onMessage }) => {
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.addScriptToEvaluateOnNewDocument", { source: "(" + spy.toString() + ")()" });
    onMessage((message) => {
      if (message.method === "Runtime.exceptionThrown")
        errors.push(message.params.exceptionDetails.text);
    });
    const { load } = createPageHelpers({ send, evaluate, base, out, results: [] });
    const inspect = async (name, screenshot = true) => {
      const data = await evaluate("(" + collect.toString() + ")()");
      if (!data.ship || data.renderer !== "webgl2") throw new Error("Ship did not render: " + name);
      const points = projected(data.ship, data.width, data.height);
      const bounds = {
        left: Math.min(...points.map((p) => p[0])),
        right: Math.max(...points.map((p) => p[0])),
        top: Math.min(...points.map((p) => p[1])),
        bottom: Math.max(...points.map((p) => p[1])),
      };
      const collisions = new Set();
      for (const rect of data.copy)
        for (let i = 0; i < points.length; i += 3)
          if (hits(points.slice(i, i + 3), rect)) {
            collisions.add(rect.text);
            break;
          }
      const pass =
        bounds.left >= 0 &&
        bounds.right <= data.width &&
        bounds.top >= 0 &&
        bounds.bottom <= data.height &&
        !collisions.size;
      results.push({
        name,
        pass,
        bounds,
        collisions: [...collisions],
        time: data.ship.uTime,
        reveal: data.ship.uReveal,
      });
      console.log(name, JSON.stringify(results.at(-1)));
      if (screenshot) {
        const shot = await send("Page.captureScreenshot", { format: "png" });
        writeFileSync(join(out, name + ".png"), Buffer.from(shot.data, "base64"));
      }
      return data.ship;
    };
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 1024],
      [844, 390],
      [1440, 1000],
      [2560, 1440],
    ]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      for (const night of [false, true]) {
        await send("Page.addScriptToEvaluateOnNewDocument", {
          source:
            "localStorage.setItem('studio-theme'," + JSON.stringify(night ? "night" : "day") + ")",
        });
        await load("/?seed=70806d5e&version=2");
        await delay(800);
        await inspect((night ? "night" : "day") + "-" + width);
        await evaluate(
          "window.scrollTo(0,document.querySelector('[data-observatory]').offsetHeight-innerHeight)",
        );
        await delay(450);
        await inspect((night ? "night-drawing" : "day-drawing") + "-" + width);
      }
    }
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send("Emulation.setTouchEmulationEnabled", { enabled: true });
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await load("/?seed=bec8905e&version=2");
    await inspect("reduced-phone");
    const before = await evaluate("window.__ship");
    await delay(400);
    const after = await evaluate("window.__ship");
    results.push({
      name: "reduced-still",
      pass: before.draws === after.draws && before.uTime === after.uTime,
    });
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
    });
    await evaluate(
      "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Still the sea')).click()",
    );
    await delay(100);
    const paused = await evaluate("window.__ship");
    await delay(400);
    results.push({
      name: "paused-cloth-and-hull",
      pass: paused.draws === (await evaluate("window.__ship.draws")),
    });
    await evaluate(
      "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Resume the sea')).click()",
    );
    await delay(500);
    results.push({
      name: "resume-cloth-and-hull",
      pass: (await evaluate("window.__ship.uTime")) > paused.uTime,
    });
    await evaluate("document.documentElement.style.fontSize='24px'");
    await delay(300);
    await inspect("large-text-phone");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 844,
      height: 390,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await delay(300);
    await inspect("live-rotation");
    await evaluate("document.documentElement.style.fontSize=''");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await load("/?seed=70806d5e&version=2");
    await delay(300);
    await inspect("native-phone-sea");
    await evaluate(
      "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Next')).click()",
    );
    for (const [index, wait] of [250, 400, 500, 650].entries()) {
      await delay(wait);
      await inspect("native-reveal-" + index, index === 3);
    }
    await evaluate(
      "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Back')).click()",
    );
    await delay(700);
    await inspect("native-return");
    writeFileSync(join(out, "report.json"), JSON.stringify({ results, errors }, null, 2));
    if (errors.length || results.some((r) => !r.pass)) process.exitCode = 1;
    console.log(
      "Ship checks:",
      results.filter((r) => r.pass).length + "/" + results.length,
      "Runtime exceptions:",
      errors.length,
    );
  },
);
