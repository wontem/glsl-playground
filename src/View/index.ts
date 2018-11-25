import { EventEmitter } from 'events';
import * as defaultShaders from './defaultShaders';
import { ViewEvent, Uniform, TextureUpdate, Attribute } from './models';
import { Program } from './Program';
import { Texture } from './Texture';
import { DoubleFramebuffer } from './Framebuffer';

interface ProgramConfig {
  program: Program;
  output: DoubleFramebuffer;
}

export class View extends EventEmitter {
  private programs: ProgramConfig[];
  private textures: Map<number, Texture>;
  private framebuffers: Map<number, DoubleFramebuffer>;

  constructor(
    private gl: WebGL2RenderingContext,
  ) {
    super();

    this.textures = new Map();
    this.load([defaultShaders.getFragmentShaderSource()]);
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
            value: texture.getResolution(),
          },
        ];
      },
      [],
    );

    const fbUniforms: Uniform[] = this.programs.reduce<Uniform[]>(
      (uniforms, { output }, index) => {
        if (!output) {
          return uniforms;
        }

        const name = `channel${index}`;

        return [
          ...uniforms,
          {
            name,
            method: '1i',
            value: [output.getUnit()],
          },
          {
            name: `${name}_resolution`,
            method: '2f',
            value: output.getResolution(),
          },
        ];
      },
      [],
    );

    const allUniforms = [
      ...textureUniforms,
      ...uniforms,
      ...fbUniforms,
    ];

    this.programs.forEach(({ program, output }) => {
      if (output) {
        output.activate();

        program.render(
          output.getResolution(),
          allUniforms,
          output.getCurrentFramebuffer(),
        );

        output.swap();
      } else {
        program.render(
          [
            this.gl.drawingBufferWidth,
            this.gl.drawingBufferHeight,
          ],
          allUniforms,
          null,
        );
      }
    });
  }

  public createTexture(): number {
    const texture = new Texture(this.gl);
    const unit = texture.getUnit();
    this.textures.set(unit, texture);

    return unit;
  }

  public updateTexture(
    unit: number,
    textureUpdate: Partial<TextureUpdate>,
  ) {
    const texture = this.textures.get(unit);

    if ('source' in textureUpdate) {
      texture.setSource(
        textureUpdate.source,
        textureUpdate.resolution || undefined,
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

  public load(fragmentSources: string[]) {
    const gl = this.gl;

    const attributes: Attribute[] = [{
      name: 'a_position',
      data: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0],
      size: 2,
    }];

    this.programs = fragmentSources.map<ProgramConfig>((fragmentSource, index, array) => {
      const program = new Program(
        gl,
        fragmentSource,
        attributes,
        event => this.trigger('error', event),
      );

      const output = index === array.length - 1 ? null : new DoubleFramebuffer(gl);

      return {
        program,
        output,
      };
    });

  }

  public resize(width: number, height: number) {
    const gl = this.gl;

    this.programs.forEach(({ program, output }) => {
      if (output) {
        output.resize([width, height]);
      }
    });

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
