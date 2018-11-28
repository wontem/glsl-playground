import * as defaultShaders from './defaultShaders';
import { ViewEvent, Uniform, TextureUpdate, Attribute } from './models';
import { Program } from './Program';
import { Texture } from './Texture';
import { DoubleFramebuffer } from './Framebuffer';

interface BufferLink {
  program: Program;
  output: DoubleFramebuffer;
}

export class View {
  private textures: Map<string, Texture>;
  private buffers: Map<string, BufferLink>;
  private buffersOrder: string[];
  private mainProgram: Program;
  private outputBufferName: string;

  constructor(
    private gl: WebGL2RenderingContext,
  ) {
    this.textures = new Map();
    this.buffers = new Map();
    this.buffersOrder = [];
    this.mainProgram = this.createProgram();
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

  private createProgram(): Program {
    const gl = this.gl;

    const attributes: Attribute[] = [{
      name: 'a_position',
      data: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0],
      size: 2,
    }];

    return new Program(gl, attributes);
  }

  public createBuffer(bufferName: string): void {
    const gl = this.gl;

    if (this.buffers.has(bufferName)) {
      console.warn(`Buffer ${bufferName} is already created. Use .updateBuffer() instead`);
      return;
    }

    const program = this.createProgram();
    const output = new DoubleFramebuffer(gl, [gl.drawingBufferWidth, gl.drawingBufferHeight]);

    this.buffers.set(bufferName, { program, output });
  }

  public updateBuffer(bufferName: string, fragmentSource: string): ViewEvent[] {
    if (!this.buffers.has(bufferName)) {
      console.warn(`Buffer ${bufferName} doesn't exist. Use .createBuffer() instead`);
      return [];
    }

    const program = this.buffers.get(bufferName).program;

    return program.update(fragmentSource);
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
    if (!this.buffers.has(bufferName)) {
      console.warn(`Buffer ${bufferName} doesn't exist`);
      return;
    }

    this.mainProgram.update(defaultShaders.getViewProgramFragmentShaderSource(bufferName));
    this.outputBufferName = bufferName;
  }

  public resetMainProgram(): void {
    this.mainProgram.update(defaultShaders.getFragmentShaderSource());
    this.outputBufferName = null;
  }

  public removeBuffer(bufferName: string): void {
    const bufferLink = this.buffers.get(bufferName);

    if (bufferLink) {
      bufferLink.output.destroy();
      bufferLink.program.destroy();

      this.buffers.delete(bufferName);
    }

    if (this.outputBufferName === bufferName) {
      this.resetMainProgram();
    }
  }

  public removeTexture(textureName: string): void {
    const texture = this.textures.get(textureName);

    if (texture) {
      texture.destroy();
      this.textures.delete(textureName);
    }
  }

  public getBufferSource(bufferName: string): string {
    return this.buffers.get(bufferName).program.getSource();
  }

  public destroy(): void {
    this.buffersOrder = [];
    this.buffers.forEach(({ output, program }) => {
      output.destroy();
      program.destroy();
    });

    this.buffers.clear();

    this.textures.forEach((texture, key, textures) => {
      texture.destroy();
    });

    this.textures.clear();

    this.mainProgram.destroy();
    this.mainProgram = null;

    Texture.clearUnitLocks(this.gl);
    Program.destroyDefaultProgram(this.gl);

    this.gl = null;
  }
}
