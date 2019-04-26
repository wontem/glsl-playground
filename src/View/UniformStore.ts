import { Uniform } from './models';

export class UniformState {
  private uniforms!: Uniform[];
  private locationsMap: Map<string, WebGLUniformLocation>;
  private shouldRecalculateLocations: boolean;

  constructor(
    private gl: WebGL2RenderingContext,
  ) {
    this.locationsMap = new Map();
    this.shouldRecalculateLocations = true;
  }

  clear() {
    this.locationsMap.clear();
    this.shouldRecalculateLocations = true;
  }

  setUniforms(uniforms: Uniform[]) {
    this.uniforms = uniforms;
  }

  applyUniforms(program: WebGLProgram) {
    if (this.shouldRecalculateLocations) {
      this.calculateLocations(program);
    }

    this.uniforms.forEach(({ method, value, name }) => {
      if (this.locationsMap.has(name)) {
        const location = this.locationsMap.get(name);

        // TODO: fix types
        (this.gl as any)[`uniform${method}`](location, ...value);
      }
    });
  }

  private calculateLocations(program: WebGLProgram) {
    this.uniforms.forEach((uniform) => {
      const location = this.gl.getUniformLocation(program, uniform.name);

      if (location) {
        this.locationsMap.set(uniform.name, location);
      }
    });
  }
}
