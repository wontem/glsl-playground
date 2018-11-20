#version 300 es
#define PI 3.14159265359

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_image;

out vec4 frag_color;

const float mass = 100.;

//	Simplex 3D Noise
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

vec2 fromPolar(float phi, float r) {
  return vec2(
    cos(phi),
    sin(phi)
  ) * r;
}

float circle(vec2 coord, vec2 position, float radius, float step) {
    float dist = distance(position, coord);

    return smoothstep(.0, step, radius - dist);
}

mat3 rotate2D(float phi){
  return mat3(
    cos(phi), -sin(phi), 0.,
    sin(phi), cos(phi), 0.,
    0., 0., 1.
  );
}

mat3 scale2D(vec2 s){
  return mat3(
    s.x, 0., 0.,
    0., s.y, 0.,
    0., 0., 1.
  );
}

mat3 scale2D(float s){
  return scale2D(vec2(s));
}

mat3 translate2D(vec2 t){
  return mat3(
    1., 0., t.x,
    0., 1., t.y,
    0., 0., 1.
  );
}

mat3 translate2D(float t){
  return translate2D(vec2(t));
}

mat3 getMatrix(float angle) {
  return mat3(1.)
    // * translate2D(-u_resolution.xy / 2.)
    * rotate2D(angle)
    * scale2D(mass / u_resolution.y)
    // * scale2D(50. / u_mouse.y)
    // * translate2D(vec2(0, u_time))
  ;
}

vec3 splitSpace(vec3 pos, mat3 m) {
  mat3 mi = inverse(m);
  return floor(pos * m) * mi;
}

vec2 transform(vec2 pos, mat3 m) {
  //float n = snoise(vec3(pos.xy / 1000., 0.));
  float n = snoise(vec3(pos.xy / 1000., u_time/10.));
  vec2 delta = fromPolar(n * PI, 100.);

  vec3 p1 = splitSpace(vec3(pos.xy, 1.), translate2D(delta) * m);
  vec3 p2 = splitSpace(p1, m);
  //p2 = p2 + vec3(delta, 0.);

  return p2.xy;
}

float getColor(vec2 pos, float angle, vec3 colorSelector) {
  mat3 m = getMatrix(angle);
  vec2 newPos = transform(pos, m);

  //newPos = newPos / u_texture_0Resolution / (u_resolution.x / u_texture_0Resolution.x);;
  newPos /= u_resolution;

  vec3 color = texture(u_image, newPos).rgb;
  // vec3 color = vec3((sin(u_time) + 1.) / 2., newPos);

  float v = length(colorSelector * color);

  return v;
  // return circle(fract(vec3(pos, 1.) * m).xy, vec2(.5), v / 2., mass / u_resolution.y);
}

void main() {
  // vec3 cs = vec3(0., 0., 1.);
  // frag_color = vec4(1. - cs, getColor(gl_FragCoord.xy, PI / 3. * 2., cs));

  vec3 c = vec3(
    getColor(gl_FragCoord.xy, 0., vec3(1., 0., 0.)),
    getColor(gl_FragCoord.xy, PI / 3., vec3(0., 1., 0.)),
    getColor(gl_FragCoord.xy, PI / 3. * 2., vec3(0., 0., 1.))
  );
  frag_color = vec4(c, 1.);
}
