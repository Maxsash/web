import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/moon-sea";
mkdirSync(out, { recursive: true });

await withBrowser({ name: "moon-sea" }, async ({ send, evaluate, onMessage }) => {
  const errors = [];
  onMessage((message) => {
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.seaNow=Date.parse('2026-10-10T15:30:00Z');
      Date.now=()=>window.seaNow;
      const interval=window.setInterval;
      window.setInterval=(callback,ms,...args)=>{
        if(ms===60000)window.moonTick=callback;
        return interval(callback,ms,...args);
      };
      localStorage.setItem('studio-theme','night');
      localStorage.setItem('studio-wave-sound','off');`,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: new URL("/?seed=70806d5e&version=2", base).href });
  for (let i = 0; i < 100; i++) {
    if (
      await evaluate(
        "document.querySelector('canvas[data-ocean]')?.dataset.renderer==='webgl2' && typeof window.moonTick==='function'",
      )
    )
      break;
    await delay(100);
  }
  const capture = async (label, date, theme = "night") => {
    await evaluate(`(() => {
      window.seaNow=Date.parse(${JSON.stringify(date)});
      document.documentElement.dataset.studioTheme=${JSON.stringify(theme)};
      window.dispatchEvent(new CustomEvent('studio-theme',{detail:{origin:'control'}}));
      window.moonTick();
    })()`);
    await delay(150);
    const state = await evaluate(`(() => {
      const canvas=document.querySelector('canvas[data-ocean]');
      return {renderer:canvas.dataset.renderer,illumination:Number(canvas.dataset.moonIllumination),
        night:Number(canvas.dataset.nightBlend),frames:Number(canvas.dataset.frameCount)};
    })()`);
    assert.equal(state.renderer, "webgl2");
    assert.equal(state.night, theme === "night" ? 1 : 0);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${out}/${label}.png`, Buffer.from(shot.data, "base64"));
    const regions = await evaluate(`(async () => {
      const bytes=Uint8Array.from(atob('${shot.data}'),character=>character.charCodeAt(0));
      const image=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
      const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      const context=canvas.getContext('2d');context.drawImage(image,0,0);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
      const region=(x0,x1,y0,y1)=>{
        let total=0,count=0;const histogram=new Uint32Array(256);
        for(let y=Math.floor(y0*canvas.height);y<Math.floor(y1*canvas.height);y++)
          for(let x=Math.floor(x0*canvas.width);x<Math.floor(x1*canvas.width);x++){
            const at=(y*canvas.width+x)*4;
            const light=Math.round(.2126*pixels[at]+.7152*pixels[at+1]+.0722*pixels[at+2]);
            total+=light;count++;histogram[light]++;
          }
        let seen=0,p95=0;
        for(let i=0;i<256;i++){seen+=histogram[i];if(seen>=count*.95){p95=i;break;}}
        return {mean:total/count,p95};
      };
      return {reflection:region(.77,.91,.39,.90),away:region(.45,.53,.39,.90)};
    })()`);
    return { ...state, ...regions };
  };
  const newMoon = await capture("new", "2026-10-10T15:30:00Z");
  const quarter = await capture("quarter", "2026-10-18T15:30:00Z");
  const fullMoon = await capture("full", "2026-10-26T15:30:00Z");
  const dayNew = await capture("day-new", "2026-10-10T15:30:00Z", "day");
  const dayFull = await capture("day-full", "2026-10-26T15:30:00Z", "day");
  assert.ok(newMoon.illumination < 0.01);
  assert.ok(quarter.illumination > 0.45 && quarter.illumination < 0.55);
  assert.ok(fullMoon.illumination > 0.98);
  assert.ok(newMoon.reflection.mean < quarter.reflection.mean);
  assert.ok(quarter.reflection.mean < fullMoon.reflection.mean);
  assert.ok(fullMoon.reflection.mean > fullMoon.away.mean * 1.3);
  assert.ok(newMoon.reflection.p95 < fullMoon.reflection.p95 * 0.5);
  assert.deepEqual(dayNew.reflection, dayFull.reflection);
  assert.deepEqual(dayNew.away, dayFull.away);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  const phoneNew = await capture("phone-new", "2026-10-10T15:30:00Z");
  const phoneFull = await capture("phone-full", "2026-10-26T15:30:00Z");
  assert.equal(errors.length, 0);
  const report = { newMoon, quarter, fullMoon, dayNew, dayFull, phoneNew, phoneFull };
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(report);
});
