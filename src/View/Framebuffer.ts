import { ReadonlyTexture, Resolution } from './models';
import { Texture } from './Texture';

class Framebuffer {
  private fbo: WebGLFramebuffer;

  constructor(
    private gl: WebGL2RenderingContext,
    private textureInput: Texture,
    private textureOutput: Texture,
  ) {
    this.fbo = gl.createFramebuffer()!;
    this.activate();

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      textureOutput.getTexture(),
      0,
    );
  }

  public activate() {
    const gl = this.gl;

    this.textureInput.activate();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  }

  public getFramebufferObject(): WebGLFramebuffer {
    return this.fbo;
  }

  public getPixelsData(
    resolution: Resolution = this.textureOutput.getResolution(),
  ): {
    pixels: Uint8Array;
    resolution: Resolution;
  } {
    const gl = this.gl;

    this.activate();

    const currentTextureResolution = this.textureOutput.getResolution();

    const [width, height]: Resolution = [
      Math.min(resolution[0], currentTextureResolution[0]),
      Math.min(resolution[1], currentTextureResolution[1]),
    ];

    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    return {
      pixels,
      resolution: [width, height],
    };
  }

  public resize(resolution: Resolution): void {
    const pixelsData = this.getPixelsData(resolution);

    this.textureInput.setData(
      new Uint8Array(resolution[0] * resolution[1] * 4),
      resolution,
    );
    this.textureInput.setSubImage(pixelsData.pixels, pixelsData.resolution);
  }

  public destroy(): void {
    this.gl.deleteFramebuffer(this.fbo);
    delete this.fbo;

    this.textureInput.destroy();
    this.textureOutput.destroy();

    delete this.textureInput;
    delete this.textureOutput;
  }
}

export class PingPongFramebuffer implements ReadonlyTexture {
  private currentFB: Framebuffer;
  private alternativeFB: Framebuffer;

  constructor(
    private gl: WebGL2RenderingContext,
    private resolution: Resolution = [1, 1],
    private unit: number = Texture.getNewUnit(gl),
  ) {
    const texture0 = new Texture(gl, resolution, this.unit);
    const texture1 = new Texture(gl, resolution, this.unit);

    this.currentFB = new Framebuffer(gl, texture0, texture1);
    this.alternativeFB = new Framebuffer(gl, texture1, texture0);
  }

  public getCurrentFramebuffer(): WebGLFramebuffer {
    return this.currentFB.getFramebufferObject();
  }

  public getPixelsData(): {
    pixels: Uint8Array;
    resolution: Resolution;
  } {
    return this.alternativeFB.getPixelsData();
  }

  public activate(): void {
    this.currentFB.activate();
  }

  public swap(): void {
    [this.currentFB, this.alternativeFB] = [this.alternativeFB, this.currentFB];

    this.activate();
  }

  public getUnit(): number {
    return this.unit;
  }

  public getResolution(): Resolution {
    return this.resolution;
  }

  public resize(resolution: Resolution): void {
    this.currentFB.resize(resolution);
    this.alternativeFB.resize(resolution);
    this.resolution = resolution;
  }

  public destroy(): void {
    this.currentFB.destroy();
    this.alternativeFB.destroy();
    this.unit = -1;
  }
}
