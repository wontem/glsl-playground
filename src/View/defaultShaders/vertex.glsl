#version 300 es
precision mediump float;

in vec2 a_position;
out vec2 v_texcoord;

void main() {
  gl_Position = vec4(a_position, 0., 1.);
  v_texcoord = (a_position + 1.) / 2.;
}
