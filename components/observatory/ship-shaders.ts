export const surveyShipVertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 aColor;
layout(location=3) in vec3 aBary;
layout(location=4) in vec3 aFlex;
uniform mat4 uVP;
uniform mat4 uModel;
uniform float uTime;
out vec3 vWorld;
out vec3 vColor;
out vec3 vBary;
void main(){
  vec3 p=aPosition;
  float breath=sin(uTime*1.35+aFlex.y)+.28*sin(uTime*2.1-aFlex.y);
  p.x+=aFlex.x*breath;
  p.y+=aFlex.z*sin(uTime*2.6+aFlex.y);
  vWorld=(uModel*vec4(p,1.)).xyz;
  vColor=aColor;
  vBary=aBary;
  gl_Position=uVP*vec4(vWorld,1.);
}`;

export const surveyShipFragment = `#version 300 es
precision highp float;
in vec3 vWorld;
in vec3 vColor;
in vec3 vBary;
uniform float uReveal;
uniform float uNight;
uniform vec3 uLight;
out vec4 outColor;
void main(){
  vec3 n=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
  float canvas=step(.74,vColor.r)*step(.64,vColor.g);
  float diffuse=abs(dot(n,normalize(uLight)));
  float light=mix(.44+.56*diffuse,.72+.28*diffuse,canvas);
  vec3 color=vColor*light*mix(vec3(1.),vec3(.55,.70,.85),uNight);
  color+=canvas*uNight*vec3(.06,.065,.06);
  vec3 edges=smoothstep(vec3(0.),fwidth(vBary)*.65,vBary);
  float edge=1.-min(min(edges.x,edges.y),edges.z);
  vec3 paper=mix(vec3(.94,.92,.85),vec3(.11,.18,.21),uNight);
  vec3 ink=mix(vec3(.10,.24,.27),vec3(.65,.76,.76),uNight);
  vec3 drawing=mix(paper,ink,edge*.70);
  outColor=vec4(mix(color,drawing,smoothstep(.12,.88,uReveal)),1.);
}`;

export const surveyWakeGLSL = `
  vec2 relative=(vWorld.xz-uShip.xy)/uShip.w;
  vec2 forward=vec2(sin(uShip.z),cos(uShip.z));
  vec2 across=vec2(forward.y,-forward.x);
  vec2 ship=vec2(dot(relative,across),dot(relative,forward));
  float shadow=exp(-pow(ship.x/.85,2.)-pow(ship.y/2.6,2.))*.23;
  color*=1.-shadow;
  float behind=max(0.,-ship.y-1.5);
  float trail=exp(-pow((abs(ship.x)-.40-behind*.16)*5.,2.));
  trail*=smoothstep(0.,.8,behind)*exp(-behind*.65);
  float thread=.65+.35*sin(behind*6.-uTime*1.4);
  color+=mix(vec3(.18,.24,.21),vec3(.12,.19,.23),uNight)*trail*thread*.24;`;
