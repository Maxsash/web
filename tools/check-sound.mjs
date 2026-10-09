/** The site's sounds follow the visitor. Nothing plays before the first click, tap or key (browsers
 * require one); after it, every answer sounds (a hover, the dice, the compass, page turns into and
 * within the notebook) while the waves wait for "Play waves". The waves leave with the notebook and
 * come back with the shore. Both choices outlast a reload: the waves resume at the first click, and
 * "Mute sounds" on the shore silences everything until "Unmute sounds".
 * node tools/check-sound.mjs [http://localhost:3000]
 */
import { delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const failures = [];
const check = (name, pass, info = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${info ? "  " + info : ""}`);
  if (!pass) failures.push(name);
};

const spy = `window.__sound = { contexts: 0, starts: [], stops: 0 };
const Context = window.AudioContext;
window.AudioContext = class extends Context {
  constructor(...args) {
    super(...args);
    __sound.contexts++;
    window.__audio = this;
  }
};
const start = AudioBufferSourceNode.prototype.start;
AudioBufferSourceNode.prototype.start = function (...args) {
  __sound.starts.push({ seconds: Number(this.buffer.duration.toFixed(2)), loop: this.loop });
  return start.apply(this, args);
};
const stop = AudioBufferSourceNode.prototype.stop;
AudioBufferSourceNode.prototype.stop = function (...args) {
  if (this.loop) __sound.stops++;
  return stop.apply(this, args);
};`;

await withBrowser({ name: "sound" }, async ({ send, evaluate }) => {
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: spy });

  const pointAt = async (selector) =>
    JSON.parse(
      await evaluate(
        `(() => { const e = document.querySelector(${JSON.stringify(selector)}); e.scrollIntoView({ block: "center", behavior: "instant" }); const r = e.getBoundingClientRect(); return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); })()`,
      ),
    );
  const click = async (selector) => {
    const point = await pointAt(selector);
    for (const type of ["mousePressed", "mouseReleased"])
      await send("Input.dispatchMouseEvent", { type, ...point, button: "left", clickCount: 1 });
  };
  const hover = async (selector) => {
    const point = await pointAt(selector);
    await delay(200);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  };
  const lengthsSince = async (count) =>
    (await sound()).starts.slice(count).map(({ seconds }) => seconds);
  const waitFor = async (expression) => {
    for (let i = 0; i < 100; i++) {
      if (await evaluate(expression)) return true;
      await delay(60);
    }
    return false;
  };
  const sound = async () => JSON.parse(await evaluate("JSON.stringify(__sound)"));
  const played = async (kind) => {
    const { starts } = await sound();
    const matches = {
      turn: ({ seconds }) => seconds >= 0.8 && seconds <= 0.95,
      waves: ({ loop }) => loop,
      detent: ({ seconds }) => seconds <= 0.02,
    }[kind];
    return starts.filter(matches).map(({ seconds }) => seconds);
  };
  const label = () => evaluate("document.querySelector('[data-wave-sound]').textContent");
  const open = async (path) => {
    await send("Page.navigate", { url: new URL(path, base).href });
    await waitFor(
      "document.readyState === 'complete' && Boolean(document.querySelector('nav[aria-label=Studio]'))",
    );
    await delay(500);
  };
  const turnTheDial = async () => {
    await evaluate("document.getElementById('about').scrollIntoView({ behavior: 'instant' })");
    await waitFor("Boolean(document.querySelector('#about [data-engraved]'))");
    await evaluate("scrollBy(0, -400)");
    await delay(200);
    for (let step = 0; step < 30; step++) {
      await evaluate("scrollBy(0, 30)");
      await delay(40);
    }
    await delay(200);
  };

  await open("/");
  await turnTheDial();
  await hover("#about a[href]");
  check("nothing plays before the first click, tap or key", (await sound()).contexts === 0);

  await click("h1");
  await waitFor("__audio?.state === 'running'");
  await delay(300);
  check(
    "the first click opens the sounds, never the waves",
    (await sound()).contexts === 1 &&
      (await played("waves")).length === 0 &&
      (await label()) === "Play waves",
  );

  await waitFor("__audio.currentTime > 0.5");
  await turnTheDial();
  const ticks = await played("detent");
  check("the compass ticks as its ring turns", ticks.length >= 8, `${ticks.length} clicks`);

  let heard = (await sound()).starts.length;
  await hover("#about a[href]");
  await delay(200);
  check(
    "a hover ticks",
    (await lengthsSince(heard)).includes(0.03),
    `${await lengthsSince(heard)}`,
  );
  heard = (await sound()).starts.length;
  await click('#sea-studio [data-press="dice"]');
  await delay(300);
  check(
    "the dice rattle",
    (await lengthsSince(heard)).includes(0.6),
    `${await lengthsSince(heard)}`,
  );

  await click("[data-wave-sound]");
  check(
    "Play waves starts the waves",
    (await waitFor("document.querySelector('[data-wave-sound]').textContent === 'Mute waves'")) &&
      (await waitFor("__sound.starts.some(({ loop }) => loop)")),
  );
  check(
    "and remembers the choice",
    await evaluate("localStorage.getItem('studio-wave-sound') === 'on'"),
  );

  await click('nav[aria-label="Studio"] a[href="/blog"]');
  await waitFor("location.pathname === '/blog'");
  await delay(300);
  const entered = await played("turn");
  check("a page turns on the way into the notebook", entered.length === 1, JSON.stringify(entered));
  check("the waves leave with the shore", (await sound()).stops === 1);

  await click('a[href="/blog/three-waves-one-sea"]');
  await waitFor("location.pathname === '/blog/three-waves-one-sea'");
  await delay(300);
  check("plays when opening a note", (await played("turn")).length === 2);

  const go = async (step, path) => {
    await evaluate(`history.${step}()`);
    await waitFor(`location.pathname === '${path}'`);
    await delay(300);
  };
  await go("back", "/blog");
  await go("forward", "/blog/three-waves-one-sea");
  check("the browser's back and forward turn pages too", (await played("turn")).length === 4);

  await click('a[href="/blog"]');
  await waitFor("location.pathname === '/blog'");
  await delay(300);
  const turns = await played("turn");
  check("plays when turning back", turns.length === 5);
  check(
    "never repeats the same variation back to back",
    turns.every((turn, i) => i === 0 || turn !== turns[i - 1]),
    JSON.stringify(turns),
  );

  await click('nav[aria-label="Studio"] a[href="/blog"]');
  await delay(400);
  check("silent when already on the page", (await played("turn")).length === 5);

  await click('a[href="/"]');
  await waitFor("location.pathname === '/'");
  await waitFor("Boolean(document.querySelector('[data-wave-sound]'))");
  check(
    "the waves come back with the shore, without another click",
    (await waitFor("__sound.starts.filter(({ loop }) => loop).length === 2")) &&
      (await label()) === "Mute waves" &&
      (await sound()).contexts === 1,
  );

  await go("back", "/blog");
  const backIn = (await played("turn")).length;
  await go("forward", "/");
  check(
    "back into the notebook turns a page, forward to the shore brings the waves",
    backIn === 6 &&
      (await played("turn")).length === 6 &&
      (await waitFor("__sound.starts.filter(({ loop }) => loop).length === 3")),
  );

  await open("/");
  check(
    "after a reload, a remembered choice waits for the visitor",
    (await sound()).contexts === 0 && (await label()) === "Play waves",
  );
  await click("h1");
  check(
    "and the waves resume at their first click",
    (await waitFor("document.querySelector('[data-wave-sound]').textContent === 'Mute waves'")) &&
      (await waitFor("__sound.starts.some(({ loop }) => loop)")),
  );

  await open("/");
  await click("[data-wave-sound]");
  check(
    "a first click on Play waves plays rather than mutes",
    (await waitFor("document.querySelector('[data-wave-sound]').textContent === 'Mute waves'")) &&
      (await evaluate("localStorage.getItem('studio-wave-sound') === 'on'")),
  );

  await click("[data-wave-sound]");
  await waitFor("document.querySelector('[data-wave-sound]').textContent === 'Play waves'");
  heard = (await sound()).starts.length;
  await hover("#about a[href]");
  await delay(200);
  check(
    "muting the waves keeps every other sound",
    (await lengthsSince(heard)).includes(0.03),
    `${await lengthsSince(heard)}`,
  );

  await click("[data-sounds]");
  await waitFor("document.querySelector('[data-sounds]').textContent === 'Unmute sounds'");
  const before = await sound();
  await turnTheDial();
  await hover("#about a[href]");
  await click('nav[aria-label="Studio"] a[href="/blog"]');
  await waitFor("location.pathname === '/blog'");
  await delay(400);
  const after = await sound();
  check(
    "Mute sounds silences everything",
    after.starts.length === before.starts.length &&
      (await evaluate("localStorage.getItem('studio-sound') === 'off'")),
    `${after.starts.length - before.starts.length} sounds`,
  );

  await open("/");
  await click("h1");
  await delay(400);
  check(
    "muting outlasts a reload, and a click does not undo it",
    (await sound()).contexts === 0 &&
      (await label()) === "Play waves" &&
      (await evaluate("document.querySelector('[data-sounds]').textContent === 'Unmute sounds'")),
  );

  await click("[data-sounds]");
  await waitFor("document.querySelector('[data-sounds]').textContent === 'Mute sounds'");
  await delay(300);
  check(
    "Unmute sounds answers with a press and leaves the waves off",
    (await played("waves")).length === 0 &&
      (await label()) === "Play waves" &&
      (await sound()).starts.some(({ seconds }) => seconds === 0.12),
    `${await lengthsSince(0)}`,
  );
});

console.log(failures.length ? `\n${failures.length} failed.` : "\nThe sounds follow the visitor.");
process.exitCode = failures.length ? 1 : 0;
