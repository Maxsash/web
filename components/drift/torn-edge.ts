const TEAR_DEPTH = 5;
const FIBRE_DEPTH = 3.2;

function seededSteps(seed: number) {
  let state = seed;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

function tear(seed: number, depth: number) {
  const random = seededSteps(seed);
  const points: string[] = [];
  for (let x = 0; x <= 100; x += 0.8 + random() * 1.6) {
    const y = 100 - depth - random() * TEAR_DEPTH - Math.sin(x / 9) * 2.5;
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  points.push(`100% ${(100 - depth - random() * 4).toFixed(2)}%`);
  return `polygon(0 0, 100% 0, ${points.reverse().join(", ")})`;
}

export const tornEdge = (seed: number) => ({ fibre: tear(seed, 0), face: tear(seed, FIBRE_DEPTH) });
