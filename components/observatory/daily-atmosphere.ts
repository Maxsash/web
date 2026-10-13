export type DailyAtmosphere = readonly [
  cloudOffset: number,
  cloudOpacity: number,
  cirrusOpacity: number,
  haze: number,
];

const moods = [
  [0.55, 0.7, 0.65],
  [0.85, 1.1, 0.95],
  [1.05, 0.9, 1.25],
] as const;

export function atmosphereForIndiaDay(day: number): DailyAtmosphere {
  let hash = Math.imul(day ^ (day >>> 16), 0x45d9f3b);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash = (hash ^ (hash >>> 16)) >>> 0;
  const [cloudOpacity, cirrusOpacity, haze] = moods[hash % moods.length];
  const cloudOffset = (((hash >>> 8) & 255) / 255 - 0.5) * 0.08;
  return [cloudOffset, cloudOpacity, cirrusOpacity, haze];
}
