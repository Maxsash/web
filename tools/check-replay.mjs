import assert from "node:assert/strict";
import { gunzipSync } from "node:zlib";
import { SWIFTSHADER_FLAGS, delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
let cases = 0;
const check = (name, condition) => {
  assert.ok(condition, name);
  cases++;
  console.log(`PASS ${name}`);
};
await withBrowser(
  { name: "replay", flags: SWIFTSHADER_FLAGS },
  async ({ send, evaluate, pressKey, onMessage }) => {
    const batches = [],
      outgoing = [],
      snapshots = [],
      errors = [];
    let enabled = true,
      automatic = false,
      recorderEnabled = true,
      signalBlocked = false,
      expiresIn = 60000;
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    // PostHog suppresses automated-browser uploads even when its recorder reports active.
    const { userAgent } = await send("Browser.getVersion");
    await send("Network.setUserAgentOverride", {
      userAgent: userAgent.replace("HeadlessChrome", "Chrome"),
    });
    await send("Page.addScriptToEvaluateOnNewDocument", {
      source:
        "Object.defineProperty(navigator,'webdriver',{get:()=>false});window.__violations=[];addEventListener('securitypolicyviolation',e=>__violations.push(e.violatedDirective+' '+e.blockedURI));",
    });
    onMessage((message) => {
      if (
        message.method === "Runtime.consoleAPICalled" &&
        ["warning", "error"].includes(message.params.type)
      )
        console.log("BROWSER", message.params.args.map((a) => a.value ?? a.description).join(" "));
      if (message.method === "Runtime.exceptionThrown")
        errors.push(message.params.exceptionDetails.text);
      if (message.method !== "Fetch.requestPaused") return;
      const { requestId, request } = message.params;
      const url = new URL(request.url);
      let body = {},
        responseCode = 200;
      if (url.pathname === "/api/telemetry") {
        if (request.postData) batches.push(JSON.parse(request.postData));
        responseCode = 204;
      } else if (url.pathname === "/api/telemetry/replay-policy") {
        const correction = url.searchParams.get("region");
        const detected = automatic ? "IN" : "unknown";
        const region = correction && correction !== "auto" ? correction : detected;
        body =
          enabled && !signalBlocked
            ? {
                enabled: true,
                mode: region === "IN" ? "automatic" : "voluntary",
                region,
                detectedRegion: detected,
                sampleRate: 1,
                validUntil: new Date(Date.now() + expiresIn).toISOString(),
                token: "phc_replay_test_placeholder",
                host: "https://eu.i.posthog.com",
              }
            : { enabled: false, region, detectedRegion: detected };
      } else {
        outgoing.push(request);
        if (url.pathname.includes("/array/"))
          body = {
            sessionRecording: recorderEnabled
              ? { enabled: true, endpoint: "/s/", consoleLogRecordingEnabled: false }
              : false,
            autocapture_opt_out: true,
            capturePerformance: false,
            supportedCompression: ["gzip-js"],
          };
        else if (url.pathname.includes("/flags"))
          body = { featureFlags: {}, sessionRecording: { enabled: true, endpoint: "/s/" } };
        else if (request.method === "POST") {
          let buffer;
          try {
            buffer = request.postDataEntries?.length
              ? Buffer.concat(
                  request.postDataEntries.map((entry) => Buffer.from(entry.bytes, "base64")),
                )
              : Buffer.from(request.postData ?? "");
            if (buffer[0] === 31 && buffer[1] === 139) buffer = gunzipSync(buffer);
            let parsed;
            const raw = buffer.toString();
            if (/^[{[]/.test(raw)) parsed = JSON.parse(raw);
            else {
              const form = new URLSearchParams(raw);
              parsed = JSON.parse(Buffer.from(form.get("data"), "base64").toString());
            }
            snapshots.push(...(Array.isArray(parsed) ? parsed : [parsed]));
          } catch (error) {
            errors.push(`Cannot decode replay request: ${error.message}`);
          }
          body = { status: 1 };
        }
      }
      void send("Fetch.fulfillRequest", {
        requestId,
        responseCode,
        responseHeaders: [
          { name: "Content-Type", value: "application/json" },
          { name: "Cache-Control", value: "no-store" },
          { name: "Access-Control-Allow-Origin", value: base.origin },
          { name: "Access-Control-Allow-Headers", value: "*" },
          { name: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        ],
        ...(responseCode === 204
          ? {}
          : { body: Buffer.from(JSON.stringify(body)).toString("base64") }),
      });
    });
    await send("Fetch.enable", {
      patterns: [
        { urlPattern: "*/api/telemetry*", requestStage: "Request" },
        { urlPattern: "*posthog.com/*", requestStage: "Request" },
      ],
    });
    const navigate = async (path) => {
      const previousSessions = new Set(batches.map((batch) => batch.session));
      await send("Page.navigate", { url: new URL(path, base).href });
      for (
        let attempt = 0;
        attempt < 200 && !batches.some((batch) => !previousSessions.has(batch.session));
        attempt++
      )
        await delay(100);
      await delay(200);
    };
    const click = async (text) =>
      evaluate(
        `Array.from(document.querySelectorAll('button')).find(button=>button.textContent===${JSON.stringify(text)})?.click()`,
      );
    await navigate("/?studio_visit=owner&studio_intent=work&seed=deadbeef&version=2#work");

    check(
      "owner and intent label events without starting a recorder",
      batches.some(
        (batch) => batch.context.visit_role === "owner" && batch.context.declared_intent === "work",
      ) && outgoing.length === 0,
    );
    check(
      "entry labels are removed without changing sea parameters or fragment",
      await evaluate(
        "!location.search.includes('studio_') && location.search.includes('seed=deadbeef') && location.hash==='#work'",
      ),
    );
    await evaluate(`document.querySelector('a[href="/privacy"]').click()`);
    await delay(2500);
    check(
      "ordinary navigation retains visit context",
      await evaluate("document.body.textContent.includes('Visit label: owner')"),
    );
    await navigate(
      "/?studio_visit=tester&studio_intent=play&utm_source=instagram&utm_medium=social&utm_campaign=social&utm_content=link_in_bio&utm_term=brand&private=person@example.com",
    );
    check(
      "tester URL labels the visit without an arrival prompt or permission",
      !(await evaluate("!!document.querySelector('dialog[open]')")) &&
        outgoing.length === 0 &&
        batches.some((batch) => batch.context.visit_role === "tester"),
    );
    await evaluate(`document.querySelector('a[href="/privacy"]').click()`);
    await delay(1500);
    check(
      "footer settings do not open a consent dialog on arrival",
      !(await evaluate("!!document.querySelector('dialog[open]')")),
    );
    await click("Help test this site");
    check(
      "visitor opens the explanation deliberately before any recorder request",
      (await evaluate(
        "document.querySelector('dialog[open]')?.textContent.includes('Start test session')",
      )) && outgoing.length === 0,
    );
    await pressKey("Escape");
    await delay(150);
    check(
      "Escape closes the invitation without recording",
      !(await evaluate("!!document.querySelector('dialog[open]')")) && outgoing.length === 0,
    );
    await click("Help test this site");
    await evaluate(
      `document.body.insertAdjacentHTML('beforeend','<input id="test-secret" value="private-input-987">')`,
    );
    await evaluate(
      "Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Start test session').focus()",
    );
    await pressKey("Enter");
    await delay(8000);

    check(
      "explicit Start produces a recording and visible stop control",
      await evaluate(
        `document.querySelector('aside[aria-label="Site testing"]')?.textContent.includes('Stop recording')`,
      ),
    );
    await send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: 300,
      y: 300,
      button: "left",
      clickCount: 1,
    });
    await send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: 300,
      y: 300,
      button: "left",
      clickCount: 1,
    });
    await evaluate("scrollTo(0,600)");
    await delay(5000);

    check(
      "actual snapshot payloads are captured",
      snapshots.some(
        (event) =>
          event.event === "$snapshot" &&
          event.properties.$snapshot_data?.some((entry) => entry.type === 2),
      ),
    );
    const serialized = JSON.stringify(snapshots);
    check(
      "recording snapshots retain validated entry attribution after navigation and tester startup",
      snapshots.some(
        (event) =>
          event.properties?.utm_source === "instagram" &&
          event.properties?.utm_content === "link_in_bio" &&
          event.properties?.utm_medium === "social" &&
          event.properties?.utm_campaign === "social" &&
          event.properties?.utm_term === "brand",
      ),
    );
    check(
      "replay omits private query, inputs, fragments, seeds and URL labels",
      !["person@example.com", "private-input-987", "deadbeef", "studio_visit="].some((value) =>
        serialized.includes(value),
      ),
    );
    check(
      "replay joins the same visit identity as selected events",
      snapshots.some((event) =>
        batches.some(
          (batch) =>
            batch.session === event.properties.$session_id && batch.context.visit_role === "tester",
        ),
      ),
    );
    check(
      "all SDK events are snapshots, no duplicate analytics",
      snapshots.every((event) => event.event === "$snapshot"),
    );
    check(
      "recording adds no saved analytics identity",
      await evaluate(
        "![...Object.keys(localStorage),...Object.keys(sessionStorage)].some(key=>/posthog|^ph_/.test(key))",
      ),
    );
    await click("Stop recording");
    await delay(1000);
    const afterStop = snapshots.length;
    await evaluate("scrollTo(0,1200)");
    await delay(5000);
    check("Stop prevents further snapshots", snapshots.length === afterStop);
    await click("Help test this site");
    await click("Start test session");
    await delay(4500);
    check(
      "recording can restart after Stop",
      await evaluate("document.querySelector('aside')?.textContent.includes('Stop recording')"),
    );
    await evaluate(`document.querySelector('a[href="/privacy"]').click()`);
    await delay(2000);
    await click("Pause analytics for this visit");
    await delay(1500);
    const paused = snapshots.length;
    await evaluate("scrollTo(0,500)");
    await delay(4000);
    check(
      "analytics pause stops replay",
      snapshots.length === paused &&
        !(await evaluate(
          "document.querySelector('aside')?.textContent.includes('Stop recording')",
        )),
    );
    check("recording has no CSP violations", (await evaluate("__violations")).length === 0);
    automatic = true;
    await evaluate("localStorage.removeItem('studio-privacy')");
    await navigate("/");
    await delay(5000);
    check(
      "approved automatic policy starts sampled visits",
      await evaluate("document.querySelector('aside')?.textContent.includes('Stop recording')"),
    );
    await click("Stop recording");
    await delay(500);
    check(
      "Stop saves an identifier-free refusal",
      await evaluate("JSON.parse(localStorage.getItem('studio-privacy')).automatic === false"),
    );
    const beforeRefused = outgoing.length;
    await navigate("/");
    await delay(1500);
    check(
      "saved refusal prevents automatic startup after reload",
      outgoing.length === beforeRefused,
    );
    await navigate("/privacy");
    await evaluate(
      "(()=>{const select=document.querySelector('select');select.value='GB';select.dispatchEvent(new Event('change',{bubbles:true}))})()",
    );
    await delay(500);
    check(
      "region correction is saved without analytics context",
      (await evaluate("JSON.parse(localStorage.getItem('studio-privacy')).region === 'GB'")) &&
        !JSON.stringify(batches).includes("detectedRegion"),
    );
    await evaluate("document.querySelector('input[type=checkbox]').click()");
    await delay(1500);
    check(
      "UK correction remains voluntary even with automatic preference enabled",
      outgoing.length === beforeRefused &&
        (await evaluate(
          "document.querySelector('[data-replay-policy]').textContent.includes('voluntary')",
        )),
    );
    await evaluate(
      "(()=>{const select=document.querySelector('select');select.value='IN';select.dispatchEvent(new Event('change',{bubbles:true}))})()",
    );
    await delay(4500);
    check(
      "explicit India correction applies reviewed automatic policy",
      await evaluate("document.querySelector('aside')?.textContent.includes('Stop recording')"),
    );
    await evaluate(
      "(()=>{const select=document.querySelector('select');select.value='EU';select.dispatchEvent(new Event('change',{bubbles:true}))})()",
    );
    await delay(1000);
    const afterCorrection = snapshots.length;
    await evaluate("scrollTo(0,300)");
    await delay(2000);
    check(
      "stricter region stops uploads immediately",
      snapshots.length === afterCorrection && (await evaluate("!document.querySelector('aside')")),
    );
    await navigate("/privacy");
    check(
      "region correction survives reload",
      await evaluate("document.querySelector('select').value === 'EU'"),
    );
    await evaluate(
      "(()=>{const other=window.open('about:blank');if(!other)throw new Error('second tab blocked');try{other.localStorage.setItem('studio-privacy',JSON.stringify({version:1,region:'auto',automatic:false}));}finally{other.close()}})()",
      true,
    );
    await delay(500);
    check(
      "another tab synchronizes refusal and region",
      await evaluate(
        "document.querySelector('select').value==='auto' && !document.querySelector('input[type=checkbox]').checked",
      ),
    );
    await evaluate("localStorage.removeItem('studio-privacy')");
    automatic = false;
    await navigate("/privacy");
    await evaluate(
      "(()=>{const select=document.querySelector('select');select.value='IN';select.dispatchEvent(new Event('change',{bubbles:true}))})()",
    );
    await delay(250);
    await evaluate(
      "(()=>{const select=document.querySelector('select');select.value='EU';select.dispatchEvent(new Event('change',{bubbles:true}));select.value='IN';select.dispatchEvent(new Event('change',{bubbles:true}))})()",
    );
    await delay(5000);
    check(
      "rapid region corrections leave only the final recorder active",
      await evaluate("document.querySelector('aside')?.textContent.includes('Stop recording')"),
    );
    await click("Stop recording");
    await evaluate("localStorage.removeItem('studio-privacy')");
    automatic = true;
    expiresIn = 1800;
    await navigate("/privacy");
    await delay(3000);
    check(
      "automatic expiry switches to voluntary without prompting",
      await evaluate(
        "document.querySelector('[data-replay-policy]').textContent.includes('voluntary') && !document.querySelector('aside') && !document.querySelector('dialog[open]')",
      ),
    );
    const expiredSnapshots = snapshots.length;
    await delay(1500);
    check("expiry prevents subsequent snapshot uploads", snapshots.length === expiredSnapshots);
    await click("Help test this site");
    await click("Start test session");
    await delay(4500);
    check(
      "expired India policy still permits an explicit voluntary test",
      await evaluate("document.querySelector('aside')?.textContent.includes('Stop recording')"),
    );
    check(
      "voluntary Start leaves the saved automatic choice unchanged",
      await evaluate("localStorage.getItem('studio-privacy') === null"),
    );
    await click("Stop recording");
    await evaluate("localStorage.removeItem('studio-privacy')");
    expiresIn = 60000;
    const { identifier: storageBlocked } = await send("Page.addScriptToEvaluateOnNewDocument", {
      source:
        "Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError')}",
    });
    const beforeStorageBlocked = outgoing.length;
    await navigate("/privacy");
    await delay(1500);
    check(
      "unavailable preference storage disables automatic replay",
      outgoing.length === beforeStorageBlocked &&
        (await evaluate("document.body.textContent.includes('cannot save these preferences')")),
    );
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: storageBlocked });
    signalBlocked = true;
    const beforeBlocked = outgoing.length;
    await navigate("/?studio_visit=tester");
    check(
      "privacy signal policy disables invitation and recorder",
      outgoing.length === beforeBlocked &&
        !(await evaluate("!!document.querySelector('dialog[open]')")),
    );
    signalBlocked = false;
    const { identifier: gpcScript } = await send("Page.addScriptToEvaluateOnNewDocument", {
      source: "Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true})",
    });
    const beforeGpc = outgoing.length;
    await navigate("/?studio_visit=tester");
    check(
      "browser GPC blocks replay even if a policy response would allow it",
      outgoing.length === beforeGpc &&
        !(await evaluate("!!document.querySelector('dialog[open]')")),
    );
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: gpcScript });
    automatic = false;
    recorderEnabled = false;
    await navigate("/?studio_visit=tester");
    await click("Start test session");
    await delay(12000);
    check(
      "disabled provider recording fails gracefully without blocking the site",
      await evaluate(
        "document.querySelector('aside')?.textContent.includes('Recording unavailable') && !!document.querySelector('h1')",
      ),
    );
    enabled = false;
    await navigate("/");
    check(
      "disabled replay leaves event analytics available",
      !(await evaluate(
        "Array.from(document.querySelectorAll('button')).some(button=>button.textContent==='Help test this site')",
      )),
    );
    check("no runtime exceptions or decode failures", errors.length === 0);
    await send("Fetch.disable");
  },
);
console.log(`${cases} replay browser checks passed; policy and all PostHog requests intercepted.`);
