export function buildSeaGrid(compact: boolean) {
  const nx = compact ? 120 : 200,
    nz = compact ? 90 : 150,
    vertices: number[] = [];
  for (let z = 0; z <= nz; z++)
    for (let x = 0; x <= nx; x++) {
      const u = (x / nx) * 2 - 1,
        v = (z / nz) * 2 - 1;
      vertices.push(
        u * 24 + Math.sign(u) * Math.pow(Math.abs(u), 6) * 150,
        v * 32 + Math.pow(Math.min(v, 0), 3) * 190,
      );
    }
  return { vertices: new Float32Array(vertices), indices: gridIndices(nx, nz), nx, nz };
}

export function gridIndices(nx: number, nz: number) {
  const indices: number[] = [];
  for (let z = 0; z < nz; z++)
    for (let x = 0; x < nx; x++) {
      const a = z * (nx + 1) + x;
      indices.push(a, a + 1, a + nx + 1, a + 1, a + nx + 2, a + nx + 1);
    }
  return new Uint16Array(indices);
}
