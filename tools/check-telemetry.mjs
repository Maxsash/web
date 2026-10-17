import assert from "node:assert/strict";
import { SWIFTSHADER_FLAGS, delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
let cases = 0;
const check = (name, assertion) => {
  assertion();
  cases++;
  console.log(`PASS ${name}`);
};

await withBrowser(
  { name: "telemetry", flags: SWIFTSHADER_FLAGS },
  async ({ send, evaluate, pressKey, onMessage }) => {
    const batches = [];
    const errors = [];
    let collectionStatus = 204;
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    onMessage((message) => {
      if (message.method === "Runtime.exceptionThrown")
        errors.push(message.params.exceptionDetails.text);
      if (message.method !== "Fetch.requestPaused") return;
      const { requestId, request } = message.params;
      if (request.postData) batches.push(JSON.parse(request.postData));
      void send("Fetch.fulfillRequest", {
        requestId,
        responseCode: collectionStatus,
        responseHeaders: [{ name: "Cache-Control", value: "no-store" }],
      });
    });
    await send("Fetch.enable", {
      patterns: [{ urlPattern: "*/api/telemetry", requestStage: "Request" }],
    });
    await send("Page.navigate", { url: new URL("/privacy", base).href });
    await delay(2500);
    const allEvents = () => batches.flatMap((batch) => batch.events);
    for (let attempt = 0; attempt < 100 && !allEvents().length; attempt++) await delay(100);
    check("configured analytics starts without saved identity", () =>
      assert.equal(allEvents().filter((event) => event.event === "page_view").length, 1),
    );
    const storedKeys = await evaluate(
      "[...Object.keys(localStorage),...Object.keys(sessionStorage)].filter(key=>/analytics|posthog|^ph_/.test(key))",
    );
    check("analytics writes no browser storage", () => assert.deepEqual(storedKeys, []));
    const firstSession = batches[0].session;
    check("visit identifier is random", () => assert.match(firstSession, /^[a-f\d-]{36}$/));
    await evaluate("document.querySelector('a[href=\"/\"]').click()");
    await delay(3000);
    await evaluate("document.querySelector('#work').scrollIntoView()");
    await delay(3000);
    check("home and Work exposure recorded", () => {
      assert.ok(allEvents().some((event) => event.event === "page_view" && event.route === "/"));
      assert.equal(
        allEvents().filter(
          (event) => event.event === "section_view" && event.properties.section === "work",
        ).length,
        1,
      );
    });
    await evaluate("scrollTo(0,0)");
    await delay(1200);
    await evaluate("document.querySelector('#work').scrollIntoView()");
    await delay(1800);
    check("section exposure deduplicates within route visit", () =>
      assert.equal(
        allEvents().filter(
          (event) => event.event === "section_view" && event.properties.section === "work",
        ).length,
        1,
      ),
    );
    await evaluate("document.querySelector('#work a[href^=\"/work/\"]').click()");
    await delay(3000);
    check("case study activation and arrival are distinct", () => {
      assert.ok(
        allEvents().some(
          (event) => event.event === "content_open" && event.properties.content === "work",
        ),
      );
      assert.ok(
        allEvents().some((event) => event.event === "page_view" && event.route_group === "work"),
      );
      assert.ok(
        allEvents().some(
          (event) =>
            event.event === "navigation_result" && event.properties.outcome === "completed",
        ),
      );
    });
    await evaluate("document.querySelector('[data-telemetry-end]').scrollIntoView()");
    await delay(31000);
    await delay(1800);
    check("foreground engagement plus end marker qualifies", () =>
      assert.equal(
        allEvents().filter(
          (event) => event.event === "content_engaged" && event.properties.content === "work",
        ).length,
        1,
      ),
    );
    await evaluate("history.back()");
    await delay(3000);
    check("Back records a new page view", () =>
      assert.equal(
        allEvents().filter((event) => event.event === "page_view" && event.route === "/").length,
        2,
      ),
    );
    await evaluate("document.querySelector('a[href=\"/blog/an-integral-under-sail\"]').click()");
    await delay(3000);
    check("Notebook article route recorded", () =>
      assert.ok(
        allEvents().some(
          (event) => event.event === "page_view" && event.route === "/blog/an-integral-under-sail",
        ),
      ),
    );
    await evaluate("document.querySelector('a[href=\"/privacy\"]').click()");
    await delay(2500);
    await evaluate(
      "Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Pause analytics for this visit').focus()",
    );
    await pressKey("Enter");
    await delay(1800);
    const stoppedCount = batches.length;
    await evaluate("document.querySelector('a[href=\"/\"]').click()");
    await delay(2500);
    await evaluate("document.querySelector('#contact').scrollIntoView()");
    await delay(1800);
    check("keyboard pause stops events", () => assert.equal(batches.length, stoppedCount));
    await evaluate("document.querySelector('a[href=\"/privacy\"]').click()");
    await delay(2000);
    await evaluate(
      "Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Resume analytics for this visit').click()",
    );
    await delay(2000);
    check("resuming starts a fresh visit", () =>
      assert.notEqual(batches.at(-1).session, firstSession),
    );
    const count = batches.length;
    await send("Page.navigate", {
      url: new URL("/sea?seed=deadbeef&version=2&private=person@example.com", base).href,
    });
    await delay(3000);
    check("reload starts a fresh in-memory visit", () =>
      assert.notEqual(batches.at(-1).session, batches[count - 1].session),
    );
    await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    await evaluate(
      "document.querySelector('[data-press=\"preset\"]').scrollIntoView({block:'center'})",
    );
    const touch = await evaluate(
      "(()=>{const r=document.querySelector('[data-press=\"preset\"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()",
    );
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touch] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await delay(1800);
    check("studio preset recorded without settings or seed", () =>
      assert.ok(
        allEvents().some(
          (event) => event.event === "studio_action" && event.properties.action === "preset",
        ),
      ),
    );
    const payloads = JSON.stringify(batches);
    check("payloads omit raw URL query and contact data", () => {
      assert.equal(payloads.includes("deadbeef"), false);
      assert.equal(payloads.includes("person@example.com"), false);
      assert.equal(payloads.includes("userAgent"), false);
    });
    collectionStatus = 503;
    await evaluate("document.querySelector('a[href=\"/\"]').click()");
    await delay(3000);
    const heading = await evaluate("document.querySelector('h1')?.textContent");
    check("collection failure leaves the site usable", () => assert.match(heading, /Sea/));
    check("no runtime exceptions", () => assert.deepEqual(errors, []));
    await evaluate("document.querySelector('a[href=\"/privacy\"]').click()");
    await delay(2000);
    await evaluate(
      "Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Pause analytics for this visit').click()",
    );
    await delay(100);
    await send("Fetch.disable");
  },
);
console.log(
  `${cases} telemetry browser checks passed; requests intercepted, no PostHog events sent.`,
);
