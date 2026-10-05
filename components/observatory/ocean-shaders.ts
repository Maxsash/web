// The same six coefficients drive the GPU, CPU ship pose and server print.
export const fieldGLSL = `
uniform vec4 uWaves[6];
uniform float uTime;
vec3 field(vec2 p) {
  vec3 s = vec3(0.0);
  for (int i=0; i<6; i++) {
    vec4 w=uWaves[i];
    float k=6.28318530718/w.y;
    vec2 d=vec2(cos(w.z),sin(w.z));
    float a=k*dot(d,p)-sqrt(9.81*k)*uTime+w.w;
    s += vec3(w.x*sin(a),w.x*k*cos(a)*d);
  }
  return s;
}`;

export const seaVertex = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPosition;
uniform mat4 uVP;
out vec3 vWorld;
out vec3 vNormal;
${fieldGLSL}
void main() {
  vec3 s=field(aPosition);
  vWorld=vec3(aPosition.x,s.x,aPosition.y);
  vNormal=normalize(vec3(-s.y,1.,-s.z));
  gl_Position=uVP*vec4(vWorld,1.);
}`;

export const seaFragment = `#version 300 es
precision highp float;
in vec3 vWorld;
in vec3 vNormal;
uniform vec3 uEye;
uniform vec2 uResolution;
uniform float uReveal;
out vec4 outColor;
${fieldGLSL}
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
  vec3 light=normalize(vec3(-.38,.33,-.83));
  float fresnel=.035+.965*pow(1.-max(dot(n,view),0.),4.);
  vec3 sky=mix(vec3(.81,.77,.66),vec3(.16,.29,.35),pow(clamp(reflected.y,0.,1.),.55));
  vec3 deep=vec3(.012,.12,.145);
  vec3 body=mix(deep,vec3(.045,.26,.27),clamp(vWorld.y*.3+.35,0.,1.));
  vec3 color=mix(body,sky,fresnel*.84);
  float glint=pow(max(dot(reflect(-light,n),view),0.),110.);
  float broad=pow(max(dot(reflect(-light,n),view),0.),18.);
  color+=vec3(1.,.82,.52)*(glint*.95+broad*.04);
  // A soft contact shadow and restrained V wake anchor the vessel spatially.
  vec2 ship=vWorld.xz-vec2(4.5,-5.5);
  float shadow=exp(-dot(ship*vec2(.6,1.4),ship*vec2(.6,1.4)))*.34;
  color*=1.-shadow;
  float wake=exp(-pow(abs(ship.x)-max(ship.y,0.)*.25,2.)*12.)*exp(-ship.y*.24)*step(0.,ship.y);
  color+=vec3(.13,.22,.2)*wake*.22;
  float dist=length(uEye-vWorld);
  float fog=1.-exp(-dist*.007);
  color=mix(color,vec3(.47,.58,.58),fog*fog);
  // Reveal the exact moving geometry, not a separately animated drawing.
  float grid=max(rule(vWorld.x*.4,.007),rule(vWorld.z*.4,.007));
  float contours=rule(exact.x*3.5,.008);
  vec3 paper=vec3(.91,.9,.84);
  vec3 drawing=mix(paper,vec3(.16,.31,.33),grid*.42);
  drawing=mix(drawing,vec3(.13,.28,.31),contours*.82);
  drawing-=max(0.,-vWorld.y)*.025;
  float screenY=gl_FragCoord.y/uResolution.y;
  float wipe=smoothstep(-.12,.12,uReveal*1.5-.25-(screenY*.75));
  color=mix(color,drawing,wipe);
  outColor=vec4(color,1.);
}`;

export const skyVertex = `#version 300 es
precision highp float;
out vec2 vUv;
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));vUv=p;gl_Position=vec4(p*2.-1.,.9999,1.);}`;

export const skyFragment = `#version 300 es
precision highp float;
in vec2 vUv;
uniform float uReveal;
out vec4 outColor;
void main(){
  vec3 color=mix(vec3(.60,.68,.66),vec3(.07,.16,.21),smoothstep(.1,1.,vUv.y));
  float glow=exp(-length((vUv-vec2(.72,.45))*vec2(1.5,2.2))*5.);
  color+=vec3(.53,.36,.13)*glow*.6;
  color=mix(color,vec3(.91,.9,.84),smoothstep(.05,.8,uReveal));
  outColor=vec4(color,1.);
}`;

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

export const shipFragment = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vColor;
in vec3 vBary;
uniform float uReveal;
out vec4 outColor;
void main(){
  float light=.55+.45*abs(dot(normalize(vNormal),normalize(vec3(-.38,.65,-.8))));
  vec3 color=vColor*light;
  vec3 edges=smoothstep(vec3(0.),fwidth(vBary)*.85,vBary);
  float edge=1.-min(min(edges.x,edges.y),edges.z);
  vec3 drawing=mix(vec3(.94,.92,.85),vec3(.1,.24,.27),edge*.8);
  outColor=vec4(mix(color,drawing,smoothstep(.12,.88,uReveal)),1.);
}`;
