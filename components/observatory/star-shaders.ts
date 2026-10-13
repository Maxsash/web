import { SEA_LIGHT_SCREEN } from "./ocean-light.ts";
import { cloudFunctions } from "./cloud-shaders.ts";

export const starVertex = `#version 300 es
precision highp float;
layout(location=0) in vec4 aStar;
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
    +vec2(aStar.x/uAspect,aStar.y)*.42;
  gl_Position=vec4(uv*2.-1.,.9998,1.);
  float brightness=clamp((5.-aStar.z)/6.5,0.,1.);
  gl_PointSize=mix(1.5,3.6,sqrt(brightness));
  float moonlight=pow(uMoonIllumination,1.2);
  float limit=5.35-2.7*moonlight-1.6*moonlight*exp(-length(aStar.xy)*2.);
  float visibility=1.-smoothstep(limit-.35,limit+.35,aStar.z);
  vec3 cool=vec3(.75,.84,1.);
  vec3 warm=vec3(1.,.86,.68);
  vColor=mix(cool,warm,clamp((aStar.w+.1)/1.7,0.,1.));
  float clearOfMoon=step(.033,length(aStar.xy)*.42);
  vOpacity=uNight*(1.-smoothstep(.05,.8,uReveal))*visibility
    *mix(.38,.95,brightness)*clearOfMoon;
  vOpacity*=1.-cloudLayers(uv,uAspect,uTime,uAtmosphere).x;
  vOpacity*=1.-(uAtmosphere.w-.65)*.12;
}`;

export const starFragment = `#version 300 es
precision highp float;
in vec3 vColor;
in float vOpacity;
out vec4 outColor;
void main() {
  float circle=1.-smoothstep(.26,.5,length(gl_PointCoord-vec2(.5)));
  outColor=vec4(vColor,vOpacity*circle);
}`;
