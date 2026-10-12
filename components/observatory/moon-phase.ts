const DAY_MS = 86_400_000;
const INDIA_OFFSET_MS = 5.5 * 3_600_000;
const EPOCH = Date.UTC(1999, 11, 31);
const RAD = Math.PI / 180;
const sin = (degrees: number) => Math.sin(degrees * RAD);
const cos = (degrees: number) => Math.cos(degrees * RAD);
const degrees = (radians: number) => radians / RAD;
const wrap = (angle: number) => ((angle % 360) + 360) % 360;

function orbit(meanAnomaly: number, eccentricity: number, radius: number) {
  const mean = wrap(meanAnomaly) * RAD;
  let eccentric = mean;
  for (let i = 0; i < 4; i++) {
    eccentric -=
      (eccentric - eccentricity * Math.sin(eccentric) - mean) /
      (1 - eccentricity * Math.cos(eccentric));
  }
  const x = radius * (Math.cos(eccentric) - eccentricity);
  const y = radius * Math.sqrt(1 - eccentricity ** 2) * Math.sin(eccentric);
  return { anomaly: degrees(Math.atan2(y, x)), distance: Math.hypot(x, y) };
}

export function moonPhaseAt(timestamp: number) {
  if (!Number.isFinite(timestamp)) throw new RangeError("A finite timestamp is required");
  const days = (timestamp - EPOCH) / DAY_MS;
  const sunMean = 356.047 + 0.9856002585 * days;
  const sunPerigee = 282.9404 + 0.0000470935 * days;
  const sun = orbit(sunMean, 0.016709 - 0.000000001151 * days, 1);
  const sunLongitude = sun.anomaly + sunPerigee;
  const node = 125.1228 - 0.0529538083 * days;
  const perigee = 318.0634 + 0.1643573223 * days;
  const mean = 115.3654 + 13.0649929509 * days;
  const moon = orbit(mean, 0.0549, 60.2666);
  const argument = moon.anomaly + perigee;
  const x = cos(node) * cos(argument) - sin(node) * sin(argument) * cos(5.1454);
  const y = sin(node) * cos(argument) + cos(node) * sin(argument) * cos(5.1454);
  const z = sin(argument) * sin(5.1454);
  const elongation = mean + perigee + node - sunMean - sunPerigee;
  const latitudeArgument = mean + perigee;
  const longitude =
    degrees(Math.atan2(y, x)) +
    -1.274 * sin(mean - 2 * elongation) +
    0.658 * sin(2 * elongation) -
    0.186 * sin(sunMean) -
    0.059 * sin(2 * mean - 2 * elongation) -
    0.057 * sin(mean - 2 * elongation + sunMean) +
    0.053 * sin(mean + 2 * elongation) +
    0.046 * sin(2 * elongation - sunMean) +
    0.041 * sin(mean - sunMean) -
    0.035 * sin(elongation) -
    0.031 * sin(mean + sunMean) -
    0.015 * sin(2 * latitudeArgument - 2 * elongation) +
    0.011 * sin(mean - 4 * elongation);
  const latitude =
    degrees(Math.atan2(z, Math.hypot(x, y))) -
    0.173 * sin(latitudeArgument - 2 * elongation) -
    0.055 * sin(mean - latitudeArgument - 2 * elongation) -
    0.046 * sin(mean + latitudeArgument - 2 * elongation) +
    0.033 * sin(latitudeArgument + 2 * elongation) +
    0.017 * sin(2 * mean + latitudeArgument);
  const moonDistance =
    (moon.distance - 0.58 * cos(mean - 2 * elongation) - 0.46 * cos(2 * elongation)) * 6378.14;
  const sunDistance = sun.distance * 149_597_870.7;
  const separation = Math.acos(
    Math.max(-1, Math.min(1, cos(latitude) * cos(longitude - sunLongitude))),
  );
  const phaseAngle = Math.atan2(
    sunDistance * Math.sin(separation),
    moonDistance - sunDistance * Math.cos(separation),
  );
  return {
    cycle: wrap(longitude - sunLongitude) / 360,
    illumination: (1 + Math.cos(phaseAngle)) / 2,
  };
}

export function indiaMoonDay(timestamp: number) {
  return Math.floor((timestamp + INDIA_OFFSET_MS) / DAY_MS);
}

export function moonForIndiaDay(day: number) {
  return moonPhaseAt(day * DAY_MS - INDIA_OFFSET_MS + DAY_MS / 2);
}
