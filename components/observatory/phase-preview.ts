import { indiaMoonDay, moonForIndiaDay } from "./moon-phase.ts";

const DAY_MS = 86_400_000;

export const PHASES = [
  ["New", 0],
  ["Waxing crescent", 0.125],
  ["First quarter", 0.25],
  ["Waxing gibbous", 0.375],
  ["Full", 0.5],
  ["Waning gibbous", 0.625],
  ["Last quarter", 0.75],
  ["Waning crescent", 0.875],
] as const;

export function previewPhaseDay(target: number, today = indiaMoonDay(Date.now())) {
  let nearest = today;
  let distance = Infinity;
  for (let day = today - 16; day <= today + 16; day++) {
    const cycle = moonForIndiaDay(day).cycle;
    const difference = Math.abs(((cycle - target + 1.5) % 1) - 0.5);
    const score = difference + Math.abs(day - today) * 0.00001;
    if (score < distance) {
      nearest = day;
      distance = score;
    }
  }
  return nearest;
}

export function previewDate(day: number) {
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

export function previewDay(date: string) {
  const parsed = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === date
    ? parsed / DAY_MS
    : null;
}
