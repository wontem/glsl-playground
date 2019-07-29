// import { bitmapLoader } from '../../Editor/utils/bitmapLoader';

import { Filter, Wrap } from '../../../View/models';
import { Texture } from '../../../View/Texture';
import { GL } from './GL';

const DEFAULT_DIMENSIONS: [number, number] = [1, 1];

export interface GLTexture {
  state: {
    filter: Filter;
    wrapX: Wrap;
    wrapY: Wrap;
    flipY: boolean;
    bitmap: ImageBitmap;
  };
}

export class GLTexture extends GL {
  private texture: Texture;

  constructor(id: string) {
    super(id);

    this.texture = new Texture(this.gl, DEFAULT_DIMENSIONS);

    this.addTrigger('sendTexture', () => {
      this.sendOut('texture', this.texture);
    });
    this.addParameter('url', '');
    this.addParameter('flipY', true);

    this.addParameter('filter', Filter.NEAREST);

    this.addParameter('wrapX', Wrap.CLAMP);

    this.addParameter('wrapY', Wrap.CLAMP);

    this.addOutTrigger('loaded');
    this.addOutValue('texture', this.texture);
    this.addOutValue('width', DEFAULT_DIMENSIONS[0]);
    this.addOutValue('height', DEFAULT_DIMENSIONS[1]);
  }

  updateTextureSource() {
    try {
      this.texture.setSource(
        this.state.bitmap,
        undefined,
        this.state.flipY,
        this.state.filter,
        [this.state.wrapX, this.state.wrapY],
      );

      this.sendOut('width', this.state.bitmap.width);
      this.sendOut('height', this.state.bitmap.height);

      this.state.bitmap.close();

      this.triggerOut('loaded');
    } catch (error) {
      console.error(error);
    }
  }

  nodeDidCreate() {
    this.updateTextureSource();
  }

  nodeDidUpdate(prevState: GLTexture['state']) {
    if (
      prevState.bitmap !== this.state.bitmap ||
      prevState.flipY !== this.state.flipY
    ) {
      this.updateTextureSource();
      return;
    }

    if (prevState.filter !== this.state.filter) {
      this.texture.setFilter(this.state.filter);
    }

    if (
      prevState.wrapX !== this.state.wrapX ||
      prevState.wrapY !== this.state.wrapY
    ) {
      this.texture.setWrap([this.state.wrapX, this.state.wrapY]);
    }
  }

  nodeWillBeDestroyed() {
    this.texture.destroy();
    delete this.texture;
  }
}
