import { SEA_LIGHT_SCREEN } from "./ocean-light.ts";
import { cloudFunctions } from "./cloud-shaders.ts";

export const planetVertex = `#version 300 es
precision highp float;
layout(location=0) in vec4 aPlanet;
uniform float uAspect;
uniform float uNight;
uniform float uReveal;
uniform float uMoonIllumination;
uniform float uTime;
uniform vec4 uAtmosphere;
out vec3 vColor;
out float vOpacity;
${cloudFunctions}
void main() {
  vec2 uv=vec2(${SEA_LIGHT_SCREEN[0]},${SEA_LIGHT_SCREEN[1]})
    +vec2(aPlanet.x/uAspect,aPlanet.y)*.42;
  gl_Position=vec4(uv*2.-1.,.9999,1.);
  float brightness=clamp((4.-aPlanet.z)/8.,0.,1.);
  gl_PointSize=mix(2.2,5.2,sqrt(brightness));
  vec3 colors[5]=vec3[5](
    vec3(.90,.87,.78),vec3(1.,.93,.75),vec3(1.,.68,.46),
    vec3(.95,.88,.73),vec3(.92,.85,.67));
  vColor=colors[int(aPlanet.w)];
  float nearMoon=1.-smoothstep(.05,.38,length(aPlanet.xy));
  float moonWash=uMoonIllumination*nearMoon*.55;
  float clearOfMoon=step(.034,length(aPlanet.xy)*.42);
  vOpacity=uNight*(1.-smoothstep(.05,.8,uReveal))
    *mix(.68,1.,brightness)*(1.-moonWash)*clearOfMoon;
  vOpacity*=1.-cloudLayers(uv,uAspect,uTime,uAtmosphere).x;
}`;

export const planetFragment = `#version 300 es
precision highp float;
in vec3 vColor;
in float vOpacity;
out vec4 outColor;
void main() {
  float circle=1.-smoothstep(.23,.5,length(gl_PointCoord-vec2(.5)));
  outColor=vec4(vColor,vOpacity*circle);
}`;
