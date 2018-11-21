import { Filter, Wrap } from './models';

const texturesCounterMap: WeakMap<WebGL2RenderingContext, number> = new WeakMap();

function getNewUnit(gl: WebGL2RenderingContext): number {
  const lastUnit = texturesCounterMap.has(gl) ? texturesCounterMap.get(gl) : -1;
  const unit = lastUnit + 1;

  texturesCounterMap.set(gl, unit);

  return unit;
}

function getAppropriateWrap(gl: WebGL2RenderingContext, wrap: Wrap): number {
  switch (wrap) {
    case Wrap.REPEAT:
      return gl.REPEAT;
    case Wrap.MIRROR:
      return gl.MIRRORED_REPEAT;
    case Wrap.CLAMP:
    default:
      return gl.CLAMP_TO_EDGE;
  }
}

function getAppropriateFilters(gl: WebGL2RenderingContext, filter: Filter): [number, number] {
  switch (filter) {
    case Filter.MIPMAP:
      return [gl.LINEAR, gl.LINEAR_MIPMAP_LINEAR];
    case Filter.NEAREST:
      return [gl.NEAREST, gl.NEAREST];
    case Filter.LINEAR:
    default:
      return [gl.LINEAR, gl.LINEAR];
  }
}

function setFilter(gl: WebGL2RenderingContext, filter: Filter): void {
  const filters = getAppropriateFilters(gl, filter);

  if (filters[1] === gl.LINEAR_MIPMAP_LINEAR) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filters[0]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filters[1]);
}

function setWrap(gl: WebGL2RenderingContext, wrap: [Wrap, Wrap]) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, getAppropriateWrap(gl, wrap[0]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, getAppropriateWrap(gl, wrap[1]));
}

export class Texture {
  private unit: number;
  private texture: WebGLTexture;
  private width: number;
  private height: number;

  constructor(
    private gl: WebGL2RenderingContext,
  ) {
    this.unit = getNewUnit(gl);
    this.texture = gl.createTexture();

    this.activate();
    // TODO: create default texture in only unit
    this.updateSource(new Uint8Array([0, 0, 0, 0]), 1, 1);
  }

  private activate(): void {
    const gl = this.gl;

    gl.activeTexture(gl.TEXTURE0 + this.unit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  public getUnit(): number {
    return this.unit;
  }

  public getSize(): [number, number] {
    return [this.width, this.height];
  }

  private updateSource(
    source: any,
    width: number,
    height: number,
  ) {
    const gl = this.gl;

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);

    this.width = width;
    this.height = height;
  }

  public setSource(
    source: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    width: number = source.width,
    height: number = source.height,
    flipY: boolean = true,
    filter: Filter = Filter.NEAREST,
    wrap: [Wrap, Wrap] = [Wrap.CLAMP, Wrap.CLAMP],
  ): void {
    const gl = this.gl;

    this.activate();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);

    this.updateSource(source, width, height);

    setFilter(gl, filter);
    setWrap(gl, wrap);
  }

  public setFilter(filter: Filter): void {
    const gl = this.gl;

    this.activate();

    setFilter(gl, filter);
  }

  public setWrap(wrap: [Wrap, Wrap]): void {
    const gl = this.gl;

    this.activate();

    setWrap(gl, wrap);
  }
}
