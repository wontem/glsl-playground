import { OpAnimationLoop } from './operator/OpAnimationLoop';
import { OpAudioAnalyser } from './operator/OpAudioAnalyser';
import { OpGLCanvasSize } from './operator/OpGLCanvasSize';
import { OpGLProgram } from './operator/OpGLProgram';
import { OpGLRenderToMain } from './operator/OpGLRenderMain';
import { OpGLRenderToTexture } from './operator/OpGLRenderToTexture';
import { OpGLTexture } from './operator/OpGLTexture';
import { OpCounter, OpLogger } from './operator/OpLifeCycle';
import { OpSequence } from './operator/OpSequence';
import { OpTriggerOnce } from './operator/OpTriggerOnce';

export const OperatorsMap = new Map(
  [
    OpGLRenderToTexture,
    OpSequence,
    OpAudioAnalyser,
    OpGLCanvasSize,
    OpAnimationLoop,
    OpGLProgram,
    OpGLRenderToMain,
    OpCounter,
    OpGLTexture,
    OpTriggerOnce,
    OpLogger,
  ].map((Constructor) => {
    return [Constructor.name, Constructor];
  }),
);
