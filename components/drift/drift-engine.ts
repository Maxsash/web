import { createSeaEdition } from "@/lib/sea/edition";
import type { SeaSample } from "@/lib/sea/types";
import { GlResources } from "../observatory/gl-resources";
import { lookAt, multiply, perspective } from "../observatory/matrices";
import { seaLightDirection } from "../observatory/ocean-light";
import {
  compilePrograms,
  flatGrid,
  openSeaContext,
  resizeCanvas,
  seaSurface,
  setWaves,
  solidMesh,
} from "../observatory/sea-gl";
import { cross, normal } from "../observatory/vec3";
import { driftShaders } from "./drift-shaders";
import { buildPageGrid, buildPlank, buildRaft } from "./driftwood-mesh";
import {
  DRIFT_SCENES,
  drifterPose,
  lightningAt,
  type DriftScene,
  type DriftSceneName,
  type Pose,
} from "./scenes";
import { sampleDrift, scaleSwell } from "./whirlpool";

const PAGE_SIZE = [5.2, 7] as const;
const FIRST_MOMENT = 4;
const NARROWEST_SKY_WITH_ORB = 1.1;
const RIDE_DEPTH = -0.04;
const UNIFORMS = [
  "uVP",
  "uModel",
  "uTime",
  "uWaveVectors[0]",
  "uAmplitudes[0]",
  "uEye",
  "uResolution",
  "uReveal",
  "uNight",
  "uLight",
  "uAspect",
  "uTint",
  "uTintAmount",
  "uFlash",
  "uWhirlpool",
  "uTwist",
  "uPose",
  "uSize",
  "uOrb",
];

function floatingMatrix([x, z, yaw]: Pose, swell: SeaSample) {
  const up = normal([-swell.dx * 0.8, 1, -swell.dz * 0.8]);
  const right = normal(cross(up, [Math.cos(yaw), 0, Math.sin(yaw)])),
    along = cross(right, up);
  return new Float32Array([...right, 0, ...up, 0, ...along, 0, x, swell.height + RIDE_DEPTH, z, 1]);
}

function paperScrap(resources: GlResources, gl: WebGL2RenderingContext) {
  const { uv, indices } = buildPageGrid();
  return flatGrid(resources, gl, uv, indices);
}

export function createDriftEngine(
  canvas: HTMLCanvasElement,
  name: DriftSceneName,
  compact = false,
) {
  const scene: DriftScene = DRIFT_SCENES[name];
  const gl = openSeaContext(canvas);
  const resources = new GlResources(gl);
  const programs = compilePrograms(resources, driftShaders(scene));
  const surface = seaSurface(resources, gl, compact);
  const skyArray = resources.vertexArray();
  const page = scene.drifter === "page";
  const drifter = page
    ? paperScrap(resources, gl)
    : solidMesh(resources, gl, scene.drifter === "raft" ? buildRaft() : buildPlank());
  const edition = scaleSwell(createSeaEdition(scene.seed, "2"), scene.swell);
  const u = {
    sea: resources.uniforms(programs.sea, UNIFORMS),
    sky: resources.uniforms(programs.sky, UNIFORMS),
    drifter: resources.uniforms(programs.drifter, UNIFORMS),
  };
  const whirlpool = scene.whirlpool;
  for (const [program, uniforms] of [
    [programs.sea, u.sea],
    [programs.sky, u.sky],
    [programs.drifter, u.drifter],
  ] as const) {
    gl.useProgram(program);
    setWaves(gl, uniforms, edition);
    if (whirlpool) {
      gl.uniform4f(uniforms.uWhirlpool, ...whirlpool.centre, whirlpool.depth, whirlpool.radius);
      gl.uniform1f(uniforms.uTwist, whirlpool.twist);
    }
    gl.uniform3fv(uniforms.uTint, scene.tint?.colour ?? [1, 1, 1]);
    gl.uniform1f(uniforms.uTintAmount, scene.tint?.amount ?? 0);
    gl.uniform1f(uniforms.uReveal, scene.reveal ?? 0);
    gl.uniform1f(uniforms.uNight, scene.night);
    gl.uniform2fv(uniforms.uSize, PAGE_SIZE);
  }
  let aspect = 1,
    frames = 0;
  canvas.dataset.triangles = String(surface.triangles);
  return {
    resize(width: number, height: number, ratio: number) {
      aspect = resizeCanvas(canvas, gl, width, height, ratio);
    },
    draw(elapsed: number) {
      const time = FIRST_MOMENT + elapsed * scene.pace;
      const { eye, target } = scene;
      const vp = multiply(perspective(aspect), lookAt(eye, target));
      const light = seaLightDirection(eye, target, aspect);
      const flash = scene.storm ? lightningAt(time) : 0;
      const pose = drifterPose(scene, time, aspect);
      const shared = (uniforms: typeof u.sea) => {
        gl.uniformMatrix4fv(uniforms.uVP, false, vp);
        gl.uniform1f(uniforms.uTime, time);
        gl.uniform1f(uniforms.uFlash, flash);
        gl.uniform3fv(uniforms.uLight, light);
        gl.uniform3fv(uniforms.uEye, eye);
      };
      gl.clearColor(0.07, 0.16, 0.21, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST);
      gl.useProgram(programs.sky);
      gl.bindVertexArray(skyArray);
      shared(u.sky);
      gl.uniform1f(u.sky.uAspect, aspect);
      gl.uniform1f(u.sky.uOrb, scene.storm || aspect < NARROWEST_SKY_WITH_ORB ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(programs.sea);
      gl.bindVertexArray(surface.array);
      shared(u.sea);
      gl.uniform2f(u.sea.uResolution, canvas.width, canvas.height);
      gl.drawElements(gl.TRIANGLES, surface.count, gl.UNSIGNED_SHORT, 0);
      gl.useProgram(programs.drifter);
      gl.bindVertexArray(drifter.array);
      shared(u.drifter);
      if (page) {
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(-2, -4);
        gl.uniform3fv(u.drifter.uPose, pose);
        gl.drawElements(gl.TRIANGLES, drifter.count, gl.UNSIGNED_SHORT, 0);
        gl.disable(gl.POLYGON_OFFSET_FILL);
      } else {
        const swell = sampleDrift(edition, whirlpool, pose[0], pose[1], time);
        gl.uniformMatrix4fv(u.drifter.uModel, false, floatingMatrix(pose, swell));
        gl.drawArrays(gl.TRIANGLES, 0, drifter.count);
      }
      canvas.dataset.frameCount = String(++frames);
    },
    dispose: () => resources.dispose(),
  };
}
