import bufferToDisplayShaderSource from './bufferToDisplayShaderSource.glsl';
import fragmentShaderSource from './fragment.glsl';
import gaussianBlurFragmentShaderSource from './gaussianBlur.glsl';
import vertexShaderSource from './vertex.glsl';
import vertexShaderSource100 from './vertex100.glsl';

const OUTPUT_CHANNEL_REGEXP = /u_channel/g;

export const getVertexShaderSource = (glsl: 100 | 300) =>
  glsl === 100 ? vertexShaderSource100 : vertexShaderSource;
export const getFragmentShaderSource = () => fragmentShaderSource;
export const getViewProgramFragmentShaderSource = (channelName: string) => {
  return bufferToDisplayShaderSource.replace(
    OUTPUT_CHANNEL_REGEXP,
    channelName,
  );
};
export const getGaussianBlurFragmentShaderSource = () =>
  gaussianBlurFragmentShaderSource;
