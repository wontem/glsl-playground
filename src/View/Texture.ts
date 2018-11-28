import { Filter, Wrap, ReadonlyTexture, Resolution } from './models';

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

function getAppropriateFilters(gl: WebGL2RenderingContext, filter: Filter): Resolution {
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

export class Texture implements ReadonlyTexture {
  private static texturesCounterMap: WeakMap<WebGL2RenderingContext, Set<number>> = new WeakMap();

  public static unlockUnit(gl: WebGL2RenderingContext, unit: number): void {
    if (!this.texturesCounterMap.has(gl)) {
      return;
    }

    const unitsSet: Set<number> = this.texturesCounterMap.get(gl);
    unitsSet.delete(unit);
  }

  public static lockUnit(gl: WebGL2RenderingContext, unit: number): void {
    const unitsSet: Set<number> = this.texturesCounterMap.has(gl) ? this.texturesCounterMap.get(gl) : new Set();

    unitsSet.add(unit);
    this.texturesCounterMap.set(gl, unitsSet);
  }

  public static getNewUnit(gl: WebGL2RenderingContext): number {
    const unitsSet: Set<number> = this.texturesCounterMap.has(gl) ? this.texturesCounterMap.get(gl) : new Set();

    let unit = 0;

    while (unitsSet.has(unit)) {
      unit += 1;
    }

    this.texturesCounterMap.set(gl, unitsSet);

    return unit;
  }

  public static clearUnitLocks(gl: WebGL2RenderingContext) {
    this.texturesCounterMap.delete(gl);
  }

  private texture: WebGLTexture;

  constructor(
    private gl: WebGL2RenderingContext,
    private resolution: Resolution = [1, 1],
    private unit: number = Texture.getNewUnit(gl),
  ) {
    Texture.lockUnit(this.gl, this.unit);
    this.texture = gl.createTexture();

    this.activate();
    this.setData(new Uint8Array(resolution[0] * resolution[1] * 4), resolution);
  }

  public activate(): void {
    const gl = this.gl;

    gl.activeTexture(gl.TEXTURE0 + this.unit);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
  }

  public getUnit(): number {
    return this.unit;
  }

  public getTexture(): WebGLTexture {
    return this.texture;
  }

  public setTexture(texture: WebGLTexture): void {
    this.texture = texture;
  }

  public getResolution(): Resolution {
    return this.resolution;
  }

  public setSource(
    source: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    resolution: Resolution = [source.width, source.height],
    flipY: boolean = true,
    filter: Filter = Filter.NEAREST,
    wrap: [Wrap, Wrap] = [Wrap.CLAMP, Wrap.CLAMP],
  ): void {
    const gl = this.gl;

    this.activate();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution[0], resolution[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, source);

    this.resolution = resolution;

    setFilter(gl, filter);
    setWrap(gl, wrap);
  }

  public setData(
    source: Uint8Array,
    resolution: Resolution,
    flipY: boolean = false,
    filter: Filter = Filter.NEAREST,
    wrap: [Wrap, Wrap] = [Wrap.CLAMP, Wrap.CLAMP],
  ) {
    const gl = this.gl;

    this.activate();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution[0], resolution[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, source, 0);

    this.resolution = resolution;

    setFilter(gl, filter);
    setWrap(gl, wrap);
  }

  public setSubImage(
    source: Uint8Array,
    resolution: Resolution,
  ) {
    const gl = this.gl;

    this.activate();

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, resolution[0], resolution[1], gl.RGBA, gl.UNSIGNED_BYTE, source, 0);
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

  public destroy() {
    this.gl.deleteTexture(this.texture);
    this.texture = null;

    Texture.unlockUnit(this.gl, this.unit);

    this.unit = -1;
  }
}
