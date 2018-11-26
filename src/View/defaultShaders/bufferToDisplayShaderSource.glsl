#version 300 es
precision mediump float;

in vec2 v_texcoord;
out vec4 frag_color;
uniform sampler2D u_channel;

void main() {
  frag_color = texture(u_channel, v_texcoord);
}
