import { observable } from 'mobx';
import { GLState } from '../../GLContext';
import * as defaultShaders from '../../View/defaultShaders';
import { ViewEvent } from '../../View/models';
import { Program } from '../../View/Program';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

export class OpGLProgram extends OpLifeCycle {
  name = 'GLProgram';
  private program: Program;
  private gl: WebGL2RenderingContext;
  private uniformsMap: Map<string, WebGLActiveInfo> = new Map();
  @observable errors: ViewEvent[] = [];

  constructor(node: OpNodeStore, context: GLState) {
    super(node);

    this.gl = context.gl;
    this.program = new Program(this.gl);

    this.addInPort(
      'vert',
      PortDataType.STRING,
      defaultShaders.getVertexShaderSource(300),
    );
    this.addInPort(
      'frag',
      PortDataType.STRING,
      defaultShaders.getFragmentShaderSource(),
    );

    this.addOutTrigger('programChanged');
    this.addOutPort('program', PortDataType.OBJECT, this.program);
  }

  private updateShader() {
    this.errors = this.program.update(this.state.frag);

    if (this.errors.length > 0) {
      return;
    }

    const uniformsInfo = this.program.getUniformsInfo();

    // TODO: add/remove/update actual ports
    uniformsInfo.forEach((info) => {
      const { name, type, size } = info;

      if (this.uniformsMap.has(name)) {
        return;
      }

      this.uniformsMap.set(name, info);

      switch (type) {
        case this.gl.SAMPLER_2D: {
          this.addInPort(name, PortDataType.OBJECT, null, name);
          break;
        }
        case this.gl.FLOAT:
        case this.gl.INT: {
          this.addInPort(name, PortDataType.NUMBER, 0, name);
          break;
        }
        case this.gl.BOOL: {
          this.addInPort(name, PortDataType.BOOL, false, name);
          break;
        }
        default: {
          this.addInPort(name, PortDataType.ARRAY, [], name);
        }
      }
    });
  }

  opDidCreate() {
    this.updateShader();
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
    this.sendOutPortValue('program', this.program);
  }

  opDidUpdate(prevState: any) {
    if (prevState.frag !== this.state.frag) {
      this.updateShader();
      this.triggerOut('programChanged');
    }

    this.updateUniforms();
  }

  opWillBeDestroyed() {
    this.program.destroy();
  }
}
