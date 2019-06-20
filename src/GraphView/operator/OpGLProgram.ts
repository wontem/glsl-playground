import * as defaultShaders from '../../View/defaultShaders';
import { Program } from '../../View/Program';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

export class OpGLProgram extends OpLifeCycle {
  name = 'GLProgram';
  private program: Program;
  private gl: WebGL2RenderingContext;
  private uniformsMap: Map<string, WebGLActiveInfo> = new Map();

  constructor(node: OpNodeStore, context: WebGL2RenderingContext) {
    super(node);

    this.program = new Program(context);
    this.gl = context;

    this.addInPort(
      'vert',
      PortDataType.STRING,
      defaultShaders.getVertexShaderSource(300),
    );
    this.addInPort(
      'frag',
      PortDataType.STRING,
      `#version 300 es
precision mediump float;

uniform float t;

out vec4 frag_color;

void main() {
  frag_color = vec4(1., abs(sin(t / 100.)), 0., 1.);
}
`,
    );

    this.addOutTrigger('next');
    this.addOutPort('program', PortDataType.OBJECT, this.program);
  }

  private updateShader() {
    this.program.update(this.state.frag);

    const uniformsInfo = this.program.getUniformsInfo();

    // TODO: add/remove/update actual ports
    uniformsInfo.forEach((info) => {
      const { name, type, size } = info;

      if (this.uniformsMap.has(name)) {
        return;
      }

      this.uniformsMap.set(name, info);

      switch (type) {
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
          if (size > 1) {
            this.addInPort(name, PortDataType.ARRAY, [], name);
          }
        }
      }
    });
  }

  opDidCreate() {
    this.updateShader();
    this.sendOutPortValue('program', this.program);
  }

  opDidUpdate(prevState: any) {
    if (prevState.frag !== this.state.frag) {
      this.updateShader();
    }
    // TODO: optimize and move into OpGLFramebuffer
    const uniforms: Record<string, number[]> = {};

    this.uniformsMap.forEach((info, name) => {
      uniforms[name] = [this.state[name]];
    });

    this.program.setUniforms(uniforms);

    // TODO: send actual output port value to linked inputs on linking stage
    this.sendOutPortValue('program', this.program);
    this.triggerOut('next');
  }

  opWillBeDestroyed() {
    this.program.destroy();
  }
}
