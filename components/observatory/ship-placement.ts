import { cameraAt, seaPointAt } from "./camera.ts";
import { lookAt, multiply, perspective } from "./matrices.ts";
import { shipMatrix, type ShipPlacement } from "./ship-motion.ts";
import type { V3 } from "./vec3.ts";

export type ReservedBounds = { left: number; right: number; top: number; bottom: number };
export type CopyBounds = { right: number; bottom: number };
export type ShipComposition = {
  width: number;
  height: number;
  copy: CopyBounds;
  drawing?: CopyBounds;
  reserved?: ReservedBounds[];
  drawingReserved?: ReservedBounds[];
};

function frameFor({ width, height, copy, reserved = [] }: ShipComposition) {
  const portrait = width / height < 0.85;
  const margin = Math.max(20, width * 0.035);
  const available = Math.max(50, width - copy.right - margin * 2);
  const top = copy.bottom + margin + 12;
  let center = portrait ? width * 0.62 : copy.right + margin + available * 0.5;
  let widthLimit = portrait ? width * 0.66 : available * 0.88;
  const floorAt = () =>
    Math.min(
      height * 0.83,
      ...reserved
        .filter(
          (box) =>
            box.top > height * 0.5 &&
            box.left < center + widthLimit / 2 &&
            box.right > center - widthLimit / 2,
        )
        .map((box) => box.top - margin),
    );
  if (portrait && floorAt() - top < 85) {
    center = width * 0.19;
    widthLimit = width * 0.3;
  }
  const floor = floorAt();
  const below = Math.max(35, floor - top);
  const heightLimit = portrait
    ? Math.min(height * 0.21, width * 0.38, below * 0.92)
    : Math.min(height * 0.28, available * 0.65);
  return {
    center,
    bottom: portrait ? top + heightLimit : Math.min(height * 0.72, floor),
    width: widthLimit,
    height: heightLimit,
  };
}

function projectedBounds(
  vertices: Float32Array,
  transform: Float32Array,
  width: number,
  height: number,
) {
  let left = Infinity,
    right = -Infinity,
    top = Infinity,
    bottom = -Infinity;
  for (let i = 0; i < vertices.length; i += 12) {
    const x = vertices[i],
      y = vertices[i + 1],
      z = vertices[i + 2];
    const w = transform[3] * x + transform[7] * y + transform[11] * z + transform[15];
    const px =
      (((transform[0] * x + transform[4] * y + transform[8] * z + transform[12]) / w + 1) * width) /
      2;
    const py =
      ((1 - (transform[1] * x + transform[5] * y + transform[9] * z + transform[13]) / w) *
        height) /
      2;
    left = Math.min(left, px);
    right = Math.max(right, px);
    top = Math.min(top, py);
    bottom = Math.max(bottom, py);
  }
  return { left, right, top, bottom };
}

export function placeShip(composition: ShipComposition, vertices: Float32Array): ShipPlacement {
  const { width, height } = composition,
    aspect = width / height;
  const frame = frameFor(composition);
  const { eye, target } = cameraAt(0, aspect, [0, 0]);
  const vp = multiply(perspective(aspect), lookAt(eye, target));
  const atScreen = (x: number, y: number) =>
    seaPointAt([(x / width) * 2 - 1, 1 - (y / height) * 2], eye, target, aspect) ?? [4.5, -5.5];
  let groundX = frame.center,
    groundY = frame.bottom;
  let point = atScreen(groundX, groundY),
    scale = 1;
  const bounds = () =>
    projectedBounds(
      vertices,
      multiply(vp, shipMatrix({ x: point[0], z: point[1], scale }, 0, 1.12)),
      width,
      height,
    );
  for (let pass = 0; pass < 3; pass++) {
    const box = bounds();
    scale = Math.max(
      0.2,
      Math.min(
        1.7,
        scale *
          Math.min(frame.height / (box.bottom - box.top), frame.width / (box.right - box.left)),
      ),
    );
    const fitted = bounds();
    groundX += frame.center - (fitted.left + fitted.right) / 2;
    groundY += frame.bottom - fitted.bottom;
    point = atScreen(groundX, groundY);
  }
  return { x: point[0], z: point[1], scale };
}

export function frameShipDrawing(
  composition: ShipComposition,
  vertices: Float32Array,
  placement: ShipPlacement,
) {
  const { width, height } = composition,
    aspect = width / height;
  const frame = frameFor({ ...composition, copy: composition.drawing ?? composition.copy });
  const scale = placement.scale;
  let eye: V3 = [placement.x + 10 * scale, 29 * scale, placement.z + 23 * scale];
  let target: V3 = [placement.x, 0, placement.z];
  const model = shipMatrix(placement, 0, 1.12);
  const projection = perspective(aspect);
  const bounds = () =>
    projectedBounds(
      vertices,
      multiply(multiply(projection, lookAt(eye, target)), model),
      width,
      height,
    );
  for (let pass = 0; pass < 4; pass++) {
    const box = bounds();
    const zoom = Math.max(
      (box.bottom - box.top) / frame.height,
      (box.right - box.left) / frame.width,
    );
    eye = eye.map((v, i) => target[i] + (v - target[i]) * zoom) as V3;
    const fitted = bounds();
    const from = seaPointAt(
      [((fitted.left + fitted.right) / 2 / width) * 2 - 1, 1 - (fitted.bottom / height) * 2],
      eye,
      target,
      aspect,
    );
    const to = seaPointAt(
      [(frame.center / width) * 2 - 1, 1 - (frame.bottom / height) * 2],
      eye,
      target,
      aspect,
    );
    if (from && to) {
      const pan: V3 = [from[0] - to[0], 0, from[1] - to[1]];
      eye = eye.map((v, i) => v + pan[i]) as V3;
      target = target.map((v, i) => v + pan[i]) as V3;
    }
  }
  return { eye, target };
}
