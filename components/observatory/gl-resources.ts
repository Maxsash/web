export class GlResources {
  private programs: WebGLProgram[] = [];
  private buffers: WebGLBuffer[] = [];
  private arrays: WebGLVertexArrayObject[] = [];

  constructor(private gl: WebGL2RenderingContext) {}

  program(vertexSource: string, fragmentSource: string) {
    const { gl } = this;
    const program = gl.createProgram()!;
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertexSource],
      [gl.FRAGMENT_SHADER, fragmentSource],
    ] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(message || "Shader could not link");
    }
    this.programs.push(program);
    return program;
  }

  vertexArray() {
    const array = this.gl.createVertexArray()!;
    this.arrays.push(array);
    this.gl.bindVertexArray(array);
    return array;
  }

  buffer(target: number, data: Float32Array | Uint16Array) {
    const buffer = this.gl.createBuffer()!;
    this.buffers.push(buffer);
    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, this.gl.STATIC_DRAW);
  }

  uniforms(program: WebGLProgram, names: string[]) {
    return Object.fromEntries(
      names.map((name) => [name, this.gl.getUniformLocation(program, name)]),
    );
  }

  dispose() {
    this.buffers.forEach((buffer) => this.gl.deleteBuffer(buffer));
    this.arrays.forEach((array) => this.gl.deleteVertexArray(array));
    this.programs.forEach((program) => this.gl.deleteProgram(program));
  }
}
