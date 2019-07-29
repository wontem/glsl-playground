import * as defaultShaders from '../../../View/defaultShaders';
import { Program } from '../../../View/Program';
import { Event } from '../../Graph/Node';
import { GL } from './GL';

export interface GLProgram {
  state: {
    vert: string;
    frag: string;
    [k: string]: any;
  };
}

export class GLProgram extends GL {
  private program: Program;
  private uniformsMap: Map<string, WebGLActiveInfo> = new Map();

  constructor(id: string) {
    super(id);

    this.program = new Program(this.gl);

    this.addParameter('vert', defaultShaders.getVertexShaderSource(300));
    this.addParameter('frag', defaultShaders.getFragmentShaderSource());

    this.addOutTrigger('programChanged');
    this.addOutValue('program', this.program);
  }

  private updateShader(newFrag: string) {
    const errors = this.program.update(newFrag);

    if (errors.length > 0) {
      this.emit(Event.NODE_ERROR, errors);
      return;
    }

    const uniformsInfo = this.program.getUniformsInfo();

    this.filterUniformPorts(uniformsInfo);

    uniformsInfo.forEach((info) => {
      const { name, type, size } = info;

      if (this.uniformsMap.has(name)) {
        return;
      }

      this.uniformsMap.set(name, info);

      switch (type) {
        case this.gl.SAMPLER_2D: {
          this.addParameter(name, null);
          break;
        }
        case this.gl.FLOAT:
        case this.gl.INT: {
          this.addParameter(name, 0);
          break;
        }
        case this.gl.BOOL: {
          this.addParameter(name, false);
          break;
        }
        default: {
          this.addParameter(name, []);
        }
      }
    });
  }

  private filterUniformPorts(uniformsInfo: WebGLActiveInfo[]): void {
    const newUniformTypes: Record<string, number> = {};

    uniformsInfo.forEach(({ name, type }) => (newUniformTypes[name] = type));

    this.uniformsMap.forEach(({ name, type }) => {
      if (name in newUniformTypes && newUniformTypes[name] === type) {
        return;
      }

      this.removeParameter(name);
    });
  }

  nodeDidCreate() {
    this.updateShader(this.state.frag);
    this.updateUniforms();
    this.triggerOut('programChanged');
  }

  updateUniforms() {
    // TODO: optimize and move into OpGLFramebuffer
    const uniforms: Record<string, number[]> = {};

    this.uniformsMap.forEach((info, name) => {
      if (info.type === this.gl.SAMPLER_2D) {
        uniforms[name] = [this.state[name] && this.state[name].getUnit()];

        return;
      }

      uniforms[name] = [this.state[name]];
    });

    this.program.setUniforms(uniforms);

    // TODO: send actual output port value to linked inputs on linking stage
    this.sendOut('program', this.program);
  }

  nodeDidUpdate(prevState: GLProgram['state']): void {
    if (prevState.frag !== this.state.frag) {
      this.triggerOut('programChanged');
    }

    this.updateUniforms();
  }

  nodeWillUpdate(nextState: GLProgram['state']): void {
    if (nextState.frag !== this.state.frag) {
      this.updateShader(nextState.frag);
    }
  }

  nodeWillBeDestroyed() {
    this.program.destroy();
  }
}
