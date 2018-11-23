import { EventEmitter } from 'events';
import * as defaultShaders from './defaultShaders';
import { ViewEvent, Uniform, TextureUpdate } from './models';
import { Program } from './Program';
import { Texture } from './Texture';
import { DoubleFramebuffer } from './Framebuffer';

// interface ProgramConfigs {
//   program: Program;
//   output: DoubleFramebuffer;
// }

export class View extends EventEmitter {
  private program: Program;
  private textures: Map<number, Texture>;
  private framebuffers: Map<number, DoubleFramebuffer>;

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

  public render(
    uniforms: Uniform[] = [],
    textures: [string, number][] = [],
  ) {
    const textureUniforms: Uniform[] = textures.reduce<Uniform[]>(
      (uniforms, [name, unit]) => {
        const texture = this.textures.get(unit);

        return [
          ...uniforms,
          {
            name,
            method: '1i',
            value: [unit],
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
        ...textureUniforms,
        ...uniforms,
      ],
    );
  }

  public createTexture(): number {
    const texture = new Texture(this.gl);
    const unit = texture.getUnit();
    this.textures.set(unit, texture);

    return unit;
  }

  public createFramebuffer(fragmentSource: string) {
    const fb = new DoubleFramebuffer(this.gl);
    const unit = fb.getUnit();
    this.framebuffers.set(unit, []);

    return fb.getUnit();
  }

  public updateTexture(
    unit: number,
    textureUpdate: Partial<TextureUpdate>,
  ) {
    const texture = this.textures.get(unit);

    if ('source' in textureUpdate) {
      texture.setSource(
        textureUpdate.source,
        textureUpdate.size || null,
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
  }

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
