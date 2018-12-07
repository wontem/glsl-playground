import * as React from 'react';
import { View } from '../../../View';
import { ViewEvent, Uniform, TextureState, TextureUpdate } from '../../../View/models';

async function getImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = document.createElement('img');
    image.addEventListener('load', function load() {
      image.removeEventListener('load', load);

      resolve(image);
    });
    image.crossOrigin = 'anonymous';
    image.src = src;
  });
}

interface _Texture extends TextureState {
  src: string;
}

// TODO: shouldn't be partial
export type Texture = Partial<_Texture>;

interface GLSLViewProps {
  className?: string;
  pixelRatio: number;
  buffers: Record<string, string>;
  buffersOrder: string[];
  outputBuffer: string;
  width: number;
  height: number;
  uniforms: Uniform[];
  textures: Record<string, Texture>;
  onError: (errors: UpdateError[]) => void;
}

interface DiffCallbacks<K, V> {
  create: (key: K, value: V) => void;
  update: (key: K, value: V, prevValue: V) => void;
  delete: (key: K, value: V) => void;
}

function diffObjects<T>(
  objectA: Record<string, T>,
  objectB: Record<string, T>,
  callbacks: DiffCallbacks<string, T>,
): boolean {
  let isChanged = false;

  if (objectA === objectB) {
    return isChanged;
  }

  const allKeys = new Set([...Object.keys(objectA), ...Object.keys(objectB)]);

  allKeys.forEach((key) => {
    if (key in objectA) {
      if (key in objectB) {
        if (objectA[key] !== objectB[key]) {
          callbacks.update(key, objectB[key], objectA[key]);
          isChanged = true;
        }
      } else {
        callbacks.delete(key, objectA[key]);
        isChanged = true;
      }
    } else {
      callbacks.create(key, objectB[key]);
      isChanged = true;
    }
  });

  return isChanged;
}

export interface UpdateError {
  name: string;
  error: ViewEvent;
}

export class GLSLView extends React.PureComponent<GLSLViewProps> {
  private canvas: React.RefObject<HTMLCanvasElement>;
  private view: View;

  getCanvas() {
    return this.canvas.current;
  }

  getView() {
    return this.view;
  }

  constructor(props: GLSLViewProps) {
    super(props);

    this.canvas = React.createRef();
  }

  private updateBuffers(
    prevBuffers: Record<string, string>,
    currentBuffers: Record<string, string>,
  ): boolean {
    let errors: UpdateError[] = [];

    const isChanged = diffObjects(prevBuffers, currentBuffers, {
      create: (name, source) => {
        this.view.createBuffer(name);
        const updateErrors = this.view.updateBuffer(name, source);
        errors = [...errors, ...updateErrors.map(error => ({ name, error }))]
      },
      update: (name, source) => {
        const updateErrors = this.view.updateBuffer(name, source);
        errors = [...errors, ...updateErrors.map(error => ({ name, error }))]
      },
      delete: (name) => {
        this.view.removeBuffer(name);
      },
    });

    if (errors.length) {
      this.props.onError(errors);
    }

    return isChanged;
  }

  private updateTextures(
    prevTextures: Record<string, Texture>,
    currentTextures: Record<string, Texture>,
  ): boolean {
    const isChanged = diffObjects(prevTextures, currentTextures, {
      create: async (name, texture) => {
        this.view.createTexture(name);

        const { src, ...textureState } = texture;
        const image = await getImage(src);

        this.view.updateTexture(name, {
          source: image,
          resolution: [image.width, image.height],
          ...textureState,
        });

        // TODO: remove it
        this.view.render();
      },
      update: async (name, texture, oldTexture) => {
        const { src, ...textureState } = texture;
        let updates: Partial<TextureUpdate> = textureState;

        if (texture.src !== oldTexture.src) {
          const image = await getImage(src);

          updates = {
            source: image,
            resolution: [image.width, image.height],
            ...textureState,
          }
        }

        this.view.updateTexture(name, updates);
        // TODO: remove it
        this.view.render();
      },
      delete: (name) => {
        this.view.removeTexture(name);
        // TODO: remove it
        this.view.render();
      },
    });

    return isChanged;
  }

  componentDidUpdate(prevProps: GLSLViewProps) {
    let isChanged = false;

    isChanged = isChanged || this.updateBuffers(prevProps.buffers, this.props.buffers);
    isChanged = isChanged || this.updateTextures(prevProps.textures, this.props.textures);

    if (prevProps.outputBuffer !== this.props.outputBuffer) {
      this.view.setBufferToOutput(this.props.outputBuffer);
      isChanged = true;
    }

    if (prevProps.buffersOrder !== this.props.buffersOrder) {
      this.view.setBuffersOrder(this.props.buffersOrder);
      isChanged = true;
    }

    if (
      prevProps.width !== this.props.width ||
      prevProps.height !== this.props.height ||
      prevProps.pixelRatio !== this.props.pixelRatio
    ) {
      this.resize(this.props.width, this.props.height, this.props.pixelRatio);
      isChanged = true;
    }

    if (prevProps.uniforms !== this.props.uniforms) {
      isChanged = true;
    }

    if (isChanged) {
      this.view.render(this.props.uniforms);
    }
  }

  resize(width: number, height: number, pixelRatio: number): void {
    this.view.resize(
      width * pixelRatio,
      height * pixelRatio
    );
  }

  componentDidMount() {
    this.view = new View(this.canvas.current.getContext('webgl2') as WebGL2RenderingContext);
    this.resize(this.props.width, this.props.height, this.props.pixelRatio);
  }

  componentWillUnmount() {
    this.view.destroy();
    this.view = null;
  }

  render() {
    return (
      <canvas
        className={this.props.className}
        ref={this.canvas}
      />
    );
  }
}
