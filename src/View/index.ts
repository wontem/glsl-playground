import { EventEmitter } from 'events';
import * as defaultShaders from './defaultShaders';
import { ViewEvent, Uniform, TextureUpdate, Attribute } from './models';
import { Program } from './Program';
import { Texture } from './Texture';
import { DoubleFramebuffer } from './Framebuffer';

interface BufferLink {
  program: Program;
  output: DoubleFramebuffer;
}

export class View extends EventEmitter {
  private textures: Map<string, Texture>;
  private buffers: Map<string, BufferLink>;
  private buffersOrder: string[];
  private mainProgram: Program;

  constructor(
    private gl: WebGL2RenderingContext,
  ) {
    super();

    this.textures = new Map();
    this.buffers = new Map();
    this.buffersOrder = [];
    this.mainProgram = this.createProgram(defaultShaders.getFragmentShaderSource());
  }

  private trigger(level: string, event: ViewEvent): void {
    this.emit(level, event);
  }

  public render(
    uniforms: Uniform[] = [],
  ) {
    const textures = [...this.textures];
    const buffers = [...this.buffers].map<[string, DoubleFramebuffer]>(([name, { output }]) => [name, output]);

    const textureUniforms: Uniform[] = [
      ...textures,
      ...buffers,
    ].reduce<Uniform[]>(
      (uniforms, [name, item]) => {
        const unit = item.getUnit();

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
            value: item.getResolution(),
          },
        ];
      },
      [],
    );

    const allUniforms = [
      ...textureUniforms,
      ...uniforms,
    ];

    this.buffersOrder.forEach((bufferName) => {
      const { program, output } = this.buffers.get(bufferName);

      output.activate();

      program.render(
        output.getResolution(),
        allUniforms,
        output.getCurrentFramebuffer(),
      );

      output.swap();
    });

    this.mainProgram.render(
      [
        this.gl.drawingBufferWidth,
        this.gl.drawingBufferHeight,
      ],
      allUniforms,
      null,
    );
  }

  public setBuffersOrder(buffersOrder: string[]) {
    this.buffersOrder = buffersOrder;
  }

  public createTexture(name: string): void {
    const texture = new Texture(this.gl);
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

  private createProgram(fragmentSource: string, onError?: (event: ViewEvent) => void) {
    const gl = this.gl;

    const attributes: Attribute[] = [{
      name: 'a_position',
      data: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0],
      size: 2,
    }];

    const program = new Program(
      gl,
      fragmentSource,
      attributes,
      onError,
    );

    return program;
  }

  public createBuffer(bufferName: string, fragmentSource: string): void {
    const gl = this.gl;

    if (this.buffers.has(bufferName)) {
      console.warn(`Buffer ${bufferName} is already created. Use .updateBuffer() instead`);
      return;
    }

    const program = this.createProgram(fragmentSource, (event) => {
      event.programName = bufferName;
      this.trigger('error', event);
    });
    const output = new DoubleFramebuffer(gl);

    this.buffers.set(bufferName, { program, output });
  }

  public updateBuffer(bufferName: string, fragmentSource: string): void {
    if (!this.buffers.has(bufferName)) {
      console.warn(`Buffer ${bufferName} doesn't exist. Use .createBuffer() instead`);
      return;
    }

    const bufferLink = this.buffers.get(bufferName);
    bufferLink.program.update(fragmentSource);
  }

  public resize(width: number, height: number): void {
    const gl = this.gl;

    this.buffers.forEach(({ output }) => {
      output.resize([width, height]);
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

  public setBufferToOutput(bufferName: string): void {
    this.mainProgram.update(defaultShaders.getViewProgramFragmentShaderSource(bufferName));
  }
}
