/** A device that can only render WebGL in software must get the static field plate.
 * node tools/check-software-fallback.mjs [http://localhost:3000]
 */
import { NO_GPU_FLAGS, delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const failures = [];
const check = (name, pass, info = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${info ? "  " + info : ""}`);
  if (!pass) failures.push(name);
};

const viewports = [
  { name: "desktop", width: 1350, height: 940, mobile: false },
  { name: "phone", width: 412, height: 823, mobile: true },
];

await withBrowser({ name: "software", flags: NO_GPU_FLAGS }, async ({ send, evaluate }) => {
  await send("Page.enable");
  for (const { name, width, height, mobile } of viewports) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
    await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
    await send("Page.navigate", { url: new URL("/", base).href });
    await delay(3500);
    const state = JSON.parse(
      await evaluate(`JSON.stringify({
        renderer: document.querySelector('canvas[data-ocean]')?.dataset.renderer,
        rendering: document.querySelector('[data-observatory]')?.dataset.rendering,
        draws: document.querySelector('canvas[data-ocean]')?.dataset.frameCount ?? null,
        plate: getComputedStyle(document.querySelector('[data-observatory] svg')).visibility,
        heading: document.querySelector('h1')?.textContent,
        pauseDisabled: document.querySelector('[data-hero-pause]')?.disabled,
      })`),
    );
    check(`${name}: software rendering falls back`, state.renderer === "fallback", state.renderer);
    check(`${name}: scene is marked as fallback`, state.rendering === "fallback", state.rendering);
    check(`${name}: nothing was drawn`, state.draws === null, String(state.draws));
    check(`${name}: the static plate stays visible`, state.plate === "visible", state.plate);
    check(`${name}: the page stays readable`, Boolean(state.heading?.includes("Sea.")));
    check(`${name}: the pause button is disabled`, state.pauseDisabled === true);
  }
});

console.log(
  failures.length ? `\n${failures.length} failed.` : "\nSoftware rendering falls back cleanly.",
);
process.exitCode = failures.length ? 1 : 0;
