import type { SeaEdition } from "@/lib/sea/types";
import { cameraAt, seaPointAt } from "./camera";
import { GlResources } from "./gl-resources";
import { lookAt, multiply, perspective } from "./matrices";
import { indiaMoonDay, moonForIndiaDay } from "./moon-phase";
import { seaLightDirection } from "./ocean-light";
import { planetFrameAt } from "./planet-sky";
import { planetFragment, planetVertex } from "./planet-shaders";
import {
  seaVertex,
  seaFragmentSource,
  rippleGLSL,
  skyVertex,
  skyFragmentSource,
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
import { shipPoseAt } from "./ship-motion";
import { placeShip, frameShipDrawing, type ShipComposition } from "./ship-placement";
import { surveyShipVertex, surveyShipFragment, surveyWakeGLSL } from "./ship-shaders";
import { decodeStarCatalogue, starFrameAt, type Star } from "./star-sky";
import { starFragment, starVertex } from "./star-shaders";

export function createOceanEngine(
  canvas: HTMLCanvasElement,
  edition: SeaEdition,
  compact = false,
  onStarsReady?: () => void,
) {
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
    sky: [skyVertex, skyFragmentSource({ moonPhase: true })],
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
    ku = resources.uniforms(sky, ["uReveal", "uNight", "uAspect", "uMoon"]);
  gl.useProgram(sea);
  setWaves(gl, su, edition);
  let aspect = 1,
    frames = 0,
    camera: ReturnType<typeof cameraAt> | null = null,
    ripple: [number, number, number] = [0, 0, -1e4];
  let placement = { x: 4.5, z: -5.5, scale: 1 };
  let framing = cameraAt(1, 1, [0, 0]);
  let moonDay = NaN;
  let previewDay: number | null = null;
  let moon = moonForIndiaDay(indiaMoonDay(Date.now()));
  let catalogue: Star[] | null = null;
  let starCount = 0;
  let starLoadStarted = false;
  let starsProgram: WebGLProgram | null = null;
  let starsVAO: WebGLVertexArrayObject | null = null;
  let starsBuffer: WebGLBuffer | null = null;
  let starsUniforms: ReturnType<GlResources["uniforms"]> | null = null;
  const starsAbort = new AbortController();
  let planetCount = 0;
  let planetsProgram: WebGLProgram | null = null;
  let planetsVAO: WebGLVertexArrayObject | null = null;
  let planetsBuffer: WebGLBuffer | null = null;
  let planetsUniforms: ReturnType<GlResources["uniforms"]> | null = null;
  const refreshPlanets = () => {
    if (!planetsProgram) {
      planetsProgram = resources.program(planetVertex, planetFragment);
      planetsVAO = resources.vertexArray();
      planetsBuffer = resources.buffer(gl.ARRAY_BUFFER, new Float32Array(0));
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
      planetsUniforms = resources.uniforms(planetsProgram, [
        "uAspect",
        "uNight",
        "uReveal",
        "uMoonIllumination",
      ]);
    }
    const frame = planetFrameAt(moonDay);
    gl.bindBuffer(gl.ARRAY_BUFFER, planetsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, frame.points, gl.DYNAMIC_DRAW);
    planetCount = frame.points.length / 4;
    canvas.dataset.planets = frame.names.join(",");
  };
  const refreshStars = () => {
    if (!catalogue) return;
    if (!starsProgram) {
      starsProgram = resources.program(starVertex, starFragment);
      starsVAO = resources.vertexArray();
      starsBuffer = resources.buffer(gl.ARRAY_BUFFER, new Float32Array(0));
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
      starsUniforms = resources.uniforms(starsProgram, [
        "uAspect",
        "uNight",
        "uReveal",
        "uMoonIllumination",
      ]);
    }
    const frame = starFrameAt(moonDay, catalogue);
    gl.bindBuffer(gl.ARRAY_BUFFER, starsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, frame, gl.DYNAMIC_DRAW);
    starCount = frame.length / 4;
    canvas.dataset.starCount = String(starCount);
    canvas.dataset.starDay = String(moonDay);
  };
  const loadStars = () => {
    if (starLoadStarted) return;
    starLoadStarted = true;
    fetch("/stars-hyg-v41.bin", { signal: starsAbort.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Star catalogue unavailable");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (starsAbort.signal.aborted) return;
        catalogue = decodeStarCatalogue(buffer);
        refreshStars();
        onStarsReady?.();
      })
      .catch(() => {
        if (!starsAbort.signal.aborted) canvas.dataset.starCount = "unavailable";
      });
  };
  const refreshMoon = () => {
    const day = previewDay ?? indiaMoonDay(Date.now());
    if (day === moonDay) return false;
    moonDay = day;
    moon = moonForIndiaDay(day);
    canvas.dataset.moonCycle = String(moon.cycle);
    canvas.dataset.moonIllumination = String(moon.illumination);
    refreshStars();
    if (planetsProgram) refreshPlanets();
    return true;
  };
  refreshMoon();
  canvas.dataset.triangles = String(surface.triangles);
  return {
    refreshMoon,
    setPreviewDay(day: number | null) {
      previewDay = day;
      return refreshMoon();
    },
    resize(width: number, height: number, ratio: number, composition?: ShipComposition) {
      aspect = resizeCanvas(canvas, gl, width, height, ratio);
      if (composition) {
        placement = placeShip(composition, model.vertices);
        framing = frameShipDrawing(composition, model.vertices, placement);
      }
    },
    ripple(ndc: [number, number], time: number) {
      const point = camera && seaPointAt(ndc, camera.eye, camera.target, aspect);
      if (point) {
        ripple = [point[0], point[1], time];
        canvas.dataset.rippleCount = String(Number(canvas.dataset.rippleCount ?? 0) + 1);
      }
      return Boolean(point);
    },
    draw(time: number, reveal: number, pointer: [number, number], night = 0) {
      refreshMoon();
      if (night > 0) {
        loadStars();
        if (!planetsProgram) refreshPlanets();
      }
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
      gl.uniform2f(ku.uMoon, moon.illumination, moon.cycle < 0.5 ? 1 : -1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (starCount && starsProgram && starsVAO && starsUniforms && night > 0 && reveal < 0.8) {
        gl.useProgram(starsProgram);
        gl.bindVertexArray(starsVAO);
        gl.uniform1f(starsUniforms.uAspect, aspect);
        gl.uniform1f(starsUniforms.uNight, night);
        gl.uniform1f(starsUniforms.uReveal, reveal);
        gl.uniform1f(starsUniforms.uMoonIllumination, moon.illumination);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.POINTS, 0, starCount);
        gl.disable(gl.BLEND);
      }
      if (
        planetCount &&
        planetsProgram &&
        planetsVAO &&
        planetsUniforms &&
        night > 0 &&
        reveal < 0.8
      ) {
        gl.useProgram(planetsProgram);
        gl.bindVertexArray(planetsVAO);
        gl.uniform1f(planetsUniforms.uAspect, aspect);
        gl.uniform1f(planetsUniforms.uNight, night);
        gl.uniform1f(planetsUniforms.uReveal, reveal);
        gl.uniform1f(planetsUniforms.uMoonIllumination, moon.illumination);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.POINTS, 0, planetCount);
        gl.disable(gl.BLEND);
      }
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
      canvas.dataset.nightBlend = String(night);
      canvas.dataset.frameCount = String(++frames);
    },
    dispose: () => {
      starsAbort.abort();
      resources.dispose();
    },
  };
}
