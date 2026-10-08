import { SEA_HALF_FOV, seaLightDirection } from "./ocean-light";
import { sampleSea, type SeaEdition } from "@/lib/sea-edition";
import {
  seaVertex,
  seaFragment,
  skyVertex,
  skyFragment,
  shipVertex,
  shipFragment,
} from "./ocean-shaders";

type V3 = [number, number, number];
const normal = (v: V3): V3 => {
  const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n) as V3;
};
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function multiply(a: Float32Array, b: Float32Array) {
  const result = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) result[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return result;
}
function perspective(aspect: number) {
  const f = 1 / Math.tan(SEA_HALF_FOV),
    near = 0.1,
    far = 450;
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ]);
}
function lookAt(eye: V3, target: V3) {
  const z = normal(eye.map((v, i) => v - target[i]) as V3),
    x = normal(cross([0, 1, 0], z)),
    y = cross(z, x);
  return new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -dot(x, eye),
    -dot(y, eye),
    -dot(z, eye),
    1,
  ]);
}
function modelMatrix(height: number, dx: number, dz: number) {
  const up = normal([-dx * 0.6, 1, -dz * 0.6]),
    forward = normal([0.85, 0, -0.53]);
  const right = normal(cross(up, forward)),
    along = cross(right, up);
  return new Float32Array([
    right[0],
    right[1],
    right[2],
    0,
    up[0],
    up[1],
    up[2],
    0,
    along[0],
    along[1],
    along[2],
    0,
    4.5,
    height - 0.11,
    -5.5,
    1,
  ]);
}

function boatMesh() {
  const output: number[] = [];
  const triangle = (a: V3, b: V3, c: V3, color: V3) => {
    const n = normal(cross(b.map((v, i) => v - a[i]) as V3, c.map((v, i) => v - a[i]) as V3));
    [a, b, c].forEach((p, i) =>
      output.push(...p, ...n, ...color, ...[0, 1, 2].map((j) => Number(i === j))),
    );
  };
  const hull: V3 = [0.39, 0.22, 0.12],
    deck: V3 = [0.84, 0.78, 0.63],
    sail: V3 = [0.94, 0.91, 0.78];
  const rows: V3[][] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16,
      z = (t - 0.5) * 3.6,
      width = 0.64 * Math.pow(Math.sin(Math.PI * t), 0.6) + 0.035;
    rows.push(
      Array.from({ length: 9 }, (_, j) => {
        const a = (j / 8) * Math.PI;
        return [Math.cos(a) * width, 0.14 - Math.sin(a) * 0.52, z] as V3;
      }),
    );
  }
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 8; j++) {
      triangle(rows[i][j], rows[i + 1][j], rows[i][j + 1], hull);
      triangle(rows[i][j + 1], rows[i + 1][j], rows[i + 1][j + 1], hull);
    }
  for (let i = 0; i < 16; i++) {
    triangle(rows[i][0], rows[i][8], rows[i + 1][0], deck);
    triangle(rows[i + 1][0], rows[i][8], rows[i + 1][8], deck);
  }
  // A curved mast and two ruled sail surfaces; no model or texture download.
  for (let i = 0; i < 24; i++)
    for (let j = 0; j < 6; j++) {
      const mast = (u: number, v: number): V3 => [
        Math.sin(u * 1.3) * 0.09 + Math.cos(v) * 0.035,
        0.15 + u * 3.4,
        Math.sin(v) * 0.035,
      ];
      const a = mast(i / 24, (j * Math.PI) / 3),
        b = mast((i + 1) / 24, (j * Math.PI) / 3),
        c = mast(i / 24, ((j + 1) * Math.PI) / 3),
        d = mast((i + 1) / 24, ((j + 1) * Math.PI) / 3);
      triangle(a, b, c, deck);
      triangle(c, b, d, deck);
    }
  for (const side of [-1, 1]) {
    const n = 10;
    const point = (i: number, j: number): V3 => {
      const u = i / n,
        v = j / n;
      return [
        Math.sin(v * Math.PI) * 0.28 * (1 - u) + 0.045,
        0.35 + u * 3.1,
        side * v * (1 - u) * (side === 1 ? 1.55 : 1.2),
      ];
    };
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        triangle(point(i, j), point(i + 1, j), point(i, j + 1), sail);
        triangle(point(i, j + 1), point(i + 1, j), point(i + 1, j + 1), sail);
      }
  }
  return new Float32Array(output);
}

