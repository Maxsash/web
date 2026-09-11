/* Browser regression checks for responsive layouts. Node 22 + Chrome, no npm dependencies.
 * Run against a local server: node tools/check-responsive.mjs [http://127.0.0.1:3000] [--baseline]
 * --no-fill disables the wave extension as a negative control: a gap must be detected.
 * Screenshots and measured results go to ignored tools/.out/responsive[-before]/.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const url = new URL(process.argv.find((arg) => /^https?:/.test(arg)) || "http://127.0.0.1:3000");
if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new Error("Use a local server.");
const baseline = process.argv.includes("--baseline");
const noFill = process.argv.includes("--no-fill");
const out = fileURLToPath(new URL(`.out/responsive${noFill ? "-no-fill" : baseline ? "-before" : ""}/`, import.meta.url));
mkdirSync(out, { recursive: true });
const chrome = process.env.CHROME_BIN || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium",
].find(existsSync);
if (!chrome) throw new Error("Set CHROME_BIN to Chrome's executable.");
const profile = mkdtempSync(join(tmpdir(), "maxsash-mark-chrome-"));
const browser = spawn(chrome, [
  "--headless", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--disable-background-networking", "--disable-extensions", "--disable-sync",
  "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
let browserLog = "";
browser.stderr.on("data", (chunk) => { browserLog = (browserLog + chunk.toString()).slice(-3000); });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;

try {
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; !existsSync(portFile); i++) {
    if (browser.exitCode !== null || browser.signalCode || i > 200) {
      throw new Error(`Chrome failed to start. ${browserLog}`);
    }
    await delay(50);
  }
  const port = readFileSync(portFile, "utf8").split("\n")[0];
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(pages.find((page) => page.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    clearTimeout(waiter.timeout);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome timed out: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await call("Page.enable");
  const cases = noFill ? [[320,568], [390,844], [768,1024]] : [
    [320, 568], [360, 640], [390, 844], [430, 932], [600, 800], [768, 1024],
    [820, 900], [821, 900], [1024, 768], [1025, 768], [1440, 1000], [1440, 600], [1920, 1080], [2560, 1080],
    [568, 320], [844, 390], [844, 390, 1, 59], [320, 568, 2], [390, 844, 2],
  ];
  const reports = [];
  const waveReports = [];
  for (const theme of ["light", "dark"]) {
    for (const [width, height, textScale = 1, safeLeft = 0] of cases) {
      await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 1025 });
      await call("Emulation.setTouchEmulationEnabled", { enabled: width < 1025 });
      await call("Emulation.setEmulatedMedia", { features: [
        { name: "prefers-color-scheme", value: theme }, { name: "prefers-reduced-motion", value: "reduce" },
      ] });
      await call("Page.navigate", { url: url.href });
      for (let i = 0; i < 400; i++) {
        if (await evaluate(`location.href === ${JSON.stringify(url.href)} && document.readyState === 'complete'`)) break;
        if (i === 399) throw new Error("Local page did not load");
        await delay(50);
      }
      await evaluate(`document.documentElement.style.fontSize = '${textScale * 100}%'; document.fonts.ready.then(() => true)`);
      await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
      if(safeLeft) await evaluate(`document.documentElement.style.setProperty('--safe-left','${safeLeft}px')`);
      if(noFill) await evaluate("{const s=document.createElement('style');s.textContent='[class*=band]::after{display:none!important}';document.head.append(s);}");
      const report = await evaluate(`(() => {
        const rect = e => { const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}; };
        const visible = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
        const header=document.querySelector('header');
        const nav=[...header.querySelectorAll('nav a')];
        const actions=[...header.querySelectorAll('a[href="#work"],a[href="#elsewhere"]')].filter(e=>!e.closest('nav'));
        const boat=header.querySelector('[class*="boat"]');
        const copy=header.querySelector('h1').parentElement;
        const b=rect(boat), c=rect(copy);
        const failures=[];
        const inset=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-left'))||0;
        if([...document.querySelectorAll('.shell')].some(e=>rect(e).x<inset-1)) failures.push('content intrudes into landscape safe area');
        if(document.documentElement.scrollWidth > innerWidth+1) failures.push('page overflow');
        if(nav.length!==3 || nav.some(e=>!visible(e))) failures.push('mobile navigation unavailable');
        const links=[...document.querySelectorAll('a')].filter(e=>visible(e) && !e.classList.contains('skip'));
        const small=links.filter(e=>{const r=rect(e);return r.height<43.9 || r.width<43.9;}).map(e=>e.textContent.trim());
        if(small.length) failures.push('small tap targets: '+small.join(', '));
        const overflow=[...document.querySelectorAll('h1,h2,h3,p,nav,a,article,time,li')].filter(visible).filter(e=>{
          const r=rect(e);return r.x < -1 || r.right > innerWidth+1 || e.scrollWidth>e.clientWidth+1;
        }).map(e=>e.textContent.trim().slice(0,50));
        if(overflow.length) failures.push('clipped content: '+overflow.join(', '));
        if(Math.min(b.right,c.right)>Math.max(b.x,c.x)+1 && Math.min(b.bottom,c.bottom)>Math.max(b.y,c.y)+1) failures.push('boat overlaps hero copy');
        if(b.x<0 || b.right>innerWidth+1) failures.push('boat outside viewport');
        const fonts={body:getComputedStyle(document.body).fontFamily,heading:getComputedStyle(header.querySelector('h1')).fontFamily, label:getComputedStyle(header.querySelector('p')).fontFamily};
        if(!fonts.body.includes('Inter') || !fonts.heading.includes('Fraunces') || !fonts.label.includes('JetBrains')) failures.push('font tokens unresolved');
        return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,heroHeight:header.offsetHeight,boat:b,copy:c,actionBottom:Math.max(...actions.map(e=>rect(e).bottom)),fonts,failures};
      })()`);
      report.theme=theme; report.textScale=textScale; report.safeLeft=safeLeft;
      // Follow a real in-page link, verify its destination and visible section.
      for (const target of ["work", "writing", "elsewhere"]) {
        const link = await evaluate(`(() => {const e=document.querySelector('nav a[href="#${target}"]');const r=e.getBoundingClientRect();e.scrollIntoView();const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2,visible:r.width>0&&r.height>0};})()`);
        if (link.visible) {
          if(width < 1025) {
            await call("Input.dispatchTouchEvent", {type:"touchStart",touchPoints:[{x:link.x,y:link.y}]});
            await call("Input.dispatchTouchEvent", {type:"touchEnd",touchPoints:[]});
          } else {
            await call("Input.dispatchMouseEvent", { type: "mousePressed", x: link.x, y: link.y, button: "left", clickCount: 1 });
            await call("Input.dispatchMouseEvent", { type: "mouseReleased", x: link.x, y: link.y, button: "left", clickCount: 1 });
          }
          await delay(80);
          const good = await evaluate(`location.hash === '#${target}' && Math.abs(document.getElementById('${target}').getBoundingClientRect().top) < 100`);
          if (!good) report.failures.push(`navigation failed: ${target}`);
        }
      }
      await evaluate("scrollTo(0,0)");
      if ([320,390,768,1440,568,844].includes(width)) {
        const name=`${theme}-${width}x${height}${textScale>1?'-text-200':''}${safeLeft?'-safe-area':''}`;
        for(const [suffix,shotHeight] of [["hero",height],["page",report.pageHeight]]) {
          const shot=await call("Page.captureScreenshot",{format:"png",captureBeyondViewport:true,clip:{x:0,y:0,width,height:shotHeight,scale:1}});
          writeFileSync(join(out,`${name}-${suffix}.png`),Buffer.from(shot.data,"base64"));
        }
      }
      if (textScale === 1 && [320,390,768,1024,1440,2560].includes(width) && height !== 600) {
        await call("Emulation.setEmulatedMedia", { features: [
          { name: "prefers-color-scheme", value: theme }, { name: "prefers-reduced-motion", value: "no-preference" },
        ] });
        await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
        const frames = await evaluate(`(() => {
          const header=document.querySelector('header');
          const scene=header.querySelector('[class*="sea"]');
          const bands=[...scene.querySelectorAll('[class*="band"]')];
          const canvas=document.createElement('canvas').getContext('2d');
          const animations=document.getAnimations().filter(a=>header.contains(a.effect.target));
          animations.forEach(a=>a.pause());
          const result=[];
          const times=[0,2000,7000,11000,19000,31000,47000,59000,89000,121000];
          for(let frame=0;frame<times.length+16;frame++) {
            let heave=0;
            for(const a of animations) {
              const duration=Number(a.effect.getTiming().duration);
              a.currentTime=frame<times.length ? times[frame] :
                a.animationName==='heave' ? (((frame-times.length) >> heave++) & 1)*duration/2 :
                duration*((frame%2) ? .9999 : 0);
            }
            const layers=bands.map(band=>{
              const svg=band.querySelector('svg'), path=svg.querySelector('path:last-child');
              const r=band.getBoundingClientRect(), box=svg.getBoundingClientRect();
              const tail=getComputedStyle(band,'::after');
              return {d:new Path2D(path.getAttribute('d')), inv:svg.getScreenCTM().inverse(),
                width:svg.viewBox.baseVal.width,height:svg.viewBox.baseVal.height,box,
                tail:tail.content!=='none' && tail.display!=='none' && tail.backgroundColor!=='rgba(0, 0, 0, 0)',
                left:r.left,right:r.right,top:r.top+parseFloat(tail.top),bottom:r.top+parseFloat(tail.top)+parseFloat(tail.height)};
            });
            const bottom=scene.getBoundingClientRect().bottom;
            const top=Math.max(0,Math.min(...layers.map(l=>l.box.top)));
            let holes=0, firstHole=null;
            for(let col=0;col<=40;col++) {
              const x=.5+(innerWidth-1)*col/40;
              let water=false;
              for(let y=top+.5;y<bottom-.5;y+=2) {
                const painted=layers.some(l=>{
                  if(l.tail && x>=l.left && x<=l.right && y>=l.top && y<=l.bottom) return true;
                  const p=new DOMPoint(x,y).matrixTransform(l.inv);
                  return p.x>=0 && p.x<=l.width && p.y>=0 && p.y<=l.height && canvas.isPointInPath(l.d,p.x,p.y);
                });
                if(water && !painted) {holes++; firstHole ??= {x,y}; break;}
                water ||= painted;
              }
              if(!water) {holes++;firstHole ??= {x,reason:'no water reaches this column'};}
            }
            const b=scene.querySelector('[class*="boat"]').getBoundingClientRect();
            const c=header.querySelector('h1').parentElement.getBoundingClientRect();
            const collision=Math.min(b.right,c.right)>Math.max(b.left,c.left)+1 && Math.min(b.bottom,c.bottom)>Math.max(b.top,c.top)+1;
            const clipped=b.left<0 || b.right>innerWidth+1;
            result.push({frame,time:times[frame] ?? 'opposed heave',holes,firstHole,collision,clipped});
          }
          return result;
        })()`);
        waveReports.push({width,height,theme,frames});
        if(frames.some(f=>f.holes || f.collision || f.clipped)) report.failures.push('wave/boat animation coverage failed');
        if([390,1440].includes(width)) {
          const shot=await call("Page.captureScreenshot", {format:"png",captureBeyondViewport:true,
            clip:{x:0,y:Math.max(0,report.heroHeight-420),width,height:Math.min(420,report.heroHeight),scale:1}});
          writeFileSync(join(out,`${theme}-${width}-waves.png`),Buffer.from(shot.data,"base64"));
        }
      }
      reports.push(report);
      console.log(`${theme} ${width}×${height} text ${textScale*100}%${safeLeft?' safe area':''}: ${report.failures.length?report.failures.join('; '):'PASS'}`);
    }
  }
  writeFileSync(join(out,"report.json"),JSON.stringify(reports,null,2));
  writeFileSync(join(out,"waves.json"),JSON.stringify(waveReports,null,2));
  console.log(`Checked ${waveReports.reduce((n,r)=>n+r.frames.length,0)} animation frames for exposed sky and boat collisions.`);
  if(noFill) {
    if(!waveReports.some(r=>r.frames.some(f=>f.holes))) throw new Error("Negative control failed to detect the old wave gaps");
    console.log("Negative control detected the wave gaps when downward fill was disabled.");
  } else if(!baseline && reports.some(r=>r.failures.length)) process.exitCode=1;
} finally {
  socket?.close();
  browser.kill("SIGTERM");
  for (let i = 0; i < 40 && browser.exitCode === null && !browser.signalCode; i++) await delay(50);
  if (browser.exitCode === null && !browser.signalCode) browser.kill("SIGKILL");
  rmSync(profile, { recursive: true, force: true });
}
