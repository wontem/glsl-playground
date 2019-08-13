import * as defaultShaders from './defaultShaders';
import { Attribute, Resolution, ViewEvent, ViewEventType } from './types';
import { UniformState } from './UniformStore';
import { getGLSLVersion } from './utils/getGLSLVersion';

const defaultAttributes: Attribute[] = [
  {
    name: 'a_position',
    data: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0],
    size: 2,
  },
];

function createDefaultProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertexSource = defaultShaders.getVertexShaderSource(300);
  const fragmentSource = defaultShaders.getFragmentShaderSource();

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)!;
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)!;

  const program = createProgram(gl, vertexShader, fragmentShader)!;

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  errors?: ViewEvent[],
): WebGLShader | null {
  const shader = gl.createShader(type)!;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  if (errors) {
    errors.push({
      type: ViewEventType.CREATE_SHADER,
      message: gl.getShaderInfoLog(shader)!,
    });
  }

  gl.deleteShader(shader);

  return null;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader | null,
  fragmentShader: WebGLShader | null,
  errors?: ViewEvent[],
): WebGLProgram | null {
  const program = gl.createProgram()!;

  if (vertexShader && fragmentShader) {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
  }

  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    return program;
  }

  if (errors) {
    errors.push({
      type: ViewEventType.CREATE_PROGRAM,
      message: gl.getProgramInfoLog(program)!,
    });
  }

  gl.deleteProgram(program);

  return null;
}

export class Program {
  private static defaultProgramMap: WeakMap<
    WebGL2RenderingContext,
    WebGLProgram
  > = new WeakMap();

  private static getDefaultProgram(gl: WebGL2RenderingContext): WebGLProgram {
    if (this.defaultProgramMap.has(gl)) {
      return this.defaultProgramMap.get(gl)!;
    }

    const program = createDefaultProgram(gl);
    this.defaultProgramMap.set(gl, program);

    return program;
  }

  public static destroyDefaultProgram(gl: WebGL2RenderingContext): void {
    if (this.defaultProgramMap.has(gl)) {
      const program = this.defaultProgramMap.get(gl)!;
      gl.deleteProgram(program);
      this.defaultProgramMap.delete(gl);
    }
  }

  private static createProgram(
    gl: WebGL2RenderingContext,
    fragmentSource: string,
    errors: ViewEvent[],
  ): WebGLProgram | null {
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentSource,
      errors,
    );

    if (!fragmentShader) {
      return null;
    }

    const version = getGLSLVersion(fragmentSource);
    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      defaultShaders.getVertexShaderSource(version),
    );
    const program = createProgram(gl, vertexShader, fragmentShader, errors);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program || null;
  }

  private valid: boolean = true;
  private fragmentSource: string = '';
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private uniformState: UniformState;

  public get isValid(): boolean {
    return this.valid;
  }

  constructor(
    private gl: WebGL2RenderingContext,
    attributes: Attribute[] = defaultAttributes,
  ) {
    this.program = Program.getDefaultProgram(gl);
    this.vao = this.createVAO(attributes);
    this.uniformState = new UniformState(gl);
  }

  public setUniforms(uniforms: Record<string, number[]>) {
    this.uniformState.setUniforms(uniforms);
  }

  public render([width, height]: Resolution) {
    const gl = this.gl;

    gl.viewport(0, 0, width, height);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    this.uniformState.applyUniforms(this.program);

    // TODO: make it variable
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private setAttribute(name: string, data: number[], size: number) {
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
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    attributes.forEach(({ name, data, size }) => {
      this.setAttribute(name, data, size);
    });

    return vao;
  }

  public getUniformsInfo(): WebGLActiveInfo[] {
    const gl = this.gl;
    const numUniforms = gl.getProgramParameter(
      this.program,
      gl.ACTIVE_UNIFORMS,
    );

    const infoArray: WebGLActiveInfo[] = [];

    for (let i = 0; i < numUniforms; i += 1) {
      const info = gl.getActiveUniform(this.program, i)!;
      infoArray.push(info);
    }

    return infoArray;
  }

  public update(fragmentSource: string): ViewEvent[] {
    const errors: ViewEvent[] = [];

    if (this.fragmentSource !== fragmentSource) {
      this.destroyProgram();
      const program = Program.createProgram(this.gl, fragmentSource, errors);

      if (program) {
        this.program = program;
        this.valid = true;
      } else {
        this.program = Program.getDefaultProgram(this.gl);
        this.valid = false;
      }

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
    delete this.program;
  }

  public destroy(): void {
    this.destroyProgram();
    delete this.uniformState;
    this.gl.deleteVertexArray(this.vao);
    delete this.vao;
  }

  public getSource(): string {
    return this.fragmentSource;
  }
}
