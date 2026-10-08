import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];
const CALL_TIMEOUT_MS = 45_000;
const KEY_CODES = { Tab: 9, Enter: 13, Space: 32, Backspace: 8, End: 35, ArrowRight: 39 };

export const SOFTWARE_GL_FLAGS = ["--use-angle=swiftshader"];

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const baseFromArgs = (argv = process.argv) =>
  new URL(argv.find((arg) => /^https?:/.test(arg)) ?? "http://localhost:3000");

export const isLocal = (url) => LOCAL_HOSTS.includes(url.hostname);

export function localBaseFromArgs(argv = process.argv) {
  const base = baseFromArgs(argv);
  if (!isLocal(base)) throw new Error("Local server required");
  return base;
}

function findChrome() {
  const chrome = process.env.CHROME_BIN || CHROME_PATHS.find(existsSync);
  if (!chrome) throw new Error("Chrome not found");
  return chrome;
}

async function waitForDevToolsPort(profile, chrome, stderr) {
  const portFile = join(profile, "DevToolsActivePort");
  for (let attempt = 0; !existsSync(portFile); attempt++) {
    if (attempt > 200 || chrome.exitCode !== null) throw new Error(`Chrome startup: ${stderr()}`);
    await delay(50);
  }
  return readFileSync(portFile, "utf8").split("\n")[0];
}

async function stopChrome(chrome) {
  if (chrome.exitCode !== null || chrome.signalCode) return;
  const exited = new Promise((resolve) => chrome.once("exit", resolve));
  chrome.kill("SIGTERM");
  const forceKill = setTimeout(() => chrome.kill("SIGKILL"), 2000);
  await exited;
  clearTimeout(forceKill);
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const listeners = [];
  const pending = new Map();
  let nextId = 0;
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    listeners.forEach((listener) => listener(message));
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    clearTimeout(waiter.timer);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  });
  const opened = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`${method} timeout`));
      }, CALL_TIMEOUT_MS);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
  return { socket, opened, send, onMessage: (listener) => listeners.push(listener) };
}

function createPage({ send, onMessage }) {
  const evaluate = async (expression, userGesture = false) => {
    const result = await send("Runtime.evaluate", {
      expression,
      userGesture,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails)
      throw new Error(
        result.exceptionDetails.exception?.description || result.exceptionDetails.text,
      );
    return result.result.value;
  };
  const pressKey = async (name, modifiers = 0) => {
    const key = name === "Space" ? " " : name;
    const text = { Space: " ", Enter: "\r" }[name];
    const event = { key, code: name, windowsVirtualKeyCode: KEY_CODES[name], modifiers };
    await send("Input.dispatchKeyEvent", { type: "keyDown", ...event, text });
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...event });
  };
  return { send, evaluate, pressKey, onMessage };
}

export async function withBrowser({ name, flags = [] }, run) {
  const profile = mkdtempSync(join(tmpdir(), `maxsash-${name}-`));
  const chrome = spawn(
    findChrome(),
    [
      "--headless=new",
      "--no-first-run",
      "--enable-unsafe-swiftshader",
      `--user-data-dir=${profile}`,
      "--remote-debugging-port=0",
      ...flags,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  let stderr = "";
  chrome.stderr.on("data", (chunk) => (stderr = (stderr + chunk).slice(-4000)));
  let connection;
  try {
    const port = await waitForDevToolsPort(profile, chrome, () => stderr);
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    connection = connect(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
    await connection.opened;
    return await run(createPage(connection));
  } finally {
    connection?.socket.close();
    await stopChrome(chrome);
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
