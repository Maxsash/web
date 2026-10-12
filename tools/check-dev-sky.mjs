import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { indiaMoonDay, moonForIndiaDay } from "../components/observatory/moon-phase.ts";
import { previewDay, previewPhaseDay } from "../components/observatory/phase-preview.ts";
import { delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/dev-sky";
mkdirSync(out, { recursive: true });

await withBrowser({ name: "dev-sky" }, async ({ send, evaluate, onMessage }) => {
  const errors = [];
  onMessage((message) => {
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `Date.now=()=>Date.parse('2026-10-12T15:30:00Z');
      localStorage.setItem('studio-theme','day');
      localStorage.setItem('studio-wave-sound','off');`,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: new URL("/?seed=70806d5e&version=2", base).href });
  for (let i = 0; i < 150; i++) {
    if (
      await evaluate(
        "document.querySelector('[data-dev-sky-preview]') && document.querySelector('canvas[data-ocean]')?.dataset.renderer==='webgl2'",
      )
    )
      break;
    await delay(100);
  }
  assert.ok(await evaluate("Boolean(document.querySelector('[data-dev-sky-preview]'))"));
  await evaluate("document.querySelector('[data-dev-sky-preview] summary').click()");
  const full = previewPhaseDay(0.5, indiaMoonDay(Date.parse("2026-10-12T15:30:00Z")));
  await evaluate(`Array.from(document.querySelectorAll('[data-dev-sky-preview] button'))
    .find(button=>button.textContent==='Full').click()`);
  await delay(200);
  const fullState = await evaluate(`(() => {
    const canvas=document.querySelector('canvas[data-ocean]');
    return {date:document.querySelector('#dev-sky-date').value,
      lit:Number(canvas.dataset.moonIllumination),
      theme:document.documentElement.dataset.studioTheme,
      planets:canvas.dataset.planets};
  })()`);
  assert.equal(fullState.theme, "night");
  assert.equal(fullState.date, new Date(full * 86_400_000).toISOString().slice(0, 10));
  assert.ok(fullState.lit > 0.98, JSON.stringify(fullState));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${out}/full.png`, Buffer.from(shot.data, "base64"));

  await evaluate(`(() => {
    const input=document.querySelector('#dev-sky-date');
    const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    setter.call(input,'2027-05-10');input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  })()`);
  await delay(150);
  const chosen = await evaluate(`(() => {
    const canvas=document.querySelector('canvas[data-ocean]');
    return {date:document.querySelector('#dev-sky-date').value,
      lit:Number(canvas.dataset.moonIllumination),planets:canvas.dataset.planets};
  })()`);
  assert.equal(chosen.date, "2027-05-10");
  assert.ok(Math.abs(chosen.lit - moonForIndiaDay(previewDay("2027-05-10")).illumination) < 0.001);
  await evaluate(`Array.from(document.querySelectorAll('[data-dev-sky-preview] button'))
    .find(button=>button.textContent==='Live date').click()`);
  await delay(150);
  assert.equal(await evaluate("document.querySelector('#dev-sky-date').value"), "2026-10-12");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await delay(150);
  const bounds = await evaluate(`(() => {
    const rect=document.querySelector('[data-dev-sky-preview]').getBoundingClientRect();
    return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
      width:innerWidth,height:innerHeight};
  })()`);
  assert.ok(bounds.left >= 0 && bounds.right <= bounds.width, JSON.stringify(bounds));
  assert.ok(bounds.top >= 0 && bounds.bottom <= bounds.height, JSON.stringify(bounds));
  const phone = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${out}/phone.png`, Buffer.from(phone.data, "base64"));
  assert.equal(errors.length, 0);
  console.log({ fullState, chosen });
});
