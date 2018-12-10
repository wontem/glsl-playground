import * as React from 'react';
import { View } from '../../../View';
import { ViewEvent, Uniform } from '../../../View/models';
// TODO: move typing in the GLSLView component models
import { TextureState } from '../../reducers/canvasView';
import { bitmapLoader } from '../../utils/bitmapLoader';

interface GLSLViewProps {
  className?: string;
  pixelRatio: number;
  buffers: Record<string, string>;
  buffersOrder: string[];
  outputBuffer: string;
  width: number;
  height: number;
  uniforms: Uniform[];
  textures: Record<string, TextureState>;
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

    const updateBuffer = (name: string, source: string) => {
      const updateErrors = this.view.updateBuffer(name, source);
      errors = [...errors, ...updateErrors.map(error => ({ name, error }))];
    };

    const isChanged = diffObjects(prevBuffers, currentBuffers, {
      update: updateBuffer,
      create: (name, source) => {
        this.view.createBuffer(name);
        updateBuffer(name, source);
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
    prevTextures: Record<string, TextureState>,
    currentTextures: Record<string, TextureState>,
  ): boolean {
    const updateTexture = async (name: string, { url, ...textureState }: TextureState) => {
      try {
        const bitmap = await bitmapLoader.download(name, url, { imageOrientation: textureState.flipY ? 'flipY' : 'none' });
        this.view.updateTexture(name, {
          source: bitmap,
          ...textureState,
        });

        bitmap.close();

        this.view.render(this.props.uniforms);
      } catch (error) {
        console.error(error);
      }
    };

    const isChanged = diffObjects(prevTextures, currentTextures, {
      update: updateTexture,
      create: async (name, texture) => {
        this.view.createTexture(name);
        updateTexture(name, texture);
      },
      delete: (name) => {
        bitmapLoader.abort(name);
        this.view.removeTexture(name);
      },
    });

    return isChanged;
  }

  componentDidUpdate(prevProps: GLSLViewProps) {
    let isChanged = false;

    isChanged = this.updateBuffers(prevProps.buffers, this.props.buffers) || isChanged;
    isChanged = this.updateTextures(prevProps.textures, this.props.textures) || isChanged;

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
    const canvas = this.canvas.current;
    const ctx = canvas.getContext('webgl2') as WebGL2RenderingContext;

    this.view = new View(ctx);
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
