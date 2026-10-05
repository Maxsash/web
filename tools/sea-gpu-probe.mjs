/** Serialized into the isolated QA browser. Blocking readbacks belong in tests only. */
export function probeSeaGPU({ fieldGLSL, edition, coordinates, times }) {
  const gl=document.createElement("canvas").getContext("webgl2");
  if(!gl)throw Error("Parity test needs WebGL2");
  const p=gl.createProgram();
  const vertex="#version 300 es\nprecision highp float;\nlayout(location=0) in vec2 position;\nout vec3 result;\n"+fieldGLSL+"\nvoid main(){result=field(position);gl_Position=vec4(0,0,0,1);}";
  const fragment="#version 300 es\nprecision highp float;\nout vec4 c;void main(){c=vec4(0);}";
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
    gl.attachShader(p,s);gl.deleteShader(s);
  }
  gl.transformFeedbackVaryings(p,["result"],gl.INTERLEAVED_ATTRIBS);gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
  gl.useProgram(p);
  const input=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,input);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordinates.flat()),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.uniform4fv(gl.getUniformLocation(p,"uWaveVectors[0]"),new Float32Array(edition.waves.flatMap(w=>{
    const k=2*Math.PI/w.wavelength;
    return [k*Math.cos(w.direction),k*Math.sin(w.direction),Math.sqrt(9.81*k),w.phase];
  })));
  gl.uniform1fv(gl.getUniformLocation(p,"uAmplitudes[0]"),new Float32Array(edition.waves.map(w=>w.amplitude)));
  const output=gl.createBuffer();gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER,output);
  gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER,coordinates.length*3*4,gl.STREAM_READ);
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER,0,output);gl.enable(gl.RASTERIZER_DISCARD);
  const samples=[];
  for(const t of times){
    gl.uniform1f(gl.getUniformLocation(p,"uTime"),t);gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS,0,coordinates.length);gl.endTransformFeedback();
    const data=new Float32Array(coordinates.length*3);
    gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER,0,data);samples.push([...data]);
  }
  gl.deleteBuffer(input);gl.deleteBuffer(output);gl.deleteProgram(p);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return samples;
}
