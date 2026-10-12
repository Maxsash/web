import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { indiaMoonDay } from "../components/observatory/moon-phase.ts";
import { planetFrameAt } from "../components/observatory/planet-sky.ts";
import { planetFragment, planetVertex } from "../components/observatory/planet-shaders.ts";
import { delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/planets";
mkdirSync(out, { recursive: true });

await withBrowser({ name: "planets" }, async ({ send, evaluate, onMessage }) => {
  const errors = [];
  onMessage((message) => {
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.planetNow=Date.parse('2026-10-10T15:30:00Z');
      Date.now=()=>window.planetNow;
      const interval=window.setInterval;
      window.setInterval=(callback,ms,...args)=>{
        if(ms===60000) window.moonTick=callback;
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
        "document.querySelector('canvas[data-ocean]')?.dataset.planets !== undefined && typeof window.moonTick==='function'",
      )
    )
      break;
    await delay(100);
  }
  assert.equal(await evaluate("document.querySelector('[data-dev-sky-preview]')"), null);
  const frames = [];
  for (const [date, label] of [
    ["2026-10-10T15:30:00Z", "new"],
    ["2026-10-26T15:30:00Z", "full"],
    ["2027-05-10T15:30:00Z", "later"],
  ]) {
    await evaluate(`window.planetNow=Date.parse(${JSON.stringify(date)});window.moonTick()`);
    await delay(150);
    const frame = await evaluate(`(() => {
      const canvas=document.querySelector('canvas[data-ocean]');
      return {renderer:canvas.dataset.renderer,day:Number(canvas.dataset.starDay),
        planets:canvas.dataset.planets.split(','),night:Number(canvas.dataset.nightBlend)};
    })()`);
    assert.equal(frame.renderer, "webgl2");
    assert.equal(frame.night, 1);
    assert.equal(frame.day, indiaMoonDay(Date.parse(date)));
    assert.deepEqual(frame.planets, planetFrameAt(indiaMoonDay(Date.parse(date))).names);
    frames.push({ label, date, ...frame });
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${out}/${label}.png`, Buffer.from(shot.data, "base64"));
  }
  assert.ok(frames.some((frame) => frame.planets.includes("Venus")));
  assert.ok(frames.some((frame) => frame.planets.includes("Saturn")));
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await delay(150);
  const phone = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${out}/phone-later.png`, Buffer.from(phone.data, "base64"));
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await delay(150);
  const drawn = await evaluate(`(() => {
    const gl=document.querySelector('canvas[data-ocean]').getContext('webgl2');
    const original=gl.drawArrays.bind(gl);let points=[];
    gl.drawArrays=(mode,start,count)=>{if(mode===gl.POINTS)points.push(count);original(mode,start,count)};
    window.planetNow=Date.parse('2026-10-26T15:30:00Z');window.moonTick();
    return new Promise(resolve=>setTimeout(()=>resolve(points),200));
  })()`);
  assert.ok(
    drawn.some((count) => count > 5),
    JSON.stringify(drawn),
  );
  assert.ok(drawn.includes(1), JSON.stringify(drawn));
  const pixel = await evaluate(`(() => {
    const canvas=document.createElement('canvas');canvas.width=100;canvas.height=100;
    const gl=canvas.getContext('webgl2');const program=gl.createProgram();
    for(const [kind,source] of [[gl.VERTEX_SHADER,${JSON.stringify(planetVertex)}],
      [gl.FRAGMENT_SHADER,${JSON.stringify(planetFragment)}]]){
      const shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);gl.viewport(0,0,100,100);
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([.4,.2,-4,1]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,4,gl.FLOAT,false,0,0);
    gl.uniform1f(gl.getUniformLocation(program,'uAspect'),1);
    gl.uniform1f(gl.getUniformLocation(program,'uReveal'),0);
    gl.uniform1f(gl.getUniformLocation(program,'uMoonIllumination'),.5);
    const sample=night=>{
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(gl.getUniformLocation(program,'uNight'),night);
      gl.drawArrays(gl.POINTS,0,1);
      const pixels=new Uint8Array(100*100*4);gl.readPixels(0,0,100,100,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      return pixels.reduce((total,value,index)=>total+(index%4===3&&value>0?1:0),0);
    };
    return {night:sample(1),day:sample(0)};
  })()`);
  assert.ok(pixel.night > 0, JSON.stringify(pixel));
  assert.equal(pixel.day, 0);
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await delay(600);
  const timerAvailable = await evaluate(`(() => {
    const gl=document.querySelector('canvas[data-ocean]').getContext('webgl2');
    const ext=gl.getExtension('EXT_disjoint_timer_query_webgl2');
    if(!ext)return false;
    const original=gl.drawArrays.bind(gl),pending=[],samples=[];
    let draws=0;
    const collect=()=>{
      for(let i=pending.length-1;i>=0;i--){
        const query=pending[i];
        if(!gl.getQueryParameter(query,gl.QUERY_RESULT_AVAILABLE))continue;
        if(!gl.getParameter(ext.GPU_DISJOINT_EXT))
          samples.push(gl.getQueryParameter(query,gl.QUERY_RESULT)*1e-6);
        gl.deleteQuery(query);pending.splice(i,1);
      }
    };
    gl.drawArrays=(mode,first,count)=>{
      if(mode!==gl.POINTS || count>5){original(mode,first,count);return;}
      collect();
      if(++draws%4!==0 || samples.length+pending.length>=40){original(mode,first,count);return;}
      const query=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,query);
      original(mode,first,count);gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push(query);
    };
    window.planetGpuSamples=samples;
    return true;
  })()`);
  await delay(2500);
  const samples = timerAvailable ? await evaluate("window.planetGpuSamples") : [];
  const sorted = [...samples].sort((a, b) => a - b);
  const gpu = {
    samples: sorted.length,
    medianMs: sorted[Math.floor(sorted.length / 2)] ?? null,
    p95Ms: sorted[Math.floor(sorted.length * 0.95)] ?? null,
    maxMs: sorted.at(-1) ?? null,
  };
  if (timerAvailable) {
    assert.ok(gpu.samples >= 20, JSON.stringify(gpu));
    assert.ok(gpu.medianMs < 0.3, JSON.stringify(gpu));
  }
  assert.equal(errors.length, 0);
  writeFileSync(`${out}/report.json`, JSON.stringify({ frames, drawn, pixel, gpu }, null, 2));
  console.log({ frames, drawn, pixel, gpu });
});
