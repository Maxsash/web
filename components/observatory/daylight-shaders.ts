import { SEA_LIGHT_SCREEN } from "./ocean-light.ts";

export const daylightDeclarations = `
uniform float uTime;
float cirrus(vec2 point,vec2 centre,float span,float bend){
  vec2 p=point-centre;
  p.x=mod(p.x+1.5,3.)-1.5;
  p.x*=uAspect;
  float envelope=exp(-pow(abs(p.x)/span,4.));
  float spine=p.y-bend*p.x*p.x-.006*sin(p.x*13.);
  float veil=exp(-pow(abs(spine)/.018,2.));
  float fibres=.5+.5*sin(spine*850.+p.x*25.+sin(p.x*19.));
  float feather=exp(-pow(abs(spine-.012*sin(p.x*21.))/.009,2.));
  return envelope*(veil*(.35+.25*fibres)+feather*.4);
}`;

export const daylightSkyGLSL = `
  vec2 drift=vec2(uTime*.0007,0.);
  float wisps=(cirrus(vUv-drift,vec2(.67,.88),.38,.11)
    +.65*cirrus(vUv-drift,vec2(.93,.62),.24,-.16)
    +.45*cirrus(vUv-drift,vec2(.22,.95),.22,.18))*uAtmosphere.z;
  float horizon=exp(-pow(abs(vUv.y-.36)/.14,2.));
  daylight=mix(daylight,vec3(.85,.88,.81),horizon*.18*uAtmosphere.w);
  daylight=mix(daylight,vec3(.94,.95,.89),clamp(wisps,0.,1.)*.26);
  float halo=exp(-pow(length((vUv-vec2(${SEA_LIGHT_SCREEN[0]},${SEA_LIGHT_SCREEN[1]}))*vec2(uAspect,1.))/.11,2.));
  daylight=mix(daylight,vec3(1.,.94,.78),halo*.13*(1.25-.2*uAtmosphere.w));`;

export const daylightGlitterGLSL = `
  vec3 glitterNormal=normalize(n+vec3(
    .009*sin(vWorld.x*17.+vWorld.z*11.-uTime*2.1),
    0.,.008*sin(vWorld.z*23.-vWorld.x*13.-uTime*2.7)));
  float glitterAlignment=max(dot(reflect(-light,glitterNormal),view),0.);
  float glitter=pow(glitterAlignment,260.);
  float sunColumn=exp(-pow(abs(gl_FragCoord.x/uResolution.x-${SEA_LIGHT_SCREEN[0]})/.27,4.));
  vec3 sunlight=mix(vec3(1.,.94,.78),vec3(1.,.87,.63),clamp(dot(n,view),0.,1.));
  vec3 dayGlint=sunlight*(glint*.58+glitter*.52+broad*.055)*sunColumn;
  dayGlint*=1.06-.13*(uAtmosphere.w-.65);`;
