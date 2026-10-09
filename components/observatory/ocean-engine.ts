import { sampleSea } from "@/lib/sea/sample";
import type { SeaEdition } from "@/lib/sea/types";
import { cameraAt, seaPointAt } from "./camera";
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
import {
  compilePrograms,
  openSeaContext,
  resizeCanvas,
  seaSurface,
  setWaves,
  solidMesh,
} from "./sea-gl";
import { buildShipMesh } from "./ship-mesh";

export function createOceanEngine(canvas: HTMLCanvasElement, edition: SeaEdition, compact = false) {
  const gl = openSeaContext(canvas);
  const resources = new GlResources(gl);
  const { sea, sky, boat } = compilePrograms(resources, {
    sea: [seaVertex, seaFragment],
    sky: [skyVertex, skyFragment],
    boat: [shipVertex, shipFragment],
  });
  const surface = seaSurface(resources, gl, compact);
  const ship = solidMesh(resources, gl, buildShipMesh());
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
    "uRipple",
  ]);
  const bu = resources.uniforms(boat, ["uVP", "uModel", "uReveal", "uNight", "uLight"]),
    ku = resources.uniforms(sky, ["uReveal", "uNight", "uAspect"]);
  gl.useProgram(sea);
  setWaves(gl, su, edition);
  let aspect = 1,
    frames = 0,
    camera: ReturnType<typeof cameraAt> | null = null,
    ripple: [number, number, number] = [0, 0, -1e4];
  canvas.dataset.triangles = String(surface.triangles);
  return {
    resize(width: number, height: number, ratio: number) {
      aspect = resizeCanvas(canvas, gl, width, height, ratio);
    },
    ripple(ndc: [number, number], time: number) {
      const point = camera && seaPointAt(ndc, camera.eye, camera.target, aspect);
      if (point) ripple = [point[0], point[1], time];
      return Boolean(point);
    },
    draw(time: number, reveal: number, pointer: [number, number], night = 0) {
      camera = cameraAt(reveal, aspect, pointer);
      const { eye, target } = camera;
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
      gl.bindVertexArray(surface.array);
      gl.uniformMatrix4fv(su.uVP, false, vp);
      gl.uniform1f(su.uTime, time);
      gl.uniform1f(su.uReveal, reveal);
      gl.uniform1f(su.uNight, night);
      gl.uniform3fv(su.uLight, light);
      gl.uniform3fv(su.uEye, eye);
      gl.uniform2f(su.uResolution, canvas.width, canvas.height);
      gl.uniform3fv(su.uRipple, ripple);
      gl.drawElements(gl.TRIANGLES, surface.count, gl.UNSIGNED_SHORT, 0);
      const swell = sampleSea(edition, 4.5, -5.5, time);
      gl.useProgram(boat);
      gl.bindVertexArray(ship.array);
      gl.uniformMatrix4fv(bu.uVP, false, vp);
      gl.uniformMatrix4fv(bu.uModel, false, modelMatrix(swell.height, swell.dx, swell.dz));
      gl.uniform1f(bu.uReveal, reveal);
      gl.uniform1f(bu.uNight, night);
      gl.uniform3fv(bu.uLight, light);
      gl.drawArrays(gl.TRIANGLES, 0, ship.count);
      canvas.dataset.frameCount = String(++frames);
    },
    dispose: () => resources.dispose(),
  };
}
