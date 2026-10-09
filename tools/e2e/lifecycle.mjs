import { delay } from "../lib/browser.mjs";

export async function runLifecycleChecks(ctx) {
  const { evaluate, frames, load, results, send } = ctx;
  // Exercise lifecycle instead of inferring it from stills.
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await load("/");
  await evaluate(
    "document.documentElement.style.fontSize='200%';document.getElementById('elsewhere').scrollIntoView({behavior:'instant'})",
  );
  await delay(100);
  results.push({
    name: "sections-390-text-200",
    pass: await evaluate(
      "[...document.querySelectorAll(['services','about','contact','elsewhere'].map(id=>`#${id} :is(h2,h3,p,a,dd)`).join())].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;})",
    ),
  });
  await evaluate("document.documentElement.style.fontSize=''");
  await load("/");
  await delay(100);
  await evaluate("document.querySelector('[data-hero-pause]').click()");
  await delay(120);
  const pausedBefore = await frames();
  await delay(350);
  const pausedAfter = await frames();
  results.push({
    name: "pause-stops-draws",
    before: pausedBefore,
    after: pausedAfter,
    pass: pausedBefore === pausedAfter,
  });
  const coalesced = await evaluate(
    `(async()=>{const s=document.querySelector('[data-observatory]'),c=s.querySelector('canvas[data-ocean]');const intro=s.querySelector('h1').parentElement,end=[...s.querySelectorAll('h2')].find(e=>e.textContent.includes('Keep going'))?.parentElement;const before=Number(c.dataset.frameCount),opacityBefore=intro.style.opacity;scrollTo(0,s.offsetTop+(s.offsetHeight-s.firstElementChild.clientHeight)*.97);for(let i=0;i<100;i++)window.dispatchEvent(new Event('scroll'));const synchronousChange=intro.style.opacity!==opacityBefore;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {draws:Number(c.dataset.frameCount)-before,synchronousChange,introOpacity:intro.style.opacity,endOpacity:end?.style.opacity,chapter:s.dataset.chapter,inheritedOpacityWrites:['--intro-opacity','--end-opacity','--ink-progress'].some(name=>s.style.getPropertyValue(name)!=='')};})()`,
  );
  results.push({
    name: "scroll-reveal-coalesces-with-draw",
    ...coalesced,
    pass:
      !coalesced.synchronousChange &&
      !coalesced.inheritedOpacityWrites &&
      coalesced.draws >= 1 &&
      coalesced.draws <= 2 &&
      coalesced.introOpacity === "0" &&
      coalesced.endOpacity === "1" &&
      coalesced.chapter === "atlas",
  });
  await evaluate("document.querySelector('[data-hero-pause]').click()");
  await delay(350);
  results.push({ name: "resume-draws", pass: (await frames()) > pausedAfter });
  await evaluate("scrollTo(0,document.documentElement.scrollHeight)");
  await delay(180);
  const outsideBefore = await frames();
  await delay(350);
  const outsideAfter = await frames();
  results.push({
    name: "offscreen-stops-draws",
    before: outsideBefore,
    after: outsideAfter,
    pass: outsideBefore === outsideAfter,
  });
  await evaluate("scrollTo(0,0)");
  await delay(150);
  results.push({ name: "return-resumes-draws", pass: (await frames()) > outsideBefore });
  results.push({
    name: "gpu-covers-static-plate",
    pass: await evaluate(
      "getComputedStyle(document.querySelector('canvas[data-ocean]').parentElement.firstElementChild).visibility==='hidden'",
    ),
  });
  await evaluate(
    `(()=>{const gl=document.querySelector('canvas[data-ocean]').getContext('webgl2');window.__seaDeletes={buffers:0,arrays:0,programs:0};for(const [method,key] of [['deleteBuffer','buffers'],['deleteVertexArray','arrays'],['deleteProgram','programs']]){const original=gl[method].bind(gl);gl[method]=object=>{window.__seaDeletes[key]++;return original(object);};}gl.getExtension('WEBGL_lose_context').loseContext();})()`,
  );
  await delay(120);
  results.push({
    name: "context-loss-fallback",
    pass: await evaluate(
      "document.querySelector('[data-observatory]').dataset.rendering==='fallback' && document.querySelector('[data-hero-pause]').disabled && getComputedStyle(document.querySelector('canvas[data-ocean]').parentElement.firstElementChild).visibility==='visible'",
    ),
  });
  const released = await evaluate("window.__seaDeletes");
  results.push({
    name: "context-loss-releases-engine",
    ...released,
    pass: released.buffers === 3 && released.arrays === 3 && released.programs === 3,
  });
  const lostBefore = await frames();
  await delay(350);
  results.push({ name: "context-loss-stops-draws", pass: (await frames()) === lostBefore });
}
