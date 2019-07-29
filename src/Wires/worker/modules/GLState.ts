import { EventEmitter } from 'events';

export class GLState extends EventEmitter {
  readonly gl: WebGL2RenderingContext;

  constructor(canvas: OffscreenCanvas) {
    super();

    const gl: WebGL2RenderingContext = (canvas as any).getContext('webgl2', {
      preserveDrawingBuffer: true,
    });

    if (gl) {
      this.gl = gl;
      gl.getExtension('EXT_color_buffer_float');
      gl.getExtension('OES_texture_float_linear');
    } else {
      throw 'Cannot get gl context';
    }
  }

  get canvas(): OffscreenCanvas {
    return (this.gl as any).canvas;
  }

  set width(width: number) {
    if (width !== this.canvas.width) {
      this.canvas.width = width;
      this.emit('resize', [this.width, this.height]);
    }
  }

  set height(height: number) {
    if (height !== this.canvas.height) {
      this.canvas.height = height;
      this.emit('resize', [this.width, this.height]);
    }
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  commit(): void {
    (this.gl as any).commit();
  }
}
