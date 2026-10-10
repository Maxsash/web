import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { delay, localBaseFromArgs, NO_GPU_FLAGS, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/gull";
mkdirSync(out, { recursive: true });
const cases = [
  [320, 480, 1],
  [320, 568, 2],
  [360, 640, 3],
  [375, 667, 1.25],
  [390, 844, 3],
  [430, 932, 2],
  [500, 320, 1],
  [568, 320, 2],
  [667, 375, 3],
  [844, 390, 3],
  [896, 414, 2],
  [768, 1024, 2],
  [1024, 768, 1],
  [1280, 720, 1],
  [1280, 720, 2],
  [1280, 720, 3],
  [1920, 1080, 2],
  [2560, 1440, 1.25],
  [320, 568, 2, 20],
  [390, 844, 3, 24],
];
const results = [];
const probe = `(()=>{
  const canvas=document.querySelector('[data-gull]'),button=canvas.closest('button');
  const header=button.closest('header'),intro=document.querySelector('[data-observatory] h1').parentElement;
  const copy=getComputedStyle(intro).opacity>.1?intro:document.querySelector('[data-gull-sky] h2').parentElement;
  const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  const r=rect(canvas),b=rect(button),cs=getComputedStyle(button);
  const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  let left=canvas.width,right=-1,bottom=-1;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>48){left=Math.min(left,x);right=Math.max(right,x);bottom=y;}
  const range=document.createRange();range.selectNodeContents(button.firstChild);
  const label=range.getBoundingClientRect();
  const text=[...copy.querySelectorAll('p,h1 span,h2')].flatMap(e=>{
    const selection=document.createRange();selection.selectNodeContents(e);
    return [...selection.getClientRects()].filter(r=>r.width>1&&r.height>1).map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}));
  });
  const obstacles=[...document.querySelectorAll('[data-gull-sky] header a,[data-gull-sky] header button,[data-gull-sky]>a,[data-hero-pause],[data-stage-controls] button,[data-stage-label]')]
    .filter(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(e=>({name:e.textContent.trim(),...rect(e)}));
  return {phase:canvas.dataset.gull,button:b,header:rect(header),intro:rect(intro),
    text,obstacles,viewportHeight:innerHeight,
    controls:[...header.querySelectorAll('a,button')].map(e=>({name:e.textContent.trim(),...rect(e)})),
    density:devicePixelRatio,backing:canvas.width/parseFloat(canvas.style.getPropertyValue('--gull-size')),
    gap:b.bottom-parseFloat(cs.borderBottomWidth)/2-(r.top+(bottom+.5)*r.height/canvas.height),
    birdLeft:r.left+left*r.width/canvas.width,birdRight:r.left+(right+1)*r.width/canvas.width,
    labelRight:label.right,viewport:innerWidth,pixels:bottom>=0};
})()`;

await withBrowser({ name: "gull-fit", flags: NO_GPU_FLAGS }, async ({ send, evaluate }) => {
  const viewport = async (width, height, density, font = 16) => {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: density,
      mobile: true,
    });
    await evaluate(`document.documentElement.style.fontSize='${font}px'`);
    await delay(250);
  };
  const motion = (reduced) =>
    send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }],
    });
  const waitForPhase = async (phase) => {
    for (let i = 0; i < 80; i++) {
      if (
        await evaluate(
          `document.querySelector('[data-gull]')?.dataset.gull===${JSON.stringify(phase)}`,
        )
      )
        return;
      await delay(100);
    }
    throw new Error(`Gull never reached ${phase}`);
  };
  await send("Page.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "localStorage.setItem('studio-wave-sound','off');localStorage.setItem('studio-theme','day');const media=window.matchMedia.bind(window);window.matchMedia=q=>media(q==='(pointer: coarse)'?'(min-width: 0px)':q);",
  });
  await motion(true);
  await send("Page.navigate", { url: new URL("/?seed=70806d5e&version=2", base).href });
  await waitForPhase("perched");
  const check = async (name) => {
    const state = await evaluate(probe);
    const failures = [];
    if (state.phase !== "perched" || !state.pixels) failures.push("gull missing");
    if (Math.abs(state.gap) > 1.2) failures.push(`contact gap ${state.gap.toFixed(2)} px`);
    if (state.birdLeft < state.labelRight + 4) failures.push("bird covers label");
    if (
      state.birdRight > state.viewport ||
      state.button.left < 0 ||
      state.button.right > state.viewport
    )
      failures.push("gull or pill clipped");
    if (state.intro.top < state.header.bottom + 8) failures.push("hero copy overlaps header");
    if (Math.abs(state.backing - Math.min(2, state.density)) > 0.01)
      failures.push("stale canvas density");
    const overlaps = (a, b) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
    for (const text of state.text) {
      if (text.bottom > state.viewportHeight + 0.5) failures.push("hero copy clipped");
      for (const obstacle of state.obstacles)
        if (overlaps(text, obstacle)) failures.push(`copy overlaps ${obstacle.name}`);
    }
    for (let i = 0; i < state.obstacles.length; i++)
      for (const b of state.obstacles.slice(i + 1))
        if (overlaps(state.obstacles[i], b))
          failures.push(`${state.obstacles[i].name} overlaps ${b.name}`);
    for (let i = 0; i < state.controls.length; i++) {
      const a = state.controls[i];
      if (a.left < -0.5 || a.right > state.viewport + 0.5)
        failures.push(`${a.name} outside viewport`);
      for (const b of state.controls.slice(i + 1))
        if (
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
        )
          failures.push(`${a.name} overlaps ${b.name}`);
    }
    const record = { name, ...state, failures };
    results.push(record);
    if (failures.length || /^(320x568|568x320|844x390|390x844)/.test(name)) {
      const shot = await send("Page.captureScreenshot");
      writeFileSync(`${out}/${name}.png`, Buffer.from(shot.data, "base64"));
    }
    console.log(
      `${failures.length ? "FAIL" : "PASS"} ${name}: gap ${state.gap.toFixed(2)} px${failures.length ? "; " + failures.join("; ") : ""}`,
    );
  };
  for (const [width, height, density, font = 16] of cases) {
    await viewport(width, height, density, font);
    for (const theme of ["day", "night"]) {
      await evaluate(`document.documentElement.dataset.studioTheme='${theme}'`);
      await delay(100);
      await check(`${width}x${height}-${density}x-${font}px-${theme}`);
    }
  }
  await viewport(390, 844, 3);
  await evaluate("document.documentElement.dataset.studioTheme='day'");
  await motion(false);
  await evaluate("document.querySelector('[data-gull]').closest('button').focus()");
  await delay(700);
  await check("390x844-standing");
  await evaluate(
    "document.querySelector('[data-gull]').closest('button').blur();document.documentElement.dataset.studioTheme='night'",
  );
  await delay(800);
  await check("390x844-sleeping");
  await motion(true);
  await evaluate(
    "const scene=document.querySelector('[data-observatory]');scene.dataset.chapter='atlas';scene.style.setProperty('--intro-opacity','0');scene.style.setProperty('--end-opacity','1')",
  );
  for (const [width, height, density] of [
    [320, 480, 1],
    [568, 320, 2],
    [844, 390, 3],
    [390, 844, 3],
  ]) {
    await viewport(width, height, density);
    await delay(600);
    await check(`${width}x${height}-drawing`);
  }
  await viewport(390, 844, 3);
  await motion(false);
  await send("Page.navigate", { url: new URL("/?seed=70806d5e&version=2", base).href });
  await waitForPhase("arriving");
  await viewport(844, 390, 3);
  await delay(700);
  await check("844x390-arrival-rotation");
});
writeFileSync(`${out}/report.json`, JSON.stringify(results, null, 2));
assert.ok(
  results.every(({ failures }) => failures.length === 0),
  "Gull layout failures",
);
console.log(`${results.length} gull layout checks pass.`);
