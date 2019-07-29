import { Program } from '../../../View/Program';
import { GL } from './GL';

export interface GLRenderToMain {
  state: {
    program: Program | null;
  };
}

export class GLRenderToMain extends GL {
  constructor(id: string) {
    super(id);

    this.addTrigger('render', () => {
      if (!this.state.program) {
        return;
      }

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      this.state.program.render([
        this.gl.drawingBufferWidth,
        this.gl.drawingBufferHeight,
      ]);
    });

    this.addParameter('program', null);
  }
}
