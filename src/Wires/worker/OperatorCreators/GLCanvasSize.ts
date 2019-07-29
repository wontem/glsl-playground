import { GL } from './GL';

export class GLCanvasSize extends GL {
  constructor(id: string) {
    super(id);

    this.addOutValue('width', this.glState.width);
    this.addOutValue('height', this.glState.height);
    this.addOutTrigger('change');

    this.glState.on('resize', this.onResize);
  }

  onResize = ([width, height]: [number, number]): void => {
    this.sendOut('width', width);
    this.sendOut('height', height);
    this.triggerOut('change');
  }

  nodeWillBeDestroyed() {
    this.glState.off('resize', this.onResize);
  }
}
