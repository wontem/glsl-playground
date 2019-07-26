import { GLState } from '../../GLContext';
import { PingPongFramebuffer } from '../../View/Framebuffer';
import { Filter, Wrap } from '../../View/models';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

const DEFAULT_DIMENSIONS: [number, number] = [1, 1];

export class OpGLRenderToTexture extends OpLifeCycle {
  name = 'GLRenderToTexture';
  private fb: PingPongFramebuffer;
  private gl: WebGL2RenderingContext;

  constructor(node: OpNodeStore, context: GLState) {
    super(node);

    this.gl = context.gl;
    this.fb = new PingPongFramebuffer(this.gl, DEFAULT_DIMENSIONS);

    this.addInTrigger('sendTexture', () => {
      this.sendOutPortValue('buffer', this.fb);
    });
    this.addInPort('cycles', PortDataType.NUMBER, 1); // TODO: remove it because it should be implemented using seq
    this.addInPort('program', PortDataType.OBJECT, null);
    this.addInPort('width', PortDataType.NUMBER, DEFAULT_DIMENSIONS[0]);
    this.addInPort('height', PortDataType.NUMBER, DEFAULT_DIMENSIONS[1]);

    this.addSelectPort(
      'filter',
      [Filter.LINEAR, Filter.NEAREST],
      Filter.NEAREST,
    );

    this.addSelectPort(
      'wrapX',
      [Wrap.CLAMP, Wrap.MIRROR, Wrap.REPEAT],
      Wrap.CLAMP,
    );

    this.addSelectPort(
      'wrapY',
      [Wrap.CLAMP, Wrap.MIRROR, Wrap.REPEAT],
      Wrap.CLAMP,
    );

    this.addInTrigger('render', () => {
      if (!this.state.program) {
        return;
      }

      for (let index = 0; index < this.state.cycles; index += 1) {
        this.fb.activate();
        this.state.program.render(
          this.fb.getResolution(),
          this.fb.getCurrentFramebuffer(),
        );
        this.fb.swap();
      }

      this.sendOutPortValue('buffer', this.fb);
      this.triggerOut('next');
    });

    this.addOutTrigger('next');
    this.addOutPort('buffer', PortDataType.OBJECT, this.fb);
  }

  opDidCreate() {
    this.fb.resize([this.state.width, this.state.height]);
    this.fb.setFilter(this.state.filter);
    this.fb.setWrap([this.state.wrapX, this.state.wrapY]);
  }

  opDidUpdate(prevState: any) {
    if (
      this.state.width !== prevState.width ||
      this.state.height !== prevState.height
    ) {
      this.fb.resize([this.state.width, this.state.height]);
    }

    if (prevState.filter !== this.state.filter) {
      this.fb.setFilter(this.state.filter);
    }

    if (
      prevState.wrapX !== this.state.wrapX ||
      prevState.wrapY !== this.state.wrapY
    ) {
      this.fb.setWrap([this.state.wrapX, this.state.wrapY]);
    }
  }

  opWillBeDestroyed() {
    this.fb.destroy();
  }
}
