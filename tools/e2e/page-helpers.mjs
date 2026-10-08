import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { delay } from "../lib/browser.mjs";

export function createPageHelpers({ send, evaluate, base, out, results }) {
  const load = async (path) => {
    const url = new URL(path, base).href;
    await send("Page.navigate", { url });
    for (let i = 0; i < 500; i++) {
      if (
        await evaluate(`location.href===${JSON.stringify(url)} && document.readyState==='complete'`)
      )
        break;
      if (i === 499) throw new Error("Load timeout " + path);
      await delay(60);
    }
    await evaluate("document.fonts.ready.then(()=>true)");
    if (new URL(path, base).pathname === "/")
      for (let i = 0; i < 300; i++) {
        if (
          await evaluate("Boolean(document.querySelector('canvas[data-ocean]')?.dataset.renderer)")
        )
          break;
        if (i === 299) throw new Error("Renderer did not initialize");
        await delay(40);
      }
    await evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
  };
  const snapshot = async (name, full = false) => {
    const info = await evaluate(
      `(()=>{const c=document.querySelector('canvas[data-ocean]');const gl=c?.getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return {url:location.pathname,width:innerWidth,height:innerHeight,scrollY,scrollWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,heading:document.querySelector('h1')?.textContent,renderer:c?.dataset.renderer,quality:c?.dataset.quality,frames:c?.dataset.frameCount,canvas:c?{width:c.width,height:c.height}:null,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,glError:gl?.getError(),overflow:[...document.querySelectorAll('h1,h2,h3,p,nav,a,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.x<-.5||r.right>innerWidth+.5);}).map(e=>e.textContent.trim().slice(0,80))};})()`,
    );
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: full,
      ...(full
        ? {
            clip: {
              x: 0,
              y: 0,
              width: info.width,
              height: Math.min(info.pageHeight, 11000),
              scale: 1,
            },
          }
        : {}),
    });
    writeFileSync(join(out, `${name}.png`), Buffer.from(shot.data, "base64"));
    results.push({ name, ...info });
    console.log(
      name,
      JSON.stringify({
        renderer: info.renderer,
        gpu: info.gpu,
        quality: info.quality,
        overflow: info.overflow,
      }),
    );
    return info;
  };
  const frames = () =>
    evaluate("Number(document.querySelector('canvas[data-ocean]').dataset.frameCount)");
  return { load, snapshot, frames };
}
