import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

export class OpGLRenderToMain extends OpLifeCycle {
  name = 'OpGLRenderToMain';
  private gl: WebGL2RenderingContext;

  constructor(node: OpNodeStore, context: WebGL2RenderingContext) {
    super(node);

    this.gl = context;

    this.addInTrigger('render', () => {
      if (!this.state.program) {
        return;
      }

      this.state.program.render(
        [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight],
        null,
      );
    });

    this.addInPort('program', PortDataType.OBJECT, null);
  }
}
