/** Security-header and CSP check against a local production server.
 * node tools/check-headers.mjs [http://localhost:3000]
 * Asserts the response headers, then loads the main pages in isolated headless
 * Chrome and fails on any Content-Security-Policy violation.
 */
import { SWIFTSHADER_FLAGS, delay, localBaseFromArgs, withBrowser } from "./lib/browser.mjs";

const base = localBaseFromArgs();
const pages = [
  "/",
  "/?seed=f532e107&version=2",
  "/blog",
  "/blog/three-waves-one-sea",
  "/plate?seed=f532e107&version=2",
];
const failures = [];
const check = (name, pass, info = "") => {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${info ? "  " + info : ""}`);
  if (!pass) failures.push(name);
};

for (const path of pages) {
  const { headers } = await fetch(new URL(path, base), { redirect: "manual" });
  const csp = headers.get("content-security-policy") ?? "";
  check(
    `${path} content-security-policy`,
    /default-src 'self'/.test(csp) &&
      /frame-ancestors 'none'/.test(csp) &&
      /object-src 'none'/.test(csp) &&
      !/unsafe-eval/.test(csp),
  );
  check(
    `${path} hardening headers`,
    headers.get("x-content-type-options") === "nosniff" &&
      headers.get("x-frame-options") === "DENY" &&
      headers.get("referrer-policy") === "strict-origin-when-cross-origin" &&
      headers.get("cross-origin-opener-policy") === "same-origin" &&
      /camera=\(\)/.test(headers.get("permissions-policy") ?? ""),
  );
  check(`${path} names no framework`, !headers.has("x-powered-by"));
}
const api = await fetch(new URL("/api/sea-edition?seed=70806d5e&version=2", base));
check(
  "api keeps its own headers",
  api.headers.get("x-content-type-options") === "nosniff" && !api.headers.has("x-powered-by"),
);
const securityTxt = await fetch(new URL("/.well-known/security.txt", base));
const text = await securityTxt.text();
check(
  "security.txt is served with a contact and an unexpired date",
  securityTxt.status === 200 &&
    /^Contact: mailto:/m.test(text) &&
    Date.parse(text.match(/^Expires: (.+)$/m)?.[1] ?? "") > Date.now(),
);

await withBrowser({ name: "csp", flags: SWIFTSHADER_FLAGS }, async ({ send, evaluate }) => {
  await send("Page.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "window.__violations=[];addEventListener('securitypolicyviolation',e=>__violations.push(e.violatedDirective+' '+e.blockedURI));",
  });
  for (const path of pages) {
    await send("Page.navigate", { url: new URL(path, base).href });
    await delay(3500);
    const { v, gl } = JSON.parse(
      await evaluate(
        "JSON.stringify({v:__violations,gl:!!document.querySelector('canvas[data-ocean]')?.getContext('webgl2')})",
      ),
    );
    check(
      `${path} loads with no CSP violations`,
      v.length === 0,
      v.slice(0, 3).join(" | ") + (path === "/" ? ` webgl2=${gl}` : ""),
    );
  }
});
console.log(failures.length ? `\n${failures.length} failed.` : "\nAll header checks pass.");
process.exitCode = failures.length ? 1 : 0;
