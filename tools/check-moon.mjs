import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { skyVertex, skyFragmentSource } from "../components/observatory/ocean-shaders.ts";
import { indiaMoonDay, moonForIndiaDay } from "../components/observatory/moon-phase.ts";
import { localBaseFromArgs, delay, withBrowser, SWIFTSHADER_FLAGS } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/moon";
mkdirSync(out, { recursive: true });
const results = [];
await withBrowser({ name: "moon", flags: SWIFTSHADER_FLAGS }, async ({ send, evaluate }) => {
  await send("Page.enable");
  await send("Runtime.enable");
  const setup = await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.moonNow=Date.parse('2026-10-12T06:30:00Z');
      Date.now=()=>window.moonNow;
      const interval=window.setInterval;
      window.setInterval=(callback,ms,...args)=>{
        if(ms===60000) window.moonTick=callback;
        return interval(callback,ms,...args);
      };
      localStorage.setItem('studio-theme','night');`,
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
  await send("Page.navigate", { url: base.href });
  for (let i = 0; i < 100; i++) {
    if (
      await evaluate(
        "document.querySelector('canvas[data-ocean]')?.dataset.renderer==='webgl2' && typeof window.moonTick==='function'",
      )
    )
      break;
    await delay(100);
  }
  assert.equal(
    await evaluate("document.querySelector('canvas[data-ocean]')?.dataset.renderer"),
    "webgl2",
  );
  await evaluate("document.documentElement.dataset.studioTheme='night'");
  await delay(200);
  const rendered = await evaluate(`(() => {
    const canvas=document.createElement('canvas'); canvas.width=4000; canvas.height=4000;
    const gl=canvas.getContext('webgl2');
    const program=gl.createProgram();
    for(const [kind,source] of [[gl.VERTEX_SHADER,${JSON.stringify(skyVertex)}],[gl.FRAGMENT_SHADER,${JSON.stringify(skyFragmentSource({ moonPhase: true }))}]]) {
      const shader=gl.createShader(kind); gl.shaderSource(shader,source); gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program); if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program); gl.bindVertexArray(gl.createVertexArray()); gl.viewport(0,0,4000,4000);
    gl.uniform1f(gl.getUniformLocation(program,'uAspect'),1);
    const render=(fraction,side,night=1,mapped=0)=>{
      gl.uniform1f(gl.getUniformLocation(program,'uNight'),night);
      gl.uniform1f(gl.getUniformLocation(program,'uMoonMap'),mapped);
      gl.uniform2f(gl.getUniformLocation(program,'uMoon'),fraction,side);
      gl.drawArrays(gl.TRIANGLES,0,3);
      const pixels=new Uint8Array(164*164*4); gl.readPixels(2958,2878,164,164,gl.RGBA,gl.UNSIGNED_BYTE,pixels); return [...pixels];
    };
    const dark=render(0,1), full=render(1,1);
    const measure=(fraction,side)=>{
      const pixels=render(fraction,side); let sum=0,left=0,right=0,total=0;
      for(let i=0;i<pixels.length;i+=4){
        const amount=pixels[i]-dark[i]; sum+=amount>2?1:0; total+=full[i]-dark[i]>2?1:0;
        if((i/4)%164<82) left+=amount; else right+=amount;
      }
      return {fraction,side,area:sum/total,left,right};
    };
    const samples=[0,.05,.25,.5,.75,.95,1].flatMap(f=>[measure(f,1),measure(f,-1)]);
    const pixel=(pixels,x,y)=>pixels[((y-2878)*164+x-2958)*4];
    const otherDark=render(0,-1);
    const darkDisc=dark.every((_,i)=>i%4!==0 || Math.abs(dark[i]-otherDark[i])<2);
    const colour=(pixels,x,y)=>pixels.slice(((y-2878)*164+x-2958)*4,((y-2878)*164+x-2958)*4+3);
    const unlitCentre=colour(dark,3040,2960);
    const background=colour(dark,2958,2960);
    const half=render(.5,1);
    const shadedSide= pixel(half,3004,2960), litSide=pixel(half,3076,2960);
    const centre= pixel(full,3040,2960), limb=pixel(full,3110,2960);
    const dayUnchanged=JSON.stringify(render(0,1,0))===JSON.stringify(render(1,-1,0));
    const yielded=render(1,1,1,1);
    const yieldsToMap=pixel(yielded,3040,2960)===pixel(yielded,2958,2960);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return {samples,dayUnchanged,yieldsToMap,darkDisc,unlitCentre,background,shadedSide,litSide,centre,limb};
  })()`);
  assert.ok(rendered.dayUnchanged);
  assert.ok(rendered.yieldsToMap, "the shader leaves only sky where the mapped Moon is drawn");
  assert.ok(rendered.darkDisc);
  assert.ok(
    rendered.unlitCentre.every((value, i) => value > rendered.background[i]),
    "Earthshine reveals the night surface instead of a black overlay",
  );
  assert.ok(
    Math.hypot(...rendered.unlitCentre.map((value, i) => value - rendered.background[i])) > 4,
    "unlit disc remains visible against the sky",
  );
  assert.ok(rendered.litSide > rendered.shadedSide + 50, "quarter moon shades a complete globe");
  assert.ok(rendered.centre > rendered.limb + 10, "full moon retains spherical lighting");
  for (const sample of rendered.samples) {
    assert.ok(Math.abs(sample.area - sample.fraction) < 0.015, JSON.stringify(sample));
    if (sample.fraction > 0 && sample.fraction < 1) {
      assert.ok(sample.side === 1 ? sample.right > sample.left : sample.left > sample.right);
    }
  }
  results.push(rendered);
  for (const [date, label] of [
    ["2026-10-12T06:30:00Z", "crescent"],
    ["2026-10-18T06:30:00Z", "first-quarter"],
    ["2026-10-26T06:30:00Z", "full"],
    ["2026-11-01T06:30:00Z", "last-quarter"],
  ]) {
    await evaluate(`window.moonNow=Date.parse(${JSON.stringify(date)});window.moonTick()`);
    await delay(100);
    const actual = await evaluate("({...document.querySelector('canvas[data-ocean]').dataset})");
    const expected = moonForIndiaDay(indiaMoonDay(Date.parse(date)));
    assert.ok(Math.abs(Number(actual.moonIllumination) - expected.illumination) < 1e-12);
    results.push({ label, illumination: expected.illumination });
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${out}/${label}.png`, Buffer.from(data, "base64"));
  }
  await evaluate("window.moonNow=Date.parse('2026-10-11T18:29:59Z');window.moonTick()");
  await delay(100);
  const before = await evaluate("({...document.querySelector('canvas[data-ocean]').dataset})");
  await evaluate("window.moonNow=Date.parse('2026-10-11T18:30:00Z');window.moonTick()");
  await delay(100);
  const after = await evaluate("({...document.querySelector('canvas[data-ocean]').dataset})");
  assert.notEqual(before.moonIllumination, after.moonIllumination);
  assert.ok(Number(after.frameCount) > Number(before.frameCount));
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await delay(200);
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${out}/phone-crescent.png`, Buffer.from(data, "base64"));
  await send("Page.removeScriptToEvaluateOnNewDocument", setup);
});
writeFileSync(`${out}/report.json`, JSON.stringify(results, null, 2));
console.log(
  "Moon checks passed: 14 shader fractions/sides, complete shaded disc, spherical lighting, unchanged daylight, dated hero and reduced-motion India-midnight redraw.",
);
