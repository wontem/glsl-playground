import { Filter, ReadonlyTexture, Resolution, Wrap } from './types';

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

// function generateBlurMipmap(
//   gl: WebGL2RenderingContext,
//   texture: Texture,
//   radius: number,
//   iterations: number,
// ) {
//   setFilter(gl, Filter.LINEAR, texture);

//   const initialResolution = texture.getResolution();
//   const blurProgram = new Program(gl);
//   const fb = new PingPongFramebuffer(gl, initialResolution);

//   blurProgram.update(getGaussianBlurFragmentShaderSource());

//   const levelsNumber = Math.floor(Math.log2(Math.max(...initialResolution)));

//   for (let level = 1; level <= levelsNumber; level += 1) {
//     const newResolution = initialResolution.map(
//       (size) => Math.floor(size / 2 ** level) || 1,
//     ) as Resolution;

//     fb.resize(newResolution);

//     for (let iteration = 0; iteration < iterations; iteration += 1) {
//       for (let i = 0; i < 2; i += 1) {
//         blurProgram.setUniforms({
//           image: [iteration === 0 ? texture.getUnit() : fb.getUnit()],
//           resolution: newResolution,
//           direction: i === 0 ? [0, radius] : [radius, 0],
//         });

//         gl.bindFramebuffer(gl.FRAMEBUFFER, fb.getCurrentFramebuffer());

//         blurProgram.render(newResolution);
//         fb.swap();
//       }
//     }

//     const pixelsData = fb.getPixelsData();

//     texture.activate();
//     gl.texImage2D(
//       gl.TEXTURE_2D,
//       level,
//       gl.RGBA,
//       pixelsData.resolution[0],
//       pixelsData.resolution[1],
//       0,
//       gl.RGBA,
//       gl.UNSIGNED_BYTE,
//       pixelsData.pixels,
//     );
//   }

//   blurProgram.destroy();
//   fb.destroy();
// }

function getAppropriateFilters(
  gl: WebGL2RenderingContext,
  filter: Filter,
): Resolution {
  switch (filter) {
    case Filter.MIPMAP:
    case Filter.BLUR:
      return [gl.LINEAR, gl.LINEAR_MIPMAP_LINEAR];
    case Filter.NEAREST:
      return [gl.NEAREST, gl.NEAREST];
    case Filter.LINEAR:
    default:
      return [gl.LINEAR, gl.LINEAR];
  }
}

function setFilter(
  gl: WebGL2RenderingContext,
  filter: Filter,
  texture: Texture,
): void {
  const filters = getAppropriateFilters(gl, filter);

  if (filter === Filter.BLUR) {
    // generateBlurMipmap(gl, texture, 1, 3);
    gl.generateMipmap(gl.TEXTURE_2D);
  } else if (filters[1] === gl.LINEAR_MIPMAP_LINEAR) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filters[0]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filters[1]);
}

function setWrap(gl: WebGL2RenderingContext, wrap: [Wrap, Wrap]) {
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    getAppropriateWrap(gl, wrap[0]),
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    getAppropriateWrap(gl, wrap[1]),
  );
}

export enum TextureType {
  UNSIGNED_BYTE = 0,
  FLOAT = 1,
}

export class Texture implements ReadonlyTexture {
  private static texturesCounterMap: WeakMap<
    WebGL2RenderingContext,
    Set<number>
  > = new WeakMap();

  public static unlockUnit(gl: WebGL2RenderingContext, unit: number): void {
    if (!this.texturesCounterMap.has(gl)) {
      return;
    }

    const unitsSet: Set<number> = this.texturesCounterMap.get(gl)!;
    unitsSet.delete(unit);
  }

  public static lockUnit(gl: WebGL2RenderingContext, unit: number): void {
    const unitsSet: Set<number> = this.texturesCounterMap.has(gl)
      ? this.texturesCounterMap.get(gl)!
      : new Set();

    unitsSet.add(unit);
    this.texturesCounterMap.set(gl, unitsSet);
  }

  public static getNewUnit(gl: WebGL2RenderingContext): number {
    const unitsSet: Set<number> = this.texturesCounterMap.has(gl)
      ? this.texturesCounterMap.get(gl)!
      : new Set();

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
  private filter: Filter = Filter.NEAREST;
  private wrap: [Wrap, Wrap] = [Wrap.CLAMP, Wrap.CLAMP];

  constructor(
    private gl: WebGL2RenderingContext,
    private resolution: Resolution = [1, 1],
    private unit: number = Texture.getNewUnit(gl),
    private type: TextureType = TextureType.UNSIGNED_BYTE,
  ) {
    Texture.lockUnit(this.gl, this.unit);
    this.texture = gl.createTexture()!;

    this.setData(
      new this.DataConstructor(resolution[0] * resolution[1] * 4),
      resolution,
    );
  }

  private get DataConstructor():
    | Uint8ArrayConstructor
    | Float32ArrayConstructor {
      return this.type === TextureType.UNSIGNED_BYTE ? Uint8Array : Float32Array;
    }

  private get internalFormat(): number {
    return this.type === TextureType.UNSIGNED_BYTE
      ? this.gl.RGBA
      : this.gl.RGBA32F;
  }

  private get dataType(): number {
    return this.type === TextureType.UNSIGNED_BYTE
      ? this.gl.UNSIGNED_BYTE
      : this.gl.FLOAT;
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
    source: ImageBitmap | ImageData,
    resolution: Resolution = [source.width, source.height],
    flipY: boolean = true,
    filter: Filter = this.filter,
    wrap: [Wrap, Wrap] = this.wrap,
    level: number = 0,
  ): void {
    const gl = this.gl;

    this.activate();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      gl.RGBA,
      resolution[0],
      resolution[1],
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      source,
    );

    this.resolution = resolution;

    setWrap(gl, wrap);
    setFilter(gl, filter, this);
    this.wrap = wrap;
    this.filter = filter;
  }

  public setData(
    source: Uint8Array | Float32Array,
    resolution: Resolution,
    flipY: boolean = false,
    filter: Filter = this.filter,
    wrap: [Wrap, Wrap] = this.wrap,
    level: number = 0,
  ) {
    const gl = this.gl;

    this.activate();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      this.internalFormat,
      resolution[0],
      resolution[1],
      0,
      gl.RGBA,
      this.dataType,
      source,
      0,
    );

    this.resolution = resolution;

    setWrap(gl, wrap);
    setFilter(gl, filter, this);
    this.wrap = wrap;
    this.filter = filter;
  }

  public setSubImage(
    source: Uint8Array | Float32Array,
    resolution: Resolution,
  ) {
    const gl = this.gl;

    this.activate();

    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      resolution[0],
      resolution[1],
      gl.RGBA,
      this.dataType,
      source,
      0,
    );
  }

  public setFilter(filter: Filter): void {
    const gl = this.gl;

    this.activate();

    setFilter(gl, filter, this);
    this.filter = filter;
  }

  public setWrap(wrap: [Wrap, Wrap]): void {
    const gl = this.gl;

    this.activate();

    setWrap(gl, wrap);
    this.wrap = wrap;
  }

  public destroy() {
    this.gl.deleteTexture(this.texture);
    delete this.texture;

    Texture.unlockUnit(this.gl, this.unit);

    this.unit = -1;
  }
}
