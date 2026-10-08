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

export type SeaSample = { height: number; dx: number; dz: number };
