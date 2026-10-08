import { delay } from "../lib/browser.mjs";

export async function runFallbacks(ctx) {
  const { base, evaluate, load, results, send, snapshot } = ctx;
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  const injection = await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "const originalGetContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl2'?null:originalGetContext.call(this,kind,...args)}",
  });
  await load("/");
  await snapshot("fallback-390");
  await send("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: injection.identifier,
  });
  await send("Emulation.setScriptExecutionDisabled", { value: true });
  await send("Page.navigate", { url: new URL("/", base).href });
  await delay(800);
  await snapshot("no-js-390");
  results.push({
    name: "no-js-content",
    pass: await evaluate(
      "document.querySelector('h1')?.textContent.includes('Sea.') && document.querySelector('a[href=\"/blog\"]')!==null && document.querySelectorAll('#work').length===1 && !document.querySelector('canvas[data-ocean]').dataset.renderer",
    ),
  });
  await send("Emulation.setScriptExecutionDisabled", { value: false });
}
