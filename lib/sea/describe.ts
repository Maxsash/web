import type { SeaSettings } from "./types.ts";

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
