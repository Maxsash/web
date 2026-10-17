export const replayRegions = ["auto", "IN", "GB", "EU", "US", "other"] as const;
export type ReplayRegion = (typeof replayRegions)[number];
export type DetectedRegion = Exclude<ReplayRegion, "auto"> | "unknown";
export type ReplayPreferences = { region: ReplayRegion; automatic: boolean };
export const defaultReplayPreferences: ReplayPreferences = { region: "auto", automatic: true };
export const replayPreferenceKey = "studio-privacy";

export function replayRegion(value: unknown): ReplayRegion {
  return replayRegions.includes(value as ReplayRegion) ? (value as ReplayRegion) : "auto";
}

export function parseReplayPreferences(value: string | null): ReplayPreferences {
  try {
    const parsed = JSON.parse(value ?? "null");
    if (parsed === null) return defaultReplayPreferences;
    if (parsed?.version !== 1 || !replayRegions.includes(parsed.region))
      return { ...defaultReplayPreferences, automatic: false };
    return { region: replayRegion(parsed.region), automatic: parsed.automatic === true };
  } catch {
    return { ...defaultReplayPreferences, automatic: false };
  }
}

export function detectedRegion(country: string | null): DetectedRegion {
  if (["IN", "GB", "US"].includes(country ?? "")) return country as "IN" | "GB" | "US";
  if (
    country &&
    [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE",
      "IS",
      "LI",
      "NO",
      "CH",
    ].includes(country)
  )
    return "EU";
  return country && /^[A-Z]{2}$/.test(country) && !["XX", "ZZ"].includes(country)
    ? "other"
    : "unknown";
}

export const regionNames: Record<ReplayRegion | "unknown", string> = {
  auto: "Use automatic detection",
  IN: "India",
  GB: "United Kingdom",
  EU: "EU / EEA / Switzerland",
  US: "United States",
  other: "Another region",
  unknown: "Not detected",
};
