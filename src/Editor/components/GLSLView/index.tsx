import * as React from 'react';
import { View } from '../../../View';
import { ViewEvent, Uniform } from '../../../View/models';
// TODO: move typing into the GLSLView component models
import { TextureState } from '../../reducers/canvasView';
import { bitmapLoader } from '../../utils/bitmapLoader';

interface GLSLViewProps {
  className?: string;
  buffers: Record<string, string>;
  buffersOrder: string[];
  outputBuffer: string;
  width: number;
  height: number;
  uniforms: Uniform[];
  textures: Record<string, TextureState>;
  onError: (errors: UpdateError[]) => void;
  onMouseDown: React.MouseEventHandler<HTMLCanvasElement>;
  onMouseUp: React.MouseEventHandler<HTMLCanvasElement>;
  onMouseMove: React.MouseEventHandler<HTMLCanvasElement>;
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

  private updateUniforms(
    prevUniforms: Uniform[],
    currentUniforms: Uniform[],
  ): boolean {
    if (prevUniforms === currentUniforms) {
      return false;
    }

    this.view.setUniforms(currentUniforms);

    return true;
  }

  private updateTexture = async (name: string, { url, ...textureState }: TextureState) => {
    try {
      const bitmap = await bitmapLoader.download(name, url, { imageOrientation: textureState.flipY ? 'flipY' : 'none' });
      this.view.updateTexture(name, {
        source: bitmap,
        ...textureState,
      });

      bitmap.close();

      this.view.render();
    } catch (error) {
      console.error(error);
    }
  };

  private updateTextures(
    prevTextures: Record<string, TextureState>,
    currentTextures: Record<string, TextureState>,
  ): boolean {
    const isChanged = diffObjects(prevTextures, currentTextures, {
      update: this.updateTexture,
      create: async (name, texture) => {
        this.view.createTexture(name);
        this.updateTexture(name, texture);
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
      prevProps.height !== this.props.height
    ) {
      this.view.resize(this.props.width, this.props.height);
      isChanged = true;
    }

    isChanged = this.updateUniforms(prevProps.uniforms, this.props.uniforms) || isChanged;

    if (isChanged) {
      this.view.render();
    }
  }

  componentDidMount() {
    const canvas = this.canvas.current;
    const ctx = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
    }) as WebGL2RenderingContext;

    this.view = new View(ctx);
    this.view.resize(this.props.width, this.props.height);
  }

  componentWillUnmount() {
    this.view.destroy();
    this.view = null;
  }

  render() {
    return (
      <canvas
        className={this.props.className}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
        onMouseMove={this.props.onMouseMove}
        ref={this.canvas}
      />
    );
  }
}
