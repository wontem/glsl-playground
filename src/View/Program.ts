import * as defaultShaders from './defaultShaders';
import { getGLSLVersion } from './utils/getGLSLVersion';
import { ViewEventType, ViewEvent, Uniform, Attribute } from './models';

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
  onError?: (event: ViewEvent) => void,
): WebGLShader {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  if (onError) {
    onError({
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
  onError?: (event: ViewEvent) => void,
): WebGLProgram {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    return program;
  }

  if (onError) {
    onError({
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

  constructor(
    private gl: WebGL2RenderingContext,
    fragmentSource: string,
    attributes: Attribute[],
    private onError?: (event: ViewEvent) => void,
  ) {
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, this.onError);

    if (!fragmentShader) {
      this.program = getDefaultProgram(gl);
      this.vao = null;
    } else {
      const version = getGLSLVersion(fragmentSource);
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, defaultShaders.getVertexShaderSource(version));
      const program = createProgram(gl, vertexShader, fragmentShader, this.onError);

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      this.program = program;
      this.vao = this.createVAO(attributes);
    }
  }

  public render(
    width: number,
    height: number,
    uniforms: Uniform[],
    frameBuffer: WebGLFramebuffer = null,
  ) {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

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
}