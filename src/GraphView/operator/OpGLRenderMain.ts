import { GLState } from '../../GLContext';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

export class OpGLRenderToMain extends OpLifeCycle {
  name = 'OpGLRenderToMain';
  private gl: WebGL2RenderingContext;

  constructor(node: OpNodeStore, context: GLState) {
    super(node);

    this.gl = context.gl;

    this.addInTrigger('render', () => {
      if (!this.state.program) {
        return;
      }

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.state.program.render([
        this.gl.drawingBufferWidth,
        this.gl.drawingBufferHeight,
      ]);
    });

    this.addInPort('program', PortDataType.OBJECT, null);
  }
}
