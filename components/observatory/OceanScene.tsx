"use client";

import { useEffect, useRef, useState } from "react";
import type { SeaEdition } from "@/lib/sea-edition";
import styles from "./Observatory.module.css";

/** The React boundary handles lifecycle; rendering and scroll never set React state. */
export default function OceanScene({ edition }: { edition: SeaEdition }) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const pauseRef=useRef<(() => boolean) | null>(null);
  const [paused,setPaused]=useState(false);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const canvas=canvasRef.current;
    const scene=canvas?.closest<HTMLElement>("[data-observatory]");
    const stage=canvas?.parentElement;
    if(!canvas||!scene||!stage)return;
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    const events=new AbortController();
    let engine: Awaited<ReturnType<typeof import("./ocean-engine").createOceanEngine>> | undefined;
    let frame=0, visible=true, stopped=false, disposed=false, presented=false, lastTime=0, elapsed=0;
    let start=0, distance=1, progress=0, width=1,height=1, ratio=1, low=false;
    let pointer:[number,number]=[0,0], target:[number,number]=[0,0];
    let slowFrames=0, sampleFrames=0, performanceStart=0;
    const clamp=(n:number)=>Math.min(1,Math.max(0,n));
    const updateScroll=()=>{
      progress=clamp((window.scrollY-start)/distance);
      const intro=1-clamp((progress-.06)/.24);
      const middle=clamp((progress-.23)/.22)*(1-clamp((progress-.68)/.2));
      const end=clamp((progress-.75)/.2);
      scene.style.setProperty("--intro-opacity",String(intro));
      scene.style.setProperty("--middle-opacity",String(middle));
      scene.style.setProperty("--end-opacity",String(end));
      scene.style.setProperty("--ink-progress",String(clamp((progress-.17)/.3)));
      scene.dataset.chapter=progress<.33?"sea":progress<.8?"structure":"atlas";
    };
    const render=(now:number)=>{
      frame=0;
      if(!engine||disposed||!visible||document.hidden)return;
      const active=visible&&!document.hidden&&!stopped&&!media.matches;
      const delta=lastTime?Math.min((now-lastTime)/1000,.05):0;
      if(active)elapsed+=delta;
      lastTime=active?now:0;
      const damping=1-Math.exp(-delta*4);
      pointer=media.matches?[0,0]:[pointer[0]+(target[0]-pointer[0])*damping,pointer[1]+(target[1]-pointer[1])*damping];
      const reveal=media.matches?(progress>.45?1:0):clamp((progress-.14)/.75);
      engine.draw(elapsed,reveal,pointer);
      if(!presented){presented=true;canvas.dataset.renderer="webgl2";scene.dataset.rendering="webgl2";setReady(true);}
      canvas.dataset.quality=media.matches?"still":low?"low":"high";
      if(active) {
        // Adapt to sustained frame delivery, never claim this measures GPU time.
        if(lastTime-performanceStart>1600) {
          if(sampleFrames>30&&slowFrames/sampleFrames>.3&&!low){low=true;ratio*=.7;engine.resize(width,height,ratio);}
          performanceStart=now;sampleFrames=0;slowFrames=0;
        }
        sampleFrames++;if(delta>.029)slowFrames++;
        frame=requestAnimationFrame(render);
      }
    };
    const requestFrame=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(render);};
    const restart=()=>{cancelAnimationFrame(frame);frame=0;lastTime=0;requestFrame();};
    const resize=()=>{
      const bounds=scene.getBoundingClientRect();start=bounds.top+scrollY;
      width=stage.clientWidth;height=stage.clientHeight;distance=Math.max(1,scene.offsetHeight-height);
      const pixelCap=width<760?780000:1500000;
      ratio=Math.min(devicePixelRatio||1,width<760?1.5:1.25,Math.sqrt(pixelCap/(width*height)))*(low?.7:1);
      engine?.resize(width,height,ratio);updateScroll();requestFrame();
    };
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resizeObserver.observe(scene);
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;restart();});intersection.observe(scene);
    window.addEventListener("scroll",()=>{updateScroll();requestFrame();},{passive:true,signal:events.signal});
    scene.addEventListener("pointermove",event=>{
      if(event.pointerType!=="mouse"||media.matches)return;
      target=[(event.clientX/width-.5)*2,(event.clientY/height-.5)*2];
    },{passive:true,signal:events.signal});
    scene.addEventListener("pointerleave",()=>{target=[0,0];},{signal:events.signal});
    document.addEventListener("visibilitychange",restart,{signal:events.signal});
    media.addEventListener("change",restart,{signal:events.signal});
    canvas.addEventListener("webglcontextlost",event=>{
      event.preventDefault();cancelAnimationFrame(frame);frame=0;engine=undefined;
      canvas.dataset.renderer="fallback";scene.dataset.rendering="fallback";setReady(false);
    },{signal:events.signal});
    pauseRef.current=()=>{stopped=!stopped;restart();return stopped;};
    resize();
    import("./ocean-engine").then(({createOceanEngine})=>{
      if(disposed)return;
      try {
        engine=createOceanEngine(canvas,edition);resize();cancelAnimationFrame(frame);frame=0;render(performance.now());
      } catch(error) {
        canvas.dataset.renderer="fallback";scene.dataset.rendering="fallback";
        console.warn("The sea is using its static field plate.",error);
      }
    }).catch(()=>{canvas.dataset.renderer="fallback";scene.dataset.rendering="fallback";});
    return()=>{
      disposed=true;events.abort();cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();engine?.dispose();pauseRef.current=null;
    };
  },[edition]);
  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} data-ocean aria-hidden="true" />
      <button className={styles.pause} type="button" disabled={!ready} aria-pressed={paused} onClick={()=>setPaused(pauseRef.current?.()??false)}>
        <span aria-hidden="true">{paused?"▷":"Ⅱ"}</span> {paused?"Resume the sea":"Still the sea"}
      </button>
    </>
  );
}
