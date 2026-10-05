"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { WaveSoundControl, WaveSoundController } from "./WaveSound";
import ThemeControl from "@/components/observatory/ThemeControl";
import { site } from "@/content/site";
import styles from "./Shore.module.css";

type Step={x:number;y:number;angle:number;born:number;side:number};

export default function Shoreline({children,version,commit}:{children:ReactNode;version:string;commit:string|null}) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const pauseRef=useRef<(()=>boolean)|null>(null);
  const [paused,setPaused]=useState(false);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const context=canvas.getContext("2d",{alpha:false});if(!context)return;
    const base=document.createElement("canvas"),grain=base.getContext("2d",{alpha:false});if(!grain)return;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let visible=false,stopped=false,frame=0,last=0,time=0,width=1,height=1,night=false;
    let steps:Step[]=[],previous:{x:number;y:number}|null=null,side=1;
    const events=new AbortController();
    const shoreline=(x:number,t=time)=>height*(.085+.010*Math.sin(x/width*7+t*.35)+.006*Math.sin(x/width*17-t*.21)+.014*Math.sin(t*.55));
    const shell=(x:number,y:number,size:number,angle:number)=>{
      grain.save();grain.translate(x,y);grain.rotate(angle);grain.shadowColor="rgba(38,25,17,.3)";grain.shadowBlur=3;grain.shadowOffsetY=2;
      const tint=grain.createLinearGradient(-size,-size,size,size);tint.addColorStop(0,night?"#b6a795":"#f7e9d5");tint.addColorStop(.55,night?"#75685b":"#d9ad88");tint.addColorStop(1,night?"#c6b299":"#f9e7c9");
      grain.fillStyle=tint;grain.beginPath();grain.moveTo(0,size*.45);grain.bezierCurveTo(-size*1.1,size*.3,-size,-size*.85,0,-size);grain.bezierCurveTo(size,-size*.85,size*1.1,size*.3,0,size*.45);grain.fill();grain.shadowBlur=0;
      for(let i=0;i<9;i++){const a=Math.PI*(1.12+i*.095);grain.beginPath();grain.moveTo(0,size*.4);grain.quadraticCurveTo(Math.cos(a)*size*.6,Math.sin(a)*size*.5,Math.cos(a)*size,Math.sin(a)*size);grain.strokeStyle=i%2?"#fff5d555":"#73554055";grain.lineWidth=.7;grain.stroke();}grain.restore();
    };
    const resize=()=>{
      const bounds=canvas.getBoundingClientRect(),ratio=Math.min(1,Math.sqrt(420000/Math.max(1,bounds.width*bounds.height)));
      width=Math.max(1,Math.round(bounds.width*ratio));height=Math.max(1,Math.round(bounds.height*ratio));canvas.width=base.width=width;canvas.height=base.height=height;
      night=document.documentElement.dataset.studioTheme==="night";
      const pixels=grain.createImageData(width,height);let seed=517;
      for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=(seed/4294967296-.5)*24;const y=Math.floor(i/4/width)/height;const shade=8*Math.sin(y*4);pixels.data[i]=(night?108:225)+noise+shade;pixels.data[i+1]=(night?100:206)+noise+shade;pixels.data[i+2]=(night?85:166)+noise+shade;pixels.data[i+3]=255;}grain.putImageData(pixels,0,0);
      [[.07,.55,11,.3],[.93,.48,15,-.4],[.86,.80,8,.7],[.16,.89,6,-.5],[.60,.43,8,1.2]].forEach(([x,y,s,a])=>shell(x*width,y*height,s*Math.max(.65,width/1100),a));
      grain.strokeStyle=night?"#e4dbc233":"#a4865944";grain.lineWidth=1;grain.beginPath();grain.moveTo(width*.89,height*.69);grain.bezierCurveTo(width*.91,height*.72,width*.87,height*.75,width*.91,height*.78);grain.stroke();
      canvas.dataset.shorePixels=String(width*height);steps=[];draw();
    };
    const coast=(offset:number)=>{context.beginPath();context.moveTo(0,0);context.lineTo(width,0);context.lineTo(width,shoreline(width)+offset);for(let x=width;x>=0;x-=8)context.lineTo(x,shoreline(x)+offset);context.lineTo(0,shoreline(0)+offset);context.closePath();};
    const draw=()=>{
      context.drawImage(base,0,0);
      coast(height*.035);context.fillStyle=night?"rgba(51,63,63,.5)":"rgba(121,126,104,.32)";context.fill();
      steps=steps.filter(step=>time-step.born<24&&step.y>shoreline(step.x)+8);
      for(const step of steps){context.save();context.translate(step.x,step.y);context.rotate(step.angle);context.globalAlpha=Math.max(0,1-(time-step.born)/24)*.33;context.fillStyle=night?"#282e2b":"#77603e";context.beginPath();context.ellipse(step.side*4,0,3,8,0,0,Math.PI*2);context.fill();context.strokeStyle=night?"#c6bb9a":"#f6e4bd";context.lineWidth=1;context.beginPath();context.ellipse(step.side*4+1,1,3,8,0,0,Math.PI);context.stroke();context.restore();}
      const water=context.createLinearGradient(0,0,0,height*.14);water.addColorStop(0,night?"#122126":"#eae7d9");water.addColorStop(.55,night?"#283638":"#dfdecc");water.addColorStop(1,night?"#647168":"#c9d2b6");coast(0);context.fillStyle=water;context.fill();
      for(let j=0;j<3;j++){context.beginPath();for(let x=0;x<=width+8;x+=8){const y=shoreline(x)-j*height*.012-3*Math.sin(x*.035+time*.7+j);if(x===0)context.moveTo(x,y);else context.lineTo(x,y);}context.strokeStyle=j===0?(night?"#d9e9dc99":"#f6f5dcdb"):(night?"#b9d5cc22":"#f4f3d64d");context.lineWidth=j===0?3:1;context.stroke();}
      context.strokeStyle=night?"#aac3b955":"#f6f2d999";context.lineWidth=.7;
      for(let x=0;x<width;x+=11){const y=shoreline(x)+3*Math.sin(x*.05+time);context.beginPath();context.ellipse(x,y,3.5,1.4,0,0,Math.PI*2);context.stroke();}
      canvas.dataset.shoreFrames=String(Number(canvas.dataset.shoreFrames??0)+1);canvas.dataset.shoreSteps=String(steps.length);
    };
    const tick=(now:number)=>{frame=0;if(!visible||document.hidden||stopped||reduced.matches)return;if(now-last>=32){time+=last?Math.min((now-last)/1000,.06):0;last=now;draw();}frame=requestAnimationFrame(tick);};
    const restart=()=>{cancelAnimationFrame(frame);frame=0;last=0;draw();if(visible&&!document.hidden&&!stopped&&!reduced.matches)frame=requestAnimationFrame(tick);};
    pauseRef.current=()=>{stopped=!stopped;restart();return stopped;};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;restart();});observer.observe(canvas);
    const size=new ResizeObserver(()=>{resize();restart();});size.observe(canvas);
    window.addEventListener("studio-theme",()=>{resize();restart();},{signal:events.signal});
    document.addEventListener("visibilitychange",restart,{signal:events.signal});
    reduced.addEventListener("change",restart,{signal:events.signal});
    canvas.parentElement?.addEventListener("pointermove",event=>{
      if(event.pointerType!=="mouse"||reduced.matches||stopped)return;
      if(event.target instanceof Element&&event.target.closest("a,button")){previous=null;return;}
      const bounds=canvas.getBoundingClientRect(),x=(event.clientX-bounds.left)/bounds.width*width,y=(event.clientY-bounds.top)/bounds.height*height;
      if(y<=shoreline(x)+height*.07){previous=null;return;}
      if(!previous){previous={x,y};return;}const dx=x-previous.x,dy=y-previous.y;
      if(Math.hypot(dx,dy)>14){side*=-1;steps.push({x,y,angle:Math.atan2(dy,dx)+Math.PI/2,born:time,side});steps=steps.slice(-48);previous={x,y};}
    },{passive:true,signal:events.signal});
    canvas.parentElement?.addEventListener("pointerleave",()=>{previous=null;},{signal:events.signal});
    resize();
    return()=>{cancelAnimationFrame(frame);events.abort();observer.disconnect();size.disconnect();pauseRef.current=null;};
  },[]);
  return <footer className={styles.shore} data-shore aria-labelledby="shore-title">
    <WaveSoundController />
    <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
    <div className={styles.inner}><div className={styles.tools}><ThemeControl /><button type="button" data-shore-pause aria-pressed={paused} onClick={()=>setPaused(pauseRef.current?.()??false)}>{paused?"Resume shoreline":"Pause shoreline"}</button><WaveSoundControl /></div>
      <div className={styles.folio}><div><p className={styles.overline}>Landfall / Maxsash Studio</p><h2 id="shore-title">Back to<br /><em>the shore.</em></h2><p className={styles.description}>A little sand, a little salt.<br />The work keeps finding its way here.</p><p className={styles.hint}>Move across the sand. The tide takes the tracks back.</p></div><section className={styles.activity} aria-labelledby="activity-title"><div className={styles.activityHead}><h3 id="activity-title">From the workbench</h3><a href={site.links.github}>Github ↗</a></div>{children}</section></div>
      <div className={styles.colophon}><Link href="/">Maxsash Studio ↗</Link><span>Release v{version}{commit?` · ${commit}`:""}</span><span>Sea model v1 · WebGL2</span><span>© {new Date().getFullYear()} Yash</span></div>
    </div>
  </footer>;
}
