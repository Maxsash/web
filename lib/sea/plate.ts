import { sampleSea } from "./sample.ts";
import type { SeaEdition } from "./types.ts";

export function renderSeaPlate(edition: SeaEdition): string {
  const rows: string[] = [];
  const columns: string[] = [];
  const point = (x: number, z: number) => {
    const { height } = sampleSea(edition, x, z, 0);
    return `${(640 + 28 * (x - z)).toFixed(2)},${(475 + 12 * (x + z) - height * 62).toFixed(2)}`;
  };

  for (let row = 0; row <= 80; row++) {
    const z = -9 + (18 * row) / 80;
    const points: string[] = [];
    for (let column = 0; column <= 160; column++) {
      points.push(point(-10 + (20 * column) / 160, z));
    }
    rows.push(`<polyline points="${points.join(" ")}"/>`);
  }
  for (let column = 0; column <= 20; column++) {
    const x = -10 + column;
    const points: string[] = [];
    for (let row = 0; row <= 120; row++) points.push(point(x, -9 + (18 * row) / 120));
    columns.push(`<polyline points="${points.join(" ")}"/>`);
  }

  const cut: string[] = [];
  for (let step = 0; step <= 320; step++) cut.push(point(-10 + (20 * step) / 320, 0));
  // The seed is validated and every other value is generated geometry, so no untrusted markup reaches this SVG.
  const recipe = edition.settings
    ? `SWELL ${edition.settings.swell} · HEADING ${edition.settings.heading} · CHARACTER ${edition.settings.character} · VARIATION ${edition.settings.variation}`
    : "SEA / SHIP / MATH";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="960" viewBox="0 0 1280 960" role="img" aria-labelledby="title desc">
<title id="title">Sea, resolved — authored edition ${edition.seed}</title>
<desc id="desc">A mathematical ocean drawn as an engraved isometric field. Six directional waves form the same surface shown in the Observatory. Frozen at scene time zero. This is an authored study, not an ocean observation.</desc>
<rect width="1280" height="960" fill="#eee9dc"/>
<g fill="none" stroke="#173f44" stroke-width="1" opacity=".3"><path d="M56 48H1224V912H56Z M56 124H1224 M56 810H1224"/><path d="M40 48H72M56 32V64M1208 48H1240M1224 32V64M40 912H72M56 896V928M1208 912H1240M1224 896V928"/></g>
<g fill="#173f44" font-family="monospace" font-size="13" letter-spacing="2"><text x="80" y="87">MAXSASH STUDIO / FIELD PLATE 01</text><text x="1200" y="87" text-anchor="end">EDITION ${edition.seed.toUpperCase()}</text></g>
<text x="78" y="195" fill="#173f44" font-family="Georgia,serif" font-size="66" letter-spacing="-2">Sea, resolved.</text>
<text x="1198" y="177" fill="#173f44" font-family="monospace" font-size="12" text-anchor="end">SIX WAVES. ONE SURFACE.</text>
<g fill="none" stroke="#173f44" stroke-linecap="round" stroke-linejoin="round"><g stroke-width=".7" opacity=".68">${rows.join("")}</g><g stroke-width=".55" opacity=".2">${columns.join("")}</g></g>
<polyline points="${cut.join(" ")}" fill="none" stroke="#bc542f" stroke-width="2.2"/>
<g fill="#173f44" font-family="monospace" font-size="12"><text x="91" y="523">−10</text><text x="1165" y="462">+10</text><text x="640" y="739" text-anchor="middle">THE SAME FIELD, SEEN FROM ABOVE</text></g>
<g fill="#173f44"><text x="80" y="853" font-family="Georgia,serif" font-size="24">An ocean made of relationships.</text><text x="80" y="884" font-family="monospace" font-size="12">AUTHORED STUDY · MODEL V${edition.version} · t = 0 s · NOT LIVE OBSERVATIONS</text><text x="1200" y="853" text-anchor="end" font-family="Georgia,serif" font-size="24">∑ Aᵢ sin(kᵢ · x − ωᵢt + φᵢ)</text><text x="1200" y="884" text-anchor="end" font-family="monospace" font-size="12">${recipe}</text></g>
</svg>`;
}
