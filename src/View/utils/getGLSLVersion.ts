export function getGLSLVersion(shaderSource: string): 100 | 300 {
  return /^\s*#\s*version\s+300\s+es\s*$/.test(shaderSource.split('\n', 1)[0])
    ? 300
    : 100;
}
