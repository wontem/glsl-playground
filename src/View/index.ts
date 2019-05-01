import * as defaultShaders from './defaultShaders';
import { PingPongFramebuffer } from './Framebuffer';
import { TextureState, UniformValues, ViewEvent } from './models';
import { Program } from './Program';
import { Texture } from './Texture';

interface BufferLink {
  program: Program;
  output: PingPongFramebuffer;
}

export class View {
  private textures: Map<string, Texture> = new Map();
  private buffers: Map<string, BufferLink> = new Map();
  private textureUniforms: UniformValues = {};
  private buffersOrder: string[] = [];
  private mainProgram: Program;
  private outputBufferName!: string;

  constructor(private gl: WebGL2RenderingContext) {
    this.mainProgram = new Program(gl);
  }

  private recalculateTextureUniforms(): void {
    const textures = [...this.textures];
    const buffers = [...this.buffers].map<[string, PingPongFramebuffer]>(
      ([name, { output }]) => [name, output],
    );

    const textureUniforms: UniformValues = {};

    [...textures, ...buffers].forEach(([name, item]) => {
      textureUniforms[name] = [item.getUnit()];
      textureUniforms[`${name}_resolution`] = item.getResolution();
    });

    this.textureUniforms = textureUniforms;
  }

  public setUniforms(uniforms: UniformValues) {
    const allUniforms = { ...this.textureUniforms, ...uniforms };

    this.buffers.forEach(({ program }) => {
      program.setUniforms(allUniforms);
    });

    this.mainProgram.setUniforms(allUniforms);
  }

  public render() {
    this.buffersOrder.forEach((bufferName) => {
      const { program, output } = this.buffers.get(bufferName)!;

      program.render(output.getResolution(), output.getCurrentFramebuffer());

      output.swap();
    });

    this.mainProgram.render(
      [this.gl.drawingBufferWidth, this.gl.drawingBufferHeight],
      null,
    );
  }

  public setBuffersOrder(buffersOrder: string[]) {
    this.buffersOrder = buffersOrder;
  }

  public createTexture(name: string): void {
    const texture = new Texture(this.gl);
    this.textures.set(name, texture);
    this.recalculateTextureUniforms();
  }

  public updateTexture(name: string, textureUpdate: Partial<TextureState>) {
    if (!this.textures.has(name)) {
      console.warn(`Texture ${name} doesn't exist`);
    }

    const texture = this.textures.get(name)!;

    if ('source' in textureUpdate) {
      texture.setSource(
        textureUpdate.source!,
        textureUpdate.resolution || undefined,
        textureUpdate.flipY,
        textureUpdate.filter,
        textureUpdate.wrap,
      );
      this.recalculateTextureUniforms();
    } else {
      if ('filter' in textureUpdate) {
        texture.setFilter(textureUpdate.filter!);
      }
      if ('wrap' in textureUpdate) {
        texture.setWrap(textureUpdate.wrap!);
      }
    }
  }

  public createBuffer(bufferName: string): void {
    const gl = this.gl;

    if (this.buffers.has(bufferName)) {
      console.warn(
        `Buffer ${bufferName} is already created. Use .updateBuffer() instead`,
      );
      return;
    }

    const program = new Program(gl);
    const output = new PingPongFramebuffer(gl, [
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
    ]);

    this.buffers.set(bufferName, { program, output });
    this.recalculateTextureUniforms();
  }

  public updateBuffer(bufferName: string, fragmentSource: string): ViewEvent[] {
    if (!this.buffers.has(bufferName)) {
      console.warn(
        `Buffer ${bufferName} doesn't exist. Use .createBuffer() instead`,
      );
      return [];
    }

    const program = this.buffers.get(bufferName)!.program;

    return program.update(fragmentSource);
  }

  public resize(width: number, height: number): void {
    const gl = this.gl;

    this.buffers.forEach(({ output }) => {
      output.resize([width, height]);
    });

    if (width !== gl.canvas.width || height !== gl.canvas.height) {
      gl.canvas.width = width;
      gl.canvas.height = height;

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    this.recalculateTextureUniforms();
  }

  public setBufferToOutput(bufferName: string): void {
    if (!this.buffers.has(bufferName)) {
      console.warn(`Buffer ${bufferName} doesn't exist`);
      return;
    }

    this.mainProgram.update(
      defaultShaders.getViewProgramFragmentShaderSource(bufferName),
    );
    this.outputBufferName = bufferName;
  }

  public resetMainProgram(): void {
    this.mainProgram.update(defaultShaders.getFragmentShaderSource());
    delete this.outputBufferName;
  }

  public removeBuffer(bufferName: string): void {
    const bufferLink = this.buffers.get(bufferName);

    if (bufferLink) {
      bufferLink.output.destroy();
      bufferLink.program.destroy();

      this.buffers.delete(bufferName);
      this.recalculateTextureUniforms();
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
      this.recalculateTextureUniforms();
    }
  }

  public getBufferSource(bufferName: string): string | undefined {
    return this.buffers.has(bufferName)
      ? this.buffers.get(bufferName)!.program.getSource()
      : undefined;
  }

  public destroy(): void {
    this.textureUniforms = {};
    this.buffersOrder = [];

    this.buffers.forEach(({ output, program }) => {
      output.destroy();
      program.destroy();
    });

    this.buffers.clear();

    this.textures.forEach((texture) => {
      texture.destroy();
    });

    this.textures.clear();

    this.mainProgram.destroy();
    delete this.mainProgram;

    Texture.clearUnitLocks(this.gl);
    Program.destroyDefaultProgram(this.gl);

    delete this.gl;
  }
}
