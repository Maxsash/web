import { SEA_GRAVITY } from "@/lib/sea/sample";
import type { SeaEdition } from "@/lib/sea/types";
import type { GlResources } from "./gl-resources";
import { buildSeaGrid } from "./sea-grid";

export function openSeaContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: true,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) throw new Error("Hardware-accelerated WebGL2 is unavailable");
  return gl;
}

export function compilePrograms<Name extends string>(
  resources: GlResources,
  sources: Record<Name, [vertex: string, fragment: string]>,
) {
  try {
    return Object.fromEntries(
      Object.entries<[string, string]>(sources).map(([name, [vertex, fragment]]) => [
        name,
        resources.program(vertex, fragment),
      ]),
    ) as Record<Name, WebGLProgram>;
  } catch (error) {
    resources.dispose();
    throw error;
  }
}

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  ratio: number,
) {
  const nextWidth = Math.max(1, Math.round(width * ratio)),
    nextHeight = Math.max(1, Math.round(height * ratio));
  // Assigning either dimension reallocates the drawing buffer, even when unchanged.
  if (canvas.width !== nextWidth) canvas.width = nextWidth;
  if (canvas.height !== nextHeight) canvas.height = nextHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  return width / height;
}

export function flatGrid(
  resources: GlResources,
  gl: WebGL2RenderingContext,
  vertices: Float32Array,
  indices: Uint16Array,
) {
  const array = resources.vertexArray();
  resources.buffer(gl.ARRAY_BUFFER, vertices);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  resources.buffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  return { array, count: indices.length };
}

export function seaSurface(resources: GlResources, gl: WebGL2RenderingContext, compact: boolean) {
  const grid = buildSeaGrid(compact);
  return {
    ...flatGrid(resources, gl, grid.vertices, grid.indices),
    triangles: grid.nx * grid.nz * 2,
  };
}

export function solidMesh(resources: GlResources, gl: WebGL2RenderingContext, data: Float32Array) {
  const array = resources.vertexArray();
  resources.buffer(gl.ARRAY_BUFFER, data);
  for (let i = 0; i < 4; i++) {
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 48, i * 12);
  }
  return { array, count: data.length / 12 };
}

export function setWaves(
  gl: WebGL2RenderingContext,
  uniforms: Record<string, WebGLUniformLocation | null>,
  edition: SeaEdition,
) {
  const vectors = edition.waves.flatMap((w) => {
    const k = (2 * Math.PI) / w.wavelength;
    return [
      k * Math.cos(w.direction),
      k * Math.sin(w.direction),
      Math.sqrt(SEA_GRAVITY * k),
      w.phase,
    ];
  });
  gl.uniform4fv(uniforms["uWaveVectors[0]"], new Float32Array(vectors));
  gl.uniform1fv(
    uniforms["uAmplitudes[0]"],
    new Float32Array(edition.waves.map((w) => w.amplitude)),
  );
}
