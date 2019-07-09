import { EventEmitter } from 'events';
import * as React from 'react';

const DEFAULT_WIDTH: number = 256;
const DEFAULT_HEIGHT: number = 256;

export class GLState extends EventEmitter {
  readonly gl: WebGL2RenderingContext;

  constructor(canvas: HTMLCanvasElement) {
    super();

    const gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
    });

    if (gl) {
      this.gl = gl;
    } else {
      throw 'Cannot get gl context';
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.gl.canvas;
  }

  set width(width: number) {
    if (width !== this.gl.canvas.width) {
      this.gl.canvas.width = width;
      this.emit('resize', [this.width, this.height]);
    }
  }

  set height(height: number) {
    if (height !== this.gl.canvas.height) {
      this.gl.canvas.height = height;
      this.emit('resize', [this.width, this.height]);
    }
  }

  get width() {
    return this.gl.canvas.width;
  }

  get height() {
    return this.gl.canvas.height;
  }
}

// class MouseState extends EventEmitter {
//   position: [number, number] = [0, 0];

//   move(position: [number, number]) {
//     this.position = position;
//     this.emit('move', this.position);
//   }

//   down() {
//     this.emit('down', this.position);
//   }

//   up() {
//     this.emit('up', this.position);
//   }
// }

// const useHandlers = (mouseState?: MouseState) => {
//   const onMouseMove: React.MouseEventHandler<
//     HTMLCanvasElement
//   > = React.useCallback((e) => {}, [mouseState]);
//   const onMouseDown: React.MouseEventHandler<
//     HTMLCanvasElement
//   > = React.useCallback((e) => {}, [mouseState]);
//   const onMouseUp: React.MouseEventHandler<
//     HTMLCanvasElement
//   > = React.useCallback((e) => {}, [mouseState]);

//   return { onMouseMove, onMouseDown, onMouseUp };
// };

export const GLContext = React.createContext<
  [GLState | undefined, (newState: GLState) => void]
>([undefined, () => {}]);

export const GLContextProvider: React.FC = ({ children }) => {
  const state = React.useState<GLState>();

  return <GLContext.Provider value={state}>{children}</GLContext.Provider>;
};

export const GLView: React.FC<{
  className?: string;
  width?: number;
  height?: number;
}> = ({ className, width, height }) => {
  const [glState, setGLState] = React.useContext(GLContext);

  const w =
    typeof width === 'number' ? width : glState ? glState.width : DEFAULT_WIDTH;
  const h =
    typeof height === 'number'
      ? height
      : glState
      ? glState.height
      : DEFAULT_HEIGHT;

  const canvasRef = React.useCallback((canvas: HTMLCanvasElement) => {
    if (canvas) {
      const glState = new GLState(canvas);
      setGLState(glState);

      glState.width = w;
      glState.height = h;
    }
  }, []);

  // const handlers = useHandlers();

  React.useEffect(() => {
    if (glState) {
      glState.width = w;
      glState.height = h;
      glState.gl.viewport(0, 0, w, h); // TODO: maybe move into OpGLRenderMain
    }
  }, [w, h]);

  return <canvas className={className} ref={canvasRef} />;
};
