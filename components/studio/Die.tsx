const PIPS: [number, number][][] = [
  [[2, 2]],
  [
    [1, 3],
    [3, 1],
  ],
  [
    [1, 3],
    [2, 2],
    [3, 1],
  ],
  [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
  ],
  [
    [1, 1],
    [1, 3],
    [2, 2],
    [3, 1],
    [3, 3],
  ],
  [
    [1, 1],
    [1, 2],
    [1, 3],
    [3, 1],
    [3, 2],
    [3, 3],
  ],
];

export const dieFace = (value: number) => (value % PIPS.length) + 1;

export default function Die({ face, className }: { face: number; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" rx="3" />
      {PIPS[face - 1].map(([column, row]) => (
        <circle key={`${column}${row}`} cx={column * 4} cy={row * 4} r="1.3" />
      ))}
    </svg>
  );
}
