export const MEDAL = 520;
export const FACE_RADIUS = 196;

const CENTRE = MEDAL / 2;

export const FACE_INSET = `${(((CENTRE - FACE_RADIUS) / MEDAL) * 100).toFixed(3)}%`;

const point = (radius: number, degrees: number) => {
  const angle = (degrees * Math.PI) / 180;
  const x = CENTRE + radius * Math.sin(angle);
  const y = CENTRE - radius * Math.cos(angle);
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
};

export function tickMarks(inner: number, short: number, long: number, every = 5): string {
  return Array.from({ length: 360 / every }, (_, i) => {
    const degrees = i * every;
    return `M${point(inner, degrees)}L${point(degrees % 30 === 0 ? long : short, degrees)}`;
  }).join("");
}

export const legendArc = (radius: number, over: boolean) =>
  `M${CENTRE - radius} ${CENTRE}A${radius} ${radius} 0 0 ${over ? 1 : 0} ${CENTRE + radius} ${CENTRE}`;
