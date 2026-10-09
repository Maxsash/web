import { delay } from "../lib/browser.mjs";

export async function runDesktopChecks(ctx) {
  const { evaluate, load, pressKey, results, send } = ctx;
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await load("/");
  await delay(400);
  console.log(
    "Measuring 30 seconds of desktop frame delivery; this does not qualify phone performance.",
  );
  const cadence = await evaluate(
    "new Promise(resolve=>{const intervals=[],tasks=[];const c=document.querySelector('canvas[data-ocean]');const firstCount=Number(c.dataset.frameCount);const observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask',buffered:false});let first=0,last=0;const step=now=>{if(!first)first=now;if(last)intervals.push(now-last);last=now;if(now-first<30000){requestAnimationFrame(step);return;}observer.disconnect();intervals.sort((a,b)=>a-b);resolve({durationMs:now-first,intervals:intervals.length,p50Ms:intervals[Math.floor(intervals.length*.5)],p95Ms:intervals[Math.floor(intervals.length*.95)],within20Ms:intervals.filter(x=>x<=20).length/intervals.length,sceneDraws:Number(c.dataset.frameCount)-firstCount,longTasks:tasks.length,longestTaskMs:Math.max(0,...tasks),quality:c.dataset.quality});};requestAnimationFrame(step);})",
  );
  results.push({ name: "desktop-frame-delivery", ...cadence });
  await pressKey("Tab");
  results.push({
    name: "keyboard-skip-link",
    pass: await evaluate("document.activeElement?.getAttribute('href')==='#work'"),
  });
  await pressKey("Enter");
  const skippedPastHero =
    "(()=>{const r=document.getElementById('work')?.getBoundingClientRect();return location.hash==='#work'&&Boolean(r&&r.top<innerHeight&&r.bottom>0);})()";
  for (let i = 0; i < 40; i++) {
    if (await evaluate(skippedPastHero)) break;
    await delay(50);
  }
  results.push({ name: "keyboard-skip-navigation", pass: await evaluate(skippedPastHero) });
}
