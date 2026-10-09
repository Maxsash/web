import { delay } from "../lib/browser.mjs";

const settled =
  "new Promise(resolve=>{let last=-1,still=0;const step=()=>{still=scrollY===last?still+1:0;last=scrollY;if(still>5)resolve(scrollY);else requestAnimationFrame(step);};requestAnimationFrame(step);})";
const click = (selector) => `document.querySelector(${JSON.stringify(selector)}).click()`;
const clickText = (text) =>
  `[...document.querySelectorAll('a')].find(a=>a.textContent.includes(${JSON.stringify(text)})).click()`;

export async function runLinkChecks(ctx) {
  const { evaluate, load, results, send } = ctx;
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await load("/");
  await evaluate(click("header nav a[href='#work']"));
  await delay(80);
  const midway = await evaluate("scrollY");
  await evaluate(settled);
  const workTop = await evaluate(
    "Math.round(document.getElementById('work').getBoundingClientRect().top)",
  );
  results.push({
    name: "section-link-scrolls-smoothly",
    midway,
    workTop,
    pass: midway > 0 && Math.abs(workTop) < 40 && midway < (await evaluate("scrollY")),
  });

  await evaluate(
    "window.__sea=document.querySelector('canvas[data-ocean]');scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})",
  );
  await evaluate(settled);
  const bottom = await evaluate("scrollY");
  await evaluate(clickText("Maxsash Studio ↗"));
  await delay(80);
  const returning = await evaluate("scrollY");
  const top = await evaluate(settled);
  const kept = await evaluate(
    "({sameSea:window.__sea===document.querySelector('canvas[data-ocean]'),path:location.pathname+location.search+location.hash,focus:document.activeElement?.getAttribute('href')})",
  );
  results.push({
    name: "home-link-on-home-scrolls-to-top",
    bottom,
    returning,
    top,
    ...kept,
    pass:
      returning > 0 &&
      returning < bottom &&
      top === 0 &&
      kept.sameSea &&
      kept.path === "/" &&
      kept.focus === "#work",
  });

  await evaluate("document.getElementById('notebook').scrollIntoView({behavior:'instant'})");
  await evaluate(settled);
  await evaluate(click("#notebook a[href='/blog']"));
  for (let i = 0; i < 100 && !(await evaluate("location.pathname==='/blog'")); i++) await delay(20);
  await evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
  const afterLanding = await evaluate("scrollY");
  results.push({
    name: "another-page-opens-at-its-top-instantly",
    afterLanding,
    pass: afterLanding === 0,
  });

  await load("/");
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await evaluate(click("header nav a[href='#work']"));
  await evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
  const jumped = await evaluate(
    "Math.round(document.getElementById('work').getBoundingClientRect().top)",
  );
  results.push({
    name: "reduced-motion-section-link-jumps",
    jumped,
    pass: Math.abs(jumped) < 40,
  });
  await send("Emulation.setEmulatedMedia", { features: [] });
}
