/** Security-header and CSP check against a local production server.
 * node tools/check-headers.mjs [http://localhost:3000]
 * Asserts the response headers, then loads the main pages in isolated headless
 * Chrome and fails on any Content-Security-Policy violation.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = new URL(process.argv.find(x => /^https?:/.test(x)) ?? "http://localhost:3000");
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Use a local production server");
const pages = ["/", "/?seed=f532e107&version=2", "/blog", "/blog/three-waves-one-sea", "/plate?seed=f532e107&version=2"];
const failures = [];
const check = (name, pass, info = "") => { console.log(`${pass ? "PASS" : "FAIL"}  ${name}${info ? "  " + info : ""}`); if (!pass) failures.push(name); };

for (const path of pages) {
  const { headers } = await fetch(new URL(path, base), { redirect: "manual" });
  const csp = headers.get("content-security-policy") ?? "";
  check(`${path} content-security-policy`, /default-src 'self'/.test(csp) && /frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp) && !/unsafe-eval/.test(csp));
  check(`${path} hardening headers`, headers.get("x-content-type-options") === "nosniff" && headers.get("x-frame-options") === "DENY" && headers.get("referrer-policy") === "strict-origin-when-cross-origin" && headers.get("cross-origin-opener-policy") === "same-origin" && /camera=\(\)/.test(headers.get("permissions-policy") ?? ""));
  check(`${path} names no framework`, !headers.has("x-powered-by"));
}
const api = await fetch(new URL("/api/sea-edition?seed=70806d5e&version=2", base));
check("api keeps its own headers", api.headers.get("x-content-type-options") === "nosniff" && !api.headers.has("x-powered-by"));
const securityTxt = await fetch(new URL("/.well-known/security.txt", base));
const text = await securityTxt.text();
check("security.txt is served with a contact and an unexpired date", securityTxt.status === 200 && /^Contact: mailto:/m.test(text) && Date.parse(text.match(/^Expires: (.+)$/m)?.[1] ?? "") > Date.now());

const chrome = process.env.CHROME_BIN || ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
assert.ok(chrome, "Chrome not found");
const profile = mkdtempSync(join(tmpdir(), "maxsash-csp-"));
const child = spawn(chrome, ["--headless=new", "--no-first-run", "--enable-unsafe-swiftshader", "--use-angle=swiftshader", `--user-data-dir=${profile}`, "--remote-debugging-port=0", "about:blank"], { stdio: "ignore" });
const delay = ms => new Promise(r => setTimeout(r, ms));
try {
  const portPath = join(profile, "DevToolsActivePort");
  for (let i = 0; !existsSync(portPath); i++) { if (i > 200) throw new Error("Chrome did not start"); await delay(50); }
  const port = readFileSync(portPath, "utf8").split("\n")[0];
  const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(p => p.type === "page");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => socket.addEventListener("open", r, { once: true }));
  let id = 0; const pending = new Map();
  socket.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); socket.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", { source: "window.__violations=[];addEventListener('securitypolicyviolation',e=>__violations.push(e.violatedDirective+' '+e.blockedURI));" });
  for (const path of pages) {
    await send("Page.navigate", { url: new URL(path, base).href });
    await delay(3500);
    const { result } = await send("Runtime.evaluate", { expression: "JSON.stringify({v:__violations,gl:!!document.querySelector('canvas')?.getContext('webgl2')})", returnByValue: true });
    const { v, gl } = JSON.parse(result.result.value);
    check(`${path} loads with no CSP violations`, v.length === 0, v.slice(0, 3).join(" | ") + (path === "/" ? ` webgl2=${gl}` : ""));
  }
  socket.close();
} finally {
  child.kill();
  await new Promise(resolve => child.once("exit", resolve));
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
console.log(failures.length ? `\n${failures.length} failed.` : "\nAll header checks pass.");
process.exitCode = failures.length ? 1 : 0;
