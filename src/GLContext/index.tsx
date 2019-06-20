import * as React from 'react';

type GLState = WebGL2RenderingContext | null;

export const GLContext = React.createContext<
  [GLState, (newState: GLState) => void]
>([null, () => {}]);

export const GLContextProvider: React.FC = ({ children }) => {
  const state = React.useState<GLState>(null);

  return <GLContext.Provider value={state}>{children}</GLContext.Provider>;
};

export const GLView: React.FC = () => {
  const [glState, setGLState] = React.useContext(GLContext);
  const canvasRef = React.useCallback((canvas: HTMLCanvasElement) => {
    if (canvas) {
      const gl = canvas.getContext('webgl2', {
        preserveDrawingBuffer: true,
      })!;
      setGLState(gl);
    }
  },                                  []);

  return <canvas ref={canvasRef} />;
};
