#version 300 es
precision mediump float;

uniform sampler2D image;
uniform vec2 resolution;
uniform vec2 direction;

out vec4 frag_color;

// https://github.com/Jam3/glsl-fast-gaussian-blur/

vec4 blur5(sampler2D image,vec2 uv,vec2 resolution,vec2 direction){
  vec4 color=vec4(0.);
  vec2 off1=vec2(1.3333333333333333)*direction;
  color+=texture(image,uv)*.29411764705882354;
  color+=texture(image,uv+(off1/resolution))*.35294117647058826;
  color+=texture(image,uv-(off1/resolution))*.35294117647058826;
  return color;
}

void main(){
  vec2 uv = gl_FragCoord.xy/resolution.xy;
  frag_color=blur5(image,uv,resolution.xy,direction);
}
