import { PingPongFramebuffer } from '../../View/Framebuffer';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

export class OpGLRenderToTexture extends OpLifeCycle {
  name = 'GLRenderToTexture';
  private fb: PingPongFramebuffer;
  private gl: WebGL2RenderingContext;

  constructor(node: OpNodeStore, context: WebGL2RenderingContext) {
    super(node);

    this.gl = context;
    this.fb = new PingPongFramebuffer(context);

    this.addInPort('program', PortDataType.OBJECT, null);
    this.addInPort('width', PortDataType.NUMBER, 1024);
    this.addInPort('height', PortDataType.NUMBER, 1024);
    this.addOutTrigger('next');

    this.addInTrigger('render', () => {
      if (!this.state.program) {
        return;
      }

      this.fb.activate();
      this.state.program.render(
        this.fb.getResolution(),
        this.fb.getCurrentFramebuffer(),
      );
      this.fb.swap();

      this.triggerOut('next');
    });
  }

  opDidCreate() {
    this.fb.resize([this.state.width, this.state.height]);
  }

  opDidUpdate(prevState: any) {
    if (
      this.state.width !== prevState.width ||
      this.state.height !== prevState.height
    ) {
      this.fb.resize([this.state.width, this.state.height]);
    }
  }

  opWillBeDestroyed() {
    this.fb.destroy();
  }
}
