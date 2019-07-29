import { NodeConstructor } from '../../Graph/Node';
import { AnimationLoop } from './AnimationLoop';
import { Counter } from './Counter';
import { GLCanvasSize } from './GLCanvasSize';
import { GLProgram } from './GLProgram';
import { GLRenderToMain } from './GLRenderToMain';
import { GLRenderToTexture } from './GLRenderToTexture';
import { GLTexture } from './GLTexture';
import { TriggerOnce } from './TriggerOnce';
import { OperatorType } from './types';

export const OperatorCreators: Record<OperatorType, NodeConstructor> = {
  [OperatorType.GL_CANVAS_SIZE]: GLCanvasSize,
  [OperatorType.GL_PROGRAM]: GLProgram,
  [OperatorType.GL_RENDER_TO_MAIN]: GLRenderToMain,
  [OperatorType.GL_RENDER_TO_TEXTURE]: GLRenderToTexture,
  [OperatorType.GL_TEXTURE]: GLTexture,
  [OperatorType.TRIGGER_ONCE]: TriggerOnce,
  [OperatorType.ANIMATION_LOOP]: AnimationLoop,
  [OperatorType.COUNTER]: Counter,
};
