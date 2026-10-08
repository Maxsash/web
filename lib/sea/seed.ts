import type { SeaSettings, SeaVersion } from "./types.ts";

export const DEFAULT_SEA_SEED = "5ea5cafe";
export const DEFAULT_SEA_SEED_V2 = "70806d5e";

const SEA_SETTING_KEYS = ["swell", "heading", "character", "variation"] as const;

export const clampByte = (value: number) => Math.min(255, Math.max(0, Math.round(value)));

export function normaliseSeaSeed(input: string): string | null {
  return /^[a-f\d]{8}$/i.test(input) ? input.toLowerCase() : null;
}

export function requireSeaSeed(input: string): string {
  const canonical = normaliseSeaSeed(input);
  if (canonical === null)
    throw new RangeError("A sea seed must contain eight hexadecimal characters.");
  return canonical;
}

export function parseSeaVersion(input: string | null | undefined): SeaVersion | null {
  return input === "1" || input === "2" ? input : null;
}

export function settingsFromSeed(seed: string): SeaSettings {
  const canonical = requireSeaSeed(seed);
  const byte = (index: number) => Number.parseInt(canonical.slice(index * 2, index * 2 + 2), 16);
  return { swell: byte(0), heading: byte(1), character: byte(2), variation: byte(3) };
}

export function seedFromSettings(settings: SeaSettings): string {
  return SEA_SETTING_KEYS.map((key) => clampByte(settings[key]).toString(16).padStart(2, "0")).join(
    "",
  );
}
