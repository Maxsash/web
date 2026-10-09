import { SEA_LIGHT_SCREEN } from "./ocean-light.ts";

export const fieldGLSL = `
uniform vec4 uWaveVectors[6];
uniform float uAmplitudes[6];
uniform float uTime;
vec3 field(vec2 p) {
  vec3 s = vec3(0.0);
  for (int i=0; i<6; i++) {
    vec4 w=uWaveVectors[i];
    float a=dot(w.xy,p)-w.z*uTime+w.w;
    s += uAmplitudes[i]*vec3(sin(a),cos(a)*w.xy);
  }
  return s;
}`;

export type ShaderAdditions = { declarations?: string; finish?: string };

export const seaVertexSource = (field = fieldGLSL) => `#version 300 es
precision highp float;
layout(location=0) in vec2 aPosition;
uniform mat4 uVP;
out vec3 vWorld;
out vec3 vNormal;
${field}
void main() {
  vec3 s=field(aPosition);
  vWorld=vec3(aPosition.x,s.x,aPosition.y);
  vNormal=normalize(vec3(-s.y,1.,-s.z));
  gl_Position=uVP*vec4(vWorld,1.);
}`;

const shipWakeGLSL = `
  vec2 ship=vWorld.xz-vec2(4.5,-5.5);
  float shadow=exp(-dot(ship*vec2(.6,1.4),ship*vec2(.6,1.4)))*.34;
  color*=1.-shadow;
  float wake=exp(-pow(abs(ship.x)-max(ship.y,0.)*.25,2.)*12.)*exp(-ship.y*.24)*step(0.,ship.y);
  color+=vec3(.13,.22,.2)*wake*.22;`;

export function seaFragmentSource({
  field = fieldGLSL,
  declarations = "",
  surface = shipWakeGLSL,
  finish = "",
}: ShaderAdditions & { field?: string; surface?: string } = {}) {
  return `#version 300 es
precision highp float;
in vec3 vWorld;
in vec3 vNormal;
uniform vec3 uEye;
uniform vec2 uResolution;
uniform float uReveal;
uniform float uNight;
uniform vec3 uLight;
out vec4 outColor;
${field}${declarations}
float rule(float value,float width) {
  float d=abs(fract(value-.5)-.5);
  return 1.-smoothstep(width,width+fwidth(value)*1.25,d);
}
void main() {
  vec3 exact=field(vWorld.xz);
  vec3 n=normalize(vec3(-exact.y,1.,-exact.z)+vec3(
    .027*sin(vWorld.x*6.+vWorld.z*4.+uTime*1.3),
    0., .021*sin(vWorld.z*8.-vWorld.x*3.-uTime*1.5)));
  vec3 view=normalize(uEye-vWorld);
  vec3 reflected=reflect(-view,n);
  vec3 light=normalize(uLight);
  float fresnel=.035+.965*pow(1.-max(dot(n,view),0.),4.);
  vec3 sky=mix(vec3(.81,.77,.66),vec3(.16,.29,.35),pow(clamp(reflected.y,0.,1.),.55));
  sky=mix(vec3(.70,.82,.82),sky,uNight);
  vec3 deep=mix(vec3(.025,.23,.28),vec3(.004,.035,.07),uNight);
  vec3 body=mix(deep,vec3(.045,.26,.27),clamp(vWorld.y*.3+.35,0.,1.));
  vec3 color=mix(body,sky,fresnel*.84);
  float glint=pow(max(dot(reflect(-light,n),view),0.),110.);
  float broad=pow(max(dot(reflect(-light,n),view),0.),18.);
  color+=mix(vec3(1.,.86,.60),vec3(.64,.80,1.),uNight)*(glint*.95+broad*.04);${surface}
  float dist=length(uEye-vWorld);
  float fog=1.-exp(-dist*.007);
  color=mix(color,mix(vec3(.60,.73,.72),vec3(.07,.13,.21),uNight),fog*fog);
  float grid=max(rule(vWorld.x*.4,.007),rule(vWorld.z*.4,.007));
  float contours=rule(exact.x*3.5,.008);
  vec3 paper=mix(vec3(.91,.9,.84),vec3(.075,.13,.16),uNight);
  vec3 ink=mix(vec3(.16,.31,.33),vec3(.51,.68,.69),uNight);
  vec3 drawing=mix(paper,ink,grid*.42);
  drawing=mix(drawing,ink,contours*.82);
  drawing-=max(0.,-vWorld.y)*.025;
  float screenY=gl_FragCoord.y/uResolution.y;
  float wipe=smoothstep(-.12,.12,uReveal*1.5-.25-(screenY*.75));
  color=mix(color,drawing,wipe);
  outColor=vec4(color,1.);${finish}
}`;
}

