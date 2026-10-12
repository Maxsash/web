import { skyProjectionAt } from "./star-sky.ts";

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const INDIA_EVENING_UTC_MS = 15.5 * 3_600_000;
const OBLIQUITY = 23.43928 * RAD;
const SCHLYTER_EPOCH = Date.UTC(1999, 11, 31);

export const PLANET_NAMES = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
export type PlanetName = (typeof PLANET_NAMES)[number];

type Elements = readonly [number, number, number, number, number, number];
type Orbit = { base: Elements; rate: Elements };
type Vector = readonly [number, number, number];

const orbits: Record<PlanetName | "Earth", Orbit> = {
  Mercury: {
    base: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593],
    rate: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  },
  Venus: {
    base: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255],
    rate: [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418],
  },
  Earth: {
    base: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0],
    rate: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0],
  },
  Mars: {
    base: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    rate: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  },
  Jupiter: {
    base: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    rate: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  },
  Saturn: {
    base: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    rate: [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  },
};

const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (v: Vector) => Math.hypot(...v);
const angle = (cosine: number) => Math.acos(Math.max(-1, Math.min(1, cosine))) / RAD;

function heliocentric(orbit: Orbit, centuries: number): Vector {
  const [axis, eccentricity, inclination, longitude, perihelion, node] = orbit.base.map(
    (base, index) => base + orbit.rate[index] * centuries,
  );
  const mean = (((longitude - perihelion) % 360) + 360) % 360;
  const meanRadians = mean * RAD;
  let eccentric = meanRadians;
  for (let i = 0; i < 5; i++) {
    eccentric -=
      (eccentric - eccentricity * Math.sin(eccentric) - meanRadians) /
      (1 - eccentricity * Math.cos(eccentric));
  }
  const x = axis * (Math.cos(eccentric) - eccentricity);
  const y = axis * Math.sqrt(1 - eccentricity ** 2) * Math.sin(eccentric);
  const argument = (perihelion - node) * RAD;
  const ascending = node * RAD;
  const tilt = inclination * RAD;
  const along = Math.cos(argument) * x - Math.sin(argument) * y;
  const across = Math.sin(argument) * x + Math.cos(argument) * y;
  return [
    Math.cos(ascending) * along - Math.sin(ascending) * Math.cos(tilt) * across,
    Math.sin(ascending) * along + Math.cos(ascending) * Math.cos(tilt) * across,
    Math.sin(tilt) * across,
  ];
}

function apparentMagnitude(
  name: PlanetName,
  sunDistance: number,
  earthDistance: number,
  phaseAngle: number,
  geocentric: Vector,
  timestamp: number,
) {
  const distance = 5 * Math.log10(sunDistance * earthDistance);
  switch (name) {
    case "Mercury":
      return -0.36 + distance + 0.027 * phaseAngle + 2.2e-13 * phaseAngle ** 6;
    case "Venus":
      return -4.34 + distance + 0.013 * phaseAngle + 4.2e-7 * phaseAngle ** 3;
    case "Mars":
      return -1.51 + distance + 0.016 * phaseAngle;
    case "Jupiter":
      return -9.25 + distance + 0.014 * phaseAngle;
    case "Saturn": {
      const eclipticLongitude = Math.atan2(geocentric[1], geocentric[0]);
      const eclipticLatitude = Math.atan2(geocentric[2], Math.hypot(geocentric[0], geocentric[1]));
      const ringNode = (169.51 + 3.82e-5 * ((timestamp - SCHLYTER_EPOCH) / DAY_MS)) * RAD;
      const ringTilt = 28.06 * RAD;
      const ringAngle = Math.asin(
        Math.sin(eclipticLatitude) * Math.cos(ringTilt) -
          Math.cos(eclipticLatitude) * Math.sin(ringTilt) * Math.sin(eclipticLongitude - ringNode),
      );
      const ring = -2.6 * Math.sin(Math.abs(ringAngle)) + 1.2 * Math.sin(ringAngle) ** 2;
      return -9 + distance + 0.044 * phaseAngle + ring;
    }
  }
}

export function planetsAt(timestamp: number) {
  if (!Number.isFinite(timestamp)) throw new RangeError("A finite timestamp is required");
  const julianDay = timestamp / DAY_MS + 2_440_587.5;
  const centuries = (julianDay - 2_451_545) / 36_525;
  const earth = heliocentric(orbits.Earth, centuries);
  const sunDistance = length(earth);
  return PLANET_NAMES.map((name) => {
    const heliocentricPosition = heliocentric(orbits[name], centuries);
    const geocentric: Vector = [
      heliocentricPosition[0] - earth[0],
      heliocentricPosition[1] - earth[1],
      heliocentricPosition[2] - earth[2],
    ];
    const earthDistance = length(geocentric);
    const planetDistance = length(heliocentricPosition);
    const phaseAngle = angle(
      (planetDistance ** 2 + earthDistance ** 2 - sunDistance ** 2) /
        (2 * planetDistance * earthDistance),
    );
    const elongation = angle(-dot(geocentric, earth) / (earthDistance * sunDistance));
    const equatorialY = geocentric[1] * Math.cos(OBLIQUITY) - geocentric[2] * Math.sin(OBLIQUITY);
    const equatorialZ = geocentric[1] * Math.sin(OBLIQUITY) + geocentric[2] * Math.cos(OBLIQUITY);
    return {
      name,
      rightAscension: (((Math.atan2(equatorialY, geocentric[0]) / RAD) % 360) + 360) % 360,
      declination: Math.atan2(equatorialZ, Math.hypot(geocentric[0], equatorialY)) / RAD,
      magnitude: apparentMagnitude(
        name,
        planetDistance,
        earthDistance,
        phaseAngle,
        geocentric,
        timestamp,
      ),
      elongation,
    };
  });
}

export function planetFrameAt(day: number) {
  const project = skyProjectionAt(day);
  const timestamp = day * DAY_MS + INDIA_EVENING_UTC_MS;
  const visible: number[] = [];
  const names: PlanetName[] = [];
  planetsAt(timestamp).forEach((planet, index) => {
    if (planet.elongation < 12 || planet.magnitude > 5) return;
    const point = project(planet.rightAscension, planet.declination);
    if (!point) return;
    visible.push(point.x, point.y, planet.magnitude, index);
    names.push(planet.name);
  });
  return { points: new Float32Array(visible), names };
}
