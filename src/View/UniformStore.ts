import { UniformInfo } from './types';

// https://github.com/mrdoob/three.js/blob/640f046fc6f3918778e9dfb59fcc9ab3fac9cb05/src/renderers/webgl/WebGLUniforms.js
function useUniform(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation,
  type: number,
  value: number[],
): void {
  switch (type) {
    case gl.FLOAT:
      return gl.uniform1fv(location, value);
    case gl.FLOAT_VEC2:
      return gl.uniform2fv(location, value);
    case gl.FLOAT_VEC3:
      return gl.uniform3fv(location, value);
    case gl.FLOAT_VEC4:
      return gl.uniform4fv(location, value);
    case gl.INT:
    case gl.BOOL:
      return gl.uniform1iv(location, value);
    case gl.INT_VEC2:
    case gl.BOOL_VEC2:
      return gl.uniform2iv(location, value);
    case gl.INT_VEC3:
    case gl.BOOL_VEC3:
      return gl.uniform3iv(location, value);
    case gl.INT_VEC4:
    case gl.BOOL_VEC4:
      return gl.uniform4iv(location, value);
    case gl.SAMPLER_2D:
      return gl.uniform1iv(location, value); // TODO: maybe need smarter setter here
    default:
      // FIXME: add methods for other types
      throw 'Unknown type';
  }
}

function getActiveUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): Record<string, UniformInfo> {
  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const activeUniforms: Record<string, UniformInfo> = {};

  for (let i = 0; i < numUniforms; i += 1) {
    const { name, type } = gl.getActiveUniform(program, i)!;
    const location = gl.getUniformLocation(program, name)!;

    activeUniforms[name] = {
      location,
      name,
      type,
    };
  }

  return activeUniforms;
}

export class UniformState {
  private uniforms: Record<string, number[]> = {};
  private uniformsInfoMap!: Record<string, UniformInfo>;
  private shouldRecalculateLocations: boolean = true;

  constructor(private gl: WebGL2RenderingContext) {}

  clear() {
    this.shouldRecalculateLocations = true;
  }

  setUniforms(uniforms: Record<string, number[]>) {
    this.uniforms = uniforms;
  }

  // TODO: Optimize. Use uniform store as singleton and cache each uniforms
  applyUniforms(program: WebGLProgram) {
    if (this.shouldRecalculateLocations) {
      this.uniformsInfoMap = getActiveUniforms(this.gl, program);
    }

    Object.keys(this.uniforms).forEach((name) => {
      const uniformInfo = this.uniformsInfoMap[name];

      if (uniformInfo) {
        const { type, location } = uniformInfo;
        const value = this.uniforms[name];

        useUniform(this.gl, location, type, value);
      }
    });
  }
}
