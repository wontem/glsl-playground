import { OpAnimationLoop } from './operator/OpAnimationLoop';
import { OpGLCanvasSize } from './operator/OpGLCanvasSize';
import { OpGLProgram } from './operator/OpGLProgram';
import { OpGLRenderToMain } from './operator/OpGLRenderMain';
import { OpGLRenderToTexture } from './operator/OpGLRenderToTexture';
import { OpGLTexture } from './operator/OpGLTexture';
import { OpCounter, OpLogger } from './operator/OpLifeCycle';
import { OpTriggerOnce } from './operator/OpTriggerOnce';

export const OperatorsMap = new Map(
  [
    OpGLCanvasSize,
    OpAnimationLoop,
    OpGLProgram,
    OpGLRenderToMain,
    OpCounter,
    OpGLTexture,
    OpTriggerOnce,
    OpLogger,
    OpGLRenderToTexture,
  ].map((Constructor) => {
    return [Constructor.name, Constructor];
  }),
);
