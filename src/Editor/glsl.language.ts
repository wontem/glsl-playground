import * as monaco from 'monaco-editor';

export const language: monaco.languages.IMonarchLanguage = {
  tokenPostfix: '.glsl',
  defaultToken: 'invalid',

  brackets: [
    {
      open: '{',
      close: '}',
      token: 'delimiter.curly',
    },
    {
      open: '[',
      close: ']',
      token: 'delimiter.square',
    },
    {
      open: '(',
      close: ')',
      token: 'delimiter.parenthesis',
    },
    // {
    //   open: '<',
    //   close: '>',
    //   token: 'delimiter.angle',
    // },
  ],
  tokenizer: {
    root: [
      { include: '@literal' },
      { include: '@operator' },
      { include: '@whitespace' },
      [/[{}()\[\]]/, '@brackets'],
      [
        /^\s*#\s*(define|undef|if|ifdef|ifndef|else|elif|endif|error|pragma|extension|version|line)\b/,
        'keyword',
      ],
      [
        /\b(__LINE__|__FILE__|__VERSION__|GL_core_profile|GL_es_profile|GL_compatibility_profile)\b/,
        'predefined',
      ],
      [
        /\b(precision|highp|mediump|lowp)/,
        'keyword',
      ],
      [
        /\b(break|case|continue|default|discard|do|else|for|if|return|switch|while)\b/,
        'keyword',
      ],
      [
        /\b(void|bool|int|uint|float|double|vec[2|3|4]|dvec[2|3|4]|bvec[2|3|4]|ivec[2|3|4]|uvec[2|3|4]|mat[2|3|4]|mat2x2|mat2x3|mat2x4|mat3x2|mat3x3|mat3x4|mat4x2|mat4x3|mat4x4|dmat2|dmat3|dmat4|dmat2x2|dmat2x3|dmat2x4|dmat3x2|dmat3x3|dmat3x4|dmat4x2|dmat4x3|dmat4x4|sampler[1|2|3]D|image[1|2|3]D|samplerCube|imageCube|sampler2DRect|image2DRect|sampler[1|2]DArray|image[1|2]DArray|samplerBuffer|imageBuffer|sampler2DMS|image2DMS|sampler2DMSArray|image2DMSArray|samplerCubeArray|imageCubeArray|sampler[1|2]DShadow|sampler2DRectShadow|sampler[1|2]DArrayShadow|samplerCubeShadow|samplerCubeArrayShadow|isampler[1|2|3]D|iimage[1|2|3]D|isamplerCube|iimageCube|isampler2DRect|iimage2DRect|isampler[1|2]DArray|iimage[1|2]DArray|isamplerBuffer|iimageBuffer|isampler2DMS|iimage2DMS|isampler2DMSArray|iimage2DMSArray|isamplerCubeArray|iimageCubeArray|atomic_uint|usampler[1|2|3]D|uimage[1|2|3]D|usamplerCube|uimageCube|usampler2DRect|uimage2DRect|usampler[1|2]DArray|uimage[1|2]DArray|usamplerBuffer|uimageBuffer|usampler2DMS|uimage2DMS|usampler2DMSArray|uimage2DMSArray|usamplerCubeArray|uimageCubeArray|struct)\b/,
        'type',
      ],
      [
        /\b(layout|attribute|centroid|sampler|patch|const|flat|in|inout|invariant|noperspective|out|smooth|uniform|varying|buffer|shared|coherent|readonly|writeonly)\b/,
        'keyword',
      ],
      [
        /\b(gl_BackColor|gl_BackLightModelProduct|gl_BackLightProduct|gl_BackMaterial|gl_BackSecondaryColor|gl_ClipDistance|gl_ClipPlane|gl_ClipVertex|gl_Color|gl_DepthRange|gl_DepthRangeParameters|gl_EyePlaneQ|gl_EyePlaneR|gl_EyePlaneS|gl_EyePlaneT|gl_Fog|gl_FogCoord|gl_FogFragCoord|gl_FogParameters|gl_FragColor|gl_FragCoord|gl_FragData|gl_FragDepth|gl_FrontColor|gl_FrontFacing|gl_FrontLightModelProduct|gl_FrontLightProduct|gl_FrontMaterial|gl_FrontSecondaryColor|gl_InstanceID|gl_Layer|gl_LightModel|gl_LightModelParameters|gl_LightModelProducts|gl_LightProducts|gl_LightSource|gl_LightSourceParameters|gl_MaterialParameters|gl_ModelViewMatrix|gl_ModelViewMatrixInverse|gl_ModelViewMatrixInverseTranspose|gl_ModelViewMatrixTranspose|gl_ModelViewProjectionMatrix|gl_ModelViewProjectionMatrixInverse|gl_ModelViewProjectionMatrixInverseTranspose|gl_ModelViewProjectionMatrixTranspose|gl_MultiTexCoord[0-7]|gl_Normal|gl_NormalMatrix|gl_NormalScale|gl_ObjectPlaneQ|gl_ObjectPlaneR|gl_ObjectPlaneS|gl_ObjectPlaneT|gl_Point|gl_PointCoord|gl_PointParameters|gl_PointSize|gl_Position|gl_PrimitiveIDIn|gl_ProjectionMatrix|gl_ProjectionMatrixInverse|gl_ProjectionMatrixInverseTranspose|gl_ProjectionMatrixTranspose|gl_SecondaryColor|gl_TexCoord|gl_TextureEnvColor|gl_TextureMatrix|gl_TextureMatrixInverse|gl_TextureMatrixInverseTranspose|gl_TextureMatrixTranspose|gl_Vertex|gl_VertexID)\b/,
        'variable',
      ],
      [
        /\b(gl_MaxClipPlanes|gl_MaxCombinedTextureImageUnits|gl_MaxDrawBuffers|gl_MaxFragmentUniformComponents|gl_MaxLights|gl_MaxTextureCoords|gl_MaxTextureImageUnits|gl_MaxTextureUnits|gl_MaxVaryingFloats|gl_MaxVertexAttribs|gl_MaxVertexTextureImageUnits|gl_MaxVertexUniformComponents)\b/,
        'constant',
      ],
      [
        /\b(abs|acos|all|any|asin|atan|ceil|clamp|cos|cross|degrees|dFdx|dFdy|distance|dot|equal|exp|exp2|faceforward|floor|fract|ftransform|fwidth|greaterThan|greaterThanEqual|inversesqrt|length|lessThan|lessThanEqual|log|log2|matrixCompMult|max|min|mix|mod|noise[1-4]|normalize|not|notEqual|outerProduct|pow|radians|reflect|refract|shadow1D|shadow1DLod|shadow1DProj|shadow1DProjLod|shadow2D|shadow2DLod|shadow2DProj|shadow2DProjLod|sign|sin|smoothstep|sqrt|step|tan|texture1D|texture1DLod|texture1DProj|texture1DProjLod|texture2D|texture2DLod|texture2DProj|texture2DProjLod|texture3D|texture3DLod|texture3DProj|texture3DProjLod|textureCube|textureCubeLod|transpose)\b/,
        'identifier',
      ],
      [
        /[a-zA-Z_]\w*/,
        'identifier',
      ],
      [
        /[;,.]/,
        'delimiter',
      ],
    ],
    ['whitespace']: [
      [/[ \t\r\n]+/, ''],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
    ['comment']: [
      [/[^\/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],
    ['literal']: [
      { include: 'numeric-literal' },
    ],
    ['operator']: [
      { include: 'arithmetic-operator' },
      { include: 'increment-decrement-operator' },
      { include: 'bitwise-operator' },
      { include: 'comparative-operator' },
      { include: 'assignment-operator' },
      { include: 'logical-operator' },
      { include: 'ternary-operator' },
    ],
    ['numeric-literal']: [
      [
        /\b([0-9][0-9_]*)(\.([0-9][0-9_]*))?([eE][+/-]?([0-9][0-9_]*))?\b/,
        'number',
      ]
    ],
    ['arithmetic-operator']: [
      [
        /(?<![/=\-+!*%<>&|\^~.])(\+|\-|\*|\/|\%)(?![/=\-+!*%<>&|^~.])/,
        'operators',
      ]
    ],
    ['increment-decrement-operator']: [
      [
        /(?<![/=\-+!*%<>&|\^~.])(\+\+|\-\-)(?![/=\-+!*%<>&|^~.])/,
        'operators',
      ]
    ],
    ['bitwise-operator']: [
      [
        /(?<![/=\-+!*%<>&|\^~.])(~|&|\||\^|<<|>>)(?![/=\-+!*%<>&|^~.])/,
        'operators',
      ]
    ],
    ['assignment-operator']: [
      [
        /(?<![/=\-+!*%<>&|\^~.])(\+|\-|\*|\%|\/|<<|>>|&|\^|\|)?=(?![/=\-+!*%<>&|^~.])/,
        'operators',
      ]
    ],
    ['comparative-operator']: [
      [
        /(?<![/=\-+!*%<>&|\^~.])((=|!)=|(<|>)=?)(?![/=\-+!*%<>&|^~.])/,
        'operators',
      ]
    ],
    ['logical-operator']: [
      [
        /(?<![/=\-+!*%<>&|\^~.])(!|&&|\|\||\^\^)(?![/=\-+!*%<>&|^~.])/,
        'operators',
      ]
    ],
    ['ternary-operator']: [
      [
        /(\?|:)/,
        'operators',
      ]
    ],
  },
};
