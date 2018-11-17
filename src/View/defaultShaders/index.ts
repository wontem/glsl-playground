import vertexShaderSource from './vertex.glsl';
import vertexShaderSource100 from './vertex100.glsl';
import fragmentShaderSource from './fragment.glsl';

export const getVertexShaderSource = (glsl: 100 | 300) => glsl === 100 ? vertexShaderSource100 : vertexShaderSource;
export const getFragmentShaderSource = () => fragmentShaderSource;
