/** User-authorized isolated headless Chrome review. No npm dependencies.
 * node tools/check-creative-v2.mjs [http://localhost:3000] [--quick]
 * Captures are review evidence, not physical-device performance measurements.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { createSeaEdition, sampleSea } from "../lib/sea-edition.ts";
import { fieldGLSL } from "../components/observatory/ocean-shaders.ts";
import { probeSeaGPU } from "./sea-gpu-probe.mjs";

const base=new URL(process.argv.find(x=>/^https?:/.test(x))||"http://localhost:3000");
if(!["localhost","127.0.0.1","[::1]"].includes(base.hostname))throw new Error("Local server required");
const quick=process.argv.includes("--quick");
const out="tools/.out/creative-home";mkdirSync(out,{recursive:true});
const articlePaths=["/blog/three-waves-one-sea","/blog/an-integral-under-sail"];
const publicPaths=["/","/samples","/blog",...articlePaths];
const chrome=process.env.CHROME_BIN||["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome","/usr/bin/google-chrome","/usr/bin/chromium"].find(existsSync);
if(!chrome)throw new Error("Chrome not found");
const profile=mkdtempSync(join(tmpdir(),"maxsash-v2-"));
const child=spawn(chrome,["--headless","--no-first-run","--no-default-browser-check","--disable-background-networking","--disable-extensions","--disable-sync","--enable-unsafe-swiftshader","--remote-debugging-port=0",`--user-data-dir=${profile}`,"about:blank"],{stdio:["ignore","ignore","pipe"]});
let browserLog="",socket;child.stderr.on("data",d=>browserLog=(browserLog+d.toString()).slice(-4000));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const results=[],errors=[],assets={};
try{
 // Legacy bookmarks must preserve their destination and authored sea identity.
 for(const [source,target] of [
   ["/samples/observatory?seed=27c4b901","/?seed=27c4b901"],
   ["/samples/atlas","/blog"],
   ["/samples/atlas/three-waves-one-sea",articlePaths[0]],
   ["/samples/atlas/an-integral-under-sail",articlePaths[1]],
 ]){
   const response=await fetch(new URL(source,base),{redirect:"manual",signal:AbortSignal.timeout(20000)});
   const location=response.headers.get("location");
   results.push({name:"legacy-redirect",source,target,status:response.status,location,pass:response.status===308&&location!==null&&new URL(location,base).href===new URL(target,base).href});
   await response.arrayBuffer();
 }
 const portPath=join(profile,"DevToolsActivePort");
 for(let i=0;!existsSync(portPath);i++){if(i>200||child.exitCode!==null)throw new Error(`Chrome startup: ${browserLog}`);await delay(50);}
 const port=readFileSync(portPath,"utf8").split("\n")[0];
 const pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 socket=new WebSocket(pages.find(p=>p.type==="page").webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener("open",resolve,{once:true});socket.addEventListener("error",reject,{once:true});});
 let id=0;const pending=new Map();
 socket.addEventListener("message",({data})=>{const message=JSON.parse(data);if(message.method==="Runtime.exceptionThrown")errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);const waiter=pending.get(message.id);if(!waiter)return;pending.delete(message.id);clearTimeout(waiter.timer);if(message.error)waiter.reject(new Error(JSON.stringify(message.error)));else waiter.resolve(message.result);});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(new Error(method+" timeout"));},45000);pending.set(key,{resolve,reject,timer});socket.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const result=await call("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;};
 await call("Page.enable");await call("Runtime.enable");
 const load=async path=>{
   const url=new URL(path,base).href;await call("Page.navigate",{url});
   for(let i=0;i<500;i++){if(await evaluate(`location.href===${JSON.stringify(url)} && document.readyState==='complete'`))break;if(i===499)throw new Error("Load timeout "+path);await delay(60);}
   await evaluate("document.fonts.ready.then(()=>true)");
   if(new URL(path,base).pathname==="/")for(let i=0;i<300;i++){if(await evaluate("Boolean(document.querySelector('canvas[data-ocean]')?.dataset.renderer)"))break;if(i===299)throw new Error("Renderer did not initialize");await delay(40);}
   await evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))");
 };
 const snapshot=async(name,full=false)=>{
   const info=await evaluate(`(()=>{const c=document.querySelector('canvas[data-ocean]');const gl=c?.getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');return {url:location.pathname,width:innerWidth,height:innerHeight,scrollY,scrollWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight,heading:document.querySelector('h1')?.textContent,renderer:c?.dataset.renderer,quality:c?.dataset.quality,frames:c?.dataset.frameCount,canvas:c?{width:c.width,height:c.height}:null,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,glError:gl?.getError(),overflow:[...document.querySelectorAll('h1,h2,h3,p,nav,a,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.x<-.5||r.right>innerWidth+.5);}).map(e=>e.textContent.trim().slice(0,80))};})()`);
   const shot=await call("Page.captureScreenshot",{format:"png",captureBeyondViewport:full,...(full?{clip:{x:0,y:0,width:info.width,height:Math.min(info.pageHeight,11000),scale:1}}:{})});
   writeFileSync(join(out,`${name}.png`),Buffer.from(shot.data,"base64"));results.push({name,...info});console.log(name,JSON.stringify({renderer:info.renderer,gpu:info.gpu,quality:info.quality,overflow:info.overflow}));return info;
 };
 await load("/");
 const homepage=await evaluate(`(()=>{const anchors=['work','writing','elsewhere'].map(id=>({id,targets:document.querySelectorAll('[id="'+id+'"]').length,links:document.querySelectorAll('a[href="#'+id+'"]').length}));return {anchors,robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(',')};})()`);
 results.push({name:"public-homepage-content",...homepage,pass:homepage.anchors.every(a=>a.targets===1&&a.links>0)&&!/\bnoindex\b/i.test(homepage.robots)});
 await load("/blog");
 const notebook=await evaluate(`(()=>({robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(','),articles:[...new Set([...document.querySelectorAll('a[href^="/blog/"]')].map(e=>e.getAttribute('href')))],legacyArticleLinks:document.querySelectorAll('a[href^="/samples/atlas/"]').length}))()`);
 results.push({name:"public-blog-index",...notebook,pass:/\bnoindex\b/i.test(notebook.robots)&&articlePaths.every(path=>notebook.articles.includes(path))&&notebook.legacyArticleLinks===0});
 for(const path of articlePaths){
   await load(path);
   const article=await evaluate(`(()=>({robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(','),heading:document.querySelector('h1')?.textContent,blogLinks:document.querySelectorAll('a[href="/blog"]').length,legacyArticleLinks:document.querySelectorAll('a[href^="/samples/atlas"]').length}))()`);
   results.push({name:"public-blog-article",path,...article,pass:/\bnoindex\b/i.test(article.robots)&&Boolean(article.heading?.trim())&&article.blogLinks>0&&article.legacyArticleLinks===0});
 }
 for(const [width,height] of (quick?[[1440,1000],[390,844]]:[[1440,1000],[390,844],[320,568],[768,1024],[1024,768],[844,390]])){
   await call("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<760});
   await call("Emulation.setEmulatedMedia",{features:[{name:"prefers-color-scheme",value:"light"},{name:"prefers-reduced-motion",value:"no-preference"}]});
   await load("/");await delay(700);await snapshot(`observatory-${width}-sea`);
   for(const p of [.52,1]){await evaluate(`(()=>{const s=document.querySelector('[data-observatory]');scrollTo(0,s.offsetTop+(s.offsetHeight-s.firstElementChild.clientHeight)*${p});})()`);await delay(120);await snapshot(`observatory-${width}-${p===1?"drawing":"reveal"}`);}
   if(!quick&&(width===1440||width===390)){
     for(const section of ["work","writing","elsewhere"]){await evaluate("document.getElementById("+JSON.stringify(section)+").scrollIntoView()");await delay(100);await snapshot("home-"+width+"-"+section);}
   }
   await load("/blog");await snapshot(`atlas-${width}`,true);
   if(!quick&&width===390){await load(articlePaths[0]);await snapshot("article-390",true);await load(articlePaths[1]);await snapshot("mark-article-390",true);}
 }
 if(!quick){
   // Exercise lifecycle instead of inferring it from stills.
   await load("/");await delay(100);
   const frames=()=>evaluate("Number(document.querySelector('canvas[data-ocean]').dataset.frameCount)");
   await evaluate("document.querySelector('button[aria-pressed]').click()");await delay(120);
   const pausedBefore=await frames();await delay(350);const pausedAfter=await frames();
   results.push({name:"pause-stops-draws",before:pausedBefore,after:pausedAfter,pass:pausedBefore===pausedAfter});
   await evaluate("document.querySelector('button[aria-pressed]').click()");await delay(350);
   results.push({name:"resume-draws",pass:(await frames())>pausedAfter});
   await evaluate("scrollTo(0,document.documentElement.scrollHeight)");await delay(180);
   const outsideBefore=await frames();await delay(350);const outsideAfter=await frames();
   results.push({name:"offscreen-stops-draws",before:outsideBefore,after:outsideAfter,pass:outsideBefore===outsideAfter});
   await evaluate("scrollTo(0,0)");await delay(150);
   results.push({name:"return-resumes-draws",pass:(await frames())>outsideBefore});
   await evaluate("document.querySelector('canvas[data-ocean]').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()");await delay(120);
   results.push({name:"context-loss-fallback",pass:await evaluate("document.querySelector('[data-observatory]').dataset.rendering==='fallback' && document.querySelector('button[aria-pressed]').disabled")});
   const edition=createSeaEdition();
   const coordinates=Array.from({length:64},(_,i)=>[-19+i*.59,13-i*.37]),times=[0,1.25,97.4];
   const gpuSamples=await evaluate("("+probeSeaGPU.toString()+")("+JSON.stringify({fieldGLSL,edition,coordinates,times})+")");
   let maximumError=0;
   times.forEach((t,j)=>coordinates.forEach(([x,z],i)=>{const s=sampleSea(edition,x,z,t);[s.height,s.dx,s.dz].forEach((v,k)=>maximumError=Math.max(maximumError,Math.abs(v-gpuSamples[j][i*3+k])));}));
   results.push({name:"gpu-cpu-field-parity",samples:192,maximumError,tolerance:.0002,pass:maximumError<.0002});
   await call("Emulation.setDeviceMetricsOverride",{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
   await load("/");await delay(400);
   console.log("Measuring 30 seconds of desktop frame delivery; this does not qualify phone performance.");
   const cadence=await evaluate("new Promise(resolve=>{const intervals=[],tasks=[];const c=document.querySelector('canvas[data-ocean]');const firstCount=Number(c.dataset.frameCount);const observer=new PerformanceObserver(list=>tasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask',buffered:false});let first=0,last=0;const step=now=>{if(!first)first=now;if(last)intervals.push(now-last);last=now;if(now-first<30000){requestAnimationFrame(step);return;}observer.disconnect();intervals.sort((a,b)=>a-b);resolve({durationMs:now-first,intervals:intervals.length,p50Ms:intervals[Math.floor(intervals.length*.5)],p95Ms:intervals[Math.floor(intervals.length*.95)],within20Ms:intervals.filter(x=>x<=20).length/intervals.length,sceneDraws:Number(c.dataset.frameCount)-firstCount,longTasks:tasks.length,longestTaskMs:Math.max(0,...tasks),quality:c.dataset.quality});};requestAnimationFrame(step);})");
   results.push({name:"desktop-frame-delivery",...cadence});
   await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
   await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Tab",code:"Tab",windowsVirtualKeyCode:9});
   results.push({name:"keyboard-skip-link",pass:await evaluate("document.activeElement?.getAttribute('href')==='#work'")});
   await call("Input.dispatchKeyEvent",{type:"keyDown",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
   await call("Input.dispatchKeyEvent",{type:"keyUp",key:"Enter",code:"Enter",windowsVirtualKeyCode:13});
   const skippedToWork="(()=>{const r=document.getElementById('work')?.getBoundingClientRect();return location.hash==='#work'&&Boolean(r&&r.top<innerHeight&&r.bottom>0);})()";
   for(let i=0;i<40;i++){if(await evaluate(skippedToWork))break;await delay(50);}
   results.push({name:"keyboard-skip-navigation",pass:await evaluate(skippedToWork)});
   await call("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
   await call("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
   await load("/");await delay(250);const before=await snapshot("reduced-motion-390");await delay(400);const count=await evaluate("document.querySelector('canvas[data-ocean]').dataset.frameCount");results.push({name:"reduced-motion-idle",before:before.frames,after:count,pass:before.frames===count});
   const injection=await call("Page.addScriptToEvaluateOnNewDocument",{source:"const originalGetContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl2'?null:originalGetContext.call(this,kind,...args)}"});
   await load("/");await snapshot("fallback-390");await call("Page.removeScriptToEvaluateOnNewDocument",{identifier:injection.identifier});
   await call("Emulation.setScriptExecutionDisabled",{value:true});
   await call("Page.navigate",{url:new URL("/",base).href});await delay(800);
   await snapshot("no-js-390");
   results.push({name:"no-js-content",pass:await evaluate("document.querySelector('h1')?.textContent.includes('Sea.') && document.querySelector('a[href=\"/blog\"]')!==null && document.querySelectorAll('#work').length===1 && !document.querySelector('canvas[data-ocean]').dataset.renderer")});
   await call("Emulation.setScriptExecutionDisabled",{value:false});
 }
 if(!quick){
   await call("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
   for(const path of publicPaths){
     await load(path);await delay(150);
     const urls=await evaluate("[...new Set(performance.getEntriesByType('resource').map(r=>r.name).filter(u=>u.includes('/_next/static/')&&/\\.(js|css|woff2)(\\?|$)/.test(u)))]");
     const html=await(await fetch(new URL(path,base))).text();
     const files=await Promise.all(urls.map(async url=>{const data=Buffer.from(await(await fetch(url)).arrayBuffer());const pathname=new URL(url).pathname;return {url:pathname,kind:pathname.split('.').pop(),raw:data.length,gzip:gzipSync(data).length,initial:html.includes(pathname)};}));
     assets[path]={html:{raw:Buffer.byteLength(html),gzip:gzipSync(html).length},files};
   }
   writeFileSync(join(out,"assets.json"),JSON.stringify(assets,null,2));
 }
 writeFileSync(join(out,"report.json"),JSON.stringify({at:new Date().toISOString(),base:base.href,mode:"headless Chrome; not physical-device performance",results,errors},null,2));
 if(errors.length||results.some(r=>r.scrollWidth>r.width+1||r.overflow?.length||r.pass===false||r.glError>0))process.exitCode=1;
 console.log(`Captured ${results.length} cases. Runtime exceptions: ${errors.length}.`);
}finally{socket?.close();child.kill("SIGTERM");for(let i=0;i<40&&child.exitCode===null&&!child.signalCode;i++)await delay(50);if(child.exitCode===null&&!child.signalCode)child.kill("SIGKILL");rmSync(profile,{recursive:true,force:true});}