export const skyVertex = `#version 300 es
precision highp float;
out vec2 vUv;
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));vUv=p;gl_Position=vec4(p*2.-1.,.9999,1.);}`;

export function skyFragmentSource({
  declarations = "",
  finish = "",
  weather = "",
  orbScale = "",
}: ShaderAdditions & { weather?: string; orbScale?: string } = {}) {
  return `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uReveal;
uniform float uNight;
uniform float uAspect;
out vec4 outColor;${declarations}
void main(){
  vec3 daylight=mix(vec3(.76,.86,.83),vec3(.36,.65,.76),smoothstep(.1,1.,vUv.y));
  float sun=1.-smoothstep(.022,.028,length((vUv-vec2(${SEA_LIGHT_SCREEN[0]},${SEA_LIGHT_SCREEN[1]}))*vec2(uAspect,1.)));
  daylight=mix(daylight,vec3(1.,.92,.70),sun${orbScale});
  vec3 midnight=mix(vec3(.10,.20,.25),vec3(.012,.028,.07),smoothstep(.1,1.,vUv.y));
  float moon=1.-smoothstep(.017,.021,length((vUv-vec2(${SEA_LIGHT_SCREEN[0]},${SEA_LIGHT_SCREEN[1]}))*vec2(uAspect,1.)));
  midnight+=vec3(.65,.75,.8)*moon${orbScale};
  vec3 color=mix(daylight,midnight,uNight);
  color=mix(color,mix(vec3(.91,.9,.84),vec3(.075,.13,.16),uNight),smoothstep(.05,.8,uReveal));${weather}
  outColor=vec4(color,1.);${finish}
}`;
}

export const shipVertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 aColor;
layout(location=3) in vec3 aBary;
uniform mat4 uVP;
uniform mat4 uModel;
out vec3 vNormal;
out vec3 vColor;
out vec3 vBary;
void main(){vNormal=mat3(uModel)*aNormal;vColor=aColor;vBary=aBary;gl_Position=uVP*uModel*vec4(aPosition,1.);}`;

export const shipFragmentSource = ({ declarations = "", finish = "" }: ShaderAdditions = {}) =>
  `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vColor;
in vec3 vBary;
uniform float uReveal;
uniform float uNight;
uniform vec3 uLight;
out vec4 outColor;${declarations}
void main(){
  float light=.4+.6*max(dot(normalize(vNormal),normalize(uLight)),0.);
  vec3 color=vColor*light*mix(vec3(1.),vec3(.50,.66,.82),uNight);
  vec3 edges=smoothstep(vec3(0.),fwidth(vBary)*.85,vBary);
  float edge=1.-min(min(edges.x,edges.y),edges.z);
  vec3 drawing=mix(mix(vec3(.94,.92,.85),vec3(.11,.18,.21),uNight),mix(vec3(.1,.24,.27),vec3(.65,.76,.76),uNight),edge*.8);
  outColor=vec4(mix(color,drawing,smoothstep(.12,.88,uReveal)),1.);${finish}
}`;

export const seaVertex = seaVertexSource();
export const seaFragment = seaFragmentSource();
export const skyFragment = skyFragmentSource();
export const shipFragment = shipFragmentSource();
