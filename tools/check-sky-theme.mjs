import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import {
  delay,
  localBaseFromArgs,
  SWIFTSHADER_FLAGS,
  NO_GPU_FLAGS,
  withBrowser,
} from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/sky-theme";
mkdirSync(out, { recursive: true });
const results = [];
await withBrowser(
  { name: "sky-theme", flags: SWIFTSHADER_FLAGS },
  async ({ send, evaluate, pressKey, onMessage }) => {
    const errors = [];
    onMessage((message) => {
      if (message.method === "Runtime.exceptionThrown")
        errors.push(message.params.exceptionDetails);
    });
    await send("Page.enable");
    await send("Runtime.enable");
    const setup = await send("Page.addScriptToEvaluateOnNewDocument", {
      source:
        "localStorage.setItem('studio-theme','day');localStorage.setItem('studio-wave-sound','off');",
    });
    const media = (motion, scheme = "light") =>
      send("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-reduced-motion", value: motion },
          { name: "prefers-color-scheme", value: scheme },
        ],
      });
    const viewport = (width, height, mobile = false) =>
      send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
    const load = async () => {
      await send("Page.navigate", { url: new URL("/?seed=70806d5e&version=2", base).href });
      for (let i = 0; i < 100; i++) {
        if (
          await evaluate(
            "document.querySelector('canvas[data-ocean]')?.dataset.renderer==='webgl2'",
          )
        )
          return;
        await delay(100);
      }
      throw Error("Sea engine did not start");
    };
    const probe = () =>
      evaluate(`(() => {
    const button=document.querySelector('[data-sky-theme]'), canvas=document.querySelector('canvas[data-ocean]');
    const b=button.getBoundingClientRect(), c=canvas.getBoundingClientRect(), style=getComputedStyle(button);
    return {night:Number(canvas.dataset.nightBlend),ripples:Number(canvas.dataset.rippleCount||0),frames:Number(canvas.dataset.frameCount),
      theme:document.documentElement.dataset.studioTheme,saved:localStorage.getItem('studio-theme'),label:button.getAttribute('aria-label'),
      hidden:button.hidden||style.visibility==='hidden',width:b.width,height:b.height,x:b.left+b.width/2,y:b.top+b.height/2,
      expectedX:c.left+c.width*.76,expectedY:c.top+c.height*.26,shore:document.querySelector('[data-theme-toggle]').textContent,
      focused:button===document.activeElement,outline:style.outlineStyle,chapter:document.querySelector('[data-observatory]').dataset.chapter};
  })()`);
    const click = async (selector = "[data-sky-theme]") => {
      const point = await evaluate(
        `(() => {const b=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}})()`,
      );
      await send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        button: "left",
        clickCount: 1,
        ...point,
      });
      await send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        button: "left",
        clickCount: 1,
        ...point,
      });
    };
    const snapshot = async (name) => {
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(`${out}/${name}.png`, Buffer.from(data, "base64"));
    };
    await viewport(1440, 1000);
    await media("no-preference");
    await load();
    await delay(900);
    const initial = await probe();
    assert.ok(!initial.hidden && initial.width >= 44 && initial.height >= 44);
    assert.ok(
      Math.abs(initial.x - initial.expectedX) < 1 && Math.abs(initial.y - initial.expectedY) < 1,
    );
    assert.equal(initial.night, 0);
    await click();
    await delay(220);
    const middle = await probe();
    assert.ok(middle.night > 0 && middle.night < 1);
    assert.equal(middle.ripples, initial.ripples + 1);
    assert.equal(middle.theme, "night");
    assert.equal(middle.saved, "night");
    assert.ok(middle.label.startsWith("Moon") && middle.shore.includes("Night sea"));
    await snapshot("desktop-transition");
    await delay(1100);
    assert.equal((await probe()).night, 1);
    await snapshot("desktop-night");
    results.push({ name: "native-click-fade-and-one-ripple", initial, middle });
    await click();
    await delay(230);
    const reversing = await probe();
    await click();
    await delay(50);
    const reversed = await probe();
    assert.ok(Math.abs(reversed.night - reversing.night) < 0.15);
    await delay(1100);
    assert.equal((await probe()).night, 1);
    results.push({ name: "rapid-reversal-keeps-continuity", reversing, reversed });
    await media("no-preference", "dark");
    await media("no-preference", "light");
    await delay(100);
    assert.equal((await probe()).theme, "night");
    await send("Page.removeScriptToEvaluateOnNewDocument", setup);
    await load();
    assert.equal((await probe()).night, 1);
    results.push({ name: "sky-choice-persists-and-overrides-system" });
    await evaluate("document.querySelector('[data-sky-theme]').focus()");
    await pressKey("Tab", 8);
    await pressKey("Tab");
    const focus = await probe();
    assert.ok(focus.focused && focus.outline !== "none");
    await pressKey("Enter");
    await delay(1100);
    assert.equal((await probe()).night, 0);
    await pressKey("Space");
    await delay(1100);
    assert.equal((await probe()).night, 1);
    results.push({ name: "keyboard-enter-space-and-focus-ring" });
    await click();
    await delay(200);
    const moving = await probe();
    assert.ok(moving.night > 0 && moving.night < 1);
    await media("reduce");
    await delay(100);
    assert.equal((await probe()).night, 0);
    await click();
    await delay(100);
    assert.equal((await probe()).night, 1);
    await media("no-preference");
    results.push({ name: "live-reduced-motion-change-settles-an-active-fade" });
    await click("[data-hero-pause]");
    await delay(100);
    const still = await probe();
    await click();
    await delay(100);
    const pausedSwitch = await probe();
    assert.equal(pausedSwitch.night, 0);
    assert.equal(pausedSwitch.ripples, still.ripples);
    await delay(180);
    assert.equal((await probe()).frames, pausedSwitch.frames);
    await click("[data-hero-pause]");
    await media("reduce");
    const reduced = await probe();
    await click();
    await delay(100);
    const reducedSwitch = await probe();
    assert.equal(reducedSwitch.night, 1);
    assert.equal(reducedSwitch.ripples, reduced.ripples);
    results.push({ name: "paused-and-reduced-motion-switch-immediately-without-ripple" });
    await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await viewport(390, 844, true);
    await media("no-preference");
    await load();
    await delay(300);
    const phone = await probe();
    assert.ok(!phone.hidden && phone.width >= 44 && phone.height >= 44);
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: phone.x, y: phone.y, id: 1 }],
    });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await delay(200);
    const phoneMiddle = await probe();
    assert.ok(phoneMiddle.night > 0 && phoneMiddle.night < 1);
    assert.equal(phoneMiddle.ripples, phone.ripples + 1);
    assert.equal(phoneMiddle.chapter, "sea");
    await delay(1100);
    assert.equal((await probe()).night, 0);
    await snapshot("phone-day");
    results.push({ name: "native-phone-tap-keeps-sea-stage", phone, phoneMiddle });
    await evaluate("document.querySelector('[data-stage-next]').click()");
    await delay(1900);
    assert.ok((await probe()).hidden);
    results.push({ name: "drawing-hides-sky-control" });
    await evaluate("document.querySelector('[data-stage-previous]').click()");
    await delay(750);
    for (const [width, height] of [
      [320, 568],
      [844, 390],
      [1920, 1080],
    ]) {
      await viewport(width, height, width < 1000);
      await delay(200);
      const view = await probe();
      if (!view.hidden) {
        assert.ok(view.width >= 44 && view.height >= 44);
        assert.ok(Math.abs(view.x - view.expectedX) < 1 && Math.abs(view.y - view.expectedY) < 1);
      }
      results.push({ name: `target-${width}x${height}`, view });
    }
    assert.deepEqual(errors, []);
  },
);
await withBrowser({ name: "sky-fallback", flags: NO_GPU_FLAGS }, async ({ send, evaluate }) => {
  await send("Page.enable");
  await send("Page.navigate", { url: base.href });
  await delay(2500);
  assert.equal(
    await evaluate("document.querySelector('canvas[data-ocean]').dataset.renderer"),
    "fallback",
  );
  assert.ok(await evaluate("document.querySelector('[data-sky-theme]').hidden"));
  const before = await evaluate("document.documentElement.dataset.studioTheme");
  await evaluate("document.querySelector('[data-theme-toggle]').click()");
  assert.notEqual(await evaluate("document.documentElement.dataset.studioTheme"), before);
  results.push({ name: "fallback-hides-sky-and-keeps-labelled-toggle" });
});
writeFileSync(`${out}/report.json`, JSON.stringify(results, null, 2));
console.log(
  `Passed ${results.length} sky interaction cases: mouse/touch/keyboard, one ripple, fade/reversal, persistence, system choice, reduced/still and viewports.`,
);
