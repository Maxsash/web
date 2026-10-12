import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { indiaMoonDay } from "../components/observatory/moon-phase.ts";
import { decodeStarCatalogue, starFrameAt } from "../components/observatory/star-sky.ts";
import { starVertex, starFragment } from "../components/observatory/star-shaders.ts";
import { delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const out = "tools/.out/stars";
mkdirSync(out, { recursive: true });
const bytes = readFileSync(new URL("../public/stars-hyg-v41.bin", import.meta.url));
const stars = decodeStarCatalogue(
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length),
);
const newMoonDay = indiaMoonDay(Date.parse("2026-10-10T15:30:00Z"));
const frame = Array.from(starFrameAt(newMoonDay, stars));

await withBrowser({ name: "stars" }, async ({ send, evaluate, onMessage }) => {
  const errors = [];
  onMessage((message) => {
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `window.starNow=Date.parse('2026-10-10T15:30:00Z');
      Date.now=()=>window.starNow;
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
        "Number(document.querySelector('canvas[data-ocean]')?.dataset.starCount)>0 && typeof window.moonTick==='function'",
      )
    )
      break;
    await delay(100);
  }
  const snapshot = async (label, date) => {
    await evaluate(`window.starNow=Date.parse(${JSON.stringify(date)});window.moonTick()`);
    await delay(120);
    const data = await evaluate(`(() => {
      const c=document.querySelector('canvas[data-ocean]');
      return {renderer:c.dataset.renderer,stars:Number(c.dataset.starCount),day:Number(c.dataset.starDay),
        illumination:Number(c.dataset.moonIllumination),night:Number(c.dataset.nightBlend)};
    })()`);
    assert.equal(data.renderer, "webgl2");
    assert.equal(data.day, indiaMoonDay(Date.parse(date)));
    assert.ok(data.stars > 100);
    assert.equal(data.night, 1);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${out}/${label}.png`, Buffer.from(shot.data, "base64"));
    return data;
  };
  const newMoon = await snapshot("new", "2026-10-10T15:30:00Z");
  const quarter = await snapshot("quarter", "2026-10-18T15:30:00Z");
  const fullMoon = await snapshot("full", "2026-10-26T15:30:00Z");
  assert.ok(newMoon.illumination < 0.01);
  assert.ok(quarter.illumination > 0.45 && quarter.illumination < 0.55);
  assert.ok(fullMoon.illumination > 0.98);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await snapshot("phone-new", "2026-10-10T15:30:00Z");

  const pixels = await evaluate(`(() => {
    const canvas=document.createElement('canvas');canvas.width=800;canvas.height=600;
    const gl=canvas.getContext('webgl2');const program=gl.createProgram();
    for(const [kind,source] of [[gl.VERTEX_SHADER,${JSON.stringify(starVertex)}],
      [gl.FRAGMENT_SHADER,${JSON.stringify(starFragment)}]]){
      const shader=gl.createShader(kind);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(${JSON.stringify(frame)}),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,4,gl.FLOAT,false,0,0);
    gl.useProgram(program);gl.viewport(0,0,800,600);
    gl.uniform1f(gl.getUniformLocation(program,'uAspect'),800/600);
    gl.uniform1f(gl.getUniformLocation(program,'uReveal'),0);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    const measure=(illumination,night=1)=>{
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(gl.getUniformLocation(program,'uMoonIllumination'),illumination);
      gl.uniform1f(gl.getUniformLocation(program,'uNight'),night);
      gl.drawArrays(gl.POINTS,0,${frame.length / 4});
      const pixels=new Uint8Array(800*600*4);gl.readPixels(0,0,800,600,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      let count=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>8)count++;
      return count;
    };
    return {day:measure(0),quarter:measure(.5),full:measure(1),hidden:measure(1,0)};
  })()`);
  assert.ok(pixels.day > pixels.quarter && pixels.quarter > pixels.full);
  assert.ok(pixels.full > 0);
  assert.equal(pixels.hidden, 0);
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await evaluate("window.starNow=Date.parse('2026-10-10T15:30:00Z');window.moonTick()");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await delay(800);
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
      if(mode!==gl.POINTS){original(mode,first,count);return;}
      collect();
      if(++draws%4!==0 || samples.length+pending.length>=40){original(mode,first,count);return;}
      const query=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,query);
      original(mode,first,count);gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push(query);
    };
    window.starGpuSamples=samples;
    return true;
  })()`);
  await delay(2500);
  const gpuSamples = timerAvailable ? await evaluate("window.starGpuSamples") : [];
  const sorted = [...gpuSamples].sort((a, b) => a - b);
  const gpu = {
    renderer: await evaluate(
      "document.querySelector('canvas[data-ocean]').getContext('webgl2').getParameter(0x9246)",
    ),
    samples: sorted.length,
    medianMs: sorted[Math.floor(sorted.length / 2)] ?? null,
    p95Ms: sorted[Math.floor(sorted.length * 0.95)] ?? null,
    maxMs: sorted.at(-1) ?? null,
  };
  if (timerAvailable) {
    assert.ok(gpu.samples >= 20);
    assert.ok(gpu.medianMs < 0.3, JSON.stringify(gpu));
  }
  assert.equal(errors.length, 0);
  writeFileSync(
    `${out}/report.json`,
    JSON.stringify({ newMoon, quarter, fullMoon, pixels, gpu }, null, 2),
  );
  console.log({ newMoon, quarter, fullMoon, pixels, gpu });
});
