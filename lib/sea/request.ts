import { DEFAULT_SEA_SEED, normaliseSeaSeed, parseSeaVersion } from "./seed.ts";
import type { SeaVersion } from "./types.ts";

export type SeaParam = string | readonly string[] | null | undefined;
type SeaRequest = { seed: string; version: SeaVersion };
export type PageSeaQuery = { seed?: SeaParam; version?: SeaParam };

export const SEED_ERROR = "Provide one seed containing exactly eight hexadecimal characters.";
export const VERSION_ERROR = "This endpoint supports sea model versions 1 and 2.";

export function parseSeedParam(param: SeaParam, whenAbsent = DEFAULT_SEA_SEED): string | null {
  if (param == null) return whenAbsent;
  return typeof param === "string" ? normaliseSeaSeed(param) : null;
}

export function parseVersionParam(param: SeaParam, whenAbsent: SeaVersion): SeaVersion | null {
  if (param == null) return whenAbsent;
  return typeof param === "string" ? parseSeaVersion(param) : null;
}

export function resolvePageSea(query: PageSeaQuery, freshSeed: () => string): SeaRequest | null {
  if (query.seed == null) {
    const version = parseVersionParam(query.version, "2");
    if (version === "1") return { seed: DEFAULT_SEA_SEED, version };
    return version && { seed: freshSeed(), version };
  }
  const seed = parseSeedParam(query.seed);
  const version = parseVersionParam(query.version, "1");
  return seed && version ? { seed, version } : null;
}

export function resolveApiSea(url: URL): SeaRequest | { error: string } {
  const seeds = url.searchParams.getAll("seed");
  const seed = parseSeedParam(seeds.length > 1 ? seeds : seeds[0]);
  if (seed === null) return { error: SEED_ERROR };
  const version = parseVersionParam(url.searchParams.get("version"), "1");
  if (version === null) return { error: VERSION_ERROR };
  return { seed, version };
}
