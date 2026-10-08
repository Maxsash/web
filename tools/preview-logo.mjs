/*
 * The exact generated mark on both grounds, from 420px down to 16px, with
 * enlarged junctions and the original silhouette for comparison.
 *
 *   node tools/build-logo.mjs
 *   node tools/preview-logo.mjs
 *   node tools/render-logo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const here = (p) => new URL(p, import.meta.url);
mkdirSync(here(".out"), { recursive: true });
const o = JSON.parse(readFileSync(here(".out/logo.json"), "utf8"));
const iconSource = readFileSync(here("../app/icon.svg"), "utf8");
const icon = (size) =>
  iconSource.replace(/<svg\b/, `<svg width="${size}" height="${size}" aria-hidden="true"`);

const svg = (fill, size, viewBox = `0 0 ${o.box} ${o.box}`) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}" aria-hidden="true">
    <g transform="translate(${o.offX} ${o.offY}) scale(1 -1)" fill="${fill}">${o.body}</g>
  </svg>`;

const ink = "#0C3D55";
const paper = "#F7EFDF";
const sizes = [120, 56, 32, 16];
const pixelFigure = (source, size, label) =>
  `<figure class="pixel-sample" data-pixels="${size}"><div class="pixel-source">${source}</div><canvas width="${size}" height="${size}" style="width:${size * 8}px;height:${size * 8}px" aria-label="${label} at ${size}px enlarged eight times"></canvas><figcaption>${label} · ${size}px at 8×</figcaption></figure>`;
const grounds = [
  { name: "Ink on sand", fill: ink, background: paper },
  { name: "Sand on ink", fill: paper, background: ink },
];
const crop = (x, y, size) => [x, y, size, size].map((n) => +(n * o.box).toFixed(2)).join(" ");
const details = [
  { name: "Hook, terminal, and sail head", viewBox: crop(0.3, 0.01, 0.38) },
  { name: "Lower terminal and stern", viewBox: crop(0.025, 0.7, 0.3) },
  { name: "Mast, foot, and deck channel", viewBox: crop(0.2, 0.66, 0.25) },
];

// Original gets only a display framing change; its paths remain verbatim.
const original = readFileSync(here("../docs/mark-original.svg"), "utf8")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<rect\b[^>]*\/>/g, "")
  .replace(/fill="#[^"]*"/g, `fill="${ink}"`)
  .replace(
    /<svg[^>]*>/,
    '<svg class="fit-original" width="260" height="260" xmlns="http://www.w3.org/2000/svg">',
  );
const baseline = existsSync(here(".out/baseline.svg"))
  ? readFileSync(here(".out/baseline.svg"), "utf8").replace(
      /<svg\b/,
      '<svg width="260" height="260"',
    )
  : null;

writeFileSync(
  here(".out/preview.html"),
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Maxsash Studio mark — geometry proof</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#e8e3d8;color:${ink};font-family:system-ui,sans-serif}
header{padding:30px 36px 24px}h1{font-size:22px;font-weight:600;margin:0 0 8px}p{margin:0;font-size:13px;line-height:1.6}
h2{margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:600}
.grounds{display:grid;grid-template-columns:1fr 1fr}.ground{padding:28px 36px 30px}
.hero{display:flex;justify-content:center;margin:14px 0 22px}.sizes{display:flex;align-items:flex-end;justify-content:center;gap:30px;min-height:160px}
.icons{display:flex;align-items:center;justify-content:center;gap:30px;padding-top:28px;margin-top:26px;border-top:1px solid color-mix(in srgb,currentColor 15%,transparent)}
.icons h2{font-size:10px;letter-spacing:.08em}.pixel-proof{margin-top:28px;font-size:12px}.pixel-proof summary{cursor:pointer;opacity:.8}
.pixel-grid{display:grid;grid-template-columns:256px 128px;align-items:end;gap:28px 30px;justify-content:center;padding-top:24px}.pixel-source{display:none}.pixel-sample canvas{image-rendering:pixelated;display:block}
figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:10px}figcaption{font-size:11px;opacity:.72}
svg{display:block;flex:none}.details{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#c6ccca}
.detail{padding:24px 12px;background:${paper};overflow:hidden}.detail svg{width:100%;height:auto}
.comparison{padding:28px 36px;background:${paper}}.comparison-row{display:flex;gap:50px;justify-content:center;padding-top:20px}
.stamp{padding:28px 36px;background:white;color:black;display:flex;align-items:center;justify-content:center;gap:38px}
@media(max-width:760px){.grounds{grid-template-columns:1fr}.details{grid-template-columns:1fr}.hero svg{width:100%;height:auto}.comparison-row{gap:10px;flex-wrap:wrap}.sizes{gap:22px}}
</style></head><body>
<header><h1>Maxsash Studio · mark proof</h1><p>Judge the 32px counter and channel first. The enlarged views expose tangency and corner fairness.</p></header>
<section class="grounds">${grounds
    .map(
      ({
        name,
        fill,
        background,
      }) => `<div class="ground" style="background:${background};color:${fill}">
  <h2>${name}</h2><div class="hero">${svg(fill, 420)}</div><div class="sizes">${sizes.map((s) => `<figure>${svg(fill, s)}<figcaption>${s}px</figcaption></figure>`).join("")}</div>
  <div class="icons"><h2>Actual browser tile</h2>${[32, 16].map((s) => `<figure>${icon(s)}<figcaption>${s}px</figcaption></figure>`).join("")}</div>
  <details class="pixel-proof"><summary>Show 8× pixel proof · mark and actual browser tile</summary><div class="pixel-grid">${[32, 16].map((s) => pixelFigure(svg(fill, s), s, "Mark")).join("")}${[32, 16].map((s) => pixelFigure(icon(s), s, "Browser tile")).join("")}</div></details>
</div>`,
    )
    .join("")}</section>
<section class="details">${details.map(({ name, viewBox }) => `<figure class="detail">${svg(ink, 420, viewBox)}<figcaption>${name}</figcaption></figure>`).join("")}</section>
<section class="comparison"><h2>Silhouette continuity</h2><div class="comparison-row">
  <figure>${original}<figcaption>Original · fitted to equal height</figcaption></figure>
  ${baseline ? `<figure>${baseline}<figcaption>Committed baseline</figcaption></figure>` : ""}
  <figure>${svg(ink, 260)}<figcaption>Current generated mark</figcaption></figure>
</div></section>
<section class="stamp"><h2>One-colour stamp</h2>${[120, 56, 32, 16].map((s) => `<figure>${svg("#000", s)}<figcaption>${s}px</figcaption></figure>`).join("")}</section>
<script>
// Rasterize at the stated native size first; CSS then enlarges those pixels
// without smoothing. Enlarging an SVG directly would hide sampling failures.
window.markProofReady = Promise.all(Array.from(document.querySelectorAll('.pixel-sample'), async (figure) => {
  const canvas=figure.querySelector('canvas'), size=Number(figure.dataset.pixels);
  const source=figure.querySelector('svg'), serialized=new XMLSerializer().serializeToString(source);
  const url=URL.createObjectURL(new Blob([serialized],{type:'image/svg+xml'})), image=new Image();
  try { image.src=url; await image.decode(); canvas.getContext('2d').drawImage(image,0,0,size,size); }
  finally { URL.revokeObjectURL(url); }
}));
// getBBox overestimates the old paths' bounds under their skewed transforms.
// Sample the actual outlines in root coordinates to fit their ink equally.
for (const s of document.querySelectorAll('.fit-original')) {
  const points=[];
  for (const p of s.querySelectorAll('path')) {
    const m=s.getCTM().inverse().multiply(p.getCTM()), length=p.getTotalLength();
    for(let i=0;i<=2000;i++) points.push(p.getPointAtLength(length*i/2000).matrixTransform(m));
  }
  const xs=points.map(p=>p.x), ys=points.map(p=>p.y);
  const x=Math.min(...xs), y=Math.min(...ys), w=Math.max(...xs)-x, h=Math.max(...ys)-y, box=Math.max(w,h)*1.08;
  s.setAttribute('viewBox',[x+(w-box)/2,y+(h-box)/2,box,box].join(' '));
}
</script>
</body></html>`,
);

console.log("wrote tools/.out/preview.html");
