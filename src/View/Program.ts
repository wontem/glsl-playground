import * as defaultShaders from './defaultShaders';
import { getGLSLVersion } from './utils/getGLSLVersion';
import { ViewEventType, ViewEvent, Uniform, Attribute, Resolution } from './models';
import { UniformState } from './UniformStore';

function createDefaultProgram(gl: WebGL2RenderingContext) {
  const vertexSource = defaultShaders.getVertexShaderSource(300);
  const fragmentSource = defaultShaders.getFragmentShaderSource();

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = createProgram(gl, vertexShader, fragmentShader);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  errors?: ViewEvent[],
): WebGLShader {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  if (errors) {
    errors.push({
      type: ViewEventType.CREATE_SHADER,
      message: gl.getShaderInfoLog(shader),
    });
  }

  gl.deleteShader(shader);

  return null;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  errors?: ViewEvent[],
): WebGLProgram {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    return program;
  }

  if (errors) {
    errors.push({
      type: ViewEventType.CREATE_PROGRAM,
      message: gl.getProgramInfoLog(program),
    });
  }

  gl.deleteProgram(program);

  return null;
}

export class Program {
  private static defaultProgramMap: WeakMap<WebGL2RenderingContext, WebGLProgram> = new WeakMap();
  private static getDefaultProgram(gl: WebGL2RenderingContext): WebGLProgram {
    if (this.defaultProgramMap.has(gl)) {
      return this.defaultProgramMap.get(gl);
    }

    const program = createDefaultProgram(gl);
    this.defaultProgramMap.set(gl, program);

    return program;
  }

  public static destroyDefaultProgram(gl: WebGL2RenderingContext): void {
    if (this.defaultProgramMap.has(gl)) {
      const program = this.defaultProgramMap.get(gl);
      gl.deleteProgram(program);
      this.defaultProgramMap.delete(gl);
    }
  }

  private static createProgram(gl: WebGL2RenderingContext, fragmentSource: string, errors: ViewEvent[]): WebGLProgram {
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, errors);

    if (!fragmentShader) {
      return Program.getDefaultProgram(gl);
    }

    const version = getGLSLVersion(fragmentSource);
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, defaultShaders.getVertexShaderSource(version));
    const program = createProgram(gl, vertexShader, fragmentShader, errors);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program || Program.getDefaultProgram(gl);
  }

  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private fragmentSource: string;
  private uniformState: UniformState;

  constructor(
    private gl: WebGL2RenderingContext,
    attributes: Attribute[],
  ) {
    this.fragmentSource = '';
    this.program = Program.getDefaultProgram(gl);
    this.vao = this.createVAO(attributes);
    this.uniformState = new UniformState(gl);
  }

  public setUniforms(uniforms: Uniform[]) {
    this.uniformState.setUniforms(uniforms);
  }

  public render(
    [width, height]: Resolution,
    framebuffer: WebGLFramebuffer = null,
  ) {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.viewport(0, 0, width, height);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    this.uniformState.applyUniforms(this.program);

    // TODO: make it variable
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private setAttribute(
    name: string,
    data: number[],
    size: number,
  ) {
    const gl = this.gl;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW, 0);

    const location = gl.getAttribLocation(this.program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  private createVAO(attributes: Attribute[]): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    attributes.forEach(({ name, data, size }) => {
      this.setAttribute(name, data, size);
    });

    return vao;
  }

  public update(fragmentSource: string): ViewEvent[] {
    const errors: ViewEvent[] = [];

    if (this.fragmentSource !== fragmentSource) {
      this.destroyProgram();
      this.program = Program.createProgram(this.gl, fragmentSource, errors);
      this.fragmentSource = fragmentSource;
      this.uniformState.clear();
    }

    return errors;
  }

  private destroyProgram(): void {
    if (Program.getDefaultProgram(this.gl) !== this.program) {
      this.gl.deleteProgram(this.program);
    }

    this.uniformState.clear();
    this.program = null;
  }

  public destroy(): void {
    this.destroyProgram();
    this.uniformState = null;
    this.gl.deleteVertexArray(this.vao);
    this.vao = null;
  }

  public getSource(): string {
    return this.fragmentSource;
  }
}
