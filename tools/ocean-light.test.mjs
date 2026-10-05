import test from 'node:test';
import assert from 'node:assert/strict';
import { SEA_LIGHT_SCREEN, SEA_HALF_FOV, seaLightDirection } from '../components/observatory/ocean-light.ts';
const dot=(a,b)=>a.reduce((sum,value,i)=>sum+value*b[i],0);
const normal=v=>v.map(x=>x/Math.hypot(...v));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
test('sun/moon illumination projects to the sky disc across viewports and camera movement',()=>{
  for(const aspect of [320/568,390/844,844/390,1440/1000])for(const orbit of [0,.55,1])for(const pointer of [-.75,0,.75]){
    const eye=[orbit*10+pointer,(aspect<.8?6.8:5)+(29-(aspect<.8?6.8:5))*orbit,18-2*orbit];
    const target=[aspect<.8?2.5*(1-orbit):0,.6-orbit,-7];
    const forward=normal(target.map((v,i)=>v-eye[i])),right=normal(cross(forward,[0,1,0])),up=cross(right,forward);
    const ray=seaLightDirection(eye,target,aspect),depth=dot(ray,forward);
    const screen=[.5+dot(ray,right)/depth/Math.tan(SEA_HALF_FOV)/aspect/2,.5+dot(ray,up)/depth/Math.tan(SEA_HALF_FOV)/2];
    assert.ok(Math.abs(screen[0]-SEA_LIGHT_SCREEN[0])<1e-12);
    assert.ok(Math.abs(screen[1]-SEA_LIGHT_SCREEN[1])<1e-12);
    assert.ok(Math.abs(Math.hypot(...ray)-1)<1e-12);
  }
});
