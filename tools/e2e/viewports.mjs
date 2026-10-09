import { delay } from "../lib/browser.mjs";
import { join } from "node:path";
import { writeFileSync } from "node:fs";

export async function runViewportCaptures(ctx) {
  const { articlePaths, evaluate, load, out, quick, results, send, snapshot } = ctx;
  for (const [width, height] of quick
    ? [
        [1440, 1000],
        [390, 844],
      ]
    : [
        [1440, 1000],
        [390, 844],
        [320, 568],
        [768, 1024],
        [1024, 768],
        [844, 390],
      ]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 760,
    });
    await send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-color-scheme", value: "light" },
        { name: "prefers-reduced-motion", value: "no-preference" },
      ],
    });
    await load("/");
    await delay(700);
    await snapshot(`observatory-${width}-sea`);
    if (width < 760) {
      const budget = await evaluate(
        "(()=>{const c=document.querySelector('canvas[data-ocean]');return {pixels:c.width*c.height,triangles:Number(c.dataset.triangles),quality:c.dataset.quality};})()",
      );
      results.push({
        name: "compact-render-budget",
        width,
        ...budget,
        pass: budget.pixels <= 361200 && budget.triangles === 21600 && budget.quality === "compact",
      });
    }
    for (const p of [0.52, 1]) {
      await evaluate(
        `(()=>{const s=document.querySelector('[data-observatory]');scrollTo(0,s.offsetTop+(s.offsetHeight-s.firstElementChild.clientHeight)*${p});})()`,
      );
      await delay(120);
      await snapshot(`observatory-${width}-${p === 1 ? "drawing" : "reveal"}`);
    }
    if (!quick && (width === 1440 || width === 390)) {
      for (const section of ["work", "about", "contact", "notebook", "sea-studio"]) {
        await evaluate("document.getElementById(" + JSON.stringify(section) + ").scrollIntoView()");
        await delay(100);
        await snapshot("home-" + width + "-" + section);
      }
    }
    if (width === 1440 || width === 390) {
      await evaluate("document.getElementById('work').scrollIntoView({behavior:'instant'})");
      await delay(300);
      const clip = await evaluate(
        "(()=>{const r=document.getElementById('work').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth,height:r.height,scale:1};})()",
      );
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip,
      });
      writeFileSync(join(out, `home-${width}-work-spreads.png`), Buffer.from(shot.data, "base64"));
      results.push({
        name: "work-spread-figure-layout",
        width,
        pass: await evaluate(
          "(()=>{const w=document.getElementById('work'),figures=[...w.querySelectorAll('figure')];return figures.length===5&&figures.every(f=>{const r=f.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth+1;});})()",
        ),
      });
    }
    if (width === 1440 || width === 390) {
      await evaluate("document.getElementById('contact').scrollIntoView({behavior:'instant'})");
      await delay(100);
      const clip = await evaluate(
        "(()=>{const r=document.getElementById('contact').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth,height:r.height,scale:1};})()",
      );
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip,
      });
      writeFileSync(
        join(out, `home-${width}-contact-spread.png`),
        Buffer.from(shot.data, "base64"),
      );
      results.push({
        name: "contact-and-profile-link-layout",
        width,
        pass: await evaluate(
          "[...document.querySelectorAll('#contact a, #contact button, #about ul a, [data-shore] ul a')].every(a=>{const r=a.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=44;})",
        ),
      });
    }
    await load("/blog");
    await snapshot(`atlas-${width}`, true);
    if (!quick && width === 390) {
      await load(articlePaths[0]);
      await snapshot("article-390", true);
      await load(articlePaths[1]);
      await snapshot("mark-article-390", true);
    }
  }
}
