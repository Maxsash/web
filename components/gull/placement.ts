import type { Facet } from "./body.ts";

const PERCH = { lengthsPerButton: 1.18, canvasLengths: 2.8, seatLengths: 1.1 };

export const measurePerch = (buttonHeight: number) => {
  const scale = buttonHeight * PERCH.lengthsPerButton;
  return { scale, side: Math.ceil(scale * PERCH.canvasLengths), seat: scale * PERCH.seatLengths };
};

export const contactOffset = (facets: Facet[], centreY: number) =>
  centreY -
  Math.max(
    ...facets.filter(({ contact }) => contact).flatMap(({ points }) => points.map(([, y]) => y)),
  );
