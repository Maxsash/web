export const cloudFunctions = `
vec3 cloudLobe(vec2 p,vec2 centre,vec2 radius){
  vec2 q=(p-centre)/radius;
  float density=exp(-2.5*dot(q,q));
  return vec3(density,-5.*density*q/radius);
}
vec3 cloudCluster(vec2 uv,vec2 centre,float scale,float aspect,float time){
  vec2 p=uv-centre-vec2(time*.0004,0.);
  p.x=mod(p.x+1.5,3.)-1.5;
  p*=vec2(aspect,1.)/scale;
  if(abs(p.x)>.24||abs(p.y)>.10)return vec3(0.);
  vec3 cloud=.7*cloudLobe(p,vec2(-.015,-.013),vec2(.18,.026))
    +cloudLobe(p,vec2(-.078,.009),vec2(.055,.036))
    +cloudLobe(p,vec2(-.025,.026),vec2(.064,.045))
    +cloudLobe(p,vec2(.035,.015),vec2(.058,.038))
    +.8*cloudLobe(p,vec2(.086,.004),vec2(.048,.029))
    +.6*cloudLobe(p,vec2(-.126,-.006),vec2(.043,.025));
  float texture=sin(p.x*173.+sin(p.y*117.))*sin(p.y*149.-p.x*83.);
  float opacity=smoothstep(.16,.95,cloud.x+texture*.055);
  vec3 normal=normalize(vec3(-cloud.yz*.013,1.));
  float light=clamp(dot(normal,normalize(vec3(.5,.75,.65))),0.,1.);
  return vec3(opacity,light,0.);
}
vec2 cloudLayers(vec2 uv,float aspect,float time,vec4 atmosphere){
  float wide=smoothstep(.65,1.2,aspect);
  float height=mix(.84,.80,smoothstep(1.8,2.4,aspect));
  vec2 offset=vec2(atmosphere.x,0.);
  vec3 first=cloudCluster(uv,vec2(mix(.84,.57,wide),height)+offset,mix(.65,1.,wide),aspect,time);
  vec3 second=cloudCluster(uv,vec2(1.01,.88)+offset,.55,aspect,time);
  float opacity=1.-(1.-first.x*.58)*(1.-second.x*.48);
  float light=(first.y*first.x+second.y*second.x)/max(first.x+second.x,.001);
  return vec2(clamp(opacity*atmosphere.y,0.,1.),light);
}`;

export const cloudSkyGLSL = `
  vec2 clouds=cloudLayers(vUv,uAspect,uTime,uAtmosphere);
  vec3 dayCloud=mix(vec3(.64,.76,.79),vec3(.97,.94,.83),clouds.y);
  float moonGlow=pow(clamp(uMoon.x,0.,1.),.65);
  vec3 nightCloud=mix(vec3(.025,.05,.075),vec3(.10,.16,.22),clouds.y);
  nightCloud+=vec3(.11,.12,.12)*moonGlow*pow(clouds.y,3.);
  float nightHaze=exp(-pow(abs(vUv.y-.38)/.17,2.))*(uAtmosphere.w-.65)*.07;
  midnight=mix(midnight,vec3(.11,.19,.23),nightHaze);
  daylight=mix(daylight,dayCloud,clouds.x);
  midnight=mix(midnight,nightCloud,clouds.x);`;
