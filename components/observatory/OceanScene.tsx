"use client";

import { useEffect, useRef, useState } from "react";
import type { SeaEdition } from "@/lib/sea-edition";
import styles from "./Observatory.module.css";

/** The React boundary handles lifecycle; rendering and scroll never set React state. */
export default function OceanScene({ edition }: { edition: SeaEdition }) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const pauseRef=useRef<(() => boolean) | null>(null);
  const stageRef=useRef<((direction:number) => void) | null>(null);
  const [paused,setPaused]=useState(false);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const canvas=canvasRef.current;
    const scene=canvas?.closest<HTMLElement>("[data-observatory]");
    const stage=canvas?.parentElement;
    if(!canvas||!scene||!stage)return;
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    // Conservative startup budget, including phones in landscape. Not a hardware benchmark.
    const compact=matchMedia("(pointer: coarse)").matches||stage.clientWidth<760;
    const staged=matchMedia("(pointer: coarse)").matches;
    const stages=[{label:"Sea",progress:0},{label:"Structure",progress:.55},{label:"Drawing",progress:1}];
    const stageControls=stage.querySelector<HTMLElement>("[data-stage-controls]");
    const stageLabel=stageControls?.querySelector<HTMLElement>("[data-stage-label]");
    const previousButton=stageControls?.querySelector<HTMLButtonElement>("[data-stage-previous]");
    const nextButton=stageControls?.querySelector<HTMLButtonElement>("[data-stage-next]");
    let stageIndex=0,stageProgress=0,stageFrom=0,stageTarget=0,stageStarted=0;
    if(staged)scene.dataset.staged="true";
    const events=new AbortController();
    let engine: Awaited<ReturnType<typeof import("./ocean-engine").createOceanEngine>> | undefined;
    let frame=0, visible=true, stopped=false, disposed=false, presented=false, lastTime=0, elapsed=0;
    let start=0, distance=1, progress=0, width=1,height=1, ratio=1, low=false;
    let pointer:[number,number]=[0,0], target:[number,number]=[0,0];
    let slowFrames=0, sampleFrames=0, performanceStart=0;
    let scrollDirty=true, lastScrollY=-1;
    let nextDraw=0;
    const opacityGroups=[
      [styles.intro,styles.shade,styles.sceneMeta],
      [styles.middle,styles.technical],
      [styles.end],
      [styles.paperVeil],
    ].map(classes=>classes.flatMap(name=>Array.from(scene.querySelectorAll<HTMLElement>(`.${name}`))));
    const lastOpacity=[-1,-1,-1,-1];
    const clamp=(n:number)=>Math.min(1,Math.max(0,n));
    const updateScroll=()=>{
      lastScrollY=window.scrollY;scrollDirty=false;
      progress=staged?stageProgress:clamp((lastScrollY-start)/distance);
      const intro=1-clamp((progress-.06)/.24);
      const middle=clamp((progress-.23)/.22)*(1-clamp((progress-.68)/.2));
      const end=clamp((progress-.75)/.2);
      // Avoid invalidating inherited properties throughout the SVG/text subtree.
      [intro,middle,end,clamp((progress-.17)/.3)].forEach((opacity,i)=>{
        if(opacity===lastOpacity[i])return;
        lastOpacity[i]=opacity;
        opacityGroups[i].forEach(element=>{element.style.opacity=String(opacity);});
      });
      const chapter=progress<.33?"sea":progress<.8?"structure":"atlas";
      if(scene.dataset.chapter!==chapter)scene.dataset.chapter=chapter;
    };
    const render=(now:number)=>{
      frame=0;
      if(disposed)return;
      if(stageStarted){
        const t=media.matches?1:clamp((now-stageStarted)/420);
        stageProgress=stageFrom+(stageTarget-stageFrom)*t*t*(3-2*t);
        scrollDirty=true;
        if(t===1)stageStarted=0;
      }
      const active=visible&&!document.hidden&&!stopped&&!media.matches;
      const scrollChanged=scrollDirty||window.scrollY!==lastScrollY;
      // Pace idle animation, never hold back a new scroll sample behind that budget.
      // Advance a deadline rather than restarting the interval after each draw:
      // slightly early/variable Safari callbacks must not repeatedly skip a frame.
      if(engine&&active&&!scrollChanged&&nextDraw>now+1){frame=requestAnimationFrame(render);return;}
      // HTML reveal and GPU camera now sample the same scroll position in one frame.
      if(scrollChanged)updateScroll();
      if(!engine||!visible||document.hidden){if(stageStarted&&visible&&!document.hidden)frame=requestAnimationFrame(render);return;}
      const interval=lastTime?(now-lastTime)/1000:0;
      const delta=lastTime?Math.min((now-lastTime)/1000,.05):0;
      if(active)elapsed+=delta;
      lastTime=active?now:0;
      const damping=1-Math.exp(-delta*4);
      pointer=media.matches?[0,0]:[pointer[0]+(target[0]-pointer[0])*damping,pointer[1]+(target[1]-pointer[1])*damping];
      const reveal=media.matches&&!staged?(progress>.45?1:0):clamp((progress-.14)/.75);
      engine.draw(elapsed,reveal,pointer);
      const drawInterval=1000/(low?30:60);
      nextDraw=!active?0:scrollChanged||!nextDraw||now-nextDraw>drawInterval?now+drawInterval:nextDraw+drawInterval;
      if(!presented){presented=true;canvas.dataset.renderer="webgl2";scene.dataset.rendering="webgl2";setReady(true);}
      canvas.dataset.quality=media.matches?"still":low?"low":compact?"compact":"high";
      if(active) {
        // Adapt to sustained frame delivery, never claim this measures GPU time.
        if(lastTime-performanceStart>1600) {
          if(sampleFrames>=12&&slowFrames/sampleFrames>.3&&!low){low=true;ratio*=.7;engine.resize(width,height,ratio);}
          performanceStart=now;sampleFrames=0;slowFrames=0;
        }
        sampleFrames++;if(interval>(low?.058:.029))slowFrames++;
        frame=requestAnimationFrame(render);
      }
      else if(stageStarted)frame=requestAnimationFrame(render);
    };
    const requestFrame=()=>{if(!frame&&!disposed)frame=requestAnimationFrame(render);};
    const restart=()=>{cancelAnimationFrame(frame);frame=0;lastTime=0;nextDraw=0;requestFrame();};
    const updateStageControls=()=>{
      scene.dataset.stage=String(stageIndex);
      if(stageLabel)stageLabel.textContent=`${stageIndex+1} / ${stages.length} · ${stages[stageIndex].label}`;
      if(previousButton)previousButton.disabled=stageIndex===0;
      if(nextButton)nextButton.textContent=stageIndex===stages.length-1?"View work ↓":"Next ↑";
    };
    stageRef.current=direction=>{
      if(!staged)return;
      if(direction>0&&stageIndex===stages.length-1){document.getElementById("work")?.scrollIntoView({behavior:media.matches?"instant":"smooth"});return;}
      stageIndex=Math.max(0,Math.min(stages.length-1,stageIndex+direction));
      stageFrom=stageProgress;stageTarget=stages[stageIndex].progress;
      stageStarted=media.matches?0:performance.now();
      if(media.matches)stageProgress=stageTarget;
      scrollDirty=true;updateStageControls();requestFrame();
    };
    if(staged){
      updateStageControls();
      let touch:{x:number;y:number;dx:number;dy:number;consumed:boolean}|null=null;
      scene.addEventListener("touchstart",event=>{
        if(window.scrollY>start+2||event.touches.length!==1||(event.target instanceof Element&&event.target.closest("a,button,input,textarea,select"))){touch=null;return;}
        const point=event.touches[0];touch={x:point.clientX,y:point.clientY,dx:0,dy:0,consumed:false};
      },{passive:true,signal:events.signal});
      scene.addEventListener("touchmove",event=>{
        if(!touch||event.touches.length!==1){touch=null;return;}
        touch.dx=event.touches[0].clientX-touch.x;touch.dy=event.touches[0].clientY-touch.y;
        if(Math.abs(touch.dy)<=Math.abs(touch.dx)||Math.abs(touch.dy)<4)return;
        // Only consume vertical gestures that have another scene stage to visit.
        if((touch.dy<0&&stageIndex<stages.length-1)||(touch.dy>0&&stageIndex>0)){
          if(event.cancelable){event.preventDefault();touch.consumed=true;}
        }
      },{passive:false,signal:events.signal});
      scene.addEventListener("touchend",()=>{
        if(touch?.consumed&&Math.abs(touch.dy)>=35&&Math.abs(touch.dy)>Math.abs(touch.dx)*1.25)stageRef.current?.(touch.dy<0?1:-1);
        touch=null;
      },{passive:true,signal:events.signal});
      scene.addEventListener("touchcancel",()=>{touch=null;},{passive:true,signal:events.signal});
    }
    const resize=()=>{
      const bounds=scene.getBoundingClientRect();start=bounds.top+scrollY;
      width=stage.clientWidth;height=stage.clientHeight;distance=Math.max(1,scene.offsetHeight-height);
      const pixelCap=compact?360000:1500000;
      ratio=Math.min(devicePixelRatio||1,compact?1:1.25,Math.sqrt(pixelCap/(width*height)))*(low?.7:1);
      engine?.resize(width,height,ratio);scrollDirty=true;requestFrame();
    };
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);resizeObserver.observe(scene);
    const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;restart();});intersection.observe(scene);
    window.addEventListener("scroll",()=>{scrollDirty=true;requestFrame();},{passive:true,signal:events.signal});
    scene.addEventListener("pointermove",event=>{
      if(event.pointerType!=="mouse"||media.matches)return;
      target=[(event.clientX/width-.5)*2,(event.clientY/height-.5)*2];
    },{passive:true,signal:events.signal});
    scene.addEventListener("pointerleave",()=>{target=[0,0];},{signal:events.signal});
    document.addEventListener("visibilitychange",restart,{signal:events.signal});
    media.addEventListener("change",restart,{signal:events.signal});
    canvas.addEventListener("webglcontextlost",event=>{
      event.preventDefault();cancelAnimationFrame(frame);frame=0;engine?.dispose();engine=undefined;
      canvas.dataset.renderer="fallback";scene.dataset.rendering="fallback";setReady(false);
    },{signal:events.signal});
    pauseRef.current=()=>{stopped=!stopped;restart();return stopped;};
    resize();
    import("./ocean-engine").then(({createOceanEngine})=>{
      if(disposed)return;
      try {
        engine=createOceanEngine(canvas,edition,compact);resize();cancelAnimationFrame(frame);frame=0;render(performance.now());
      } catch(error) {
        canvas.dataset.renderer="fallback";scene.dataset.rendering="fallback";
        console.warn("The sea is using its static field plate.",error);
      }
    }).catch(()=>{if(disposed)return;canvas.dataset.renderer="fallback";scene.dataset.rendering="fallback";});
    return()=>{
      disposed=true;events.abort();cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();engine?.dispose();pauseRef.current=null;stageRef.current=null;
      delete scene.dataset.staged;delete scene.dataset.stage;
    };
  },[edition]);
  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} data-ocean aria-hidden="true" />
      <button className={styles.pause} type="button" disabled={!ready} aria-pressed={paused} onClick={()=>setPaused(pauseRef.current?.()??false)}>
        <span aria-hidden="true">{paused?"▷":"Ⅱ"}</span> {paused?"Resume the sea":"Still the sea"}
      </button>
      <div className={styles.stageControls} data-stage-controls>
        <button type="button" data-stage-previous disabled aria-label="Previous sea stage" onClick={()=>stageRef.current?.(-1)}>↓ Back</button>
        <span data-stage-label role="status" aria-live="polite" aria-atomic="true">1 / 3 · Sea</span>
        <button type="button" data-stage-next aria-label="Next sea stage or view work" onClick={()=>stageRef.current?.(1)}>Next ↑</button>
      </div>
    </>
  );
}
