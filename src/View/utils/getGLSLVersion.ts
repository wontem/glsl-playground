export function getGLSLVersion(shaderSource: string): 100 | 300 {
  return shaderSource.startsWith('#version 300 es\n') ? 300 : 100;
}
