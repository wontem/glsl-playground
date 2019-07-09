import * as uuid from 'uuid/v4';
import { bitmapLoader } from '../../Editor/utils/bitmapLoader';
import { GLState } from '../../GLContext';
import { Filter, Wrap } from '../../View/models';
import { Texture } from '../../View/Texture';
import { OpNodeStore } from '../stores/OpNodeStore';
import { PortDataType } from './constants';
import { OpLifeCycle } from './OpLifeCycle';

const DEFAULT_DIMENSIONS: [number, number] = [1, 1];

export class OpGLTexture extends OpLifeCycle {
  name = 'OpGLTexture';
  private gl: WebGL2RenderingContext;
  private texture: Texture;
  private id: string = uuid();

  constructor(node: OpNodeStore, context: GLState) {
    super(node);

    this.gl = context.gl;

    this.texture = new Texture(this.gl, DEFAULT_DIMENSIONS);

    this.addInTrigger('sendTexture', () => {
      this.sendOutPortValue('texture', this.texture);
    });
    this.addInPort('url', PortDataType.STRING, '');
    this.addInPort('flipY', PortDataType.BOOL, true);

    this.addSelectPort(
      'filter',
      [Filter.LINEAR, Filter.NEAREST, Filter.MIPMAP],
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

    this.addOutTrigger('loaded');
    this.addOutPort('texture', PortDataType.OBJECT, this.texture);
    this.addOutPort('width', PortDataType.NUMBER, DEFAULT_DIMENSIONS[0]);
    this.addOutPort('height', PortDataType.NUMBER, DEFAULT_DIMENSIONS[1]);
  }

  async updateTextureSource() {
    try {
      const bitmap = await bitmapLoader.download(this.id, this.state.url, {
        imageOrientation: this.state.flipY ? 'flipY' : 'none',
      });

      this.texture.setSource(
        bitmap,
        undefined,
        this.state.flipY,
        this.state.filter,
        this.state.wrap,
      );

      this.sendOutPortValue('width', bitmap.width);
      this.sendOutPortValue('height', bitmap.height);

      bitmap.close();

      this.triggerOut('loaded');
    } catch (error) {
      console.error(error);
    }
  }

  opDidCreate() {
    this.updateTextureSource();
  }

  opDidUpdate(prevState: any) {
    if (
      prevState.url !== this.state.url ||
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

  opWillBeDestroyed() {
    this.texture.destroy();
    delete this.texture;
  }
}
