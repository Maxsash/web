const DAY = {
  sand: [225, 206, 166],
  shell: ["#f7e9d5", "#d9ad88", "#f9e7c9"],
  trackLine: "#a4865944",
  wetSand: "rgba(121,126,104,.32)",
  footprint: "#77603e",
  footprintHighlight: "#f6e4bd",
  water: ["#eef0ea", "#dfe3d5", "#c9d2b6"],
  foam: "#f6f5dcdb",
  faintFoam: "#f4f3d64d",
  bubbles: "#f6f2d999",
};

const NIGHT: typeof DAY = {
  sand: [108, 100, 85],
  shell: ["#b6a795", "#75685b", "#c6b299"],
  trackLine: "#e4dbc233",
  wetSand: "rgba(51,63,63,.5)",
  footprint: "#282e2b",
  footprintHighlight: "#c6bb9a",
  water: ["#0b1c26", "#283638", "#647168"],
  foam: "#d9e9dc99",
  faintFoam: "#b9d5cc22",
  bubbles: "#aac3b955",
};

export type ShorePalette = typeof DAY;

export const shorePalette = (night: boolean): ShorePalette => (night ? NIGHT : DAY);
