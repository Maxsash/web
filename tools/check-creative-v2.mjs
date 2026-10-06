/** User-authorized isolated headless Chrome review. No npm dependencies.
 * node tools/check-creative-v2.mjs [http://localhost:3000] [--quick]
 * --diagnose: read-only desktop load/cadence; also permits HTTPS maxsash.com.
 * Add --scroll or --native-scroll to diagnose the sea reveal instead of idle.
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
const diagnostic=process.argv.includes('--diagnose');
const nativeScroll=process.argv.includes('--native-scroll');
const scrollDiagnostic=process.argv.includes('--scroll')||nativeScroll;
const local=["localhost","127.0.0.1","[::1]"].includes(base.hostname);
if(!local&&!(diagnostic&&base.protocol==='https:'&&['maxsash.com','www.maxsash.com'].includes(base.hostname)))throw new Error("Local server required except read-only maxsash.com diagnostics");
const quick=process.argv.includes("--quick");
const out=diagnostic?`tools/.out/creative-${local?'local':'production'}-${nativeScroll?'native-scroll':scrollDiagnostic?'scroll':'diagnostic'}`:"tools/.out/creative-home";mkdirSync(out,{recursive:true});
const articlePaths=["/blog/three-waves-one-sea","/blog/an-integral-under-sail"];
const publicPaths=["/","/blog",...articlePaths];
const chrome=process.env.CHROME_BIN||["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome","/usr/bin/google-chrome","/usr/bin/chromium"].find(existsSync);
if(!chrome)throw new Error("Chrome not found");
const profile=mkdtempSync(join(tmpdir(),"maxsash-v2-"));
const child=spawn(chrome,["--headless","--no-first-run","--no-default-browser-check","--disable-background-networking","--disable-extensions","--disable-sync","--enable-unsafe-swiftshader","--remote-debugging-port=0",`--user-data-dir=${profile}`,"about:blank"],{stdio:["ignore","ignore","pipe"]});
let browserLog="",socket;child.stderr.on("data",d=>browserLog=(browserLog+d.toString()).slice(-4000));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const results=[],errors=[],assets={};
try{
 const portPath=join(profile,"DevToolsActivePort");
 for(let i=0;!existsSync(portPath);i++){if(i>200||child.exitCode!==null)throw new Error(`Chrome startup: ${browserLog}`);await delay(50);}
 const port=readFileSync(portPath,"utf8").split("\n")[0];
 const pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 socket=new WebSocket(pages.find(p=>p.type==="page").webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener("open",resolve,{once:true});socket.addEventListener("error",reject,{once:true});});
 let id=0;const pending=new Map();
 socket.addEventListener("message",({data})=>{const message=JSON.parse(data);if(message.method==="Runtime.exceptionThrown")errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);const waiter=pending.get(message.id);if(!waiter)return;pending.delete(message.id);clearTimeout(waiter.timer);if(message.error)waiter.reject(new Error(JSON.stringify(message.error)));else waiter.resolve(message.result);});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(new Error(method+" timeout"));},45000);pending.set(key,{resolve,reject,timer});socket.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async (expression,userGesture=false)=>{const result=await call("Runtime.evaluate",{expression,userGesture,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;};
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
 if(diagnostic){
   await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
   const observe=await call('Page.addScriptToEvaluateOnNewDocument',{source:"window.__seaLongTasks=[];new PerformanceObserver(list=>window.__seaLongTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});"});
   await load('/');await snapshot('desktop-opening');
   const opening=await evaluate("(()=>({navigation:performance.getEntriesByType('navigation')[0]?.toJSON(),resources:performance.getEntriesByType('resource').map(r=>r.toJSON()),writing:document.querySelector('nav[aria-label=\"Studio\"]')?.innerHTML,canvasQuality:document.querySelector('canvas[data-ocean]')?.dataset.quality}))()");
   console.log(scrollDiagnostic?'Measuring scroll reveal.':'Measuring desktop callback delivery for 30 seconds.');
   const cadence=scrollDiagnostic?null:await evaluate("new Promise(resolve=>{const intervals=[];const c=document.querySelector('canvas[data-ocean]');const before=Number(c.dataset.frameCount);let start=0,last=0;function step(now){if(!start)start=now;if(last)intervals.push(now-last);last=now;if(now-start<30000){requestAnimationFrame(step);return;}intervals.sort((a,b)=>a-b);resolve({p50Ms:intervals[Math.floor(intervals.length*.5)],p95Ms:intervals[Math.floor(intervals.length*.95)],within20Ms:intervals.filter(v=>v<=20).length/intervals.length,draws:Number(c.dataset.frameCount)-before,longTasks:window.__seaLongTasks,quality:c.dataset.quality});}requestAnimationFrame(step);})");
   results.push({name:'read-only-desktop-diagnostic',opening,cadence});
   if(scrollDiagnostic){
     await call('Performance.enable');
     for(const [width,height] of [[1440,1000],[390,844]]){
       await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile:width<760});await load('/');
       const beforeMetrics=Object.fromEntries((await call('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
       const measureScroll=`new Promise(resolve=>{const intervals=[],drawTimes=[],c=document.querySelector('canvas[data-ocean]'),scene=document.querySelector('[data-observatory]');const distance=scene.offsetHeight-scene.firstElementChild.clientHeight;const before=Number(c.dataset.frameCount),taskStart=performance.now();let start=0,last=0,lastCount=before;function step(now){if(!start)start=now;if(last)intervals.push(now-last);last=now;const count=Number(c.dataset.frameCount);if(count!==lastCount){drawTimes.push(now);lastCount=count;}const p=Math.min(1,(now-start)/8000);if(!${nativeScroll})scrollTo(0,distance*(.5-.5*Math.cos(p*Math.PI*4)));if(p<1){requestAnimationFrame(step);return;}const drawIntervals=drawTimes.slice(1).map((t,i)=>t-drawTimes[i]);intervals.sort((a,b)=>a-b);drawIntervals.sort((a,b)=>a-b);resolve({width:innerWidth,height:innerHeight,p50Ms:intervals[Math.floor(intervals.length*.5)],p95Ms:intervals[Math.floor(intervals.length*.95)],drawP95Ms:drawIntervals[Math.floor(drawIntervals.length*.95)],within20Ms:intervals.filter(x=>x<=20).length/intervals.length,sceneDraws:Number(c.dataset.frameCount)-before,longTasks:window.__seaLongTasks.filter(t=>t.start>=taskStart),quality:c.dataset.quality,canvasPixels:c.width*c.height,scrollY,chapter:scene.dataset.chapter});}requestAnimationFrame(step);})`;
       if(nativeScroll){
         await call("Runtime.evaluate",{expression:"window.__scrollMeasurement="+measureScroll});
         const distance=await evaluate("(()=>{const s=document.querySelector('[data-observatory]');return s.offsetHeight-s.firstElementChild.clientHeight;})()");
         await call("Input.synthesizeScrollGesture",{x:width/2,y:height/2,yDistance:-distance,speed:Math.max(1,Math.round(distance/7)),gestureSourceType:width<760?"touch":"mouse"});
       }
       const scroll=await evaluate(nativeScroll?"window.__scrollMeasurement":measureScroll);
       const afterMetrics=Object.fromEntries((await call('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
       scroll.metrics=Object.fromEntries(['RecalcStyleCount','RecalcStyleDuration','LayoutCount','LayoutDuration','TaskDuration'].map(name=>[name,afterMetrics[name]-beforeMetrics[name]]));
       results.push({name:nativeScroll?'browser-gesture-scroll-reveal':'programmatic-scroll-reveal',...scroll});console.log('scroll',JSON.stringify(scroll));
     }
   }
   await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:observe.identifier});
 }else{
 await load("/");
 const homepage=await evaluate(`(()=>{const anchors=['work','sea-studio','notebook','elsewhere'].map(id=>({id,targets:document.querySelectorAll('[id="'+id+'"]').length,links:document.querySelectorAll('a[href="#'+id+'"]').length}));return {anchors,robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(',')};})()`);
 results.push({name:"public-homepage-content",...homepage,pass:homepage.anchors.every(a=>a.targets===1&&(a.id==='notebook'||a.links>0))&&!/\bnoindex\b/i.test(homepage.robots)});
 const writing=await evaluate("document.querySelector('nav[aria-label=\"Studio\"] a[href=\"/blog\"]')?.textContent");
 const notebookLinks=await evaluate("document.querySelectorAll('a[href=\"/blog\"]').length");
results.push({name:"notebook-direct-link",pass:writing==='Notebook'});
// One nav link, one section link, nothing duplicated under Elsewhere.
results.push({name:"notebook-not-repeated",notebookLinks,pass:notebookLinks===2&&await evaluate("!document.querySelector('#elsewhere a[href=\"/blog\"]')")});
// The sea studio: four real controls, a live plate, and every way to keep the result.
const studio=await evaluate(`(async()=>{
 const root=document.getElementById('sea-studio');const sliders=[...root.querySelectorAll('input[type=range]')];
 const plateOf=()=>root.querySelector('svg')?.innerHTML.length+':'+root.querySelector('svg')?.querySelector('polyline')?.getAttribute('points').slice(0,80);
 const seedOf=()=>root.querySelector('figcaption code')?.textContent;
 const before=plateOf(),seedBefore=seedOf();
 const set=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(v));el.dispatchEvent(new Event('input',{bubbles:true}));};
 set(sliders[0],240);await new Promise(r=>setTimeout(r,300));
 const after=plateOf(),seedAfter=seedOf();
 [...root.querySelectorAll('button')].find(b=>b.textContent==='Glass').click();await new Promise(r=>setTimeout(r,300));
 const glass=seedOf();
 const links=[...root.querySelectorAll('a')].map(a=>a.getAttribute('href'));
 return {sliders:sliders.length,labelled:sliders.every(s=>document.querySelector('label[for="'+s.id+'"]')),before,after,seedBefore,seedAfter,glass,links,
  sail:links.some(h=>/^\\/\\?seed=[0-9a-f]{8}&version=2$/.test(h)),print:links.some(h=>/^\\/plate\\?seed=[0-9a-f]{8}&version=2&print=1$/.test(h)),save:links.some(h=>/download=1/.test(h))};
})()`);
results.push({name:"sea-studio-controls-and-keepsakes",...studio,pass:studio.sliders===4&&studio.labelled&&studio.before!==studio.after&&studio.seedBefore!==studio.seedAfter&&studio.glass==='1e801407'&&studio.sail&&studio.print&&studio.save});
 const projectContent=await evaluate("(()=>{const w=document.getElementById('work');return {titles:[...w.querySelectorAll('article')].map(e=>e.getAttribute('aria-label')),links:[...w.querySelectorAll('a')].map(a=>a.getAttribute('href'))};})()");
 results.push({name:'real-projects-and-case-studies',...projectContent,pass:projectContent.titles.join('|')==='Household Hub|Wedding Photo Platform'&&['https://tenant-management-2my6.vercel.app/','https://wedding-demo-teal.vercel.app/','https://ctrl-alt-yash.github.io/portfolio/case-study/tenant-manager.html','https://ctrl-alt-yash.github.io/portfolio/case-study/wedding-site.html'].every(url=>projectContent.links.includes(url))&&!projectContent.links.includes('#')});
 results.push({name:'approved-work-spreads',pass:await evaluate("(()=>{const w=document.getElementById('work'),images=[...w.querySelectorAll('img')];return images.length===2&&images.every(i=>i.getAttribute('src').includes('%2Fimages%2Fwork%2F'))&&images[0].alt.includes('light theme')&&!!w.querySelector('h2#work-heading')&&w.querySelectorAll('h3').length===2&&!w.textContent.includes('awaiting selection');})()")});
 results.push({name:'approved-elsewhere-and-contact',pass:await evaluate("(()=>{const e=document.getElementById('elsewhere');return e.querySelectorAll('ul a').length===2&&e.querySelector('h2#elsewhere-heading')!==null&&e.querySelector('a[href=\"mailto:yash@maxsash.com\"]')!==null&&document.querySelectorAll('main h1').length===1&&document.querySelectorAll('footer').length===1&&!document.querySelector('main footer')&&document.querySelectorAll('main').length===1;})()")});
 results.push({name:'portfolio-replaces-placeholder-destinations',pass:await evaluate("!!document.querySelector('#elsewhere a[href=\"https://ctrl-alt-yash.github.io/portfolio/\"]') && !document.querySelector('#elsewhere a[href=\"/resume.pdf\"]') && !document.querySelector('#elsewhere a[href=\"https://www.maxsash.com\"]')")});

 await evaluate("document.querySelector('nav[aria-label=\"Studio\"] a[href=\"/blog\"]').click()");
 for(let i=0;i<100;i++){if(await evaluate("location.pathname==='/blog' && Boolean(document.querySelector('h1')) && !document.querySelector('canvas[data-ocean]')"))break;await delay(50);}
 results.push({name:"notebook-one-click-navigation",pass:await evaluate("location.pathname==='/blog' && !document.querySelector('canvas[data-ocean]')")});
 await load('/');results.push({name:'desktop-remains-continuous',pass:await evaluate("!document.querySelector('[data-observatory]').dataset.staged && getComputedStyle(document.querySelector('[data-stage-controls]')).display==='none'")});
 await load("/blog");
 const notebook=await evaluate(`(()=>({robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(','),articles:[...new Set([...document.querySelectorAll('a[href^="/blog/"]')].map(e=>e.getAttribute('href')))]}))()`);
 results.push({name:"public-blog-index",...notebook,pass:/\bnoindex\b/i.test(notebook.robots)&&articlePaths.every(path=>notebook.articles.includes(path))});
 for(const path of articlePaths){
   await load(path);
   const article=await evaluate(`(()=>({robots:[...document.querySelectorAll('meta[name="robots"]')].map(e=>e.content).join(','),heading:document.querySelector('h1')?.textContent,blogLinks:document.querySelectorAll('a[href="/blog"]').length}))()`);
   results.push({name:"public-blog-article",path,...article,pass:/\bnoindex\b/i.test(article.robots)&&Boolean(article.heading?.trim())&&article.blogLinks>0});
 }
 for(const [width,height] of (quick?[[1440,1000],[390,844]]:[[1440,1000],[390,844],[320,568],[768,1024],[1024,768],[844,390]])){
   await call("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<760});
   await call("Emulation.setEmulatedMedia",{features:[{name:"prefers-color-scheme",value:"light"},{name:"prefers-reduced-motion",value:"no-preference"}]});
   await load("/");await delay(700);await snapshot(`observatory-${width}-sea`);
   if(width<760){const budget=await evaluate("(()=>{const c=document.querySelector('canvas[data-ocean]');return {pixels:c.width*c.height,triangles:Number(c.dataset.triangles),quality:c.dataset.quality};})()");results.push({name:'compact-render-budget',width,...budget,pass:budget.pixels<=361200&&budget.triangles===21600&&budget.quality==='compact'});}
   for(const p of [.52,1]){await evaluate(`(()=>{const s=document.querySelector('[data-observatory]');scrollTo(0,s.offsetTop+(s.offsetHeight-s.firstElementChild.clientHeight)*${p});})()`);await delay(120);await snapshot(`observatory-${width}-${p===1?"drawing":"reveal"}`);}
   if(!quick&&(width===1440||width===390)){
     for(const section of ["work","sea-studio","notebook","elsewhere"]){await evaluate("document.getElementById("+JSON.stringify(section)+").scrollIntoView()");await delay(100);await snapshot("home-"+width+"-"+section);}
   }
   if(width===1440||width===390){
     await evaluate("document.getElementById('work').scrollIntoView({behavior:'instant'})");await delay(300);
     const clip=await evaluate("(()=>{const r=document.getElementById('work').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth,height:r.height,scale:1};})()");
     const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});writeFileSync(join(out,`home-${width}-work-spreads.png`),Buffer.from(shot.data,'base64'));
     results.push({name:'work-spread-figure-layout',width,pass:await evaluate("(()=>{const w=document.getElementById('work'),figures=[...w.querySelectorAll('figure')];return figures.length===2&&figures.every(f=>{const r=f.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth+1;});})()")});
   }
   if(width===1440||width===390){
     await evaluate("document.getElementById('elsewhere').scrollIntoView({behavior:'instant'})");await delay(100);
     const clip=await evaluate("(()=>{const r=document.getElementById('elsewhere').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth,height:r.height,scale:1};})()");
     const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});writeFileSync(join(out,`home-${width}-elsewhere-spread.png`),Buffer.from(shot.data,'base64'));
     results.push({name:'elsewhere-link-layout',width,pass:await evaluate("[...document.querySelectorAll('#elsewhere a')].every(a=>{const r=a.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.height>=44;})")});
   }
   await load("/blog");await snapshot(`atlas-${width}`,true);
   if(!quick&&width===390){await load(articlePaths[0]);await snapshot("article-390",true);await load(articlePaths[1]);await snapshot("mark-article-390",true);}
 }
 if(!quick){
   // Exercise lifecycle instead of inferring it from stills.
   await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await load('/');
   await evaluate("document.documentElement.style.fontSize='200%';document.getElementById('elsewhere').scrollIntoView({behavior:'instant'})");await delay(100);results.push({name:'elsewhere-390-text-200',pass:await evaluate("[...document.querySelectorAll('#elsewhere h2,#elsewhere h3,#elsewhere p,#elsewhere a')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;})")});
   await evaluate("document.documentElement.style.fontSize=''");
   await load("/");await delay(100);
   const frames=()=>evaluate("Number(document.querySelector('canvas[data-ocean]').dataset.frameCount)");
   await evaluate("document.querySelector('button[aria-pressed]').click()");await delay(120);
   const pausedBefore=await frames();await delay(350);const pausedAfter=await frames();
   results.push({name:"pause-stops-draws",before:pausedBefore,after:pausedAfter,pass:pausedBefore===pausedAfter});
   const coalesced=await evaluate(`(async()=>{const s=document.querySelector('[data-observatory]'),c=s.querySelector('canvas[data-ocean]');const intro=s.querySelector('h1').parentElement,middle=[...s.querySelectorAll('h2')].find(e=>e.textContent.includes('Wonder'))?.parentElement;const before=Number(c.dataset.frameCount),opacityBefore=intro.style.opacity;scrollTo(0,s.offsetTop+(s.offsetHeight-s.firstElementChild.clientHeight)*.52);for(let i=0;i<100;i++)window.dispatchEvent(new Event('scroll'));const synchronousChange=intro.style.opacity!==opacityBefore;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {draws:Number(c.dataset.frameCount)-before,synchronousChange,introOpacity:intro.style.opacity,middleOpacity:middle?.style.opacity,chapter:s.dataset.chapter,inheritedOpacityWrites:['--intro-opacity','--middle-opacity','--end-opacity','--ink-progress'].some(name=>s.style.getPropertyValue(name)!=='')};})()`);
   results.push({name:'scroll-reveal-coalesces-with-draw',...coalesced,pass:!coalesced.synchronousChange&&!coalesced.inheritedOpacityWrites&&coalesced.draws>=1&&coalesced.draws<=2&&coalesced.introOpacity==='0'&&coalesced.middleOpacity==='1'&&coalesced.chapter==='structure'});
   await evaluate("document.querySelector('button[aria-pressed]').click()");await delay(350);
   results.push({name:"resume-draws",pass:(await frames())>pausedAfter});
   await evaluate("scrollTo(0,document.documentElement.scrollHeight)");await delay(180);
   const outsideBefore=await frames();await delay(350);const outsideAfter=await frames();
   results.push({name:"offscreen-stops-draws",before:outsideBefore,after:outsideAfter,pass:outsideBefore===outsideAfter});
   await evaluate("scrollTo(0,0)");await delay(150);
   results.push({name:"return-resumes-draws",pass:(await frames())>outsideBefore});
   results.push({name:'gpu-covers-static-plate',pass:await evaluate("getComputedStyle(document.querySelector('canvas[data-ocean]').parentElement.firstElementChild).visibility==='hidden'")});
   await evaluate(`(()=>{const gl=document.querySelector('canvas[data-ocean]').getContext('webgl2');window.__seaDeletes={buffers:0,arrays:0,programs:0};for(const [method,key] of [['deleteBuffer','buffers'],['deleteVertexArray','arrays'],['deleteProgram','programs']]){const original=gl[method].bind(gl);gl[method]=object=>{window.__seaDeletes[key]++;return original(object);};}gl.getExtension('WEBGL_lose_context').loseContext();})()`);await delay(120);
   results.push({name:"context-loss-fallback",pass:await evaluate("document.querySelector('[data-observatory]').dataset.rendering==='fallback' && document.querySelector('button[aria-pressed]').disabled && getComputedStyle(document.querySelector('canvas[data-ocean]').parentElement.firstElementChild).visibility==='visible'")});
   const released=await evaluate("window.__seaDeletes");
   results.push({name:"context-loss-releases-engine",...released,pass:released.buffers===3&&released.arrays===3&&released.programs===3});
   const lostBefore=await frames();await delay(350);
   results.push({name:"context-loss-stops-draws",pass:(await frames())===lostBefore});
   // Version 1's default and version 2's roughest preset: the shader must agree with the CPU for both.
   const coordinates=Array.from({length:64},(_,i)=>[-19+i*.59,13-i*.37]),times=[0,1.25,97.4];
   let maximumError=0;
   for(const edition of [createSeaEdition(),createSeaEdition("f532e107","2")]){
     const gpuSamples=await evaluate("("+probeSeaGPU.toString()+")("+JSON.stringify({fieldGLSL,edition,coordinates,times})+")");
     times.forEach((t,j)=>coordinates.forEach(([x,z],i)=>{const s=sampleSea(edition,x,z,t);[s.height,s.dx,s.dz].forEach((v,k)=>maximumError=Math.max(maximumError,Math.abs(v-gpuSamples[j][i*3+k])));}));
   }
   results.push({name:"gpu-cpu-field-parity",samples:384,editions:["v1 5ea5cafe","v2 f532e107"],maximumError,tolerance:.0002,pass:maximumError<.0002});
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
   const failedLink=await call("Page.addScriptToEvaluateOnNewDocument",{source:"const originalParameter=WebGL2RenderingContext.prototype.getProgramParameter;WebGL2RenderingContext.prototype.getProgramParameter=function(program,parameter){return parameter===this.LINK_STATUS?false:originalParameter.call(this,program,parameter)}"});
   await load("/");
   results.push({name:"shader-link-failure-fallback",pass:await evaluate("document.querySelector('[data-observatory]').dataset.rendering==='fallback' && document.querySelector('button[aria-pressed]').disabled && !document.querySelector('canvas[data-ocean]').dataset.frameCount && Boolean(document.querySelector('#work'))")});
   await call("Page.removeScriptToEvaluateOnNewDocument",{identifier:failedLink.identifier});
   await call("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
   const slowFrames=await call("Page.addScriptToEvaluateOnNewDocument",{source:"window.__seaRAFDelay=65;window.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),window.__seaRAFDelay);window.cancelAnimationFrame=id=>clearTimeout(id);"});
   await load("/");await delay(2800);
   const slowBudget=await evaluate("(()=>{const c=document.querySelector('canvas[data-ocean]');return {quality:c.dataset.quality,pixels:c.width*c.height,frames:Number(c.dataset.frameCount)};})()");
   results.push({name:'sustained-slow-delivery-downgrades',...slowBudget,pass:slowBudget.quality==='low'&&slowBudget.pixels<=177500&&slowBudget.frames>12});
   await evaluate('window.__seaRAFDelay=8');await delay(100);
   const scrollPriority=await evaluate(`(async()=>{const c=document.querySelector('canvas[data-ocean]'),s=document.querySelector('[data-observatory]');const before=Number(c.dataset.frameCount),distance=s.offsetHeight-s.firstElementChild.clientHeight;for(let i=0;i<20;i++){await new Promise(r=>requestAnimationFrame(r));scrollTo(0,distance*(i+1)/30);window.dispatchEvent(new Event('scroll'));}await new Promise(r=>requestAnimationFrame(r));return {draws:Number(c.dataset.frameCount)-before,quality:c.dataset.quality};})()`);
   results.push({name:'scroll-bypasses-idle-low-cadence',...scrollPriority,pass:scrollPriority.draws>=15&&scrollPriority.quality==='low'});
   await call("Page.removeScriptToEvaluateOnNewDocument",{identifier:slowFrames.identifier});
   const fastFrames=await call("Page.addScriptToEvaluateOnNewDocument",{source:"window.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),8);window.cancelAnimationFrame=id=>clearTimeout(id);"});
   await load("/");await delay(100);const fastBefore=await frames();await delay(500);const fastDraws=(await frames())-fastBefore;
   results.push({name:'high-refresh-bounds-draws',drawsIn500Ms:fastDraws,pass:fastDraws>=12&&fastDraws<=34});
   await call("Page.removeScriptToEvaluateOnNewDocument",{identifier:fastFrames.identifier});
   const coarsePointer=await call("Page.addScriptToEvaluateOnNewDocument",{source:"const originalMatchMedia=window.matchMedia.bind(window);window.matchMedia=query=>originalMatchMedia(query==='(pointer: coarse)'?'(min-width: 0px)':query);"});
   await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:3,mobile:true});
   await load('/');
   const landscape=await evaluate("(()=>{const c=document.querySelector('canvas[data-ocean]');return {pixels:c.width*c.height,triangles:Number(c.dataset.triangles),quality:c.dataset.quality};})()");
   results.push({name:'touch-landscape-compact-budget',...landscape,pass:landscape.pixels<=361200&&landscape.triangles===21600&&landscape.quality==='compact'});
   await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
   await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
   await load('/');await snapshot('staged-390-sea');
   await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:100,y:400,id:1}]});
   await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:260,y:410,id:1}]});
   await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   results.push({name:'mobile-horizontal-gesture-keeps-stage',pass:await evaluate("document.querySelector('[data-observatory]').dataset.stage==='0'")});
   await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:400,id:1},{x:210,y:400,id:2}]});
   await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:400,id:1},{x:260,y:400,id:2}]});
   await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   results.push({name:'mobile-multitouch-keeps-stage',pass:await evaluate("document.querySelector('[data-observatory]').dataset.stage==='0'")});
   await call('Emulation.setPageScaleFactor',{pageScaleFactor:1});
   const swipe=async(direction,settle)=>{
     const openingReveal=direction>0&&await evaluate("document.querySelector('[data-observatory]').dataset.stage==='0'");
     const from=direction>0?620:300,to=direction>0?300:620;
     await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:from,id:1}]});
     await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:(from+to)/2,id:1}]});await delay(20);
     await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:to,id:1}]});
     await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     if(openingReveal&&settle===undefined){
       const reveal=()=>evaluate("(()=>{const gl=document.querySelector('canvas[data-ocean]').getContext('webgl2');const program=gl.getParameter(gl.CURRENT_PROGRAM);return gl.getUniform(program,gl.getUniformLocation(program,'uReveal'));})()");
       await delay(200);const early=await reveal();
       await delay(600);const middle=await reveal();
       await delay(800);const late=await reveal();
       await delay(280);const end=await reveal();
       results.push({name:'mobile-opening-reveal-spreads-through-duration',early,middle,late,end,pass:early>.05&&early<.25&&middle>early+.1&&late>middle+.05&&Math.abs(end-(.55-.14)/.75)<.002});
     }else await delay(settle??680);
   };
   for(let index=1;index<=2;index++){
     await swipe(1);
     const state=await evaluate("(()=>{const s=document.querySelector('[data-observatory]');return {stage:s.dataset.stage,scrollY,label:s.querySelector('[data-stage-label]').textContent};})()");
     results.push({name:'mobile-swipe-one-stage',index,...state,pass:state.stage===String(index)&&state.scrollY<=2&&state.label===`${index+1} / 3 · ${['Sea','Structure','Drawing'][index]}`});
     await snapshot('staged-390-'+['sea','structure','drawing'][index]);
     if(index===1){
       await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:3,mobile:true});await delay(180);
       const rotated=await evaluate("(()=>{const s=document.querySelector('[data-observatory]'),c=s.querySelector('canvas');return {stage:s.dataset.stage,chapter:s.dataset.chapter,staged:s.dataset.staged,pixels:c.width*c.height,triangles:Number(c.dataset.triangles)};})()");
       results.push({name:'mobile-rotation-retains-structure',...rotated,pass:rotated.stage==='1'&&rotated.chapter==='structure'&&rotated.staged==='true'&&rotated.pixels<=361200&&rotated.triangles===21600});
       await snapshot('staged-landscape-structure');
       await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await delay(180);
       results.push({name:'mobile-rotation-return-retains-stage',pass:await evaluate("document.querySelector('[data-observatory]').dataset.stage==='1' && document.querySelector('[data-observatory]').dataset.chapter==='structure' && scrollY<=2")});
     }
   }
   await call('Input.synthesizeScrollGesture',{x:180,y:600,yDistance:-350,speed:900,gestureSourceType:'touch'});await delay(200);
   results.push({name:'mobile-final-stage-releases-page',pass:await evaluate("scrollY>30 && document.querySelector('[data-observatory]').dataset.stage==='2'")});
   await evaluate('scrollTo(0,0)');await delay(100);await swipe(-1);
   results.push({name:'mobile-reverse-one-stage',pass:await evaluate("document.querySelector('[data-observatory]').dataset.stage==='1' && scrollY<=2")});

   await swipe(-1);
   await swipe(1,150);await swipe(-1);
   results.push({name:'mobile-interrupted-reveal-reverses',pass:await evaluate("document.querySelector('[data-observatory]').dataset.stage==='0' && document.querySelector('[data-observatory]').dataset.chapter==='sea' && scrollY<=2")});
   await delay(1300);
   results.push({name:'mobile-interrupted-reveal-stays-reversed',pass:await evaluate("document.querySelector('[data-observatory]').dataset.stage==='0' && document.querySelector('[data-observatory]').dataset.chapter==='sea'")});
   await evaluate("document.querySelector('button[aria-pressed]').click()");
   await swipe(1);
   const pausedFrames=await frames();await delay(200);
   results.push({name:'mobile-paused-sea-stage-settles',pass:await evaluate("document.querySelector('[data-observatory]').dataset.stage==='1' && document.querySelector('[data-observatory]').dataset.chapter==='structure' && document.querySelector('button[aria-pressed]').getAttribute('aria-pressed')==='true'")&&(await frames())===pausedFrames});
   await evaluate("document.querySelector('button[aria-pressed]').click()");
   await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
   await evaluate("document.querySelector('[data-stage-next]').click()");await delay(120);
   const stillBefore=await frames();await delay(200);
   results.push({name:'mobile-reduced-motion-stage-still',pass:await evaluate("document.querySelector('[data-observatory]').dataset.stage==='2' && document.querySelector('[data-stage-label]').textContent.includes('Drawing')")&&(await frames())===stillBefore});
   await evaluate("document.querySelector('[data-stage-next]').click()");await delay(100);
   results.push({name:'mobile-stage-button-exits-to-work',pass:await evaluate("document.getElementById('work').getBoundingClientRect().top<innerHeight && scrollY>30")});
   await call('Emulation.setDeviceMetricsOverride',{width:320,height:568,deviceScaleFactor:1,mobile:true});await load('/');await snapshot('staged-320-sea');
   await call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await load('/');await snapshot('staged-landscape-sea');
   await call("Page.removeScriptToEvaluateOnNewDocument",{identifier:coarsePointer.identifier});
   await call('Emulation.setTouchEmulationEnabled',{enabled:false});
   await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
   await call("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
   const injection=await call("Page.addScriptToEvaluateOnNewDocument",{source:"const originalGetContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl2'?null:originalGetContext.call(this,kind,...args)}"});
   await load("/");await snapshot("fallback-390");await call("Page.removeScriptToEvaluateOnNewDocument",{identifier:injection.identifier});
   await call("Emulation.setScriptExecutionDisabled",{value:true});
   await call("Page.navigate",{url:new URL("/",base).href});await delay(800);
   await snapshot("no-js-390");
   results.push({name:"no-js-content",pass:await evaluate("document.querySelector('h1')?.textContent.includes('Sea.') && document.querySelector('a[href=\"/blog\"]')!==null && document.querySelectorAll('#work').length===1 && !document.querySelector('canvas[data-ocean]').dataset.renderer")});
   await call("Emulation.setScriptExecutionDisabled",{value:false});
 }
 // Coastal exploration: theme, viewport scheduling, tracks, and explicit sound controls.
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'},{name:'prefers-color-scheme',value:'light'}]});
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await load('/');
 await evaluate("localStorage.setItem('studio-wave-sound','off')");await load('/');
 await evaluate("localStorage.removeItem('studio-theme');document.documentElement.dataset.studioTheme='day';window.dispatchEvent(new Event('studio-theme'))");
 await delay(800);await snapshot('coast-day-sea');
 const shoreFrames=()=>evaluate("Number(document.querySelector('[data-shore] canvas').dataset.shoreFrames)");
 await delay(150);const offscreen=await shoreFrames();await delay(180);
 results.push({name:'shore-offscreen-stops',pass:offscreen===await shoreFrames()});
 await evaluate("document.querySelector('[data-shore]').scrollIntoView({block:'end'})");await delay(250);
 await snapshot('coast-day-shore');
 const active=await shoreFrames();await delay(180);
 results.push({name:'shore-visible-animates',pass:await shoreFrames()>active});
 const point=await evaluate("(()=>{const r=document.querySelector('[data-shore]').getBoundingClientRect();return {x:80,y:Math.min(innerHeight-80,r.bottom-100)}})()");
 for(let i=0;i<8;i++)await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x+i*30,y:point.y});
 await delay(80);
 results.push({name:'shore-mouse-tracks',pass:await evaluate("Number(document.querySelector('[data-shore] canvas').dataset.shoreSteps)>0")});
 await evaluate("document.querySelector('[data-shore-pause]').click()");await delay(100);const paused=await shoreFrames();await delay(180);
 results.push({name:'shore-paused-stops',pass:paused===await shoreFrames()});
 await evaluate("document.querySelector('[data-theme-toggle]').click()");await delay(150);
 await snapshot('coast-night-shore');
 results.push({name:'night-theme-synchronizes',pass:await evaluate("document.documentElement.dataset.studioTheme==='night' && [...document.querySelectorAll('[data-theme-toggle]')].every(b=>b.getAttribute('aria-pressed')==='true')")});
 await evaluate("document.querySelector('[data-wave-sound]').click()",true);await delay(200);
 results.push({name:'wave-sound-manual-enable',pass:await evaluate("document.querySelector('[data-wave-sound]').getAttribute('aria-pressed')==='true'")});
 await evaluate("document.querySelector('[data-wave-sound]').click()",true);await delay(100);
 results.push({name:'wave-sound-off',pass:await evaluate("document.querySelector('[data-wave-sound]').getAttribute('aria-pressed')==='false'")});
 // Ordinary page interaction must stay silent; only sound controls start playback.
 await evaluate("localStorage.removeItem('studio-wave-sound')");await load('/');
 results.push({name:'wave-sound-default-silent',pass:await evaluate("[...document.querySelectorAll('[data-wave-sound]')].every(b=>b.textContent.includes('Play waves') && b.getAttribute('aria-pressed')==='false')")});
 await call('Input.dispatchMouseEvent',{type:'mousePressed',x:1200,y:700,button:'left',clickCount:1});
 await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:1200,y:700,button:'left',clickCount:1});await delay(250);
 results.push({name:'ordinary-click-keeps-sound-off',pass:await evaluate("[...document.querySelectorAll('[data-wave-sound]')].every(b=>b.getAttribute('aria-pressed')==='false')")});
 await call('Input.synthesizeScrollGesture',{x:1200,y:700,yDistance:-200,speed:900,gestureSourceType:'mouse'});await delay(150);
 results.push({name:'ordinary-scroll-keeps-sound-off',pass:await evaluate("document.querySelector('[data-wave-sound]').getAttribute('aria-pressed')==='false'")});
 await evaluate("document.querySelector('[data-wave-sound]').click()",true);await delay(200);
 results.push({name:'play-button-synchronizes-both-controls',pass:await evaluate("[...document.querySelectorAll('[data-wave-sound]')].every(b=>b.getAttribute('aria-pressed')==='true')")});
 await evaluate("document.querySelector('[data-wave-sound]').click()",true);
 await call('Input.dispatchMouseEvent',{type:'mousePressed',x:1200,y:700,button:'left',clickCount:1});
 await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:1200,y:700,button:'left',clickCount:1});await delay(100);
 results.push({name:'wave-sound-mute-prevents-restart',pass:await evaluate("[...document.querySelectorAll('[data-wave-sound]')].every(b=>b.getAttribute('aria-pressed')==='false')")});
 await load('/');
 results.push({name:'wave-sound-mute-persists',pass:await evaluate("document.querySelector('[data-wave-sound]').getAttribute('aria-pressed')==='false' && localStorage.getItem('studio-wave-sound')==='off'")});
 await call('Emulation.setTouchEmulationEnabled',{enabled:true});
 await evaluate("localStorage.removeItem('studio-wave-sound')");await load('/');
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:1000,y:700,id:1}]});
 await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(250);
 results.push({name:'ordinary-touch-keeps-sound-off',pass:await evaluate("document.querySelector('[data-wave-sound]').getAttribute('aria-pressed')==='false'")});
 const soundPoint=await evaluate("(()=>{const r=document.querySelector('[data-wave-sound]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...soundPoint,id:1}]});
 await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(250);
 results.push({name:'sound-button-touch-plays',pass:await evaluate("document.querySelector('[data-wave-sound]').getAttribute('aria-pressed')==='true'")});
 await evaluate("document.querySelector('[data-wave-sound]').click()",true);
 await call('Emulation.setTouchEmulationEnabled',{enabled:false});
 await load('/');await delay(800);await snapshot('coast-night-sea');
 results.push({name:'night-theme-persists',pass:await evaluate("document.documentElement.dataset.studioTheme==='night'")});
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await load('/');await evaluate("document.querySelector('[data-shore]').scrollIntoView({block:'end'})");await delay(200);
 await snapshot('coast-night-mobile');const still=await shoreFrames();await delay(180);
 results.push({name:'shore-reduced-motion-still-and-bounded',pass:still===await shoreFrames()&&await evaluate("Number(document.querySelector('[data-shore] canvas').dataset.shorePixels)<=421200 && document.querySelector('[data-wave-sound]').getAttribute('aria-pressed')==='false' && document.querySelector('a[href=\"https://github.com/ctrl-alt-yash\"]')!==null")});
 await evaluate("document.querySelector('[data-theme-toggle]').click()");await delay(120);await snapshot('coast-day-mobile');
 for(const theme of ['day','night']){
   if(theme==='night'){await evaluate("document.querySelector('[data-theme-toggle]').click()");await delay(100);}
   const clip=await evaluate("(()=>{const r=document.querySelector('[data-shore]').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:innerWidth,height:r.height,scale:1}})()");
   const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
   writeFileSync(join(out,`coast-${theme}-mobile-full.png`),Buffer.from(shot.data,'base64'));
 }
 await evaluate("document.querySelector('[data-theme-toggle]').click()");

 results.push({name:'control-placement',pass:await evaluate("document.querySelectorAll('[data-theme-toggle]').length===1 && document.querySelector('[data-shore] [data-theme-toggle]')!==null && document.querySelectorAll('[data-wave-sound]').length===2 && document.querySelector('header [data-wave-sound]')!==null")});
 await evaluate("localStorage.removeItem('studio-theme')");
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});await load('/');await delay(100);
 results.push({name:'theme-default-follows-system-dark',pass:await evaluate("document.documentElement.dataset.studioTheme==='night'")});
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});await delay(100);
 results.push({name:'theme-follows-system-change',pass:await evaluate("document.documentElement.dataset.studioTheme==='day'")});
 await evaluate("document.querySelector('[data-theme-toggle]').click()");
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});await delay(100);
 results.push({name:'manual-theme-overrides-system',pass:await evaluate("document.documentElement.dataset.studioTheme==='night'")});
 await evaluate("document.querySelector('[data-theme-toggle]').click()");

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
 }
 writeFileSync(join(out,"report.json"),JSON.stringify({at:new Date().toISOString(),base:base.href,mode:"headless Chrome; not physical-device performance",results,errors},null,2));
 if(errors.length||results.some(r=>r.scrollWidth>r.width+1||r.overflow?.length||r.pass===false||r.glError>0))process.exitCode=1;
 console.log(`Captured ${results.length} cases. Runtime exceptions: ${errors.length}.`);
}finally{socket?.close();child.kill("SIGTERM");for(let i=0;i<40&&child.exitCode===null&&!child.signalCode;i++)await delay(50);if(child.exitCode===null&&!child.signalCode)child.kill("SIGKILL");rmSync(profile,{recursive:true,force:true});}
