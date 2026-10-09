import type { CSSProperties } from "react";
import { DRAWING_PAD, layoutDrawing, type SystemDrawing } from "@/lib/system-drawing";
import styles from "./Work.module.css";

type Props = { id: string; drawing: SystemDrawing; alt: string };

const inOrder = (order: number) => ({ "--order": order }) as CSSProperties;

export default function SystemPlate({ id, drawing, alt }: Props) {
  const { width, height, bands, links } = layoutDrawing(drawing);
  const arrow = `${id}-arrow`;
  const boxes = bands.flatMap((band) => band.boxes);
  return (
    <svg
      className={styles.system}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={alt}
      data-arrive
      data-arrive-cue="drawing"
    >
      <defs>
        <marker
          id={arrow}
          viewBox="0 0 6 6"
          refX="5"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 6 3 0 6Z" />
        </marker>
      </defs>
      {bands.map((band, index) => (
        <g key={band.label} className={styles.band}>
          {index > 0 && <line x1={0} x2={width} y1={band.y} y2={band.y} />}
          <text x={DRAWING_PAD} y={band.y + 11}>
            {band.label.toUpperCase()}
          </text>
        </g>
      ))}
      {links.map((link, index) => (
        <line
          key={`${link.x1},${link.y1},${link.x2},${link.y2}`}
          className={styles.link}
          style={inOrder(boxes.length + index)}
          {...link}
          pathLength={1}
          markerEnd={`url(#${arrow})`}
        />
      ))}
      {boxes.map((box, index) => (
        <g key={box.id} className={styles.node} style={inOrder(index)}>
          <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={2} />
          <text className={styles.label} x={box.x + box.width / 2} y={box.y + (box.note ? 19 : 18)}>
            {box.label}
          </text>
          {box.note && (
            <text className={styles.note} x={box.x + box.width / 2} y={box.y + 34}>
              {box.note.toUpperCase()}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
