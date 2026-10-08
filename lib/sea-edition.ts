// Metres and seconds; x and z are horizontal, y is up, directions are radians from +x toward +z.
type SeaWave = {
  amplitude: number;
  wavelength: number;
  direction: number;
  phase: number;
};

export type SeaVersion = "1" | "2";

export type SeaSettings = {
  swell: number;
  heading: number;
  character: number;
  variation: number;
};

export type SeaEdition = {
  version: SeaVersion;
  seed: string;
  kind: "authored";
  waves: SeaWave[];
  settings?: SeaSettings;
};

type SeaSample = { height: number; dx: number; dz: number };

export const DEFAULT_SEA_SEED = "5ea5cafe";
export const SEA_GRAVITY = 9.81;

export function normaliseSeaSeed(input: string): string | null {
  return /^[a-f\d]{8}$/i.test(input) ? input.toLowerCase() : null;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export const DEFAULT_SEA_SEED_V2 = "70806d5e";

export const SEA_PRESETS: { name: string; settings: SeaSettings }[] = [
  { name: "Glass", settings: { swell: 30, heading: 128, character: 20, variation: 7 } },
  { name: "Trade wind", settings: { swell: 140, heading: 200, character: 110, variation: 7 } },
  { name: "Squall", settings: { swell: 245, heading: 50, character: 225, variation: 7 } },
];
export const HOME_WATER: SeaSettings = { swell: 112, heading: 128, character: 109, variation: 94 };

const clampByte = (value: number) => Math.min(255, Math.max(0, Math.round(value)));

export function pickVisitSea(random: () => number = Math.random): string {
  const starts = [
    { settings: HOME_WATER, weight: 3 },
    { settings: SEA_PRESETS[1].settings, weight: 3 },
    { settings: SEA_PRESETS[0].settings, weight: 2 },
    { settings: SEA_PRESETS[2].settings, weight: 2 },
  ];
  let ticket = random() * starts.reduce((sum, start) => sum + start.weight, 0);
  const start = (starts.find((candidate) => (ticket -= candidate.weight) < 0) ?? starts[0])
    .settings;
  const nudge = (value: number, range: number) => clampByte(value + (random() * 2 - 1) * range);
  return seedFromSettings({
    swell: nudge(start.swell, 28),
    heading: nudge(start.heading, 70),
    character: nudge(start.character, 32),
    variation: Math.floor(random() * 256),
  });
}

export const SEA_SETTING_KEYS = ["swell", "heading", "character", "variation"] as const;

export function settingsFromSeed(seed: string): SeaSettings {
  const canonical = normaliseSeaSeed(seed);
  if (canonical === null)
    throw new RangeError("A sea seed must contain eight hexadecimal characters.");
  const byte = (index: number) => Number.parseInt(canonical.slice(index * 2, index * 2 + 2), 16);
  return { swell: byte(0), heading: byte(1), character: byte(2), variation: byte(3) };
}

export function seedFromSettings(settings: SeaSettings): string {
  return SEA_SETTING_KEYS.map((key) => {
    const value = Math.min(255, Math.max(0, Math.round(settings[key])));
    return value.toString(16).padStart(2, "0");
  }).join("");
}

export function createSeaEdition(seed = DEFAULT_SEA_SEED, version: SeaVersion = "1"): SeaEdition {
  return version === "2" ? createSeaEditionV2(seed) : createSeaEditionV1(seed);
}

function createSeaEditionV2(seed: string): SeaEdition {
  const settings = settingsFromSeed(seed);
  const canonical = seedFromSettings(settings);
  const swell = settings.swell / 255;
  const heading = settings.heading / 255;
  const character = settings.character / 255;
  const random = seededRandom(0x9e3779b1 ^ Math.imul(settings.variation + 1, 0x85ebca6b));

  const amplitudes = [0.55, 0.32, 0.16, 0.085, 0.04, 0.02];
  const wavelengths = [14, 8, 4.5, 2.5, 1.2, 0.65];
  const directions = [0.28, -0.62, 0.95, -0.28, 0.7, -0.9];
  const rounded = (value: number) => Number(value.toFixed(8));

  const height = 0.55 + 1.0 * swell;
  const gain = 0.5 + 1.2 * character;
  const weights = amplitudes.map((_, index) => Math.pow(gain, (index - 2.5) / 2.5));
  const energy = amplitudes.reduce((sum, amplitude, index) => sum + amplitude * weights[index], 0);
  const normal = amplitudes.reduce((sum, amplitude) => sum + amplitude, 0) / energy;
  const lengthScale = 1.45 - 0.45 * character;
  const spread = 0.35 + 1.0 * character;
  const turn = (heading - 0.5) * 2.0;

  return {
    version: "2",
    seed: canonical,
    kind: "authored",
    settings,
    waves: amplitudes.map((amplitude, index) => ({
      amplitude: rounded(amplitude * weights[index] * normal * height * (0.92 + random() * 0.16)),
      wavelength: rounded(wavelengths[index] * lengthScale * (0.95 + random() * 0.1)),
      direction: rounded(turn + directions[index] * spread + (random() - 0.5) * 0.2),
      phase: rounded(random() * Math.PI * 2),
    })),
  };
}

// Frozen: changing any coefficient or the generator changes every version 1 edition ever shared.
function createSeaEditionV1(seed = DEFAULT_SEA_SEED): SeaEdition {
  const canonical = normaliseSeaSeed(seed);
  if (canonical === null)
    throw new RangeError("A sea seed must contain eight hexadecimal characters.");

  const random = seededRandom(Number.parseInt(canonical, 16));
  const amplitudes = [0.55, 0.32, 0.16, 0.085, 0.04, 0.02];
  const wavelengths = [14, 8, 4.5, 2.5, 1.2, 0.65];
  const directions = [0.28, -0.62, 0.95, -0.28, 0.7, -0.9];
  const rounded = (value: number) => Number(value.toFixed(8));

  return {
    version: "1",
    seed: canonical,
    kind: "authored",
    waves: amplitudes.map((amplitude, index) => ({
      amplitude: rounded(amplitude * (0.9 + random() * 0.2)),
      wavelength: wavelengths[index],
      direction: rounded(directions[index] + (random() - 0.5) * 0.45),
      phase: rounded(random() * Math.PI * 2),
    })),
  };
}

export function parseSeaVersion(input: string | null | undefined): SeaVersion | null {
  return input === "1" || input === "2" ? input : null;
}

const tier = (value: number, names: [string, string, string, string, string]) =>
  names[Math.min(4, Math.floor((value / 256) * 5))];

export function describeSea(settings: SeaSettings): {
  swell: string;
  heading: string;
  character: string;
  sentence: string;
} {
  const swell = tier(settings.swell, ["Glassy", "Gentle", "Moderate", "Heavy", "Storm-high"]);
  const heading = tier(settings.heading, [
    "Running hard left",
    "Running left",
    "Running ahead",
    "Running right",
    "Running hard right",
  ]);
  const character = tier(settings.character, [
    "Long and rolling",
    "Rolling",
    "Mixed",
    "Choppy",
    "Short and cross-running",
  ]);
  return {
    swell,
    heading,
    character,
    sentence: `${swell} · ${character.toLowerCase()} · ${heading.toLowerCase()}`,
  };
}

export function sampleSea(edition: SeaEdition, x: number, z: number, time: number): SeaSample {
  let height = 0;
  let dx = 0;
  let dz = 0;
  for (const wave of edition.waves) {
    const k = (Math.PI * 2) / wave.wavelength;
    const directionX = Math.cos(wave.direction);
    const directionZ = Math.sin(wave.direction);
    const omega = Math.sqrt(SEA_GRAVITY * k);
    const phase = k * (directionX * x + directionZ * z) - omega * time + wave.phase;
    height += wave.amplitude * Math.sin(phase);
    const slope = wave.amplitude * k * Math.cos(phase);
    dx += slope * directionX;
    dz += slope * directionZ;
  }
  return { height, dx, dz };
}

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
