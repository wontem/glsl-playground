import { Texture, getNewUnit } from './Texture';

class Framebuffer {
  private fbo: WebGLFramebuffer;

  constructor(
    private gl: WebGL2RenderingContext,
    private textureInput: Texture,
    textureOutput: Texture,
   ) {
    this.fbo = gl.createFramebuffer();
    this.activate();

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureOutput.getTexture(), 0);
  }

  public activate() {
    const gl = this.gl;

    this.textureInput.activate();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  }

  public getFramebufferObject(): WebGLFramebuffer {
    return this.fbo;
  }
}

interface Kek {
  x: string;
}

export class DoubleFramebuffer {
  private currentFB: Framebuffer;
  private alternativeFB: Framebuffer;

  constructor(
    private gl: WebGL2RenderingContext,
    private size: [number, number] = [1, 1],
    private unit: number = getNewUnit(gl),
  ) {
    const texture0 = new Texture(gl, size, this.unit);
    const texture1 = new Texture(gl, size, this.unit);

    this.currentFB = new Framebuffer(gl, texture0, texture1);
    this.alternativeFB = new Framebuffer(gl, texture1, texture0);
  }

  public getCurrentFramebuffer(): WebGLFramebuffer {
    return this.currentFB.getFramebufferObject();
  }

  public swap(): void {
    [this.currentFB, this.alternativeFB] = [this.alternativeFB, this.currentFB];
    this.currentFB.activate();
  }

  public getUnit(): number {
    return this.unit;
  }

  public getSize(): [number, number] {
    return this.size;
  }
}
