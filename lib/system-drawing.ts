export type SystemNode = { id: string; label: string; note?: string; span?: 1 | 2 | 4 };
export type SystemDrawing = {
  bands: { label: string; nodes: SystemNode[] }[];
  links: [from: string, to: string][];
};

export type DrawnBox = {
  id: string;
  label: string;
  note?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type DrawnLink = { x1: number; y1: number; x2: number; y2: number };

export const DRAWING_WIDTH = 340;
export const DRAWING_HEIGHT = 330;
const COLUMNS = 4;
export const DRAWING_PAD = 10;
const GUTTER = 8;
const BAND_LABEL = 16;
const ARROW_GAP = 3;
const COLUMN = (DRAWING_WIDTH - 2 * DRAWING_PAD - (COLUMNS - 1) * GUTTER) / COLUMNS;

const boxHeight = (node: SystemNode) => (node.note ? 44 : 28);
const spanWidth = (span: number) => span * COLUMN + (span - 1) * GUTTER;

function placeBand(nodes: SystemNode[], top: number, height: number): DrawnBox[] {
  let column = 0;
  return nodes.map((node) => {
    const span = node.span ?? 2;
    const box = {
      id: node.id,
      label: node.label,
      note: node.note,
      x: DRAWING_PAD + column * (COLUMN + GUTTER),
      y: top + BAND_LABEL + (height - BAND_LABEL - boxHeight(node)) / 2,
      width: spanWidth(span),
      height: boxHeight(node),
    };
    column += span;
    return box;
  });
}

const overlap = (a0: number, a1: number, b0: number, b1: number) =>
  Math.min(a1, b1) - Math.max(a0, b0) > 0 ? (Math.max(a0, b0) + Math.min(a1, b1)) / 2 : null;

function edgePoint(box: DrawnBox, dx: number, dy: number) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const t = Math.min(
    dx ? box.width / 2 / Math.abs(dx) : Infinity,
    dy ? box.height / 2 / Math.abs(dy) : Infinity,
  );
  return { x: cx + dx * t, y: cy + dy * t };
}

function shorten(link: DrawnLink, gap: number): DrawnLink {
  const length = Math.hypot(link.x2 - link.x1, link.y2 - link.y1);
  const ux = (link.x2 - link.x1) / length;
  const uy = (link.y2 - link.y1) / length;
  return {
    x1: link.x1 + ux * gap,
    y1: link.y1 + uy * gap,
    x2: link.x2 - ux * gap,
    y2: link.y2 - uy * gap,
  };
}

export function connect(from: DrawnBox, to: DrawnBox): DrawnLink {
  const x = overlap(from.x, from.x + from.width, to.x, to.x + to.width);
  if (x !== null) {
    const down = to.y > from.y;
    const y1 = down ? from.y + from.height : from.y;
    const y2 = down ? to.y : to.y + to.height;
    return shorten({ x1: x, y1, x2: x, y2 }, ARROW_GAP);
  }
  const y = overlap(from.y, from.y + from.height, to.y, to.y + to.height);
  if (y !== null) {
    const right = to.x > from.x;
    const x1 = right ? from.x + from.width : from.x;
    const x2 = right ? to.x : to.x + to.width;
    return shorten({ x1, y1: y, x2, y2: y }, ARROW_GAP);
  }
  const dx = to.x + to.width / 2 - (from.x + from.width / 2);
  const dy = to.y + to.height / 2 - (from.y + from.height / 2);
  const start = edgePoint(from, dx, dy);
  const end = edgePoint(to, -dx, -dy);
  return shorten({ x1: start.x, y1: start.y, x2: end.x, y2: end.y }, ARROW_GAP);
}

export function layoutDrawing(drawing: SystemDrawing) {
  const bandHeight = (DRAWING_HEIGHT - 2 * DRAWING_PAD) / drawing.bands.length;
  const bands = drawing.bands.map((band, index) => ({
    label: band.label,
    y: DRAWING_PAD + index * bandHeight,
    boxes: placeBand(band.nodes, DRAWING_PAD + index * bandHeight, bandHeight),
  }));
  const boxes = new Map(bands.flatMap((band) => band.boxes).map((box) => [box.id, box]));
  const find = (id: string) => {
    const box = boxes.get(id);
    if (!box) throw new Error(`Unknown node in system drawing: ${id}`);
    return box;
  };
  return {
    width: DRAWING_WIDTH,
    height: DRAWING_HEIGHT,
    bands,
    links: drawing.links.map(([from, to]) => connect(find(from), find(to))),
  };
}
