import * as React from 'react';
import { View } from '../../../View';
import { ViewEvent, Uniform } from '../../../View/models';

interface GLSLViewProps {
  buffers: Record<string, string>;
  buffersOrder: string[];
  outputBuffer: string;
  width: number;
  height: number;
  onError: (errors: UpdateError[]) => void;

  // TODO: implement
  textures: {};
  uniforms: Uniform[];
}

interface DiffCallbacks<K, V> {
  create: (key: K, value: V) => void;
  update: (key: K, value: V) => void;
  delete: (key: K) => void;
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
          callbacks.update(key, objectB[key]);
          isChanged = true;
        }
      } else {
        callbacks.delete(key);
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

  constructor(props: GLSLViewProps) {
    super(props);

    this.canvas = React.createRef();
  }

  private updateBuffers(
    prevBuffers: Record<string, string>,
    currentBuffers: Record<string, string>,
  ): boolean {
    let errors: UpdateError[] = [];

    const isUpdated = diffObjects(prevBuffers, currentBuffers, {
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

    return isUpdated;
  }

  componentDidUpdate(prevProps: GLSLViewProps) {
    let isChanged = this.updateBuffers(prevProps.buffers, this.props.buffers);

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

    if (prevProps.uniforms !== this.props.uniforms) {
      isChanged = true;
    }

    if (isChanged) {
      this.view.render(this.props.uniforms);
    }
  }

  componentDidMount() {
    this.view = new View(this.canvas.current.getContext('webgl2') as WebGL2RenderingContext);
    this.view.resize(this.props.width, this.props.height);
  }

  componentWillUnmount() {
    this.view.destroy();
    this.view = null;
  }

  render() {
    return (
      <canvas ref={this.canvas} />
    );
  }
}
