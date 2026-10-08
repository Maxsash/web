import { delay } from "../lib/browser.mjs";

export async function runMobileDegradation(ctx) {
  const { evaluate, frames, load, results, send, snapshot } = ctx;
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await load("/");
  await delay(250);
  const before = await snapshot("reduced-motion-390");
  await delay(400);
  const count = await evaluate("document.querySelector('canvas[data-ocean]').dataset.frameCount");
  results.push({
    name: "reduced-motion-idle",
    before: before.frames,
    after: count,
    pass: before.frames === count,
  });
  const failedLink = await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "const originalParameter=WebGL2RenderingContext.prototype.getProgramParameter;WebGL2RenderingContext.prototype.getProgramParameter=function(program,parameter){return parameter===this.LINK_STATUS?false:originalParameter.call(this,program,parameter)}",
  });
  await load("/");
  results.push({
    name: "shader-link-failure-fallback",
    pass: await evaluate(
      "document.querySelector('[data-observatory]').dataset.rendering==='fallback' && document.querySelector('[data-hero-pause]').disabled && !document.querySelector('canvas[data-ocean]').dataset.frameCount && Boolean(document.querySelector('#work'))",
    ),
  });
  await send("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: failedLink.identifier,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  const slowFrames = await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "window.__seaRAFDelay=65;window.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),window.__seaRAFDelay);window.cancelAnimationFrame=id=>clearTimeout(id);",
  });
  await load("/");
  await delay(2800);
  const slowBudget = await evaluate(
    "(()=>{const c=document.querySelector('canvas[data-ocean]');return {quality:c.dataset.quality,pixels:c.width*c.height,frames:Number(c.dataset.frameCount)};})()",
  );
  results.push({
    name: "sustained-slow-delivery-downgrades",
    ...slowBudget,
    pass: slowBudget.quality === "low" && slowBudget.pixels <= 177500 && slowBudget.frames > 12,
  });
  await evaluate("window.__seaRAFDelay=8");
  await delay(100);
  const scrollPriority = await evaluate(
    `(async()=>{const c=document.querySelector('canvas[data-ocean]'),s=document.querySelector('[data-observatory]');const before=Number(c.dataset.frameCount),distance=s.offsetHeight-s.firstElementChild.clientHeight;for(let i=0;i<20;i++){await new Promise(r=>requestAnimationFrame(r));scrollTo(0,distance*(i+1)/30);window.dispatchEvent(new Event('scroll'));}await new Promise(r=>requestAnimationFrame(r));return {draws:Number(c.dataset.frameCount)-before,quality:c.dataset.quality};})()`,
  );
  results.push({
    name: "scroll-bypasses-idle-low-cadence",
    ...scrollPriority,
    pass: scrollPriority.draws >= 15 && scrollPriority.quality === "low",
  });
  await send("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: slowFrames.identifier,
  });
  const fastFrames = await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "window.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),8);window.cancelAnimationFrame=id=>clearTimeout(id);",
  });
  await load("/");
  await delay(100);
  const fastBefore = await frames();
  await delay(500);
  const fastDraws = (await frames()) - fastBefore;
  results.push({
    name: "high-refresh-bounds-draws",
    drawsIn500Ms: fastDraws,
    pass: fastDraws >= 12 && fastDraws <= 34,
  });
  await send("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: fastFrames.identifier,
  });
}
