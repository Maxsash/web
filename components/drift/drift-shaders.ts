import {
  fieldGLSL,
  seaFragmentSource,
  seaVertexSource,
  shipFragmentSource,
  shipVertex,
  skyFragmentSource,
  skyVertex,
} from "../observatory/ocean-shaders.ts";
import type { DriftScene } from "./scenes.ts";

const whirlpoolField = `${fieldGLSL.replace("vec3 field(vec2 p) {", "vec3 waves(vec2 p) {")}
uniform vec4 uWhirlpool;
uniform float uTwist;
vec3 field(vec2 p) {
  vec2 d=p-uWhirlpool.xy;
  float spread=uWhirlpool.w*uWhirlpool.w;
  float pull=exp(-dot(d,d)/spread);
  float turn=uTwist*pull, c=cos(turn), s=sin(turn);
  vec3 w=waves(uWhirlpool.xy+mat2(c,s,-s,c)*d);
  return vec3(w.x-uWhirlpool.z*pull, w.yz+uWhirlpool.z*pull*2.*d/spread);
}`;

const whirlpoolFoam = `
  vec2 around=vWorld.xz-uWhirlpool.xy;
  float reach=length(around), spread=uWhirlpool.w*uWhirlpool.w;
  float arm=sin(3.*atan(around.y,around.x)+5.*log(reach+.4)+uTime*2.2);
  float streak=smoothstep(.55,1.,arm)*(.6+.4*sin(reach*9.-uTime*3.));
  color=mix(color,vec3(.82,.88,.88)*mix(1.,.5,uNight),clamp(streak*exp(-reach*reach/(spread*3.))*.75,0.,1.));
  color*=1.-.8*exp(-reach*reach/(spread*.07));`;

const noiseGLSL = `
float hash2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float valueNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x),mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*valueNoise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}`;

const stormDeclarations = `\nuniform float uTime;${noiseGLSL}`;

const stormClouds = `
  vec2 q=(vUv-vec2(.46,1.12))*vec2(uAspect,1.);
  float r=length(q), th=atan(q.y,q.x);
  float swirl=th-2.2*log(r+.04)+uTime*.12;
  float cloud=smoothstep(.32,.9,fbm(vec2(cos(swirl),sin(swirl))*(r*6.6+.9)+vec2(uTime*.09,0.))*.75
    +(.5+.5*sin(th*2.-7.*log(r+.04)+uTime*.35))*.4);
  color=mix(color,mix(vec3(.30,.34,.36),vec3(.05,.065,.08),uNight),.55+.45*cloud);
  color+=vec3(.10,.12,.13)*smoothstep(.55,.95,cloud)*(1.-uNight*.5);`;

const finishUniforms = `
uniform vec3 uTint;
uniform float uTintAmount;
uniform float uFlash;`;
const finishGLSL = `
  outColor.rgb=mix(outColor.rgb,dot(outColor.rgb,vec3(.299,.587,.114))*uTint*1.75,uTintAmount);
  outColor.rgb+=uFlash*vec3(.55,.6,.7);`;

const pageVertex = (field: string) => `#version 300 es
precision highp float;
layout(location=0) in vec2 aUv;
uniform mat4 uVP;
uniform vec3 uPose;
uniform vec2 uSize;
out vec2 vUv;
out vec3 vWorld;
out vec3 vNormal;
${field}
void main() {
  vec2 local=vec2(aUv.x-.5,.5-aUv.y)*uSize;
  float c=cos(uPose.z), s=sin(uPose.z);
  vec2 p=uPose.xy+mat2(c,s,-s,c)*local;
  vec3 f=field(p);
  vWorld=vec3(p.x,f.x+.05,p.y);
  vNormal=normalize(vec3(-f.y,1.,-f.z));
  vUv=aUv;
  gl_Position=uVP*vec4(vWorld,1.);
}`;

const pageFragment = `#version 300 es
precision highp float;
in vec2 vUv;
in vec3 vWorld;
in vec3 vNormal;
uniform vec3 uLight;
uniform vec3 uEye;
uniform float uNight;
out vec4 outColor;${finishUniforms}
float hash(float n){return fract(sin(n)*43758.5453);}
void main(){
  float u=vUv.x, v=vUv.y;
  float tear=.9+.028*sin(u*23.+1.)+.016*sin(u*61.+2.)+.009*sin(u*157.)+.005*sin(u*311.);
  if(v>tear) discard;
  vec3 paper=vec3(.933,.914,.867);
  float rule=abs(fract(v*15.+.5)-.5)/15.;
  paper=mix(paper,vec3(.55,.66,.75),(1.-smoothstep(.0012,.0012+fwidth(v)*1.5,rule))*.7*step(.08,v));
  paper=mix(paper,vec3(.72,.33,.24),(1.-smoothstep(.0015,.0015+fwidth(u)*1.5,abs(u-.15)))*.85);
  float row=floor(v*15.), line=fract(v*15.), word=floor(u*9.+hash(row)*5.);
  float ink=step(.18,u)*step(u,.2+.6*hash(row*3.1+1.))*step(.35,hash(word+row*13.))*step(.3,hash(row+7.));
  ink*=smoothstep(.55,.62,line)*(1.-smoothstep(.78,.85,line))*step(v,tear-.07);
  paper=mix(paper,vec3(.16,.24,.42),ink*.75);
  paper=mix(paper,vec3(1.),smoothstep(tear-.022,tear,v)*.75);
  paper*=1.-.22*(1.-smoothstep(0.,.06,min(min(u,1.-u),v)));
  vec3 n=normalize(vNormal), l=normalize(uLight), view=normalize(uEye-vWorld);
  vec3 color=paper*(.86+.24*max(dot(n,l),0.))+pow(max(dot(reflect(-l,n),view),0.),36.)*.22;
  outColor=vec4(color*mix(vec3(1.),vec3(.42,.52,.66),uNight),1.);${finishGLSL}
}`;

export function driftShaders(scene: DriftScene) {
  const field = scene.whirlpool ? whirlpoolField : fieldGLSL;
  const finish = { declarations: finishUniforms, finish: finishGLSL };
  return {
    sea: [
      seaVertexSource(field),
      seaFragmentSource({
        field,
        ...finish,
        surface: scene.whirlpool ? whirlpoolFoam : "",
      }),
    ],
    sky: [
      skyVertex,
      skyFragmentSource({
        declarations: `${finishUniforms}\nuniform float uOrb;${scene.storm ? stormDeclarations : ""}`,
        finish: finishGLSL,
        weather: scene.storm ? stormClouds : "",
        orbScale: "*uOrb",
      }),
    ],
    drifter:
      scene.drifter === "page"
        ? [pageVertex(field), pageFragment]
        : [shipVertex, shipFragmentSource(finish)],
  } satisfies Record<string, [string, string]>;
}
