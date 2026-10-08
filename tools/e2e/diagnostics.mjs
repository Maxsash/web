export async function runDiagnostics(ctx) {
  const { evaluate, load, nativeScroll, results, scrollDiagnostic, send, snapshot } = ctx;
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const observe = await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "window.__seaLongTasks=[];new PerformanceObserver(list=>window.__seaLongTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});",
  });
  await load("/");
  await snapshot("desktop-opening");
  const opening = await evaluate(
    "(()=>({navigation:performance.getEntriesByType('navigation')[0]?.toJSON(),resources:performance.getEntriesByType('resource').map(r=>r.toJSON()),writing:document.querySelector('nav[aria-label=\"Studio\"]')?.innerHTML,canvasQuality:document.querySelector('canvas[data-ocean]')?.dataset.quality}))()",
  );
  console.log(
    scrollDiagnostic
      ? "Measuring scroll reveal."
      : "Measuring desktop callback delivery for 30 seconds.",
  );
  const cadence = scrollDiagnostic
    ? null
    : await evaluate(
        "new Promise(resolve=>{const intervals=[];const c=document.querySelector('canvas[data-ocean]');const before=Number(c.dataset.frameCount);let start=0,last=0;function step(now){if(!start)start=now;if(last)intervals.push(now-last);last=now;if(now-start<30000){requestAnimationFrame(step);return;}intervals.sort((a,b)=>a-b);resolve({p50Ms:intervals[Math.floor(intervals.length*.5)],p95Ms:intervals[Math.floor(intervals.length*.95)],within20Ms:intervals.filter(v=>v<=20).length/intervals.length,draws:Number(c.dataset.frameCount)-before,longTasks:window.__seaLongTasks,quality:c.dataset.quality});}requestAnimationFrame(step);})",
      );
  results.push({ name: "read-only-desktop-diagnostic", opening, cadence });
  if (scrollDiagnostic) {
    await send("Performance.enable");
    for (const [width, height] of [
      [1440, 1000],
      [390, 844],
    ]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 2,
        mobile: width < 760,
      });
      await load("/");
      const beforeMetrics = Object.fromEntries(
        (await send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
      );
      const measureScroll = `new Promise(resolve=>{const intervals=[],drawTimes=[],c=document.querySelector('canvas[data-ocean]'),scene=document.querySelector('[data-observatory]');const distance=scene.offsetHeight-scene.firstElementChild.clientHeight;const before=Number(c.dataset.frameCount),taskStart=performance.now();let start=0,last=0,lastCount=before;function step(now){if(!start)start=now;if(last)intervals.push(now-last);last=now;const count=Number(c.dataset.frameCount);if(count!==lastCount){drawTimes.push(now);lastCount=count;}const p=Math.min(1,(now-start)/8000);if(!${nativeScroll})scrollTo(0,distance*(.5-.5*Math.cos(p*Math.PI*4)));if(p<1){requestAnimationFrame(step);return;}const drawIntervals=drawTimes.slice(1).map((t,i)=>t-drawTimes[i]);intervals.sort((a,b)=>a-b);drawIntervals.sort((a,b)=>a-b);resolve({width:innerWidth,height:innerHeight,p50Ms:intervals[Math.floor(intervals.length*.5)],p95Ms:intervals[Math.floor(intervals.length*.95)],drawP95Ms:drawIntervals[Math.floor(drawIntervals.length*.95)],within20Ms:intervals.filter(x=>x<=20).length/intervals.length,sceneDraws:Number(c.dataset.frameCount)-before,longTasks:window.__seaLongTasks.filter(t=>t.start>=taskStart),quality:c.dataset.quality,canvasPixels:c.width*c.height,scrollY,chapter:scene.dataset.chapter});}requestAnimationFrame(step);})`;
      if (nativeScroll) {
        await send("Runtime.evaluate", {
          expression: "window.__scrollMeasurement=" + measureScroll,
        });
        const distance = await evaluate(
          "(()=>{const s=document.querySelector('[data-observatory]');return s.offsetHeight-s.firstElementChild.clientHeight;})()",
        );
        await send("Input.synthesizeScrollGesture", {
          x: width / 2,
          y: height / 2,
          yDistance: -distance,
          speed: Math.max(1, Math.round(distance / 7)),
          gestureSourceType: width < 760 ? "touch" : "mouse",
        });
      }
      const scroll = await evaluate(nativeScroll ? "window.__scrollMeasurement" : measureScroll);
      const afterMetrics = Object.fromEntries(
        (await send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
      );
      scroll.metrics = Object.fromEntries(
        [
          "RecalcStyleCount",
          "RecalcStyleDuration",
          "LayoutCount",
          "LayoutDuration",
          "TaskDuration",
        ].map((name) => [name, afterMetrics[name] - beforeMetrics[name]]),
      );
      results.push({
        name: nativeScroll ? "browser-gesture-scroll-reveal" : "programmatic-scroll-reveal",
        ...scroll,
      });
      console.log("scroll", JSON.stringify(scroll));
    }
  }
  await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: observe.identifier });
}
