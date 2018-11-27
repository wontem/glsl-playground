import * as defaultShaders from './defaultShaders';
import { getGLSLVersion } from './utils/getGLSLVersion';
import { ViewEventType, ViewEvent, Uniform, Attribute, Resolution } from './models';

const defaultProgramMap: WeakMap<WebGL2RenderingContext, WebGLProgram> = new WeakMap();

function getDefaultProgram(gl: WebGL2RenderingContext): WebGLProgram {
  if (defaultProgramMap.has(gl)) {
    return defaultProgramMap.get(gl);
  }

  const program = createDefaultProgram(gl);
  defaultProgramMap.set(gl, program);

  return program;
}

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
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private fragmentSource: string;

  constructor(
    private gl: WebGL2RenderingContext,
    attributes: Attribute[],
  ) {
    this.fragmentSource = '';
    this.program = getDefaultProgram(gl);
    this.vao = this.createVAO(attributes);
  }

  public render(
    [width, height]: Resolution,
    uniforms: Uniform[],
    framebuffer: WebGLFramebuffer = null,
  ) {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.viewport(0, 0, width, height);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    uniforms.forEach(({ method, name, value }) => {
      this.uniform(method, name, ...value);
    });

    // TODO: make it variable
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private uniform(method: string, name: string, ...value: number[]): boolean {
    const location = this.gl.getUniformLocation(this.program, name);

    if (!location) {
      return false;
    }

    this.gl[`uniform${method}`](location, ...value);

    return true;
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

  private createProgram(fragmentSource: string, errors: ViewEvent[]): WebGLProgram {
    const gl = this.gl;
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, errors);

    if (!fragmentShader) {
      return getDefaultProgram(gl);
    }

    const version = getGLSLVersion(fragmentSource);
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, defaultShaders.getVertexShaderSource(version));
    const program = createProgram(gl, vertexShader, fragmentShader, errors);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program || getDefaultProgram(gl);
  }

  public update(fragmentSource: string): ViewEvent[] {
    const errors: ViewEvent[] = [];

    if (this.fragmentSource !== fragmentSource) {
      this.destroyProgram();
      this.program = this.createProgram(fragmentSource, errors);
      this.fragmentSource = fragmentSource;
    }

    return errors;
  }

  private destroyProgram(): void {
    if (getDefaultProgram(this.gl) !== this.program) {
      this.gl.deleteProgram(this.program);
    }

    this.program = null;
  }

  public destroy(): void {
    this.destroyProgram();
    this.gl.deleteVertexArray(this.vao);

    this.vao = null;
  }

  public getSource(): string {
    return this.fragmentSource;
  }
}
