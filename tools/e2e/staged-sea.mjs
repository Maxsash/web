import { delay } from "../lib/browser.mjs";

export async function runStagedSea(ctx) {
  const { evaluate, frames, load, results, send, snapshot } = ctx;
  const coarsePointer = await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "const originalMatchMedia=window.matchMedia.bind(window);window.matchMedia=query=>originalMatchMedia(query==='(pointer: coarse)'?'(min-width: 0px)':query);",
  });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 844,
    height: 390,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await load("/");
  const landscape = await evaluate(
    "(()=>{const c=document.querySelector('canvas[data-ocean]');return {pixels:c.width*c.height,triangles:Number(c.dataset.triangles),quality:c.dataset.quality};})()",
  );
  results.push({
    name: "touch-landscape-compact-budget",
    ...landscape,
    pass:
      landscape.pixels <= 361200 &&
      landscape.triangles === 21600 &&
      landscape.quality === "compact",
  });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await load("/");
  await snapshot("staged-390-sea");
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 100, y: 400, id: 1 }],
  });
  await send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 260, y: 410, id: 1 }],
  });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  results.push({
    name: "mobile-horizontal-gesture-keeps-stage",
    pass: await evaluate("document.querySelector('[data-observatory]').dataset.stage==='0'"),
  });
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: 150, y: 400, id: 1 },
      { x: 210, y: 400, id: 2 },
    ],
  });
  await send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: 100, y: 400, id: 1 },
      { x: 260, y: 400, id: 2 },
    ],
  });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  results.push({
    name: "mobile-multitouch-keeps-stage",
    pass: await evaluate("document.querySelector('[data-observatory]').dataset.stage==='0'"),
  });
  await send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });
  const swipe = async (direction, settle) => {
    const openingReveal =
      direction > 0 &&
      (await evaluate("document.querySelector('[data-observatory]').dataset.stage==='0'"));
    const from = direction > 0 ? 620 : 300,
      to = direction > 0 ? 300 : 620;
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 180, y: from, id: 1 }],
    });
    await send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 180, y: (from + to) / 2, id: 1 }],
    });
    await delay(20);
    await send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 180, y: to, id: 1 }],
    });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    if (openingReveal && settle === undefined) {
      const reveal = () =>
        evaluate(
          "(()=>{const gl=document.querySelector('canvas[data-ocean]').getContext('webgl2');const program=gl.getParameter(gl.CURRENT_PROGRAM);return gl.getUniform(program,gl.getUniformLocation(program,'uReveal'));})()",
        );
      await delay(200);
      const early = await reveal();
      await delay(600);
      const middle = await reveal();
      await delay(800);
      const late = await reveal();
      await delay(280);
      const end = await reveal();
      results.push({
        name: "mobile-opening-reveal-spreads-through-duration",
        early,
        middle,
        late,
        end,
        pass:
          early > 0.05 &&
          early < 0.25 &&
          middle > early + 0.1 &&
          late > middle + 0.05 &&
          Math.abs(end - (0.55 - 0.14) / 0.75) < 0.002,
      });
    } else await delay(settle ?? 680);
  };
  for (let index = 1; index <= 2; index++) {
    await swipe(1);
    const state = await evaluate(
      "(()=>{const s=document.querySelector('[data-observatory]');return {stage:s.dataset.stage,scrollY,label:s.querySelector('[data-stage-label]').textContent};})()",
    );
    results.push({
      name: "mobile-swipe-one-stage",
      index,
      ...state,
      pass:
        state.stage === String(index) &&
        state.scrollY <= 2 &&
        state.label === `${index + 1} / 3 · ${["Sea", "Structure", "Drawing"][index]}`,
    });
    await snapshot("staged-390-" + ["sea", "structure", "drawing"][index]);
    if (index === 1) {
      await send("Emulation.setDeviceMetricsOverride", {
        width: 844,
        height: 390,
        deviceScaleFactor: 3,
        mobile: true,
      });
      await delay(180);
      const rotated = await evaluate(
        "(()=>{const s=document.querySelector('[data-observatory]'),c=s.querySelector('canvas');return {stage:s.dataset.stage,chapter:s.dataset.chapter,staged:s.dataset.staged,pixels:c.width*c.height,triangles:Number(c.dataset.triangles)};})()",
      );
      results.push({
        name: "mobile-rotation-retains-structure",
        ...rotated,
        pass:
          rotated.stage === "1" &&
          rotated.chapter === "structure" &&
          rotated.staged === "true" &&
          rotated.pixels <= 361200 &&
          rotated.triangles === 21600,
      });
      await snapshot("staged-landscape-structure");
      await send("Emulation.setDeviceMetricsOverride", {
        width: 390,
        height: 844,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await delay(180);
      results.push({
        name: "mobile-rotation-return-retains-stage",
        pass: await evaluate(
          "document.querySelector('[data-observatory]').dataset.stage==='1' && document.querySelector('[data-observatory]').dataset.chapter==='structure' && scrollY<=2",
        ),
      });
    }
  }
  await send("Input.synthesizeScrollGesture", {
    x: 180,
    y: 600,
    yDistance: -350,
    speed: 900,
    gestureSourceType: "touch",
  });
  await delay(200);
  results.push({
    name: "mobile-final-stage-releases-page",
    pass: await evaluate(
      "scrollY>30 && document.querySelector('[data-observatory]').dataset.stage==='2'",
    ),
  });
  await evaluate("scrollTo(0,0)");
  await delay(100);
  await swipe(-1);
  results.push({
    name: "mobile-reverse-one-stage",
    pass: await evaluate(
      "document.querySelector('[data-observatory]').dataset.stage==='1' && scrollY<=2",
    ),
  });

  await swipe(-1);
  await swipe(1, 150);
  await swipe(-1);
  results.push({
    name: "mobile-interrupted-reveal-reverses",
    pass: await evaluate(
      "document.querySelector('[data-observatory]').dataset.stage==='0' && document.querySelector('[data-observatory]').dataset.chapter==='sea' && scrollY<=2",
    ),
  });
  await delay(1300);
  results.push({
    name: "mobile-interrupted-reveal-stays-reversed",
    pass: await evaluate(
      "document.querySelector('[data-observatory]').dataset.stage==='0' && document.querySelector('[data-observatory]').dataset.chapter==='sea'",
    ),
  });
  await evaluate("document.querySelector('[data-hero-pause]').click()");
  await swipe(1);
  const pausedFrames = await frames();
  await delay(200);
  results.push({
    name: "mobile-paused-sea-stage-settles",
    pass:
      (await evaluate(
        "document.querySelector('[data-observatory]').dataset.stage==='1' && document.querySelector('[data-observatory]').dataset.chapter==='structure' && document.querySelector('[data-hero-pause]').textContent.includes('Resume the sea')",
      )) && (await frames()) === pausedFrames,
  });
  await evaluate("document.querySelector('[data-hero-pause]').click()");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await evaluate("document.querySelector('[data-stage-next]').click()");
  await delay(120);
  const stillBefore = await frames();
  await delay(200);
  results.push({
    name: "mobile-reduced-motion-stage-still",
    pass:
      (await evaluate(
        "document.querySelector('[data-observatory]').dataset.stage==='2' && document.querySelector('[data-stage-label]').textContent.includes('Drawing')",
      )) && (await frames()) === stillBefore,
  });
  await evaluate("document.querySelector('[data-stage-next]').click()");
  await delay(100);
  results.push({
    name: "mobile-stage-button-exits-to-services",
    pass: await evaluate(
      "document.getElementById('services').getBoundingClientRect().top<innerHeight && scrollY>30",
    ),
  });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 320,
    height: 568,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await load("/");
  await snapshot("staged-320-sea");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 844,
    height: 390,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await load("/");
  await snapshot("staged-landscape-sea");
  await send("Page.removeScriptToEvaluateOnNewDocument", {
    identifier: coarsePointer.identifier,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
}
