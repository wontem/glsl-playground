import { EventEmitter } from 'events';
import * as defaultShaders from './defaultShaders';
import { ViewEvent } from './models';
import { Program } from './Program';

export class View extends EventEmitter {
  private program: Program;

  constructor(
    private gl: WebGL2RenderingContext,
  ) {
    super();

    this.load(defaultShaders.getFragmentShaderSource());
  }

  private trigger(level: string, event: ViewEvent): void {
    this.emit(level, event);
  }

  public render() {
    this.program.render(
      this.gl.drawingBufferWidth,
      this.gl.drawingBufferHeight,
      [
        {
          name: 'u_time',
          method: '1f',
          value: [performance.now() / 1000],
        },
        {
          name: 'u_resolution',
          method: '2f',
          value: [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight],
        },
      ],
    );
  }

  public texture(unit: number, name: string, source: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) {
    const gl = this.gl;

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, source.width, source.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);

    // TODO: REFACTOR THIS!!!
    this.program['uniform']('1i', name, unit);
    this.program['uniform']('2f', `${name}_resolution`, source.width, source.height);
  }

  public load(fragmentSource: string) {
    const gl = this.gl;
    this.program = new Program(
      gl,
      fragmentSource,
      [{
        name: 'a_position',
        data: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0],
        size: 2,
      }],
      event => this.trigger('error', event),
    );

    this.render();
  }

  // public createBuffer(fragmentSource: string) {
  //   const gl = this.gl;
  //   const program = this.createProgramWithFallback(fragmentSource);
  // }

  public resize(width: number, height: number) {
    const gl = this.gl;

    if (
      width !== gl.canvas.width ||
      height !== gl.canvas.height
    ) {
      gl.canvas.width = width;
      gl.canvas.height = height;

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
  }
}
