import { noiseGLSL } from "./noise-glsl.ts";
import { surfaceGLSL } from "./ship-surfaces.ts";

export const shipWeatheringGLSL = `${noiseGLSL}
${surfaceGLSL}
const vec3 SALT=vec3(.60,.64,.62);
const vec3 SCUM=vec3(.29,.31,.20);
const vec3 BRONZE=vec3(.46,.37,.23);
const vec3 GRIME=vec3(.91,.89,.85);
vec2 facing(vec3 p,vec3 n){
  vec3 a=abs(n);
  return a.y>max(a.x,a.z)?p.xz:a.x>a.z?p.zy:p.xy;
}
vec3 weathered(vec3 color,int surface,vec3 p,vec3 n,float footprint){
  float patches=fbm(facing(p,n)*1.6);
  vec3 faded=mix(vec3(dot(color,vec3(.299,.587,.114))),color,.55)*1.3+.02;
  if(surface==TOPSIDES){
    float sun=smoothstep(-.2,.55,p.y);
    color=mix(color,faded,(.08+.18*patches)*sun);
    color*=mix(.86,1.,smoothstep(-.1,.25,p.y));
    float streak=smoothstep(.55,.9,valueNoise(vec2(p.z*4.+p.x*5.,p.y*1.1)));
    color=mix(color,SALT,streak*sun*.16*smoothstep(1.,3.,.1/footprint));
    float tide=exp(-pow((p.y+.035)/.03,2.))*(.55+.45*valueNoise(vec2(p.z*5.,p.x)));
    color=mix(color,SCUM,tide*.32);
  }
  if(surface==BRIGHTWORK){
    color=mix(color,faded*.92,smoothstep(.45,.95,n.y)*.5);
    color*=.94+.12*patches;
  }
  if(surface==DECK)color*=.93+.14*patches;
  if(surface==METAL)color=mix(mix(color,BRONZE,.45+.2*patches),color,smoothstep(.35,.85,n.y)*.6);
  if(surface==CANVAS){
    color*=.965+.07*patches;
    color=mix(color,color*GRIME,(1.-smoothstep(.8,1.9,p.y))*.7);
  }
  if(surface==ROPE)color=mix(color,faded,.25);
  return color;
}`;
