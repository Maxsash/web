"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import styles from "./ThemeControl.module.css";

const subscribe=(callback:()=>void)=>{window.addEventListener("studio-theme",callback);return()=>window.removeEventListener("studio-theme",callback);};
const snapshot=()=>document.documentElement.dataset.studioTheme==="night";
const serverSnapshot=()=>false;

export default function ThemeControl() {
  const night=useSyncExternalStore(subscribe,snapshot,serverSnapshot);
  const manual=useRef(false);
  useEffect(()=>{
    const media=matchMedia("(prefers-color-scheme: dark)");
    let saved:string|null=null;
    try {saved=localStorage.getItem("studio-theme");}catch{}
    manual.current=saved==="night"||saved==="day";
    const apply=(selected:string)=>{
      document.documentElement.dataset.studioTheme=selected;
      window.dispatchEvent(new Event("studio-theme"));
    };
    apply(manual.current?saved!:media.matches?"night":"day");
    const followSystem=()=>{if(!manual.current)apply(media.matches?"night":"day");};
    media.addEventListener("change",followSystem);
    return()=>media.removeEventListener("change",followSystem);
  },[]);
  return <button className={styles.toggle} type="button" data-theme-toggle aria-pressed={night} aria-label={night?"Switch to day sea":"Switch to night sea"} onClick={()=>{
    manual.current=true;
    const next=night?"day":"night";document.documentElement.dataset.studioTheme=next;
    try{localStorage.setItem("studio-theme",next);}catch{}
    window.dispatchEvent(new Event("studio-theme"));
  }}><span aria-hidden="true">{night?"☾":"☀"}</span><span>{night?"Night sea":"Day sea"}</span></button>;
}
