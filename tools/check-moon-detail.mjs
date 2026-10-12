import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { indiaMoonDay } from "../components/observatory/moon-phase.ts";
import { delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/moon-detail";
mkdirSync(out, { recursive: true });

const desktop = { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false };
const retina = { width: 1440, height: 900, deviceScaleFactor: 2, mobile: false };
const phone = { width: 390, height: 844, deviceScaleFactor: 3, mobile: true };

const geometry = `(() => {
  const map=document.querySelector('[data-moon-map]');
  const moon=document.querySelector('[data-sky-theme]');
  const box=map.getBoundingClientRect();
  return {
    disc:box.toJSON(),
    stage:document.querySelector('canvas[data-ocean]').parentElement.getBoundingClientRect().toJSON(),
    hasControl:!!map.querySelector('a,button,input'),
    pointerEvents:getComputedStyle(map).pointerEvents,
    moonClickable:!moon.hidden &&
      document.elementFromPoint(box.x+box.width/2,box.y+box.height/2)===moon
  };
})()`;

const sameDisc = (state) => {
  const message = JSON.stringify(state);
  assert.ok(Math.abs(state.disc.width - state.stage.height * 0.038) < 1, message);
  assert.ok(Math.abs(state.disc.height - state.disc.width) < 1, message);
  const centreX = state.disc.x + state.disc.width / 2;
  const centreY = state.disc.y + state.disc.height / 2;
  assert.ok(Math.abs(centreX - (state.stage.x + state.stage.width * 0.76)) < 1, message);
  assert.ok(Math.abs(centreY - (state.stage.y + state.stage.height * 0.26)) < 1, message);
  assert.equal(state.hasControl, false, message);
  assert.equal(state.pointerEvents, "none", message);
};

await withBrowser({ name: "moon-detail" }, async ({ send, evaluate, onMessage }) => {
  const errors = [];
  const mapRequests = [];
  onMessage((message) => {
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
    if (
      message.method === "Network.requestWillBeSent" &&
      message.params.request.url.includes("moon-lroc-2k-near-side.jpg")
    )
      mapRequests.push(message.params.request.initialPriority);
  });
  const until = async (expression, attempts = 100) => {
    for (let i = 0; i < attempts; i++) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    assert.fail(`Timed out waiting for ${expression}`);
  };
  const open = async (viewport) => {
    await send("Emulation.setDeviceMetricsOverride", viewport);
    await send("Page.navigate", { url: base.href });
    await until("document.querySelector('canvas[data-ocean]')?.dataset.renderer==='webgl2'");
  };
  const capture = async (label, clip) => {
    const shot = await send("Page.captureScreenshot", { format: "png", ...(clip && { clip }) });
    writeFileSync(`${out}/${label}.png`, Buffer.from(shot.data, "base64"));
  };
  const moonClip = async (scale) => {
    const disc = (await evaluate(geometry)).disc;
    const margin = disc.width * 2;
    return {
      x: disc.x - margin,
      y: disc.y - margin,
      width: disc.width + margin * 2,
      height: disc.height + margin * 2,
      scale,
    };
  };
  const mapOpacity = () => evaluate("document.querySelector('[data-moon-map]').style.opacity");

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.moonNow=Date.parse('2026-10-18T15:30:00Z');
      Date.now=()=>window.moonNow;
      if(!localStorage.getItem('studio-theme'))localStorage.setItem('studio-theme','day');
      localStorage.setItem('studio-wave-sound','off');`,
  });

  await open(desktop);
  await delay(1500);
  assert.equal(await evaluate("document.documentElement.dataset.studioTheme"), "day");
  assert.equal(mapRequests.length, 0, "a daytime sea never requests the lunar map");
  assert.equal(await evaluate("!!document.querySelector('[data-moon-detail]')"), false);
  assert.equal(await mapOpacity(), "0");

  const fade = await evaluate(`new Promise(resolve => {
    const ocean=document.querySelector('canvas[data-ocean]');
    const map=document.querySelector('[data-moon-map]');
    const frames=[];
    const step=()=>{
      const frame=[ocean.dataset.nightBlend,ocean.dataset.moonMapBlend,map.style.opacity].map(Number);
      frames.push(frame);
      if((frame[0]===1&&frame[1]===1)||frames.length>900)resolve(frames);
      else requestAnimationFrame(step);
    };
    document.querySelector('[data-sky-theme]').click();
    requestAnimationFrame(step);
  })`);
  const fadeError = Math.max(
    ...fade.map(([night, mapped, opacity]) => Math.abs(night * mapped - opacity)),
  );
  assert.ok(fadeError < 1e-5, `the map follows night and its crossfade: ${JSON.stringify(fade)}`);
  assert.ok(
    fade.some(([night]) => night > 0.05 && night < 0.95),
    "the night sky fades in",
  );
  assert.ok(
    fade.some(([, mapped]) => mapped > 0.05 && mapped < 0.95),
    "the shader Moon crossfades into the map",
  );
  assert.deepEqual(fade.at(-1), [1, 1, 1]);
  assert.ok(await evaluate("!!document.querySelector('[data-moon-detail=shown]')"));
  assert.equal(mapRequests.length, 1);
  const desktopGeometry = await evaluate(geometry);
  sameDisc(desktopGeometry);
  assert.ok(desktopGeometry.moonClickable, "the mapped disc leaves the Moon button clickable");
  assert.ok(
    await evaluate("!!document.querySelector('a[href=\"https://svs.gsfc.nasa.gov/4720/\"]')"),
  );
  await capture("desktop");

  const sample = async (label, date) => {
    const day = indiaMoonDay(Date.parse(date));
    await evaluate(`window.moonNow=Date.parse(${JSON.stringify(date)})`);
    await until(`document.querySelector('[data-moon-detail]').dataset.moonDetailDay==='${day}'`);
    await capture(`${label}-zoomed`, await moonClip(4));
    return evaluate(`(() => {
      const pixels=document.querySelector('[data-moon-detail]').getContext('2d')
        .getImageData(0,0,512,512).data;
      const light=(x,y)=>{
        const at=(y*512+x)*4;
        return Math.round(.2126*pixels[at]+.7152*pixels[at+1]+.0722*pixels[at+2]);
      };
      return {left:light(128,256),centre:light(256,256),right:light(384,256),
        transparentCorner:pixels[3]===0};
    })()`);
  };
  const waxing = await sample("waxing", "2026-10-19T15:30:00Z");
  const waning = await sample("waning", "2026-11-01T15:30:00Z");
  const newMoon = await sample("new", "2026-10-10T15:30:00Z");
  const full = await sample("full", "2026-10-26T15:30:00Z");
  assert.ok(waxing.right > waxing.left * 2, JSON.stringify(waxing));
  assert.ok(waning.left > waning.right * 2, JSON.stringify(waning));
  assert.ok(newMoon.centre > 0 && newMoon.centre < full.centre * 0.3);
  assert.ok(full.centre > waxing.centre);
  assert.ok([waxing, waning, newMoon, full].every((state) => state.transparentCorner));
  const requestsAfterDates = mapRequests.length;
  assert.equal(requestsAfterDates, 5, "one map read per rendered day");

  await evaluate("document.querySelector('[data-sky-theme]').click()");
  await until("document.querySelector('[data-moon-map]').style.opacity==='0'", 30);
  assert.ok(await evaluate("!!document.querySelector('[data-moon-detail=shown]')"));
  await evaluate("document.querySelector('[data-sky-theme]').click()");
  await until("document.querySelector('[data-moon-map]').style.opacity==='1'", 30);
  assert.equal(mapRequests.length, requestsAfterDates, "returning to night reuses the drawn Moon");

  await evaluate("window.scrollTo(0, document.querySelector('[data-observatory]').scrollHeight)");
  await until("document.querySelector('[data-moon-map]').style.opacity==='0'", 30);
  await evaluate("window.scrollTo(0, 0)");
  await until("document.querySelector('[data-moon-map]').style.opacity==='1'", 30);

  const mappedMoon = "document.querySelector('canvas[data-ocean]').dataset.moonMapBlend==='1'";
  await open(retina);
  await until(mappedMoon);
  sameDisc(await evaluate(geometry));
  await capture("retina");
  await capture("retina-moon", await moonClip(1));

  await open(phone);
  await until(mappedMoon);
  const phoneGeometry = await evaluate(geometry);
  sameDisc(phoneGeometry);
  await capture("phone");
  await send("Input.synthesizePinchGesture", {
    x: Math.round(phoneGeometry.disc.x + phoneGeometry.disc.width / 2),
    y: Math.round(phoneGeometry.disc.y + phoneGeometry.disc.height / 2),
    scaleFactor: 3,
    relativeSpeed: 800,
  });
  await delay(500);
  const pinched = await evaluate(`({scale:visualViewport.scale,geometry:${geometry}})`);
  assert.ok(pinched.scale > 2.5, JSON.stringify(pinched));
  sameDisc(pinched.geometry);
  await capture("phone-pinch");
  await send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });

  await evaluate(
    "document.querySelector('canvas[data-ocean]').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()",
  );
  await until("document.querySelector('[data-moon-map]').hidden", 30);

  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await open(desktop);
  await until("!!document.querySelector('[data-moon-detail=shown]')");
  await until(mappedMoon, 5);
  assert.equal(await mapOpacity(), "1", "reduced motion swaps in the map without a crossfade");

  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Network.setBlockedURLs", { urls: ["*moon-lroc-2k-near-side.jpg"] });
  await open(desktop);
  await until("!!document.querySelector('[data-moon-detail=unavailable]')");
  await delay(300);
  assert.equal(await mapOpacity(), "0");
  assert.equal(
    await evaluate("document.querySelector('canvas[data-ocean]').dataset.moonMapBlend"),
    "0",
    "without the map the shader keeps drawing its own Moon",
  );

  assert.equal(errors.length, 0, JSON.stringify(errors));
  const report = {
    fadeFrames: fade.length,
    desktopGeometry,
    phoneGeometry,
    pinched,
    waxing,
    waning,
    newMoon,
    full,
    mapRequests,
  };
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(report);
});
