import { delay } from "../lib/browser.mjs";

export async function runStagedSea(ctx) {
  const { evaluate, frames, load, results, send, snapshot } = ctx;
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
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
  const tap = async (selector) => {
    const point = await evaluate(
      `(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`,
    );
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...point, id: 1 }],
    });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  const checkStage = async (name, index, chapter) => {
    const state = await stageState();
    results.push({
      name,
      ...state,
      pass:
        state.stage === String(index) &&
        state.chapter === chapter &&
        state.scrollY <= 2 &&
        state.label === `${index + 1} / 2 · ${index ? "Drawing" : "Sea"}` &&
        state.backDisabled === (index === 0),
    });
  };
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
          early < 0.4 &&
          middle > early + 0.1 &&
          late > middle + 0.05 &&
          Math.abs(end - 1) < 0.002,
      });
    } else await delay(settle ?? 680);
  };
  const stageState = () =>
    evaluate(
      "(()=>{const s=document.querySelector('[data-observatory]'),c=s.querySelector('canvas[data-ocean]');return {stage:s.dataset.stage,chapter:s.dataset.chapter,staged:s.dataset.staged,scrollY,backDisabled:s.querySelector('[data-stage-previous]').disabled,label:s.querySelector('[data-stage-label]').textContent,pixels:c.width*c.height,triangles:Number(c.dataset.triangles)};})()",
    );
  await tap("[data-stage-next]");
  await delay(1900);
  await checkStage("mobile-native-next-tap", 1, "atlas");
  await tap("[data-stage-previous]");
  await delay(680);
  await checkStage("mobile-native-back-tap", 0, "sea");
  await tap("[data-stage-next]");
  await delay(150);
  await tap("[data-stage-previous]");
  await delay(680);
  await checkStage("mobile-native-tap-reverses-opening", 0, "sea");
  await delay(1300);
  await checkStage("mobile-native-tap-stays-reversed", 0, "sea");
  await evaluate("scrollTo(0,5)");
  await swipe(1);
  const drawing = await stageState();
  results.push({
    name: "mobile-swipe-from-small-scroll-offset",
    ...drawing,
    pass:
      drawing.stage === "1" &&
      drawing.chapter === "atlas" &&
      drawing.scrollY <= 2 &&
      drawing.label === "2 / 2 · Drawing",
  });
  await snapshot("staged-390-drawing");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 844,
    height: 390,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await delay(180);
  const rotated = await stageState();
  results.push({
    name: "mobile-rotation-retains-drawing",
    ...rotated,
    pass:
      rotated.stage === "1" &&
      rotated.chapter === "atlas" &&
      rotated.staged === "true" &&
      rotated.pixels <= 361200 &&
      rotated.triangles === 21600,
  });
  await snapshot("staged-landscape-drawing");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await delay(180);
  const returned = await stageState();
  results.push({
    name: "mobile-rotation-return-retains-stage",
    ...returned,
    pass: returned.stage === "1" && returned.chapter === "atlas" && returned.scrollY <= 2,
  });
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
      "scrollY>30 && document.querySelector('[data-observatory]').dataset.stage==='1'",
    ),
  });
  await evaluate("scrollTo(0,120)");
  await delay(100);
  await swipe(-1);
  results.push({
    name: "mobile-reverse-from-partially-visible-hero",
    pass: await evaluate(
      "document.querySelector('[data-observatory]').dataset.stage==='0' && document.querySelector('[data-stage-label]').textContent==='1 / 2 · Sea' && scrollY<=2",
    ),
  });

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
        "document.querySelector('[data-observatory]').dataset.stage==='1' && document.querySelector('[data-observatory]').dataset.chapter==='atlas' && document.querySelector('[data-hero-pause]').textContent.includes('Resume the sea')",
      )) && (await frames()) === pausedFrames,
  });
  await evaluate("document.querySelector('[data-hero-pause]').click()");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await tap("[data-stage-previous]");
  await delay(120);
  await checkStage("mobile-reduced-motion-native-back-tap", 0, "sea");
  await tap("[data-stage-next]");
  await delay(120);
  const stillBefore = await frames();
  await delay(200);
  results.push({
    name: "mobile-reduced-motion-stage-still",
    pass:
      (await evaluate(
        "document.querySelector('[data-observatory]').dataset.stage==='1' && document.querySelector('[data-stage-label]').textContent.includes('Drawing')",
      )) && (await frames()) === stillBefore,
  });
  await tap("[data-stage-next]");
  await delay(100);
  results.push({
    name: "mobile-stage-button-exits-to-work",
    pass: await evaluate(
      "document.getElementById('work').getBoundingClientRect().top<innerHeight && scrollY>30",
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
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
}
