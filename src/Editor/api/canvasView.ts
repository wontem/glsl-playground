import { View } from '../../View';

let v: View = null;

export const init = (gl: WebGL2RenderingContext) => {
  v = new View(gl);

  return v;
};

export const getView = () => v;
