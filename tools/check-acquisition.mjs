import assert from "node:assert/strict";
import { SWIFTSHADER_FLAGS, delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
let cases = 0;
await withBrowser(
  { name: "acquisition", flags: SWIFTSHADER_FLAGS },
  async ({ send, evaluate, onMessage }) => {
    const batches = [];
    await send("Page.enable");
    await send("Network.enable");
    onMessage((message) => {
      if (message.method !== "Fetch.requestPaused") return;
      if (message.params.request.postData)
        batches.push(JSON.parse(message.params.request.postData));
      void send("Fetch.fulfillRequest", { requestId: message.params.requestId, responseCode: 204 });
    });
    await send("Fetch.enable", {
      patterns: [
        { urlPattern: "*/api/telemetry*", requestStage: "Request" },
        { urlPattern: "*://*.posthog.com/*", requestStage: "Request" },
      ],
    });
    for (const [source, medium, campaign, content] of [
      ["instagram", "social", "social", "link_in_bio"],
      ["whatsapp", "messaging", "outreach", "message"],
      ["linkedin", "social", "social", "profile"],
    ]) {
      batches.length = 0;
      await send("Page.navigate", {
        url: new URL(
          `/?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}&utm_content=${content}&fbclid=private-click-id`,
          base,
        ).href,
      });
      for (let i = 0; i < 150 && !batches.length; i++) await delay(100);
      const expected = {
        source,
        campaign,
        utm_source: source,
        utm_medium: medium,
        utm_campaign: campaign,
        utm_content: content,
        utm_term: "none",
      };
      assert.ok(batches.length, `${source}: entry event exists`);
      for (const [key, value] of Object.entries(expected))
        assert.equal(batches[0].context[key], value, `${source}: ${key}`);
      console.log(`PASS ${source} public link captures all entry attributes`);
      cases++;
      await evaluate(
        `(()=>{const a=document.querySelector('a[href^="mailto:"]');if(!a)throw Error('Missing email link');a.addEventListener('click',e=>e.preventDefault(),{once:true});a.click()})()`,
      );
      for (
        let i = 0;
        i < 100 && !batches.some((b) => b.events.some((e) => e.event === "contact_action"));
        i++
      )
        await delay(100);
      const contact = batches.find((b) => b.events.some((e) => e.event === "contact_action"));
      assert.ok(contact, `${source}: contact activation recorded`);
      for (const [key, value] of Object.entries(expected))
        assert.equal(contact.context[key], value, `${source}: contact ${key}`);
      assert.equal(JSON.stringify(batches).includes("private-click-id"), false);
      assert.equal(JSON.stringify(batches).includes("mailto:"), false);
      console.log(
        `PASS ${source} contact action retains attribution without contact data or click ID`,
      );
      cases++;
    }
    await send("Fetch.disable");
  },
);
console.log(
  `${cases} acquisition browser checks passed; requests intercepted, no live events sent.`,
);
