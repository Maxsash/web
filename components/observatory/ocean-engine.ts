import type { SeaEdition } from "@/lib/sea/types";
import { cameraAt, seaPointAt } from "./camera";
import { GlResources } from "./gl-resources";
import { lookAt, multiply, perspective } from "./matrices";
import { seaLightDirection } from "./ocean-light";
import { seaVertex, seaFragmentSource, rippleGLSL, skyVertex, skyFragment } from "./ocean-shaders";
import {
  compilePrograms,
  openSeaContext,
  resizeCanvas,
  seaSurface,
  setWaves,
  solidMesh,
} from "./sea-gl";
import { buildShipMesh } from "./ship-mesh";
import { shipPoseAt } from "./ship-motion";
import { placeShip, frameShipDrawing, type ShipComposition } from "./ship-placement";
import { surveyShipVertex, surveyShipFragment, surveyWakeGLSL } from "./ship-shaders";

export function createOceanEngine(canvas: HTMLCanvasElement, edition: SeaEdition, compact = false) {
  const gl = openSeaContext(canvas);
  const resources = new GlResources(gl);
  const { sea, sky, boat } = compilePrograms(resources, {
    sea: [
      seaVertex,
      seaFragmentSource({
        declarations: "uniform vec3 uRipple;\nuniform vec4 uShip;",
        surface: surveyWakeGLSL + rippleGLSL,
      }),
    ],
    sky: [skyVertex, skyFragment],
    boat: [surveyShipVertex, surveyShipFragment],
  });
  const surface = seaSurface(resources, gl, compact);
  const model = buildShipMesh();
  const ship = solidMesh(resources, gl, model.vertices);
  resources.buffer(gl.ARRAY_BUFFER, model.flex);
  gl.enableVertexAttribArray(4);
  gl.vertexAttribPointer(4, 3, gl.FLOAT, false, 0, 0);
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
    "uShip",
  ]);
  const bu = resources.uniforms(boat, ["uVP", "uModel", "uReveal", "uNight", "uLight", "uTime"]),
    ku = resources.uniforms(sky, ["uReveal", "uNight", "uAspect"]);
  gl.useProgram(sea);
  setWaves(gl, su, edition);
  let aspect = 1,
    frames = 0,
    camera: ReturnType<typeof cameraAt> | null = null,
    ripple: [number, number, number] = [0, 0, -1e4];
  let placement = { x: 4.5, z: -5.5, scale: 1 };
  let framing = cameraAt(1, 1, [0, 0]);
  canvas.dataset.triangles = String(surface.triangles);
  return {
    resize(width: number, height: number, ratio: number, composition?: ShipComposition) {
      aspect = resizeCanvas(canvas, gl, width, height, ratio);
      if (composition) {
        placement = placeShip(composition, model.vertices);
        framing = frameShipDrawing(composition, model.vertices, placement);
      }
    },
    ripple(ndc: [number, number], time: number) {
      const point = camera && seaPointAt(ndc, camera.eye, camera.target, aspect);
      if (point) ripple = [point[0], point[1], time];
      return Boolean(point);
    },
    draw(time: number, reveal: number, pointer: [number, number], night = 0) {
      camera = cameraAt(reveal, aspect, pointer, framing);
      const { eye, target } = camera;
      const vp = multiply(perspective(aspect), lookAt(eye, target));
      const light = seaLightDirection(eye, target, aspect);
      const pose = shipPoseAt(edition, time, placement);
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
      gl.uniform4f(su.uShip, pose.x, pose.z, pose.yaw, placement.scale);
      gl.drawElements(gl.TRIANGLES, surface.count, gl.UNSIGNED_SHORT, 0);
      gl.useProgram(boat);
      gl.bindVertexArray(ship.array);
      gl.uniformMatrix4fv(bu.uVP, false, vp);
      gl.uniformMatrix4fv(bu.uModel, false, pose.matrix);
      gl.uniform1f(bu.uTime, time);
      gl.uniform1f(bu.uReveal, reveal);
      gl.uniform1f(bu.uNight, night);
      gl.uniform3fv(bu.uLight, light);
      gl.drawArrays(gl.TRIANGLES, 0, ship.count);
      canvas.dataset.frameCount = String(++frames);
    },
    dispose: () => resources.dispose(),
  };
}
