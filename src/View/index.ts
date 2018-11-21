import { EventEmitter } from 'events';
import * as defaultShaders from './defaultShaders';
import { ViewEvent, Uniform, TextureUpdate } from './models';
import { Program } from './Program';
import { Texture } from './Texture';

export class View extends EventEmitter {
  private program: Program;
  private textures: Map<string, Texture>;

  constructor(
    private gl: WebGL2RenderingContext,
  ) {
    super();

    this.textures = new Map();
    this.load(defaultShaders.getFragmentShaderSource());
  }

  private trigger(level: string, event: ViewEvent): void {
    this.emit(level, event);
  }

  public render(uniforms: Uniform[] = []) {
    const textureUniforms: Uniform[] = [...this.textures].reduce<Uniform[]>(
      (uniforms, [name, texture]) => {
        return [
          ...uniforms,
          {
            name,
            method: '1i',
            value: [texture.getUnit()],
          },
          {
            name: `${name}_resolution`,
            method: '2f',
            value: texture.getSize(),
          },
        ];
      },
      [],
    );

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
        ...textureUniforms,
        ...uniforms,
      ],
    );
  }

  public createTexture(name: string) {
    const gl = this.gl;

    const texture = new Texture(gl);

    this.textures.set(name, texture);
  }

  public updateTexture(
    name: string,
    textureUpdate: Partial<TextureUpdate>,
  ) {
    const texture = this.textures.get(name);

    if ('source' in textureUpdate) {
      texture.setSource(
        textureUpdate.source,
        textureUpdate.source.width,
        textureUpdate.source.height,
        textureUpdate.flipY,
        textureUpdate.filter,
        textureUpdate.wrap,
      );
    } else {
      if ('filter' in textureUpdate) {
        texture.setFilter(textureUpdate.filter);
      }
      if ('wrap' in textureUpdate) {
        texture.setWrap(textureUpdate.wrap);
      }
    }
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
