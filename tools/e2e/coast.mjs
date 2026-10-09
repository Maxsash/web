import { delay } from "../lib/browser.mjs";
import { join } from "node:path";
import { writeFileSync } from "node:fs";

export async function runCoastChecks(ctx) {
  const { evaluate, load, out, results, send, snapshot } = ctx;
  // Coastal exploration: theme, viewport scheduling, tracks, and explicit sound controls.
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-reduced-motion", value: "no-preference" },
      { name: "prefers-color-scheme", value: "light" },
    ],
  });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await load("/");
  await evaluate("localStorage.setItem('studio-wave-sound','off')");
  await load("/");
  await evaluate(
    "localStorage.removeItem('studio-theme');document.documentElement.dataset.studioTheme='day';window.dispatchEvent(new Event('studio-theme'))",
  );
  await delay(800);
  await snapshot("coast-day-sea");
  const shoreFrames = () =>
    evaluate("Number(document.querySelector('[data-shore] canvas').dataset.shoreFrames)");
  await delay(150);
  const offscreen = await shoreFrames();
  await delay(180);
  results.push({ name: "shore-offscreen-stops", pass: offscreen === (await shoreFrames()) });
  await evaluate("document.querySelector('[data-shore]').scrollIntoView({block:'end'})");
  await delay(250);
  await snapshot("coast-day-shore");
  const active = await shoreFrames();
  await delay(180);
  results.push({ name: "shore-visible-animates", pass: (await shoreFrames()) > active });
  const point = await evaluate(
    "(()=>{const r=document.querySelector('[data-shore]').getBoundingClientRect();return {x:80,y:Math.min(innerHeight-80,r.bottom-100)}})()",
  );
  for (let i = 0; i < 8; i++)
    await send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: point.x + i * 30,
      y: point.y,
    });
  await delay(80);
  results.push({
    name: "shore-mouse-tracks",
    pass: await evaluate(
      "Number(document.querySelector('[data-shore] canvas').dataset.shoreSteps)>0",
    ),
  });
  await evaluate("document.querySelector('[data-shore-pause]').click()");
  await delay(100);
  const paused = await shoreFrames();
  await delay(180);
  results.push({ name: "shore-paused-stops", pass: paused === (await shoreFrames()) });
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  await delay(150);
  await snapshot("coast-night-shore");
  results.push({
    name: "night-theme-synchronizes",
    pass: await evaluate(
      "document.documentElement.dataset.studioTheme==='night' && [...document.querySelectorAll('[data-theme-toggle]')].every(b=>b.textContent.includes('Night sea'))",
    ),
  });
  await evaluate("document.querySelector('[data-wave-sound]').click()", true);
  await delay(200);
  results.push({
    name: "wave-sound-manual-enable",
    pass: await evaluate(
      "document.querySelector('[data-wave-sound]').textContent.includes('Mute waves')",
    ),
  });
  await evaluate("document.querySelector('[data-wave-sound]').click()", true);
  await delay(100);
  results.push({
    name: "wave-sound-off",
    pass: await evaluate(
      "document.querySelector('[data-wave-sound]').textContent.includes('Play waves')",
    ),
  });
  // Ordinary interaction never starts the waves; only the wave button does.
  await evaluate("localStorage.removeItem('studio-wave-sound')");
  await load("/");
  results.push({
    name: "waves-off-by-default",
    pass: await evaluate(
      "[...document.querySelectorAll('[data-wave-sound]')].every(b=>b.textContent.includes('Play waves') && b.textContent.includes('Play waves'))",
    ),
  });
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: 1200,
    y: 700,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: 1200,
    y: 700,
    button: "left",
    clickCount: 1,
  });
  await delay(250);
  results.push({
    name: "ordinary-click-keeps-waves-off",
    pass: await evaluate(
      "[...document.querySelectorAll('[data-wave-sound]')].every(b=>b.textContent.includes('Play waves'))",
    ),
  });
  await send("Input.synthesizeScrollGesture", {
    x: 1200,
    y: 700,
    yDistance: -200,
    speed: 900,
    gestureSourceType: "mouse",
  });
  await delay(150);
  results.push({
    name: "ordinary-scroll-keeps-waves-off",
    pass: await evaluate(
      "document.querySelector('[data-wave-sound]').textContent.includes('Play waves')",
    ),
  });
  await evaluate("document.querySelector('[data-wave-sound]').click()", true);
  await delay(200);
  results.push({
    name: "play-button-synchronizes-both-controls",
    pass: await evaluate(
      "[...document.querySelectorAll('[data-wave-sound]')].every(b=>b.textContent.includes('Mute waves'))",
    ),
  });
  await evaluate("document.querySelector('[data-wave-sound]').click()", true);
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: 1200,
    y: 700,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: 1200,
    y: 700,
    button: "left",
    clickCount: 1,
  });
  await delay(100);
  results.push({
    name: "wave-sound-mute-prevents-restart",
    pass: await evaluate(
      "[...document.querySelectorAll('[data-wave-sound]')].every(b=>b.textContent.includes('Play waves'))",
    ),
  });
  await load("/");
  results.push({
    name: "wave-sound-mute-persists",
    pass: await evaluate(
      "document.querySelector('[data-wave-sound]').textContent.includes('Play waves') && localStorage.getItem('studio-wave-sound')==='off'",
    ),
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await evaluate("localStorage.removeItem('studio-wave-sound')");
  await load("/");
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 1000, y: 700, id: 1 }],
  });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await delay(250);
  results.push({
    name: "ordinary-touch-keeps-waves-off",
    pass: await evaluate(
      "document.querySelector('[data-wave-sound]').textContent.includes('Play waves')",
    ),
  });
  const soundPoint = await evaluate(
    "(()=>{const r=document.querySelector('[data-wave-sound]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()",
  );
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...soundPoint, id: 1 }],
  });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await delay(250);
  results.push({
    name: "sound-button-touch-plays",
    pass: await evaluate(
      "document.querySelector('[data-wave-sound]').textContent.includes('Mute waves')",
    ),
  });
  await evaluate("document.querySelector('[data-wave-sound]').click()", true);
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await load("/");
  await delay(800);
  await snapshot("coast-night-sea");
  results.push({
    name: "night-theme-persists",
    pass: await evaluate("document.documentElement.dataset.studioTheme==='night'"),
  });
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
  await evaluate("document.querySelector('[data-shore]').scrollIntoView({block:'end'})");
  await delay(200);
  await snapshot("coast-night-mobile");
  const still = await shoreFrames();
  await delay(180);
  results.push({
    name: "shore-reduced-motion-still-and-bounded",
    pass:
      still === (await shoreFrames()) &&
      (await evaluate(
        "Number(document.querySelector('[data-shore] canvas').dataset.shorePixels)<=421200 && document.querySelector('[data-wave-sound]').textContent.includes('Play waves') && document.querySelector('a[href=\"https://github.com/ctrl-alt-yash\"]')!==null",
      )),
  });
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  await delay(120);
  await snapshot("coast-day-mobile");
  for (const theme of ["day", "night"]) {
    if (theme === "night") {
      await evaluate("document.querySelector('[data-theme-toggle]').click()");
      await delay(100);
    }
    const clip = await evaluate(
      "(()=>{const r=document.querySelector('[data-shore]').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth,height:r.height,scale:1}})()",
    );
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip,
    });
    writeFileSync(join(out, `coast-${theme}-mobile-full.png`), Buffer.from(shot.data, "base64"));
  }
  await evaluate("document.querySelector('[data-theme-toggle]').click()");

  results.push({
    name: "control-placement",
    pass: await evaluate(
      "document.querySelectorAll('[data-theme-toggle]').length===1 && document.querySelector('[data-shore] [data-theme-toggle]')!==null && document.querySelectorAll('[data-wave-sound]').length===2 && document.querySelector('header [data-wave-sound]')!==null",
    ),
  });
  await evaluate("localStorage.removeItem('studio-theme')");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "dark" }],
  });
  await load("/");
  await delay(100);
  results.push({
    name: "theme-default-follows-system-dark",
    pass: await evaluate("document.documentElement.dataset.studioTheme==='night'"),
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "light" }],
  });
  await delay(100);
  results.push({
    name: "theme-follows-system-change",
    pass: await evaluate("document.documentElement.dataset.studioTheme==='day'"),
  });
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "dark" }],
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: "light" }],
  });
  await delay(100);
  results.push({
    name: "manual-theme-overrides-system",
    pass: await evaluate("document.documentElement.dataset.studioTheme==='night'"),
  });
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
}
