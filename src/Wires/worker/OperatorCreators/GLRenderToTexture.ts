import { PingPongFramebuffer } from '../../../View/Framebuffer';
import { Filter, Wrap } from '../../../View/models';
import { Program } from '../../../View/Program';
import { GL } from './GL';

const DEFAULT_DIMENSIONS: [number, number] = [1, 1];

export interface GLRenderToTexture {
  state: {
    cycles: number;
    program: Program;
    width: number;
    height: number;
    filter: Filter;
    wrapX: Wrap;
    wrapY: Wrap;
  };
}

export class GLRenderToTexture extends GL {
  private fb: PingPongFramebuffer;

  constructor(id: string) {
    super(id);

    this.fb = new PingPongFramebuffer(this.gl, DEFAULT_DIMENSIONS);

    this.addTrigger('sendTexture', () => {
      this.sendOut('buffer', this.fb);
    });
    this.addParameter('cycles', 1); // TODO: remove it because it should be implemented using seq
    this.addParameter('program', null);
    this.addParameter('width', DEFAULT_DIMENSIONS[0]);
    this.addParameter('height', DEFAULT_DIMENSIONS[1]);

    this.addParameter('filter', Filter.NEAREST);

    this.addParameter('wrapX', Wrap.CLAMP);

    this.addParameter('wrapY', Wrap.CLAMP);

    this.addTrigger('render', () => {
      if (!this.state.program) {
        return;
      }

      for (let index = 0; index < this.state.cycles; index += 1) {
        this.fb.activate();
        this.state.program.render(this.fb.getResolution());
        this.fb.swap();
      }

      this.sendOut('buffer', this.fb);
      this.triggerOut('next');
    });

    this.addOutTrigger('next');
    this.addOutValue('buffer', this.fb);
  }

  nodeDidCreate() {
    this.fb.resize([this.state.width, this.state.height]);
    this.fb.setFilter(this.state.filter);
    this.fb.setWrap([this.state.wrapX, this.state.wrapY]);
  }

  nodeDidUpdate(prevState: any) {
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

  nodeWillBeDestroyed() {
    this.fb.destroy();
  }
}
