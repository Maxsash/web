/*
 * Writes tools/.out/preview.html: the mark on both grounds at display size,
 * and again at 120 / 56 / 32px, which is where the hook counters and the white
 * channel beside the mast give out first.  Open it after changing a dial in
 * build-logo.mjs.
 *
 *   node tools/build-logo.mjs && node tools/preview-logo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const here = (p) => new URL(p, import.meta.url);
mkdirSync(here(".out"), { recursive: true });
const o = JSON.parse(readFileSync(here(".out/logo.json"), "utf8"));

const svg = (fill, size) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${o.box} ${o.box}" width="${size}" height="${size}">
    <g transform="translate(${o.offX} ${o.offY}) scale(1 -1)" fill="${fill}" stroke="${fill}"
       stroke-width="${o.round * 2}" stroke-linejoin="round">
      <path d="${o.integralD}"/>
      <circle cx="${o.ballTop[0]}" cy="${o.ballTop[1]}" r="${o.ballR}"/>
      <circle cx="${o.ballBottom[0]}" cy="${o.ballBottom[1]}" r="${o.ballR}"/>
      <path d="${o.sailD}"/>
      <path d="${o.hullD}"/>
    </g>
  </svg>`;

const ink = "#0C3D55";
const paper = "#F7EFDF";

writeFileSync(
  here(".out/preview.html"),
  `<body style="margin:0;display:flex;flex-wrap:wrap;font-family:system-ui">
  <div style="background:${paper};padding:32px">${svg(ink, 420)}</div>
  <div style="background:${ink};padding:32px">${svg(paper, 420)}</div>
  <div style="background:${paper};padding:32px;display:flex;align-items:flex-end;gap:28px">
    ${[120, 56, 32].map((s) => svg(ink, s)).join("")}
  </div>
</body>`,
);

console.log("wrote tools/.out/preview.html");
