/** The page turn stays silent until the visitor switches sound on, then plays when entering the notebook.
 * node tools/check-page-turn.mjs [http://localhost:3000]
 */
import { delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const failures = [];
const check = (name, pass, info = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${info ? "  " + info : ""}`);
  if (!pass) failures.push(name);
};

const spy = `window.__turns = [];
const start = AudioBufferSourceNode.prototype.start;
AudioBufferSourceNode.prototype.start = function (...args) {
  if (this.buffer && this.buffer.duration < 2) __turns.push(Number(this.buffer.duration.toFixed(2)));
  return start.apply(this, args);
};`;

await withBrowser({ name: "turn" }, async ({ send, evaluate }) => {
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: spy });

  const click = async (selector) => {
    const point = JSON.parse(
      await evaluate(
        `(() => { const e = document.querySelector(${JSON.stringify(selector)}); e.scrollIntoView({ block: "center", behavior: "instant" }); const r = e.getBoundingClientRect(); return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); })()`,
      ),
    );
    for (const type of ["mousePressed", "mouseReleased"])
      await send("Input.dispatchMouseEvent", { type, ...point, button: "left", clickCount: 1 });
  };
  const waitFor = async (expression) => {
    for (let i = 0; i < 100; i++) {
      if (await evaluate(expression)) return true;
      await delay(60);
    }
    return false;
  };
  const turns = async () => JSON.parse(await evaluate("JSON.stringify(__turns)"));
  const open = async (path) => {
    await send("Page.navigate", { url: new URL(path, base).href });
    await waitFor(
      "document.readyState === 'complete' && Boolean(document.querySelector('nav[aria-label=Studio]'))",
    );
    await delay(500);
  };

  await open("/");
  await click('nav[aria-label="Studio"] a[href="/blog"]');
  check(
    "silent by default",
    (await waitFor("location.pathname === '/blog'")) && (await turns()).length === 0,
  );

  await open("/");
  await click("[data-wave-sound]");
  await waitFor("document.querySelector('[data-wave-sound]').textContent.includes('Mute')");
  await click('nav[aria-label="Studio"] a[href="/blog"]');
  await waitFor("location.pathname === '/blog'");
  await delay(300);
  const entered = await turns();
  check(
    "plays when entering the notebook with sound on",
    entered.length === 1,
    JSON.stringify(entered),
  );
  check("it is a short page turn", entered[0] > 0.5 && entered[0] < 1.2);

  await click('a[href="/blog/three-waves-one-sea"]');
  await waitFor("location.pathname === '/blog/three-waves-one-sea'");
  await delay(300);
  check("plays when opening a note", (await turns()).length === 2);

  await click('a[href="/blog"]');
  await waitFor("location.pathname === '/blog'");
  await delay(300);
  const three = await turns();
  check("plays when turning back", three.length === 3);
  check(
    "never repeats the same variation back to back",
    three[0] !== three[1] && three[1] !== three[2],
    JSON.stringify(three),
  );

  await click('nav[aria-label="Studio"] a[href="/blog"]');
  await delay(400);
  check("silent when already on the page", (await turns()).length === 3);

  await click('a[href="/"]');
  await waitFor("location.pathname === '/'");
  await waitFor("Boolean(document.querySelector('[data-wave-sound]'))");
  await click("[data-wave-sound]");
  await waitFor("document.querySelector('[data-wave-sound]').textContent.includes('Mute')");
  await click("[data-wave-sound]");
  await waitFor("document.querySelector('[data-wave-sound]').textContent.includes('Play')");
  const before = (await turns()).length;
  await click('nav[aria-label="Studio"] a[href="/blog"]');
  await waitFor("location.pathname === '/blog'");
  await delay(400);
  check("silent again after muting", (await turns()).length === before);
});

console.log(
  failures.length ? `\n${failures.length} failed.` : "\nThe page turn follows the sound setting.",
);
process.exitCode = failures.length ? 1 : 0;