/** Three draws, no textures/FBOs/post-processing; dispose all owned GPU objects. */
export function createOceanEngine(canvas: HTMLCanvasElement, edition: SeaEdition, compact = false) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: true,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL2 is unavailable");
  const programs: WebGLProgram[] = [],
    buffers: WebGLBuffer[] = [],
    arrays: WebGLVertexArrayObject[] = [];
  const program = (vs: string, fs: string) => {
    const p = gl.createProgram()!;
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vs],
      [gl.FRAGMENT_SHADER, fs],
    ] as const) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      gl.attachShader(p, s);
      gl.deleteShader(s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      throw new Error(message || "Shader could not link");
    }
    programs.push(p);
    return p;
  };
  let sea: WebGLProgram, sky: WebGLProgram, boat: WebGLProgram;
  try {
    sea = program(seaVertex, seaFragment);
    sky = program(skyVertex, skyFragment);
    boat = program(shipVertex, shipFragment);
  } catch (error) {
    programs.forEach((p) => gl.deleteProgram(p));
    throw error;
  }
  const vao = () => {
    const a = gl.createVertexArray()!;
    arrays.push(a);
    gl.bindVertexArray(a);
    return a;
  };
  const buffer = (target: number, data: Float32Array | Uint16Array) => {
    const b = gl.createBuffer()!;
    buffers.push(b);
    gl.bindBuffer(target, b);
    gl.bufferData(target, data, gl.STATIC_DRAW);
  };
  const seaVAO = vao(),
    nx = compact ? 120 : 200,
    nz = compact ? 90 : 150,
    vertices: number[] = [],
    indices: number[] = [];
  for (let z = 0; z <= nz; z++)
    for (let x = 0; x <= nx; x++) {
      const u = (x / nx) * 2 - 1,
        v = (z / nz) * 2 - 1;
      vertices.push(
        u * 24 + Math.sign(u) * Math.pow(Math.abs(u), 6) * 150,
        v * 32 + Math.pow(Math.min(v, 0), 3) * 190,
      );
    }
  for (let z = 0; z < nz; z++)
    for (let x = 0; x < nx; x++) {
      const a = z * (nx + 1) + x;
      indices.push(a, a + 1, a + nx + 1, a + 1, a + nx + 2, a + nx + 1);
    }
  buffer(gl.ARRAY_BUFFER, new Float32Array(vertices));
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  buffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
  const boatVAO = vao(),
    boatData = boatMesh();
  buffer(gl.ARRAY_BUFFER, boatData);
  for (let i = 0; i < 4; i++) {
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 48, i * 12);
  }
  const skyVAO = vao();
  const locations = (p: WebGLProgram, names: string[]) =>
    Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)]));
  const su = locations(sea, [
    "uVP",
    "uTime",
    "uWaveVectors[0]",
    "uAmplitudes[0]",
    "uEye",
    "uResolution",
    "uReveal",
    "uNight",
    "uLight",
  ]);
  const bu = locations(boat, ["uVP", "uModel", "uReveal", "uNight", "uLight"]),
    ku = locations(sky, ["uReveal", "uNight", "uAspect"]);
  const vectors = new Float32Array(
    edition.waves.flatMap((w) => {
      const k = (2 * Math.PI) / w.wavelength;
      return [k * Math.cos(w.direction), k * Math.sin(w.direction), Math.sqrt(9.81 * k), w.phase];
    }),
  );
  gl.useProgram(sea);
  gl.uniform4fv(su["uWaveVectors[0]"], vectors);
  gl.uniform1fv(su["uAmplitudes[0]"], new Float32Array(edition.waves.map((w) => w.amplitude)));
  let aspect = 1,
    frames = 0;
  canvas.dataset.triangles = String(nx * nz * 2);
  return {
    resize(width: number, height: number, ratio: number) {
      const nextWidth = Math.max(1, Math.round(width * ratio)),
        nextHeight = Math.max(1, Math.round(height * ratio));
      // Assigning either dimension clears/reallocates the drawing buffer, even if unchanged.
      if (canvas.width !== nextWidth) canvas.width = nextWidth;
      if (canvas.height !== nextHeight) canvas.height = nextHeight;
      aspect = width / height;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(time: number, reveal: number, pointer: [number, number], night = 0) {
      const orbit = reveal * reveal * (3 - 2 * reveal),
        narrow = aspect < 0.8;
      const eye: V3 = [
        mix(0, 10, orbit) + pointer[0] * 0.75,
        mix(narrow ? 6.8 : 5, 29, orbit) + pointer[1] * 0.35,
        mix(narrow ? 24 : 18, 16, orbit),
      ];
      const target: V3 = [mix(narrow ? 2.5 : 0, 0, orbit), mix(0.6, -0.4, orbit), -7];
      const vp = multiply(perspective(aspect), lookAt(eye, target));
      const light = seaLightDirection(eye, target, aspect);
      gl.clearColor(0.07, 0.16, 0.21, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST);
      gl.useProgram(sky);
      gl.bindVertexArray(skyVAO);
      gl.uniform1f(ku.uReveal, reveal);
      gl.uniform1f(ku.uNight, night);
      gl.uniform1f(ku.uAspect, aspect);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(sea);
      gl.bindVertexArray(seaVAO);
      gl.uniformMatrix4fv(su.uVP, false, vp);
      gl.uniform1f(su.uTime, time);
      gl.uniform1f(su.uReveal, reveal);
      gl.uniform1f(su.uNight, night);
      gl.uniform3fv(su.uLight, light);
      gl.uniform3fv(su.uEye, eye);
      gl.uniform2f(su.uResolution, canvas.width, canvas.height);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      const surface = sampleSea(edition, 4.5, -5.5, time);
      gl.useProgram(boat);
      gl.bindVertexArray(boatVAO);
      gl.uniformMatrix4fv(bu.uVP, false, vp);
      gl.uniformMatrix4fv(bu.uModel, false, modelMatrix(surface.height, surface.dx, surface.dz));
      gl.uniform1f(bu.uReveal, reveal);
      gl.uniform1f(bu.uNight, night);
      gl.uniform3fv(bu.uLight, light);
      gl.drawArrays(gl.TRIANGLES, 0, boatData.length / 12);
      canvas.dataset.frameCount = String(++frames);
    },
    dispose() {
      buffers.forEach((b) => gl.deleteBuffer(b));
      arrays.forEach((a) => gl.deleteVertexArray(a));
      programs.forEach((p) => gl.deleteProgram(p));
    },
  };
}
