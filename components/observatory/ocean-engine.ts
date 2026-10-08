import { SEA_GRAVITY, sampleSea } from "@/lib/sea/sample";
import type { SeaEdition } from "@/lib/sea/types";
import { cameraAt } from "./camera";
import { GlResources } from "./gl-resources";
import { lookAt, modelMatrix, multiply, perspective } from "./matrices";
import { seaLightDirection } from "./ocean-light";
import {
  seaVertex,
  seaFragment,
  skyVertex,
  skyFragment,
  shipVertex,
  shipFragment,
} from "./ocean-shaders";
import { buildSeaGrid } from "./sea-grid";
import { buildShipMesh } from "./ship-mesh";

export function createOceanEngine(canvas: HTMLCanvasElement, edition: SeaEdition, compact = false) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: true,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) throw new Error("Hardware-accelerated WebGL2 is unavailable");
  const resources = new GlResources(gl);
  let sea: WebGLProgram, sky: WebGLProgram, boat: WebGLProgram;
  try {
    sea = resources.program(seaVertex, seaFragment);
    sky = resources.program(skyVertex, skyFragment);
    boat = resources.program(shipVertex, shipFragment);
  } catch (error) {
    resources.dispose();
    throw error;
  }
  const grid = buildSeaGrid(compact);
  const seaVAO = resources.vertexArray();
  resources.buffer(gl.ARRAY_BUFFER, grid.vertices);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  resources.buffer(gl.ELEMENT_ARRAY_BUFFER, grid.indices);
  const boatVAO = resources.vertexArray(),
    boatData = buildShipMesh();
  resources.buffer(gl.ARRAY_BUFFER, boatData);
  for (let i = 0; i < 4; i++) {
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 48, i * 12);
  }
  const skyVAO = resources.vertexArray();
  const su = resources.uniforms(sea, [
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
  const bu = resources.uniforms(boat, ["uVP", "uModel", "uReveal", "uNight", "uLight"]),
    ku = resources.uniforms(sky, ["uReveal", "uNight", "uAspect"]);
  const vectors = new Float32Array(
    edition.waves.flatMap((w) => {
      const k = (2 * Math.PI) / w.wavelength;
      return [
        k * Math.cos(w.direction),
        k * Math.sin(w.direction),
        Math.sqrt(SEA_GRAVITY * k),
        w.phase,
      ];
    }),
  );
  gl.useProgram(sea);
  gl.uniform4fv(su["uWaveVectors[0]"], vectors);
  gl.uniform1fv(su["uAmplitudes[0]"], new Float32Array(edition.waves.map((w) => w.amplitude)));
  let aspect = 1,
    frames = 0;
  canvas.dataset.triangles = String(grid.nx * grid.nz * 2);
  return {
    resize(width: number, height: number, ratio: number) {
      const nextWidth = Math.max(1, Math.round(width * ratio)),
        nextHeight = Math.max(1, Math.round(height * ratio));
      // Assigning either dimension reallocates the drawing buffer, even when unchanged.
      if (canvas.width !== nextWidth) canvas.width = nextWidth;
      if (canvas.height !== nextHeight) canvas.height = nextHeight;
      aspect = width / height;
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(time: number, reveal: number, pointer: [number, number], night = 0) {
      const { eye, target } = cameraAt(reveal, aspect, pointer);
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
      gl.drawElements(gl.TRIANGLES, grid.indices.length, gl.UNSIGNED_SHORT, 0);
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
    dispose: () => resources.dispose(),
  };
}
