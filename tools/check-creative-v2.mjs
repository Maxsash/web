/** User-authorized isolated headless Chrome review. No npm dependencies.
 * node tools/check-creative-v2.mjs [http://localhost:3000] [--quick]
 * --diagnose: read-only desktop load/cadence; also permits HTTPS maxsash.com.
 * Add --scroll or --native-scroll to diagnose the sea reveal instead of idle.
 * Captures are review evidence, not physical-device performance measurements.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { baseFromArgs, isLocal, withBrowser } from "./lib/browser.mjs";
import { runAssetBudgets } from "./e2e/assets.mjs";
import { runCoastChecks } from "./e2e/coast.mjs";
import { runContentChecks } from "./e2e/content.mjs";
import { runDesktopChecks } from "./e2e/desktop.mjs";
import { runDiagnostics } from "./e2e/diagnostics.mjs";
import { runFallbacks } from "./e2e/fallbacks.mjs";
import { runLifecycleChecks } from "./e2e/lifecycle.mjs";
import { runLinkChecks } from "./e2e/links.mjs";
import { runMobileDegradation } from "./e2e/mobile-degradation.mjs";
import { createPageHelpers } from "./e2e/page-helpers.mjs";
import { runShaderParity } from "./e2e/shader-parity.mjs";
import { runSeaStudioLayout } from "./e2e/sea-studio.mjs";
import { runStagedSea } from "./e2e/staged-sea.mjs";
import { runViewportCaptures } from "./e2e/viewports.mjs";

const base = baseFromArgs();
const diagnostic = process.argv.includes("--diagnose");
const nativeScroll = process.argv.includes("--native-scroll");
const scrollDiagnostic = process.argv.includes("--scroll") || nativeScroll;
const local = isLocal(base);
if (
  !local &&
  !(
    diagnostic &&
    base.protocol === "https:" &&
    ["maxsash.com", "www.maxsash.com"].includes(base.hostname)
  )
)
  throw new Error("Local server required except read-only maxsash.com diagnostics");
const quick = process.argv.includes("--quick");
const out = diagnostic
  ? `tools/.out/creative-${local ? "local" : "production"}-${nativeScroll ? "native-scroll" : scrollDiagnostic ? "scroll" : "diagnostic"}`
  : "tools/.out/creative-home";
mkdirSync(out, { recursive: true });
const articlePaths = ["/blog/three-waves-one-sea", "/blog/an-integral-under-sail"];
const publicPaths = ["/", "/blog", ...articlePaths];
const results = [],
  errors = [],
  assets = {};
await withBrowser(
  {
    name: "v2",
    flags: [
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-extensions",
      "--disable-sync",
    ],
  },
  async ({ send, evaluate, pressKey, onMessage }) => {
    onMessage((message) => {
      if (message.method === "Runtime.exceptionThrown")
        errors.push(
          message.params.exceptionDetails.exception?.description ||
            message.params.exceptionDetails.text,
        );
    });
    await send("Page.enable");
    await send("Runtime.enable");
    const helpers = createPageHelpers({ send, evaluate, base, out, results });
    const ctx = {
      base,
      out,
      quick,
      articlePaths,
      publicPaths,
      results,
      assets,
      scrollDiagnostic,
      nativeScroll,
      send,
      evaluate,
      pressKey,
      ...helpers,
    };
    if (diagnostic) {
      await runDiagnostics(ctx);
    } else {
      await runContentChecks(ctx);
      await runViewportCaptures(ctx);
      if (!quick) {
        await runLifecycleChecks(ctx);
        await runShaderParity(ctx);
        await runDesktopChecks(ctx);
        await runLinkChecks(ctx);
        await runMobileDegradation(ctx);
        await runStagedSea(ctx);
        await runSeaStudioLayout(ctx);
        await runFallbacks(ctx);
      }
      await runCoastChecks(ctx);
      if (!quick) await runAssetBudgets(ctx);
    }
    writeFileSync(
      join(out, "report.json"),
      JSON.stringify(
        {
          at: new Date().toISOString(),
          base: base.href,
          mode: "headless Chrome; not physical-device performance",
          results,
          errors,
        },
        null,
        2,
      ),
    );
    if (
      errors.length ||
      results.some(
        (r) =>
          r.scrollWidth > r.width + 1 || r.overflow?.length || r.pass === false || r.glError > 0,
      )
    )
      process.exitCode = 1;
    console.log(`Captured ${results.length} cases. Runtime exceptions: ${errors.length}.`);
  },
);
