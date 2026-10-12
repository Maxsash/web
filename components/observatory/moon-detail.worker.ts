import { renderMoonSurface, type MoonSurfaceRequest } from "./moon-detail";

async function shadeMoon({ map, phase, size }: MoonSurfaceRequest) {
  const bitmap = await createImageBitmap(map);
  try {
    const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d", {
      willReadFrequently: true,
    });
    if (!context) throw new Error("Lunar map context unavailable");
    context.drawImage(bitmap, 0, 0);
    return renderMoonSurface(context.getImageData(0, 0, bitmap.width, bitmap.height), phase, size);
  } finally {
    bitmap.close();
  }
}

addEventListener("message", async ({ data }: MessageEvent<MoonSurfaceRequest>) => {
  try {
    const surface = await shadeMoon(data);
    postMessage(surface, { transfer: [surface.buffer] });
  } catch {
    postMessage(null);
  }
});
