/*
 * Writes tools/.out/cover.html — the 1200x630 social card, built from the same
 * wave paths and mark as the site so the two never drift apart.
 *
 *   node tools/build-cover.mjs
 *   # then render tools/.out/cover.html at 1200x630 into public/images/cover.png
 *
 * Kept as a page rather than a checked-in design file so a palette change flows
 * through to the card on the next run.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const here = (p) => new URL(p, import.meta.url);
mkdirSync(here(".out"), { recursive: true });

const logo = JSON.parse(readFileSync(here(".out/logo.json"), "utf8"));
const waveSrc = readFileSync(here("../components/wave-paths.ts"), "utf8");

/** Pull the generated band data back out without a TypeScript step. */
const band = (name) => {
  const chunk = waveSrc.slice(waveSrc.indexOf(`  ${name}: {`));
  const grab = (key) => chunk.match(new RegExp(`${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`))[1];
  return { viewBox: grab("viewBox"), body: grab("body") };
};

const BANDS = [
  { ...band("far"), fill: "#A5DCDE", bottom: 172, z: 1 },
  { ...band("mid"), fill: "#4EA5B8", bottom: 116, z: 2, foam: 5, foamFill: "#DDF2F1" },
  { ...band("near"), fill: "#1E7392", bottom: 40, z: 4, foam: 7, foamFill: "#E7F5F1" },
  { ...band("shore"), fill: "#FBF5E9", bottom: -48, z: 5 },
];

const bandHtml = (b) => `
  <div style="position:absolute;left:0;bottom:${b.bottom}px;width:2400px;z-index:${b.z}">
    <svg viewBox="${b.viewBox}" style="width:100%;height:auto;display:block">
      ${b.foam ? `<path d="${b.body}" fill="${b.foamFill}" transform="translate(0 ${-b.foam})"/>` : ""}
      <path d="${b.body}" fill="${b.fill}"/>
    </svg>
  </div>`;

const mark = (color, size) => `
  <svg viewBox="0 0 ${logo.box} ${logo.box}" style="width:${size}px;height:${size}px;display:block">
    <g transform="translate(${logo.offX} ${logo.offY}) scale(1 -1)" fill="${color}">${logo.body}</g>
  </svg>`;

writeFileSync(
  here(".out/cover.html"),
  `<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<body style="margin:0">
<div style="position:relative;width:1200px;height:630px;overflow:hidden;
  background:linear-gradient(to bottom,#D8ECF7 0%,#EDF4F1 52%,#FBEFD6 100%);
  font-family:Fraunces,Georgia,serif">

  <div style="position:absolute;left:50%;bottom:14%;width:1300px;height:650px;transform:translateX(-50%);
    background:radial-gradient(ellipse at center,#FDF6E4 0%,transparent 68%);opacity:.6"></div>

  ${BANDS.slice(0, 2).map(bandHtml).join("")}

  <div style="position:absolute;right:96px;bottom:150px;z-index:3">${mark("#082F44", 300)}</div>

  ${BANDS.slice(2).map(bandHtml).join("")}

  <div style="position:absolute;left:80px;top:150px;z-index:6;color:#0C2E3F">
    <div style="font-family:'JetBrains Mono',monospace;font-size:19px;letter-spacing:.18em;
      text-transform:uppercase;color:#6E8A97;margin-bottom:22px">software, games, and tools</div>
    <div style="font-size:104px;line-height:.92;font-weight:600;letter-spacing:-.03em">Maxsash</div>
    <div style="font-size:104px;line-height:1.02;font-style:italic;font-weight:400;color:#1E7392">Studio</div>
  </div>
</div>
</body>`,
);

console.log("wrote tools/.out/cover.html — render it at 1200x630");
