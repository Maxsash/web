/** Keyboard-only review in isolated headless Chrome. No npm dependencies.
 * node tools/check-keyboard.mjs [http://localhost:3000]
 * Sends real key events: sweeps Tab and Shift+Tab on the pages and checks that
 * every stop has a visible focus indicator, is on screen, is not covered by
 * another element (for example the pinned phone drawing), and is at least
 * 24 px; then drives the main controls with Enter, Space and the arrow keys.
 * This is not a screen-reader test and does not replace one.
 */
import { SOFTWARE_GL_FLAGS, delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const results = [];
const record = (name, pass, info) => {
  results.push({ name, pass, info });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${info ? "  " + info : ""}`);
};

await withBrowser(
  { name: "keys", flags: SOFTWARE_GL_FLAGS },
  async ({ send, evaluate, pressKey }) => {
    await send("Page.enable");

    const load = async (path, width, height, mobile = false) => {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
      });
      await send("Page.navigate", { url: new URL(path, base).href });
      await delay(3500);
    };
    const press = async (name, modifiers = 0) => {
      await pressKey(name, modifiers);
      await delay(130);
    };
    const type = async (text) => {
      for (const ch of text) {
        await send("Input.dispatchKeyEvent", { type: "keyDown", key: ch, text: ch });
        await send("Input.dispatchKeyEvent", { type: "keyUp", key: ch });
      }
      await delay(150);
    };

    const probe = `(()=>{const e=document.activeElement;if(!e||e===document.body)return null;if(e.tagName==='NEXTJS-PORTAL')return {dev:true};
    const r=e.getBoundingClientRect(),cs=getComputedStyle(e);
    const cx=Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),cy=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2));
    const top=document.elementFromPoint(cx,cy);
    return {name:(e.getAttribute('aria-label')||e.innerText||e.id||'').trim().replace(/\\s+/g,' ').slice(0,40),
     indicator:(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=='none',
     covered:!(top&&(top===e||e.contains(top)||top.contains(e))),
     onScreen:r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth,
     small:r.width<24||r.height<24};})()`;

    const sweep = async (label, path, width, height, mobile, backwards, steps) => {
      await load(path, width, height, mobile);
      const problems = [];
      let stops = 0;
      for (let i = 0; i < steps; i++) {
        await press("Tab", backwards ? 8 : 0);
        const p = await evaluate(probe);
        if (!p || p.dev) continue;
        stops++;
        const bad = [
          !p.indicator && "no focus indicator",
          p.covered && "covered",
          !p.onScreen && "off screen",
          p.small && "under 24px",
        ].filter(Boolean);
        if (bad.length) problems.push(`${p.name || "(unnamed)"}: ${bad.join(", ")}`);
      }
      record(
        `tab sweep ${label}`,
        problems.length === 0 && stops > 5,
        `${stops} stops${problems.length ? "; " + problems.slice(0, 4).join(" | ") : ""}`,
      );
    };

    const seed = "/?seed=70806d5e&version=2";
    await sweep("home desktop forward", seed, 1280, 800, false, false, 50);
    await sweep("home desktop backward", seed, 1280, 800, false, true, 50);
    await sweep("home phone forward", seed, 390, 844, true, false, 50);
    await sweep("home phone backward (sticky drawing)", seed, 390, 844, true, true, 50);
    await sweep("notebook", "/blog", 1280, 800, false, false, 14);
    await sweep("essay", "/blog/three-waves-one-sea", 1280, 800, false, false, 14);
    await sweep("print page", "/plate?seed=f532e107&version=2", 1280, 800, false, false, 8);

    // Tab order: the hero's own controls follow the site navigation.
    await load(seed, 1280, 800);
    const order = [];
    for (let i = 0; i < 9; i++) {
      await press("Tab");
      order.push(
        await evaluate("document.activeElement.innerText.trim().replace(/\\s+/g,' ').slice(0,24)"),
      );
    }
    record(
      "hero tab order: skip, brand, nav, then controls",
      order[0].startsWith("Skip") &&
        order[1] === "Maxsash Studio" &&
        order.slice(2, 6).join() === "Work,Sea studio,Notebook,Elsewhere",
      order.join(" > "),
    );

    // Operation.
    await load(seed, 1280, 800);
    const focus = (selector) =>
      evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    const value = (selector) =>
      evaluate(`document.querySelector(${JSON.stringify(selector)}).value`);
    const seedText = () =>
      evaluate("document.querySelector('#sea-studio figcaption code').textContent");
    await press("Tab");
    await press("Enter");
    await delay(300);
    const workTop = await evaluate(
      "Math.round(document.getElementById('work').getBoundingClientRect().top)",
    );
    record("skip link reaches Work", Math.abs(workTop) < 120, `top ${workTop}`);
    await press("Tab");
    record(
      "the next Tab continues inside Work",
      /demo|case study/.test(await evaluate("document.activeElement.innerText")),
    );

    await evaluate("document.getElementById('sea-studio').scrollIntoView()");
    await focus("#sea-studio input[type=range]");
    const before = Number(await value("#sea-studio input[type=range]"));
    await press("ArrowRight");
    await press("ArrowRight");
    const after = Number(await value("#sea-studio input[type=range]"));
    record(
      "arrow keys move a slider and update the seed",
      after === before + 2 &&
        (await seedText()).slice(0, 2) === after.toString(16).padStart(2, "0"),
      `${before} → ${after}`,
    );
    await press("End");
    record(
      "End jumps a slider to its maximum",
      (await value("#sea-studio input[type=range]")) === "255",
    );
    await evaluate(
      "[...document.querySelectorAll('#sea-studio button')].find(b=>b.textContent==='Squall').focus()",
    );
    await press("Enter");
    record("Enter chooses a preset", (await seedText()) === "f532e107");
    await evaluate(
      "[...document.querySelectorAll('#sea-studio button')].find(b=>b.textContent==='Glass').focus()",
    );
    await press("Space");
    record("Space chooses a preset", (await seedText()) === "1e801407");
    const clear = async () => {
      await focus("#sea-studio input[type=text]");
      await evaluate(
        "(()=>{const i=document.querySelector('#sea-studio input[type=text]');i.setSelectionRange(i.value.length,i.value.length)})()",
      );
      for (let k = 0; k < 10; k++) await press("Backspace");
    };
    await clear();
    await type("c0ffee11");
    record("a typed seed is applied", (await seedText()) === "c0ffee11");
    await clear();
    await type("zz");
    record(
      "an invalid seed is flagged to assistive technology",
      (await evaluate(
        "document.querySelector('#sea-studio input[type=text]').getAttribute('aria-invalid')",
      )) === "true" && (await evaluate("!!document.querySelector('#sea-studio [role=alert]')")),
    );
    await focus("#sea-studio summary");
    await press("Enter");
    const opened = await evaluate("document.querySelector('#sea-studio details').open");
    await press("Space");
    record(
      "the disclosure opens with Enter and closes with Space",
      opened === true &&
        (await evaluate("document.querySelector('#sea-studio details').open")) === false,
    );
    await focus("[data-theme-toggle]");
    await press("Space");
    record(
      "Space switches the sea to night, and the name says what it does",
      (await evaluate("document.documentElement.dataset.studioTheme")) === "night" &&
        /Night sea: switch to day/.test(
          await evaluate("document.querySelector('[data-theme-toggle]').textContent"),
        ),
    );
    await focus("[data-shore-pause]");
    await press("Enter");
    record(
      "Enter pauses the shoreline",
      /Resume shoreline/.test(
        await evaluate("document.querySelector('[data-shore-pause]').textContent"),
      ),
    );
    await evaluate("window.scrollTo(0,0)");
    await delay(300);
    await focus("nav[aria-label=Studio] a");
    const ring = await evaluate(
      "(()=>{const c=getComputedStyle(document.querySelector('nav[aria-label=Studio] a'));return [c.outlineStyle,c.outlineWidth,c.outlineColor===c.color]})()",
    );
    record(
      "hero focus ring follows the text colour",
      ring[0] === "solid" && ring[1] === "2px" && ring[2] === true,
    );

    const failed = results.filter((r) => !r.pass);
    console.log(`\n${results.length - failed.length}/${results.length} keyboard checks pass.`);
    process.exitCode = failed.length ? 1 : 0;
  },
);
