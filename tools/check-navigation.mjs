import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { delay, localBaseFromArgs, NO_GPU_FLAGS, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const captures = "tools/.out/navigation";
mkdirSync(captures, { recursive: true });

await withBrowser({ name: "navigation", flags: NO_GPU_FLAGS }, async (page) => {
  const { send, evaluate, onMessage, pressKey } = page;
  const held = new Set();
  onMessage(({ method, params }) => {
    if (method === "Fetch.requestPaused") held.add(params.requestId);
  });
  await send("Page.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });

  async function waitFor(expression) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    throw new Error(`Timed out: ${expression}`);
  }

  for (const { href, reduced, phone } of [
    { href: "/blog", reduced: false, phone: false },
    { href: "/work/business-operations", reduced: true, phone: true },
  ]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: phone ? 390 : 1440,
      height: phone ? 844 : 1000,
      deviceScaleFactor: 1,
      mobile: phone,
    });
    await send("Emulation.setTouchEmulationEnabled", { enabled: phone });
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }],
    });
    await send("Page.navigate", { url: new URL("/?seed=70806d5e&version=2", base).href });
    await waitFor("document.querySelector('html[data-feedback]') !== null");
    await evaluate(`localStorage.setItem('studio-theme', '${reduced ? "night" : "day"}')`);
    await send("Page.reload");
    await waitFor("document.querySelector('html[data-feedback]') !== null");
    const selector = `a[href="${href}"]`;
    const target = await evaluate(`(() => {
      const link = document.querySelector(${JSON.stringify(selector)});
      link.scrollIntoView({block: 'center'});
      link.focus({preventScroll: true});
      const {x,y,width,height} = link.getBoundingClientRect();
      return {x,y,width,height};
    })()`);
    await send("Fetch.enable", { patterns: [{ urlPattern: "*_rsc=*", requestStage: "Request" }] });
    if (phone) {
      const point = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
      await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
      await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    } else {
      await pressKey("Enter");
    }
    await waitFor(
      "document.querySelector('[role=status]')?.textContent.includes('Opening page') || [...document.querySelectorAll('[role=status]')].some(el => el.textContent.includes('Opening page'))",
    );
    assert.ok(held.size > 0, "A real navigation request is delayed");
    await delay(1000);
    const pending = await evaluate(`(() => {
      const badge = [...document.querySelectorAll('[role=status]')].find(el => el.textContent.includes('Opening page'));
      const icon = badge.firstElementChild;
      const link = document.querySelector(${JSON.stringify(selector)});
      const {width,height} = link.getBoundingClientRect();
      const bounds = badge.getBoundingClientRect();
      return {
        count: [...document.querySelectorAll('[role=status]')].filter(el => el.textContent.includes('Opening page')).length,
        parent: badge.parentElement.tagName,
        position: getComputedStyle(badge).position,
        pointerEvents: getComputedStyle(badge).pointerEvents,
        animation: getComputedStyle(icon).animationName,
        focus: document.activeElement === link,
        width,height,
        fits: bounds.left >= 0 && bounds.right <= innerWidth && bounds.bottom <= innerHeight,
        theme: document.documentElement.dataset.studioTheme
      };
    })()`);
    assert.equal(pending.count, 1);
    assert.equal(pending.parent, "BODY");
    assert.equal(pending.position, "fixed");
    assert.equal(pending.pointerEvents, "none");
    assert.equal(pending.width, target.width);
    assert.equal(pending.height, target.height);
    assert.ok(pending.fits);
    if (!phone) assert.ok(pending.focus, "Keyboard focus stays on the link while waiting");
    assert.equal(pending.animation === "none", reduced);
    assert.equal(pending.theme, reduced ? "night" : "day");
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      `${captures}/${phone ? "phone-night" : "desktop-day"}.png`,
      Buffer.from(data, "base64"),
    );
    for (const requestId of held) await send("Fetch.continueRequest", { requestId });
    held.clear();
    await send("Fetch.disable");
    await waitFor(`location.pathname === ${JSON.stringify(href)}`);
    await waitFor(
      "![...document.querySelectorAll('[role=status]')].some(el => el.textContent.includes('Opening page'))",
    );
    console.log(
      `PASS ${href}: delayed ${phone ? "touch" : "keyboard"} navigation, stable layout, ${reduced ? "still night" : "animated day"} badge, clears on arrival`,
    );
  }
});
