import { createSeaEdition } from "../../lib/sea/edition.ts";
import { fieldGLSL } from "../../components/observatory/ocean-shaders.ts";
import { probeSeaGPU } from "../sea-gpu-probe.mjs";
import { sampleSea } from "../../lib/sea/sample.ts";

export async function runShaderParity(ctx) {
  const { evaluate, results } = ctx;
  // Version 1's default and version 2's roughest preset: the shader must agree with the CPU for both.
  const coordinates = Array.from({ length: 64 }, (_, i) => [-19 + i * 0.59, 13 - i * 0.37]),
    times = [0, 1.25, 97.4];
  let maximumError = 0;
  for (const edition of [createSeaEdition(), createSeaEdition("f532e107", "2")]) {
    const gpuSamples = await evaluate(
      "(" +
        probeSeaGPU.toString() +
        ")(" +
        JSON.stringify({ fieldGLSL, edition, coordinates, times }) +
        ")",
    );
    times.forEach((t, j) =>
      coordinates.forEach(([x, z], i) => {
        const s = sampleSea(edition, x, z, t);
        [s.height, s.dx, s.dz].forEach(
          (v, k) => (maximumError = Math.max(maximumError, Math.abs(v - gpuSamples[j][i * 3 + k]))),
        );
      }),
    );
  }
  results.push({
    name: "gpu-cpu-field-parity",
    samples: 384,
    editions: ["v1 5ea5cafe", "v2 f532e107"],
    maximumError,
    tolerance: 0.0002,
    pass: maximumError < 0.0002,
  });
}
